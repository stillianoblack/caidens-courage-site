import { readActiveChildNickname } from '../config/activeChildNickname';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { resolveModuleTracking } from '../data/moduleTrackingRegistry';
import type { GameAssessmentConfig } from '../types/gameAssessment';
import type { GameAnswerValue } from '../types/gameAssessment';
import type { ModuleCompletionAnswers, ModuleTrackingDefinition } from '../types/moduleTracking';
import { loadAdultAssessmentSession } from './adultAssessmentStorage';
import { logTrackingSaveBlocked, resolveTrackingProgramCode } from './activeProgramContext';
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

function resolveStudentParticipant() {
  const baselineState = loadB4BaselineState();
  const program = readActivePilotProgram();
  const programCode = resolveTrackingProgramCode();
  const nickname =
    baselineState.profile?.nickname?.trim() ||
    readActiveChildNickname()?.trim() ||
    'Student';

  return {
    nickname,
    first_name: nickname,
    role: 'student',
    program_code: programCode ?? '',
    program_name: program?.programName,
    group_name: program?.groupName?.trim() || baselineState.profile?.groupName?.trim() || undefined,
  };
}

function resolveAdultParticipant() {
  const session = loadAdultAssessmentSession();
  const program = readActivePilotProgram();
  const profile = session.profile;
  const programCode = resolveTrackingProgramCode();

  return {
    first_name: profile?.firstName ?? 'Adult',
    email: profile?.email ?? '',
    role: 'adult',
    adult_role: profile?.role,
    program_code: programCode ?? '',
    program_name: program?.programName,
    organization: profile?.organization,
    child_age_range: profile?.childAgeRange,
    email_opt_in: profile?.emailOptIn,
  };
}

function resolveResultRole(tracking: ModuleTrackingDefinition): string {
  return tracking.role === 'student' ? 'student' : 'adult';
}

async function resolveParticipantForTracking(tracking: ModuleTrackingDefinition) {
  const payload =
    tracking.role === 'student' ? resolveStudentParticipant() : resolveAdultParticipant();

  if (!payload.program_code) {
    logTrackingSaveBlocked('participant save missing active program context');
    throw new Error('Missing active program context');
  }

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

  if (!resolveTrackingProgramCode()) {
    return { warning: 'Missing active program context.' };
  }

  try {
    const { participantId } = await resolveParticipantForTracking(tracking);
    const participant =
      tracking.role === 'student' ? resolveStudentParticipant() : resolveAdultParticipant();
    const groupName = 'group_name' in participant ? participant.group_name : undefined;

    const result = await saveModuleResult({
      participant_id: participantId,
      role: resolveResultRole(tracking),
      program_code: participant.program_code,
      group_name: groupName,
      module_id: tracking.moduleId,
      module_title: tracking.moduleTitle,
      character: tracking.character,
      skill_area: tracking.skillArea,
      score: input.score,
      max_score: input.maxScore,
      time_spent_seconds: input.timeSpentSeconds,
      answers_json: answersToJson(input.answers),
    });

    if (result.source === 'local' && result.message) {
      return { warning: result.message };
    }
    if (!result.success && result.message) {
      return { warning: result.message };
    }
  } catch (err) {
    if (err instanceof Error && err.message === 'Missing active program context') {
      return { warning: 'Missing active program context.' };
    }
    console.warn('[TRACKING_SAVE_FAILED] module completion', err);
    return { warning: 'Saved on this device only.' };
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
    adult_role?: string;
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
  const programCode = resolveTrackingProgramCode();
  if (!programCode) {
    return { warning: 'Missing active program context.' };
  }

  const activeProgram = readActivePilotProgram();

  try {
    const participantRole = input.role === 'student' ? 'student' : 'adult';
    const { participantId } = await findOrCreateParticipant({
      ...input.participant,
      role: participantRole,
      program_code: programCode,
      program_name: activeProgram?.programName ?? input.participant.program_name,
      group_name: activeProgram?.groupName ?? input.participant.group_name,
    });

    const percentScore =
      input.total_score != null && input.max_score
        ? Math.round((input.total_score / input.max_score) * 10000) / 100
        : undefined;

    const result = await saveAssessmentResult({
      participant_id: participantId,
      role: participantRole,
      program_code: programCode,
      group_name: activeProgram?.groupName ?? input.participant.group_name,
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

    if (result.source === 'local' && result.message) {
      return { warning: result.message };
    }
    if (!result.success && result.message) {
      return { warning: result.message };
    }
  } catch (err) {
    if (err instanceof Error && err.message === 'Missing active program context') {
      return { warning: 'Missing active program context.' };
    }
    console.warn('[TRACKING_SAVE_FAILED] assessment completion', err);
    return { warning: 'Saved on this device only.' };
  }

  return {};
}
