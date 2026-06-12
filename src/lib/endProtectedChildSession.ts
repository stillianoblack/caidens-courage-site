import type { NavigateFunction } from 'react-router-dom';
import {
  FAMILY_HUB_PATH,
  FAMILY_PORTAL_PATH,
  KIDS_PORTAL_PATH,
  PORTAL_PATH,
  PROGRAM_DASHBOARD_PATH,
} from '../config/courageRoutes';
import { clearStalePortalRouteState, readActivePortalRole } from '../config/portalContext';
import { clearActiveChild } from './activeChildContext';
import { RECENTLY_COMPLETED_HOTSPOT_KEY } from './courageMapReturnFeedback';
import { getPortalBasePath } from './portalGamePaths';

/** Clears in-memory child session state without touching Supabase progress or rewards. */
export function clearChildSessionMemory(): void {
  clearActiveChild();
  clearStalePortalRouteState();
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(RECENTLY_COMPLETED_HOTSPOT_KEY);
  } catch {
    /* sessionStorage unavailable */
  }
}

/** Safest portal landing screen after idle timeout — home/child select, not Character Hub. */
export function resolveProtectedSessionExitPath(pathname?: string): string {
  const path = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '');

  if (
    path.startsWith(FAMILY_HUB_PATH) ||
    path.startsWith(FAMILY_PORTAL_PATH) ||
    path.startsWith(KIDS_PORTAL_PATH) ||
    path.startsWith(PROGRAM_DASHBOARD_PATH)
  ) {
    return getPortalBasePath(path);
  }

  const role = readActivePortalRole();
  if (role === 'family') {
    return getPortalBasePath(FAMILY_HUB_PATH);
  }
  if (role === 'facilitator') {
    return getPortalBasePath(PROGRAM_DASHBOARD_PATH);
  }

  return PORTAL_PATH;
}

/** End the active child gameplay session and return to a protected portal entry screen. */
export function endProtectedChildSession(
  navigate: NavigateFunction,
  pathname?: string,
): void {
  clearChildSessionMemory();
  navigate(resolveProtectedSessionExitPath(pathname), { replace: true });
}
