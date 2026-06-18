import type { AdventureModuleRecord } from '../types/adventureModule';
import { REWARD_SHOP_ITEMS, type RewardShopItem } from '../data/rewardShopItems';
import type { InventoryShopState } from '../design-system/kids-adventure/InventoryItemCard';
import {
  buildCharacterDiscoveryCatalog,
  type CharacterDiscoveryCatalogEntry,
  type EarnedCharacterDiscovery,
} from './characterDiscoveryService';
import { buildInventoryBadgeCatalog, type InventoryBadgeCatalogEntry } from './cmsBadgeArtwork';
import {
  getMonthlyChallengeProgress,
  resolveCertificateImageUrl,
  type MonthlyChallengeProgress,
} from './monthlyChallengeProgress';
import {
  DEFAULT_WEEK_PROGRESS_PATHS,
  loadChildProgressStatus,
  type WeekProgressPaths,
} from './childProgressStatus';
import {
  dedupeEarnedGameplayRewards,
  loadChildInventoryView,
  resolveShopItemState,
  type ChildInventoryView,
  type EarnedInventoryItem,
} from './playerInventoryModel';
import {
  getEarnedWeeklyBadges,
  getNextBadgeToEarn,
  isWeekBadgeEarned,
  loadWeeklyBadgeEarnedState,
  resolveActiveWeekNumbersFromModules,
  type WeeklyBadgeEarnedState,
} from './weeklyBadgeUnlock';

export type ChildRewardSnapshot = {
  weeklyBadgeState: WeeklyBadgeEarnedState;
  ownsCheckIn: boolean;
  baselineComplete: boolean;
  badgeCatalog: InventoryBadgeCatalogEntry[];
  monthlyChallenge: MonthlyChallengeProgress;
  certificateImageUrl: string | null;
  earnedDiscoveries: EarnedCharacterDiscovery[];
  discoveryCatalog: CharacterDiscoveryCatalogEntry[];
  earnedRewards: EarnedInventoryItem[];
  purchasedShopItemIds: ReadonlySet<string>;
  shopItems: RewardShopItem[];
};

const EMPTY_SNAPSHOT: ChildRewardSnapshot = {
  weeklyBadgeState: { completedMissionIds: [], earnedWeeklyWeeks: new Set() },
  ownsCheckIn: false,
  baselineComplete: false,
  badgeCatalog: [],
  monthlyChallenge: {
    monthNumber: 1,
    title: 'Month 1 Challenge',
    tagline: 'Are you up for the Focus Flame Challenge?',
    description:
      'Complete all 4 weekly adventures to earn your Focus Flame Champion Certificate.',
    monthlyBadgeName: 'Focus Flame Champion Badge',
    certificateName: 'Focus Flame Champion Certificate',
    weeksCompleted: 0,
    weeksTotal: 4,
    monthChallengeStarted: false,
    monthChallengeCompleted: false,
    certificateEarned: false,
    monthlyBadgeEarned: false,
    completedWeekNumbers: [],
  },
  certificateImageUrl: null,
  earnedDiscoveries: [],
  discoveryCatalog: [],
  earnedRewards: [],
  purchasedShopItemIds: new Set(),
  shopItems: REWARD_SHOP_ITEMS,
};

