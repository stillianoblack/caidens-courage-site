import { isSupabaseConfigured, supabase } from './supabaseClient';
import { isWeekFullyComplete } from './weekBadgeProgression';

/** Upper bound when active weekly modules are not supplied. */
export const MAX_TRACKED_WEEKLY_BADGES = 12;

export type WeeklyBadgeEarnedState = {
  completedMissionIds: readonly string[];
  earnedWeeklyWeeks: ReadonlySet<number>;
};

export const EMPTY_WEEKLY_BADGE_EARNED: WeeklyBadgeEarnedState = {
  completedMissionIds: [],
  earnedWeeklyWeeks: new Set(),
};

export function deriveEarnedWeeklyWeekNumbers(
  completedMissionIds: readonly string[],
  activeWeekNumbers: readonly number[] = defaultActiveWeekNumbers(),
): ReadonlySet<number> {
  const earned = new Set<number>();
  for (const weekNumber of activeWeekNumbers) {
    if (weekNumber > 0 && isWeekFullyComplete(weekNumber, completedMissionIds)) {
      earned.add(weekNumber);
    }
  }
  return earned;
}

export function defaultActiveWeekNumbers(maxWeek = MAX_TRACKED_WEEKLY_BADGES): number[] {
  return Array.from({ length: maxWeek }, (_, index) => index + 1);
}

export async function fetchParticipantCompletedMissionIds(
  participantIdInput?: string,
): Promise<string[]> {
  const participantId = participantIdInput?.trim() ?? '';
  if (!participantId || !isSupabaseConfigured() || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('player_progress')
    .select('mission_id')
    .eq('participant_id', participantId);

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((row) => (row as { mission_id?: string | null }).mission_id?.trim() ?? '')
    .filter(Boolean);
}

export async function loadWeeklyBadgeEarnedState(
  participantIdInput?: string,
  activeWeekNumbers: readonly number[] = defaultActiveWeekNumbers(),
): Promise<WeeklyBadgeEarnedState> {
  const participantId = participantIdInput?.trim() ?? '';
  if (!participantId) {
    return EMPTY_WEEKLY_BADGE_EARNED;
  }

  try {
    const completedMissionIds = await fetchParticipantCompletedMissionIds(participantId);
    if (completedMissionIds.length === 0) {
      return EMPTY_WEEKLY_BADGE_EARNED;
    }

    return {
      completedMissionIds,
      earnedWeeklyWeeks: deriveEarnedWeeklyWeekNumbers(completedMissionIds, activeWeekNumbers),
    };
  } catch (err) {
    console.warn('[WEEKLY_BADGE_UNLOCK] Failed to load earned weekly badges', err);
    return EMPTY_WEEKLY_BADGE_EARNED;
  }
}

export function getEarnedWeeklyBadgesFromState(state: WeeklyBadgeEarnedState): number[] {
  return Array.from(state.earnedWeeklyWeeks).sort((left, right) => left - right);
}

/** Earned weekly badge week numbers for a child, derived from mission completion only. */
export async function getEarnedWeeklyBadges(
  childId: string,
  activeWeekNumbers?: readonly number[],
): Promise<number[]> {
  const state = await loadWeeklyBadgeEarnedState(childId, activeWeekNumbers);
  return getEarnedWeeklyBadgesFromState(state);
}

export function isWeekBadgeEarnedFromState(
  state: WeeklyBadgeEarnedState,
  weekNumber: number,
): boolean {
  if (!Number.isFinite(weekNumber) || weekNumber < 1) return false;
  return state.earnedWeeklyWeeks.has(weekNumber);
}

export async function isWeekBadgeEarned(childId: string, weekNumber: number): Promise<boolean> {
  const state = await loadWeeklyBadgeEarnedState(childId);
  return isWeekBadgeEarnedFromState(state, weekNumber);
}

export function getNextBadgeToEarnFromState(
  state: WeeklyBadgeEarnedState,
  activeWeekNumbers: readonly number[] = defaultActiveWeekNumbers(),
): number | null {
  const sortedWeeks = [...activeWeekNumbers].filter((week) => week > 0).sort((a, b) => a - b);
  for (const weekNumber of sortedWeeks) {
    if (!state.earnedWeeklyWeeks.has(weekNumber)) {
      return weekNumber;
    }
  }
  return null;
}

/** First active week whose badge has not been earned yet. */
export async function getNextBadgeToEarn(
  childId: string,
  activeWeekNumbers?: readonly number[],
): Promise<number | null> {
  const weeks = activeWeekNumbers ?? defaultActiveWeekNumbers();
  const state = await loadWeeklyBadgeEarnedState(childId, weeks);
  return getNextBadgeToEarnFromState(state, weeks);
}

export function resolveActiveWeekNumbersFromModules(
  modules: ReadonlyArray<{ week_number: number }>,
): number[] {
  const weeks = modules
    .map((module) => module.week_number)
    .filter((week) => Number.isFinite(week) && week > 0);
  if (weeks.length === 0) {
    return defaultActiveWeekNumbers();
  }
  return Array.from(new Set(weeks)).sort((left, right) => left - right);
}
