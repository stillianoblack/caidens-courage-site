import {
  COURAGE_IN_THE_DARK_BG,
  courageInTheDarkMissions,
  type CourageInTheDarkMission,
  type CourageMapHotspotColor,
} from '../data/courageInTheDarkMap';
import {
  FAMILY_WEEKLY_ADVENTURE_WEEKS,
  buildWeeklyTrailNodes,
} from '../data/familyWeeklyAdventures';
import type { AdventureModuleRecord, AdventureSpotRecord } from '../types/adventureModule';
import type { AdventureTrailNodeView } from '../types/adventureTrail';
import {
  CHARACTER_COMIC_ICONS,
  CHARACTER_HOTSPOT_IMAGES,
  resolveCharacterComicIconUrl,
  resolveCharacterMapTokenUrl,
} from '../design-system/kids-adventure/characterThemes';

/**
 * Default hotspot layout (% of map canvas). Coordinates are not admin-configurable yet.
 * TODO(future): Support admin-configurable hotspot positions per adventure month/week via CMS.
 * TODO(future): Support hero art variants with character cluster shifted right for overlay clearance.
 */
const DEFAULT_LAYOUT: Record<
  AdventureSpotRecord['character_key'],
  { x: number; y: number; width: number; height: number; color: CourageMapHotspotColor; accentClass: string }
> = {
  caiden: { x: 36, y: 29.5, width: 17, height: 25, color: 'gold', accentClass: 'from-yellow-300 to-blue-500' },
  miranda: { x: 17, y: 51.5, width: 17, height: 25, color: 'purple', accentClass: 'from-purple-400 to-fuchsia-500' },
  zeke: { x: 65, y: 45.5, width: 18, height: 26, color: 'orange', accentClass: 'from-orange-300 to-amber-600' },
  charlie: { x: 84, y: 62.5, width: 17, height: 25, color: 'green', accentClass: 'from-emerald-300 to-green-600' },
  b4: { x: 50, y: 59.5, width: 16, height: 24, color: 'blue', accentClass: 'from-sky-300 to-blue-600' },
};

const CHARACTER_NAMES: Record<AdventureSpotRecord['character_key'], string> = {
  caiden: 'Caiden',
  miranda: 'Miranda',
  zeke: 'Zeke',
  charlie: 'Charlie Perk',
  b4: 'B-4',
};

const DEFAULT_THUMBNAILS: Record<AdventureSpotRecord['character_key'], string> = {
  caiden: CHARACTER_COMIC_ICONS.caiden,
  miranda: CHARACTER_COMIC_ICONS.miranda,
  zeke: CHARACTER_COMIC_ICONS.zeke,
  charlie: CHARACTER_COMIC_ICONS.charlie,
  b4: CHARACTER_COMIC_ICONS.b4,
};

const DEFAULT_MAP_TOKENS: Record<AdventureSpotRecord['character_key'], string> = {
  caiden: CHARACTER_HOTSPOT_IMAGES.caiden,
  miranda: CHARACTER_HOTSPOT_IMAGES.miranda,
  zeke: CHARACTER_HOTSPOT_IMAGES.zeke,
  charlie: CHARACTER_HOTSPOT_IMAGES.charlie,
  b4: CHARACTER_HOTSPOT_IMAGES.b4,
};

/** Append cache-busting query from CMS updated_at so image swaps appear immediately. */
export function resolveAdventureImageUrl(
  url: string | null | undefined,
  updatedAt?: string | null,
): string | null {
  if (!url?.trim()) return null;
  const base = url.trim();
  if (!updatedAt) return base;
  const stamp = encodeURIComponent(updatedAt);
  return base.includes('?') ? `${base}&v=${stamp}` : `${base}?v=${stamp}`;
}

function spotToMission(
  spot: AdventureSpotRecord,
  week: number,
  weekTitle: string,
  directHref?: string,
): CourageInTheDarkMission {
  const normalized: AdventureSpotRecord = {
    ...spot,
    label_text: spot.label_text || spot.label || spot.mission_title,
    mission_subtitle: spot.mission_subtitle ?? spot.mission_description ?? null,
    position_x: spot.position_x ?? spot.x,
    position_y: spot.position_y ?? spot.y,
  };
  const layout = DEFAULT_LAYOUT[normalized.character_key];
  const coins = normalized.reward_coins ?? 25;
  const badge = normalized.reward_badge || normalized.reward_name
    ? ` • ${normalized.reward_badge ?? normalized.reward_name}`
    : '';
  const cmsArt = normalized.character_image_url ?? normalized.reward_image_url ?? null;
  const token =
    resolveCharacterMapTokenUrl(normalized.character_key, cmsArt) ||
    DEFAULT_MAP_TOKENS[normalized.character_key];
  const thumbnail =
    resolveCharacterComicIconUrl(normalized.character_key, cmsArt) ||
    DEFAULT_THUMBNAILS[normalized.character_key];
  return {
    id: normalized.character_key,
    characterName: CHARACTER_NAMES[normalized.character_key],
    label: normalized.label_text,
    token,
    thumbnail,
    color: layout.color,
    accentClass: layout.accentClass,
    position: {
      x: normalized.position_x ?? layout.x,
      y: normalized.position_y ?? layout.y,
    },
    size: {
      width: normalized.size_width ?? layout.width,
      height: normalized.size_height ?? layout.height,
    },
    description: normalized.mission_subtitle ?? normalized.mission_title,
    rewardText: `+${coins} Focus Coins${badge}`,
    targetGameSlug: normalized.route_slug ?? `${normalized.character_key}-week-${week}`,
    directHref,
    locked: normalized.status === 'locked',
  };
}

