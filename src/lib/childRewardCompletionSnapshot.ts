import type { AdventureModuleRecord } from '../types/adventureModule';
import { countCompletedMapMissions } from './adventureWeekCompletion';
import type { EarnedCharacterDiscovery } from './characterDiscoveryService';
import {
  loadChildProgressStatus,
  resolveWeekMapMissionsForProgress,
  type ChildProgressStatus,
  type WeekProgressOptions,
} from './childProgressStatus';
import { loadParticipantQuests } from './participantQuestService';
import { resolveActiveWeekNumbersFromModules } from './weeklyBadgeUnlock';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export type ChildWeekMissionProgress = {
  weekNumber: number;
  completed: number;
  total: number;
  complete: boolean;
};

export type ChildRewardCompletionSnapshot = ChildProgressStatus & {
  participantId: string;
  coinBalance: number;
  weekProgressByWeek: Record<number, ChildWeekMissionProgress>;
  discoveryCountByCharacter: Record<string, number>;
};

async function readCoinBalance(participantId: string): Promise<number> {
  if (!isSupabaseConfigured() || !supabase) return 0;
  const { data, error } = await supabase
    .from('player_wallets')
    .select('total_coins')
    .eq('participant_id', participantId)
    .maybeSingle();
  if (error) return 0;
  return data?.total_coins ?? 0;
}

function buildDiscoveryCountByCharacter(
  discoveries: readonly EarnedCharacterDiscovery[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const entry of discoveries) {
    const charId = entry.definition.characterId.trim().toLowerCase();
    if (!charId) continue;
    counts[charId] = (counts[charId] ?? 0) + 1;
  }
  return counts;
}

export type LoadChildRewardCompletionOptions = WeekProgressOptions & {
  cmsModules?: readonly AdventureModuleRecord[];
};

/** Single source of truth for mission weeks, badges, discoveries, and per-week counts. */
export async function loadChildRewardCompletionSnapshot(
  participantIdInput?: string,
  options: LoadChildRewardCompletionOptions = {},
): Promise<ChildRewardCompletionSnapshot | null> {
  const participantId = participantIdInput?.trim() ?? '';
  if (!participantId) return null;

  const cmsModules = options.cmsModules ?? [];
  const paths = options.paths;
  const progress = await loadChildProgressStatus(participantId, { cmsModules, paths });
  const coinBalance = await readCoinBalance(participantId);

  const activeWeeks =
    cmsModules.length > 0
      ? resolveActiveWeekNumbersFromModules(cmsModules)
      : Object.keys(progress.completedByWeek)
          .map((key) => Number.parseInt(key, 10))
          .filter((week) => Number.isFinite(week) && week > 0)
          .sort((a, b) => a - b);

  const weekProgressByWeek: Record<number, ChildWeekMissionProgress> = {};
  for (const weekNumber of activeWeeks) {
    const mapMissions = resolveWeekMapMissionsForProgress(weekNumber, cmsModules, paths);
    const completedIds = progress.completedByWeek[weekNumber] ?? [];
    const completed = countCompletedMapMissions(mapMissions, completedIds);
    weekProgressByWeek[weekNumber] = {
      weekNumber,
      completed,
      total: mapMissions.length,
      complete: progress.completedWeekNumbers.includes(weekNumber),
    };
  }

  const snapshot: ChildRewardCompletionSnapshot = {
    ...progress,
    participantId,
    coinBalance,
    weekProgressByWeek,
    discoveryCountByCharacter: buildDiscoveryCountByCharacter(progress.earnedDiscoveries),
  };

  if (process.env.NODE_ENV === 'development') {
    console.info('[CHILD_REWARD_SNAPSHOT]', {
      participantId,
      completedWeekNumbers: snapshot.completedWeekNumbers,
      earnedWeeklyWeeks: Array.from(snapshot.weeklyBadgeState.earnedWeeklyWeeks),
      claimedWeeklyWeeks: Array.from(snapshot.weeklyBadgeState.claimedWeeklyWeeks ?? []),
      ownsCheckIn: snapshot.ownsCheckIn,
      discoveryCount: snapshot.earnedDiscoveries.length,
      coinBalance,
    });
  }

  return snapshot;
}

export function resolveWeekMissionProgressFromSnapshot(
  snapshot: ChildRewardCompletionSnapshot,
  weekNumber: number,
): ChildWeekMissionProgress {
  return (
    snapshot.weekProgressByWeek[weekNumber] ?? {
      weekNumber,
      completed: 0,
      total: 0,
      complete: false,
    }
  );
}

/** Dev-only console audit for one participant's reward/completion state. */
export async function auditChildRewardCompletion(
  participantIdInput?: string,
  options: LoadChildRewardCompletionOptions = {},
): Promise<ChildRewardCompletionSnapshot | null> {
  const participantId = participantIdInput?.trim() ?? '';
  if (!participantId) {
    console.warn('[CHILD_REWARD_AUDIT] missing participantId');
    return null;
  }

  const snapshot = await loadChildRewardCompletionSnapshot(participantId, options);
  if (!snapshot) return null;

  const weekId = 'week-1';
  const week1 = snapshot.weekProgressByWeek[1];
  const quests = await loadParticipantQuests(participantId, weekId, {
    completedWeekMissions: week1?.completed ?? 0,
    monthlyCoinsEarned: 0,
    dailyAdventureComplete: false,
  });

  if (process.env.NODE_ENV === 'development') {
    console.info('[CHILD_REWARD_AUDIT]', {
      participantId,
      completedWeeks: snapshot.completedWeekNumbers,
      earnedBadges: Array.from(snapshot.weeklyBadgeState.earnedWeeklyWeeks),
      claimedBadges: Array.from(snapshot.weeklyBadgeState.claimedWeeklyWeeks ?? []),
      ownsCheckIn: snapshot.ownsCheckIn,
      discoveries: snapshot.earnedDiscoveries.map((row) => row.definition.id),
      discoveryByCharacter: snapshot.discoveryCountByCharacter,
      weekProgress: snapshot.weekProgressByWeek,
      quests: quests.map((row) => ({
        key: row.questKey,
        period: row.period,
        progress: row.progressCount,
        target: row.targetCount,
        claimed: row.claimed,
      })),
      coinBalance: snapshot.coinBalance,
      completedMissionIds: snapshot.weeklyBadgeState.completedMissionIds,
    });
  }

  return snapshot;
}

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const globalWindow = window as Window & {
    auditChildRewards?: typeof auditChildRewardCompletion;
  };
  globalWindow.auditChildRewards = auditChildRewardCompletion;
}
