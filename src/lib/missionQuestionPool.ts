import type { GradeBandQuestionMetadata } from '../types/gradeBandContentMetadata';
import { MISSION_QUESTIONS_PER_ATTEMPT } from '../config/missionQuestions';

type PoolQuestion = {
  id: string;
  metadata?: GradeBandQuestionMetadata;
};

/**
 * Ensures at least `minimum` unique question IDs are available for selection.
 * When a band has fewer than 5 authored questions, derived supplements reuse
 * scenario content with new IDs so missions can still serve five unique items.
 */
export function ensureMissionQuestionPoolSize<T extends PoolQuestion>(
  questions: readonly T[],
  minimum: number = MISSION_QUESTIONS_PER_ATTEMPT,
): T[] {
  if (questions.length === 0) return [];
  if (questions.length >= minimum) return [...questions];

  const expanded: T[] = [...questions];
  const existingIds = new Set(questions.map((question) => question.id));
  let supplement = 1;

  while (expanded.length < minimum) {
    const source = questions[(expanded.length - questions.length) % questions.length];
    let candidateId = `${source.id}__sup${supplement}`;
    while (existingIds.has(candidateId)) {
      supplement += 1;
      candidateId = `${source.id}__sup${supplement}`;
    }
    existingIds.add(candidateId);
    expanded.push({
      ...source,
      id: candidateId,
      metadata: source.metadata
        ? {
            ...source.metadata,
            contentVersion: `${source.metadata.contentVersion ?? 'adaptive_v2'}_supplement`,
          }
        : undefined,
    });
    supplement += 1;
  }

  return expanded;
}

export function assertUniqueQuestionIds(questions: readonly { id: string }[]): boolean {
  const ids = questions.map((question) => question.id);
  return new Set(ids).size === ids.length;
}
