import type { StudentGradeBand } from '../types/gradeBandContentMetadata';
import { resolveKidGradeBandWithFallback } from './gradeBandContentResolver';
import { getStretchedBand, resolveBaseGradeBand } from './getGradeBand';
import type { ReasoningDepthQuestion } from './reasoningDepthFilter';

export type GradeContentPool<T> = Partial<Record<StudentGradeBand, { questions: readonly T[] }>>;

export type GradeBandSelectionInput = {
  gradeLevel?: string | null;
  gradeBand?: string | null;
  allowStretch?: boolean;
  /** Facilitator preview — bypasses stretch and uses this band directly. */
  previewBand?: StudentGradeBand | null;
};

export type QuestionPoolSelection<T extends ReasoningDepthQuestion> = {
  questions: T[];
  contentBand: StudentGradeBand;
  sourceBand: StudentGradeBand;
  usedStretch: boolean;
};

const LEGACY_DEFAULT_BAND: StudentGradeBand = '2-3';

function resolveQuestionsForBand<T extends ReasoningDepthQuestion>(
  gradeContent: GradeContentPool<T>,
  band: StudentGradeBand,
): { questions: T[]; resolvedBand: StudentGradeBand } {
  const { content, resolvedBand } = resolveKidGradeBandWithFallback(
    gradeContent,
    band,
    LEGACY_DEFAULT_BAND,
  );
  return { questions: [...content.questions], resolvedBand };
}

/**
 * Select the question inventory for a participant profile.
 * Base band comes from grade_level (never auto-stretched).
 * Stretch only swaps to 6-8 when every candidate question passes reasoning-depth checks.
 */
export function selectAdaptiveQuestionPool<T extends ReasoningDepthQuestion>(
  gradeContent: GradeContentPool<T>,
  input: GradeBandSelectionInput,
): QuestionPoolSelection<T> {
  if (input.previewBand) {
    const preview = resolveQuestionsForBand(gradeContent, input.previewBand);
    return {
      questions: preview.questions,
      contentBand: preview.resolvedBand,
      sourceBand: preview.resolvedBand,
      usedStretch: false,
    };
  }

  const baseBand = resolveBaseGradeBand({
    gradeLevel: input.gradeLevel,
    gradeBand: input.gradeBand,
  });

  const basePool = resolveQuestionsForBand(gradeContent, baseBand);

  const allowStretch = Boolean(input.allowStretch);
  const stretchedBand = getStretchedBand(baseBand);

  if (allowStretch && stretchedBand !== baseBand) {
    const stretchPool = resolveQuestionsForBand(gradeContent, stretchedBand);

    if (stretchPool.questions.length > 0) {
      return {
        questions: stretchPool.questions,
        contentBand: stretchPool.resolvedBand,
        sourceBand: stretchPool.resolvedBand,
        usedStretch: true,
      };
    }
  }

  return {
    questions: basePool.questions,
    contentBand: basePool.resolvedBand,
    sourceBand: basePool.resolvedBand,
    usedStretch: false,
  };
}

export function resolveQuestionSourceBand<T extends ReasoningDepthQuestion>(
  gradeContent: GradeContentPool<T>,
  questionId: string,
): StudentGradeBand | null {
  const bands: StudentGradeBand[] = ['K-1', '2-3', '4-5', '6-8'];
  for (const band of bands) {
    const pool = gradeContent[band]?.questions ?? [];
    if (pool.some((question) => question.id === questionId)) {
      return band;
    }
  }
  return null;
}
