export const PILOT_TOTAL_WEEKS = 9;

/** Days after pilot start when a week becomes available. Week 1 is day 0. */
export function getWeekUnlockOffsetDays(weekNumber: number): number {
  if (weekNumber <= 1) return 0;
  return 7 * (weekNumber - 1) - 1;
}

export function resolvePilotStartDate(program: {
  pilotStartDate?: string;
  createdAt?: string;
  agreedAt?: string;
} | null): Date | null {
  if (!program) return null;
  const raw = program.pilotStartDate ?? program.createdAt ?? program.agreedAt;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Returns the highest week number currently unlocked (1–9). */
export function getUnlockedWeek(pilotStartDate: Date | string | null | undefined, now = new Date()): number {
  const start =
    pilotStartDate instanceof Date
      ? pilotStartDate
      : pilotStartDate
        ? new Date(pilotStartDate)
        : null;

  if (!start || Number.isNaN(start.getTime())) {
    return 1;
  }

  const elapsedMs = now.getTime() - start.getTime();
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));

  let unlocked = 1;
  for (let week = 2; week <= PILOT_TOTAL_WEEKS; week += 1) {
    if (elapsedDays >= getWeekUnlockOffsetDays(week)) {
      unlocked = week;
    } else {
      break;
    }
  }

  return unlocked;
}

export function isWeekUnlocked(
  weekNumber: number,
  pilotStartDate: Date | string | null | undefined,
  now = new Date(),
): boolean {
  return weekNumber <= getUnlockedWeek(pilotStartDate, now);
}

export function getDaysUntilWeekUnlock(
  weekNumber: number,
  pilotStartDate: Date | string | null | undefined,
  now = new Date(),
): number {
  const start =
    pilotStartDate instanceof Date
      ? pilotStartDate
      : pilotStartDate
        ? new Date(pilotStartDate)
        : null;

  if (!start || Number.isNaN(start.getTime()) || weekNumber <= 1) {
    return 0;
  }

  const unlockOffset = getWeekUnlockOffsetDays(weekNumber);
  const elapsedMs = now.getTime() - start.getTime();
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  return Math.max(0, unlockOffset - elapsedDays);
}

export function formatWeekUnlockStatus(
  weekNumber: number,
  pilotStartDate: Date | string | null | undefined,
  now = new Date(),
): string {
  if (isWeekUnlocked(weekNumber, pilotStartDate, now)) {
    return 'Available now';
  }

  const days = getDaysUntilWeekUnlock(weekNumber, pilotStartDate, now);
  if (days === 1) {
    return 'Unlocks in 1 day';
  }
  return `Unlocks in ${days} days`;
}

export function resolveWeekStatus(
  weekNumber: number,
  pilotStartDate: Date | string | null | undefined,
  now = new Date(),
): 'available' | 'locked' {
  return isWeekUnlocked(weekNumber, pilotStartDate, now) ? 'available' : 'locked';
}
