import {
  readActivePilotProgram,
  recordToActivePilotProgram,
  writeActivePilotProgram,
} from '../config/activePilotProgram';
import {
  readActiveFamilyContext,
  writeActiveAccessCode,
  writeActiveFamilyContext,
  writeActivePortalRole,
} from '../config/portalContext';
import { writeActiveChildNickname } from '../config/activeChildNickname';
import {
  notifyChildProfileUpdated,
  writeActiveChildParticipantId,
} from '../config/activeChildParticipant';
import { writeFamilyPortalSession } from '../config/familyPortalAccess';
import { writeLastPilotProgram } from '../config/lastPilotProgram';
import { syncPortalProgramContext } from './activeProgramContext';
import {
  INDEPENDENT_FAMILY_DB_TYPE,
  INDEPENDENT_FAMILY_PRICING_TIER,
  INDEPENDENT_FAMILY_PROGRAM_TYPE,
  resolveIndependentFamilyProgramName,
} from './independentFamilyProgram';
import { DASHBOARD_FETCH_TIMEOUT_MS, withTimeout } from './fetchWithTimeout';
import {
  createStudentFamilyLink,
  fetchStudentFamilyLinksByFamilyProgram,
  suggestFamilyProgramCode,
} from './studentFamilyLinkService';
import {
  fetchStudentParticipantsFromSupabase,
  findOrCreateParticipant,
  type StudentParticipantRecord,
} from './pilotTrackingService';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import type { ActivePilotProgram, PilotProgramRecord } from '../types/pilotProgram';

export type ParentChildLinkFromCampInput = {
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  childFirstName: string;
  childNickname?: string;
  parentRole?: string;
  campProgram: ActivePilotProgram;
};

export type ParentChildLinkFromCampResult = {
  success: boolean;
  familyProgram?: ActivePilotProgram;
  studentId?: string;
  childDisplayName?: string;
  matchedCampChild: boolean;
  familyProgramCreated: boolean;
  linkCreated: boolean;
  message?: string;
};

function normalizeName(value?: string | null): string {
  return value?.trim().toLowerCase() ?? '';
}

function childDisplayName(firstName: string, nickname?: string): string {
  return nickname?.trim() || firstName.trim();
}

/** True when parent entered via a shared camp family code and still needs a private family program. */
export function shouldMigrateFromCampProgram(): boolean {
  const familyContext = readActiveFamilyContext();
  if (familyContext?.programCode?.trim().toUpperCase().startsWith('FAMILY-')) {
    return false;
  }

  const program = readActivePilotProgram();
  if (!program) return false;

  const code = program.programCode.trim().toUpperCase();
  if (code.startsWith('FAMILY-')) return false;

  return true;
}

export async function findMatchingCampChildParticipant(
  campProgramCode: string,
  childFirstName: string,
  childNickname?: string,
): Promise<StudentParticipantRecord | null> {
  const { participants } = await fetchStudentParticipantsFromSupabase(campProgramCode);
  const firstKey = normalizeName(childFirstName);
  const nickKey = normalizeName(childNickname) || firstKey;

  const match = participants.find((participant) => {
    const pFirst = normalizeName(participant.first_name);
    const pNick = normalizeName(participant.nickname);
    return (
      pFirst === firstKey ||
      pNick === nickKey ||
      pFirst === nickKey ||
      pNick === firstKey
    );
  });

  console.info('[PARENT_CHILD_MATCH]', {
    camp_program_code: campProgramCode,
    child_first_name: childFirstName,
    child_nickname: childNickname ?? null,
    matched: Boolean(match),
    matched_student_id: match?.id ?? null,
    camp_students_checked: participants.length,
  });

  return match ?? null;
}

async function fetchPilotProgramByCode(
  programCode: string,
): Promise<ActivePilotProgram | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await withTimeout(
      supabase.from('pilot_programs').select('*').eq('program_code', programCode.trim()).limit(1),
      DASHBOARD_FETCH_TIMEOUT_MS,
      'pilot_program_by_code',
    );

    if (error || !data?.length) return null;
    return recordToActivePilotProgram(data[0] as PilotProgramRecord);
  } catch {
    return null;
  }
}

