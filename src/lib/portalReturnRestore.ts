import {
  clearActivePilotProgram,
  readActivePilotProgram,
  writeActivePilotProgram,
} from '../config/activePilotProgram';
import { writeFamilyPortalSession } from '../config/familyPortalAccess';
import { writePortalSessionUnlock } from '../config/portalAccess';
import {
  ACTIVE_PORTAL_ROLE_KEY,
  clearActiveAccessCode,
  readActivePortalRole,
  writeActiveAccessCode,
  writeActiveFamilyContext,
  writeActivePortalRole,
} from '../config/portalContext';
import type { LastPilotProgram } from '../config/lastPilotProgram';
import { readLastPilotProgramForRestore } from './portalProgramAssignment';

/** True when a prior portal return snapshot exists in localStorage. */
export function hasSavedPortalReturnSession(): boolean {
  return Boolean(readLastPilotProgramForRestore());
}

/** True when an unlocked program + role is already loaded in localStorage. */
export function hasActivePortalProgramSession(): boolean {
  const program = readActivePilotProgram();
  const role = readActivePortalRole();
  return Boolean(program?.programCode && role);
}

/** Hide welcome-back UI while keeping the saved return snapshot for restore. */
export function dismissPortalWelcomeBack(): void {
  clearActivePilotProgram();
  clearActiveAccessCode();
  try {
    localStorage.removeItem(ACTIVE_PORTAL_ROLE_KEY);
  } catch {
    /* localStorage unavailable */
  }
}

/** Reload saved program + role from the return snapshot and surface welcome-back UI. */
export function restoreSavedPortalReturnSession(): LastPilotProgram | null {
  const saved = readLastPilotProgramForRestore();
  if (!saved) return null;

  writeActivePilotProgram(saved.program);
  writeActivePortalRole(saved.portal_role);
  writeActiveAccessCode(saved.last_access_code);

  if (saved.portal_role === 'family') {
    writeActiveFamilyContext({
      programCode: saved.program.programCode,
      programName: saved.program.programName,
      familyAccessCode: saved.program.familyAccessCode,
      groupName: saved.program.groupName,
    });
    writeFamilyPortalSession();
  } else {
    writePortalSessionUnlock('pilot');
  }

  return saved;
}
