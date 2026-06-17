export type WeeklyAdventureWeekAccent = 'week1' | 'week2' | 'week3' | 'week4';

/** Month slot accent (Weeks 1–4, then cycles) for subtle UI polish. */
export function resolveWeeklyAdventureWeekAccent(weekNumber: number): WeeklyAdventureWeekAccent {
  const slot = ((Math.max(1, weekNumber) - 1) % 4) + 1;
  return `week${slot}` as WeeklyAdventureWeekAccent;
}