export async function loadChildRewardSnapshot(
  childIdInput?: string,
  modules: AdventureModuleRecord[] = [],
  paths: WeekProgressPaths = DEFAULT_WEEK_PROGRESS_PATHS,
): Promise<ChildRewardSnapshot> {
  const childId = childIdInput?.trim() ?? '';
  if (!childId) return EMPTY_SNAPSHOT;

  const progressOptions = { cmsModules: modules, paths };

  const [progress, inventoryView, monthlyChallenge] = await Promise.all([
    loadChildProgressStatus(childId, progressOptions),
    loadChildInventoryView(childId, modules),
    getMonthlyChallengeProgress(childId, 1, undefined, { ...progressOptions, cmsModules: modules }),
  ]);

  const weeklyBadgeState = progress.weeklyBadgeState;
  const badgeCatalog = buildInventoryBadgeCatalog(
    modules,
    weeklyBadgeState,
    monthlyChallenge,
    progress.ownsCheckIn,
    progressOptions,
    childId,
  );
  const discoveryCatalog = buildCharacterDiscoveryCatalog(progress.earnedDiscoveries);

  return {
    weeklyBadgeState,
    ownsCheckIn: progress.ownsCheckIn,
    baselineComplete: progress.baselineComplete,
    badgeCatalog,
    monthlyChallenge,
    certificateImageUrl: resolveCertificateImageUrl(modules, 1),
    earnedDiscoveries: progress.earnedDiscoveries,
    discoveryCatalog,
    earnedRewards: inventoryView.earnedRewards,
    purchasedShopItemIds: inventoryView.purchasedShopItemIds,
    shopItems: REWARD_SHOP_ITEMS,
  };
}

export async function getEarnedInventoryItems(
  childId: string,
  modules: AdventureModuleRecord[] = [],
): Promise<EarnedInventoryItem[]> {
  const view = await loadChildInventoryView(childId, modules);
  return view.earnedRewards;
}

export function getAvailableShopItems(
  purchasedShopItemIds: ReadonlySet<string>,
): RewardShopItem[] {
  return REWARD_SHOP_ITEMS.filter((item) => !purchasedShopItemIds.has(item.id));
}

export function resolveShopItemStates(
  walletTotal: number,
  purchasedShopItemIds: ReadonlySet<string>,
): Array<{ item: RewardShopItem; state: InventoryShopState }> {
  return REWARD_SHOP_ITEMS.map((item) => ({
    item,
    state: resolveShopItemState(item, walletTotal, purchasedShopItemIds),
  }));
}

export type NextRewardToEarn =
  | { kind: 'weekly-badge'; weekNumber: number }
  | { kind: 'monthly-challenge'; weeksRemaining: number }
  | { kind: 'character-discovery'; discoveryId: string; name: string }
  | null;

export async function getNextRewardToEarn(
  childId: string,
  modules: AdventureModuleRecord[] = [],
): Promise<NextRewardToEarn> {
  const snapshot = await loadChildRewardSnapshot(childId, modules);
  const nextWeek = await getNextBadgeToEarn(
    childId,
    resolveActiveWeekNumbersFromModules(modules),
    { cmsModules: modules, paths: DEFAULT_WEEK_PROGRESS_PATHS },
  );
  if (nextWeek != null) {
    return { kind: 'weekly-badge', weekNumber: nextWeek };
  }

  if (!snapshot.monthlyChallenge.monthChallengeCompleted) {
    const weeksRemaining =
      snapshot.monthlyChallenge.weeksTotal - snapshot.monthlyChallenge.weeksCompleted;
    if (weeksRemaining > 0) {
      return { kind: 'monthly-challenge', weeksRemaining };
    }
  }

  const nextDiscovery = snapshot.discoveryCatalog.find((entry) => !entry.earned);
  if (nextDiscovery) {
    return {
      kind: 'character-discovery',
      discoveryId: nextDiscovery.definition.id,
      name: nextDiscovery.definition.name,
    };
  }

  return null;
}

export {
  dedupeEarnedGameplayRewards,
  getEarnedWeeklyBadges,
  getMonthlyChallengeProgress,
  isWeekBadgeEarned,
  loadChildInventoryView,
  loadWeeklyBadgeEarnedState,
  resolveShopItemState,
};
export type {
  CharacterDiscoveryCatalogEntry,
  ChildInventoryView,
  EarnedCharacterDiscovery,
  EarnedInventoryItem,
  InventoryBadgeCatalogEntry,
  MonthlyChallengeProgress,
  WeeklyBadgeEarnedState,
};
