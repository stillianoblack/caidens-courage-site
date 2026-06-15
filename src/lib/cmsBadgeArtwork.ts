import type { InventoryCardRarity } from '../design-system/kids-adventure/InventoryItemCard';
import type { AdventureModuleRecord, AdventureSpotCharacterKey, AdventureSpotRecord } from '../types/adventureModule';
import type { CourageMissionRewardPayload } from '../types/courageMissionProgress';
import { resolveWeeklyQuestReward } from './adventureWeekAssets';
import { getBadgeArtworkPath } from './rewardArtwork';

function resolveCmsModuleForWeek(
  modules: AdventureModuleRecord[],
  weekNumber: number,
): AdventureModuleRecord | undefined {
  return modules.find((module) => module.week_number === weekNumber);
}

function resolveSpotMissionTitle(spot: AdventureSpotRecord): string | null {
  const title =
    spot.mission_title?.trim() ||
    spot.label_text?.trim() ||
    spot.label?.trim() ||
    null;
  return title || null;
}

export function resolveCmsMissionTitle(
  modules: AdventureModuleRecord[],
  weekNumber: number,
  characterId: string,
  missionId?: string,
): string | null {
  const module = resolveCmsModuleForWeek(modules, weekNumber);
  const hotspots = module?.hotspots ?? [];
  if (hotspots.length === 0) return null;

  const normalizedCharacter = characterId.trim().toLowerCase() as AdventureSpotCharacterKey;
  const byCharacter = hotspots.find((spot) => spot.character_key === normalizedCharacter);
  if (byCharacter) {
    return resolveSpotMissionTitle(byCharacter);
  }

  if (missionId?.trim()) {
    const normalizedMissionId = missionId.trim();
    const byRoute = hotspots.find((spot) => spot.route_slug?.trim() === normalizedMissionId);
    if (byRoute) {
      return resolveSpotMissionTitle(byRoute);
    }
  }

  return null;
}

export type CmsBadgeDisplay = {
  name: string;
  imageUrl: string;
  weekNumber: number | null;
  weekLabel: string | null;
  rarity: InventoryCardRarity;
};

export type CmsBadgeIndex = {
  byName: Map<string, CmsBadgeDisplay>;
  byWeek: Map<number, CmsBadgeDisplay>;
};

/** Legacy hardcoded badge names from week 1 missions before CMS naming. */
const LEGACY_BADGE_WEEK_BY_NAME: Record<string, number> = {
  'Cave Explorer Badge': 1,
  'Mystery Solver Badge': 1,
  'Brave Bridge Badge': 1,
  'Nature Explorer Badge': 1,
  'Focus Flame Explorer Badge': 1,
};

export const CHECK_IN_BADGE_NAME = 'B-4 Check-In Reward';

const CHECK_IN_BADGE_NAMES = new Set([
  CHECK_IN_BADGE_NAME,
  'Focus Flame Starter Badge',
  'Daily Check-In Spark',
]);

export function isCheckInBadgeName(name: string): boolean {
  return CHECK_IN_BADGE_NAMES.has(name.trim());
}

export function isCheckInMissionId(missionId: string | null | undefined): boolean {
  const id = missionId?.trim() ?? '';
  return /^b4-check-in/i.test(id) || id === 'b4-self-check-in';
}

function parseWeekFromMissionId(missionId: string | null | undefined): number | null {
  const id = missionId?.trim() ?? '';
  if (!id) return null;
  const weeklyQuestMatch = /weekly-quest-(week-\d+)/i.exec(id);
  if (weeklyQuestMatch) {
    return parseWeekNumberFromWeekId(weeklyQuestMatch[1]);
  }
  const weekScopedMatch = /-week-(\d+)$/i.exec(id);
  if (weekScopedMatch) {
    const week = Number.parseInt(weekScopedMatch[1], 10);
    return Number.isFinite(week) && week > 0 ? week : null;
  }
  return null;
}

export type RawOwnedBadgeRow = {
  name: string;
  weekId: string | null;
  missionId: string | null;
};

export type OwnedBadgeKind = 'check-in' | 'weekly';

export type NormalizedOwnedBadge = {
  kind: OwnedBadgeKind;
  name: string;
  weekNumber: number | null;
};

function resolveRowWeekNumber(row: RawOwnedBadgeRow): number | null {
  return (
    parseWeekNumberFromWeekIdOrNull(row.weekId) ||
    parseWeekFromMissionId(row.missionId) ||
    LEGACY_BADGE_WEEK_BY_NAME[row.name.trim()] ||
    null
  );
}

