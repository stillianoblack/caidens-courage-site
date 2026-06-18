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
import { isMissionRewardClaimed } from './missionRewardClaimService';
import {
  ensureStudentParticipantForSave,
  isValidSupabaseParticipantId,
} from './pilotTrackingService';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  countCompletedWeekMissions,
  isWeekFullyComplete,
  parseWeekNumberFromPayload,
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

function buildSuccessResult(
  input: {
    alreadyCompleted: boolean;
    coinsEarned: number;
    weekMissionsCompleted: number;
    weekMissionsTotal: number;
    weekBadgeUnlocked: boolean;
    weekBadgeJustUnlocked: boolean;
    rewardPending: boolean;
    rewardClaimed: boolean;
    oldCoinTotal?: number;
    newCoinTotal?: number;
  },
): CompleteMissionResult {
  if (input.alreadyCompleted) {
    return {
      ok: true,
      alreadyCompleted: true,
      weekMissionsCompleted: input.weekMissionsCompleted,
      weekMissionsTotal: input.weekMissionsTotal,
      weekBadgeUnlocked: input.weekBadgeUnlocked,
      weekBadgeJustUnlocked: input.weekBadgeJustUnlocked,
      rewardPending: input.rewardPending,
      rewardClaimed: input.rewardClaimed,
    };
  }

  return {
    ok: true,
    alreadyCompleted: false,
    coinsEarned: input.coinsEarned,
    oldCoinTotal: input.oldCoinTotal,
    newCoinTotal: input.newCoinTotal,
    weekMissionsCompleted: input.weekMissionsCompleted,
    weekMissionsTotal: input.weekMissionsTotal,
    weekBadgeUnlocked: input.weekBadgeUnlocked,
    weekBadgeJustUnlocked: input.weekBadgeJustUnlocked,
    rewardPending: input.rewardPending,
    rewardClaimed: input.rewardClaimed,
  };
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

    const weekNumber = parseWeekNumberFromPayload(savePayload.week_id, savePayload.week_number);
    const rewardClaimed = await isMissionRewardClaimed(ensuredParticipantId, savePayload.mission_id);

    if (existing) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[MISSION_COMPLETE] duplicate award prevented', {
          participant_id: ensuredParticipantId,
          mission_id: savePayload.mission_id,
        });
        console.info('[MISSION_REWARD_WRITE]', {
          participantId: ensuredParticipantId,
          missionId: savePayload.mission_id,
          state: rewardClaimed ? 'already_claimed' : 'pending_claim',
        });
      }
      const { completedMissionIds: _omit, ...weekProgress } = await resolveWeekProgressSnapshot(
        ensuredParticipantId,
        savePayload.week_id,
        weekNumber,
        savePayload.badge_unlocked,
      );
      return buildSuccessResult({
        alreadyCompleted: true,
        coinsEarned: savePayload.coins_earned,
        ...weekProgress,
        weekBadgeJustUnlocked: false,
        rewardPending: !rewardClaimed,
        rewardClaimed,
      });
    }

    if (!savePayload.mission_id && process.env.NODE_ENV === 'development') {
      console.warn('[MISSION_COMPLETE] mission_id missing on save payload');
    }

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
      completed_at: new Date().toISOString(),
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
        const claimed = await isMissionRewardClaimed(ensuredParticipantId, savePayload.mission_id);
        const { completedMissionIds: _omit, ...weekProgress } = await resolveWeekProgressSnapshot(
          ensuredParticipantId,
          savePayload.week_id,
          weekNumber,
          savePayload.badge_unlocked,
        );
        return buildSuccessResult({
          alreadyCompleted: true,
          coinsEarned: savePayload.coins_earned,
          ...weekProgress,
          weekBadgeJustUnlocked: false,
          rewardPending: !claimed,
          rewardClaimed: claimed,
        });
      }
      throw progressError;
    }

    const completedMissionIds = Array.from(
      new Set([...weekProgressBefore.completedMissionIds, savePayload.mission_id]),
    );
    const weekMissionsCompleted = countCompletedWeekMissions(weekNumber, completedMissionIds);
    const weekMissionsTotal = resolveWeekMissionsTotal(weekNumber);
    const weekBadgeUnlocked = isWeekFullyComplete(weekNumber, completedMissionIds);

    if (process.env.NODE_ENV === 'development') {
      console.info('[MISSION_REWARD_WRITE]', {
        participantId: ensuredParticipantId,
        missionId: savePayload.mission_id,
        weekId: savePayload.week_id,
        coinsPending: savePayload.coins_earned,
        state: 'pending_claim',
      });
    }

    return buildSuccessResult({
      alreadyCompleted: false,
      coinsEarned: savePayload.coins_earned,
      weekMissionsCompleted,
      weekMissionsTotal,
      weekBadgeUnlocked,
      weekBadgeJustUnlocked: false,
      rewardPending: true,
      rewardClaimed: false,
    });
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
