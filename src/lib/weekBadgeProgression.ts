import type { AdventureModuleRecord } from '../types/adventureModule';
import { parseWeekNumberFromWeekId } from './cmsBadgeArtwork';

const WEEK_CHARACTER_KEYS = ['caiden', 'miranda', 'zeke', 'charlie', 'b4'] as const;

export function resolveWeekCharacterMissionIds(weekNumber: number): string[] {
  return WEEK_CHARACTER_KEYS.map((character) => `${character}-week-${weekNumber}`);
}

export function resolveWeekMissionsTotal(_weekNumber: number): number {
  return WEEK_CHARACTER_KEYS.length;
}

export function countCompletedWeekMissions(
  weekNumber: number,
  completedMissionIds: readonly string[],
): number {
  const required = resolveWeekCharacterMissionIds(weekNumber);
  const completed = new Set(completedMissionIds);
  return required.filter((missionId) => completed.has(missionId)).length;
}

export function isWeekFullyComplete(
  weekNumber: number,
  completedMissionIds: readonly string[],
): boolean {
  return countCompletedWeekMissions(weekNumber, completedMissionIds) >= resolveWeekMissionsTotal(weekNumber);
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
