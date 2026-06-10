import { setActiveChild } from './activeChildContext';
import { resolveTrackingProgramCode } from './activeProgramContext';
import {
  ensureStudentParticipantForSave,
  findOrCreateParticipant,
  resolveStudentGroupNameForSave,
} from './pilotTrackingService';
import { ensureFamilyChildLink } from './studentFamilyLinkService';

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

function resolveChildDisplayName(firstName: string, nickname?: string): string {
  return nickname?.trim() || firstName.trim();
}

export async function createFamilyChildParticipant(
  input: CreateFamilyChildInput,
): Promise<CreateFamilyChildResult> {
  const firstName = input.firstName.trim();
  const nickname = input.nickname?.trim() || '';
  const displayName = resolveChildDisplayName(firstName, nickname);
  const programCode = resolveTrackingProgramCode('child_profile_create');

  if (!firstName) {
    return { success: false, displayName: '', message: 'First name is required.' };
  }

  if (!programCode) {
    return { success: false, displayName, message: 'Missing active family program.' };
  }

  try {
    const { participantId, source } = await findOrCreateParticipant({
      role: 'student',
      first_name: firstName,
      nickname: displayName,
      program_code: programCode,
      group_name: undefined,
      child_age_range: input.ageGrade?.trim() || undefined,
    });

    setActiveChild({
      participantId,
      displayName,
      firstName,
    });

    await ensureFamilyChildLink({
      studentId: participantId,
      familyProgramCode: programCode,
    });

    console.info('[CHILD_PROFILE]', {
      action: 'create',
      participant_id: participantId,
      first_name: firstName,
      nickname: nickname || null,
      display_name: displayName,
      program_code: programCode,
      source,
    });

    return {
      success: true,
      participantId,
      displayName,
      message: `${displayName} was added to your family.`,
    };
  } catch (err) {
    console.warn('[CHILD_PROFILE]', { action: 'create_failed', error: err });
    return {
      success: false,
      displayName,
      message: 'Could not save child profile. Please try again.',
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

/** Ensures a student participant row exists before baseline / before check-in starts. */
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
