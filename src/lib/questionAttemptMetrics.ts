import type { QuestionAttemptRecord } from '../types/questionInteraction';

/** Row shape for analytics and dashboards. */
export type QuestionAttemptMetricRow = {
  participant_id: string;
  program_code: string;
  week_number?: number | null;
  mission_id: string;
  character?: string | null;
  question_id: string;
  grade_level?: string | null;
  grade_band?: string | null;
  content_version?: string | null;
  skill_tags?: string[];
  is_correct_first_try: boolean;
  is_correct_final: boolean;
  used_hint: boolean;
  attempt_count: number;
  completed_at: string;
};

export type QuestionAttemptMetrics = {
  questions_attempted: number;
  questions_correct_first_try: number;
  questions_correct_final: number;
  final_accuracy: number;
  first_attempt_accuracy: number;
  hinted_accuracy: number | null;
  unhinted_accuracy: number | null;
  improved_after_support: number;
  needs_more_practice: number;
};

export type GrowthBucket = {
  key: string;
  questions_attempted: number;
  first_attempt_accuracy: number;
  final_accuracy: number;
};

function safeRate(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 1000;
}

export function computeQuestionAttemptMetrics(rows: QuestionAttemptMetricRow[]): QuestionAttemptMetrics {
  const questions_attempted = rows.length;
  const questions_correct_first_try = rows.filter((row) => row.is_correct_first_try).length;
  const questions_correct_final = rows.filter((row) => row.is_correct_final).length;

  const hinted = rows.filter((row) => row.used_hint);
  const unhinted = rows.filter((row) => !row.used_hint);

  const improved_after_support = rows.filter(
    (row) => !row.is_correct_first_try && row.is_correct_final,
  ).length;

  const needs_more_practice = rows.filter(
    (row) => !row.is_correct_final,
  ).length;

  return {
    questions_attempted,
    questions_correct_first_try,
    questions_correct_final,
    final_accuracy: safeRate(questions_correct_final, questions_attempted),
    first_attempt_accuracy: safeRate(questions_correct_first_try, questions_attempted),
    hinted_accuracy:
      hinted.length > 0
        ? safeRate(
            hinted.filter((row) => row.is_correct_final).length,
            hinted.length,
          )
        : null,
    unhinted_accuracy:
      unhinted.length > 0
        ? safeRate(
            unhinted.filter((row) => row.is_correct_final).length,
            unhinted.length,
          )
        : null,
    improved_after_support,
    needs_more_practice,
  };
}

export function growthByWeek(rows: QuestionAttemptMetricRow[]): GrowthBucket[] {
  const buckets = new Map<string, QuestionAttemptMetricRow[]>();
  for (const row of rows) {
    const key = row.week_number != null ? `week-${row.week_number}` : 'unknown-week';
    const list = buckets.get(key) ?? [];
    list.push(row);
    buckets.set(key, list);
  }
  return Array.from(buckets.entries())
    .map(([key, group]) => {
      const metrics = computeQuestionAttemptMetrics(group);
      return {
        key,
        questions_attempted: metrics.questions_attempted,
        first_attempt_accuracy: metrics.first_attempt_accuracy,
        final_accuracy: metrics.final_accuracy,
      };
    })
    .sort((left, right) => left.key.localeCompare(right.key));
}

export function growthByCharacter(rows: QuestionAttemptMetricRow[]): GrowthBucket[] {
  const buckets = new Map<string, QuestionAttemptMetricRow[]>();
  for (const row of rows) {
    const key = row.character?.trim() || 'unknown';
    const list = buckets.get(key) ?? [];
    list.push(row);
    buckets.set(key, list);
  }
  return Array.from(buckets.entries()).map(([key, group]) => {
    const metrics = computeQuestionAttemptMetrics(group);
    return {
      key,
      questions_attempted: metrics.questions_attempted,
      first_attempt_accuracy: metrics.first_attempt_accuracy,
      final_accuracy: metrics.final_accuracy,
    };
  });
}

export function growthBySkill(rows: QuestionAttemptMetricRow[]): GrowthBucket[] {
  const buckets = new Map<string, QuestionAttemptMetricRow[]>();
  for (const row of rows) {
    const tags = row.skill_tags?.length ? row.skill_tags : ['General SEL'];
    for (const tag of tags) {
      const list = buckets.get(tag) ?? [];
      list.push(row);
      buckets.set(tag, list);
    }
  }
  return Array.from(buckets.entries()).map(([key, group]) => {
    const metrics = computeQuestionAttemptMetrics(group);
    return {
      key,
      questions_attempted: metrics.questions_attempted,
      first_attempt_accuracy: metrics.first_attempt_accuracy,
      final_accuracy: metrics.final_accuracy,
    };
  });
}

export type ParentInsightLabels = {
  completionLabel: string;
  firstTryLabel: string;
  improvedLabel: string;
  practiceLabel: string;
  growthLabel: string;
};

export function buildParentAttemptInsightLabels(metrics: QuestionAttemptMetrics): ParentInsightLabels {
  const firstTryPct = Math.round(metrics.first_attempt_accuracy * 100);
  const finalPct = Math.round(metrics.final_accuracy * 100);

  return {
    completionLabel:
      finalPct >= 80
        ? 'Great mission completion — keep building courage!'
        : 'Mission complete — every try builds focus skills.',
    firstTryLabel: `First-try accuracy: ${firstTryPct}% (private learning signal)`,
    improvedLabel:
      metrics.improved_after_support > 0
        ? `Improved after support on ${metrics.improved_after_support} question${metrics.improved_after_support === 1 ? '' : 's'}`
        : 'Improved after support: steady first-try focus',
    practiceLabel:
      metrics.needs_more_practice > 0
        ? `Needs more practice: ${metrics.needs_more_practice} question${metrics.needs_more_practice === 1 ? '' : 's'} to revisit`
        : 'Needs more practice: none flagged this mission',
    growthLabel: 'Growth over time tracks first-try accuracy week by week',
  };
}

export function questionAttemptRecordToMetricRow(
  record: QuestionAttemptRecord,
  context: {
    participant_id: string;
    program_code: string;
    week_number?: number | null;
    mission_id: string;
    character?: string | null;
    grade_level?: string | null;
    grade_band?: string | null;
    content_version?: string | null;
    skill_tags?: string[];
  },
): QuestionAttemptMetricRow {
  return {
    participant_id: context.participant_id,
    program_code: context.program_code,
    week_number: context.week_number ?? null,
    mission_id: context.mission_id,
    character: context.character ?? null,
    question_id: record.questionId,
    grade_level: context.grade_level ?? null,
    grade_band: context.grade_band ?? null,
    content_version: context.content_version ?? null,
    skill_tags: context.skill_tags,
    is_correct_first_try: record.is_correct_first_try,
    is_correct_final: record.is_correct_final,
    used_hint: record.hints_used_count > 0,
    attempt_count: record.attempts_count,
    completed_at: record.completed_at,
  };
}
