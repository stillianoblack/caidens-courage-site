import type { AdventureModuleRecord } from '../types/adventureModule';
import { resolveCmsWeekTitle } from './weekBadgeProgression';

export type GameDisplayTitles = {
  weekNumber: number;
  weekTitle: string;
  gameNumber: number;
  gameTitle: string;
  weekHeader: string;
  gameHeader: string;
  documentTitle: string;
};

export function formatWeekHeader(weekNumber: number, weekTitle?: string | null): string {
  const title = weekTitle?.trim();
  return title ? `Week ${weekNumber}: ${title}` : `Week ${weekNumber}`;
}

export function formatGameHeader(gameNumber: number, gameTitle: string): string {
  const title = sanitizeMissionGameTitle(gameTitle, gameNumber);
  return title ? `Game ${gameNumber} • ${title}` : `Game ${gameNumber}`;
}

/** Strip legacy "{Character} Game {N}:" / "Game {N} •" prefixes from stored mission titles. */
export function sanitizeMissionGameTitle(rawTitle: string, weekNumber?: number): string {
  let title = rawTitle.trim();
  if (!title) return title;

  title = title.replace(/^[A-Za-z0-9\-]+\s+Game\s+\d+\s*:\s*/i, '');
  title = title.replace(/^Game\s+\d+\s*•\s*/i, '');
  title = title.replace(/^Game\s+\d+\s*:\s*/i, '');

  if (weekNumber != null && weekNumber > 0) {
    const weekPrefix = new RegExp(`^Week\\s+${weekNumber}\\s*[:•]\\s*`, 'i');
    title = title.replace(weekPrefix, '');
  }

  return title.trim() || rawTitle.trim();
}

export function resolveWeeklyGameDisplayTitles(input: {
  weekNumber: number;
  gameTitle: string;
  modules?: AdventureModuleRecord[];
  weekTitleHint?: string | null;
  /** Weekly rotation uses week number as game number (Week 2 → Game 2). */
  gameNumber?: number;
}): GameDisplayTitles {
  const cmsTitle = input.modules
    ? resolveCmsWeekTitle(input.modules, input.weekNumber)
    : null;
  const weekTitle = cmsTitle ?? input.weekTitleHint?.trim() ?? null;
  const gameNumber = input.gameNumber ?? input.weekNumber;
  const weekHeader = formatWeekHeader(input.weekNumber, weekTitle);
  const gameHeader = formatGameHeader(gameNumber, input.gameTitle);

  return {
    weekNumber: input.weekNumber,
    weekTitle: weekTitle ?? `Week ${input.weekNumber}`,
    gameNumber,
    gameTitle: input.gameTitle.trim(),
    weekHeader,
    gameHeader,
    documentTitle: `${gameHeader} | ${weekHeader}`,
  };
}

/** Trail / map card title for a weekly character mission. */
export function resolveTrailMissionCardTitle(weekNumber: number, missionTitle: string): string {
  return formatGameHeader(weekNumber, missionTitle);
}
