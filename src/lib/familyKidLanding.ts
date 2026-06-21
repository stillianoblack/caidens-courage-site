import { FAMILY_HUB_PATH } from '../config/courageRoutes';
import { readActiveChildState } from './activeChildContext';
import { familyPortalPath, resolveFamilyPortalBase } from './familyPortalPaths';

/** Family Portal overview — never kid gameplay routes. */
export function resolveFamilyPortalOverviewPath(pathname?: string): string {
  return resolveFamilyPortalBase(pathname) || FAMILY_HUB_PATH;
}

/** Default kid-facing landing when an active child is selected — otherwise portal home. */
export function resolveFamilyKidDefaultLandingPath(pathname?: string): string {
  if (readActiveChildState()?.participantId) {
    return familyPortalPath('weekly-adventures', pathname);
  }
  return resolveFamilyPortalOverviewPath(pathname);
}
