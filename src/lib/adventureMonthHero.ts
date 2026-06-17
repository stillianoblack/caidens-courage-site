import type { AdventureModuleRecord } from '../types/adventureModule';
import type { AdventureMonthRecord } from '../types/adventureMonth';
import { resolveAdventureHeroMapSrc, resolveAdventureImageUrl } from './adventureMapMissions';

export type AdventureMonthHeroSource =
  | 'month_hero_image'
  | 'week_hero_map'
  | 'week1_static';

export type AdventureMonthHeroResolution = {
  url: string;
  source: AdventureMonthHeroSource;
  fallbackReason?: string;
};

/** Large hero: month image → current week map/hero → static default. */
export function resolveAdventureMonthHeroSrc(input: {
  month?: AdventureMonthRecord | null;
  heroWeekModule?: AdventureModuleRecord | null;
  weekNumber?: number;
}): AdventureMonthHeroResolution {
  const weekNumber = input.weekNumber ?? input.heroWeekModule?.week_number ?? 1;

  const monthHero = resolveAdventureImageUrl(
    input.month?.month_hero_image_url,
    input.month?.updated_at,
  );
  if (monthHero) {
    return { url: monthHero, source: 'month_hero_image' };
  }

  const weekHero = resolveAdventureHeroMapSrc(input.heroWeekModule, weekNumber);
  if (weekHero) {
    return {
      url: weekHero,
      source: weekHero.includes('courage-in-the-dark') ? 'week1_static' : 'week_hero_map',
      fallbackReason: 'No month hero image — using current week map background.',
    };
  }

  return {
    url: '',
    source: 'week_hero_map',
    fallbackReason: 'No month or week hero image configured.',
  };
}
