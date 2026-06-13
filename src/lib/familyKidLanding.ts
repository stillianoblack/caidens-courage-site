import { readActiveChildState } from './activeChildContext';
import { familyPortalPath, resolveFamilyPortalBase } from './familyPortalPaths';

/** Default kid-facing landing when an active child is selected — otherwise portal home. */
export function resolveFamilyKidDefaultLandingPath(pathname?: string): string {
  if (readActiveChildState()?.participantId) {
    return familyPortalPath('weekly-adventures', pathname);
  }
  return resolveFamilyPortalBase(pathname);
}
