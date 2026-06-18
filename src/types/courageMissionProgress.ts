export type CourageMissionRewardPayload = {
  week_id: string;
  mission_id: string;
  character_id: string;
  mission_title: string;
  character_name: string;
  coins_earned: number;
  badge_unlocked: string;
  reward_item: string;
  /** CMS weekly reward artwork when available. */
  badge_image_url?: string | null;
  week_number?: number;
  badge_week_label?: string | null;
  badge_rarity?: string | null;
  /** Character discovery unlocked by this mission. */
  character_discovery_id?: string | null;
  character_discovery_name?: string | null;
  character_discovery_image_url?: string | null;
};

export type CourageMissionCompletionPayload = CourageMissionRewardPayload & {
  participant_id: string;
};

export type CompleteMissionSuccessBase = {
  ok: true;
  weekMissionsCompleted: number;
  weekMissionsTotal: number;
  weekBadgeUnlocked: boolean;
  weekBadgeJustUnlocked: boolean;
  /** True when mission progress is saved but coins/badges/discovery await claim. */
  rewardPending: boolean;
  /** True when mission reward has been claimed (or legacy auto-award). */
  rewardClaimed: boolean;
};

export type CompleteMissionSuccess =
  | (CompleteMissionSuccessBase & {
      alreadyCompleted: true;
    })
  | (CompleteMissionSuccessBase & {
      alreadyCompleted: false;
      coinsEarned: number;
      oldCoinTotal?: number;
      newCoinTotal?: number;
    });

export type CompleteMissionFailure = {
  ok: false;
  error: 'no_active_child' | 'supabase_unavailable' | 'save_failed';
  message: string;
  debugError?: string;
};

export type CompleteMissionResult = CompleteMissionSuccess | CompleteMissionFailure;

export type CourageInTheDarkProgressSnapshot = {
  completedMissionIds: string[];
  completedCount: number;
  totalMissions: number;
  totalCoins: number;
  unlockedBadges: string[];
};
