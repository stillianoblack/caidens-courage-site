import type { QuestionAttemptMetricRow } from './questionAttemptMetrics';
import { loadLocalModuleResults } from './pilotTrackingLocalStorage';

export type MissionAttemptType = 'initial' | 'replay';

export function resolveMissionAttemptType(input: {
  participantId?: string | null;
  moduleId: string;
  previouslyCompleted?: boolean;
}): MissionAttemptType {
  if (input.previouslyCompleted) {
    return 'replay';
  }

  const participantId = input.participantId?.trim();
  const moduleId = input.moduleId.trim();
  if (!participantId || !moduleId) {
    return 'initial';
  }

  const prior = loadLocalModuleResults().some(
    (row) => row.participant_id === participantId && row.module_id === moduleId,
  );
  return prior ? 'replay' : 'initial';
}

export function isReplayAttemptType(
  attemptType: MissionAttemptType | string | null | undefined,
): boolean {
  return attemptType === 'replay';
}

export function filterInitialAttemptRows<T extends { attempt_type?: string | null; is_replay?: boolean }>(
  rows: readonly T[],
): T[] {
  return rows.filter((row) => row.attempt_type !== 'replay' && row.is_replay !== true);
}

export function filterGrowthAttemptRows(rows: QuestionAttemptMetricRow[]): QuestionAttemptMetricRow[] {
  return rows.filter((row) => (row.week_number ?? 0) >= 2);
}
