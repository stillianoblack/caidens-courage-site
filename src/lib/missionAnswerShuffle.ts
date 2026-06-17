import type { GameQuestion } from '../types/gameAssessment';
import { isChoiceQuestion } from '../types/gameAssessment';

export type MissionAnswerShuffleSeed = {
  childId: string;
  missionId: string;
  questionId: string;
};

/** Deterministic 32-bit hash for stable per-session option order. */
export function stableMissionSeedHash(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stableShuffle<T>(items: readonly T[], seed: number): T[] {
  const copy = [...items];
  const random = mulberry32(seed);
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Shuffle multiple-choice option order per play session without changing copy or correctId.
 * Seed: childId + missionId + questionId — stable for the session, varied across questions.
 */
export function shuffleMissionQuestionChoices(
  question: GameQuestion,
  seed: MissionAnswerShuffleSeed,
): GameQuestion {
  if (!isChoiceQuestion(question)) return question;
  if (question.type === 'true_false' || question.type === 'sequence_order') return question;
  if (!question.options || question.options.length < 2) return question;

  const seedKey = `${seed.childId}::${seed.missionId}::${seed.questionId}`;
  const shuffledOptions = stableShuffle(question.options, stableMissionSeedHash(seedKey));
  return {
    ...question,
    options: shuffledOptions,
  };
}
