import { CAIDEN_QUEST_1_ID } from '../data/caiden/questAdaptiveWhatComesFirst';
import { MIRANDA_MISSING_SCHEDULE_ID } from '../data/miranda';
import { CHARLIE_MISSION_1_ID } from '../data/charlie/missions/mission1MysteryFootprints';
import { ZEKE_MISSION_1_ID } from '../data/zeke/missions/mission1NewTable';
import { appendWeeklyAdventureGameContext } from './weeklyAdventureRouteContext';
import {
  buildWeeklyCharacterMissionHref,
  resolveWeeklyCharacterMissionId,
} from './weeklyCharacterMissions';
import { WEEKLY_CHARACTER_MISSION_LISTS } from './weeklyCharacterMissionLists';

type RouteBuilder = (kidsBasePath: string, week: number, weekTitle: string) => string | null;

/**
 * Week 1 hotspot slugs from the original Courage in the Dark map.
 * For week 2+, resolve the correct mission id from the weekly rotation.
 */
const COURAGE_MAP_SLUG_ROUTES: Record<string, RouteBuilder> = {
  'caiden-courage-in-the-dark': (base, week, weekTitle) =>
    buildCharacterHref('caiden', week, base, weekTitle),
  'miranda-mystery': (base, week, weekTitle) => buildCharacterHref('miranda', week, base, weekTitle),
  'zeke-bridge-challenge': (base, week, weekTitle) => buildCharacterHref('zeke', week, base, weekTitle),
  'charlie-discovery-zone': (base, week, weekTitle) =>
    buildCharacterHref('charlie', week, base, weekTitle),
  'b4-self-check-in': (base) => `${base.replace(/\/+$/, '')}/b4/check-in`,
};

function buildCharacterHref(
  character: string,
  week: number,
  kidsBasePath: string,
  weekTitle: string,
): string | null {
  const href = buildWeeklyCharacterMissionHref(
    character,
    week,
    kidsBasePath.replace(/\/+$/, ''),
    WEEKLY_CHARACTER_MISSION_LISTS,
  );
  if (!href) return null;
  return appendWeeklyAdventureGameContext(href, { week, weekTitle });
}

/** @deprecated Week-1-only ids kept for import stability in tests/seeds */
export const LEGACY_WEEK1_MISSION_IDS = {
  caiden: CAIDEN_QUEST_1_ID,
  miranda: MIRANDA_MISSING_SCHEDULE_ID,
  charlie: CHARLIE_MISSION_1_ID,
  zeke: ZEKE_MISSION_1_ID,
} as const;

export function resolveCourageMapTargetHref(
  targetGameSlug: string,
  kidsBasePath: string,
  week = 1,
  weekTitle = 'Courage in the Dark',
): string | null {
  const weekScoped = /^(\w+)-week-(\d+)$/.exec(targetGameSlug);
  if (weekScoped) {
    const character = weekScoped[1];
    const slugWeek = Number.parseInt(weekScoped[2], 10);
    const missionWeek = Number.isFinite(slugWeek) && slugWeek > 0 ? slugWeek : week;
    const missionId = resolveWeeklyCharacterMissionId(
      character,
      missionWeek,
      WEEKLY_CHARACTER_MISSION_LISTS,
    );
    if (missionId) {
      const base = kidsBasePath.replace(/\/+$/, '');
      const href = `${base}/${character}/${missionId}`;
      return appendWeeklyAdventureGameContext(href, { week, weekTitle });
    }
  }

  const builder = COURAGE_MAP_SLUG_ROUTES[targetGameSlug];
  if (!builder) return null;

  return builder(kidsBasePath, week, weekTitle);
}
