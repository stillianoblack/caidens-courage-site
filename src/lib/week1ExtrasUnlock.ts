import { WEEK1_MISSION_IDS } from './week1MissionUnlock';

/** Week 1 map gameplay missions complete — unlocks bonus cards for the rest of the week. */
export function isWeek1GameplayComplete(completedMissionIds: readonly string[]): boolean {
  const completed = new Set(completedMissionIds);
  return WEEK1_MISSION_IDS.every((missionId) => completed.has(missionId));
}
