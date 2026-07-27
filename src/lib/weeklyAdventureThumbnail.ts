import type { AdventureModuleRecord } from '../types/adventureModule';
import { resolveAdventureComicThumbnailUrl } from './adventureThumbnail';
import { resolveAdventureHeroMapSrc, resolveAdventureImageUrl } from './adventureMapMissions';

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

const WEEK1_STATIC = '/images/caidenscourage/Game-Hub/courage-in-the-dark.webp';

function firstMissionImageUrl(module: AdventureModuleRecord | null | undefined): string | null {
  if (!module?.hotspots?.length) return null;
  const hotspots = module.hotspots;
  const configuredCharacters = new Set(
    hotspots.map((spot) => spot.character_key).filter(Boolean),
  );
  // A hotspot list is a set of activities, not a lead-character assignment.
  // Only use character art when the week has one unambiguous configured character.
  if (configuredCharacters.size !== 1) return null;
  const spot = hotspots.find(
    (candidate) => candidate.character_key === hotspots[0]?.character_key,
  );
  return spot?.character_image_url?.trim() || spot?.reward_image_url?.trim() || null;
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
    return {
      url: resolveAdventureImageUrl(comicUrl, cms?.updated_at) ?? comicUrl,
      source: 'cms_comic_thumbnail',
    };
  }

  const aliasUrl =
    cms?.thumbnail_url?.trim() ||
    cms?.thumbnail_image_url?.trim() ||
    null;
  if (aliasUrl) {
    return {
      url: resolveAdventureImageUrl(aliasUrl, cms?.updated_at) ?? aliasUrl,
      source: 'cms_thumbnail_alias',
    };
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
    url: '',
    source: 'generic_placeholder',
    fallbackReason: 'No CMS thumbnail or map image configured for this week.',
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
