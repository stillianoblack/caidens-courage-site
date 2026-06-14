import { courageInTheDarkMissions } from './courageInTheDarkMap';
import type { CourageMissionCompletionPayload, CourageMissionRewardPayload } from '../types/courageMissionProgress';
import { resolvePlayerParticipantId } from '../lib/resolvePlayerParticipantId';

type CourageMissionReward = Omit<CourageMissionRewardPayload, 'week_id'>;

const COURAGE_MISSION_REWARDS: Record<string, CourageMissionReward> = {
  'caiden-courage-in-the-dark': {
    mission_id: 'caiden-courage-in-the-dark',
    character_id: 'caiden',
    mission_title: 'Courage by the Bridge',
    character_name: 'Caiden',
    coins_earned: 25,
    badge_unlocked: 'Cave Explorer Badge',
    reward_item: 'Cave Explorer Sticker',
  },
  'miranda-mystery': {
    mission_id: 'miranda-mystery',
    character_id: 'miranda',
    mission_title: "Miranda's Mystery",
    character_name: 'Miranda',
    coins_earned: 25,
    badge_unlocked: 'Mystery Solver Badge',
    reward_item: 'Miranda Clue Sticker',
  },
  'zeke-bridge-challenge': {
    mission_id: 'zeke-bridge-challenge',
    character_id: 'zeke',
    mission_title: "Zeke's Cave Challenge",
    character_name: 'Zeke',
    coins_earned: 25,
    badge_unlocked: 'Brave Bridge Badge',
    reward_item: 'Bridge Builder Sticker',
  },
  'charlie-discovery-zone': {
    mission_id: 'charlie-discovery-zone',
    character_id: 'charlie',
    mission_title: "Charlie's Discovery Zone",
    character_name: 'Charlie Perk',
    coins_earned: 25,
    badge_unlocked: 'Nature Explorer Badge',
    reward_item: 'Rainforest Discovery Sticker',
  },
  'b4-self-check-in': {
    mission_id: 'b4-self-check-in',
    character_id: 'b4',
    mission_title: 'B-4 Check-In Station',
    character_name: 'B-4',
    coins_earned: 10,
    badge_unlocked: 'Daily Check-In Spark',
    reward_item: 'Focus Flame Spark',
  },
};

const PATH_MISSION_MATCHERS: Array<{ test: (pathname: string) => boolean; missionId: string }> = [
  { test: (pathname) => /\/caiden\//.test(pathname), missionId: 'caiden-courage-in-the-dark' },
  { test: (pathname) => /\/miranda\//.test(pathname), missionId: 'miranda-mystery' },
  { test: (pathname) => /\/zeke\//.test(pathname), missionId: 'zeke-bridge-challenge' },
  { test: (pathname) => /\/charlie\//.test(pathname), missionId: 'charlie-discovery-zone' },
  { test: (pathname) => /\/b4\/check-in/.test(pathname), missionId: 'b4-self-check-in' },
];

const CHARACTER_PATH_MATCHERS: Array<{ test: (pathname: string) => boolean; character: string }> = [
  { test: (pathname) => /\/caiden\//.test(pathname), character: 'caiden' },
  { test: (pathname) => /\/miranda\//.test(pathname), character: 'miranda' },
  { test: (pathname) => /\/zeke\//.test(pathname), character: 'zeke' },
  { test: (pathname) => /\/charlie\//.test(pathname), character: 'charlie' },
  { test: (pathname) => /\/b4\//.test(pathname), character: 'b4' },
];

const CHARACTER_TO_BASE_MISSION: Record<string, string> = {
  caiden: 'caiden-courage-in-the-dark',
  miranda: 'miranda-mystery',
  zeke: 'zeke-bridge-challenge',
  charlie: 'charlie-discovery-zone',
  b4: 'b4-self-check-in',
};

export function weekIdFromNumber(week: number): string {
  return `week-${week}`;
}

export function resolveCourageMissionReward(missionId: string): CourageMissionReward | null {
  const weekScoped = /^(\w+)-week-(\d+)$/.exec(missionId);
  if (weekScoped) {
    const baseId = CHARACTER_TO_BASE_MISSION[weekScoped[1]];
    return baseId ? COURAGE_MISSION_REWARDS[baseId] ?? null : null;
  }
  return COURAGE_MISSION_REWARDS[missionId] ?? null;
}

export function buildCourageMissionRewardPayload(
  missionId: string,
  week: number,
): CourageMissionRewardPayload | null {
  const reward = resolveCourageMissionReward(missionId);
  if (!reward) return null;
  const scopedMissionId = week > 1 ? missionId : reward.mission_id;
  return {
    week_id: weekIdFromNumber(week),
    ...reward,
    mission_id: scopedMissionId,
  };
}

export function buildCourageMissionPayload(
  missionId: string,
  week: number,
  explicitParticipantId?: string,
): CourageMissionCompletionPayload | null {
  const rewardPayload = buildCourageMissionRewardPayload(missionId, week);
  const participantId = resolvePlayerParticipantId(explicitParticipantId);
  if (!rewardPayload || !participantId) return null;
  return {
    ...rewardPayload,
    participant_id: participantId,
  };
}

export function totalCourageMissionsForWeek(week: number, explicitCount?: number): number {
  if (typeof explicitCount === 'number' && explicitCount > 0) return explicitCount;
  if (week === 1) return courageInTheDarkMissions.length;
  return 5;
}

export function resolveWeekScopedMissionId(character: string, week: number): string {
  if (week <= 1) {
    return CHARACTER_TO_BASE_MISSION[character] ?? `${character}-week-${week}`;
  }
  return `${character}-week-${week}`;
}

export function resolveCourageMissionIdFromPathname(pathname: string, week = 1): string | null {
  if (week > 1) {
    const characterMatch = CHARACTER_PATH_MATCHERS.find((entry) => entry.test(pathname));
    if (!characterMatch) return null;
    return resolveWeekScopedMissionId(characterMatch.character, week);
  }

  const match = PATH_MISSION_MATCHERS.find((entry) => entry.test(pathname));
  return match?.missionId ?? null;
}
