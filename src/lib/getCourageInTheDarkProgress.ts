import { totalCourageMissionsForWeek } from '../data/courageMissionRewards';
import type { CourageInTheDarkProgressSnapshot } from '../types/courageMissionProgress';
import { resolvePlayerParticipantId } from './resolvePlayerParticipantId';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const EMPTY_PROGRESS: CourageInTheDarkProgressSnapshot = {
  completedMissionIds: [],
  completedCount: 0,
  totalMissions: 0,
  totalCoins: 0,
  unlockedBadges: [],
};

function weekNumberFromId(weekId: string): number {
  const match = /^week-(\d+)$/.exec(weekId);
  if (!match) return 1;
  const week = Number.parseInt(match[1], 10);
  return Number.isFinite(week) && week > 0 ? week : 1;
}

export async function getCourageInTheDarkProgress(
  weekId: string,
  explicitParticipantId?: string,
  explicitTotalMissions?: number,
): Promise<CourageInTheDarkProgressSnapshot> {
  const totalMissions =
    explicitTotalMissions ?? totalCourageMissionsForWeek(weekNumberFromId(weekId));

  if (!isSupabaseConfigured() || !supabase) {
    return { ...EMPTY_PROGRESS, totalMissions };
  }

  const participantId = resolvePlayerParticipantId(explicitParticipantId);
  if (!participantId) {
    return { ...EMPTY_PROGRESS, totalMissions };
  }

  try {
    const [progressResult, walletResult, badgesResult] = await Promise.all([
      supabase
        .from('player_progress')
        .select('mission_id')
        .eq('participant_id', participantId)
        .eq('week_id', weekId),
      supabase
        .from('player_wallets')
        .select('total_coins')
        .eq('participant_id', participantId)
        .maybeSingle(),
      supabase
        .from('player_badges')
        .select('badge_name')
        .eq('participant_id', participantId)
        .eq('week_id', weekId),
    ]);

    if (progressResult.error) {
      throw progressResult.error;
    }
    if (walletResult.error) {
      throw walletResult.error;
    }
    if (badgesResult.error) {
      throw badgesResult.error;
    }

    const completedMissionIds = (progressResult.data ?? [])
      .map((row) => row.mission_id)
      .filter((missionId): missionId is string => typeof missionId === 'string');

    const unlockedBadges = (badgesResult.data ?? [])
      .map((row) => row.badge_name)
      .filter((badge): badge is string => typeof badge === 'string');

    return {
      completedMissionIds,
      completedCount: completedMissionIds.length,
      totalMissions,
      totalCoins: walletResult.data?.total_coins ?? 0,
      unlockedBadges,
    };
  } catch (err) {
    console.warn('[COURAGE_PROGRESS] Failed to load Supabase progress', err);
    return { ...EMPTY_PROGRESS, totalMissions };
  }
}
