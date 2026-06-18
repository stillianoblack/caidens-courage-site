import type { AdventureModuleRecord } from '../types/adventureModule';
import { parseWeekNumberFromWeekId } from './cmsBadgeArtwork';
import {
  countCompletedMapMissions,
  isMapWeekFullyComplete,
} from './adventureWeekCompletion';
import {
  DEFAULT_WEEK_PROGRESS_PATHS,
  resolveWeekMapMissionsForProgress,
  type WeekProgressOptions,
} from './childProgressStatus';

const WEEK_CHARACTER_KEYS = ['caiden', 'miranda', 'zeke', 'charlie', 'b4'] as const;

export type { WeekProgressOptions };

export function resolveWeekCharacterMissionIds(
  weekNumber: number,
  options?: WeekProgressOptions,
): string[] {
  return resolveWeekMapMissionsForProgress(
    weekNumber,
    options?.cmsModules ?? [],
    options?.paths ?? DEFAULT_WEEK_PROGRESS_PATHS,
  ).map((mission) => mission.targetGameSlug);
}

export function resolveWeekMissionsTotal(
  weekNumber: number,
  options?: WeekProgressOptions,
): number {
  const mapMissions = resolveWeekMapMissionsForProgress(
    weekNumber,
    options?.cmsModules ?? [],
    options?.paths ?? DEFAULT_WEEK_PROGRESS_PATHS,
  );
  return mapMissions.filter((mission) =>
    WEEK_CHARACTER_KEYS.includes(mission.id as (typeof WEEK_CHARACTER_KEYS)[number]),
  ).length;
}

export function countCompletedWeekMissions(
  weekNumber: number,
  completedMissionIds: readonly string[],
  options?: WeekProgressOptions,
): number {
  const mapMissions = resolveWeekMapMissionsForProgress(
    weekNumber,
    options?.cmsModules ?? [],
    options?.paths ?? DEFAULT_WEEK_PROGRESS_PATHS,
  );
  return countCompletedMapMissions(mapMissions, completedMissionIds);
}

export function isWeekFullyComplete(
  weekNumber: number,
  completedMissionIds: readonly string[],
  options?: WeekProgressOptions,
): boolean {
  const mapMissions = resolveWeekMapMissionsForProgress(
    weekNumber,
    options?.cmsModules ?? [],
    options?.paths ?? DEFAULT_WEEK_PROGRESS_PATHS,
  );
  return isMapWeekFullyComplete(mapMissions, completedMissionIds);
}

export function resolveWeekBadgeMissionId(weekId: string): string {
  return `weekly-badge-${weekId}`;
}

export function resolveWeekBadgeUnlockRequirement(weekNumber: number): string {
  return `Complete all Week ${weekNumber} missions to unlock.`;
}

export function resolveMissionsRemainingMessage(completed: number, total: number): string {
  const remaining = Math.max(0, total - completed);
  if (remaining === 0) return 'All missions complete!';
  if (remaining === 1) return '1 mission remaining.';
  return `${remaining} missions remaining.`;
}

export function resolveBadgeUnlockHint(completed: number, total: number, badgeUnlocked: boolean): string {
  if (badgeUnlocked) return 'Week Badge Unlocked!';
  const remaining = Math.max(0, total - completed);
  if (remaining === 0) return `${completed} / ${total} missions complete.`;
  if (remaining === 1) return '1 mission remaining.';
  return `Complete ${remaining} more missions to unlock.`;
}

export function resolveCmsWeekTitle(
  modules: AdventureModuleRecord[],
  weekNumber: number,
): string | null {
  const module = modules.find((row) => row.week_number === weekNumber);
  const title = module?.title?.trim();
  return title || null;
}

export function parseWeekNumberFromPayload(weekId: string, weekNumber?: number): number {
  if (typeof weekNumber === 'number' && weekNumber > 0) return weekNumber;
  return parseWeekNumberFromWeekId(weekId);
}
