import { totalCourageMissionsForWeek } from '../data/courageMissionRewards';
import type { CourageInTheDarkProgressSnapshot } from '../types/courageMissionProgress';
import { resolvePlayerParticipantId } from './resolvePlayerParticipantId';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  isWeekBadgeEarnedFromState,
  loadWeeklyBadgeEarnedState,
} from './weeklyBadgeUnlock';
import { checkBaselineCompletion } from './baselineCompletion';
import { resolveTrackingProgramCode } from './activeProgramContext';
import { hasFamilyCompatibilitySession } from './familyPortalChildrenApi';
import { fetchFamilyCompatibilityChildProgressSnapshot } from './familyChildProgressApi';

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

export function mergeB4CheckInCompletion(
  completedMissionIds: string[],
  weekNumber: number,
  complete: boolean,
): string[] {
  if (weekNumber !== 1 || !complete || completedMissionIds.includes('b4-self-check-in')) {
    return completedMissionIds;
  }
  return [...completedMissionIds, 'b4-self-check-in'];
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
    if (hasFamilyCompatibilitySession()) {
      const [snapshot, b4CheckInComplete] = await Promise.all([
        fetchFamilyCompatibilityChildProgressSnapshot(participantId, weekId),
        weekNumber === 1
          ? checkBaselineCompletion(resolveTrackingProgramCode() ?? undefined, participantId)
          : Promise.resolve(false),
      ]);
      const completedMissionIds = mergeB4CheckInCompletion(
        snapshot.rows
          .map((row) => row.mission_id)
          .filter((missionId): missionId is string => typeof missionId === 'string'),
        weekNumber,
        b4CheckInComplete,
      );
      const unlockedBadges = snapshot.badges.length > 0
        ? snapshot.badges
        : [];
      return {
        completedMissionIds,
        completedCount: completedMissionIds.length,
        totalMissions,
        totalCoins: snapshot.totalCoins,
        unlockedBadges,
      };
    }

    const [progressResult, walletResult, weeklyBadgeState, b4CheckInComplete] = await Promise.all([
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
      weekNumber === 1
        ? checkBaselineCompletion(resolveTrackingProgramCode() ?? undefined, participantId)
        : Promise.resolve(false),
    ]);

    if (progressResult.error) {
      throw progressResult.error;
    }
    if (walletResult.error) {
      throw walletResult.error;
    }

    let completedMissionIds = (progressResult.data ?? [])
      .map((row) => row.mission_id)
      .filter((missionId): missionId is string => typeof missionId === 'string');
    completedMissionIds = mergeB4CheckInCompletion(
      completedMissionIds,
      weekNumber,
      b4CheckInComplete,
    );

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
