import { PROGRAM_DASHBOARD_PATH } from '../config/courageRoutes';

/** Outlet remount key for AppLayout — includes hash on facilitator dashboard routes. */
export function resolveAppOutletKey(pathname: string, search: string, hash: string): string {
  const base = `${pathname}${search}`;
  if (pathname === PROGRAM_DASHBOARD_PATH || pathname.startsWith(`${PROGRAM_DASHBOARD_PATH}/`)) {
    return `${base}${hash}`;
  }
  return base;
}

/** Outlet remount key for family portal layouts. */
export function resolveFamilyOutletKey(pathname: string, search: string): string {
  return `${pathname}${search}`;
}
