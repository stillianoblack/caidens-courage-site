import { PROGRAM_DASHBOARD_PATH } from '../config/courageRoutes';

/** Outlet remount key for AppLayout. Include hash on program routes for legacy links. */
export function resolveAppOutletKey(pathname: string, search: string, hash: string): string {
  const base = `${pathname}${search}`;
  if (pathname === PROGRAM_DASHBOARD_PATH || pathname.startsWith(`${PROGRAM_DASHBOARD_PATH}/`)) {
    return `${base}${hash}`;
  }
  return base;
}

/** Outlet remount key for portal layouts. */
export function resolvePortalOutletKey(pathname: string, search: string): string {
  return `${pathname}${search}`;
}
