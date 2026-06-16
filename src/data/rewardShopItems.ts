export type RewardShopCategory = 'decoration' | 'pack' | 'skin' | 'sticker' | 'frame' | 'trail' | 'background';

export type RewardShopItem = {
  id: string;
  name: string;
  category: RewardShopCategory;
  cost: number;
  image: string;
  description: string;
};

/** Cosmetic shop catalog — purchasing tracked via player_reward_claims (shop:{id}). */
export const REWARD_SHOP_ITEMS: RewardShopItem[] = [
  {
    id: 'b4-blue-skin',
    name: 'B-4 Blue Skin',
    category: 'skin',
    cost: 200,
    image: '/images/caidenscourage/Game-Hub/characters/b4-hotspot.webp',
    description: 'A cool blue look for B-4 on the adventure map.',
  },
  {
    id: 'caiden-cave-frame',
    name: 'Caiden Cave Frame',
    category: 'frame',
    cost: 150,
    image: '/images/icons/focus-flame-mark.svg',
    description: 'Frame your profile with Caiden cave courage art.',
  },
  {
    id: 'miranda-glow-pack',
    name: 'Miranda Glow Pack',
    category: 'pack',
    cost: 175,
    image: '/images/caidenscourage/Game-Hub/characters/miranda-hotspot.webp',
    description: 'Mystery glow effects for Miranda mission cards.',
  },
  {
    id: 'focus-flame-trail',
    name: 'Focus Flame Trail',
    category: 'trail',
    cost: 125,
    image: '/images/icons/focus-flame-mark.svg',
    description: 'Leave a Focus Flame trail on the adventure map.',
  },
  {
    id: 'journal-cover',
    name: 'Journal Cover',
    category: 'decoration',
    cost: 100,
    image: '/images/icons/focus-flame-mark.svg',
    description: 'A custom journal cover for your adventure notes.',
  },
  {
    id: 'avatar-background',
    name: 'Avatar Background',
    category: 'background',
    cost: 90,
    image: '/images/icons/focus-flame-mark.svg',
    description: 'A cave campfire background for your avatar.',
  },
];

export type NextUnlockPreview = {
  item: RewardShopItem;
  coinsAway: number;
};

export function getNextUnlockPreview(totalCoins: number): NextUnlockPreview | null {
  const upcoming = REWARD_SHOP_ITEMS.filter((item) => item.cost > totalCoins).sort(
    (a, b) => a.cost - b.cost,
  );
  const next = upcoming[0];
  if (!next) return null;
  return {
    item: next,
    coinsAway: next.cost - totalCoins,
  };
}

export function getRewardShopItemsByCategory(category: RewardShopCategory): RewardShopItem[] {
  return REWARD_SHOP_ITEMS.filter((item) => item.category === category);
}
