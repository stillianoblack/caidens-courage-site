import { BASELINE_GATE_MESSAGE } from './launchWeeklyMission';

export type WeeklyAdventureProgressSignal = {
  completedWeekNumbers: readonly number[];
  completedWeekCount: number;
  maxWeekWithAnyProgress: number;
  currentWeek: number;
  hasAnyMissionCompletion: boolean;
};

export function resolveWeeklyAdventureProgressSignal(input: {
  completedByWeek: Record<number, readonly string[]>;
  completedWeekNumbers?: readonly number[];
  requestedWeek?: number | null;
}): WeeklyAdventureProgressSignal {
  const completedWeekNumbers = input.completedWeekNumbers ?? [];
  const weeksWithProgress = Object.entries(input.completedByWeek)
    .filter(([, ids]) => (ids?.length ?? 0) > 0)
    .map(([week]) => Number(week))
    .filter((week) => Number.isFinite(week) && week > 0);

  const maxWeekWithAnyProgress = weeksWithProgress.length > 0 ? Math.max(...weeksWithProgress) : 0;
  const maxCompletedWeek =
    completedWeekNumbers.length > 0 ? Math.max(...completedWeekNumbers) : 0;

  let currentWeek = 1;
  if (maxCompletedWeek > 0) {
    currentWeek = Math.max(currentWeek, maxCompletedWeek + 1);
  }
  if (maxWeekWithAnyProgress > 0) {
    currentWeek = Math.max(currentWeek, maxWeekWithAnyProgress);
  }
  if (input.requestedWeek && input.requestedWeek > 0) {
    currentWeek = Math.max(currentWeek, input.requestedWeek);
  }

  return {
    completedWeekNumbers,
    completedWeekCount: completedWeekNumbers.length,
    maxWeekWithAnyProgress,
    currentWeek,
    hasAnyMissionCompletion: weeksWithProgress.length > 0,
  };
}

/** True when Weekly Adventures should stay on the new-user B-4 baseline lock state. */
export function resolveWeeklyAdventureBaselineLocked(input: {
  hasActiveChild: boolean;
  baselineComplete: boolean;
  b4CheckInComplete?: boolean;
  isAdminPreview?: boolean;
  completedWeekCount: number;
  currentWeek: number;
  hasAnyMissionCompletion: boolean;
  adventureProgressLoading?: boolean;
}): boolean {
  if (!input.hasActiveChild) return true;
  if (input.isAdminPreview) return false;
  if (input.adventureProgressLoading) return false;
  if (input.baselineComplete || input.b4CheckInComplete) return false;
  if (input.completedWeekCount >= 1) return false;
  if (input.currentWeek > 1) return false;
  if (input.hasAnyMissionCompletion) return false;
  return true;
}

export function resolveWeeklyAdventurePlayerHudWeekLabel(input: {
  weekNumber: number;
  baselineLocked: boolean;
}): string {
  const monthSlot = ((Math.max(1, input.weekNumber) - 1) % 4) + 1;
  if (input.baselineLocked) {
    return `Week ${monthSlot}`;
  }
  return `Week ${monthSlot} • Continue your Focus Flame adventure.`;
}

export function resolveWeeklyAdventurePlayerHudGateMessage(input: {
  baselineLocked: boolean;
}): string | null {
  return input.baselineLocked ? BASELINE_GATE_MESSAGE : null;
}
