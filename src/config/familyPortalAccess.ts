/**
 * MVP client-side gate for Focus Flame Academy Family Portal.
 *
 * TODO: Move family portal access to server-side auth before production launch.
 */

import { ensureFamilyPortalAccess } from './blueRibbonPortalAccess';

export const FAMILY_PORTAL_SESSION_KEY = 'cc-family-portal-unlock';

/** Program family hub — session flag only (no Blue Ribbon cross-grant). */
export function readFamilyPortalSession(): boolean {
  try {
    return sessionStorage.getItem(FAMILY_PORTAL_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

/** Legacy /family-portal — may cross-grant from Blue Ribbon demo unlock. */
export function readLegacyFamilyPortalSession(): boolean {
  return ensureFamilyPortalAccess();
}

export function writeFamilyPortalSession(): void {
  try {
    sessionStorage.setItem(FAMILY_PORTAL_SESSION_KEY, '1');
  } catch {
    /* sessionStorage unavailable */
  }
}

export function clearFamilyPortalSession(): void {
  try {
    sessionStorage.removeItem(FAMILY_PORTAL_SESSION_KEY);
  } catch {
    /* ignore */
  }
}
