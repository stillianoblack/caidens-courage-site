import { normalizeGradeLevelStorage } from '../data/gradeLevelOptions';
import type { GradeBandQuestionMetadata } from '../types/gradeBandContentMetadata';

export type DifficultyTier = 'easy' | 'medium' | 'challenge';

export type GradeDifficultyMix = Record<DifficultyTier, number>;

export function resolveNumericGradeLevel(gradeLevel: string | null | undefined): number | null {
  const normalized = normalizeGradeLevelStorage(gradeLevel);
  if (!normalized) return null;
  if (normalized === 'kindergarten') return 0;
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : null;
}

/** Grade-level mix targets for within-band question selection. */
export function resolveGradeDifficultyMix(gradeLevel: string | null | undefined): GradeDifficultyMix {
  const grade = resolveNumericGradeLevel(gradeLevel);
  if (grade == null) {
    return { easy: 0.35, medium: 0.55, challenge: 0.1 };
  }
  if (grade <= 2) return { easy: 0.6, medium: 0.35, challenge: 0.05 };
  if (grade <= 4) return { easy: 0.25, medium: 0.55, challenge: 0.2 };
  if (grade <= 6) return { easy: 0.15, medium: 0.5, challenge: 0.35 };
  return { easy: 0.1, medium: 0.45, challenge: 0.45 };
}

function metadataDifficultyTier(metadata?: GradeBandQuestionMetadata): DifficultyTier | null {
  switch (metadata?.difficulty) {
    case 'beginner':
      return 'easy';
    case 'intermediate':
      return 'medium';
    case 'advanced':
      return 'challenge';
    default:
      return null;
  }
}

export function classifyQuestionDifficultyTier<T extends { id: string; metadata?: GradeBandQuestionMetadata }>(
  question: T,
  index: number,
  total: number,
): DifficultyTier {
  const fromMetadata = metadataDifficultyTier(question.metadata);
  if (fromMetadata && total <= 1) return fromMetadata;

  if (total <= 1) return 'medium';

  const third = Math.max(1, Math.ceil(total / 3));
  if (index < third) return 'easy';
  if (index < third * 2) return 'medium';
  return 'challenge';
}

function reconcileMixCounts(total: number, mix: GradeDifficultyMix): Record<DifficultyTier, number> {
  let easy = Math.round(total * mix.easy);
  let medium = Math.round(total * mix.medium);
  let challenge = Math.round(total * mix.challenge);
  let sum = easy + medium + challenge;

  while (sum > total) {
    if (challenge > 0) {
      challenge -= 1;
      sum -= 1;
      continue;
    }
    if (medium > 0) {
      medium -= 1;
      sum -= 1;
      continue;
    }
    easy -= 1;
    sum -= 1;
  }

  while (sum < total) {
    medium += 1;
    sum += 1;
  }

  return { easy, medium, challenge };
}

export function selectQuestionsByGradeDifficultyMix<
  T extends { id: string; metadata?: GradeBandQuestionMetadata },
>(questions: readonly T[], gradeLevel: string | null | undefined): T[] {
  if (questions.length <= 1) return [...questions];

  const mix = resolveGradeDifficultyMix(gradeLevel);
  const targetCounts = reconcileMixCounts(questions.length, mix);
  const buckets: Record<DifficultyTier, T[]> = { easy: [], medium: [], challenge: [] };

  questions.forEach((question, index) => {
    buckets[classifyQuestionDifficultyTier(question, index, questions.length)].push(question);
  });

  const selected: T[] = [];
  const tiers: DifficultyTier[] = ['easy', 'medium', 'challenge'];

  for (const tier of tiers) {
    selected.push(...buckets[tier].slice(0, targetCounts[tier]));
  }

  if (selected.length < questions.length) {
    const selectedIds = new Set(selected.map((question) => question.id));
    for (const question of questions) {
      if (selected.length >= questions.length) break;
      if (!selectedIds.has(question.id)) {
        selected.push(question);
        selectedIds.add(question.id);
      }
    }
  }

  return selected.slice(0, questions.length);
}

export function summarizeQuestionDifficultyTiers<
  T extends { id: string; metadata?: GradeBandQuestionMetadata },
>(questions: readonly T[]): DifficultyTier[] {
  return questions.map((question, index) =>
    classifyQuestionDifficultyTier(question, index, questions.length),
  );
}
