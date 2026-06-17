import type {
  ActivePilotProgram,
  PilotPricingTier,
  PilotProgramRecord,
  PilotProgramSignupInput,
  PilotProgramType,
} from '../types/pilotProgram';
import { recordToActivePilotProgram } from '../config/activePilotProgram';
import { maskAccessCode } from '../config/lastPilotProgram';
import {
  INDEPENDENT_FAMILY_PRICING_TIER,
  INDEPENDENT_FAMILY_PROGRAM_TYPE,
  hasFacilitatorAccessCode,
  isIndependentFamilyType,
  resolveIndependentFamilyProgramName,
  toDbProgramType,
} from './independentFamilyProgram';
import { mapAgeGradeBandToLegacyAgeRange } from './pilotProgramAgeGrade';
import { resolveDefaultPilotFeatureFlags } from './pilotProgramFeatureFlags';
import { deriveEstimatedStudentsFromRange } from './pilotProgramStudentRange';
import { resolvePilotPortalPrep } from './pilotProgramPortalPrep';
import { normalizeAccessCodeInput } from './portalAccessCodes';
import { logProgramCodeLookup } from './portalDebug';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export type PilotProgramLookupResult = {
  role: 'facilitator' | 'family';
  program: ActivePilotProgram;
};

export function normalizePilotAccessCode(raw: string): string {
  return normalizeAccessCodeInput(raw);
}

function quotePostgrestValue(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function resolveRoleFromCode(record: PilotProgramRecord, normalized: string): 'facilitator' | 'family' | null {
  const family = normalizePilotAccessCode(record.family_access_code);
  const program = normalizePilotAccessCode(record.program_code);

  if (isIndependentFamilyType(record.program_type)) {
    if (normalized === family || normalized === program) return 'family';
    return null;
  }

  const facilitator = hasFacilitatorAccessCode(record.facilitator_access_code)
    ? normalizePilotAccessCode(record.facilitator_access_code!)
    : '';
  if (normalized === family) return 'family';
  if ((facilitator && normalized === facilitator) || normalized === program) return 'facilitator';
  return null;
}

export type PilotProgramLookupStatus = 'found' | 'not_found' | 'unavailable' | 'error';

export type PilotProgramLookupResponse = {
  status: PilotProgramLookupStatus;
  result: PilotProgramLookupResult | null;
};

export async function lookupPilotProgramByAccessCode(
  rawCode: string,
): Promise<PilotProgramLookupResult | null> {
  const response = await lookupPilotProgramByAccessCodeDetailed(rawCode);
  return response.result;
}

/** Supabase-only lookup — never falls back to browser-stored programs. */
export async function lookupPilotProgramByAccessCodeDetailed(
  rawCode: string,
): Promise<PilotProgramLookupResponse> {
  const normalized = normalizePilotAccessCode(rawCode);
  if (!normalized) return { status: 'not_found', result: null };

  if (!isSupabaseConfigured() || !supabase) {
    return { status: 'unavailable', result: null };
  }

  const quoted = quotePostgrestValue(normalized);

  try {
    const { data, error } = await supabase
      .from('pilot_programs')
      .select('*')
      .or(
        `family_access_code.eq.${quoted},facilitator_access_code.eq.${quoted},program_code.eq.${quoted}`,
      )
      .eq('pilot_status', 'active')
      .limit(5);

    if (error) {
      const response = { status: 'error' as const, result: null };
      logProgramCodeLookup(rawCode, response);
      return response;
    }

    if (!data?.length) {
      const response = { status: 'not_found' as const, result: null };
      logProgramCodeLookup(rawCode, response);
      return response;
    }

    for (const row of data as PilotProgramRecord[]) {
      const role = resolveRoleFromCode(row, normalized);
      if (role) {
        const response = {
          status: 'found' as const,
          result: { role, program: recordToActivePilotProgram(row) },
        };
        logProgramCodeLookup(rawCode, response);
        return response;
      }
    }
  } catch (err) {
    console.warn('[pilot_programs] lookup error:', err);
    const response = { status: 'error' as const, result: null };
    logProgramCodeLookup(rawCode, response);
    return response;
  }

  const response = { status: 'not_found' as const, result: null };
  logProgramCodeLookup(rawCode, response);
  return response;
}

export type PilotProgramRecoveryResult = {
  program_name: string;
  masked_facilitator_code: string;
  masked_family_code: string;
  program: ActivePilotProgram;
};

/** Lookup by admin email + partial program name for code recovery. */
export async function lookupPilotProgramByAdmin(
  programName: string,
  adminEmail: string,
): Promise<PilotProgramRecoveryResult | null> {
  const email = adminEmail.trim().toLowerCase();
  const nameQuery = programName.trim();
  if (!email || !nameQuery) return null;

  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('pilot_programs')
      .select('*')
      .eq('admin_email', email)
      .eq('pilot_status', 'active');

    if (error || !data?.length) {
      return null;
    }

    const normalizedQuery = nameQuery.toLowerCase();
    const match = (data as PilotProgramRecord[]).find((row) =>
      row.program_name.toLowerCase().includes(normalizedQuery),
    );

    if (!match) return null;

    const program = recordToActivePilotProgram(match);

    const isIndependentFamily = isIndependentFamilyType(match.program_type);

    return {
      program_name: program.programName,
      masked_facilitator_code:
        isIndependentFamily || !hasFacilitatorAccessCode(program.facilitatorAccessCode)
          ? ''
          : maskAccessCode(program.facilitatorAccessCode!),
      masked_family_code: maskAccessCode(program.familyAccessCode),
      program,
    };
  } catch (err) {
    console.warn('[pilot_programs] admin lookup error:', err);
    return null;
  }
}

