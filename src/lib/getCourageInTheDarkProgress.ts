import { totalCourageMissionsForWeek } from '../data/courageMissionRewards';
import type { CourageInTheDarkProgressSnapshot } from '../types/courageMissionProgress';
import { resolvePlayerParticipantId } from './resolvePlayerParticipantId';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  isWeekBadgeEarnedFromState,
  loadWeeklyBadgeEarnedState,
} from './weeklyBadgeUnlock';

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

  const weekNumber = weekNumberFromId(weekId);

  try {
    const [progressResult, walletResult, weeklyBadgeState] = await Promise.all([
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
      loadWeeklyBadgeEarnedState(participantId),
    ]);

    if (progressResult.error) {
      throw progressResult.error;
    }
    if (walletResult.error) {
      throw walletResult.error;
    }

    const completedMissionIds = (progressResult.data ?? [])
      .map((row) => row.mission_id)
      .filter((missionId): missionId is string => typeof missionId === 'string');

    const unlockedBadges: string[] = [];
    if (isWeekBadgeEarnedFromState(weeklyBadgeState, weekNumber)) {
      const { data: badgeRows, error: badgesError } = await supabase
        .from('player_badges')
        .select('badge_name')
        .eq('participant_id', participantId)
        .eq('week_id', weekId);

      if (badgesError) {
        throw badgesError;
      }

      for (const row of badgeRows ?? []) {
        const badgeName = (row as { badge_name?: string | null }).badge_name;
        if (typeof badgeName === 'string' && badgeName.trim()) {
          unlockedBadges.push(badgeName.trim());
        }
      }

      if (unlockedBadges.length === 0) {
        unlockedBadges.push(`Week ${weekNumber} Badge`);
      }
    }

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
