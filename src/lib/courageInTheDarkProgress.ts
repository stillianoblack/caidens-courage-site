import { courageInTheDarkMissions, type CourageInTheDarkMission } from '../data/courageInTheDarkMap';
import { weekIdFromNumber } from '../data/courageMissionRewards';

/** @deprecated Mission completion is stored in Supabase — use useCourageInTheDarkProgress instead. */
export function readCourageMapCompletedHotspots(): string[] {
  return [];
}

export function resolveCourageWeekId(week: number): string {
  return weekIdFromNumber(week);
}

/** Match completion by stable mission slug (week-scoped) or legacy hotspot id. */
export function isMapMissionComplete(
  mission: Pick<CourageInTheDarkMission, 'id' | 'targetGameSlug'>,
  completedMissionIds: readonly string[],
): boolean {
  const slug = mission.targetGameSlug?.trim();
  if (slug && completedMissionIds.includes(slug)) return true;
  return completedMissionIds.includes(mission.id);
}

/** @deprecated Prefer isMapMissionComplete with the full mission object. */
export function isCourageMapHotspotComplete(
  hotspotId: string,
  completedMissionIds: readonly string[],
  missionSlug?: string,
): boolean {
  if (missionSlug && completedMissionIds.includes(missionSlug)) return true;
  const mission = courageInTheDarkMissions.find((entry) => entry.id === hotspotId);
  if (mission?.targetGameSlug && completedMissionIds.includes(mission.targetGameSlug)) {
    return true;
  }
  return completedMissionIds.includes(hotspotId);
}
