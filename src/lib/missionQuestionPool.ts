import type { GradeBandQuestionMetadata } from '../types/gradeBandContentMetadata';
import { MISSION_QUESTIONS_PER_ATTEMPT } from '../config/missionQuestions';

type PoolQuestion = {
  id: string;
  metadata?: GradeBandQuestionMetadata;
};

/**
 * Returns authored questions only — never clones or supplements to reach five.
 * Missions serve min(authored, MISSION_QUESTIONS_PER_ATTEMPT) unique questions.
 *
 * @deprecated Prefer using authored pool length directly via selectQuestionsByGradeDifficultyMix.
 */
export function ensureMissionQuestionPoolSize<T extends PoolQuestion>(
  questions: readonly T[],
  _minimum: number = MISSION_QUESTIONS_PER_ATTEMPT,
): T[] {
  return [...questions];
}

export function assertUniqueQuestionIds(questions: readonly { id: string }[]): boolean {
  const ids = questions.map((question) => question.id);
  return new Set(ids).size === ids.length;
}
