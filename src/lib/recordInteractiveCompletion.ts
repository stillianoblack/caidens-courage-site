import { readActiveChildNickname } from '../config/activeChildNickname';
import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { resolveModuleTracking } from '../data/moduleTrackingRegistry';
import type { GameAssessmentConfig } from '../types/gameAssessment';
import type { GameAnswerValue } from '../types/gameAssessment';
import type { ModuleCompletionAnswers, ModuleTrackingDefinition } from '../types/moduleTracking';
import { loadAdultAssessmentSession } from './adultAssessmentStorage';
import { logTrackingSaveBlocked, resolveTrackingProgramCode } from './activeProgramContext';
import { notifyModuleComplete } from './activeChildContext';
import { loadB4BaselineState } from './b4BaselineCheckStorage';
import {
  ensureStudentParticipantForSave,
  findOrCreateParticipant,
  resolveStudentGroupNameForSave,
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
  const activeParticipantId = readActiveChildParticipantId();
  const baselineState = loadB4BaselineState(activeParticipantId);
  const programCode = resolveTrackingProgramCode();
  const program = readActivePilotProgram();
  const nickname =
    baselineState.profile?.nickname?.trim() ||
    readActiveChildNickname()?.trim() ||
    'Student';
  const firstName = baselineState.profile?.firstName?.trim() || nickname;

  return {
    participant_id: readActiveChildParticipantId() || baselineState.profile?.participantId,
    nickname,
    first_name: firstName,
    role: 'student',
    program_code: programCode ?? '',
    program_name: program?.programName,
    group_name: resolveStudentGroupNameForSave(
      program?.groupName?.trim() || baselineState.profile?.groupName?.trim(),
    ),
  };
}

function resolveAdultParticipant() {
  const session = loadAdultAssessmentSession();
  const profile = session.profile;
  const programCode = resolveTrackingProgramCode();
  const program = readActivePilotProgram();

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
  if (tracking.role === 'student') {
    const student = resolveStudentParticipant();
    if (!student.program_code) {
      logTrackingSaveBlocked('participant save missing active program context');
      throw new Error('Missing active program context');
    }
    const ensured = await ensureStudentParticipantForSave({
      participantId: student.participant_id,
      firstName: student.first_name,
      nickname: student.nickname,
      groupName: student.group_name,
    });
    return { participantId: ensured.participantId, source: ensured.source };
  }

  const payload = resolveAdultParticipant();
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

  if (tracking.role === 'student') {
    const student = resolveStudentParticipant();
    if (!student.participant_id?.trim()) {
      return {
        warning: 'Add or select your child profile before saving progress.',
      };
    }
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
      group_name:
        tracking.role === 'student' ? resolveStudentGroupNameForSave(groupName) : groupName,
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

    console.info('[MODULE_SAVE]', {
      participant_id: participantId,
      program_code: participant.program_code,
      character: tracking.character,
      module_id: tracking.moduleId,
      skill_area: tracking.skillArea,
      score: input.score,
      max_score: input.maxScore,
    });
    notifyModuleComplete({
      participant_id: participantId,
      module_id: tracking.moduleId,
      character: tracking.character,
      program_code: participant.program_code,
    });
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