async function createOrResolveFamilyPilotProgram(input: {
  familyProgramCode: string;
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
}): Promise<{ program: ActivePilotProgram; created: boolean; error?: string }> {
  const existing = await fetchPilotProgramByCode(input.familyProgramCode);
  if (existing) {
    return { program: existing, created: false };
  }

  if (!isSupabaseConfigured() || !supabase) {
    return { program: buildLocalFamilyProgram(input), created: true, error: 'missing_env' };
  }

  const programName = resolveIndependentFamilyProgramName(
    `${input.parentLastName.trim()} Family`,
    input.parentFirstName,
  );
  const familyAccessCode = `${input.familyProgramCode.trim()}-FAMILY`;

  const payload: Omit<PilotProgramRecord, 'id' | 'created_at'> = {
    program_name: programName,
    program_code: input.familyProgramCode.trim(),
    program_type: INDEPENDENT_FAMILY_DB_TYPE,
    admin_first_name: input.parentFirstName.trim(),
    admin_email: input.parentEmail.trim(),
    estimated_students: 1,
    age_range: 'Mixed Ages',
    group_name: programName,
    family_access_code: familyAccessCode,
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
      'family_pilot_program_insert',
    );

    if (error || !data) {
      const fallback = await fetchPilotProgramByCode(input.familyProgramCode);
      if (fallback) {
        return { program: fallback, created: false };
      }
      return {
        program: buildLocalFamilyProgram(input),
        created: false,
        error: error?.message ?? 'Could not create family program.',
      };
    }

    const program = recordToActivePilotProgram(data as PilotProgramRecord);
    console.info('[FAMILY_PORTAL_CREATED]', {
      family_program_code: program.programCode,
      family_access_code: program.familyAccessCode,
      program_name: program.programName,
      created: true,
    });
    return { program, created: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not create family program.';
    return { program: buildLocalFamilyProgram(input), created: false, error: message };
  }
}

function buildLocalFamilyProgram(input: {
  familyProgramCode: string;
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
}): ActivePilotProgram {
  const programName = resolveIndependentFamilyProgramName(
    `${input.parentLastName.trim()} Family`,
    input.parentFirstName,
  );
  return {
    programName,
    programCode: input.familyProgramCode.trim(),
    programType: INDEPENDENT_FAMILY_PROGRAM_TYPE,
    adminFirstName: input.parentFirstName.trim(),
    adminEmail: input.parentEmail.trim(),
    estimatedStudents: 1,
    ageRange: 'Mixed Ages',
    groupName: programName,
    familyAccessCode: `${input.familyProgramCode.trim()}-FAMILY`,
    facilitatorAccessCode: null,
    pricingTier: INDEPENDENT_FAMILY_PRICING_TIER,
    paymentStatus: 'paid',
    pilotStatus: 'active',
    agreedAt: new Date().toISOString(),
  };
}

function activatePrivateFamilyPortal(program: ActivePilotProgram): void {
  writeActiveFamilyContext({
    programCode: program.programCode,
    programName: program.programName,
    familyAccessCode: program.familyAccessCode,
    groupName: program.groupName,
  });
  writeActivePilotProgram(program);
  syncPortalProgramContext(program);
  writeActivePortalRole('family');
  writeActiveAccessCode(program.familyAccessCode);
  writeLastPilotProgram(program, 'family', program.adminEmail, program.familyAccessCode);
  writeFamilyPortalSession();
}

async function ensureStudentFamilyLinkRow(input: {
  studentId: string;
  campProgramCode: string;
  familyProgramCode: string;
  parentEmail: string;
  parentLastName: string;
  relationship?: string;
}): Promise<{ created: boolean; error?: string }> {
  const existing = await fetchStudentFamilyLinksByFamilyProgram(input.familyProgramCode);
  const alreadyLinked = existing.links.some((row) => row.student_id === input.studentId);
  if (alreadyLinked) {
    console.info('[STUDENT_FAMILY_LINK_CREATED]', {
      student_id: input.studentId,
      family_program_code: input.familyProgramCode,
      camp_program_code: input.campProgramCode,
      created: false,
      reason: 'already_linked',
    });
    return { created: false };
  }

  const result = await createStudentFamilyLink({
    studentId: input.studentId,
    campProgramCode: input.campProgramCode,
    familyProgramCode: input.familyProgramCode,
    parentEmail: input.parentEmail,
    parentLastName: input.parentLastName,
    relationship: input.relationship,
  });

  if (!result.success) {
    return { created: false, error: result.error };
  }

  console.info('[STUDENT_FAMILY_LINK_CREATED]', {
    student_id: input.studentId,
    family_program_code: input.familyProgramCode,
    camp_program_code: input.campProgramCode,
    link_id: result.link?.id ?? null,
    created: true,
  });

  return { created: true };
}

