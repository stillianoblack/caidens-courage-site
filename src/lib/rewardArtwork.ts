const BADGE_ART: Record<string, string> = {
  'Cave Explorer Badge': '/images/icons/focus-flame-mark.svg',
  'Mystery Solver Badge': '/images/caidenscourage/Game-Hub/characters/miranda-hotspot.webp',
  'Brave Bridge Badge': '/images/caidenscourage/Game-Hub/characters/zeke-hotspot.webp',
  'Nature Explorer Badge': '/images/caidenscourage/Game-Hub/characters/charlie-hotspot.webp',
  'Daily Check-In Spark': '/images/caidenscourage/Game-Hub/characters/b4-hotspot.webp',
};

const ITEM_ART: Record<string, string> = {
  'Cave Explorer Sticker': '/images/caidenscourage/Game-Hub/characters/caiden-hotspot.webp',
  'Miranda Clue Sticker': '/images/caidenscourage/Game-Hub/characters/miranda-hotspot.webp',
  'Bridge Builder Sticker': '/images/caidenscourage/Game-Hub/characters/zeke-hotspot.webp',
  'Rainforest Discovery Sticker': '/images/caidenscourage/Game-Hub/characters/charlie-hotspot.webp',
  'Focus Flame Spark': '/images/icons/focus-flame-mark.svg',
};

const DEFAULT_ART = '/images/icons/focus-flame-mark.svg';

export function getBadgeArtworkPath(badgeName: string): string {
  return BADGE_ART[badgeName] ?? DEFAULT_ART;
}

export function getRewardItemArtworkPath(rewardItem: string): string {
  return ITEM_ART[rewardItem] ?? DEFAULT_ART;
}
