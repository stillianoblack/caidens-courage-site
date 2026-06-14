import type { AdventureTrailWeekView } from '../types/adventureTrail';

function isPriorWeeksComplete(
  weekNumber: number,
  trailWeeks: AdventureTrailWeekView[],
  completedWeekNumbers: readonly number[],
): boolean {
  return trailWeeks
    .filter((row) => row.week < weekNumber)
    .every((row) => completedWeekNumbers.includes(row.week) || row.weekStatus === 'locked');
}

/** Hero week for the main map — next available week, or URL override from Start/Continue. */
export function resolveHeroWeekNumber(input: {
  trailWeeks: AdventureTrailWeekView[];
  completedWeekNumbers: readonly number[];
  requestedWeek?: number | null;
}): number {
  const { trailWeeks, completedWeekNumbers, requestedWeek } = input;

  if (requestedWeek && requestedWeek > 0) {
    const match = trailWeeks.find((row) => row.week === requestedWeek);
    if (match?.weekStatus === 'available') {
      return requestedWeek;
    }
  }

  const availableIncomplete = trailWeeks
    .filter(
      (row) =>
        row.weekStatus === 'available' && !completedWeekNumbers.includes(row.week),
    )
    .sort((a, b) => b.week - a.week);

  for (const row of availableIncomplete) {
    if (isPriorWeeksComplete(row.week, trailWeeks, completedWeekNumbers)) {
      return row.week;
    }
  }

  const fallback = trailWeeks
    .filter((row) => row.weekStatus === 'available')
    .sort((a, b) => a.week - b.week);

  if (fallback.length > 0) {
    return fallback[0].week;
  }

  return trailWeeks[0]?.week ?? 1;
}
