import type { B4BaselineCheckRecord } from './b4BaselineCheckStorage';

const FEELINGS_MAX = 50;
const READING_MAX = 5;
const FOCUS_MAX = 5;

export type BaselineAdminStats = {
  totalCompleted: number;
  avgFeelingsPct: number;
  avgReadingPct: number;
  avgFocusPct: number;
  overallAvgPct: number;
};

export function feelingsScoreToPct(score: number): number {
  return (score / FEELINGS_MAX) * 100;
}

export function readingScoreToPct(score: number): number {
  return (score / READING_MAX) * 100;
}

export function focusScoreToPct(score: number): number {
  return (score / FOCUS_MAX) * 100;
}

export function recordOverallPct(record: B4BaselineCheckRecord): number {
  const feelings = feelingsScoreToPct(record.feelingsScore);
  const reading = readingScoreToPct(record.readingScore);
  const focus = focusScoreToPct(record.focusMovesScore);
  return (feelings + reading + focus) / 3;
}

export function computeBaselineAdminStats(results: B4BaselineCheckRecord[]): BaselineAdminStats {
  if (results.length === 0) {
    return {
      totalCompleted: 0,
      avgFeelingsPct: 0,
      avgReadingPct: 0,
      avgFocusPct: 0,
      overallAvgPct: 0,
    };
  }

  const totals = results.reduce(
    (acc, record) => {
      acc.feelings += feelingsScoreToPct(record.feelingsScore);
      acc.reading += readingScoreToPct(record.readingScore);
      acc.focus += focusScoreToPct(record.focusMovesScore);
      acc.overall += recordOverallPct(record);
      return acc;
    },
    { feelings: 0, reading: 0, focus: 0, overall: 0 },
  );

  const count = results.length;
  const avgFeelingsPct = totals.feelings / count;
  const avgReadingPct = totals.reading / count;
  const avgFocusPct = totals.focus / count;
  const overallAvgPct = (avgFeelingsPct + avgReadingPct + avgFocusPct) / 3;

  return {
    totalCompleted: count,
    avgFeelingsPct,
    avgReadingPct,
    avgFocusPct,
    overallAvgPct,
  };
}

export function formatAdminPct(value: number): string {
  if (!Number.isFinite(value)) return '0%';
  return `${Math.round(value)}%`;
}

/**
 * TODO: Add post-program comparison when Final Growth Check is created.
 * When final assessment records exist, compute before/after/growth per category.
 */
export type BaselineComparisonRow = {
  label: string;
  beforePct: number;
  afterPct: number | null;
  growthPct: number | null;
};

export function buildBaselineComparisonRows(stats: BaselineAdminStats): BaselineComparisonRow[] {
  return [
    { label: 'Feelings', beforePct: stats.avgFeelingsPct, afterPct: null, growthPct: null },
    { label: 'Reading', beforePct: stats.avgReadingPct, afterPct: null, growthPct: null },
    { label: 'Focus Moves', beforePct: stats.avgFocusPct, afterPct: null, growthPct: null },
    { label: 'Overall', beforePct: stats.overallAvgPct, afterPct: null, growthPct: null },
  ];
}
