import {
  resolveGradeDifficultyMix,
  selectQuestionsByGradeDifficultyMix,
  summarizeQuestionDifficultyTiers,
} from './questionDifficultySelection';
import type { GradeBandQuestionMetadata } from '../types/gradeBandContentMetadata';

type AdaptiveQuestion = {
  id: string;
  metadata?: GradeBandQuestionMetadata;
};

export type AdaptiveQuestionSelectionContext = {
  missionId: string;
  participantId?: string | null;
  activeChildName?: string | null;
  gradeLevel?: string | null;
  gradeBand?: string | null;
  adventureWeek?: number | null;
};

export function finalizeAdaptiveQuestions<T extends AdaptiveQuestion>(
  questions: readonly T[],
  ctx: AdaptiveQuestionSelectionContext,
): T[] {
  const selected = selectQuestionsByGradeDifficultyMix(questions, ctx.gradeLevel);

  if (process.env.NODE_ENV === 'development') {
    console.log('[QUESTION_DIFFICULTY_AUDIT]', {
      activeChildId: ctx.participantId ?? null,
      activeChildName: ctx.activeChildName ?? null,
      gradeLevel: ctx.gradeLevel ?? null,
      gradeBand: ctx.gradeBand ?? null,
      missionId: ctx.missionId,
      adventureWeek: ctx.adventureWeek ?? null,
      selectedDifficulty: resolveGradeDifficultyMix(ctx.gradeLevel),
      questionIds: selected.map((question) => question.id),
      questionLevels: summarizeQuestionDifficultyTiers(selected),
    });
  }

  return selected;
}
