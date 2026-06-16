import {
  readActivePilotProgram,
  recordToActivePilotProgram,
  writeActivePilotProgram,
} from '../config/activePilotProgram';
import {
  writeActiveAccessCode,
  writeActiveFamilyContext,
  writeActivePortalRole,
} from '../config/portalContext';
import { writeFamilyPortalSession } from '../config/familyPortalAccess';
import { writeLastPilotProgram } from '../config/lastPilotProgram';
import { writeParentClaimContext } from '../config/parentClaimContext';
import { syncPortalProgramContext } from './activeProgramContext';
import { DASHBOARD_FETCH_TIMEOUT_MS, withTimeout } from './fetchWithTimeout';
import {
  INDEPENDENT_FAMILY_DB_TYPE,
  INDEPENDENT_FAMILY_PRICING_TIER,
  INDEPENDENT_FAMILY_PROGRAM_TYPE,
  resolveIndependentFamilyProgramName,
} from './independentFamilyProgram';
import { suggestFamilyProgramCode } from './studentFamilyLinkService';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import type { ActivePilotProgram, PilotProgramRecord } from '../types/pilotProgram';

async function fetchPilotProgramByCode(programCode: string): Promise<ActivePilotProgram | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await withTimeout(
      supabase.from('pilot_programs').select('*').eq('program_code', programCode.trim()).limit(1),
      DASHBOARD_FETCH_TIMEOUT_MS,
      'pilot_program_by_code_claim',
    );
    if (error || !data?.length) return null;
    return recordToActivePilotProgram(data[0] as PilotProgramRecord);
  } catch {
    return null;
  }
}

export async function createOrResolveFamilyProgramForParent(input: {
  parentEmail: string;
  parentLastName: string;
  parentFirstName?: string;
  campProgram?: ActivePilotProgram;
  existingFamilyProgramCode?: string | null;
}): Promise<ActivePilotProgram | null> {
  const familyProgramCode =
    input.existingFamilyProgramCode?.trim() ||
    suggestFamilyProgramCode({ parentLastName: input.parentLastName });

  const existing = await fetchPilotProgramByCode(familyProgramCode);
  if (existing) return existing;

  if (!isSupabaseConfigured() || !supabase) {
    const programName = resolveIndependentFamilyProgramName(
      `${input.parentLastName.trim()} Family`,
      input.parentFirstName?.trim() || input.parentLastName.trim(),
    );
    return {
      programName,
      programCode: familyProgramCode,
      programType: INDEPENDENT_FAMILY_PROGRAM_TYPE,
      adminFirstName: input.parentFirstName?.trim() || input.parentLastName.trim(),
      adminEmail: input.parentEmail.trim(),
      estimatedStudents: 1,
      ageRange: 'Mixed Ages',
      groupName: programName,
      familyAccessCode: `${familyProgramCode}-FAMILY`,
      facilitatorAccessCode: null,
      pricingTier: INDEPENDENT_FAMILY_PRICING_TIER,
      paymentStatus: 'paid',
      pilotStatus: 'active',
      agreedAt: new Date().toISOString(),
    };
  }

  const programName = resolveIndependentFamilyProgramName(
    `${input.parentLastName.trim()} Family`,
    input.parentFirstName?.trim() || input.parentLastName.trim(),
  );

  const payload: Omit<PilotProgramRecord, 'id' | 'created_at'> = {
    program_name: programName,
    program_code: familyProgramCode,
    program_type: INDEPENDENT_FAMILY_DB_TYPE,
    admin_first_name: input.parentFirstName?.trim() || input.parentLastName.trim(),
    admin_email: input.parentEmail.trim(),
    estimated_students: 1,
    age_range: 'Mixed Ages',
    group_name: programName,
    family_access_code: `${familyProgramCode}-FAMILY`,
    facilitator_access_code: null,
    pricing_tier: INDEPENDENT_FAMILY_PRICING_TIER,
    payment_status: 'paid',
    pilot_status: 'active',
    agreed_to_terms: true,
    agreed_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await withTimeout(
      supabase.from('pilot_programs').insert(payload).select('*').single(),
      DASHBOARD_FETCH_TIMEOUT_MS,
      'family_program_parent_claim',
    );
    if (!error && data) {
      return recordToActivePilotProgram(data as PilotProgramRecord);
    }
    return (await fetchPilotProgramByCode(familyProgramCode)) ?? null;
  } catch {
    return (await fetchPilotProgramByCode(familyProgramCode)) ?? null;
  }
}

export function activatePrivateFamilyPortalFromClaim(input: {
  familyProgram: ActivePilotProgram;
  accessCode: string;
  parentEmail: string;
  parentPhone?: string;
  parentLastName?: string;
}): void {
  writeActiveFamilyContext({
    programCode: input.familyProgram.programCode,
    programName: input.familyProgram.programName,
    familyAccessCode: input.familyProgram.familyAccessCode,
    groupName: input.familyProgram.groupName,
    programType: input.familyProgram.programType,
  });
  writeActivePilotProgram(input.familyProgram);
  syncPortalProgramContext(input.familyProgram);
  writeActivePortalRole('family');
  writeActiveAccessCode(input.accessCode.trim());
  writeLastPilotProgram(
    input.familyProgram,
    'family',
    input.parentEmail,
    input.accessCode.trim(),
  );
  writeFamilyPortalSession();
  writeParentClaimContext({
    email: input.parentEmail,
    phone: input.parentPhone,
    lastName: input.parentLastName,
    confirmed: true,
  });
}

export function readClaimedFamilyProgram(): ActivePilotProgram | null {
  return readActivePilotProgram();
}
