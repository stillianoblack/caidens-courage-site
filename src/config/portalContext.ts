import type { ActivePilotProgram } from '../types/pilotProgram';
import {
  clearActivePilotProgram,
  readActivePilotProgram,
  writeActivePilotProgram,
} from './activePilotProgram';
import { writeFamilyPortalSession, clearFamilyPortalSession } from './familyPortalAccess';
import { writePortalSessionUnlock, clearPortalSessionUnlock } from './portalAccess';

export type PortalRole = 'facilitator' | 'family';

export type ActiveFamilyContext = {
  programCode: string;
  programName: string;
  familyAccessCode: string;
  groupName: string;
};

export const ACTIVE_PORTAL_ROLE_KEY = 'activePortalRole';
export const ACTIVE_FAMILY_CONTEXT_KEY = 'activeFamilyContext';

const DEV_PORTAL_LOGGING =
  process.env.NODE_ENV === 'development' || process.env.REACT_APP_PORTAL_DEV_LOG === '1';

export function readActivePortalRole(): PortalRole | null {
  try {
    const raw = localStorage.getItem(ACTIVE_PORTAL_ROLE_KEY);
    return raw === 'facilitator' || raw === 'family' ? raw : null;
  } catch {
    return null;
  }
}

export function writeActivePortalRole(role: PortalRole): void {
  try {
    localStorage.setItem(ACTIVE_PORTAL_ROLE_KEY, role);
  } catch {
    /* localStorage unavailable */
  }
}

export function readActiveFamilyContext(): ActiveFamilyContext | null {
  try {
    const raw = localStorage.getItem(ACTIVE_FAMILY_CONTEXT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveFamilyContext;
    if (!parsed?.programCode) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeActiveFamilyContext(context: ActiveFamilyContext): void {
  try {
    localStorage.setItem(ACTIVE_FAMILY_CONTEXT_KEY, JSON.stringify(context));
  } catch {
    /* localStorage unavailable */
  }
}

export function clearActiveFamilyContext(): void {
  try {
    localStorage.removeItem(ACTIVE_FAMILY_CONTEXT_KEY);
  } catch {
    /* localStorage unavailable */
  }
}

export function clearStalePortalRouteState(): void {
  try {
    sessionStorage.removeItem('cc-portal-return');
  } catch {
    /* sessionStorage unavailable */
  }
}

export function logActivePortalDev(): void {
  if (!DEV_PORTAL_LOGGING) return;
  const program = readActivePilotProgram();
  console.log('ACTIVE PORTAL ROLE:', readActivePortalRole() ?? '(none)');
  console.log('ACTIVE PROGRAM CODE:', program?.programCode ?? '(none)');
}

export function forcePortalRoleForRoute(pathname: string): void {
  const role = readActivePortalRole();
  if (pathname.startsWith('/program-dashboard') && role !== 'family') {
    writeActivePortalRole('facilitator');
  } else if (pathname.startsWith('/family-hub') && role !== 'facilitator') {
    writeActivePortalRole('family');
  }
  logActivePortalDev();
}

export function applyProgramPortalUnlock(program: ActivePilotProgram, role: PortalRole): void {
  clearStalePortalRouteState();
  writeActivePilotProgram(program);
  writeActivePortalRole(role);

  if (role === 'family') {
    writeActiveFamilyContext({
      programCode: program.programCode,
      programName: program.programName,
      familyAccessCode: program.familyAccessCode,
      groupName: program.groupName,
    });
    writeFamilyPortalSession();
  } else {
    clearActiveFamilyContext();
    writePortalSessionUnlock('pilot');
  }

  logActivePortalDev();
}

export function clearProgramPortalContext(): void {
  clearActivePilotProgram();
  try {
    localStorage.removeItem(ACTIVE_PORTAL_ROLE_KEY);
  } catch {
    /* localStorage unavailable */
  }
  clearActiveFamilyContext();
}

/** Sign out of portal session while preserving lastPilotProgram for recovery. */
export function signOutPortal(): void {
  clearProgramPortalContext();
  clearFamilyPortalSession();
  clearPortalSessionUnlock();
  clearStalePortalRouteState();
}
