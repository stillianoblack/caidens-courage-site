import {
  buildCourageMissionPayload,
  buildCourageMissionRewardPayload,
  resolveCourageMissionIdFromPathname,
} from '../data/courageMissionRewards';
import type {
  CompleteMissionResult,
  CourageMissionCompletionPayload,
  CourageMissionRewardPayload,
} from '../types/courageMissionProgress';
import { notifyModuleComplete } from './activeChildContext';
import { markRecentlyCompletedHotspot } from './courageMapReturnFeedback';
import { notifyFocusCoinWalletUpdated } from '../hooks/useFocusCoinWallet';
import { completeMissionWithSupabase } from './completeMissionWithSupabase';
import { ensureWeekGradeLevel } from './participantWeekGradeService';
import {
  logPlayerParticipantContext,
  resolvePlayerParticipantContext,
} from './resolvePlayerParticipantId';
import { isAdminAdventurePreviewActive } from './adventureVisibility';
import {
  isWeeklyAdventureSource,
  readWeeklyAdventureRouteContext,
} from './weeklyAdventureRouteContext';

export function resolveWeeklyCourageMissionReward(
  pathname: string,
  search: string,
): CourageMissionRewardPayload | null {
  if (!isWeeklyAdventureSource(search)) {
    return null;
  }

  const missionId = resolveCourageMissionIdFromPathname(pathname);
  if (!missionId) {
    return null;
  }

  const context = readWeeklyAdventureRouteContext(search);
  const week = context.week && context.week > 0 ? context.week : 1;
  return buildCourageMissionRewardPayload(missionId, week);
}

/** @deprecated Use resolveWeeklyCourageMissionReward */
export function resolveWeeklyCourageMissionPayload(
  pathname: string,
  search: string,
): CourageMissionRewardPayload | null {
  return resolveWeeklyCourageMissionReward(pathname, search);
}

export async function completeWeeklyCourageMission(
  pathname: string,
  search: string,
): Promise<CompleteMissionResult | null> {
  if (isAdminAdventurePreviewActive(search)) {
    return {
      ok: true,
      alreadyCompleted: true,
    };
  }

  const reward = resolveWeeklyCourageMissionReward(pathname, search);
  if (!reward) {
    return null;
  }

  const payload = buildCourageMissionPayload(reward.mission_id, parseWeekNumber(reward.week_id));
  if (!payload) {
    const context = resolvePlayerParticipantContext();
    logPlayerParticipantContext(context, '[MISSION_COMPLETE] weekly payload build failed');
    return {
      ok: false,
      error: 'no_active_child',
      message: 'Select a child in the Family Portal to save mission progress.',
      debugError: context.participantId
        ? 'Could not build mission payload'
        : 'No participant_id resolved from Family Portal context',
    };
  }

  void ensureWeekGradeLevel(payload.participant_id, payload.week_id);
  markDailyAdventureComplete(payload.participant_id);

  const result = await completeMissionWithSupabase(payload);

  if (result.ok) {
    if (!result.alreadyCompleted && 'newCoinTotal' in result) {
      notifyFocusCoinWalletUpdated(result.newCoinTotal);
      markRecentlyCompletedHotspot(payload.mission_id);
    }
    notifyModuleComplete({
      mission_id: payload.mission_id,
      week_id: payload.week_id,
      participant_id: payload.participant_id,
      already_completed: result.alreadyCompleted,
      new_coin_total:
        !result.alreadyCompleted && 'newCoinTotal' in result ? result.newCoinTotal : undefined,
    });
  }

  return result;
}

function parseWeekNumber(weekId: string): number {
  const match = /^week-(\d+)$/.exec(weekId);
  if (!match) return 1;
  const week = Number.parseInt(match[1], 10);
  return Number.isFinite(week) && week > 0 ? week : 1;
}

export type { CourageMissionCompletionPayload, CourageMissionRewardPayload };

function dailyQuestStorageKey(participantId: string): string {
  return `cc-daily-quest-${participantId}-${new Date().toISOString().slice(0, 10)}`;
}

export function markDailyAdventureComplete(participantId: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(dailyQuestStorageKey(participantId), '1');
  } catch {
    /* ignore */
  }
}

export function isDailyAdventureComplete(participantId: string | null | undefined): boolean {
  if (!participantId || typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(dailyQuestStorageKey(participantId)) === '1';
  } catch {
    return false;
  }
}
