import { formatBackLabel } from './portalBreadcrumbNav';
import { getPortalRoute } from './portalGamePaths';
import { isCharacterGameRoute, resolveFamilyBasePath } from './familyPortalNav';

export const WEEKLY_SOURCE_PARAM = 'source';
export const WEEKLY_SOURCE_VALUE = 'weekly';
export const WEEKLY_CHARACTER_SOURCE_VALUE = 'character';
export const WEEKLY_WEEK_PARAM = 'week';
export const WEEKLY_WEEK_TITLE_PARAM = 'weekTitle';

export type WeeklyAdventureRouteContext = {
  source: 'weekly' | 'character' | null;
  week?: number;
  weekTitle?: string;
};

export function readWeeklyAdventureRouteContext(search: string): WeeklyAdventureRouteContext {
  const params = new URLSearchParams(search);
  const sourceParam = params.get(WEEKLY_SOURCE_PARAM);
  const weekRaw = params.get(WEEKLY_WEEK_PARAM);
  const week = weekRaw ? Number.parseInt(weekRaw, 10) : undefined;
  const weekTitle = params.get(WEEKLY_WEEK_TITLE_PARAM) ?? undefined;

  if (sourceParam === WEEKLY_SOURCE_VALUE) {
    return {
      source: 'weekly',
      week: Number.isFinite(week) && week && week > 0 ? week : undefined,
      weekTitle,
    };
  }

  if (sourceParam === WEEKLY_CHARACTER_SOURCE_VALUE) {
    return { source: 'character', week, weekTitle };
  }

  return { source: null, week, weekTitle };
}

export function isWeeklyAdventureSource(search: string): boolean {
  return readWeeklyAdventureRouteContext(search).source === 'weekly';
}

export function isWeeklyAdventureLaunchContext(pathname: string, search: string): boolean {
  return isWeeklyAdventureSource(search) && isCharacterGameRoute(pathname);
}

export function weeklyAdventureWeekAnchor(week: number): string {
  return `week-${week}`;
}

export const WEEKLY_VIEW_PARAM = 'view';
export const WEEKLY_VIEW_EXPLORE_VALUE = 'explore';
export const WEEKLY_VIEW_MISSIONS_VALUE = 'missions';
export const WEEKLY_VIEW_ACTIVITIES_VALUE = 'activities';
export const WEEKLY_VIEW_QUESTS_VALUE = 'quests';
/** @deprecated Use WEEKLY_VIEW_EXPLORE_VALUE */
export const WEEKLY_VIEW_MAP_VALUE = 'map';
/** @deprecated Use WEEKLY_VIEW_MISSIONS_VALUE */
export const WEEKLY_VIEW_LIST_VALUE = 'list';

export function resolveWeeklyAdventuresPanelPath(pathname?: string): string {
  const basePath = resolveFamilyBasePath(pathname ?? '');
  return `${basePath}/weekly-adventures`;
}

export function resolveWeeklyAdventureReturnHref(
  pathname: string,
  week: number,
): string {
  const base = resolveWeeklyAdventuresPanelPath(pathname);
  const params = new URLSearchParams();
  params.set(WEEKLY_VIEW_PARAM, WEEKLY_VIEW_MISSIONS_VALUE);
  return `${base}?${params.toString()}#${weeklyAdventureWeekAnchor(week)}`;
}

export function resolveWeeklyAdventureBackLabel(): string {
  return formatBackLabel('Mission List');
}

export function resolveWeeklyAdventureGameplayBack(
  pathname: string,
  context: WeeklyAdventureRouteContext,
): { label: string; href: string } | null {
  if (context.source !== 'weekly') {
    return null;
  }

  const week = context.week;
  return {
    href: week
      ? resolveWeeklyAdventureReturnHref(pathname, week)
      : resolveWeeklyAdventuresPanelPath(pathname),
    label: resolveWeeklyAdventureBackLabel(),
  };
}

export function appendWeeklyAdventureGameContext(
  href: string,
  input: { week: number; weekTitle: string },
): string {
  if (!href || href === '#' || href.startsWith('http')) {
    return href;
  }

  const [path, existingQuery] = href.split('?');
  const params = new URLSearchParams(existingQuery ?? '');
  params.set(WEEKLY_SOURCE_PARAM, WEEKLY_SOURCE_VALUE);
  params.set(WEEKLY_WEEK_PARAM, String(input.week));
  params.set(WEEKLY_WEEK_TITLE_PARAM, input.weekTitle);
  return `${path}?${params.toString()}`;
}

export function appendCharacterHubGameContext(href: string): string {
  if (!href || href === '#' || href.startsWith('http')) {
    return href;
  }

  const [path, existingQuery] = href.split('?');
  const params = new URLSearchParams(existingQuery ?? '');
  params.set(WEEKLY_SOURCE_PARAM, WEEKLY_CHARACTER_SOURCE_VALUE);
  return `${path}?${params.toString()}`;
}

export function resolveCharacterHubReturnHref(pathname?: string): string {
  return getPortalRoute('characters', pathname);
}

export function resolveCharacterHubGameplayBack(pathname: string): { label: string; href: string } {
  return {
    href: resolveCharacterHubReturnHref(pathname),
    label: formatBackLabel('Character Hub'),
  };
}
