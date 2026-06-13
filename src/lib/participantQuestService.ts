import { supabase, isSupabaseConfigured } from './supabaseClient';

export type QuestPeriod = 'daily' | 'weekly' | 'monthly';

export type QuestDefinition = {
  key: string;
  period: QuestPeriod;
  title: string;
  description: string;
  targetCount: number;
  rewardLabel: string;
  rewardCoins: number;
  icon: 'flame' | 'chest' | 'badge';
};

export type QuestProgressRow = {
  questKey: string;
  period: QuestPeriod;
  progressCount: number;
  targetCount: number;
  rewardLabel: string;
  rewardCoins: number;
  icon: 'flame' | 'chest' | 'badge';
  claimed: boolean;
  claimable: boolean;
};

export const QUEST_DEFINITIONS: QuestDefinition[] = [
  {
    key: 'complete_one_adventure',
    period: 'daily',
    title: 'Daily Quest',
    description: 'Complete 1 Adventure',
    targetCount: 1,
    rewardLabel: '+10 Focus Coins',
    rewardCoins: 10,
    icon: 'flame',
  },
  {
    key: 'complete_week_missions',
    period: 'weekly',
    title: 'Weekly Quest',
    description: 'Complete all 5 Week Missions',
    targetCount: 5,
    rewardLabel: 'Explorer Chest',
    rewardCoins: 0,
    icon: 'chest',
  },
  {
    key: 'earn_monthly_coins',
    period: 'monthly',
    title: 'Monthly Quest',
    description: 'Earn 100 Focus Coins',
    targetCount: 100,
    rewardLabel: 'Focus Flame Badge',
    rewardCoins: 0,
    icon: 'badge',
  },
];

function dailyAnchor(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function monthlyAnchor(date = new Date()): string {
  return date.toISOString().slice(0, 7);
}

function weeklyAnchor(weekId: string): string {
  return weekId;
}

function resolvePeriodAnchor(period: QuestPeriod, weekId: string): string {
  if (period === 'daily') return dailyAnchor();
  if (period === 'monthly') return monthlyAnchor();
  return weeklyAnchor(weekId);
}

function buildDefaultRows(weekId: string): QuestProgressRow[] {
  return QUEST_DEFINITIONS.map((def) => ({
    questKey: def.key,
    period: def.period,
    progressCount: 0,
    targetCount: def.targetCount,
    rewardLabel: def.rewardLabel,
    rewardCoins: def.rewardCoins,
    icon: def.icon,
    claimed: false,
    claimable: false,
  }));
}

export async function loadParticipantQuests(
  participantId: string | null | undefined,
  weekId: string,
  stats: { completedWeekMissions: number; monthlyCoinsEarned: number; dailyAdventureComplete: boolean },
): Promise<QuestProgressRow[]> {
  const defaults = buildDefaultRows(weekId);

  if (!participantId || !isSupabaseConfigured() || !supabase) {
    return defaults.map((row) => {
      if (row.questKey === 'complete_one_adventure') {
        const progress = stats.dailyAdventureComplete ? 1 : 0;
        return { ...row, progressCount: progress, claimable: progress >= 1 };
      }
      if (row.questKey === 'complete_week_missions') {
        const progress = Math.min(stats.completedWeekMissions, row.targetCount);
        return { ...row, progressCount: progress, claimable: progress >= row.targetCount };
      }
      if (row.questKey === 'earn_monthly_coins') {
        const progress = Math.min(stats.monthlyCoinsEarned, row.targetCount);
        return { ...row, progressCount: progress, claimable: progress >= row.targetCount };
      }
      return row;
    });
  }

  const rows: QuestProgressRow[] = [];

  for (const def of QUEST_DEFINITIONS) {
    const periodAnchor = resolvePeriodAnchor(def.period, weekId);
    let progressCount = 0;

    if (def.key === 'complete_one_adventure') {
      progressCount = stats.dailyAdventureComplete ? 1 : 0;
    } else if (def.key === 'complete_week_missions') {
      progressCount = Math.min(stats.completedWeekMissions, def.targetCount);
    } else if (def.key === 'earn_monthly_coins') {
      progressCount = Math.min(stats.monthlyCoinsEarned, def.targetCount);
    }

    const { data } = await supabase
      .from('participant_quests')
      .select('progress_count, claimed_at')
      .eq('participant_id', participantId)
      .eq('quest_period', def.period)
      .eq('quest_key', def.key)
      .eq('period_anchor', periodAnchor)
      .maybeSingle();

    const claimed = Boolean(data?.claimed_at);
    const storedProgress = data?.progress_count ?? progressCount;
    const effectiveProgress = Math.max(storedProgress, progressCount);

    if (!data || effectiveProgress !== storedProgress) {
      await supabase.from('participant_quests').upsert(
        {
          participant_id: participantId,
          quest_period: def.period,
          quest_key: def.key,
          period_anchor: periodAnchor,
          progress_count: effectiveProgress,
          target_count: def.targetCount,
          reward_type: def.icon,
          reward_value: def.rewardLabel,
          reward_coins: def.rewardCoins,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'participant_id,quest_period,quest_key,period_anchor' },
      );
    }

    rows.push({
      questKey: def.key,
      period: def.period,
      progressCount: effectiveProgress,
      targetCount: def.targetCount,
      rewardLabel: def.rewardLabel,
      rewardCoins: def.rewardCoins,
      icon: def.icon,
      claimed,
      claimable: !claimed && effectiveProgress >= def.targetCount,
    });
  }

  return rows;
}

export async function claimParticipantQuest(
  participantId: string,
  questKey: string,
  period: QuestPeriod,
  weekId: string,
): Promise<{ ok: boolean; coinsAwarded?: number; newCoinTotal?: number }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false };
  }

  const def = QUEST_DEFINITIONS.find((row) => row.key === questKey && row.period === period);
  if (!def) return { ok: false };

  const periodAnchor = resolvePeriodAnchor(period, weekId);

  const { data: existing } = await supabase
    .from('participant_quests')
    .select('id, claimed_at, progress_count, target_count, reward_coins')
    .eq('participant_id', participantId)
    .eq('quest_period', period)
    .eq('quest_key', questKey)
    .eq('period_anchor', periodAnchor)
    .maybeSingle();

  if (existing?.claimed_at) {
    return { ok: true, coinsAwarded: 0 };
  }

  if (!existing || existing.progress_count < existing.target_count) {
    return { ok: false };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('participant_quests')
    .update({ claimed_at: now, updated_at: now })
    .eq('participant_id', participantId)
    .eq('quest_period', period)
    .eq('quest_key', questKey)
    .eq('period_anchor', periodAnchor);

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[QUEST] claim failed', error);
    }
    return { ok: false };
  }

  if (def.rewardCoins > 0) {
    const { data: wallet } = await supabase
      .from('player_wallets')
      .select('total_coins')
      .eq('participant_id', participantId)
      .maybeSingle();

    const nextTotal = (wallet?.total_coins ?? 0) + def.rewardCoins;
    await supabase.from('player_wallets').upsert(
      {
        participant_id: participantId,
        total_coins: nextTotal,
        updated_at: now,
      },
      { onConflict: 'participant_id' },
    );
    return { ok: true, coinsAwarded: def.rewardCoins, newCoinTotal: nextTotal };
  }

  return { ok: true, coinsAwarded: 0 };
}
