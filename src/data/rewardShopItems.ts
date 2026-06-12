export type RewardShopCategory = 'decoration' | 'pack' | 'skin' | 'sticker';

export type RewardShopItem = {
  id: string;
  name: string;
  category: RewardShopCategory;
  cost: number;
  image: string;
  description: string;
};

/** Placeholder shop catalog — purchasing not wired yet. */
export const REWARD_SHOP_ITEMS: RewardShopItem[] = [
  {
    id: 'charlie-nature-sticker-pack',
    name: 'Charlie Nature Sticker Pack',
    category: 'sticker',
    cost: 75,
    image: '/images/caidenscourage/Game-Hub/characters/charlie-hotspot.webp',
    description: 'Rainforest discovery stickers for your adventure journal.',
  },
  {
    id: 'cave-torch-decoration',
    name: 'Cave Torch Decoration',
    category: 'decoration',
    cost: 100,
    image: '/images/icons/focus-flame-mark.svg',
    description: 'Light up your map camp with a cozy cave torch.',
  },
  {
    id: 'miranda-hover-pack',
    name: 'Miranda Hover Pack',
    category: 'pack',
    cost: 150,
    image: '/images/caidenscourage/Game-Hub/characters/miranda-hotspot.webp',
    description: 'Clue-finder tools and mystery badges for Miranda missions.',
  },
  {
    id: 'b4-blue-skin',
    name: 'B-4 Blue Skin',
    category: 'skin',
    cost: 200,
    image: '/images/caidenscourage/Game-Hub/characters/b4-hotspot.webp',
    description: 'A cool blue look for B-4 on the adventure map.',
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
