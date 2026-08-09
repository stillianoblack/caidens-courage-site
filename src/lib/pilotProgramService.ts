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
import {
  generateStablePilotCodeToken,
  normalizeAccessCodeForIdentity,
} from './portalCodeIdentity';
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

type ProgramCodeAliasLookup = {
  programCode: string;
  role: 'facilitator' | 'family';
};

function resolveRoleFromAliasType(aliasType?: string | null): 'facilitator' | 'family' {
  const normalized = aliasType?.trim().toLowerCase() ?? '';
  if (normalized.includes('family')) return 'family';
  return 'facilitator';
}

async function lookupCanonicalProgramCodeByAlias(normalizedAlias: string): Promise<ProgramCodeAliasLookup | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('program_code_aliases')
      .select('program_code, alias_type')
      .eq('alias_code', normalizedAlias)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as { program_code?: string; alias_type?: string | null };
    const programCode = String(row.program_code || '').trim();
    if (!programCode) return null;
    return { programCode, role: resolveRoleFromAliasType(row.alias_type) };
  } catch {
    return null;
  }
}

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
      const aliasLookup = await lookupCanonicalProgramCodeByAlias(normalized);
      if (aliasLookup && aliasLookup.programCode !== normalized) {
        const { data: aliasData, error: aliasError } = await supabase
          .from('pilot_programs')
          .select('*')
          .eq('program_code', aliasLookup.programCode)
          .eq('pilot_status', 'active')
          .limit(1);
        const aliasRow = (aliasData ?? [])[0] as PilotProgramRecord | undefined;
        if (!aliasError && aliasRow) {
          const response = {
            status: 'found' as const,
            result: { role: aliasLookup.role, program: recordToActivePilotProgram(aliasRow) },
          };
          logProgramCodeLookup(rawCode, response);
          return response;
        }
      }

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
  | {
      success: true;
      program: ActivePilotProgram;
      participantId?: string;
      redirectDestination?: string;
      reused?: boolean;
    }
  | {
      success: false;
      code:
        | 'validation_error'
        | 'configuration_error'
        | 'timeout'
        | 'duplicate'
        | 'server_error';
      message: string;
      supportCode?: string;
    };

const PILOT_SIGNUP_TIMEOUT_MS = 15000;
export const UNCERTAIN_FAMILY_SIGNUP_MESSAGE =
  'We could not confirm whether your family access was created. Please do not submit again yet.';

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

async function accessCodeExists(code: string): Promise<boolean> {
  const normalized = normalizeAccessCodeForIdentity(code);
  if (!normalized || !isSupabaseConfigured() || !supabase) return false;

  const quoted = quotePostgrestValue(normalized);
  const [programLookup, aliasLookup] = await Promise.all([
    supabase
      .from('pilot_programs')
      .select('id')
      .or(
        `program_code.eq.${quoted},family_access_code.eq.${quoted},facilitator_access_code.eq.${quoted}`,
      )
      .limit(1),
    supabase
      .from('program_code_aliases')
      .select('id')
      .eq('alias_code', normalized)
      .limit(1),
  ]);

  if (programLookup.error) {
    console.warn('[pilot_programs] uniqueness check failed:', programLookup.error.message);
    return true;
  }

  if (aliasLookup.error && !/relation|does not exist/i.test(aliasLookup.error.message)) {
    console.warn('[pilot_programs] alias uniqueness check failed:', aliasLookup.error.message);
    return true;
  }

  return Boolean(programLookup.data?.length || aliasLookup.data?.length);
}

async function generateUniquePilotProgramCodes(
  programType: PilotProgramType,
  programName: string,
  year = new Date().getFullYear(),
): Promise<{
  program_code: string;
  family_access_code: string;
  facilitator_access_code: string | null;
}> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const codes = generateProgramCodes(programType, programName, year);
    const candidates = [
      codes.program_code,
      codes.family_access_code,
      codes.facilitator_access_code,
    ].filter((value): value is string => Boolean(value?.trim()));
    const collisionChecks = await Promise.all(candidates.map(accessCodeExists));
    if (!collisionChecks.some(Boolean)) {
      return codes;
    }
  }
  throw new Error('access_code_collision');
}

export function generateProgramCodes(
  _programType: PilotProgramType,
  _programName: string,
  _year = new Date().getFullYear(),
): {
  program_code: string;
  family_access_code: string;
  facilitator_access_code: string | null;
} {
  const token = generateStablePilotCodeToken();

  return {
    program_code: `CMP-${token}`,
    family_access_code: `FAM-${token}`,
    facilitator_access_code: `FAC-${token}`,
  };
}

