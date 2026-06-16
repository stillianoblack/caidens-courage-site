const BADGE_ART: Record<string, string> = {
  'Cave Explorer Badge': '/images/caidenscourage/Character Hub/caiden_photo_icon_game.webp',
  'Mystery Solver Badge': '/images/caidenscourage/Character Hub/miranda_photo_icon_game.webp',
  'Brave Bridge Badge': '/images/caidenscourage/Character Hub/zeke_photo_icon_game.webp',
  'Nature Explorer Badge': '/images/characters/charlieperk_photo_icon_game.webp',
  'Daily Check-In Spark': '/images/caidenscourage/Character Hub/b-4_photo_icon_game.webp',
  'Focus Flame Explorer Badge': '/images/caidenscourage/Character Hub/caiden_photo_icon_game.webp',
  'Focus Flame Badge': '/images/caidenscourage/Character Hub/caiden_photo_icon_game.webp',
};

const ITEM_ART: Record<string, string> = {};

const DEFAULT_ART = '/images/icons/focus-flame-mark.svg';

export function getBadgeArtworkPath(badgeName: string): string {
  return BADGE_ART[badgeName] ?? DEFAULT_ART;
}

export function getRewardItemArtworkPath(rewardItem: string): string | null {
  const mapped = ITEM_ART[rewardItem.trim()];
  return mapped ?? null;
}
