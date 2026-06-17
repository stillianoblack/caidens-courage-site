import type { AdventureModuleRecord } from '../types/adventureModule';
import type { AdventureMonthRecord, AdventureMonthReleaseMode } from '../types/adventureMonth';
import {
  isPreviewingAdventure,
  isUnlockDatePassed,
  type AdventureVisibilityContext,
} from './adventureVisibility';

export type WeekAvailabilityStatus = 'available' | 'locked';

export type WeekAvailabilityResult = {
  weekStatus: WeekAvailabilityStatus;
  unlockStatus: string;
  disabledReason?: string;
};

export const RELEASE_MODE_LABELS: Record<AdventureMonthReleaseMode, string> = {
  all_available: 'All weeks available now',
  sequential_after_completion: 'Unlock next week after previous completion',
  timed_interval: 'Release every X days',
};

export function normalizeReleaseMode(
  value: string | null | undefined,
): AdventureMonthReleaseMode {
  if (value === 'sequential_after_completion' || value === 'timed_interval') {
    return value;
  }
  return 'all_available';
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Published + playable on family site. Active status counts as live for backward compatibility. */
export function isAdventurePublishedForFamilies(adventure: AdventureModuleRecord): boolean {
  if (adventure.status === 'draft' || adventure.status === 'archived') return false;
  if (adventure.status === 'active') return true;
  if (adventure.status === 'scheduled') return adventure.is_live !== false;
  return false;
}

function resolveReleaseStartDate(input: {
  month: AdventureMonthRecord | null;
  pilotStartDate?: Date | string | null;
  now: Date;
}): Date {
  const monthStart = input.month?.release_start_at?.trim();
  if (monthStart) {
    const parsed = new Date(monthStart);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const pilotRaw = input.pilotStartDate;
  if (pilotRaw) {
    const parsed = pilotRaw instanceof Date ? pilotRaw : new Date(pilotRaw);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return input.now;
}

function resolveTimedIntervalUnlock(
  weekNumber: number,
  weekIndexInMonth: number,
  intervalDays: number,
  startDate: Date,
  now: Date,
): { available: boolean; daysUntil: number } {
  if (weekIndexInMonth <= 0) {
    return { available: true, daysUntil: 0 };
  }

  const unlockAt = addDays(startDate, intervalDays * weekIndexInMonth);
  const msUntil = unlockAt.getTime() - now.getTime();
  const daysUntil = Math.max(0, Math.ceil(msUntil / (1000 * 60 * 60 * 24)));
  return { available: msUntil <= 0, daysUntil };
}

function formatDaysUntilUnlock(days: number): string {
  if (days <= 0) return 'Available now';
  if (days === 1) return 'Unlocks in 1 day';
  return `Unlocks in ${days} days`;
}

function formatUnlockAfterWeek(previousWeek: number): string {
  return `Unlocks after Week ${previousWeek}`;
}

function resolveReleaseModeAvailability(input: {
  weekNumber: number;
  weekNumbersInMonth: number[];
  completedWeekNumbers: number[];
  month: AdventureMonthRecord | null;
  pilotStartDate?: Date | string | null;
  now: Date;
}): WeekAvailabilityResult | null {
  const releaseMode = normalizeReleaseMode(input.month?.release_mode);
  const weekIndexInMonth = input.weekNumbersInMonth.indexOf(input.weekNumber);

  if (releaseMode === 'all_available') {
    return { weekStatus: 'available', unlockStatus: 'Available now' };
  }

  if (releaseMode === 'sequential_after_completion') {
    if (input.weekNumber <= 1 || weekIndexInMonth <= 0) {
      return { weekStatus: 'available', unlockStatus: 'Available now' };
    }

    const previousWeek =
      weekIndexInMonth > 0
        ? input.weekNumbersInMonth[weekIndexInMonth - 1]
        : input.weekNumber - 1;

    if (input.completedWeekNumbers.includes(previousWeek)) {
      return { weekStatus: 'available', unlockStatus: 'Available now' };
    }

    return {
      weekStatus: 'locked',
      unlockStatus: formatUnlockAfterWeek(previousWeek),
      disabledReason: `sequential_after_completion: week ${previousWeek} not complete`,
    };
  }

  if (releaseMode === 'timed_interval') {
    const intervalDays = Math.max(1, input.month?.release_interval_days ?? 4);
    const startDate = resolveReleaseStartDate({
      month: input.month,
      pilotStartDate: input.pilotStartDate,
      now: input.now,
    });
    const timed = resolveTimedIntervalUnlock(
      input.weekNumber,
      weekIndexInMonth < 0 ? input.weekNumber - 1 : weekIndexInMonth,
      intervalDays,
      startDate,
      input.now,
    );

    if (timed.available) {
      return { weekStatus: 'available', unlockStatus: 'Available now' };
    }

    return {
      weekStatus: 'locked',
      unlockStatus: formatDaysUntilUnlock(timed.daysUntil),
      disabledReason: `timed_interval: ${timed.daysUntil} day(s) remaining`,
    };
  }

  return null;
}

export function resolveWeekAvailability(input: {
  adventure: AdventureModuleRecord | null;
  weekNumber: number;
  month: AdventureMonthRecord | null;
  weekNumbersInMonth: number[];
  completedWeekNumbers: number[];
  visibilityCtx?: AdventureVisibilityContext;
  pilotStartDate?: Date | string | null;
}): WeekAvailabilityResult {
  const ctx = input.visibilityCtx ?? { now: new Date() };
  const now = ctx.now ?? new Date();

  if (input.adventure && isPreviewingAdventure(input.adventure, ctx)) {
    return { weekStatus: 'available', unlockStatus: 'Admin preview' };
  }

  if (input.month && !input.month.is_published && !input.month.id.startsWith('fallback-')) {
    return {
      weekStatus: 'locked',
      unlockStatus: 'Coming soon',
      disabledReason: 'month_unpublished',
    };
  }

  if (!input.adventure) {
    return {
      weekStatus: 'locked',
      unlockStatus: 'Coming soon',
      disabledReason: 'no_cms_module',
    };
  }

  if (input.adventure.status === 'draft' || input.adventure.status === 'archived') {
    return {
      weekStatus: 'locked',
      unlockStatus: 'Coming soon',
      disabledReason: `adventure_status_${input.adventure.status}`,
    };
  }

  if (!isAdventurePublishedForFamilies(input.adventure)) {
    return {
      weekStatus: 'locked',
      unlockStatus: 'Coming soon',
      disabledReason: 'adventure_not_published_or_live',
    };
  }

  if (
    input.adventure.unlock_date &&
    !isUnlockDatePassed(input.adventure.unlock_date, now)
  ) {
    const unlock = new Date(input.adventure.unlock_date);
    const label = Number.isNaN(unlock.getTime())
      ? 'Available soon'
      : `Unlocks ${unlock.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    return {
      weekStatus: 'locked',
      unlockStatus: label,
      disabledReason: 'adventure_scheduled_unlock_date',
    };
  }

  const releaseResult = resolveReleaseModeAvailability({
    weekNumber: input.weekNumber,
    weekNumbersInMonth: input.weekNumbersInMonth,
    completedWeekNumbers: input.completedWeekNumbers,
    month: input.month,
    pilotStartDate: input.pilotStartDate,
    now,
  });

  if (releaseResult) {
    return releaseResult;
  }

  return { weekStatus: 'available', unlockStatus: 'Available now' };
}

export function logWeekAvailabilityDebug(input: {
  weekNumber: number;
  title: string;
  adventure: AdventureModuleRecord | null;
  month: AdventureMonthRecord | null;
  completed: boolean;
  result: WeekAvailabilityResult;
}): void {
  if (process.env.NODE_ENV !== 'development') return;

  console.info('[WEEK_AVAILABILITY_DEBUG]', {
    week: input.weekNumber,
    title: input.title,
    status: input.adventure?.status ?? null,
    live_site: input.adventure?.is_live ?? null,
    release_mode: normalizeReleaseMode(input.month?.release_mode),
    release_interval_days: input.month?.release_interval_days ?? null,
    release_start_at: input.month?.release_start_at ?? null,
    completed: input.completed,
    availability: input.result.weekStatus,
    unlock_status: input.result.unlockStatus,
    disabled_reason: input.result.disabledReason ?? null,
  });
}