export type PilotProgramSignupResult =
  | { success: true; program: ActivePilotProgram }
  | { success: false; message: string };

const PILOT_SIGNUP_TIMEOUT_MS = 15000;

const PROGRAM_TYPE_PREFIX: Record<PilotProgramType, string> = {
  'Camp / Youth Program': 'CAMP',
  'Teacher / Classroom': 'TEACHER',
  'After-School Program': 'AFTERSCHOOL',
  School: 'SCHOOL',
  District: 'DISTRICT',
  'Homeschool Group': 'HOMESCHOOL',
  'Independent Family': 'FAMILY',
};

function resolvePricingTier(programType: PilotProgramType): PilotPricingTier {
  switch (programType) {
    case 'Camp / Youth Program':
    case 'After-School Program':
      return 'camp_pilot';
    case 'Teacher / Classroom':
      return 'teacher';
    case 'School':
      return 'school';
    case 'District':
      return 'district';
    case 'Homeschool Group':
      return 'family_group';
    case 'Independent Family':
      return INDEPENDENT_FAMILY_PRICING_TIER;
    default:
      return 'camp_pilot';
  }
}

function slugifyProgramName(name: string, programType: PilotProgramType): string {
  let base = name.trim();
  if (programType === 'Camp / Youth Program' || programType === 'After-School Program') {
    base = base.replace(/\bcamp\b/gi, '').replace(/\bprogram\b/gi, '').trim();
  }
  if (programType === 'Independent Family') {
    base = base.replace(/\bfamily\b/gi, '').trim();
  }
  const slug = base.toUpperCase().replace(/[^A-Z0-9]+/g, '');
  if (programType === 'Independent Family') {
    return slug || 'HOME';
  }
  return slug || 'PROGRAM';
}

export function generateProgramCodes(
  programType: PilotProgramType,
  programName: string,
  year = new Date().getFullYear(),
): {
  program_code: string;
  family_access_code: string;
  facilitator_access_code: string | null;
} {
  const prefix = PROGRAM_TYPE_PREFIX[programType];
  const slug = slugifyProgramName(programName, programType);
  const program_code = `${prefix}-${slug}-${year}`;

  if (programType === INDEPENDENT_FAMILY_PROGRAM_TYPE) {
    return {
      program_code,
      family_access_code: `${program_code}-FAMILY`,
      facilitator_access_code: null,
    };
  }

  return {
    program_code,
    family_access_code: `${program_code}-FAMILY`,
    facilitator_access_code: `${program_code}-FACILITATOR`,
  };
}

