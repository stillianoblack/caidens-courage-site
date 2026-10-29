import { isKidFacingPortalRoute } from './kidFacingPortalRoutes';

/** Premium Academy experiences. Parent registration, settings, and profiles stay open. */
export function isProtectedAcademyPath(pathname: string): boolean {
  if (pathname.startsWith('/preview/')) return false;
  if (pathname.startsWith('/portal/facilitator')) return false;
  return isKidFacingPortalRoute(pathname) || pathname.includes('/arcade') || pathname.includes('/story-mode');
}
