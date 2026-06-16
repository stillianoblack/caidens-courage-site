import { REWARD_SHOP_ITEMS } from '../data/rewardShopItems';
import { GENERIC_BADGE_PLACEHOLDER_SRC } from './weeklyRewardDisplay';

const FOCUS_FLAME_MARK = '/images/icons/focus-flame-mark.svg';
const FOCUS_FLAME_SVG = '/images/icons/Focus-Flame.svg';

/** Explicit per-reward artwork — only entries with distinct configured assets belong here. */
const EXPLICIT_EARNED_REWARD_ART: Record<string, string> = {};

export type InventoryRewardImageSource =
  | 'reward_artwork_map'
  | 'shop_catalog'
  | 'player_progress'
  | 'none';

export type ResolvedInventoryRewardImage = {
  imageUrl: string | null;
  source: InventoryRewardImageSource;
  fallbackReason?: string;
};

export type InventoryRewardImageDiagnostic = {
  rewardId: string;
  rewardName: string;
  rewardType: string;
  imageUrl: string | null;
  source: InventoryRewardImageSource;
  fallbackReason?: string;
};

export function isGenericFocusFlameImage(url: string | null | undefined): boolean {
  const trimmed = url?.trim() ?? '';
  if (!trimmed) return false;
  return (
    trimmed === GENERIC_BADGE_PLACEHOLDER_SRC ||
    trimmed === FOCUS_FLAME_MARK ||
    trimmed === FOCUS_FLAME_SVG
  );
}

export function resolveEarnedRewardImage(
  rewardId: string,
  label: string,
  rewardType: string,
): ResolvedInventoryRewardImage {
  const trimmed = label.trim();

  const explicit = EXPLICIT_EARNED_REWARD_ART[trimmed];
  if (explicit && !isGenericFocusFlameImage(explicit)) {
    const result: ResolvedInventoryRewardImage = {
      imageUrl: explicit,
      source: 'reward_artwork_map',
    };
    logInventoryRewardImageSource({
      rewardId,
      rewardName: trimmed,
      rewardType,
      imageUrl: result.imageUrl,
      source: result.source,
    });
    return result;
  }

  const shopMatch = REWARD_SHOP_ITEMS.find((item) => item.name === trimmed);
  if (shopMatch?.image && !isGenericFocusFlameImage(shopMatch.image)) {
    const result: ResolvedInventoryRewardImage = {
      imageUrl: shopMatch.image,
      source: 'shop_catalog',
    };
    logInventoryRewardImageSource({
      rewardId,
      rewardName: trimmed,
      rewardType,
      imageUrl: result.imageUrl,
      source: result.source,
    });
    return result;
  }

  const result: ResolvedInventoryRewardImage = {
    imageUrl: null,
    source: 'none',
    fallbackReason: 'no_explicit_image_configured',
  };
  logInventoryRewardImageSource({
    rewardId,
    rewardName: trimmed,
    rewardType,
    imageUrl: null,
    source: result.source,
    fallbackReason: result.fallbackReason,
  });
  return result;
}

export function logInventoryRewardImageSource(diagnostic: InventoryRewardImageDiagnostic): void {
  if (process.env.NODE_ENV !== 'development') return;
  console.info('[INVENTORY_REWARD_IMAGE_SOURCE]', diagnostic);
}

export function resolveShopItemImage(itemId: string, imageUrl: string): string | null {
  if (isGenericFocusFlameImage(imageUrl)) {
    logInventoryRewardImageSource({
      rewardId: itemId,
      rewardName: itemId,
      rewardType: 'shop',
      imageUrl: null,
      source: 'none',
      fallbackReason: 'shop_placeholder_image',
    });
    return null;
  }
  logInventoryRewardImageSource({
    rewardId: itemId,
    rewardName: itemId,
    rewardType: 'shop',
    imageUrl,
    source: 'shop_catalog',
  });
  return imageUrl;
}
