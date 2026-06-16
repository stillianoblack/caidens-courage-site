import { isReplayAttemptType } from '../canonicalAttemptRules';
import type { QuestionAttemptMetricRow } from '../questionAttemptMetrics';

export const MIN_CANONICAL_ATTEMPTS_FOR_CLASSIFICATION = 10;

export const NOT_ENOUGH_DATA_MESSAGE =
  'Needs at least 10 student attempts before difficulty is classified.';

export type QuestionHealthFlag =
  | 'TOO_EASY'
  | 'TOO_HARD'
  | 'CONFUSING'
  | 'FAST_GUESSES'
  | 'SLOW_CONFUSION'
  | 'HIGH_HINT_USAGE';

export type QuestionHealthStatus =
  | 'NOT_ENOUGH_DATA'
  | 'TOO_EASY'
  | 'TOO_HARD'
  | 'CONFUSING'
  | 'HEALTHY';

export type QuestionAnalyticsRow = {
  question_id: string;
  character: string;
  week_number: number | null;
  mission_id: string;
  grade_band: string;
  difficulty: string;
  skill: string;
  attempts: number;
  canonical_attempts: number;
  first_try_correct_count: number;
  final_correct_count: number;
  first_try_accuracy: number;
  final_accuracy: number;
  most_selected_wrong_answer: string | null;
  average_response_time_ms: number | null;
  hint_used_count: number;
  replay_count: number;
  challenge_count: number;
  health_score: number;
  health_status: QuestionHealthStatus;
  health_label: string;
  health_message: string | null;
  health_flags: QuestionHealthFlag[];
};

export type QuestionAnalyticsEnrichment = Partial<
  Pick<QuestionAnalyticsRow, 'character' | 'week_number' | 'mission_id' | 'grade_band' | 'difficulty' | 'skill'>
>;

export type QuestionAnalyticsSummary = {
  generatedAt: string;
  totalQuestionsTracked: number;
  totalAttempts: number;
  averageHealthScore: number;
  notEnoughData: number;
  tooEasy: number;
  tooHard: number;
  confusing: number;
  healthy: number;
  needsRewrite: number;
  rows: QuestionAnalyticsRow[];
};

export type QuestionAttemptAnalyticsRow = QuestionAttemptMetricRow & {
  selected_answer?: string | null;
  response_time_ms?: number | null;
  attempt_scope?: string | null;
};

const HINT_USAGE_THRESHOLD = 0.35;
const FAST_GUESS_MS = 3500;
const SLOW_INCORRECT_MS = 45000;

