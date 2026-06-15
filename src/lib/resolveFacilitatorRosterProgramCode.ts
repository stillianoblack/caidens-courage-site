import { readActivePilotProgram } from '../config/activePilotProgram';
import { hasBlueRibbonUnlock } from '../config/blueRibbonPortalAccess';
import { BLUE_RIBBON_CAMP_PROGRAM_CODE } from '../config/blueRibbonPilotProgram';
import { readLastPilotProgramForRole } from '../config/lastPilotProgram';
import { resolveCanonicalProgramCode } from './portalProgramAssignment';

/** Resolve the camp program code for facilitator roster actions (Add Student, roster fetch). */
export function resolveFacilitatorRosterProgramCode(explicit?: string): string {
  const fromProp = explicit?.trim();
  if (fromProp) return fromProp;

  const { code } = resolveCanonicalProgramCode();
  if (code) return code;

  const active = readActivePilotProgram();
  if (active?.programCode?.trim()) return active.programCode.trim();

  const lastFacilitator = readLastPilotProgramForRole('facilitator');
  if (lastFacilitator?.program_code?.trim()) return lastFacilitator.program_code.trim();

  if (hasBlueRibbonUnlock()) return BLUE_RIBBON_CAMP_PROGRAM_CODE;

  return '';
}
