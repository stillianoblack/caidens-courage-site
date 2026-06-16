import type { AdventureModuleRecord } from '../types/adventureModule';
import { isWeekFullyComplete } from './weekBadgeProgression';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export const MONTH_CHALLENGE_REWARD_KEY_PREFIX = 'month:';

export type MonthlyChallengeConfig = {
  monthNumber: number;
  weekNumbers: readonly number[];
  title: string;
  tagline: string;
  description: string;
  monthlyBadgeName: string;
  certificateName: string;
  bonusCoins: number;
};

export const MONTH_1_CHALLENGE: MonthlyChallengeConfig = {
  monthNumber: 1,
  weekNumbers: [1, 2, 3, 4],
  title: 'Month 1 Challenge',
  tagline: 'Are you up for the Focus Flame Challenge?',
  description:
    'Complete all 4 weekly adventures to earn your Focus Flame Champion Certificate.',
  monthlyBadgeName: 'Focus Flame Champion Badge',
  certificateName: 'Focus Flame Champion Certificate',
  bonusCoins: 50,
};

export type MonthlyChallengeProgress = {
  monthNumber: number;
  title: string;
  tagline: string;
  description: string;
  monthlyBadgeName: string;
  certificateName: string;
  weeksCompleted: number;
  weeksTotal: number;
  monthChallengeStarted: boolean;
  monthChallengeCompleted: boolean;
  certificateEarned: boolean;
  monthlyBadgeEarned: boolean;
  completedWeekNumbers: number[];
};

export function monthChallengeStartedKey(monthNumber: number): string {
  return `${MONTH_CHALLENGE_REWARD_KEY_PREFIX}${monthNumber}:started`;
}

export function monthChallengeCompletedKey(monthNumber: number): string {
  return `${MONTH_CHALLENGE_REWARD_KEY_PREFIX}${monthNumber}:complete`;
}

export function monthCertificateKey(monthNumber: number): string {
  return `${MONTH_CHALLENGE_REWARD_KEY_PREFIX}${monthNumber}:certificate`;
}

export function monthBadgeKey(monthNumber: number): string {
  return `${MONTH_CHALLENGE_REWARD_KEY_PREFIX}${monthNumber}:badge`;
}

export function deriveMonthlyChallengeProgress(
  monthConfig: MonthlyChallengeConfig,
  completedMissionIds: readonly string[],
  earnedClaimKeys: ReadonlySet<string> = new Set(),
): MonthlyChallengeProgress {
  const completedWeekNumbers = monthConfig.weekNumbers.filter((week) =>
    isWeekFullyComplete(week, completedMissionIds),
  );
  const weeksCompleted = completedWeekNumbers.length;
  const weeksTotal = monthConfig.weekNumbers.length;
  const hasMonthMissionActivity = completedMissionIds.some((missionId) => {
    const weekMatch = /-week-(\d+)$/.exec(missionId);
    if (weekMatch) {
      const week = Number.parseInt(weekMatch[1], 10);
      return monthConfig.weekNumbers.includes(week);
    }
    return monthConfig.weekNumbers.includes(1);
  });
  const monthChallengeStarted =
    earnedClaimKeys.has(monthChallengeStartedKey(monthConfig.monthNumber)) ||
    hasMonthMissionActivity;
  const monthChallengeCompleted =
    weeksCompleted >= weeksTotal ||
    earnedClaimKeys.has(monthChallengeCompletedKey(monthConfig.monthNumber));
  const certificateEarned =
    monthChallengeCompleted ||
    earnedClaimKeys.has(monthCertificateKey(monthConfig.monthNumber));
  const monthlyBadgeEarned =
    monthChallengeCompleted || earnedClaimKeys.has(monthBadgeKey(monthConfig.monthNumber));

  return {
    monthNumber: monthConfig.monthNumber,
    title: monthConfig.title,
    tagline: monthConfig.tagline,
    description: monthConfig.description,
    monthlyBadgeName: monthConfig.monthlyBadgeName,
    certificateName: monthConfig.certificateName,
    weeksCompleted: Math.min(weeksCompleted, weeksTotal),
    weeksTotal,
    monthChallengeStarted,
    monthChallengeCompleted,
    certificateEarned,
    monthlyBadgeEarned,
    completedWeekNumbers,
  };
}

export function resolveMonthChallengeConfig(monthNumber = 1): MonthlyChallengeConfig {
  if (monthNumber === 1) return MONTH_1_CHALLENGE;
  return {
    ...MONTH_1_CHALLENGE,
    monthNumber,
    title: `Month ${monthNumber} Challenge`,
  };
}