function buildProgramRecord(input: PilotProgramSignupInput): PilotProgramRecord {
  const isIndependentFamily = input.programType === INDEPENDENT_FAMILY_PROGRAM_TYPE;
  const resolvedProgramName = isIndependentFamily
    ? resolveIndependentFamilyProgramName(input.programName, input.adminFirstName)
    : input.programName.trim();
  const codes = generateProgramCodes(input.programType, resolvedProgramName);
  const agreedAt = new Date().toISOString();
  const studentCountRange = isIndependentFamily
    ? input.estimatedStudentCountRange ?? '1 child'
    : input.estimatedStudentCountRange;
  const portalPrep = resolvePilotPortalPrep(input.programType);
  const legacyAgeRange = mapAgeGradeBandToLegacyAgeRange(input.ageGradeBand);
  const ageGradeNotes = input.ageGradeNotes.trim() || null;
  const estimatedStudents =
    studentCountRange != null
      ? input.estimatedStudents ?? deriveEstimatedStudentsFromRange(studentCountRange)
      : isIndependentFamily
        ? 1
        : input.estimatedStudents ?? 0;

  return {
    program_name: resolvedProgramName,
    program_code: codes.program_code,
    program_type: toDbProgramType(input.programType) as PilotProgramRecord['program_type'],
    admin_first_name: input.adminFirstName.trim(),
    admin_email: input.adminEmail.trim(),
    estimated_students: estimatedStudents,
    estimated_student_count_range: studentCountRange,
    account_context: portalPrep.account_context,
    portal_type: portalPrep.portal_type,
    age_grade_band: input.ageGradeBand,
    age_grade_notes: ageGradeNotes,
    feature_flags: resolveDefaultPilotFeatureFlags({
      portalType: portalPrep.portal_type,
      programType: input.programType,
    }),
    age_range: legacyAgeRange,
    group_name: isIndependentFamily
      ? input.groupName.trim() || resolvedProgramName
      : input.groupName.trim(),
    family_access_code: codes.family_access_code,
    facilitator_access_code: codes.facilitator_access_code,
    pricing_tier: resolvePricingTier(input.programType),
    payment_status: 'pending',
    pilot_status: 'active',
    agreed_to_terms: input.agreedToTerms,
    agreed_at: agreedAt,
  };
}

function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = globalThis.setTimeout(() => reject(new Error(message)), timeoutMs);
    Promise.resolve(promise)
      .then(resolve)
      .catch(reject)
      .finally(() => globalThis.clearTimeout(timeout));
  });
}

export type AdminPilotProgramsLoad = {
  programs: PilotProgramRecord[];
  error?: string;
};

/** Admin-only listing — Supabase only, no local/demo fallback. */
export async function fetchAllPilotProgramsForAdmin(): Promise<AdminPilotProgramsLoad> {
  if (!isSupabaseConfigured() || !supabase) {
    return { programs: [], error: 'Supabase is not configured. Admin pilot data is unavailable.' };
  }

  try {
    const { data, error } = await supabase
      .from('pilot_programs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[pilot_programs] admin list failed:', error.message);
      return {
        programs: [],
        error: 'Could not load pilot programs from Supabase. Check connection and RLS policies.',
      };
    }

    return { programs: (data ?? []) as PilotProgramRecord[] };
  } catch (err) {
    console.warn('[pilot_programs] admin list error:', err);
    return {
      programs: [],
      error: 'Could not load pilot programs from Supabase. Check connection and RLS policies.',
    };
  }
}

export async function submitPilotProgramSignup(
  input: PilotProgramSignupInput,
): Promise<PilotProgramSignupResult> {
  if (!input.agreedToTerms) {
    return { success: false, message: 'Please agree to the Pilot License Terms to continue.' };
  }

  const record = buildProgramRecord(input);

  if (!isSupabaseConfigured() || !supabase) {
    const program = recordToActivePilotProgram(record);
    // TODO: Email facilitator_access_code and family_access_code after signup when email service is connected.
    return {
      success: true,
      program,
    };
  }

  try {
    const { data, error } = await withTimeout<{
      data: PilotProgramRecord | null;
      error: { code?: string; message: string } | null;
    }>(
      supabase.from('pilot_programs').insert(record).select('*').single(),
      PILOT_SIGNUP_TIMEOUT_MS,
      'Pilot signup request timed out.',
    );

    if (error) {
      console.warn('[pilot_programs] insert failed:', error.message);
      if (error.code === '23505') {
        return {
          success: false,
          message:
            'A program with this internal code already exists. Try again or contact support.',
        };
      }
      return {
        success: false,
        message: 'Could not save your pilot signup right now. Please try again in a moment.',
      };
    }

    const saved = data as PilotProgramRecord;
    // TODO: Email facilitator_access_code and family_access_code after signup via Supabase Edge Function or external email service.
    return {
      success: true,
      program: recordToActivePilotProgram({ ...record, id: saved.id }),
    };
  } catch (err) {
    console.warn('[pilot_programs] insert error:', err);
    return {
      success: false,
      message: 'Creating your program is taking too long. Please refresh and try again.',
    };
  }
}
