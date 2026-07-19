import { readActiveChildNickname } from '../config/activeChildNickname';
import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { resolveModuleTracking } from '../data/moduleTrackingRegistry';
import type { GameAssessmentConfig } from '../types/gameAssessment';
import type { GameAnswerValue } from '../types/gameAssessment';
import type { ModuleCompletionAnswers, ModuleTrackingDefinition } from '../types/moduleTracking';
import type { EnrichedAnswersJson, QuestionAttemptsMap } from '../types/questionInteraction';
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
import { resolveAttemptScope } from './canonicalAttemptRules';
import { resolveMissionAttemptType } from './missionAttemptType';
import { saveQuestionAttempts } from './questionAttemptService';
import { buildQuestionAttemptRows } from './questionAttemptService';
import type { MissionAttemptType } from './questionAttemptService';
import { hasFamilyCompatibilitySession } from './familyPortalChildrenApi';
import { saveFamilyCompatibilityModuleCompletion } from './familyChildProgressApi';

export type RecordInteractiveCompletionInput = {
  config: GameAssessmentConfig;
  score: number;
  maxScore: number;
  answers?: Record<string, GameAnswerValue> | EnrichedAnswersJson;
  timeSpentSeconds?: number;
  tracking?: ModuleTrackingDefinition;
  guideId?: string;
  missionId?: string;
  pathname?: string;
  gradeBandUsed?: string;
  gradeLevelUsed?: string;
  contentVersionId?: string;
  fileId?: string;
  weekNumber?: number | null;
  attemptType?: MissionAttemptType;
};

function isEnrichedAnswersJson(
  answers: Record<string, GameAnswerValue> | EnrichedAnswersJson,
): answers is EnrichedAnswersJson {
  return 'answers' in answers && typeof answers.answers === 'object' && answers.answers !== null;
}

function extractQuestionAttempts(
  answers?: Record<string, GameAnswerValue> | EnrichedAnswersJson,
): QuestionAttemptsMap | null {
  if (!answers || !isEnrichedAnswersJson(answers) || !answers._attempts) {
    return null;
  }
  return answers._attempts;
}

