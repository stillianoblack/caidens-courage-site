export type WeeklyMapCharacterId = 'caiden' | 'miranda' | 'b4' | 'charlie' | 'zeke';

export type WeeklyCharacterMissionLists = Record<WeeklyMapCharacterId, readonly string[]>;

/** Mission id for a character on a given adventure week (1-based). */
export function resolveWeeklyCharacterMissionId(
  character: string,
  week: number,
  lists: WeeklyCharacterMissionLists,
): string | null {
  const key = character as keyof WeeklyCharacterMissionLists;
  const missions = lists[key];
  if (!missions?.length) return null;
  const index = Math.min(Math.max(week, 1), missions.length) - 1;
  return missions[index] ?? null;
}

export function buildWeeklyCharacterMissionHref(
  character: string,
  week: number,
  kidsBasePath: string,
  lists: WeeklyCharacterMissionLists,
): string | null {
  const missionId = resolveWeeklyCharacterMissionId(character, week, lists);
  if (!missionId) return null;
  const base = kidsBasePath.replace(/\/+$/, '');
  return `${base}/${character}/${missionId}`;
}
