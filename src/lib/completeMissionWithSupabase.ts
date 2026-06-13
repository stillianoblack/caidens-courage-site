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
import {
  ensureStudentParticipantForSave,
  isValidSupabaseParticipantId,
} from './pilotTrackingService';
import { supabase, isSupabaseConfigured } from './supabaseClient';

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
      return { ok: true, alreadyCompleted: true };
    }

    if (!savePayload.mission_id && process.env.NODE_ENV === 'development') {
      console.warn('[MISSION_COMPLETE] mission_id missing on save payload');
    }

    const oldCoinTotal = await readWalletTotal(ensuredParticipantId);
    const newCoinTotal = oldCoinTotal + savePayload.coins_earned;

    const progressRow = {
      participant_id: ensuredParticipantId,
      week_id: savePayload.week_id,
      mission_id: savePayload.mission_id,
      character_id: savePayload.character_id,
      mission_title: savePayload.mission_title,
      character_name: savePayload.character_name,
      coins_earned: savePayload.coins_earned,
      badge_unlocked: savePayload.badge_unlocked,
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
        return { ok: true, alreadyCompleted: true };
      }
      throw progressError;
    }

    await writeWalletTotal(ensuredParticipantId, newCoinTotal);
    console.info('[MISSION_COMPLETE] player_wallets updated', {
      participant_id: ensuredParticipantId,
      oldCoinTotal,
      newCoinTotal,
    });

    if (savePayload.badge_unlocked) {
      const badgeRow = {
        participant_id: ensuredParticipantId,
        week_id: savePayload.week_id,
        mission_id: savePayload.mission_id,
        badge_name: savePayload.badge_unlocked,
      };
      const { data: badgeData, error: badgeError } = await supabase
        .from('player_badges')
        .insert(badgeRow)
        .select('id')
        .maybeSingle();

      console.info('[MISSION_COMPLETE] player_badges insert', {
        row: badgeRow,
        data: badgeData,
        error: badgeError ? formatSupabaseError(badgeError) : null,
      });

      if (badgeError && badgeError.code !== '23505') {
        throw badgeError;
      }
    }

    if (savePayload.coins_earned > 0) {
      trackMonthlyCoinsEarned(ensuredParticipantId, savePayload.coins_earned);
    }

    return {
      ok: true,
      alreadyCompleted: false,
      oldCoinTotal,
      newCoinTotal,
      coinsEarned: savePayload.coins_earned,
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
