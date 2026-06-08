import type {
  ActivePilotProgram,
  PilotPricingTier,
  PilotProgramRecord,
  PilotProgramSignupInput,
  PilotProgramType,
} from '../types/pilotProgram';
import { recordToActivePilotProgram, readActivePilotProgram } from '../config/activePilotProgram';
import { maskAccessCode } from '../config/lastPilotProgram';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export type PilotProgramLookupResult = {
  role: 'facilitator' | 'family';
  program: ActivePilotProgram;
};

export function normalizePilotAccessCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

function resolveRoleFromCode(record: PilotProgramRecord, normalized: string): 'facilitator' | 'family' | null {
  const family = normalizePilotAccessCode(record.family_access_code);
  const facilitator = normalizePilotAccessCode(record.facilitator_access_code);
  const program = normalizePilotAccessCode(record.program_code);
  if (normalized === family) return 'family';
  if (normalized === facilitator || normalized === program) return 'facilitator';
  return null;
}

export async function lookupPilotProgramByAccessCode(
  rawCode: string,
): Promise<PilotProgramLookupResult | null> {
  const normalized = normalizePilotAccessCode(rawCode);
  if (!normalized) return null;

  const local = readActivePilotProgram();
  if (local) {
    const localRole =
      normalized === normalizePilotAccessCode(local.familyAccessCode)
        ? 'family'
        : normalized === normalizePilotAccessCode(local.facilitatorAccessCode) ||
            normalized === normalizePilotAccessCode(local.programCode)
          ? 'facilitator'
          : null;
    if (localRole) {
      return { role: localRole, program: local };
    }
  }

  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('pilot_programs')
      .select('*')
      .or(
        `family_access_code.eq.${normalized},facilitator_access_code.eq.${normalized},program_code.eq.${normalized}`,
      )
      .eq('pilot_status', 'active')
      .limit(5);

    if (error || !data?.length) {
      return null;
    }

    for (const row of data as PilotProgramRecord[]) {
      const role = resolveRoleFromCode(row, normalized);
      if (role) {
        return { role, program: recordToActivePilotProgram(row) };
      }
    }
  } catch (err) {
    console.warn('[pilot_programs] lookup error:', err);
  }

  return null;
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

    return {
      program_name: program.programName,
      masked_facilitator_code: maskAccessCode(program.facilitatorAccessCode),
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

const PROGRAM_TYPE_PREFIX: Record<PilotProgramType, string> = {
  'Camp / Youth Program': 'CAMP',
  'Teacher / Classroom': 'TEACHER',
  'After-School Program': 'AFTERSCHOOL',
  School: 'SCHOOL',
  District: 'DISTRICT',
  'Homeschool Group': 'HOMESCHOOL',
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
    default:
      return 'camp_pilot';
  }
}

function slugifyProgramName(name: string, programType: PilotProgramType): string {
  let base = name.trim();
  if (programType === 'Camp / Youth Program' || programType === 'After-School Program') {
    base = base.replace(/\bcamp\b/gi, '').replace(/\bprogram\b/gi, '').trim();
  }
  const slug = base.toUpperCase().replace(/[^A-Z0-9]+/g, '');
  return slug || 'PROGRAM';
}

export function generateProgramCodes(
  programType: PilotProgramType,
  programName: string,
  year = new Date().getFullYear(),
): {
  program_code: string;
  family_access_code: string;
  facilitator_access_code: string;
} {
  const prefix = PROGRAM_TYPE_PREFIX[programType];
  const slug = slugifyProgramName(programName, programType);
  const program_code = `${prefix}-${slug}-${year}`;
  return {
    program_code,
    family_access_code: `${program_code}-FAMILY`,
    facilitator_access_code: `${program_code}-FACILITATOR`,
  };
}

function buildProgramRecord(input: PilotProgramSignupInput): PilotProgramRecord {
  const codes = generateProgramCodes(input.programType, input.programName);
  const agreedAt = new Date().toISOString();

  return {
    program_name: input.programName.trim(),
    program_code: codes.program_code,
    program_type: input.programType,
    admin_first_name: input.adminFirstName.trim(),
    admin_email: input.adminEmail.trim(),
    estimated_students: input.estimatedStudents,
    age_range: input.ageRange,
    group_name: input.groupName.trim(),
    family_access_code: codes.family_access_code,
    facilitator_access_code: codes.facilitator_access_code,
    pricing_tier: resolvePricingTier(input.programType),
    payment_status: 'pending',
    pilot_status: 'active',
    agreed_to_terms: input.agreedToTerms,
    agreed_at: agreedAt,
  };
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
    const { data, error } = await supabase
      .from('pilot_programs')
      .insert(record)
      .select('*')
      .single();

    if (error) {
      console.warn('[pilot_programs] insert failed:', error.message);
      if (error.code === '23505') {
        return {
          success: false,
          message:
            'A program with a similar name already exists. Try a slightly different program name.',
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
      message: 'Could not save your pilot signup right now. Please try again in a moment.',
    };
  }
}
