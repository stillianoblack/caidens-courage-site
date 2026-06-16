import type { ActivePilotProgram } from '../types/pilotProgram';
import {
  clearActivePilotProgram,
  readActivePilotProgram,
  writeActivePilotProgram,
} from './activePilotProgram';
import { clearBlueRibbonUnlock } from './blueRibbonPortalAccess';
import { syncPortalProgramContext } from '../lib/activeProgramContext';
import { isIndependentFamilyProgram } from '../lib/independentFamilyProgram';
import { writeFamilyPortalSession, clearFamilyPortalSession } from './familyPortalAccess';
import { clearLastPilotProgram } from './lastPilotProgram';
import { writePortalSessionUnlock, clearPortalSessionUnlock } from './portalAccess';

export type PortalRole = 'facilitator' | 'family';

export type ActiveFamilyContext = {
  programCode: string;
  programName: string;
  familyAccessCode: string;
  groupName: string;
  programType?: ActivePilotProgram['programType'];
};

export const ACTIVE_PORTAL_ROLE_KEY = 'activePortalRole';
export const ACTIVE_ACCESS_CODE_KEY = 'activeAccessCode';
export const ACTIVE_FAMILY_CONTEXT_KEY = 'activeFamilyContext';

export const PORTAL_ROLE_MISMATCH_MESSAGE =
  'Enter the correct access code to open this portal.';

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

export function readActiveAccessCode(): string | null {
  try {
    const raw = localStorage.getItem(ACTIVE_ACCESS_CODE_KEY);
    return raw?.trim() ? raw : null;
  } catch {
    return null;
  }
}

export function writeActiveAccessCode(code: string): void {
  try {
    localStorage.setItem(ACTIVE_ACCESS_CODE_KEY, code.trim());
  } catch {
    /* localStorage unavailable */
  }
}

export function clearActiveAccessCode(): void {
  try {
    localStorage.removeItem(ACTIVE_ACCESS_CODE_KEY);
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
  console.log('ACTIVE ACCESS CODE:', readActiveAccessCode() ? '(set)' : '(none)');
}

/** @deprecated Role is set only by access-code unlock — do not override from URL. */
export function forcePortalRoleForRoute(_pathname: string): void {
  logActivePortalDev();
}

export function applyProgramPortalUnlock(
  program: ActivePilotProgram,
  role: PortalRole,
  accessCode: string,
): void {
  const resolvedRole: PortalRole =
    isIndependentFamilyProgram(program) && role === 'facilitator' ? 'family' : role;
  const resolvedCode =
    resolvedRole === 'family' ? program.familyAccessCode : accessCode.trim() || accessCode;

  clearStalePortalRouteState();
  writeActivePilotProgram(program);
  syncPortalProgramContext(program);
  writeActivePortalRole(resolvedRole);
  writeActiveAccessCode(resolvedCode);

  if (resolvedRole === 'family') {
    writeActiveFamilyContext({
      programCode: program.programCode,
      programName: program.programName,
      familyAccessCode: program.familyAccessCode,
      groupName: program.groupName,
      programType: program.programType,
    });
    writeFamilyPortalSession();
    clearPortalSessionUnlock();
  } else {
    clearActiveFamilyContext();
    clearFamilyPortalSession();
    writePortalSessionUnlock('pilot');
  }

  logActivePortalDev();
}

export function clearProgramPortalContext(): void {
  clearBlueRibbonUnlock();
  clearActivePilotProgram();
  clearActiveAccessCode();
  try {
    localStorage.removeItem(ACTIVE_PORTAL_ROLE_KEY);
  } catch {
    /* localStorage unavailable */
  }
  clearActiveFamilyContext();
}

/** Clear cached return session on portal login without signing out of an active dashboard. */
export function clearPortalReturnSession(): void {
  clearLastPilotProgram();
  clearActiveAccessCode();
  try {
    localStorage.removeItem(ACTIVE_PORTAL_ROLE_KEY);
  } catch {
    /* localStorage unavailable */
  }
}

/** Sign out — clear portal session; user must re-enter access code at /portal. */
export function signOutPortal(): void {
  clearProgramPortalContext();
  clearFamilyPortalSession();
  clearPortalSessionUnlock();
  clearStalePortalRouteState();
}