/** Collapse mission-level badge rows into check-in + one weekly badge per adventure week. */
export function normalizeOwnedBadges(rows: RawOwnedBadgeRow[]): NormalizedOwnedBadge[] {
  let hasCheckIn = false;
  const weeklyWeeks = new Set<number>();

  for (const row of rows) {
    const name = row.name.trim();
    if (!name) continue;

    if (isCheckInBadgeName(name) || isCheckInMissionId(row.missionId)) {
      hasCheckIn = true;
      continue;
    }

    const weekNumber = resolveRowWeekNumber(row);
    if (weekNumber != null) {
      weeklyWeeks.add(weekNumber);
    }
  }

  const normalized: NormalizedOwnedBadge[] = [];
  if (hasCheckIn) {
    normalized.push({
      kind: 'check-in',
      name: CHECK_IN_BADGE_NAME,
      weekNumber: null,
    });
  }

  for (const weekNumber of Array.from(weeklyWeeks).sort((left, right) => left - right)) {
    normalized.push({
      kind: 'weekly',
      name: `week-${weekNumber}`,
      weekNumber,
    });
  }

  return normalized;
}

export function resolveCheckInBadgeDisplay(modules: AdventureModuleRecord[]): CmsBadgeDisplay {
  for (const module of modules) {
    for (const spot of module.hotspots ?? []) {
      if (spot.character_key !== 'b4') continue;
      const route = spot.route_slug?.trim() ?? '';
      if (!route.includes('check-in') && route !== 'b4-self-check-in') continue;

      const name =
        spot.reward_badge?.trim() ||
        spot.reward_name?.trim() ||
        CHECK_IN_BADGE_NAME;
      const imageUrl =
        spot.reward_image_url?.trim() ||
        spot.character_image_url?.trim() ||
        getBadgeArtworkPath('Daily Check-In Spark');

      return {
        name,
        imageUrl,
        weekNumber: null,
        weekLabel: 'Check-In',
        rarity: 'Common',
      };
    }
  }

  return {
    name: CHECK_IN_BADGE_NAME,
    imageUrl: getBadgeArtworkPath('Daily Check-In Spark'),
    weekNumber: null,
    weekLabel: 'Check-In',
    rarity: 'Common',
  };
}

export function resolveWeeklyBadgeDisplay(
  weekNumber: number,
  modules: AdventureModuleRecord[],
): CmsBadgeDisplay | null {
  const index = buildCmsBadgeIndex(modules);
  return index.byWeek.get(weekNumber) ?? null;
}

export function resolveBadgeDisplayForInventory(
  badge: NormalizedOwnedBadge,
  modules: AdventureModuleRecord[],
): CmsBadgeDisplay {
  if (badge.kind === 'check-in') {
    return resolveCheckInBadgeDisplay(modules);
  }

  if (badge.weekNumber != null) {
    const weekly = resolveWeeklyBadgeDisplay(badge.weekNumber, modules);
    if (weekly) return weekly;
  }

  return resolveBadgeDisplay(badge.name, modules, badge.weekNumber);
}

export function parseWeekNumberFromWeekId(weekId: string): number {
  const match = /^week-(\d+)$/.exec(weekId);
  if (!match) return 1;
  const week = Number.parseInt(match[1], 10);
  return Number.isFinite(week) && week > 0 ? week : 1;
}

export function parseWeekNumberFromWeekIdOrNull(weekId: string | null | undefined): number | null {
  if (!weekId?.trim()) return null;
  const match = /^week-(\d+)$/.exec(weekId.trim());
  if (!match) return null;
  const week = Number.parseInt(match[1], 10);
  return Number.isFinite(week) && week > 0 ? week : null;
}

function resolveCmsRarity(rarity?: string | null): InventoryCardRarity {
  const normalized = rarity?.trim().toLowerCase();
  if (normalized === 'epic') return 'Epic';
  if (normalized === 'rare') return 'Rare';
  return 'Common';
}

function resolveCmsImageUrl(
  rewardSvgUrl?: string | null,
  rewardImageUrl?: string | null,
  fallbackName?: string,
): string {
  const cmsUrl = rewardSvgUrl?.trim() || rewardImageUrl?.trim() || null;
  if (cmsUrl) return cmsUrl;
  return getBadgeArtworkPath(fallbackName ?? '');
}