function trailNodeToMission(node: AdventureTrailNodeView, week: number): CourageInTheDarkMission | null {
  if (!node.characterId || node.comingSoon) return null;
  const key = node.characterId as AdventureSpotRecord['character_key'];
  if (!(key in DEFAULT_LAYOUT)) return null;

  return spotToMission(
    {
      character_key: key,
      mission_title: node.title,
      mission_subtitle: node.description,
      label_text: node.title.split(':').pop()?.trim() || node.title,
      reward_coins: 25,
      status: node.state === 'locked' ? 'locked' : 'available',
      route_slug: `${key}-week-${week}`,
    },
    week,
    node.title,
    node.href,
  );
}

export function resolveAdventureMapMissions(input: {
  week: number;
  weekTitle: string;
  cmsModule?: AdventureModuleRecord | null;
  weekNodes?: AdventureTrailNodeView[];
  paths?: { kidsBasePath: string; downloadsPath: string; certificatesPath: string };
}): CourageInTheDarkMission[] {
  const { week, weekTitle, cmsModule, weekNodes = [], paths } = input;

  if (cmsModule?.hotspots?.length) {
    const characterNodes = weekNodes.filter((node) => node.characterId);
    return cmsModule.hotspots.map((spot) => {
      const trailNode = characterNodes.find((node) => node.characterId === spot.character_key);
      return spotToMission(spot, week, weekTitle, trailNode?.href);
    });
  }

  if (week === 1) {
    return courageInTheDarkMissions;
  }

  const fromTrail = weekNodes
    .filter((node) =>
      ['caiden', 'miranda', 'b4', 'charlie', 'zeke'].includes(node.kind),
    )
    .map((node) => trailNodeToMission(node, week))
    .filter((row): row is CourageInTheDarkMission => Boolean(row));

  if (fromTrail.length > 0) return fromTrail;

  const defaultPaths = paths ?? {
    kidsBasePath: '/family-hub/kids',
    downloadsPath: '/family-hub/downloads',
    certificatesPath: '/family-hub/certificates',
  };

  return buildDefaultHotspotsForWeek(week, defaultPaths, weekTitle).map((spot) =>
    spotToMission(spot, week, weekTitle),
  );
}

export function resolveAdventureHeroMapSrc(
  cmsModule?: AdventureModuleRecord | null,
  weekNumber?: number,
): string {
  const week = weekNumber ?? cmsModule?.week_number ?? 1;
  const cmsUrl =
    resolveAdventureImageUrl(cmsModule?.map_background_url, cmsModule?.updated_at) ??
    resolveAdventureImageUrl(cmsModule?.background_image_url, cmsModule?.updated_at);

  if (cmsUrl) return cmsUrl;
  if (week === 1) return COURAGE_IN_THE_DARK_BG;
  return '';
}

/** @deprecated Use resolveAdventureHeroMapSrc */
export function resolveAdventureInteractiveHeaderSrc(
  cmsModule?: AdventureModuleRecord | null,
): string {
  return resolveAdventureHeroMapSrc(cmsModule);
}

/** Comic/week-card background is not used for hero map — kept for optional tile overlays. */
export function resolveAdventureMapBackgroundSrc(
  cmsModule?: AdventureModuleRecord | null,
): string | null {
  return resolveAdventureImageUrl(cmsModule?.map_background_url, cmsModule?.updated_at);
}

/** Large weekly interactive map background. */
export function resolveAdventureBackgroundSrc(
  cmsModule?: AdventureModuleRecord | null,
): string {
  return resolveAdventureHeroMapSrc(cmsModule);
}

export function resolveDefaultPreviewActivities(week: number): string[] {
  return (
    FAMILY_WEEKLY_ADVENTURE_WEEKS.find((row) => row.week === week)?.previewActivities ?? []
  );
}

export function buildDefaultHotspotsForWeek(
  week: number,
  paths: { kidsBasePath: string; downloadsPath: string; certificatesPath: string },
  weekTitle: string,
): AdventureSpotRecord[] {
  const nodes = buildWeeklyTrailNodes(week, paths, weekTitle);
  return nodes
    .filter((node) => node.characterId)
    .map((node) => {
      const key = node.characterId as AdventureSpotRecord['character_key'];
      const layout = DEFAULT_LAYOUT[key];
      return {
        character_key: key,
        mission_title: node.title,
        mission_subtitle: node.description,
        label_text: node.title.includes(':') ? node.title.split(':').slice(1).join(':').trim() : node.title,
        reward_coins: 25,
        position_x: layout.x,
        position_y: layout.y,
        size_width: layout.width,
        size_height: layout.height,
        character_image_url: DEFAULT_THUMBNAILS[key],
        status: node.comingSoon ? 'locked' : 'available',
        route_slug: `${key}-week-${week}`,
      };
    });
}
