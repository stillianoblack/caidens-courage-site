import { CAIDEN_QUEST_1_ID } from '../data/caiden/questAdaptiveWhatComesFirst';
import { MIRANDA_MISSING_SCHEDULE_ID } from '../data/miranda';
import { CHARLIE_MISSION_1_ID } from '../data/charlie/missions/mission1MysteryFootprints';
import { ZEKE_MISSION_1_ID } from '../data/zeke';
import { appendWeeklyAdventureGameContext } from './weeklyAdventureRouteContext';

type RouteBuilder = (kidsBasePath: string) => string;

/**
 * Maps Courage in the Dark hotspot slugs to existing kids portal game routes.
 * TODO: Replace slug table if mission IDs change for Week 1.
 */
const COURAGE_MAP_SLUG_ROUTES: Record<string, RouteBuilder> = {
  'caiden-courage-in-the-dark': (base) => `${base}/caiden/${CAIDEN_QUEST_1_ID}`,
  'miranda-mystery': (base) => `${base}/miranda/${MIRANDA_MISSING_SCHEDULE_ID}`,
  'zeke-bridge-challenge': (base) => `${base}/zeke/${ZEKE_MISSION_1_ID}`,
  'charlie-discovery-zone': (base) => `${base}/charlie/${CHARLIE_MISSION_1_ID}`,
  'b4-self-check-in': (base) => `${base}/b4/check-in`,
};

const CHARACTER_WEEK1_SLUGS: Record<string, string> = {
  caiden: 'caiden-courage-in-the-dark',
  miranda: 'miranda-mystery',
  zeke: 'zeke-bridge-challenge',
  charlie: 'charlie-discovery-zone',
  b4: 'b4-self-check-in',
};

export function resolveCourageMapTargetHref(
  targetGameSlug: string,
  kidsBasePath: string,
  week = 1,
  weekTitle = 'Courage in the Dark',
): string | null {
  const weekScoped = /^(\w+)-week-\d+$/.exec(targetGameSlug);
  if (weekScoped) {
    const week1Slug = CHARACTER_WEEK1_SLUGS[weekScoped[1]];
    if (week1Slug) {
      return resolveCourageMapTargetHref(week1Slug, kidsBasePath, week, weekTitle);
    }
  }

  const builder = COURAGE_MAP_SLUG_ROUTES[targetGameSlug];
  if (!builder) return null;

  const href = builder(kidsBasePath.replace(/\/+$/, ''));
  return appendWeeklyAdventureGameContext(href, { week, weekTitle });
}
