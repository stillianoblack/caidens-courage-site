import type { AdventureModuleRecord } from '../types/adventureModule';
import { resolveAdventureComicThumbnailUrl } from './adventureThumbnail';
import { resolveAdventureHeroMapSrc } from './adventureMapMissions';

export type WeeklyAdventureThumbnailSource =
  | 'cms_comic_thumbnail'
  | 'cms_thumbnail_alias'
  | 'cms_mission_image'
  | 'week_hero_map'
  | 'map_background'
  | 'week1_static'
  | 'generic_placeholder';

export type WeeklyAdventureThumbnailResolution = {
  url: string;
  source: WeeklyAdventureThumbnailSource;
  fallbackReason?: string;
};

const GENERIC_PLACEHOLDER = '/images/icons/focus-flame-mark.svg';
const WEEK1_STATIC = '/images/caidenscourage/Game-Hub/courage-in-the-dark.webp';

function firstMissionImageUrl(module: AdventureModuleRecord | null | undefined): string | null {
  if (!module?.hotspots?.length) return null;
  for (const spot of module.hotspots) {
    const image =
      spot.character_image_url?.trim() ||
      spot.reward_image_url?.trim() ||
      null;
    if (image) return image;
  }
  return null;
}

/** Thumbnail priority: CMS comic → mission image → map background → week-1 static → placeholder. */
export function resolveWeeklyAdventureThumbnail(input: {
  cmsModule?: AdventureModuleRecord | null;
  weekNumber: number;
  title?: string;
}): WeeklyAdventureThumbnailResolution {
  const cms = input.cmsModule;
  const weekNumber = input.weekNumber;

  const comicUrl = cms?.comic_thumbnail_url?.trim();
  if (comicUrl) {
    return { url: comicUrl, source: 'cms_comic_thumbnail' };
  }

  const aliasUrl =
    cms?.thumbnail_url?.trim() ||
    cms?.thumbnail_image_url?.trim() ||
    null;
  if (aliasUrl) {
    return { url: aliasUrl, source: 'cms_thumbnail_alias' };
  }

  const legacyComic = resolveAdventureComicThumbnailUrl(cms, weekNumber);
  if (legacyComic && legacyComic !== WEEK1_STATIC) {
    return { url: legacyComic, source: 'cms_comic_thumbnail' };
  }

  const missionImage = firstMissionImageUrl(cms);
  if (missionImage) {
    return { url: missionImage, source: 'cms_mission_image' };
  }

  const weekHero =
    cms?.map_background_url?.trim() ||
    cms?.background_image_url?.trim() ||
    cms?.hero_image_url?.trim() ||
    null;
  if (weekHero) {
    return {
      url: weekHero,
      source: 'week_hero_map',
      fallbackReason: 'No comic thumbnail — using weekly map/hero image.',
    };
  }

  const mapBackground = resolveAdventureHeroMapSrc(cms, weekNumber);
  if (mapBackground) {
    return {
      url: mapBackground,
      source: 'map_background',
      fallbackReason: 'No weekly thumbnail in CMS — using adventure map background.',
    };
  }

  if (weekNumber === 1) {
    return {
      url: WEEK1_STATIC,
      source: 'week1_static',
      fallbackReason: 'No CMS thumbnail — using Week 1 default artwork.',
    };
  }

  return {
    url: GENERIC_PLACEHOLDER,
    source: 'generic_placeholder',
    fallbackReason: 'No CMS thumbnail or map image — using generic placeholder.',
  };
}

export function logWeeklyAdventureThumbnailSource(input: {
  weekNumber: number;
  title: string;
  resolution: WeeklyAdventureThumbnailResolution;
}): void {
  if (process.env.NODE_ENV !== 'development') return;

  console.info('[WEEKLY_ADVENTURE_THUMBNAIL_SOURCE]', {
    week: input.weekNumber,
    title: input.title,
    thumbnail: input.resolution.url,
    source: input.resolution.source,
    fallbackReason: input.resolution.fallbackReason ?? null,
  });
}
