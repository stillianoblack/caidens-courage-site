import { supabase, isSupabaseConfigured } from './supabaseClient';

export type RewardClaimKind = 'coins' | 'chest' | 'badge' | 'item';

export type RewardClaimInput = {
  participantId: string;
  rewardKey: string;
  rewardName: string;
  rewardKind: RewardClaimKind;
  coinsAwarded?: number;
  badgeName?: string;
  itemName?: string;
  weekId?: string;
  imageSrc?: string | null;
};

export type RewardClaimResult = {
  ok: boolean;
  alreadyClaimed?: boolean;
  coinsAwarded?: number;
  newCoinTotal?: number;
  rewardName?: string;
  rewardKind?: RewardClaimKind;
  imageSrc?: string | null;
  message?: string;
};

const REWARD_CLAIMS_TABLE = 'player_reward_claims';

async function readWalletTotal(participantId: string): Promise<number> {
  if (!supabase) return 0;
  const { data } = await supabase
    .from('player_wallets')
    .select('total_coins')
    .eq('participant_id', participantId)
    .maybeSingle();
  return data?.total_coins ?? 0;
}

async function writeWalletTotal(participantId: string, total: number): Promise<number> {
  if (!supabase) return total;
  await supabase.from('player_wallets').upsert(
    {
      participant_id: participantId,
      total_coins: total,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'participant_id' },
  );
  return total;
}

export async function hasExistingRewardClaim(
  participantId: string,
  rewardKey: string,
): Promise<boolean> {
  return hasExistingClaim(participantId, rewardKey);
}

async function hasExistingClaim(participantId: string, rewardKey: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { data } = await supabase
      .from(REWARD_CLAIMS_TABLE)
      .select('id')
      .eq('participant_id', participantId)
      .eq('reward_key', rewardKey)
      .maybeSingle();
    if (data?.id) return true;
  } catch {
    /* table may not exist yet — fall through to badge lookup */
  }

  if (rewardKey.startsWith('b4-check-in')) {
    const { data } = await supabase
      .from('player_badges')
      .select('id')
      .eq('participant_id', participantId)
      .eq('badge_name', 'B-4 Check-In Reward')
      .maybeSingle();
    return Boolean(data?.id);
  }

  return false;
}

export async function recordRewardClaim(
  participantId: string,
  rewardKey: string,
  rewardName: string,
): Promise<void> {
  return recordClaim(participantId, rewardKey, rewardName);
}

async function recordClaim(participantId: string, rewardKey: string, rewardName: string): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from(REWARD_CLAIMS_TABLE).upsert(
      {
        participant_id: participantId,
        reward_key: rewardKey,
        reward_name: rewardName,
        claimed_at: new Date().toISOString(),
      },
      { onConflict: 'participant_id,reward_key' },
    );
  } catch {
    /* optional table */
  }
}

export async function claimParticipantReward(input: RewardClaimInput): Promise<RewardClaimResult> {
  if (!input.participantId?.trim() || !isSupabaseConfigured() || !supabase) {
    return { ok: false, message: 'Unable to claim reward right now.' };
  }

  const participantId = input.participantId.trim();
  const rewardKey = input.rewardKey.trim();

  if (await hasExistingClaim(participantId, rewardKey)) {
    return {
      ok: true,
      alreadyClaimed: true,
      rewardName: input.rewardName,
      rewardKind: input.rewardKind,
      imageSrc: input.imageSrc,
      message: 'You already claimed this reward.',
    };
  }

  const now = new Date().toISOString();
  const weekId = input.weekId?.trim() || 'week-1';

  if (input.rewardKind === 'badge' || input.badgeName) {
    await supabase.from('player_badges').upsert(
      {
        participant_id: participantId,
        week_id: weekId,
        mission_id: rewardKey,
        badge_name: input.badgeName ?? input.rewardName,
        earned_at: now,
      },
      { onConflict: 'participant_id,badge_name' },
    );
  }

  if (input.rewardKind === 'chest' || input.rewardKind === 'item' || input.itemName) {
    await supabase.from('player_progress').upsert(
      {
        participant_id: participantId,
        week_id: weekId,
        mission_id: rewardKey,
        reward_item: input.itemName ?? input.rewardName,
        coins_earned: input.coinsAwarded ?? 0,
        completed_at: now,
      },
      { onConflict: 'participant_id,mission_id' },
    );
  }

  let newCoinTotal: number | undefined;
  if (input.coinsAwarded && input.coinsAwarded > 0) {
    const current = await readWalletTotal(participantId);
    newCoinTotal = current + input.coinsAwarded;
    await writeWalletTotal(participantId, newCoinTotal);
  }

  await recordClaim(participantId, rewardKey, input.rewardName);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cc-reward-claimed', { detail: { participantId, rewardKey } }));
  }

  return {
    ok: true,
    coinsAwarded: input.coinsAwarded,
    newCoinTotal,
    rewardName: input.rewardName,
    rewardKind: input.rewardKind,
    imageSrc: input.imageSrc,
  };
}

export async function claimB4CheckInCompletionReward(
  participantId: string,
): Promise<RewardClaimResult> {
  return claimParticipantReward({
    participantId,
    rewardKey: 'b4-check-in-completion',
    rewardName: 'Focus Flame Starter Badge',
    rewardKind: 'badge',
    badgeName: 'B-4 Check-In Reward',
    coinsAwarded: 25,
    weekId: 'week-1',
    imageSrc: '/images/characters/b-4_photo_icon_game.webp',
  });
}

export function questResultToRewardClaim(result: {
  ok: boolean;
  alreadyClaimed?: boolean;
  coinsAwarded?: number;
  newCoinTotal?: number;
  rewardLabel?: string;
  rewardKind?: 'coins' | 'chest' | 'badge';
  imageSrc?: string | null;
}): RewardClaimResult {
  return {
    ok: result.ok,
    alreadyClaimed: result.alreadyClaimed,
    coinsAwarded: result.coinsAwarded,
    newCoinTotal: result.newCoinTotal,
    rewardName: result.rewardLabel,
    rewardKind: result.rewardKind,
    imageSrc:
      result.imageSrc ??
      (result.rewardKind === 'badge'
        ? '/images/caidenscourage/focus-flame-badge.webp'
        : result.rewardKind === 'chest'
          ? '/images/caidenscourage/explorer-chest.webp'
          : '/images/caidenscourage/focus-coin.webp'),
  };
}
