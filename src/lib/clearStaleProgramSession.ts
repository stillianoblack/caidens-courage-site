import { clearActivePilotProgram, readActivePilotProgram } from '../config/activePilotProgram';
import { clearBlueRibbonUnlock } from '../config/blueRibbonPortalAccess';
import {
  ACTIVE_ACCESS_CODE_KEY,
  ACTIVE_PORTAL_ROLE_KEY,
  clearActiveFamilyContext,
  readActiveFamilyContext,
} from '../config/portalContext';
import {
  LAST_PILOT_PROGRAM_FACILITATOR_KEY,
  LAST_PILOT_PROGRAM_FAMILY_KEY,
  LAST_PILOT_PROGRAM_KEY,
  readLastPilotProgramForRole,
} from '../config/lastPilotProgram';
import { isIndependentFamilyProgram } from './independentFamilyProgram';
import { isLegacyCampBrandLabel } from './familyPortalDisplayName';

const LEGACY_LOOSE_KEYS = [
  'program_code',
  'program_name',
  'selectedPilot',
  'activePilot',
] as const;

const LEGACY_CAMP_PROGRAM_CODES = new Set([
  'blueribbon2026',
  'blueribbon',
  'blueribbonfamily',
  'blueribbonkids',
]);

function isLegacyCampProgramCode(code: string | null | undefined): boolean {
  if (!code?.trim()) return false;
  return LEGACY_CAMP_PROGRAM_CODES.has(code.trim().toLowerCase());
}

function removeLocalStorageKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* localStorage unavailable */
  }
}

function removeSessionStorageKey(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* sessionStorage unavailable */
  }
}

/** Prevent camp / demo pilot snapshots from leaking into a fresh independent family signup. */
export function clearStaleProgramSessionForIndependentSignup(): void {
  clearBlueRibbonUnlock();
  removeSessionStorageKey('cc-blueribbon-unlock');

  for (const key of LEGACY_LOOSE_KEYS) {
    removeLocalStorageKey(key);
  }

  removeLocalStorageKey(LAST_PILOT_PROGRAM_KEY);
  removeLocalStorageKey(LAST_PILOT_PROGRAM_FACILITATOR_KEY);

  const active = readActivePilotProgram();
  if (
    active &&
    (!isIndependentFamilyProgram(active) ||
      isLegacyCampProgramCode(active.programCode) ||
      isLegacyCampBrandLabel(active.programName) ||
      isLegacyCampBrandLabel(active.groupName))
  ) {
    clearActivePilotProgram();
  }

  const familyContext = readActiveFamilyContext();
  if (
    familyContext &&
    (isLegacyCampProgramCode(familyContext.programCode) ||
      isLegacyCampBrandLabel(familyContext.programName) ||
      isLegacyCampBrandLabel(familyContext.groupName))
  ) {
    clearActiveFamilyContext();
  }

  const lastFamily = readLastPilotProgramForRole('family');
  if (
    lastFamily &&
    (!isIndependentFamilyProgram(lastFamily.program) ||
      isLegacyCampProgramCode(lastFamily.program_code) ||
      isLegacyCampBrandLabel(lastFamily.program_name))
  ) {
    removeLocalStorageKey(LAST_PILOT_PROGRAM_FAMILY_KEY);
  }

  removeLocalStorageKey(ACTIVE_ACCESS_CODE_KEY);
  removeLocalStorageKey(ACTIVE_PORTAL_ROLE_KEY);
}
