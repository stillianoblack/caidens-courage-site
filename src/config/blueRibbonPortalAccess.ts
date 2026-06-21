/**
 * Blue Ribbon 2026 pilot — shared unlock for Family + Facilitator portals.
 *
 * Entering either BlueRibbon2026 or BlueRibbonFamily unlocks the pilot pair.
 * The portal switcher cross-grants the sibling session so users are not sent
 * back to the access-code gate when changing views.
 */

import {
  readPortalSessionUnlock,
  type PortalAccessType,
  writePortalSessionUnlock,
} from './portalAccess';
import { isLegacyDemoUnlockAllowed } from '../lib/portalAuthConfig';

export const BLUE_RIBBON_UNLOCK_KEY = 'cc-blueribbon-unlock';
const FAMILY_PORTAL_SESSION_KEY = 'cc-family-portal-unlock';

const PILOT_DASHBOARD_ALLOWED_TYPES: PortalAccessType[] = ['pilot', 'school', 'teacher'];

function canAccessPilotDashboard(sessionType: PortalAccessType | null): boolean {
  if (!sessionType) return false;
  return PILOT_DASHBOARD_ALLOWED_TYPES.includes(sessionType);
}

export function writeBlueRibbonUnlock(): void {
  try {
    sessionStorage.setItem(BLUE_RIBBON_UNLOCK_KEY, '1');
  } catch {
    /* sessionStorage unavailable */
  }
}

export function hasBlueRibbonUnlock(): boolean {
  try {
    return sessionStorage.getItem(BLUE_RIBBON_UNLOCK_KEY) === '1';
  } catch {
    return false;
  }
}

export function clearBlueRibbonUnlock(): void {
  try {
    sessionStorage.removeItem(BLUE_RIBBON_UNLOCK_KEY);
  } catch {
    /* sessionStorage unavailable */
  }
}

function readFamilyPortalSessionDirect(): boolean {
  try {
    return sessionStorage.getItem(FAMILY_PORTAL_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function writeFamilyPortalSessionDirect(): void {
  try {
    sessionStorage.setItem(FAMILY_PORTAL_SESSION_KEY, '1');
  } catch {
    /* sessionStorage unavailable */
  }
}

/** Grant facilitator portal access without clearing existing unlock state. */
export function ensureFacilitatorPortalAccess(): PortalAccessType | null {
  const sessionType = readPortalSessionUnlock();
  if (canAccessPilotDashboard(sessionType)) {
    return sessionType;
  }

  if (!isLegacyDemoUnlockAllowed()) {
    return null;
  }

  if (hasBlueRibbonUnlock() || readFamilyPortalSessionDirect()) {
    writePortalSessionUnlock('pilot');
    return 'pilot';
  }

  return null;
}

/** Grant family portal access without clearing existing unlock state. */
export function ensureFamilyPortalAccess(): boolean {
  if (readFamilyPortalSessionDirect()) {
    return true;
  }

  if (!isLegacyDemoUnlockAllowed()) {
    return false;
  }

  if (hasBlueRibbonUnlock() || canAccessPilotDashboard(readPortalSessionUnlock())) {
    writeFamilyPortalSessionDirect();
    return true;
  }

  return false;
}
