import { readActivePilotProgram } from '../config/activePilotProgram';
import { readParentClaimContext } from '../config/parentClaimContext';
import { readFamilyPortalSession } from '../config/familyPortalAccess';
import { normalizeGradeLevelStorage, type GradeLevel } from '../data/gradeLevelOptions';
import { setActiveChild } from './activeChildContext';
import { requireActivePilotProgram, resolveTrackingProgramCode } from './activeProgramContext';
import { resolveFamilyAddChildVisibility } from './familyPortalLinkAudit';
import {
  isIndependentFamilyProgramCode,
} from './independentFamilyProgram';
import { invalidatePortalFetch } from './portalFetchDedupe';
import { saveParticipantGradeLevel } from './participantGradeService';
import {
  ensureStudentParticipantForSave,
  findOrCreateParticipant,
  resolveStudentGroupNameForSave,
} from './pilotTrackingService';
import {
  ensureFamilyChildLink,
  fetchStudentFamilyLinksByFamilyProgram,
  resolveFamilyVisibleChildren,
} from './studentFamilyLinkService';

export type CreateFamilyChildInput = {
  firstName: string;
  nickname?: string;
  ageGrade?: string;
};

export type CreateFamilyChildResult = {
  success: boolean;
  participantId?: string;
  displayName: string;
  message: string;
};

const CHILD_SAVE_ERROR_MESSAGE = "Couldn't save child yet. Please try again.";

function resolveChildDisplayName(firstName: string, nickname?: string): string {
  return nickname?.trim() || firstName.trim();
}

function parseOptionalAgeGradeInput(raw?: string): {
  childAgeRange: string | null;
  gradeLevel: GradeLevel | null;
} {
  const value = raw?.trim();
  if (!value) {
    return { childAgeRange: null, gradeLevel: null };
  }

  const normalized = normalizeGradeLevelStorage(value);
  if (normalized) {
    return { childAgeRange: value, gradeLevel: normalized };
  }

  const lower = value.toLowerCase();
  if (/^k(indegarten)?$/.test(lower)) {
    return { childAgeRange: value, gradeLevel: 'kindergarten' };
  }

  const digitMatch = lower.match(/^(\d)(?:st|nd|rd|th)?(?:\s*grade)?$/);
  if (digitMatch && ['1', '2', '3', '4', '5', '6', '7', '8'].includes(digitMatch[1])) {
    return { childAgeRange: value, gradeLevel: digitMatch[1] as GradeLevel };
  }

  return { childAgeRange: value, gradeLevel: null };
}

function invalidateFamilyPortalChildCaches(programCode: string): void {
  const code = programCode.trim();
  if (!code) return;
  invalidatePortalFetch(`family-children-roster:${code}`);
  invalidatePortalFetch(`family-dashboard:${code}`);
}

function logChildCreateFailure(input: {
  programCode: string | null;
  isIndependentFamily: boolean;
  payload: CreateFamilyChildInput;
  error: unknown;
}): void {
  const program = readActivePilotProgram();
  const parentClaim = readParentClaimContext();
  console.error('[CHILD_PROFILE]', {
    action: 'create_failed',
    family_portal_mode: readFamilyPortalSession() ? 'family_session' : 'no_session',
    parent_email: parentClaim?.email?.trim() || null,
    program_id: program?.id ?? null,
    program_code: input.programCode,
    is_independent_family: input.isIndependentFamily,
    payload_attempted: {
      first_name: input.payload.firstName.trim(),
      nickname: input.payload.nickname?.trim() || null,
      age_grade: input.payload.ageGrade?.trim() || null,
    },
    error: input.error,
  });
}

