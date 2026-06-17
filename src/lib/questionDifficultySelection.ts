import { MISSION_QUESTIONS_PER_ATTEMPT } from '../config/missionQuestions';
import { normalizeGradeLevelStorage } from '../data/gradeLevelOptions';
import type { GradeBandQuestionMetadata, StudentGradeBand } from '../types/gradeBandContentMetadata';

export type DifficultyTier = 'easy' | 'medium' | 'challenge';

export type GradeDifficultyMix = Record<DifficultyTier, number>;

export type QuestionDifficultySelectionOptions = {
  count?: number;
  gradeBand?: StudentGradeBand | null;
};

export function resolveNumericGradeLevel(gradeLevel: string | null | undefined): number | null {
  const normalized = normalizeGradeLevelStorage(gradeLevel);
  if (!normalized) return null;
  if (normalized === 'kindergarten') return 0;
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : null;
}

/** Fixed per-band difficulty counts for five-question missions. */
export function resolveGradeBandDifficultyCounts(
  gradeBand: StudentGradeBand,
): Record<DifficultyTier, number> {
  switch (gradeBand) {
    case 'K-1':
      return { easy: 3, medium: 2, challenge: 0 };
    case '2-3':
      return { easy: 2, medium: 2, challenge: 1 };
    case '4-5':
      return { easy: 1, medium: 2, challenge: 2 };
    case '6-8':
      return { easy: 0, medium: 1, challenge: 4 };
    default:
      return { easy: 2, medium: 2, challenge: 1 };
  }
}

/** Grade-level mix targets for within-band question selection (legacy ratio fallback). */
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
  if (fromMetadata) {
    return fromMetadata;
  }

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
>(
  questions: readonly T[],
  gradeLevel: string | null | undefined,
  options?: QuestionDifficultySelectionOptions,
): T[] {
  if (questions.length === 0) return [];

  const requestedCount = options?.count ?? MISSION_QUESTIONS_PER_ATTEMPT;
  const targetCount = Math.min(requestedCount, questions.length);
  if (targetCount === 0) return [];

  const sourcePool = [...questions];
  const numericGrade = resolveNumericGradeLevel(gradeLevel);
  const eligible = sourcePool.filter((question, index) => {
    const tier = classifyQuestionDifficultyTier(question, index, sourcePool.length);
    if (numericGrade != null && numericGrade >= 4 && tier === 'easy') {
      const difficulty = question.metadata?.difficulty;
      if (difficulty === 'beginner' || !question.metadata) {
        return !isLikelyRecognitionQuestion(question);
      }
    }
    return true;
  });

  const pool = eligible.length > 0 ? eligible : sourcePool;
  const targetCounts =
    options?.gradeBand && ['K-1', '2-3', '4-5', '6-8'].includes(options.gradeBand)
      ? resolveGradeBandDifficultyCounts(options.gradeBand)
      : reconcileMixCounts(targetCount, resolveGradeDifficultyMix(gradeLevel));

  const buckets: Record<DifficultyTier, T[]> = { easy: [], medium: [], challenge: [] };

  pool.forEach((question, index) => {
    buckets[classifyQuestionDifficultyTier(question, index, pool.length)].push(question);
  });

  const selected: T[] = [];
  const tiers: DifficultyTier[] = ['easy', 'medium', 'challenge'];

  for (const tier of tiers) {
    selected.push(...buckets[tier].slice(0, targetCounts[tier]));
  }

  if (selected.length < targetCount) {
    const selectedIds = new Set(selected.map((question) => question.id));
    for (const question of pool) {
      if (selected.length >= targetCount) break;
      if (!selectedIds.has(question.id)) {
        selected.push(question);
        selectedIds.add(question.id);
      }
    }
  }

  return selected.slice(0, targetCount);
}

function isLikelyRecognitionQuestion<T extends { question?: string; metadata?: GradeBandQuestionMetadata }>(
  question: T,
): boolean {
  const prompt = (question as { question?: string }).question?.trim() ?? '';
  return /^what is |^which is a |^which helps |^define /i.test(prompt);
}

export function summarizeQuestionDifficultyTiers<
  T extends { id: string; metadata?: GradeBandQuestionMetadata },
>(questions: readonly T[]): DifficultyTier[] {
  return questions.map((question, index) =>
    classifyQuestionDifficultyTier(question, index, questions.length),
  );
}
