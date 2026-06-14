import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import {
  getB4CheckInStatus,
  isBaselineAssessmentCompleteLocal,
  isBaselineAssessmentCompleteRemote,
  type B4CheckInStatusInput,
} from './b4CheckInStatus';

export type BaselineCompletionInput = B4CheckInStatusInput;

function resolveParticipantId(participantId?: string): string {
  return (participantId ?? readActiveChildParticipantId()).trim();
}

export function isBaselineCompleteLocal(input: BaselineCompletionInput = {}): boolean {
  return isBaselineAssessmentCompleteLocal(input);
}

export async function isBaselineCompleteRemote(input: BaselineCompletionInput = {}): Promise<boolean> {
  return isBaselineAssessmentCompleteRemote(input);
}

export async function checkBaselineCompletion(
  programCode?: string,
  participantId?: string,
  assessments?: B4CheckInStatusInput['assessments'],
): Promise<boolean> {
  const resolvedParticipantId = resolveParticipantId(participantId);

  if (!resolvedParticipantId) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[BASELINE_GATE_LOCKED]', {
        program_code: programCode ?? null,
        participant_id: null,
        reason: 'no_active_child',
      });
    }
    return false;
  }

  const localComplete = isBaselineCompleteLocal({
    programCode,
    participantId: resolvedParticipantId,
    assessments,
  });
  const complete =
    localComplete ||
    (await isBaselineCompleteRemote({
      programCode,
      participantId: resolvedParticipantId,
      assessments,
    }));

  if (process.env.NODE_ENV === 'development') {
    if (complete) {
      console.info('[BASELINE_GATE_UNLOCKED]', {
        program_code: programCode ?? null,
        participant_id: resolvedParticipantId,
        source: localComplete ? 'local' : 'remote',
      });
    } else {
      console.info('[BASELINE_GATE_LOCKED]', {
        program_code: programCode ?? null,
        participant_id: resolvedParticipantId,
      });
    }
  }

  return complete;
}

/** Whether the full B-4 Check-In starter flow is complete for the active child. */
export async function checkB4CheckInCompletion(
  programCode?: string,
  participantId?: string,
  assessments?: B4CheckInStatusInput['assessments'],
  selectedChildName?: string,
): Promise<boolean> {
  const resolvedParticipantId = resolveParticipantId(participantId);

  if (!resolvedParticipantId) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[B4_CHECKIN_GATE_LOCKED]', {
        program_code: programCode ?? null,
        participant_id: null,
        reason: 'no_active_child',
      });
    }
    return false;
  }

  const result = await getB4CheckInStatus({
    programCode,
    participantId: resolvedParticipantId,
    assessments,
    selectedChildName,
  });
  const complete = result.status === 'complete';

  if (process.env.NODE_ENV === 'development') {
    console.info(complete ? '[B4_CHECKIN_GATE_UNLOCKED]' : '[B4_CHECKIN_GATE_LOCKED]', {
      program_code: programCode ?? null,
      participant_id: resolvedParticipantId,
      baseline_status: result.baselineComplete ? 'complete' : 'not_complete',
      b4_check_in_status: result.status,
      source: result.source,
    });
  }

  return complete;
}
