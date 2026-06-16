import type { QuestionAttemptMetricRow } from './questionAttemptMetrics';
import { GROWTH_START_WEEK } from '../config/pilotBaselineWeeks';
import { loadLocalModuleResults } from './pilotTrackingLocalStorage';

export type MissionAttemptType = 'initial' | 'replay' | 'challenge';

export function resolveMissionAttemptType(input: {
  participantId?: string | null;
  moduleId: string;
  previouslyCompleted?: boolean;
  weekNumber?: number | null;
  attemptNumber?: number | null;
}): MissionAttemptType {
  if (input.previouslyCompleted) {
    const week = input.weekNumber ?? null;
    if (week != null && week >= GROWTH_START_WEEK) {
      return 'challenge';
    }
    return 'replay';
  }

  const participantId = input.participantId?.trim();
  const moduleId = input.moduleId.trim();
  if (!participantId || !moduleId) {
    return 'initial';
  }

  const priorCount = loadLocalModuleResults().filter(
    (row) => row.participant_id === participantId && row.module_id === moduleId,
  ).length;

  if (priorCount > 0 || (input.attemptNumber ?? 1) > 1) {
    const week = input.weekNumber ?? null;
    if (week != null && week >= GROWTH_START_WEEK) {
      return 'challenge';
    }
    return 'replay';
  }

  return 'initial';
}

export function isReplayAttemptType(
  attemptType: MissionAttemptType | string | null | undefined,
): boolean {
  return attemptType === 'replay' || attemptType === 'challenge';
}

export function filterInitialAttemptRows<T extends { attempt_type?: string | null; is_replay?: boolean }>(
  rows: readonly T[],
): T[] {
  return rows.filter(
    (row) =>
      row.attempt_type !== 'replay' &&
      row.attempt_type !== 'challenge' &&
      row.is_replay !== true,
  );
}

export function filterGrowthAttemptRows(rows: QuestionAttemptMetricRow[]): QuestionAttemptMetricRow[] {
  return rows.filter((row) => (row.week_number ?? 0) >= 2);
}
