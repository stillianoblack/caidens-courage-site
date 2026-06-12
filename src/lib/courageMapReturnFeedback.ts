import { courageInTheDarkMissions } from '../data/courageInTheDarkMap';

export const RECENTLY_COMPLETED_HOTSPOT_KEY = 'cc-courage-recently-completed-hotspot';

export function missionIdToHotspotId(missionId: string): string | null {
  const mission = courageInTheDarkMissions.find((entry) => entry.targetGameSlug === missionId);
  return mission?.id ?? null;
}

export function markRecentlyCompletedHotspot(missionId: string): void {
  if (typeof window === 'undefined') return;
  const hotspotId = missionIdToHotspotId(missionId);
  if (!hotspotId) return;
  window.sessionStorage.setItem(RECENTLY_COMPLETED_HOTSPOT_KEY, hotspotId);
}

export function readAndClearRecentlyCompletedHotspot(): string | null {
  if (typeof window === 'undefined') return null;
  const hotspotId = window.sessionStorage.getItem(RECENTLY_COMPLETED_HOTSPOT_KEY)?.trim() ?? '';
  if (!hotspotId) return null;
  window.sessionStorage.removeItem(RECENTLY_COMPLETED_HOTSPOT_KEY);
  return hotspotId;
}
