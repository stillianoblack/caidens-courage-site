import { CHILD_BASELINE_ASSESSMENT_TYPE } from '../config/assessmentTypeConstants';
import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import {
  isBaselineFullyComplete,
  loadAllBaselineResults,
  loadB4BaselineState,
} from './b4BaselineCheckStorage';
import { isSupabaseConfigured, supabase } from './supabaseClient';

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

export type BaselineCompletionInput = {
  programCode?: string;
  participantId?: string;
};

function resolveParticipantId(participantId?: string): string {
  return (participantId ?? readActiveChildParticipantId()).trim();
}

export function isBaselineCompleteLocal(input: BaselineCompletionInput = {}): boolean {
  const code = input.programCode?.trim();
  const participantId = resolveParticipantId(input.participantId);

  if (!participantId) {
    return false;
  }

  const session = loadB4BaselineState(participantId);
  if (isBaselineFullyComplete(session)) {
    const sessionCode = session.profile?.programCode ?? session.record?.programCode ?? '';
    const sessionParticipant =
      session.profile?.participantId ?? session.record?.participantId ?? '';
    const codeMatches = !code || normalizeCode(sessionCode) === normalizeCode(code);
    const participantMatches = sessionParticipant === participantId;
    if (codeMatches && participantMatches) {
      console.info('[BASELINE_MATCH]', {
        source: 'local_session',
        participant_id: participantId,
        program_code: code ?? sessionCode,
        matched: true,
      });
      return true;
    }
  }

  const archive = loadAllBaselineResults();
  const matched = archive.some((row) => {
    if (!row.completedAt) return false;
    const rowParticipant = row.participantId?.trim() ?? '';
    if (!rowParticipant || rowParticipant !== participantId) return false;
    if (code && normalizeCode(row.programCode) !== normalizeCode(code)) return false;
    return true;
  });

  if (matched) {
    console.info('[BASELINE_MATCH]', {
      source: 'local_archive',
      participant_id: participantId,
      program_code: code ?? null,
      matched: true,
    });
  }

  return matched;
}

export async function isBaselineCompleteRemote(
  input: BaselineCompletionInput = {},
): Promise<boolean> {
  const code = input.programCode?.trim();
  const participantId = resolveParticipantId(input.participantId);

  if (!isSupabaseConfigured() || !supabase || !code || !participantId) {
    return false;
  }

  try {
    const { data: v2Data, error: v2Error } = await supabase
      .from('assessment_results_v2')
      .select('participant_id, program_code, assessment_type, completed_at')
      .eq('assessment_type', CHILD_BASELINE_ASSESSMENT_TYPE)
      .eq('program_code', code)
      .eq('participant_id', participantId)
      .limit(1);

    if (!v2Error && v2Data?.length) {
      const row = v2Data[0] as { completed_at?: string | null };
      if (row.completed_at) {
        console.info('[BASELINE_MATCH]', {
          source: 'assessment_results_v2',
          participant_id: participantId,
          program_code: code,
          matched: true,
        });
        return true;
      }
    }

    const { data, error } = await supabase
      .from('assessment_results')
      .select('student_id, program_code, assessment_type, completed_at')
      .eq('assessment_type', CHILD_BASELINE_ASSESSMENT_TYPE)
      .eq('program_code', code)
      .eq('student_id', participantId)
      .limit(1);

    if (error || !data?.length) {
      return false;
    }

    const row = data[0] as { completed_at?: string | null };
    const matched = Boolean(row.completed_at);
    if (matched) {
      console.info('[BASELINE_MATCH]', {
        source: 'assessment_results',
        participant_id: participantId,
        program_code: code,
        matched: true,
      });
    }
    return matched;
  } catch {
    return false;
  }
}

export async function checkBaselineCompletion(
  programCode?: string,
  participantId?: string,
): Promise<boolean> {
  const resolvedParticipantId = resolveParticipantId(participantId);
  const input = { programCode, participantId: resolvedParticipantId };

  if (!resolvedParticipantId) {
    console.info('[BASELINE_GATE]', {
      program_code: programCode ?? null,
      participant_id: null,
      complete: false,
      reason: 'no_active_child',
    });
    return false;
  }

  const localComplete = isBaselineCompleteLocal(input);
  const remoteComplete = localComplete ? true : await isBaselineCompleteRemote(input);
  const complete = localComplete || remoteComplete;

  console.info('[BASELINE_GATE]', {
    program_code: programCode ?? null,
    participant_id: resolvedParticipantId,
    complete,
    local_complete: localComplete,
    remote_complete: remoteComplete,
  });
  console.info('[BASELINE_CHECK]', {
    program_code: programCode ?? null,
    participant_id: resolvedParticipantId,
    assessment_type: CHILD_BASELINE_ASSESSMENT_TYPE,
    complete,
  });

  return complete;
}
