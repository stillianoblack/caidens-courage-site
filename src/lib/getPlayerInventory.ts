import type { AdventureModuleRecord } from '../types/adventureModule';
import { type NormalizedOwnedBadge } from './cmsBadgeArtwork';
import { toNormalizedOwnedBadges } from './childInventoryEarnedState';
import {
  loadChildRewardSnapshot,
  type CharacterDiscoveryCatalogEntry,
  type ChildRewardSnapshot,
} from './childRewardSystem';
import type { WeekProgressPaths } from './childProgressStatus';
import { DEFAULT_WEEK_PROGRESS_PATHS } from './childProgressStatus';
import {
  dedupeEarnedGameplayRewards,
  loadChildInventoryView,
  type ChildInventoryView,
  type EarnedInventoryItem,
} from './playerInventoryModel';
import type { MonthlyChallengeProgress } from './monthlyChallengeProgress';

export type OwnedBadge = NormalizedOwnedBadge;

/** @deprecated Prefer ChildRewardSnapshot for the full reward view. */
export type PlayerInventorySnapshot = {
  badges: OwnedBadge[];
  items: string[];
  stickers: string[];
  decorations: string[];
  earnedRewards: EarnedInventoryItem[];
  purchasedShopItemIds: ReadonlySet<string>;
  rewardSnapshot: ChildRewardSnapshot | null;
};

const EMPTY_INVENTORY: PlayerInventorySnapshot = {
  badges: [],
  items: [],
  stickers: [],
  decorations: [],
  earnedRewards: [],
  purchasedShopItemIds: new Set(),
  rewardSnapshot: null,
};

function splitLegacyRewardLists(earnedRewards: EarnedInventoryItem[]): {
  items: string[];
  stickers: string[];
  decorations: string[];
} {
  const items: string[] = [];
  const stickers: string[] = [];
  const decorations: string[] = [];

  for (const reward of earnedRewards) {
    if (reward.category === 'sticker') stickers.push(reward.label);
    else if (reward.category === 'decoration') decorations.push(reward.label);
    else items.push(reward.label);
  }

  return { items, stickers, decorations };
}

export async function getPlayerInventory(
  explicitParticipantId?: string,
  modules: AdventureModuleRecord[] = [],
  paths: WeekProgressPaths = DEFAULT_WEEK_PROGRESS_PATHS,
): Promise<PlayerInventorySnapshot> {
  const participantId = explicitParticipantId?.trim() ?? '';
  if (!participantId) {
    return EMPTY_INVENTORY;
  }

  try {
    const rewardSnapshot = await loadChildRewardSnapshot(participantId, modules, paths);
    const earnedState = {
      ownsCheckIn: rewardSnapshot.ownsCheckIn,
      baselineComplete: rewardSnapshot.baselineComplete,
      ...rewardSnapshot.weeklyBadgeState,
    };
    const badges = toNormalizedOwnedBadges(earnedState);
    const { items, stickers, decorations } = splitLegacyRewardLists(rewardSnapshot.earnedRewards);

    return {
      badges,
      items,
      stickers,
      decorations,
      earnedRewards: rewardSnapshot.earnedRewards,
      purchasedShopItemIds: rewardSnapshot.purchasedShopItemIds,
      rewardSnapshot,
    };
  } catch (err) {
    console.warn('[INVENTORY] Failed to load player inventory', err);
    return EMPTY_INVENTORY;
  }
}

export { loadChildInventoryView, loadChildRewardSnapshot, dedupeEarnedGameplayRewards };
export type {
  ChildInventoryView,
  ChildRewardSnapshot,
  CharacterDiscoveryCatalogEntry,
  EarnedInventoryItem,
  MonthlyChallengeProgress,
};
