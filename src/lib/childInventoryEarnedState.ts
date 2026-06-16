import type { NormalizedOwnedBadge } from './cmsBadgeArtwork';
import { isCheckInMissionId } from './cmsBadgeArtwork';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import { isWeekFullyComplete } from './weekBadgeProgression';
import {
  EMPTY_WEEKLY_BADGE_EARNED,
  loadWeeklyBadgeEarnedState,
  type WeeklyBadgeEarnedState,
} from './weeklyBadgeUnlock';

export type ChildBadgeEarnedInput = WeeklyBadgeEarnedState & {
  ownsCheckIn: boolean;
};

const EMPTY_EARNED: ChildBadgeEarnedInput = {
  ownsCheckIn: false,
  ...EMPTY_WEEKLY_BADGE_EARNED,
};

function isCheckInMissionComplete(missionId: string): boolean {
  const id = missionId.trim();
  if (!id) return false;
  return isCheckInMissionId(id) || /^b4-check-in/i.test(id);
}

async function resolveCheckInOwned(
  participantId: string,
  completedMissionIds: readonly string[],
): Promise<boolean> {
  const ownsCheckInFromMissions = completedMissionIds.some(isCheckInMissionComplete);
  if (ownsCheckInFromMissions) return true;

  if (!isSupabaseConfigured() || !supabase) return false;

  const { data, error } = await supabase
    .from('player_badges')
    .select('badge_name, mission_id')
    .eq('participant_id', participantId);

  if (error) {
    throw error;
  }

  return (data ?? []).some((row) => {
    const missionId = (row as { mission_id?: string | null }).mission_id;
    const badgeName = (row as { badge_name?: string | null }).badge_name?.trim() ?? '';
    return isCheckInMissionComplete(missionId ?? '') || /check-in|daily check-in/i.test(badgeName);
  });
}

export async function loadChildBadgeEarnedState(
  participantIdInput?: string,
  activeWeekNumbers?: readonly number[],
): Promise<ChildBadgeEarnedInput> {
  const participantId = participantIdInput?.trim() ?? '';
  if (!participantId) {
    return EMPTY_EARNED;
  }

  try {
    const weeklyState = await loadWeeklyBadgeEarnedState(participantId, activeWeekNumbers);
    if (weeklyState.completedMissionIds.length === 0) {
      const ownsCheckIn = await resolveCheckInOwned(participantId, []);
      return {
        ownsCheckIn,
        completedMissionIds: [],
        earnedWeeklyWeeks: new Set(),
      };
    }

    const ownsCheckIn = await resolveCheckInOwned(participantId, weeklyState.completedMissionIds);
    return {
      ...weeklyState,
      ownsCheckIn,
    };
  } catch (err) {
    console.warn('[INVENTORY] Failed to load child badge earned state', err);
    return EMPTY_EARNED;
  }
}

export {
  getEarnedWeeklyBadges,
  getNextBadgeToEarn,
  isWeekBadgeEarned,
  loadWeeklyBadgeEarnedState,
  resolveActiveWeekNumbersFromModules,
} from './weeklyBadgeUnlock';

export function toNormalizedOwnedBadges(input: ChildBadgeEarnedInput): NormalizedOwnedBadge[] {
  const badges: NormalizedOwnedBadge[] = [];
  if (input.ownsCheckIn) {
    badges.push({ kind: 'check-in', name: 'B-4 Check-In Reward', weekNumber: null });
  }
  for (const weekNumber of Array.from(input.earnedWeeklyWeeks).sort((a, b) => a - b)) {
    badges.push({
      kind: 'weekly',
      name: `week-${weekNumber}`,
      weekNumber,
    });
  }
  return badges;
}

export type LockedBadgeGuidance = {
  action: 'navigate_week' | 'navigate_baseline' | 'blocked';
  message: string;
  weekNumber?: number;
};

export function resolveLockedBadgeGuidance(
  entry: {
    kind: 'check-in' | 'weekly' | 'monthly';
    weekNumber: number | null;
    unlockRequirement: string;
  },
  earned: ChildBadgeEarnedInput,
): LockedBadgeGuidance | null {
  if (entry.kind === 'monthly') {
    return {
      action: 'blocked',
      message: entry.unlockRequirement,
    };
  }

  if (entry.kind === 'check-in') {
    if (earned.ownsCheckIn) return null;
    return {
      action: 'navigate_baseline',
      message: 'Complete the B-4 Check-In to earn this badge.',
    };
  }

  const weekNumber = entry.weekNumber;
  if (!weekNumber || weekNumber < 1) return null;
  if (earned.earnedWeeklyWeeks.has(weekNumber)) return null;

  if (weekNumber > 1 && !isWeekFullyComplete(weekNumber - 1, earned.completedMissionIds)) {
    return {
      action: 'blocked',
      message: `Complete Week ${weekNumber - 1} before Week ${weekNumber} unlocks.`,
    };
  }

  if (weekNumber === 1) {
    return {
      action: 'navigate_week',
      weekNumber: 1,
      message: 'Head to Week 1 adventures to start earning this badge.',
    };
  }

  return {
    action: 'navigate_week',
    weekNumber,
    message: entry.unlockRequirement,
  };
}
