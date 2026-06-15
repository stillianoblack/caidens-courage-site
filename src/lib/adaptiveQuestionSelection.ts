import {
  resolveGradeDifficultyMix,
  selectQuestionsByGradeDifficultyMix,
  summarizeQuestionDifficultyTiers,
} from './questionDifficultySelection';
import type { GradeBandQuestionMetadata } from '../types/gradeBandContentMetadata';
import type { StudentGradeBand } from '../types/gradeBandContentMetadata';
import {
  selectAdaptiveQuestionPool,
  type GradeBandSelectionInput,
  type GradeContentPool,
  type QuestionPoolSelection,
} from './gradeBandQuestionSelection';
import { applyStagingToQuestions } from './stagingQuestionOverrides';
import { MISSION_QUESTIONS_PER_ATTEMPT } from '../config/missionQuestions';
import { assertUniqueQuestionIds } from './missionQuestionPool';

type AdaptiveQuestion = {
  id: string;
  question: string;
  options: readonly { id: string; label: string }[];
  scenarioText?: string;
  metadata?: GradeBandQuestionMetadata;
};

export type AdaptiveQuestionSelectionContext = {
  missionId: string;
  participantId?: string | null;
  activeChildName?: string | null;
  gradeLevel?: string | null;
  gradeBand?: string | null;
  allowStretch?: boolean;
  previewBand?: string | null;
  adventureWeek?: number | null;
};

export type AdaptiveQuestionSelectionResult<T extends AdaptiveQuestion> = {
  questions: T[];
  contentBand: string;
  sourceBand: string;
  usedStretch: boolean;
};

export function selectQuestionsForGradeProfile<T extends AdaptiveQuestion>(
  gradeContent: GradeContentPool<T>,
  ctx: AdaptiveQuestionSelectionContext,
): QuestionPoolSelection<T> {
  const input: GradeBandSelectionInput = {
    gradeLevel: ctx.gradeLevel,
    gradeBand: ctx.gradeBand,
    allowStretch: ctx.allowStretch,
    previewBand:
      ctx.previewBand && ['K-1', '2-3', '4-5', '6-8'].includes(ctx.previewBand)
        ? (ctx.previewBand as GradeBandSelectionInput['previewBand'])
        : null,
  };

  return selectAdaptiveQuestionPool(gradeContent, input);
}

export function finalizeAdaptiveQuestions<T extends AdaptiveQuestion>(
  gradeContent: GradeContentPool<T>,
  ctx: AdaptiveQuestionSelectionContext,
  options?: { applyStaging?: boolean },
): AdaptiveQuestionSelectionResult<T> {
  const pool = selectQuestionsForGradeProfile(gradeContent, ctx);
  const staged =
    options?.applyStaging === false
      ? pool.questions
      : (applyStagingToQuestions(
          pool.questions as unknown as Parameters<typeof applyStagingToQuestions>[0],
        ) as unknown as T[]);
  const contentBand = pool.contentBand as StudentGradeBand;
  const selected = selectQuestionsByGradeDifficultyMix(staged, ctx.gradeLevel, {
    count: MISSION_QUESTIONS_PER_ATTEMPT,
    gradeBand: contentBand,
  });
  const questions = selected.slice(0, MISSION_QUESTIONS_PER_ATTEMPT);

  if (process.env.NODE_ENV === 'development' && !assertUniqueQuestionIds(questions)) {
    console.warn('[QUESTION_DIFFICULTY_AUDIT] duplicate question IDs in mission selection', {
      missionId: ctx.missionId,
      questionIds: questions.map((question) => question.id),
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[QUESTION_DIFFICULTY_AUDIT]', {
      activeChildId: ctx.participantId ?? null,
      activeChildName: ctx.activeChildName ?? null,
      gradeLevel: ctx.gradeLevel ?? null,
      gradeBand: ctx.gradeBand ?? null,
      allowStretch: ctx.allowStretch ?? false,
      missionId: ctx.missionId,
      adventureWeek: ctx.adventureWeek ?? null,
      contentBand: pool.contentBand,
      sourceBand: pool.sourceBand,
      usedStretch: pool.usedStretch,
      questionCount: questions.length,
      selectedDifficulty: resolveGradeDifficultyMix(ctx.gradeLevel),
      questionIds: questions.map((question) => question.id),
      questionLevels: summarizeQuestionDifficultyTiers(questions),
    });
  }

  return {
    questions,
    contentBand: pool.contentBand,
    sourceBand: pool.sourceBand,
    usedStretch: pool.usedStretch,
  };
}
