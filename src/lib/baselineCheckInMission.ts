import { remapPortalKidsRoute } from './portalGamePaths';
import type { CourageInTheDarkMission } from '../data/courageInTheDarkMap';

/** Canonical B-4 Baseline Check-In mission id — not Week 1 Mood Scanner. */
export const BASELINE_CHECKIN_MISSION_ID = 'b4-self-check-in';

export function resolveBaselineCheckInRoute(kidsBasePath: string, pathname: string): string {
  const base = kidsBasePath.replace(/\/+$/, '');
  return remapPortalKidsRoute(`${base}/b4/check-in`, pathname);
}

/** When baseline is required, force B-4 hotspot missions to the check-in flow. */
export function coerceBaselineLockedMission(
  mission: CourageInTheDarkMission,
): CourageInTheDarkMission {
  if (mission.id !== 'b4') return mission;
  return {
    ...mission,
    targetGameSlug: BASELINE_CHECKIN_MISSION_ID,
    directHref: undefined,
  };
}