function answersToJson(
  answers?: Record<string, GameAnswerValue> | EnrichedAnswersJson,
  meta?: {
    gradeBandUsed?: string;
    gradeLevelUsed?: string;
    contentVersionId?: string;
    fileId?: string;
    missionId?: string;
    moduleId?: string;
    attemptType?: MissionAttemptType;
    attemptScope?: string;
  },
): Record<string, unknown> | undefined {
  const trackingMeta: Record<string, unknown> = {};
  if (meta?.gradeBandUsed) trackingMeta.grade_band_used = meta.gradeBandUsed;
  if (meta?.gradeLevelUsed) trackingMeta.grade_level_used = meta.gradeLevelUsed;
  if (meta?.contentVersionId) trackingMeta.content_version_id = meta.contentVersionId;
  if (meta?.fileId) trackingMeta.file_id = meta.fileId;
  if (meta?.missionId) trackingMeta.mission_id = meta.missionId;
  if (meta?.moduleId) trackingMeta.module_id = meta.moduleId;
  if (meta?.attemptType) trackingMeta.attempt_type = meta.attemptType;
  if (meta?.attemptScope) trackingMeta.attempt_scope = meta.attemptScope;

  if (!answers && !Object.keys(trackingMeta).length) return undefined;

  const base = !answers
    ? {}
    : isEnrichedAnswersJson(answers)
      ? {
          ...Object.fromEntries(
            Object.entries(answers.answers).map(([key, value]) => [key, value as unknown]),
          ),
          _attempts: answers._attempts,
        }
      : Object.fromEntries(
          Object.entries(answers).map(([key, value]) => [key, value as unknown]),
        );

  return { ...base, ...trackingMeta };
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
    if (tracking.role === 'student' && hasFamilyCompatibilitySession()) {
      const participant = resolveStudentParticipant();
      const participantId = participant.participant_id?.trim();
      if (!participantId) {
        return { warning: 'Add or select your child profile before saving progress.' };
      }
      const resolvedAttemptType =
        input.attemptType ??
        resolveMissionAttemptType({
          participantId,
          moduleId: tracking.moduleId,
          weekNumber: input.weekNumber ?? null,
        });
      const resolvedAttemptScope = resolveAttemptScope(
        resolvedAttemptType === 'initial' ? 'weekly' : resolvedAttemptType,
      );
      const completedAt = new Date().toISOString();
      const attempts = extractQuestionAttempts(input.answers);
      const attemptRows = attempts
        ? buildQuestionAttemptRows({
            config: input.config,
            attempts,
            context: {
              participant_id: participantId,
              program_code: participant.program_code,
              week_number: input.weekNumber ?? null,
              mission_id: input.missionId ?? tracking.moduleId,
              character: tracking.character,
              grade_level: input.gradeLevelUsed ?? null,
              grade_band: input.gradeBandUsed ?? null,
              content_version: input.contentVersionId ?? null,
              module_id: tracking.moduleId,
              attempt_type: resolvedAttemptType,
              attempt_scope: resolvedAttemptScope,
            },
          })
        : [];

      await saveFamilyCompatibilityModuleCompletion({
        participantId,
        module: {
          moduleId: tracking.moduleId,
          moduleTitle: tracking.moduleTitle,
          character: tracking.character,
          skillArea: tracking.skillArea,
          score: input.score,
          maxScore: input.maxScore,
          timeSpentSeconds: input.timeSpentSeconds,
          answersJson: answersToJson(input.answers, {
            gradeBandUsed: input.gradeBandUsed,
            gradeLevelUsed: input.gradeLevelUsed,
            contentVersionId: input.contentVersionId,
            fileId: input.fileId,
            missionId: input.missionId,
            moduleId: tracking.moduleId,
            attemptType: resolvedAttemptType,
            attemptScope: resolvedAttemptScope,
          }),
          completedAt,
        },
        attempts: attemptRows.map((row) => ({
          weekNumber: row.week_number,
          missionId: row.mission_id,
          character: row.character,
          questionId: row.question_id,
          gradeLevel: row.grade_level,
          gradeBand: row.grade_band,
          contentVersion: row.content_version,
          selectedAnswer: row.selected_answer,
          correctAnswer: row.correct_answer,
          firstSelectedAnswer: row.first_selected_answer,
          isCorrectFirstTry: row.is_correct_first_try,
          isCorrectFinal: row.is_correct_final,
          attemptCount: row.attempt_count,
          usedHint: row.used_hint,
          attemptType: row.attempt_type,
          attemptScope: row.attempt_scope,
          isReplay: row.is_replay,
          completedAt: row.completed_at,
          moduleId: row.module_id,
        })),
      });

      notifyModuleComplete({
        participant_id: participantId,
        module_id: tracking.moduleId,
        character: tracking.character,
        program_code: participant.program_code,
      });
      return {};
    }

    const { participantId } = await resolveParticipantForTracking(tracking);
    const participant =
      tracking.role === 'student' ? resolveStudentParticipant() : resolveAdultParticipant();
    const groupName = 'group_name' in participant ? participant.group_name : undefined;
    const resolvedAttemptType =
      input.attemptType ??
      resolveMissionAttemptType({
        participantId,
        moduleId: tracking.moduleId,
        weekNumber: input.weekNumber ?? null,
      });
    const resolvedAttemptScope = resolveAttemptScope(
      resolvedAttemptType === 'initial' ? 'weekly' : resolvedAttemptType,
    );

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
      answers_json: answersToJson(input.answers, {
        gradeBandUsed: input.gradeBandUsed,
        gradeLevelUsed: input.gradeLevelUsed,
        contentVersionId: input.contentVersionId,
        fileId: input.fileId,
        missionId: input.missionId,
        moduleId: tracking.moduleId,
        attemptType: resolvedAttemptType,
        attemptScope: resolvedAttemptScope,
      }),
    });

    if (input.gradeBandUsed) {
      console.info('[MODULE_SAVE] grade_band_used', {
        module_id: tracking.moduleId,
        grade_band_used: input.gradeBandUsed,
        content_version_id: input.contentVersionId ?? null,
      });
    }

    if (result.source === 'local' && result.message) {
      return { warning: result.message };
    }
    if (!result.success && result.message) {
      return { warning: result.message };
    }

    const attempts = extractQuestionAttempts(input.answers);
    if (attempts && Object.keys(attempts).length > 0) {
      await saveQuestionAttempts({
        config: input.config,
        attempts,
        context: {
          participant_id: participantId,
          program_code: participant.program_code,
          week_number: input.weekNumber ?? null,
          mission_id: input.missionId ?? tracking.moduleId,
          character: tracking.character,
          grade_level: input.gradeLevelUsed ?? null,
          grade_band: input.gradeBandUsed ?? null,
          content_version: input.contentVersionId ?? null,
          module_id: tracking.moduleId,
          attempt_type: resolvedAttemptType,
          attempt_scope: resolvedAttemptScope,
        },
      });
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
