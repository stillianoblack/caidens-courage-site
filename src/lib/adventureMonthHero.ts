import type { AdventureModuleRecord } from '../types/adventureModule';
import type { AdventureMonthRecord } from '../types/adventureMonth';
import { resolveAdventureHeroMapSrc, resolveAdventureImageUrl } from './adventureMapMissions';

export type AdventureMonthHeroSource =
  | 'month_hero_image'
  | 'featured_week_hero'
  | 'week_hero_map'
  | 'week1_static';

export type AdventureMonthHeroResolution = {
  url: string;
  source: AdventureMonthHeroSource;
  fallbackReason?: string;
};

/** Large hero prefers month-level image; falls back to featured/current week map background. */
export function resolveAdventureMonthHeroSrc(input: {
  month?: AdventureMonthRecord | null;
  heroWeekModule?: AdventureModuleRecord | null;
  featuredWeekModule?: AdventureModuleRecord | null;
  weekNumber?: number;
}): AdventureMonthHeroResolution {
  const weekNumber =
    input.weekNumber ?? input.heroWeekModule?.week_number ?? input.featuredWeekModule?.week_number ?? 1;

  const monthHero = resolveAdventureImageUrl(
    input.month?.month_hero_image_url,
    input.month?.updated_at,
  );
  if (monthHero) {
    return { url: monthHero, source: 'month_hero_image' };
  }

  const featuredHero = resolveAdventureHeroMapSrc(input.featuredWeekModule, weekNumber);
  if (featuredHero) {
    return {
      url: featuredHero,
      source: 'featured_week_hero',
      fallbackReason: 'No month hero image — using featured week map background.',
    };
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
