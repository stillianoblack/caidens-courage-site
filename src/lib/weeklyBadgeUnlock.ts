import type { AdventureModuleRecord } from '../types/adventureModule';
import { resolveFullyCompletedWeekNumbers } from './adventureWeekCompletion';
import { fetchCompletedMissionIdsByWeek } from './adventureWeekProgress';
import {
  DEFAULT_WEEK_PROGRESS_PATHS,
  fetchClaimedWeeklyWeeksFromBadges,
  logInventoryBadgeDebug,
  type WeekProgressPaths,
} from './childProgressStatus';
import { isWeekFullyComplete } from './weekBadgeProgression';

/** Upper bound when active weekly modules are not supplied. */
export const MAX_TRACKED_WEEKLY_BADGES = 12;

export type WeeklyBadgeEarnedState = {
  completedMissionIds: readonly string[];
  /** Weeks with all map missions complete (mission progress source of truth). */
  earnedWeeklyWeeks: ReadonlySet<number>;
  /** Weeks with a row in player_badges (claimed/unlocked in inventory). */
  claimedWeeklyWeeks?: ReadonlySet<number>;
};

export const EMPTY_WEEKLY_BADGE_EARNED: WeeklyBadgeEarnedState = {
  completedMissionIds: [],
  earnedWeeklyWeeks: new Set(),
};

export type WeeklyBadgeLoadOptions = {
  cmsModules?: readonly AdventureModuleRecord[];
  paths?: WeekProgressPaths;
};

export function deriveEarnedWeeklyWeekNumbers(
  completedMissionIds: readonly string[],
  activeWeekNumbers: readonly number[] = defaultActiveWeekNumbers(),
  options: WeeklyBadgeLoadOptions = {},
): ReadonlySet<number> {
  const earned = new Set<number>();
  const progressOptions = {
    cmsModules: options.cmsModules ?? [],
    paths: options.paths ?? DEFAULT_WEEK_PROGRESS_PATHS,
  };

  for (const weekNumber of activeWeekNumbers) {
    if (weekNumber > 0 && isWeekFullyComplete(weekNumber, completedMissionIds, progressOptions)) {
      earned.add(weekNumber);
    }
  }
  return earned;
}

export function defaultActiveWeekNumbers(maxWeek = MAX_TRACKED_WEEKLY_BADGES): number[] {
  return Array.from({ length: maxWeek }, (_, index) => index + 1);
}

export async function fetchParticipantCompletedMissionIds(
  participantIdInput?: string,
): Promise<string[]> {
  const participantId = participantIdInput?.trim() ?? '';
  if (!participantId) {
    return [];
  }

  const completedByWeek = await fetchCompletedMissionIdsByWeek(participantId);
  return Object.values(completedByWeek).flat();
}

export async function loadWeeklyBadgeEarnedState(
  participantIdInput?: string,
  activeWeekNumbers: readonly number[] = defaultActiveWeekNumbers(),
  options: WeeklyBadgeLoadOptions = {},
): Promise<WeeklyBadgeEarnedState> {
  const participantId = participantIdInput?.trim() ?? '';
  if (!participantId) {
    return EMPTY_WEEKLY_BADGE_EARNED;
  }

  try {
    const completedByWeek = await fetchCompletedMissionIdsByWeek(participantId);
    const completedMissionIds = Object.values(completedByWeek).flat();
    if (completedMissionIds.length === 0) {
      return EMPTY_WEEKLY_BADGE_EARNED;
    }

    const cmsModules = options.cmsModules ?? [];
    const paths = options.paths ?? DEFAULT_WEEK_PROGRESS_PATHS;
    const earnedWeeklyWeeks =
      cmsModules.length > 0
        ? new Set(
            resolveFullyCompletedWeekNumbers({
              completedByWeek,
              cmsModules: [...cmsModules],
              paths,
            }).filter((weekNumber) => activeWeekNumbers.includes(weekNumber)),
          )
        : deriveEarnedWeeklyWeekNumbers(completedMissionIds, activeWeekNumbers, options);

    const claimedWeeklyWeeks = await fetchClaimedWeeklyWeeksFromBadges(participantId);

    for (const weekNumber of Array.from(earnedWeeklyWeeks)) {
      logInventoryBadgeDebug({
        childId: participantId,
        weekNumber,
        weeklyComplete: true,
        badgeUnlocked: true,
        sourceTable: 'player_progress',
        sourceQuery: 'loadWeeklyBadgeEarnedState',
        completedMissionIds: completedByWeek[weekNumber] ?? [],
      });
    }

    return {
      completedMissionIds,
      earnedWeeklyWeeks,
      claimedWeeklyWeeks,
    };
  } catch (err) {
    console.warn('[WEEKLY_BADGE_UNLOCK] Failed to load earned weekly badges', err);
    return EMPTY_WEEKLY_BADGE_EARNED;
  }
}

export function getEarnedWeeklyBadgesFromState(state: WeeklyBadgeEarnedState): number[] {
  return Array.from(state.earnedWeeklyWeeks).sort((left, right) => left - right);
}

/** Earned weekly badge week numbers for a child, derived from mission completion only. */
export async function getEarnedWeeklyBadges(
  childId: string,
  activeWeekNumbers?: readonly number[],
  options?: WeeklyBadgeLoadOptions,
): Promise<number[]> {
  const state = await loadWeeklyBadgeEarnedState(childId, activeWeekNumbers, options);
  return getEarnedWeeklyBadgesFromState(state);
}

export function isWeekBadgeEarnedFromState(
  state: WeeklyBadgeEarnedState,
  weekNumber: number,
): boolean {
  if (!Number.isFinite(weekNumber) || weekNumber < 1) return false;
  return state.earnedWeeklyWeeks.has(weekNumber);
}

export async function isWeekBadgeEarned(
  childId: string,
  weekNumber: number,
  options?: WeeklyBadgeLoadOptions,
): Promise<boolean> {
  const state = await loadWeeklyBadgeEarnedState(childId, defaultActiveWeekNumbers(), options);
  return isWeekBadgeEarnedFromState(state, weekNumber);
}

export function getNextBadgeToEarnFromState(
  state: WeeklyBadgeEarnedState,
  activeWeekNumbers: readonly number[] = defaultActiveWeekNumbers(),
): number | null {
  const sortedWeeks = [...activeWeekNumbers].filter((week) => week > 0).sort((a, b) => a - b);
  for (const weekNumber of sortedWeeks) {
    if (!state.earnedWeeklyWeeks.has(weekNumber)) {
      return weekNumber;
    }
  }
  return null;
}

/** First active week whose badge has not been earned yet. */
export async function getNextBadgeToEarn(
  childId: string,
  activeWeekNumbers?: readonly number[],
  options?: WeeklyBadgeLoadOptions,
): Promise<number | null> {
  const weeks = activeWeekNumbers ?? defaultActiveWeekNumbers();
  const state = await loadWeeklyBadgeEarnedState(childId, weeks, options);
  return getNextBadgeToEarnFromState(state, weeks);
}

export function resolveActiveWeekNumbersFromModules(
  modules: ReadonlyArray<{ week_number: number }>,
): number[] {
  const weeks = modules
    .map((module) => module.week_number)
    .filter((week) => Number.isFinite(week) && week > 0);
  if (weeks.length === 0) {
    return defaultActiveWeekNumbers();
  }
  return Array.from(new Set(weeks)).sort((left, right) => left - right);
}
