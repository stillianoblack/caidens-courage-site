import type { CourageMissionCompletionPayload } from '../types/courageMissionProgress';
import { discoveryRewardKey, resolveCharacterDiscoveryForMission } from '../data/characterDiscoveryDefinitions';
import { awardCharacterDiscovery } from './characterDiscoveryService';
import { trackMonthlyCoinsEarned } from './monthlyCoinsEarnedTracking';
import { syncMonthlyChallengeRewards } from './monthlyChallengeProgress';
import { hasExistingRewardClaim, recordRewardClaim } from './rewardClaimService';
import {
  isWeekFullyComplete,
  parseWeekNumberFromPayload,
} from './weekBadgeProgression';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { markInventoryHasNewRewards } from './inventoryNotificationService';
import { notifyFocusCoinWalletUpdated } from '../hooks/useFocusCoinWallet';
import { notifyModuleComplete } from './activeChildContext';
import { triggerParentPush } from './parentPushNotify';
import { trackKitWeeklyCompletionForStudent } from './kitIntegration';
import {
  buildMissionCompletePushDedupeKey,
  buildRewardReadyPushDedupeKey,
} from './parentPushNotifyDedupe';

export function missionRewardClaimKey(missionId: string): string {
  return `mission-reward:${missionId.trim()}`;
}

export type MissionRewardClaimResult = {
  ok: boolean;
  alreadyClaimed?: boolean;
  coinsAwarded?: number;
  newCoinTotal?: number;
  weekBadgeJustUnlocked?: boolean;
  message?: string;
};

async function readWalletTotal(participantId: string): Promise<number> {
  if (!supabase) return 0;
  const { data, error } = await supabase
    .from('player_wallets')
    .select('total_coins')
    .eq('participant_id', participantId)
    .maybeSingle();
  if (error) throw error;
  return data?.total_coins ?? 0;
}

