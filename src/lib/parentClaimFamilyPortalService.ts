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
import { clearActiveChild } from './activeChildContext';
import { clearStalePortalIdentityState } from './portalIdentityReset';
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
import { INDEPENDENT_FAMILY_STUDENT_COUNT_RANGE } from '../types/pilotProgram';
import { mapAgeGradeBandToLegacyAgeRange } from './pilotProgramAgeGrade';
import { resolveDefaultPilotFeatureFlags } from './pilotProgramFeatureFlags';
import { resolvePilotPortalPrep } from './pilotProgramPortalPrep';
import { createCampParentProgram } from './pilotSignupApi';

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

  const portalPrep = resolvePilotPortalPrep(INDEPENDENT_FAMILY_PROGRAM_TYPE);

  const payload: Omit<PilotProgramRecord, 'id' | 'created_at'> = {
    program_name: programName,
    program_code: familyProgramCode,
    program_type: INDEPENDENT_FAMILY_DB_TYPE,
    admin_first_name: input.parentFirstName?.trim() || input.parentLastName.trim(),
    admin_email: input.parentEmail.trim(),
    estimated_students: 1,
    estimated_student_count_range: INDEPENDENT_FAMILY_STUDENT_COUNT_RANGE,
    account_context: portalPrep.account_context,
    portal_type: portalPrep.portal_type,
    age_grade_band: 'Mixed Ages',
    age_grade_notes: null,
    feature_flags: resolveDefaultPilotFeatureFlags({
      portalType: portalPrep.portal_type,
      programType: INDEPENDENT_FAMILY_PROGRAM_TYPE,
    }),
    age_range: mapAgeGradeBandToLegacyAgeRange('Mixed Ages'),
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
    const result = await withTimeout(
      createCampParentProgram({
        record: payload,
        requestedProgramCode: familyProgramCode,
        requestId: `camp-parent-program:${familyProgramCode}`,
      }),
      DASHBOARD_FETCH_TIMEOUT_MS,
      'family_program_parent_claim',
    );
    if (result.success && result.program) {
      return recordToActivePilotProgram(result.program);
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
  parentFirstName?: string;
  parentPhone?: string;
  parentLastName?: string;
  campProgramCode?: string;
}): void {
  const existing = readActivePilotProgram();
  if (
    existing?.programCode?.trim() &&
    existing.programCode.trim() !== input.familyProgram.programCode.trim()
  ) {
    clearStalePortalIdentityState('family_claim_program_switch');
  }
  clearActiveChild();

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
    firstName: input.parentFirstName,
    phone: input.parentPhone,
    lastName: input.parentLastName,
    confirmed: true,
    programCode: input.familyProgram.programCode,
    campProgramCode: input.campProgramCode?.trim() || undefined,
    accessCode: input.accessCode.trim(),
  });
}

export function readClaimedFamilyProgram(): ActivePilotProgram | null {
  return readActivePilotProgram();
}
