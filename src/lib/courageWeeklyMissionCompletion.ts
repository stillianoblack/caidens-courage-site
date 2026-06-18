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
import { fetchFamilyAdventureModules } from './adventureModuleService';
import { enrichCourageMissionRewardFromCms } from './cmsBadgeArtwork';

export function resolveWeeklyCourageMissionReward(
  pathname: string,
  search: string,
): CourageMissionRewardPayload | null {
  if (!isWeeklyAdventureSource(search)) {
    return null;
  }

  const context = readWeeklyAdventureRouteContext(search);
  const week = context.week && context.week > 0 ? context.week : 1;
  const missionId = resolveCourageMissionIdFromPathname(pathname, week);
  if (!missionId) {
    return null;
  }

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
      weekMissionsCompleted: 0,
      weekMissionsTotal: 5,
      weekBadgeUnlocked: false,
      weekBadgeJustUnlocked: false,
      rewardPending: false,
      rewardClaimed: true,
    };
  }

  const reward = resolveWeeklyCourageMissionReward(pathname, search);
  if (!reward) {
    return null;
  }

  const { modules } = await fetchFamilyAdventureModules();
  const enrichedReward = enrichCourageMissionRewardFromCms(reward, modules);

  const payload = buildCourageMissionPayload(
    enrichedReward.mission_id,
    parseWeekNumber(enrichedReward.week_id),
  );
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

  const cmsPayload: CourageMissionCompletionPayload = {
    ...payload,
    mission_title: enrichedReward.mission_title,
    badge_unlocked: enrichedReward.badge_unlocked,
    badge_image_url: enrichedReward.badge_image_url,
    week_number: enrichedReward.week_number,
    badge_week_label: enrichedReward.badge_week_label,
    badge_rarity: enrichedReward.badge_rarity,
    character_discovery_id: enrichedReward.character_discovery_id,
    character_discovery_name: enrichedReward.character_discovery_name,
    character_discovery_image_url: enrichedReward.character_discovery_image_url,
  };

  const result = await completeMissionWithSupabase(cmsPayload);

  if (result.ok) {
    if (!result.alreadyCompleted) {
      markRecentlyCompletedHotspot(payload.mission_id);
    }
    notifyModuleComplete({
      mission_id: payload.mission_id,
      week_id: payload.week_id,
      participant_id: payload.participant_id,
      already_completed: result.alreadyCompleted,
      new_coin_total: result.rewardClaimed && 'newCoinTotal' in result ? result.newCoinTotal : undefined,
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
