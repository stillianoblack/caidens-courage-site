import {
  FAMILY_HUB_PATH,
  FAMILY_PORTAL_PATH,
  KID_PLAY_SESSION_PATH,
  PROGRAM_DASHBOARD_PATH,
} from '../config/courageRoutes';

/**
 * App-level Suspense outlet remount key.
 * Keep portal shells stable across query-only changes (settings tabs, week params).
 */
export function resolveAppOutletKey(pathname: string, search: string, hash: string): string {
  if (pathname === PROGRAM_DASHBOARD_PATH || pathname.startsWith(`${PROGRAM_DASHBOARD_PATH}/`)) {
    return `${pathname}${search}${hash}`;
  }

  if (pathname.startsWith(`${KID_PLAY_SESSION_PATH}/`)) {
    const sessionMatch = /^(\/play\/session\/[^/]+)/.exec(pathname);
    if (sessionMatch?.[1]) return sessionMatch[1];
  }

  if (pathname === FAMILY_PORTAL_PATH || pathname.startsWith(`${FAMILY_PORTAL_PATH}/`)) {
    return FAMILY_PORTAL_PATH;
  }

  if (pathname === FAMILY_HUB_PATH || pathname.startsWith(`${FAMILY_HUB_PATH}/`)) {
    return FAMILY_HUB_PATH;
  }

  return pathname;
}

/** Outlet remount key for nested portal layouts that intentionally track search. */
export function resolvePortalOutletKey(pathname: string, search: string): string {
  return `${pathname}${search}`;
}