export function buildCmsBadgeIndex(modules: AdventureModuleRecord[]): CmsBadgeIndex {
  const byName = new Map<string, CmsBadgeDisplay>();
  const byWeek = new Map<number, CmsBadgeDisplay>();

  for (const module of modules) {
    const reward = resolveWeeklyQuestReward(module);
    if (!reward?.rewardName) continue;

    const display: CmsBadgeDisplay = {
      name: reward.rewardName,
      imageUrl: resolveCmsImageUrl(reward.rewardSvgUrl, reward.rewardImageUrl, reward.rewardName),
      weekNumber: module.week_number,
      weekLabel: `Week ${module.week_number}`,
      rarity: resolveCmsRarity(module.weekly_reward_rarity),
    };

    byName.set(reward.rewardName, display);
    byWeek.set(module.week_number, display);
  }

  return { byName, byWeek };
}

export function resolveBadgeDisplay(
  badgeName: string,
  modules: AdventureModuleRecord[],
  weekNumber?: number | null,
): CmsBadgeDisplay {
  const trimmedName = badgeName.trim();

  if (isCheckInBadgeName(trimmedName)) {
    return resolveCheckInBadgeDisplay(modules);
  }

  const index = buildCmsBadgeIndex(modules);
  const resolvedWeek = weekNumber ?? LEGACY_BADGE_WEEK_BY_NAME[trimmedName] ?? null;

  if (resolvedWeek && index.byWeek.has(resolvedWeek)) {
    const cms = index.byWeek.get(resolvedWeek)!;
    return {
      ...cms,
      name: cms.name || trimmedName,
    };
  }

  if (trimmedName && index.byName.has(trimmedName)) {
    return index.byName.get(trimmedName)!;
  }

  return {
    name: trimmedName,
    imageUrl: getBadgeArtworkPath(trimmedName),
    weekNumber: resolvedWeek,
    weekLabel: resolvedWeek ? `Week ${resolvedWeek}` : null,
    rarity: 'Common',
  };
}

export function enrichCourageMissionRewardFromCms(
  reward: CourageMissionRewardPayload,
  modules: AdventureModuleRecord[],
): CourageMissionRewardPayload {
  const weekNumber = parseWeekNumberFromWeekId(reward.week_id);
  const display = resolveBadgeDisplay(reward.badge_unlocked, modules, weekNumber);
  const cmsMissionTitle = resolveCmsMissionTitle(
    modules,
    weekNumber,
    reward.character_id,
    reward.mission_id,
  );

  return {
    ...reward,
    mission_title: cmsMissionTitle ?? reward.mission_title,
    badge_unlocked: display.name,
    badge_image_url: display.imageUrl,
    week_number: weekNumber,
    badge_week_label: display.weekLabel,
    badge_rarity: display.rarity,
  };
}

export type InventoryBadgeCatalogEntry = {
  key: string;
  kind: 'check-in' | 'weekly';
  weekNumber: number | null;
  display: CmsBadgeDisplay;
  owned: boolean;
  locked: boolean;
  unlockRequirement: string;
};

export function buildInventoryBadgeCatalog(
  modules: AdventureModuleRecord[],
  ownedBadges: Array<{ kind: 'check-in' | 'weekly'; weekNumber: number | null }>,
): InventoryBadgeCatalogEntry[] {
  const ownedWeeklyWeeks = new Set(
    ownedBadges.filter((badge) => badge.kind === 'weekly' && badge.weekNumber != null).map((b) => b.weekNumber!),
  );
  const ownsCheckIn = ownedBadges.some((badge) => badge.kind === 'check-in');
  const entries: InventoryBadgeCatalogEntry[] = [];

  entries.push({
    key: 'check-in',
    kind: 'check-in',
    weekNumber: null,
    display: resolveCheckInBadgeDisplay(modules),
    owned: ownsCheckIn,
    locked: !ownsCheckIn,
    unlockRequirement: 'Complete the B-4 Check-In to unlock.',
  });

  const sortedModules = [...modules].sort((left, right) => left.week_number - right.week_number);
  for (const module of sortedModules) {
    const weekly = resolveWeeklyBadgeDisplay(module.week_number, modules);
    if (!weekly) continue;
    const owned = ownedWeeklyWeeks.has(module.week_number);
    entries.push({
      key: `week-${module.week_number}`,
      kind: 'weekly',
      weekNumber: module.week_number,
      display: weekly,
      owned,
      locked: !owned,
      unlockRequirement: `Complete all Week ${module.week_number} missions to unlock.`,
    });
  }

  return entries;
}