function buildProgramRecord(
  input: PilotProgramSignupInput,
  codes: ReturnType<typeof generateProgramCodes>,
): PilotProgramRecord {
  const isIndependentFamily = input.programType === INDEPENDENT_FAMILY_PROGRAM_TYPE;
  const resolvedProgramName = isIndependentFamily
    ? resolveIndependentFamilyProgramName(input.programName, input.adminFirstName)
    : input.programName.trim();
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
  options: { requestId?: string } = {},
): Promise<PilotProgramSignupResult> {
  if (!input.agreedToTerms) {
    return {
      success: false,
      code: 'validation_error',
      message: 'Please agree to the Pilot License Terms to continue.',
    };
  }

  const isIndependentFamily = input.programType === INDEPENDENT_FAMILY_PROGRAM_TYPE;
  if (isIndependentFamily && !input.childFirstName?.trim()) {
    return {
      success: false,
      code: 'validation_error',
      message: 'Enter your child’s first name to create family access.',
    };
  }
  const resolvedProgramName = isIndependentFamily
    ? resolveIndependentFamilyProgramName(input.programName, input.adminFirstName)
    : input.programName.trim();
  const codes = generateProgramCodes(input.programType, resolvedProgramName);
  const record = buildProgramRecord(input, codes);

  if (isIndependentFamily) {
    const controller = new AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), PILOT_SIGNUP_TIMEOUT_MS);
    const approvedRecord: Partial<PilotProgramRecord> = { ...record };
    delete approvedRecord.program_code;
    delete approvedRecord.family_access_code;
    delete approvedRecord.facilitator_access_code;
    try {
      const requestStartedAt = Date.now();
      const response = await fetch('/.netlify/functions/pilot-family-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': options.requestId?.trim() || generateStablePilotCodeToken(),
        },
        body: JSON.stringify({ record: approvedRecord, childFirstName: input.childFirstName?.trim() }),
        signal: controller.signal,
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            success?: boolean;
            code?: PilotProgramSignupResult extends { success: false; code: infer C } ? C : never;
            message?: string;
            program?: PilotProgramRecord;
            participantId?: string;
            redirectDestination?: string;
            reused?: boolean;
            correlationId?: string;
            supportCode?: string;
          }
        | null;
      if (process.env.NODE_ENV === 'development') {
        console.info('[PILOT_SIGNUP_HTTP]', JSON.stringify({
          requestUrl: '/.netlify/functions/pilot-family-signup',
          method: 'POST',
          status: response.status,
          durationMs: Date.now() - requestStartedAt,
          success: Boolean(payload?.success),
          code: payload?.code || null,
          correlationId: payload?.correlationId || null,
          supportCode: payload?.supportCode || null,
        }));
      }
      if (!response.ok || !payload?.success || !payload.program) {
        return {
          success: false,
          code: payload?.code || (response.status === 409 ? 'duplicate' : 'server_error'),
          message:
            response.status === 504 || payload?.code === 'timeout'
              ? UNCERTAIN_FAMILY_SIGNUP_MESSAGE
              : payload?.message || 'Could not save your family signup right now. Please try again.',
          supportCode: payload?.supportCode,
        };
      }
      return {
        success: true,
        program: recordToActivePilotProgram(payload.program),
        participantId: payload.participantId,
        redirectDestination: payload.redirectDestination || '/family-hub',
        reused: Boolean(payload.reused),
      };
    } catch (err) {
      const uncertain = err instanceof DOMException && err.name === 'AbortError';
      return {
        success: false,
        code: uncertain ? 'timeout' : 'server_error',
        message: uncertain
          ? UNCERTAIN_FAMILY_SIGNUP_MESSAGE
          : 'Could not create family access right now. Please try again.',
      };
    } finally {
      globalThis.clearTimeout(timeout);
    }
  }

  if (!isSupabaseConfigured() || !supabase) {
    const program = recordToActivePilotProgram(record);
    // TODO: Email facilitator_access_code and family_access_code after signup when email service is connected.
    return {
      success: true,
      program,
      redirectDestination: isIndependentFamily ? '/family-hub' : '/program-dashboard?welcome=1',
    };
  }

  let uniqueRecord = record;
  try {
    const uniqueCodes = await withTimeout(
      generateUniquePilotProgramCodes(input.programType, resolvedProgramName),
      PILOT_SIGNUP_TIMEOUT_MS,
      'Pilot signup preflight timed out.',
    );
    uniqueRecord = buildProgramRecord(input, uniqueCodes);
  } catch {
    return {
      success: false,
      code: 'timeout',
      message: 'Creating your program is taking too long. Please refresh and try again.',
    };
  }

  try {
    const { data, error } = await withTimeout<{
      data: PilotProgramRecord | null;
      error: { code?: string; message: string } | null;
    }>(
      supabase.from('pilot_programs').insert(uniqueRecord).select('*').single(),
      PILOT_SIGNUP_TIMEOUT_MS,
      'Pilot signup request timed out.',
    );

    if (error) {
      console.warn('[pilot_programs] insert failed:', error.message);
      if (error.code === '23505') {
        return {
          success: false,
          code: 'duplicate',
          message:
            'A program with this internal code already exists. Try again or contact support.',
        };
      }
      return {
        success: false,
        code: 'server_error',
        message: 'Could not save your pilot signup right now. Please try again in a moment.',
      };
    }

    const saved = data as PilotProgramRecord;
    // TODO: Email facilitator_access_code and family_access_code after signup via Supabase Edge Function or external email service.
    return {
      success: true,
      program: recordToActivePilotProgram({ ...uniqueRecord, id: saved.id }),
      redirectDestination: '/program-dashboard?welcome=1',
    };
  } catch (err) {
    console.warn('[pilot_programs] insert error:', err);
    return {
      success: false,
      code: 'timeout',
      message: 'Creating your program is taking too long. Please refresh and try again.',
    };
  }
}
