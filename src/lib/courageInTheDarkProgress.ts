import { courageInTheDarkMissions } from '../data/courageInTheDarkMap';
import { weekIdFromNumber } from '../data/courageMissionRewards';

/** @deprecated Mission completion is stored in Supabase — use useCourageInTheDarkProgress instead. */
export function readCourageMapCompletedHotspots(): string[] {
  return [];
}

export function isCourageMapHotspotComplete(hotspotId: string, completedMissionIds: string[]): boolean {
  const mission = courageInTheDarkMissions.find((entry) => entry.id === hotspotId);
  if (!mission) return false;
  return completedMissionIds.includes(mission.targetGameSlug);
}

export function resolveCourageWeekId(week: number): string {
  return weekIdFromNumber(week);
}
