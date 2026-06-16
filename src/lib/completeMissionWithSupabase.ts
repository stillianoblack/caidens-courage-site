import type {
  CompleteMissionResult,
  CourageMissionCompletionPayload,
} from '../types/courageMissionProgress';
import { writeActiveChildParticipantId } from '../config/activeChildParticipant';
import { formatMissionSaveErrorMessage, formatSupabaseError } from './formatSupabaseError';
import {
  logPlayerParticipantContext,
  resolvePlayerParticipantContext,
} from './resolvePlayerParticipantId';
import { trackMonthlyCoinsEarned } from './monthlyCoinsEarnedTracking';
import { awardCharacterDiscovery } from './characterDiscoveryService';
import { syncMonthlyChallengeRewards } from './monthlyChallengeProgress';
import {
  ensureStudentParticipantForSave,
  isValidSupabaseParticipantId,
} from './pilotTrackingService';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  countCompletedWeekMissions,
  isWeekFullyComplete,
  parseWeekNumberFromPayload,
  resolveWeekBadgeMissionId,
  resolveWeekMissionsTotal,
} from './weekBadgeProgression';

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

async function resolveWeekProgressSnapshot(
  participantId: string,
  weekId: string,
  weekNumber: number,
  badgeName: string,
  includeMissionId?: string,
): Promise<{
  weekMissionsCompleted: number;
  weekMissionsTotal: number;
  weekBadgeUnlocked: boolean;
  completedMissionIds: string[];
}> {
  const storedIds = await readWeekMissionIds(participantId, weekId);
  const completedMissionIds = includeMissionId
    ? Array.from(new Set([...storedIds, includeMissionId]))
    : storedIds;
  const weekMissionsCompleted = countCompletedWeekMissions(weekNumber, completedMissionIds);
  const weekMissionsTotal = resolveWeekMissionsTotal(weekNumber);
  const weekBadgeUnlocked =
    Boolean(badgeName.trim()) && isWeekFullyComplete(weekNumber, completedMissionIds);

  return {
    weekMissionsCompleted,
    weekMissionsTotal,
    weekBadgeUnlocked,
    completedMissionIds,
  };
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
    mission_id: resolveWeekBadgeMissionId(input.weekId),
    badge_name: input.badgeName.trim(),
  };
  const { error: badgeError } = await supabase.from('player_badges').insert(badgeRow);
  if (badgeError && badgeError.code !== '23505') {
    throw badgeError;
  }
  return true;
}