async function writeWalletTotal(participantId: string, totalCoins: number): Promise<void> {
  if (!supabase) return;
  const payload = {
    participant_id: participantId,
    total_coins: totalCoins,
    updated_at: new Date().toISOString(),
  };
  const { data: existing, error: readError } = await supabase
    .from('player_wallets')
    .select('participant_id')
    .eq('participant_id', participantId)
    .maybeSingle();
  if (readError) throw readError;
  if (existing) {
    const { error } = await supabase.from('player_wallets').update(payload).eq('participant_id', participantId);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from('player_wallets').insert(payload);
  if (error) throw error;
}

async function readWeekMissionIds(participantId: string, weekId: string): Promise<string[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('player_progress')
    .select('mission_id')
    .eq('participant_id', participantId)
    .eq('week_id', weekId);
  if (error) throw error;
  return (data ?? [])
    .map((row) => row.mission_id)
    .filter((missionId): missionId is string => typeof missionId === 'string' && missionId.trim().length > 0);
}

async function readWeekBadgeUnlocked(
  participantId: string,
  weekId: string,
  badgeName: string,
): Promise<boolean> {
  if (!supabase || !badgeName.trim()) return false;
  const { data, error } = await supabase
    .from('player_badges')
    .select('id')
    .eq('participant_id', participantId)
    .eq('week_id', weekId)
    .eq('badge_name', badgeName.trim())
    .maybeSingle();
  if (error) throw error;
  return Boolean(data?.id);
}

async function awardWeekBadgeIfComplete(input: {
  participantId: string;
  weekId: string;
  weekNumber: number;
  badgeName: string;
  completedMissionIds: string[];
}): Promise<boolean> {
  if (!supabase || !input.badgeName.trim()) return false;
  if (!isWeekFullyComplete(input.weekNumber, input.completedMissionIds)) return false;

  const alreadyUnlocked = await readWeekBadgeUnlocked(
    input.participantId,
    input.weekId,
    input.badgeName,
  );
  if (alreadyUnlocked) return false;

  const badgeRow = {
    participant_id: input.participantId,
    week_id: input.weekId,
    mission_id: `weekly-badge-${input.weekId}`,
    badge_name: input.badgeName.trim(),
  };
  const { error: badgeError } = await supabase.from('player_badges').insert(badgeRow);
  if (badgeError && badgeError.code !== '23505') {
    throw badgeError;
  }
  return true;
}

export async function isMissionRewardClaimed(
  participantId: string,
  missionId: string,
): Promise<boolean> {
  if (!participantId.trim() || !missionId.trim()) return false;

  const rewardKey = missionRewardClaimKey(missionId);
  if (await hasExistingRewardClaim(participantId, rewardKey)) {
    return true;
  }

  const discovery = resolveCharacterDiscoveryForMission(missionId);
  if (discovery && (await hasExistingRewardClaim(participantId, discoveryRewardKey(discovery.id)))) {
    await recordRewardClaim(participantId, rewardKey, missionId);
    if (process.env.NODE_ENV === 'development') {
      console.info('[REWARD_CLAIM_STATE]', {
        participantId,
        missionId,
        rewardKey,
        state: 'legacy_backfill',
      });
    }
    return true;
  }

  return false;
}

export async function claimMissionReward(
  payload: CourageMissionCompletionPayload,
): Promise<MissionRewardClaimResult> {
  const participantId = payload.participant_id?.trim();
  const missionId = payload.mission_id?.trim();
  const rewardKey = missionRewardClaimKey(missionId ?? '');

  if (!participantId || !missionId || !isSupabaseConfigured() || !supabase) {
    return { ok: false, message: 'Unable to claim reward right now.' };
  }

  if (await isMissionRewardClaimed(participantId, missionId)) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[REWARD_CLAIM_STATE]', {
        participantId,
        missionId,
        rewardKey,
        state: 'already_claimed',
      });
    }
    return { ok: true, alreadyClaimed: true, coinsAwarded: 0 };
  }

  const { data: progressRow, error: progressError } = await supabase
    .from('player_progress')
    .select('id')
    .eq('participant_id', participantId)
    .eq('mission_id', missionId)
    .maybeSingle();

  if (progressError) {
    return { ok: false, message: 'Could not verify mission completion.' };
  }
  if (!progressRow?.id) {
    return { ok: false, message: 'Complete the mission before claiming rewards.' };
  }

  const oldCoinTotal = await readWalletTotal(participantId);
  const coinsAwarded = payload.coins_earned > 0 ? payload.coins_earned : 0;
  const newCoinTotal = oldCoinTotal + coinsAwarded;

  if (coinsAwarded > 0) {
    await writeWalletTotal(participantId, newCoinTotal);
    trackMonthlyCoinsEarned(participantId, coinsAwarded);
  }

  const weekNumber = parseWeekNumberFromPayload(payload.week_id, payload.week_number);
  const completedMissionIds = await readWeekMissionIds(participantId, payload.week_id);
  const weekBadgeJustUnlocked = await awardWeekBadgeIfComplete({
    participantId,
    weekId: payload.week_id,
    weekNumber,
    badgeName: payload.badge_unlocked,
    completedMissionIds,
  });

  await awardCharacterDiscovery(participantId, missionId);
  await syncMonthlyChallengeRewards(participantId, completedMissionIds);
  await recordRewardClaim(participantId, rewardKey, payload.mission_title || missionId);

  if (process.env.NODE_ENV === 'development') {
    console.info('[MISSION_REWARD_WRITE]', {
      participantId,
      missionId,
      weekId: payload.week_id,
      coinsAwarded,
      newCoinTotal,
      weekBadgeJustUnlocked,
    });
    console.info('[INVENTORY_UNLOCK_WRITE]', {
      participantId,
      missionId,
      badgeUnlocked: weekBadgeJustUnlocked,
      discoveryId: payload.character_discovery_id ?? null,
    });
    console.info('[REWARD_CLAIM_DEBUG]', {
      participantId,
      missionId,
      weekId: payload.week_id,
      coinsAwarded,
      weekBadgeJustUnlocked,
      rewardKey,
    });
  }

  notifyFocusCoinWalletUpdated(newCoinTotal);
  markInventoryHasNewRewards(participantId);
  notifyModuleComplete({
    mission_id: missionId,
    week_id: payload.week_id,
    participant_id: participantId,
    already_completed: false,
    new_coin_total: newCoinTotal,
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('cc-reward-claimed', { detail: { participantId, rewardKey } }),
    );
  }

  triggerParentPush({
    trigger: 'child_completed_weekly_mission',
    childId: participantId,
    childName: payload.character_name,
    detail: payload.mission_title,
    dedupeKey: buildMissionCompletePushDedupeKey(participantId, missionId),
  });

  if (weekBadgeJustUnlocked) {
    if (weekNumber >= 1 && weekNumber <= 4) {
      void trackKitWeeklyCompletionForStudent({
        participantId,
        weekNumber,
        metadata: {
          week_id: payload.week_id,
          source: 'mission_reward_claim',
        },
      });
    }

    triggerParentPush({
      trigger: 'reward_ready_to_claim',
      childId: participantId,
      childName: payload.character_name,
      dedupeKey: buildRewardReadyPushDedupeKey(participantId, `week-badge:${payload.week_id}`),
    });
  } else if (payload.character_discovery_name) {
    triggerParentPush({
      trigger: 'reward_ready_to_claim',
      childId: participantId,
      childName: payload.character_name,
      dedupeKey: buildRewardReadyPushDedupeKey(
        participantId,
        `discovery:${payload.character_discovery_id || payload.mission_id}`,
      ),
    });
  }

  return {
    ok: true,
    coinsAwarded,
    newCoinTotal,
    weekBadgeJustUnlocked,
  };
}

export async function countMissionsCompletedToday(participantId: string): Promise<number> {
  if (!participantId.trim() || !isSupabaseConfigured() || !supabase) return 0;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('player_progress')
    .select('id')
    .eq('participant_id', participantId.trim())
    .gte('completed_at', todayStart.toISOString());

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[QUEST_PROGRESS_WRITE] daily count failed', error);
    }
    return 0;
  }

  return data?.length ?? 0;
}
