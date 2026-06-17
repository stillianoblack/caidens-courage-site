import type { AdventureModuleRecord } from '../types/adventureModule';
import type { CourageMissionRewardPayload } from '../types/courageMissionProgress';

export type CinematicMissionPlayerRewardMeta = {
  displayName: string;
  focusCoins: number;
  focusCoinsLoading: boolean;
  weekLabel: string | null;
  missionCoinReward: string | null;
  weeklyBadgeLabel: string | null;
  progressLabel: string | null;
};

export function resolveCinematicMissionPlayerRewardMeta(input: {
  characterName: string;
  focusCoins: number;
  focusCoinsLoading?: boolean;
  weekNumber?: number;
  weekTitle?: string | null;
  weekModule?: AdventureModuleRecord | null;
  weeklyReward?: CourageMissionRewardPayload | null;
  missionProgressPct?: number | null;
  focusCategoryLabel?: string | null;
}): CinematicMissionPlayerRewardMeta {
  const coins =
    input.weeklyReward?.coins_earned ??
    input.weekModule?.weekly_reward_coin_value ??
    input.weekModule?.reward_value ??
    null;

  const missionCoinReward =
    coins != null && coins > 0 ? `+${coins} Focus Coins` : null;

  const weeklyBadgeLabel =
    input.weeklyReward?.badge_unlocked?.trim() ||
    input.weekModule?.weekly_reward_name?.trim() ||
    input.weekModule?.reward_name?.trim() ||
    null;

  const weekLabel = input.weekTitle?.trim()
    ? input.weekTitle.trim()
    : input.weekNumber && input.weekNumber > 0
      ? `Week ${input.weekNumber}`
      : null;

  let progressLabel: string | null = null;
  if (typeof input.missionProgressPct === 'number' && Number.isFinite(input.missionProgressPct)) {
    const category = input.focusCategoryLabel?.trim();
    progressLabel = category
      ? `${category} Progress ${input.missionProgressPct}%`
      : `Mission Progress ${input.missionProgressPct}%`;
  }

  return {
    displayName: input.characterName,
    focusCoins: input.focusCoins,
    focusCoinsLoading: input.focusCoinsLoading ?? false,
    weekLabel,
    missionCoinReward,
    weeklyBadgeLabel,
    progressLabel,
  };
}
