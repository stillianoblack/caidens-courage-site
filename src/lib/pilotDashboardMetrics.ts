import {
  computeBaselineAdminStats,
  feelingsScoreToPct,
  focusScoreToPct,
  readingScoreToPct,
  recordOverallPct,
} from './b4BaselineAdminStats';
import type { B4BaselineCheckRecord } from './b4BaselineCheckStorage';
import { loadAllBaselineResults } from './b4BaselineCheckStorage';
import { PILOT_WEEKLY_JOURNEY } from '../data/pilotDashboardContent';

export type PilotGrowthMetrics = {
  focus: number;
  confidence: number;
  reading: number;
  overall: number;
};

export type PilotActivityItem = {
  id: string;
  type: 'baseline' | 'assessment' | 'download' | 'submission';
  label: string;
  detail: string;
  at: string;
};

export type PilotDashboardMetrics = {
  studentsEnrolled: number;
  baselineChecksCompleted: number;
  currentWeek: number;
  currentWeekTitle: string;
  completionRate: number;
  growth: PilotGrowthMetrics;
  recentActivity: PilotActivityItem[];
};

function getCurrentWeek() {
  return PILOT_WEEKLY_JOURNEY[0];
}

function buildRecentActivity(results: B4BaselineCheckRecord[]): PilotActivityItem[] {
  const items: PilotActivityItem[] = results
    .filter((r) => r.completedAt)
    .map((r) => ({
      id: `${r.anonymousStudentId}-${r.completedAt}`,
      type: 'baseline' as const,
      label: r.nickname ? `${r.nickname} completed Baseline Check` : 'Baseline Check completed',
      detail: r.groupName || r.programCode || 'B-4 Baseline Check',
      at: r.completedAt,
    }))
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return items.slice(0, 8);
}

export function computePilotDashboardMetrics(
  results: B4BaselineCheckRecord[] = loadAllBaselineResults(),
): PilotDashboardMetrics {
  const completed = results.filter(
    (r) => r.completedAt && r.completedModules.length >= 3,
  );
  const uniqueStudentIds = new Set(
    results.map((r) => r.anonymousStudentId).filter(Boolean),
  );
  const studentsEnrolled = uniqueStudentIds.size;
  const baselineChecksCompleted = completed.length;
  const completionRate =
    studentsEnrolled > 0
      ? Math.round((baselineChecksCompleted / studentsEnrolled) * 100)
      : 0;

  const stats = computeBaselineAdminStats(completed);
  const week = getCurrentWeek();

  return {
    studentsEnrolled,
    baselineChecksCompleted,
    currentWeek: week.week,
    currentWeekTitle: week.title,
    completionRate,
    growth: {
      focus: stats.avgFocusPct,
      confidence: stats.avgFeelingsPct,
      reading: stats.avgReadingPct,
      overall: stats.overallAvgPct,
    },
    recentActivity: buildRecentActivity(completed),
  };
}

/** Per-record growth breakdown for results tab detail. */
export function formatGrowthFromRecord(record: B4BaselineCheckRecord) {
  return {
    focus: focusScoreToPct(record.focusMovesScore),
    confidence: feelingsScoreToPct(record.feelingsScore),
    reading: readingScoreToPct(record.readingScore),
    overall: recordOverallPct(record),
  };
}
