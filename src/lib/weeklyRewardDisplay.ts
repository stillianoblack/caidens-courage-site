import type { AdventureModuleRecord, AdventureSpotRecord } from '../types/adventureModule';
import type { InventoryCardRarity } from '../design-system/kids-adventure/InventoryItemCard';
import { resolveWeeklyQuestReward } from './adventureWeekAssets';

/** Generic badge icon when Admin Portal has no reward image configured. */
export const GENERIC_BADGE_PLACEHOLDER_SRC = '/images/icons/focus-flame-mark.svg';

export type WeeklyRewardDisplay = {
  name: string;
  imageUrl: string | null;
  weekNumber: number;
  weekLabel: string;
  rarity: InventoryCardRarity;
};

export function resolveConfiguredRewardImageUrl(input: {
  rewardSvgUrl?: string | null;
  rewardImageUrl?: string | null;
}): string | null {
  const svg = input.rewardSvgUrl?.trim();
  if (svg) return svg;
  const image = input.rewardImageUrl?.trim();
  if (image) return image;
  return null;
}

export function resolveWeeklyModuleRewardImage(
  module: AdventureModuleRecord | null | undefined,
): string | null {
  if (!module) return null;
  return resolveConfiguredRewardImageUrl({
    rewardSvgUrl: module.weekly_reward_svg_url,
    rewardImageUrl: module.weekly_reward_image_url,
  });
}

function resolveCmsRarity(rarity?: string | null): InventoryCardRarity {
  const normalized = rarity?.trim().toLowerCase();
  if (normalized === 'epic') return 'Epic';
  if (normalized === 'rare') return 'Rare';
  return 'Common';
}

export function resolveWeeklyRewardDisplay(
  module: AdventureModuleRecord | null | undefined,
): WeeklyRewardDisplay | null {
  const reward = resolveWeeklyQuestReward(module);
  if (!reward?.rewardName || !module) return null;

  return {
    name: reward.rewardName,
    imageUrl: resolveWeeklyModuleRewardImage(module),
    weekNumber: module.week_number,
    weekLabel: `Week ${module.week_number}`,
    rarity: resolveCmsRarity(module.weekly_reward_rarity),
  };
}

function isCheckInSpot(spot: AdventureSpotRecord): boolean {
  if (spot.character_key !== 'b4') return false;
  const route = spot.route_slug?.trim() ?? '';
  return route.includes('check-in') || route === 'b4-self-check-in';
}

export function resolveCheckInSpotRewardImage(
  modules: AdventureModuleRecord[],
): string | null {
  for (const module of modules) {
    for (const spot of module.hotspots ?? []) {
      if (!isCheckInSpot(spot)) continue;
      return resolveConfiguredRewardImageUrl({
        rewardImageUrl: spot.reward_image_url,
      });
    }
  }
  return null;
}
