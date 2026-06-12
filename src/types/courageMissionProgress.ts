export type CourageMissionRewardPayload = {
  week_id: string;
  mission_id: string;
  character_id: string;
  mission_title: string;
  character_name: string;
  coins_earned: number;
  badge_unlocked: string;
  reward_item: string;
};

export type CourageMissionCompletionPayload = CourageMissionRewardPayload & {
  participant_id: string;
};

export type CompleteMissionSuccess =
  | { ok: true; alreadyCompleted: true }
  | {
      ok: true;
      alreadyCompleted: false;
      oldCoinTotal: number;
      newCoinTotal: number;
      coinsEarned: number;
    };

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
