import type { AdventureModuleRecord } from '../types/adventureModule';
import {
  CHARACTER_HOTSPOT_IMAGES,
  getCharacterTheme,
  resolveCharacterThemeId,
  resolveHotspotImage,
  type CharacterThemeId,
} from '../design-system/kids-adventure/characterThemes';
import type { CourageMissionRewardPayload } from '../types/courageMissionProgress';
import { formatSelFocusLine } from './adventureSelFocus';

export type CinematicMissionCompanionMeta = {
  characterId: CharacterThemeId;
  characterName: string;
  focusLabel: string;
  missionTitle: string;
  rewardPreview: string;
  portraitSrc: string;
  /** Transparent hotspot / full-body art for heroic left rail */
  heroArtSrc: string;
  accentColor: string;
};

function resolveCinematicCharacterArt(themeId: CharacterThemeId): string {
  return resolveHotspotImage(themeId) ?? CHARACTER_HOTSPOT_IMAGES.caiden;
}

export function resolveCinematicMissionCompanionMeta(input: {
  characterId?: string | null;
  missionTitle?: string | null;
  weekModule?: AdventureModuleRecord | null;
  weeklyReward?: CourageMissionRewardPayload | null;
  fallbackAvatarSrc?: string | null;
}): CinematicMissionCompanionMeta | null {
  const themeId = resolveCharacterThemeId(input.characterId);
  if (!themeId) return null;

  const theme = getCharacterTheme(themeId);
  const selFocus =
    formatSelFocusLine(input.weekModule?.subtitle?.trim()) ??
    input.weekModule?.subtitle?.trim() ??
    'Focus & Courage';

  const coins =
    input.weeklyReward?.coins_earned ??
    input.weekModule?.weekly_reward_coin_value ??
    input.weekModule?.reward_value ??
    25;
  const badge =
    input.weeklyReward?.badge_unlocked?.trim() ||
    input.weekModule?.weekly_reward_name?.trim() ||
    input.weekModule?.reward_name?.trim();

  const rewardPreview = badge
    ? `+${coins} Focus Coins • ${badge}`
    : `+${coins} Focus Coins`;

  return {
    characterId: themeId,
    characterName: theme.name,
    focusLabel: selFocus,
    missionTitle: input.missionTitle?.trim() || input.weekModule?.title?.trim() || 'Adventure Mission',
    rewardPreview,
    portraitSrc: resolveCinematicCharacterArt(themeId),
    heroArtSrc: resolveHotspotImage(themeId) ?? CHARACTER_HOTSPOT_IMAGES.caiden,
    accentColor: theme.accent,
  };
}
