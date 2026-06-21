import { familyPortalPath } from './familyPortalPaths';
import { getKidPlayShellRoute, parseKidPlayShellPath } from './kidPlayShellRoutes';
import { remapPortalKidsRoute, resolveB4HubPath } from './portalGamePaths';
import type { CourageInTheDarkMission } from '../data/courageInTheDarkMap';

/** Canonical B-4 Baseline Check-In mission id — not Week 1 Mood Scanner. */
export const BASELINE_CHECKIN_MISSION_ID = 'b4-self-check-in';

export const B4_MOOD_SCANNER_MISSION_ID = 'b4-mood-scanner';

export const BASELINE_CHECKIN_SOURCE_WEEKLY = 'weekly-adventures-baseline';

export function isB4MissionLockedUntilBaselineComplete(
  missionId: string,
  baselineComplete: boolean,
): boolean {
  return !baselineComplete && missionId === B4_MOOD_SCANNER_MISSION_ID;
}

export function appendBaselineCheckInSource(route: string, source: string): string {
  const separator = route.includes('?') ? '&' : '?';
  return `${route}${separator}source=${encodeURIComponent(source)}`;
}

export function readBaselineCheckInSource(search: string): string | null {
  return new URLSearchParams(search).get('source');
}

export function resolveBaselineCheckInBackTarget(input: {
  pathname: string;
  search: string;
}): { label: string; path: string } {
  const source = readBaselineCheckInSource(input.search);
  if (source === BASELINE_CHECKIN_SOURCE_WEEKLY) {
    const parsed = parseKidPlayShellPath(input.pathname);
    if (parsed?.sessionId) {
      return {
        label: 'Back to Weekly Adventures',
        path: getKidPlayShellRoute(parsed.sessionId, 'weekly-adventures'),
      };
    }
    return {
      label: 'Back to Weekly Adventures',
      path: familyPortalPath('continue-learning', input.pathname),
    };
  }

  return {
    label: 'Back to B-4 Missions',
    path: resolveB4HubPath(input.pathname),
  };
}

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
