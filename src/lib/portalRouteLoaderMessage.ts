import { FAMILY_HUB_PATH, FAMILY_PORTAL_PATH, PROGRAM_DASHBOARD_PATH } from '../config/courageRoutes';

export function resolvePortalRouteLoaderMessage(pathname: string): string {
  if (pathname.startsWith(FAMILY_HUB_PATH) || pathname.startsWith(FAMILY_PORTAL_PATH)) {
    return 'Loading Family Portal...';
  }
  if (pathname === PROGRAM_DASHBOARD_PATH || pathname.startsWith(`${PROGRAM_DASHBOARD_PATH}/`)) {
    return 'Loading Facilitator Portal...';
  }
  return 'Loading Focus Flame Academy...';
}