async function readWalletTotal(participantId: string): Promise<number> {
  if (!supabase) return 0;

  const { data, error } = await supabase
    .from('player_wallets')
    .select('total_coins')
    .eq('participant_id', participantId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.total_coins ?? 0;
}

async function writeWalletTotal(participantId: string, totalCoins: number): Promise<void> {
  if (!supabase) return;

  const { data: existing, error: readError } = await supabase
    .from('player_wallets')
    .select('participant_id')
    .eq('participant_id', participantId)
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  const payload = {
    participant_id: participantId,
    total_coins: totalCoins,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { error: updateError } = await supabase
      .from('player_wallets')
      .update(payload)
      .eq('participant_id', participantId);
    if (updateError) {
      throw updateError;
    }
    return;
  }

  const { error: insertError } = await supabase.from('player_wallets').insert(payload);
  if (insertError) {
    throw insertError;
  }
}

async function resolveEnsuredParticipantId(
  initialParticipantId: string | null,
): Promise<{ participantId: string | null; ensureError?: string }> {
  if (!initialParticipantId) {
    return { participantId: null };
  }

  if (!isValidSupabaseParticipantId(initialParticipantId)) {
    try {
      const ensured = await ensureStudentParticipantForSave({
        participantId: initialParticipantId,
      });
      if (ensured.participantId !== initialParticipantId) {
        writeActiveChildParticipantId(ensured.participantId);
      }
      console.info('[MISSION_COMPLETE] ensured participant for save', {
        initial_participant_id: initialParticipantId,
        ensured_participant_id: ensured.participantId,
        source: ensured.source,
      });
      return { participantId: ensured.participantId };
    } catch (err) {
      return {
        participantId: null,
        ensureError: formatSupabaseError(err),
      };
    }
  }

  try {
    const ensured = await ensureStudentParticipantForSave({
      participantId: initialParticipantId,
    });
    if (ensured.participantId !== initialParticipantId) {
      writeActiveChildParticipantId(ensured.participantId);
    }
    console.info('[MISSION_COMPLETE] verified participant for save', {
      participant_id: ensured.participantId,
      source: ensured.source,
    });
    return { participantId: ensured.participantId };
  } catch (err) {
    console.warn('[MISSION_COMPLETE] participant ensure failed — using resolved id', err);
    return { participantId: initialParticipantId, ensureError: formatSupabaseError(err) };
  }
}

export async function completeMissionWithSupabase(
  payload: CourageMissionCompletionPayload,
): Promise<CompleteMissionResult> {
  const participantContext = resolvePlayerParticipantContext(payload.participant_id);
  logPlayerParticipantContext(participantContext);

  console.info('[MISSION_COMPLETE] mission payload', payload);

  if (!isSupabaseConfigured() || !supabase) {
    return {
      ok: false,
      error: 'supabase_unavailable',
      message: 'Progress could not be saved. Supabase is not connected.',
    };
  }

  const { participantId: ensuredParticipantId, ensureError } = await resolveEnsuredParticipantId(
    payload.participant_id?.trim() || participantContext.participantId,
  );

  if (!ensuredParticipantId) {
    const debugError = ensureError ?? 'No active child participant_id found';
    console.warn('[MISSION_COMPLETE] missing participant_id', {
      ensure_error: ensureError,
      sources: participantContext.sources,
    });
    return {
      ok: false,
      error: 'no_active_child',
      message: 'Select a child in the Family Portal to save mission progress.',
      debugError,
    };
  }

  const savePayload: CourageMissionCompletionPayload = {
    ...payload,
    participant_id: ensuredParticipantId,
  };

  try {
    const { data: existing, error: existingError } = await supabase
      .from('player_progress')
      .select('id')
      .eq('participant_id', ensuredParticipantId)
      .eq('mission_id', savePayload.mission_id)
      .maybeSingle();

    console.info('[MISSION_COMPLETE] existing progress lookup', {
      participant_id: ensuredParticipantId,
      mission_id: savePayload.mission_id,
      existing,
      error: existingError ? formatSupabaseError(existingError) : null,
    });

    if (existingError) {
      throw existingError;
    }

    if (existing) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[MISSION_COMPLETE] duplicate award prevented', {
          participant_id: ensuredParticipantId,
          mission_id: savePayload.mission_id,
        });
      }
      const weekNumber = parseWeekNumberFromPayload(savePayload.week_id, savePayload.week_number);
      const { completedMissionIds: _omit, ...weekProgress } = await resolveWeekProgressSnapshot(
        ensuredParticipantId,
        savePayload.week_id,
        weekNumber,
        savePayload.badge_unlocked,
      );
      return {
        ok: true,
        alreadyCompleted: true,
        ...weekProgress,
        weekBadgeJustUnlocked: false,
      };
    }

    if (!savePayload.mission_id && process.env.NODE_ENV === 'development') {
      console.warn('[MISSION_COMPLETE] mission_id missing on save payload');
    }

    const oldCoinTotal = await readWalletTotal(ensuredParticipantId);
    const newCoinTotal = oldCoinTotal + savePayload.coins_earned;

    const weekNumber = parseWeekNumberFromPayload(savePayload.week_id, savePayload.week_number);
    const weekProgressBefore = await resolveWeekProgressSnapshot(
      ensuredParticipantId,
      savePayload.week_id,
      weekNumber,
      savePayload.badge_unlocked,
    );
    const weekCompleteAfterMission = isWeekFullyComplete(weekNumber, [
      ...weekProgressBefore.completedMissionIds,
      savePayload.mission_id,
    ]);

    const progressRow = {
      participant_id: ensuredParticipantId,
      week_id: savePayload.week_id,
      mission_id: savePayload.mission_id,
      character_id: savePayload.character_id,
      mission_title: savePayload.mission_title,
      character_name: savePayload.character_name,
      coins_earned: savePayload.coins_earned,
      badge_unlocked: weekCompleteAfterMission ? savePayload.badge_unlocked : null,
      reward_item: savePayload.reward_item,
    };

    const { data: progressData, error: progressError } = await supabase
      .from('player_progress')
      .insert(progressRow)
      .select('id')
      .maybeSingle();

    console.info('[MISSION_COMPLETE] player_progress insert', {
      row: progressRow,
      data: progressData,
      error: progressError ? formatSupabaseError(progressError) : null,
    });

    if (progressError) {
      if (progressError.code === '23505') {
        const { completedMissionIds: _omit, ...weekProgress } = await resolveWeekProgressSnapshot(
          ensuredParticipantId,
          savePayload.week_id,
          weekNumber,
          savePayload.badge_unlocked,
        );
        return {
          ok: true,
          alreadyCompleted: true,
          ...weekProgress,
          weekBadgeJustUnlocked: false,
        };
      }
      throw progressError;
    }

    await writeWalletTotal(ensuredParticipantId, newCoinTotal);
    console.info('[MISSION_COMPLETE] player_wallets updated', {
      participant_id: ensuredParticipantId,
      oldCoinTotal,
      newCoinTotal,
    });

    const completedMissionIds = Array.from(
      new Set([...weekProgressBefore.completedMissionIds, savePayload.mission_id]),
    );
    const weekBadgeJustUnlocked = await awardWeekBadgeIfComplete({
      participantId: ensuredParticipantId,
      weekId: savePayload.week_id,
      weekNumber,
      badgeName: savePayload.badge_unlocked,
      completedMissionIds,
    });
    const weekMissionsCompleted = countCompletedWeekMissions(weekNumber, completedMissionIds);
    const weekMissionsTotal = resolveWeekMissionsTotal(weekNumber);
    const weekBadgeUnlocked = isWeekFullyComplete(weekNumber, completedMissionIds);

    if (savePayload.coins_earned > 0) {
      trackMonthlyCoinsEarned(ensuredParticipantId, savePayload.coins_earned);
    }

    await awardCharacterDiscovery(ensuredParticipantId, savePayload.mission_id);
    await syncMonthlyChallengeRewards(ensuredParticipantId, completedMissionIds);

    return {
      ok: true,
      alreadyCompleted: false,
      oldCoinTotal,
      newCoinTotal,
      coinsEarned: savePayload.coins_earned,
      weekMissionsCompleted,
      weekMissionsTotal,
      weekBadgeUnlocked,
      weekBadgeJustUnlocked,
    };
  } catch (err) {
    const debugError = formatSupabaseError(err);
    console.warn('[MISSION_COMPLETE] Supabase save failed', {
      participant_id: ensuredParticipantId,
      mission_id: savePayload.mission_id,
      error: debugError,
      raw: err,
    });
    return {
      ok: false,
      error: 'save_failed',
      message: formatMissionSaveErrorMessage(debugError),
      debugError,
    };
  }
}
