import { readActivePilotProgram } from '../config/activePilotProgram';
import { readLastPilotProgramForRole } from '../config/lastPilotProgram';
import { readParentClaimContext } from '../config/parentClaimContext';
import { isIndependentFamilyProgram } from './independentFamilyProgram';
import { readRememberedDeviceSession } from './rememberedDeviceSession';

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function detectReturnSessionParentEmailMatch(email: string): boolean {
  const entered = normalizeEmail(email);
  if (!entered) return false;

  const claim = readParentClaimContext();
  if (claim?.email && normalizeEmail(claim.email) === entered) {
    return true;
  }

  const device = readRememberedDeviceSession();
  if (device?.user_type === 'parent' && device.parent_id && normalizeEmail(device.parent_id) === entered) {
    return true;
  }

  const lastFamily = readLastPilotProgramForRole('family');
  if (lastFamily?.admin_email && normalizeEmail(lastFamily.admin_email) === entered) {
    return true;
  }

  const program = readActivePilotProgram();
  if (
    program &&
    isIndependentFamilyProgram(program) &&
    program.adminEmail &&
    normalizeEmail(program.adminEmail) === entered
  ) {
    return true;
  }

  return false;
}

export function detectReturnSessionFacilitatorEmailMatch(email: string): boolean {
  const entered = normalizeEmail(email);
  if (!entered) return false;

  const program = readActivePilotProgram();
  const adminEmail = program?.adminEmail?.trim().toLowerCase();
  if (adminEmail && entered === adminEmail) {
    return true;
  }

  const device = readRememberedDeviceSession();
  if (
    device?.user_type === 'facilitator' &&
    device.facilitator_id &&
    normalizeEmail(device.facilitator_id) === entered
  ) {
    return true;
  }

  const lastFacilitator = readLastPilotProgramForRole('facilitator');
  if (lastFacilitator?.admin_email && normalizeEmail(lastFacilitator.admin_email) === entered) {
    return true;
  }

  return false;
}

/** Prefer explicit unlock role from remembered device session when available. */
export function readPreferredReturnSessionRole(): 'parent' | 'facilitator' | null {
  const device = readRememberedDeviceSession();
  if (device?.user_type === 'parent') return 'parent';
  if (device?.user_type === 'facilitator') return 'facilitator';
  return null;
}