export function resolveCertificateImageUrl(
  modules: AdventureModuleRecord[],
  monthNumber = 1,
): string | null {
  const weekModule = modules.find((module) => module.week_number === monthNumber * 4);
  const fallback = modules.find((module) => module.week_number === 4);
  const module = weekModule ?? fallback;
  return module?.certificate_pdf_or_image_url?.trim() || null;
}

async function fetchMonthClaimKeys(participantId: string): Promise<Set<string>> {
  if (!isSupabaseConfigured() || !supabase) return new Set();

  try {
    const { data, error } = await supabase
      .from('player_reward_claims')
      .select('reward_key')
      .eq('participant_id', participantId)
      .like('reward_key', `${MONTH_CHALLENGE_REWARD_KEY_PREFIX}%`);

    if (error) throw error;

    return new Set(
      (data ?? [])
        .map((row) => (row as { reward_key?: string | null }).reward_key?.trim() ?? '')
        .filter(Boolean),
    );
  } catch {
    return new Set();
  }
}

export async function getMonthlyChallengeProgress(
  childId: string,
  monthNumber = 1,
  completedMissionIds?: readonly string[],
): Promise<MonthlyChallengeProgress> {
  const participantId = childId.trim();
  const config = resolveMonthChallengeConfig(monthNumber);
  if (!participantId) {
    return deriveMonthlyChallengeProgress(config, [], new Set());
  }

  const [missionIds, claimKeys] = await Promise.all([
    completedMissionIds
      ? Promise.resolve([...completedMissionIds])
      : import('./weeklyBadgeUnlock').then((mod) =>
          mod.fetchParticipantCompletedMissionIds(participantId),
        ),
    fetchMonthClaimKeys(participantId),
  ]);

  return deriveMonthlyChallengeProgress(config, missionIds, claimKeys);
}

export async function syncMonthlyChallengeRewards(
  participantId: string,
  completedMissionIds: readonly string[],
): Promise<MonthlyChallengeProgress> {
  const config = MONTH_1_CHALLENGE;
  const claimKeys = await fetchMonthClaimKeys(participantId);
  const progress = deriveMonthlyChallengeProgress(config, completedMissionIds, claimKeys);

  if (!isSupabaseConfigured() || !supabase) return progress;

  const claimsToWrite: Array<{ reward_key: string; reward_name: string }> = [];

  if (progress.monthChallengeStarted && !claimKeys.has(monthChallengeStartedKey(config.monthNumber))) {
    claimsToWrite.push({
      reward_key: monthChallengeStartedKey(config.monthNumber),
      reward_name: config.title,
    });
  }

  if (progress.monthChallengeCompleted) {
    if (!claimKeys.has(monthChallengeCompletedKey(config.monthNumber))) {
      claimsToWrite.push({
        reward_key: monthChallengeCompletedKey(config.monthNumber),
        reward_name: config.title,
      });
    }
    if (!claimKeys.has(monthCertificateKey(config.monthNumber))) {
      claimsToWrite.push({
        reward_key: monthCertificateKey(config.monthNumber),
        reward_name: config.certificateName,
      });
    }
    if (!claimKeys.has(monthBadgeKey(config.monthNumber))) {
      claimsToWrite.push({
        reward_key: monthBadgeKey(config.monthNumber),
        reward_name: config.monthlyBadgeName,
      });
    }
  }

  for (const claim of claimsToWrite) {
    const { error } = await supabase.from('player_reward_claims').upsert(
      {
        participant_id: participantId,
        reward_key: claim.reward_key,
        reward_name: claim.reward_name,
        claimed_at: new Date().toISOString(),
      },
      { onConflict: 'participant_id,reward_key', ignoreDuplicates: true },
    );
    if (error && error.code !== '23505') {
      console.warn('[MONTHLY_CHALLENGE] Failed to write claim', error);
    }
  }

  if (progress.monthChallengeCompleted && config.bonusCoins > 0) {
    const bonusKey = `${MONTH_CHALLENGE_REWARD_KEY_PREFIX}${config.monthNumber}:bonus-coins`;
    if (!claimKeys.has(bonusKey)) {
      const { data: wallet } = await supabase
        .from('player_wallets')
        .select('total_coins')
        .eq('participant_id', participantId)
        .maybeSingle();
      const current = wallet?.total_coins ?? 0;
      await supabase.from('player_wallets').upsert(
        {
          participant_id: participantId,
          total_coins: current + config.bonusCoins,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'participant_id' },
      );
      await supabase.from('player_reward_claims').upsert(
        {
          participant_id: participantId,
          reward_key: bonusKey,
          reward_name: `${config.bonusCoins} Focus Coins`,
          claimed_at: new Date().toISOString(),
        },
        { onConflict: 'participant_id,reward_key', ignoreDuplicates: true },
      );
    }
  }

  return getMonthlyChallengeProgress(participantId, config.monthNumber, completedMissionIds);
}
