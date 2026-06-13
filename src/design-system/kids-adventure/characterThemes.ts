export type CharacterThemeId = 'caiden' | 'miranda' | 'zeke' | 'charlie' | 'b4';

export type CharacterTheme = {
  name: string;
  primary: string;
  secondary: string;
  gradient: string;
  accent: string;
  stripGradient: string;
  pillBg: string;
  pillColor: string;
};

export const characterThemes: Record<CharacterThemeId, CharacterTheme> = {
  caiden: {
    name: 'Caiden',
    primary: 'gold',
    secondary: 'navy',
    gradient: 'from-yellow-300 via-amber-400 to-blue-900',
    accent: '#E8BF4F',
    stripGradient: 'linear-gradient(90deg, #fde68a 0%, #E8BF4F 42%, #1a2f52 100%)',
    pillBg: 'rgba(232, 191, 79, 0.22)',
    pillColor: '#92400e',
  },
  miranda: {
    name: 'Miranda',
    primary: 'violet',
    secondary: 'purple',
    gradient: 'from-violet-300 via-purple-500 to-indigo-900',
    accent: '#8B5CF6',
    stripGradient: 'linear-gradient(90deg, #c4b5fd 0%, #8B5CF6 45%, #312e81 100%)',
    pillBg: 'rgba(139, 92, 246, 0.18)',
    pillColor: '#5b21b6',
  },
  zeke: {
    name: 'Zeke',
    primary: 'orange',
    secondary: 'teal',
    gradient: 'from-orange-300 via-orange-500 to-teal-700',
    accent: '#F97316',
    stripGradient: 'linear-gradient(90deg, #fdba74 0%, #F97316 42%, #0f766e 100%)',
    pillBg: 'rgba(249, 115, 22, 0.18)',
    pillColor: '#c2410c',
  },
  charlie: {
    name: 'Charlie Perk',
    primary: 'jungle-green',
    secondary: 'blue',
    gradient: 'from-green-300 via-emerald-500 to-blue-800',
    accent: '#22C55E',
    stripGradient: 'linear-gradient(90deg, #86efac 0%, #22C55E 42%, #1e40af 100%)',
    pillBg: 'rgba(34, 197, 94, 0.18)',
    pillColor: '#166534',
  },
  b4: {
    name: 'B-4',
    primary: 'blue',
    secondary: 'cyan',
    gradient: 'from-cyan-300 via-sky-500 to-blue-900',
    accent: '#0EA5E9',
    stripGradient: 'linear-gradient(90deg, #67e8f9 0%, #0EA5E9 42%, #1e3a8a 100%)',
    pillBg: 'rgba(14, 165, 233, 0.18)',
    pillColor: '#0369a1',
  },
};

const HOTSPOT_THEME_MAP: Record<string, CharacterThemeId> = {
  caiden: 'caiden',
  miranda: 'miranda',
  zeke: 'zeke',
  charlie: 'charlie',
  b4: 'b4',
};

export function resolveCharacterThemeId(value?: string | null): CharacterThemeId | null {
  if (!value) return null;
  const key = value.toLowerCase().replace(/\s+/g, '-');
  if (key in characterThemes) return key as CharacterThemeId;
  if (key in HOTSPOT_THEME_MAP) return HOTSPOT_THEME_MAP[key];
  if (key.includes('charlie')) return 'charlie';
  if (key.includes('miranda')) return 'miranda';
  if (key.includes('caiden')) return 'caiden';
  if (key.includes('zeke')) return 'zeke';
  if (key.includes('b4') || key.includes('b-4')) return 'b4';
  return null;
}

export function getCharacterTheme(themeId: CharacterThemeId): CharacterTheme {
  return characterThemes[themeId];
}

export function themeDataAttributes(themeId: CharacterThemeId): Record<string, string> {
  return { 'data-kid-theme': themeId };
}

/** Transparent character art for cinematic card backgrounds (mobile). */
export const CHARACTER_HOTSPOT_IMAGES: Record<CharacterThemeId, string> = {
  caiden: '/images/caidenscourage/Game-Hub/characters/caiden-hotspot.webp',
  miranda: '/images/caidenscourage/Game-Hub/characters/miranda-hotspot.webp',
  zeke: '/images/caidenscourage/Game-Hub/characters/zeke-hotspot.webp',
  charlie: '/images/caidenscourage/Game-Hub/characters/charlie-hotspot.webp',
  b4: '/images/caidenscourage/Game-Hub/characters/b4-hotspot.webp',
};

/** Solid collectible card fills keyed by character. */
export const CHARACTER_COLLECTIBLE_SOLID: Record<CharacterThemeId, string> = {
  caiden: '#92400e',
  miranda: '#6d28d9',
  zeke: '#ea580c',
  charlie: '#15803d',
  b4: '#0284c7',
};

export function resolveHotspotImage(themeId: CharacterThemeId | null): string | null {
  if (!themeId) return null;
  return CHARACTER_HOTSPOT_IMAGES[themeId] ?? null;
}