function safeRate(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

/** Canonical attempts only — excludes replay/challenge/test/practice unless explicitly canonical. */
export function isValidCanonicalQuestionAttempt(row: QuestionAttemptAnalyticsRow): boolean {
  const scope = row.attempt_scope?.trim().toLowerCase();
  if (scope === 'canonical') return true;
  if (scope === 'practice' || scope === 'excluded_from_growth') return false;

  const attemptType = row.attempt_type?.trim().toLowerCase() ?? 'initial';
  if (attemptType === 'test' || attemptType === 'practice') return false;
  if (attemptType === 'replay' || attemptType === 'challenge') return false;
  if (isReplayAttemptType(row.attempt_type, row.is_replay)) return false;

  return true;
}

function computeHealthScore(flags: QuestionHealthFlag[], attempts: number): number {
  if (attempts === 0) return 50;
  let score = 100;
  for (const flag of flags) {
    switch (flag) {
      case 'TOO_EASY':
        score -= 18;
        break;
      case 'TOO_HARD':
        score -= 22;
        break;
      case 'CONFUSING':
        score -= 20;
        break;
      case 'FAST_GUESSES':
        score -= 10;
        break;
      case 'SLOW_CONFUSION':
        score -= 12;
        break;
      case 'HIGH_HINT_USAGE':
        score -= 8;
        break;
      default:
        break;
    }
  }
  return Math.max(0, Math.min(100, score));
}

function classifyQuestionHealth(input: {
  canonicalAttempts: number;
  firstTryAccuracy: number;
  dominantWrongShare: number | null;
  secondaryFlags: QuestionHealthFlag[];
}): {
  status: QuestionHealthStatus;
  label: string;
  message: string | null;
  flags: QuestionHealthFlag[];
} {
  if (input.canonicalAttempts < MIN_CANONICAL_ATTEMPTS_FOR_CLASSIFICATION) {
    return {
      status: 'NOT_ENOUGH_DATA',
      label: 'Not enough data',
      message: NOT_ENOUGH_DATA_MESSAGE,
      flags: [],
    };
  }

  const flags: QuestionHealthFlag[] = [...input.secondaryFlags];

  if (input.firstTryAccuracy > 90) {
    return {
      status: 'TOO_EASY',
      label: 'Too easy',
      message: null,
      flags: ['TOO_EASY', ...flags],
    };
  }

  if (input.firstTryAccuracy < 25) {
    return {
      status: 'TOO_HARD',
      label: 'Too hard',
      message: null,
      flags: ['TOO_HARD', ...flags],
    };
  }

  if (input.dominantWrongShare != null && input.dominantWrongShare > 0.45) {
    return {
      status: 'CONFUSING',
      label: 'Confusing',
      message: null,
      flags: ['CONFUSING', ...flags],
    };
  }

  return {
    status: 'HEALTHY',
    label: 'Healthy',
    message: null,
    flags,
  };
}

function aggregateAttempts(
  rows: QuestionAttemptAnalyticsRow[],
  enrichmentByQuestionId: Record<string, QuestionAnalyticsEnrichment>,
): QuestionAnalyticsRow[] {
  const byQuestion = new Map<string, QuestionAttemptAnalyticsRow[]>();
  for (const row of rows) {
    const list = byQuestion.get(row.question_id) ?? [];
    list.push(row);
    byQuestion.set(row.question_id, list);
  }

  const analytics: QuestionAnalyticsRow[] = [];

  for (const [questionId, attempts] of Array.from(byQuestion.entries())) {
    const canonical = attempts.filter(isValidCanonicalQuestionAttempt);
    const scoped = canonical;
    const enrich = enrichmentByQuestionId[questionId] ?? {};

    const firstTryCorrect = scoped.filter((row) => row.is_correct_first_try).length;
    const finalCorrect = scoped.filter((row) => row.is_correct_final).length;
    const firstTryAccuracy = safeRate(firstTryCorrect, scoped.length);
    const finalAccuracy = safeRate(finalCorrect, scoped.length);
    const hintUsed = scoped.filter((row) => row.used_hint).length;

    const replayCount = attempts.filter(
      (row) => row.attempt_type === 'replay' || row.is_replay === true,
    ).length;
    const challengeCount = attempts.filter((row) => row.attempt_type === 'challenge').length;

    const secondaryFlags: QuestionHealthFlag[] = [];

    if (
      scoped.length >= MIN_CANONICAL_ATTEMPTS_FOR_CLASSIFICATION &&
      hintUsed / scoped.length > HINT_USAGE_THRESHOLD
    ) {
      secondaryFlags.push('HIGH_HINT_USAGE');
    }

    const wrongByAnswer = new Map<string, number>();
    for (const row of scoped.filter((r) => !r.is_correct_first_try)) {
      const answer = row.selected_answer?.trim();
      if (!answer) continue;
      wrongByAnswer.set(answer, (wrongByAnswer.get(answer) ?? 0) + 1);
    }
    const dominantWrong = Array.from(wrongByAnswer.entries()).sort((a, b) => b[1] - a[1])[0];
    const dominantWrongShare =
      dominantWrong && scoped.length > 0 ? dominantWrong[1] / scoped.length : null;

    const responseTimes = scoped
      .map((row) => row.response_time_ms)
      .filter((value): value is number => typeof value === 'number' && value > 0);
    const avgResponseTime =
      responseTimes.length > 0
        ? Math.round(responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length)
        : null;

    if (
      scoped.length >= MIN_CANONICAL_ATTEMPTS_FOR_CLASSIFICATION &&
      avgResponseTime != null &&
      avgResponseTime < FAST_GUESS_MS &&
      firstTryAccuracy > 85
    ) {
      secondaryFlags.push('FAST_GUESSES');
    }
    if (
      scoped.length >= MIN_CANONICAL_ATTEMPTS_FOR_CLASSIFICATION &&
      avgResponseTime != null &&
      avgResponseTime > SLOW_INCORRECT_MS &&
      finalAccuracy < 50
    ) {
      secondaryFlags.push('SLOW_CONFUSION');
    }

    const classification = classifyQuestionHealth({
      canonicalAttempts: scoped.length,
      firstTryAccuracy,
      dominantWrongShare,
      secondaryFlags,
    });

    analytics.push({
      question_id: questionId,
      character: enrich.character ?? attempts[0]?.character ?? 'unknown',
      week_number: enrich.week_number ?? attempts[0]?.week_number ?? null,
      mission_id: enrich.mission_id ?? attempts[0]?.mission_id ?? 'unknown',
      grade_band: enrich.grade_band ?? attempts[0]?.grade_band ?? 'unknown',
      difficulty: enrich.difficulty ?? 'unknown',
      skill: enrich.skill ?? attempts[0]?.skill_tags?.[0] ?? 'Other',
      attempts: scoped.length,
      canonical_attempts: scoped.length,
      first_try_correct_count: firstTryCorrect,
      final_correct_count: finalCorrect,
      first_try_accuracy: firstTryAccuracy,
      final_accuracy: finalAccuracy,
      most_selected_wrong_answer: dominantWrong?.[0] ?? null,
      average_response_time_ms: avgResponseTime,
      hint_used_count: hintUsed,
      replay_count: replayCount,
      challenge_count: challengeCount,
      health_score: computeHealthScore(classification.flags, scoped.length),
      health_status: classification.status,
      health_label: classification.label,
      health_message: classification.message,
      health_flags: classification.flags,
    });
  }

  return analytics.sort((a, b) => a.health_score - b.health_score);
}

export function getQuestionAnalytics(
  attemptRows: QuestionAttemptAnalyticsRow[],
  enrichmentByQuestionId: Record<string, QuestionAnalyticsEnrichment> = {},
): QuestionAnalyticsSummary {
  const rows = aggregateAttempts(attemptRows, enrichmentByQuestionId);
  const classifiedRows = rows.filter((row) => row.health_status !== 'NOT_ENOUGH_DATA');
  const averageHealthScore =
    classifiedRows.length > 0
      ? Math.round(
          classifiedRows.reduce((sum, row) => sum + row.health_score, 0) / classifiedRows.length,
        )
      : 0;

  return {
    generatedAt: new Date().toISOString(),
    totalQuestionsTracked: rows.length,
    totalAttempts: attemptRows.length,
    averageHealthScore,
    notEnoughData: rows.filter((row) => row.health_status === 'NOT_ENOUGH_DATA').length,
    tooEasy: rows.filter((row) => row.health_status === 'TOO_EASY').length,
    tooHard: rows.filter((row) => row.health_status === 'TOO_HARD').length,
    confusing: rows.filter((row) => row.health_status === 'CONFUSING').length,
    healthy: rows.filter((row) => row.health_status === 'HEALTHY').length,
    needsRewrite: classifiedRows.filter(
      (row) => row.health_score < 60 || row.health_flags.length >= 2,
    ).length,
    rows,
  };
}