export async function createFamilyChildParticipant(
  input: CreateFamilyChildInput,
): Promise<CreateFamilyChildResult> {
  const firstName = input.firstName.trim();
  const nickname = input.nickname?.trim() || '';
  const displayName = resolveChildDisplayName(firstName, nickname);
  const program = requireActivePilotProgram();
  const programCode = resolveTrackingProgramCode('child_profile_create');
  const isIndependentFamily = isIndependentFamilyProgramCode(programCode ?? '', program);

  if (!firstName) {
    return { success: false, displayName: '', message: 'First name is required.' };
  }

  if (!programCode) {
    return { success: false, displayName, message: 'Missing active family program.' };
  }

  if (!isIndependentFamily) {
    const visibility = await resolveFamilyVisibleChildren(programCode);
    const { links } = await fetchStudentFamilyLinksByFamilyProgram(programCode);

    const canAddChild = resolveFamilyAddChildVisibility({
      claimRequired: visibility.claimRequired,
      visibleChildrenCount: visibility.children.length,
      childrenSummaryCount: visibility.children.length,
      familyLinks: links,
    });

    if (!canAddChild) {
      const message =
        visibility.claimRequired || links.some((link) => link.student_id?.trim())
          ? 'A child is already linked to this family program. Confirm your parent email to connect their profile — do not add a duplicate child.'
          : 'Your linked child is already on this dashboard.';
      console.warn('[CHILD_PROFILE]', {
        action: 'create_blocked',
        reason: 'existing_family_link_or_child',
        program_code: programCode,
        visible_children: visibility.children.length,
        family_links: links.length,
      });
      return { success: false, displayName, message };
    }
  }

  const parsedAgeGrade = parseOptionalAgeGradeInput(input.ageGrade);

  try {
    const { participantId, source } = await findOrCreateParticipant(
      {
        role: 'student',
        first_name: firstName,
        nickname: nickname || displayName,
        program_code: programCode,
        group_name: undefined,
        child_age_range: parsedAgeGrade.childAgeRange || undefined,
      },
      { diagnosticTag: 'child_profile' },
    );

    if (source !== 'supabase') {
      logChildCreateFailure({
        programCode,
        isIndependentFamily,
        payload: input,
        error: `participant saved locally only (source=${source})`,
      });
      return { success: false, displayName, message: CHILD_SAVE_ERROR_MESSAGE };
    }

    if (parsedAgeGrade.gradeLevel) {
      const gradeResult = await saveParticipantGradeLevel(participantId, parsedAgeGrade.gradeLevel);
      if (!gradeResult.success) {
        console.warn('[CHILD_PROFILE]', {
          action: 'grade_save_failed',
          participant_id: participantId,
          grade_level: parsedAgeGrade.gradeLevel,
          error: gradeResult.error,
        });
      }
    }

    setActiveChild({
      participantId,
      displayName,
      firstName,
    });

    if (!isIndependentFamily) {
      const linkResult = await ensureFamilyChildLink({
        studentId: participantId,
        familyProgramCode: programCode,
      });
      if (!linkResult.linked) {
        console.warn('[CHILD_PROFILE]', {
          action: 'camp_link_optional_failed',
          participant_id: participantId,
          program_code: programCode,
          error: linkResult.error,
        });
      }
    }

    invalidateFamilyPortalChildCaches(programCode);

    console.info('[CHILD_PROFILE]', {
      action: 'create',
      participant_id: participantId,
      first_name: firstName,
      nickname: nickname || null,
      display_name: displayName,
      program_code: programCode,
      is_independent_family: isIndependentFamily,
      source,
      grade_level: parsedAgeGrade.gradeLevel,
      child_age_range: parsedAgeGrade.childAgeRange,
    });

    return {
      success: true,
      participantId,
      displayName,
      message: `${displayName} was added to your family.`,
    };
  } catch (err) {
    logChildCreateFailure({
      programCode,
      isIndependentFamily,
      payload: input,
      error: err,
    });
    return {
      success: false,
      displayName,
      message: CHILD_SAVE_ERROR_MESSAGE,
    };
  }
}

export type EnsureBaselineParticipantInput = {
  firstName?: string;
  nickname: string;
  participantId?: string;
  groupName?: string;
};

export type EnsureBaselineParticipantResult = {
  participantId: string;
  firstName: string;
  nickname: string;
  source: 'supabase' | 'local';
};

/** Ensures a student participant row exists before baseline / B-4 Check-In starts. */
export async function ensureParticipantForBaseline(
  input: EnsureBaselineParticipantInput,
): Promise<EnsureBaselineParticipantResult> {
  const nickname = input.nickname.trim();
  const firstName = input.firstName?.trim() || nickname;
  const programCode = resolveTrackingProgramCode('baseline_participant_ensure');

  if (!nickname) {
    throw new Error('Nickname or first name is required for baseline.');
  }

  if (!programCode) {
    throw new Error('Missing active program context.');
  }

  const ensured = await ensureStudentParticipantForSave({
    participantId: input.participantId,
    firstName,
    nickname,
    groupName: resolveStudentGroupNameForSave(input.groupName),
  });

  setActiveChild({
    participantId: ensured.participantId,
    displayName: ensured.nickname,
    firstName: ensured.firstName,
  });

  console.info('[CHILD_PROFILE]', {
    action: 'baseline_ensure',
    participant_id: ensured.participantId,
    first_name: ensured.firstName,
    nickname: ensured.nickname,
    program_code: ensured.programCode,
    source: ensured.source,
  });

  return {
    participantId: ensured.participantId,
    firstName: ensured.firstName,
    nickname: ensured.nickname,
    source: ensured.source,
  };
}
