import type { PlayerInventorySnapshot } from './getPlayerInventory';
import { familyPortalPath } from './familyPortalPaths';
import {
  WEEKLY_SOURCE_PARAM,
  WEEKLY_SOURCE_VALUE,
  WEEKLY_VIEW_EXPLORE_VALUE,
  WEEKLY_VIEW_PARAM,
  WEEKLY_WEEK_PARAM,
  weeklyAdventureWeekAnchor,
} from './weeklyAdventureRouteContext';

export const INVENTORY_WEEK1_BADGE_NAME = 'Focus Flame Badge';

export const INVENTORY_REWARDS_EMPTY_MESSAGE =
  'Complete missions to earn stickers, sparks, and decorations.';

export const INVENTORY_CERTIFICATES_EMPTY_MESSAGE =
  'Complete all 4 weeks in Month 1 to earn your Focus Flame Champion Certificate.';

export const INVENTORY_CHARACTER_DISCOVERIES_EMPTY_MESSAGE =
  'Complete weekly activities to unlock character discoveries.';

export function resolveWeek1AdventureHref(pathname: string): string {
  const params = new URLSearchParams();
  params.set(WEEKLY_VIEW_PARAM, WEEKLY_VIEW_EXPLORE_VALUE);
  params.set(WEEKLY_WEEK_PARAM, '1');
  params.set(WEEKLY_SOURCE_PARAM, WEEKLY_SOURCE_VALUE);
  return `${familyPortalPath('continue-learning', pathname)}?${params.toString()}#${weeklyAdventureWeekAnchor(1)}`;
}

export function hasInventoryEarnedContent(
  inventory: PlayerInventorySnapshot,
  earnedBadgeCount: number,
): boolean {
  const discoveryCount = inventory.rewardSnapshot?.earnedDiscoveries.length ?? 0;
  const certificateEarned = inventory.rewardSnapshot?.monthlyChallenge.certificateEarned ?? false;
  return (
    earnedBadgeCount > 0 ||
    inventory.earnedRewards.length > 0 ||
    discoveryCount > 0 ||
    certificateEarned
  );
}

export function resolveWeek1BadgePreviewDisplay(): {
  name: string;
  imageUrl: string | null;
  weekLabel: string;
} {
  return {
    name: INVENTORY_WEEK1_BADGE_NAME,
    imageUrl: null,
    weekLabel: 'Week 1',
  };
}
