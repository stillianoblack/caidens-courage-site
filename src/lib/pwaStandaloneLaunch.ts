import { PORTAL_PATH } from '../config/courageRoutes';
import { familyPortalPath } from './familyPortalPaths';
import {
  hasActiveChildPlaySession,
  isStandaloneDisplayMode,
} from './pwaDisplayMode';

/** Standalone PWA cold launch — kid gate or access code, never the family dashboard first. */
export function resolvePwaStandaloneLaunchPath(pathname: string, hasFamilySession: boolean): string | null {
  if (!isStandaloneDisplayMode()) return null;
  if (pathname.endsWith('/play-pause')) return null;

  if (!hasFamilySession) {
    return PORTAL_PATH;
  }

  if (!hasActiveChildPlaySession()) {
    return PORTAL_PATH;
  }

  return familyPortalPath('play-pause', pathname);
}