/**
 * Parent entered via camp family access code — create private family portal and link child.
 */
export async function linkParentChildFromCampAssessment(
  input: ParentChildLinkFromCampInput,
): Promise<ParentChildLinkFromCampResult> {
  const campProgramCode = input.campProgram.programCode.trim();
  const displayName = childDisplayName(input.childFirstName, input.childNickname);

  console.info('[PARENT_CHILD_LINK_START]', {
    camp_program_code: campProgramCode,
    parent_email: input.parentEmail,
    parent_last_name: input.parentLastName,
    child_first_name: input.childFirstName,
    child_nickname: input.childNickname ?? null,
  });

  const familyProgramCode = suggestFamilyProgramCode({
    parentLastName: input.parentLastName,
    studentFirstName: input.childFirstName,
  });

  const familyProgramResult = await createOrResolveFamilyPilotProgram({
    familyProgramCode,
    parentFirstName: input.parentFirstName,
    parentLastName: input.parentLastName,
    parentEmail: input.parentEmail,
  });

  if (familyProgramResult.error && !familyProgramResult.program) {
    return {
      success: false,
      matchedCampChild: false,
      familyProgramCreated: false,
      linkCreated: false,
      message: familyProgramResult.error,
    };
  }

  if (!familyProgramResult.created) {
    console.info('[FAMILY_PORTAL_CREATED]', {
      family_program_code: familyProgramResult.program.programCode,
      family_access_code: familyProgramResult.program.familyAccessCode,
      created: false,
      reason: 'existing_program',
    });
  }

  const campChild = await findMatchingCampChildParticipant(
    campProgramCode,
    input.childFirstName,
    input.childNickname,
  );

  let studentId = campChild?.id ?? '';
  let matchedCampChild = Boolean(campChild);

  if (!studentId) {
    const { participantId } = await findOrCreateParticipant({
      role: 'student',
      first_name: input.childFirstName.trim(),
      nickname: displayName,
      program_code: familyProgramResult.program.programCode,
      group_name: undefined,
    });
    studentId = participantId;
    matchedCampChild = false;
  } else {
    await findOrCreateParticipant({
      role: 'student',
      participant_id: studentId,
      first_name: campChild?.first_name?.trim() || input.childFirstName.trim(),
      nickname: campChild?.nickname?.trim() || displayName,
      program_code: familyProgramResult.program.programCode,
      group_name: undefined,
    });
  }

  const linkResult = await ensureStudentFamilyLinkRow({
    studentId,
    campProgramCode,
    familyProgramCode: familyProgramResult.program.programCode,
    parentEmail: input.parentEmail,
    parentLastName: input.parentLastName,
    relationship: input.parentRole ?? 'Parent',
  });

  if (linkResult.error) {
    return {
      success: false,
      matchedCampChild,
      familyProgramCreated: familyProgramResult.created,
      linkCreated: false,
      message: linkResult.error,
    };
  }

  activatePrivateFamilyPortal(familyProgramResult.program);
  writeActiveChildParticipantId(studentId);
  writeActiveChildNickname(displayName);
  notifyChildProfileUpdated();

  return {
    success: true,
    familyProgram: familyProgramResult.program,
    studentId,
    childDisplayName: displayName,
    matchedCampChild,
    familyProgramCreated: familyProgramResult.created,
    linkCreated: linkResult.created,
    message: matchedCampChild
      ? `Your private family portal is ready. ${displayName} is linked from camp.`
      : `Your private family portal is ready. ${displayName} was added to your family.`,
  };
}
