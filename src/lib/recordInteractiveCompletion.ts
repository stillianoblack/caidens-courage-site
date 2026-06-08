import { readActiveChildNickname } from '../config/activeChildNickname';
import { resolveActiveProgramContext } from '../config/activePilotProgram';
import { resolveModuleTracking } from '../data/moduleTrackingRegistry';
import type { GameAssessmentConfig } from '../types/gameAssessment';
import type { GameAnswerValue } from '../types/gameAssessment';
import type { ModuleCompletionAnswers, ModuleTrackingDefinition } from '../types/moduleTracking';
import { loadAdultAssessmentSession } from './adultAssessmentStorage';
import { loadB4BaselineState } from './b4BaselineCheckStorage';
import {
  findOrCreateParticipant,
  saveAssessmentResult,
  saveModuleResult,
} from './pilotTrackingService';

export type RecordInteractiveCompletionInput = {
  config: GameAssessmentConfig;
  score: number;
  maxScore: number;
  answers?: Record<string, GameAnswerValue>;
  timeSpentSeconds?: number;
  tracking?: ModuleTrackingDefinition;
  guideId?: string;
  missionId?: string;
  pathname?: string;
};

function answersToJson(answers?: Record<string, GameAnswerValue>): Record<string, unknown> | undefined {
  if (!answers) return undefined;
  return Object.fromEntries(
    Object.entries(answers).map(([key, value]) => [key, value as unknown]),
  );
}

function resolveStudentParticipant(pathname?: string) {
  const baselineState = loadB4BaselineState();
  const program = resolveActiveProgramContext();
  const nickname =
    baselineState.profile?.nickname?.trim() ||
    readActiveChildNickname()?.trim() ||
    'Student';

  return {
    nickname,
    role: 'student',
    program_code: baselineState.profile?.programCode || program?.programCode || '',
    program_name: program?.programName,
    group_name: baselineState.profile?.groupName || program?.groupName || '',
  };
}

function resolveAdultParticipant(pathname: string) {
  const session = loadAdultAssessmentSession();
  const program = resolveActiveProgramContext();
  const isFacilitator =
    pathname.startsWith('/portal/facilitator') ||
    pathname.startsWith('/program-dashboard');

  const profile = session.profile;
  const role = isFacilitator ? 'facilitator' : 'parent';

  return {
    first_name: profile?.firstName ?? 'Adult',
    email: profile?.email ?? `${role}@local.focusflame`,
    role,
    program_code: profile?.programCode || program?.programCode || '',
    program_name: program?.programName,
    group_name: program?.groupName,
    organization: profile?.organization,
    child_age_range: profile?.childAgeRange,
    email_opt_in: profile?.emailOptIn,
  };
}

async function resolveParticipantForTracking(
  tracking: ModuleTrackingDefinition,
  pathname: string,
) {
  const payload =
    tracking.role === 'student'
      ? resolveStudentParticipant(pathname)
      : resolveAdultParticipant(pathname);

  return findOrCreateParticipant(payload);
}

export async function recordInteractiveModuleCompletion(
  input: RecordInteractiveCompletionInput,
): Promise<{ warning?: string }> {
  const pathname =
    input.pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '');

  const tracking = resolveModuleTracking(input.config, {
    tracking: input.tracking,
    guideId: input.guideId,
    missionId: input.missionId,
    pathname,
  });

  if (!tracking || tracking.isFormalAssessment) {
    return {};
  }

  try {
    const { participantId } = await resolveParticipantForTracking(tracking, pathname);
    const participant =
      tracking.role === 'student'
        ? resolveStudentParticipant(pathname)
        : resolveAdultParticipant(pathname);

    const result = await saveModuleResult({
      participant_id: participantId,
      role: tracking.role,
      program_code: participant.program_code,
      group_name: participant.group_name,
      module_id: tracking.moduleId,
      module_title: tracking.moduleTitle,
      character: tracking.character,
      skill_area: tracking.skillArea,
      score: input.score,
      max_score: input.maxScore,
      time_spent_seconds: input.timeSpentSeconds,
      answers_json: answersToJson(input.answers),
    });

    if (result.source === 'local') {
      return { warning: result.message ?? 'Saved on this device.' };
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('TRACKING Supabase failed, local fallback used', err);
    }
    return { warning: 'Saved on this device.' };
  }

  return {};
}

export async function recordFormalAssessmentCompletion(input: {
  assessmentType: 'baseline' | 'final' | 'adult_pre' | 'adult_post';
  role: string;
  participant: {
    nickname?: string;
    first_name?: string;
    email?: string;
    program_code?: string;
    program_name?: string;
    group_name?: string;
    organization?: string;
    child_age_range?: string;
    email_opt_in?: boolean;
  };
  reading_score?: number;
  focus_score?: number;
  confidence_score?: number;
  understanding_score?: number;
  support_score?: number;
  total_score?: number;
  max_score?: number;
  answers_json?: ModuleCompletionAnswers;
  completed_at?: string;
}): Promise<{ warning?: string }> {
  try {
    const { participantId } = await findOrCreateParticipant({
      ...input.participant,
      role: input.role,
    });

    const percentScore =
      input.total_score != null && input.max_score
        ? Math.round((input.total_score / input.max_score) * 10000) / 100
        : undefined;

    const result = await saveAssessmentResult({
      participant_id: participantId,
      role: input.role,
      program_code: input.participant.program_code ?? '',
      group_name: input.participant.group_name,
      assessment_type: input.assessmentType,
      reading_score: input.reading_score,
      focus_score: input.focus_score,
      confidence_score: input.confidence_score,
      understanding_score: input.understanding_score,
      support_score: input.support_score,
      total_score: input.total_score,
      max_score: input.max_score,
      percent_score: percentScore,
      answers_json: input.answers_json,
      completed_at: input.completed_at,
    });

    if (result.source === 'local') {
      return { warning: result.message ?? 'Saved on this device.' };
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('TRACKING Supabase failed, local fallback used', err);
    }
    return { warning: 'Saved on this device.' };
  }

  return {};
}
