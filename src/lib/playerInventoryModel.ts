import type { AdventureModuleRecord } from '../types/adventureModule';
import { allCharacterDiscoveryDefinitions } from '../data/characterDiscoveryDefinitions';
import { REWARD_SHOP_ITEMS, type RewardShopItem } from '../data/rewardShopItems';
import type { InventoryShopState } from '../design-system/kids-adventure/InventoryItemCard';
import { isCheckInBadgeName } from './cmsBadgeArtwork';
import { resolveEarnedRewardImage } from './inventoryRewardImage';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export type EarnedRewardCategory = 'item' | 'sticker' | 'decoration';

export type EarnedInventoryItem = {
  id: string;
  label: string;
  category: EarnedRewardCategory;
  imageSrc: string | null;
  imageSource: string;
};

export type ChildInventoryView = {
  earnedRewards: EarnedInventoryItem[];
  purchasedShopItemIds: ReadonlySet<string>;
};

export const SHOP_REWARD_KEY_PREFIX = 'shop:';

const EMPTY_VIEW: ChildInventoryView = {
  earnedRewards: [],
  purchasedShopItemIds: new Set(),
};

function normalizeRewardId(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, '-');
}

function categorizeEarnedReward(label: string): EarnedRewardCategory {
  const normalized = label.trim().toLowerCase();
  if (/sticker|spark/i.test(normalized)) return 'sticker';
  if (/decoration|torch/i.test(normalized)) return 'decoration';
  return 'item';
}

function collectWeeklyRewardNames(modules: AdventureModuleRecord[]): Set<string> {
  const names = new Set<string>();
  for (const module of modules) {
    const rewardName = module.weekly_reward_name?.trim();
    if (rewardName) names.add(rewardName);
  }
  return names;
}

function collectDiscoveryNames(): Set<string> {
  return new Set(allCharacterDiscoveryDefinitions().map((entry) => entry.name));
}

export function isGameplayDropRewardName(
  label: string,
  weeklyRewardNames: ReadonlySet<string> = new Set(),
  discoveryNames: ReadonlySet<string> = collectDiscoveryNames(),
): boolean {
  const trimmed = label.trim();
  if (!trimmed) return false;
  if (weeklyRewardNames.has(trimmed)) return false;
  if (discoveryNames.has(trimmed)) return false;
  if (isCheckInBadgeName(trimmed)) return false;
  if (/\bbadge\b/i.test(trimmed) && !/sticker/i.test(trimmed)) return false;
  return true;
}

export function dedupeEarnedGameplayRewards(
  rawRewardItems: readonly string[],
  modules: AdventureModuleRecord[] = [],
): EarnedInventoryItem[] {
  const weeklyRewardNames = collectWeeklyRewardNames(modules);
  const seen = new Set<string>();
  const earned: EarnedInventoryItem[] = [];

  for (const raw of rawRewardItems) {
    const label = raw?.trim() ?? '';
    if (!isGameplayDropRewardName(label, weeklyRewardNames)) continue;

    const id = normalizeRewardId(label);
    if (seen.has(id)) continue;
    seen.add(id);

    const category = categorizeEarnedReward(label);
    const resolvedImage = resolveEarnedRewardImage(id, label, category);

    earned.push({
      id,
      label,
      category,
      imageSrc: resolvedImage.imageUrl,
      imageSource: resolvedImage.source,
    });
  }

  return earned;
}

export function resolveEarnedGameplayRewardArtwork(label: string): string | null {
  const resolved = resolveEarnedRewardImage(
    label.trim().toLowerCase().replace(/\s+/g, '-'),
    label,
    categorizeEarnedReward(label),
  );
  return resolved.imageUrl;
}

function toShopItemId(rewardKey: string): string | null {
  const trimmed = rewardKey.trim();
  if (!trimmed.startsWith(SHOP_REWARD_KEY_PREFIX)) return null;
  const id = trimmed.slice(SHOP_REWARD_KEY_PREFIX.length).trim();
  return id || null;
}

async function fetchPurchasedShopItemIds(participantId: string): Promise<Set<string>> {
  if (!isSupabaseConfigured() || !supabase) return new Set();

  try {
    const { data, error } = await supabase
      .from('player_reward_claims')
      .select('reward_key')
      .eq('participant_id', participantId);

    if (error) throw error;

    const purchased = new Set<string>();
    const knownShopIds = new Set(REWARD_SHOP_ITEMS.map((item) => item.id));

    for (const row of data ?? []) {
      const rewardKey = (row as { reward_key?: string | null }).reward_key?.trim() ?? '';
      const shopId = toShopItemId(rewardKey);
      if (shopId && knownShopIds.has(shopId)) {
        purchased.add(shopId);
        continue;
      }
      if (knownShopIds.has(rewardKey)) {
        purchased.add(rewardKey);
      }
    }

    return purchased;
  } catch {
    return new Set();
  }
}

async function fetchEarnedRewardItemLabels(participantId: string): Promise<string[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from('player_progress')
    .select('reward_item')
    .eq('participant_id', participantId);

  if (error) throw error;

  return (data ?? [])
    .map((row) => (row as { reward_item?: string | null }).reward_item?.trim() ?? '')
    .filter(Boolean);
}

export async function loadChildInventoryView(
  participantIdInput?: string,
  modules: AdventureModuleRecord[] = [],
): Promise<ChildInventoryView> {
  const participantId = participantIdInput?.trim() ?? '';
  if (!participantId) return EMPTY_VIEW;

  try {
    const [rawRewardItems, purchasedShopItemIds] = await Promise.all([
      fetchEarnedRewardItemLabels(participantId),
      fetchPurchasedShopItemIds(participantId),
    ]);

    return {
      earnedRewards: dedupeEarnedGameplayRewards(rawRewardItems, modules),
      purchasedShopItemIds,
    };
  } catch (err) {
    console.warn('[INVENTORY] Failed to load child inventory view', err);
    return EMPTY_VIEW;
  }
}

export function resolveShopItemState(
  item: RewardShopItem,
  walletTotal: number,
  purchasedShopItemIds: ReadonlySet<string>,
): InventoryShopState {
  if (purchasedShopItemIds.has(item.id)) return 'owned';
  if (walletTotal >= item.cost) return 'available';
  return 'need_coins';
}

export function hasEarnedGameplayRewards(view: ChildInventoryView): boolean {
  return view.earnedRewards.length > 0;
}
