import { readActivePilotProgram } from '../config/activePilotProgram';
import { readActiveAccessCode, readActiveFamilyContext } from '../config/portalContext';
import { readRememberedProgramAccessRecord } from './rememberedProgramAccess';

export const SESSION_MISMATCH_MESSAGE =
  'This saved session belongs to another family or program. Please switch program or enter the correct access code.';

export type PortalProgramScope = {
  programCode: string;
  accessCode?: string;
  familyId?: string;
};

export function resolvePortalProgramScope(): PortalProgramScope | null {
  const activeProgram = readActivePilotProgram();
  if (activeProgram?.programCode?.trim()) {
    const programCode = activeProgram.programCode.trim();
    const familyContext = readActiveFamilyContext();
    return {
      programCode,
      accessCode:
        readActiveAccessCode()?.trim() ||
        activeProgram.familyAccessCode?.trim() ||
        undefined,
      familyId:
        familyContext?.programCode?.trim() === programCode ? programCode : undefined,
    };
  }

  const remembered = readRememberedProgramAccessRecord();
  if (remembered?.program_code?.trim()) {
    return {
      programCode: remembered.program_code.trim(),
      accessCode: remembered.access_code.trim(),
    };
  }

  return null;
}

export function programScopesMatch(
  left?: string | null,
  right?: string | null,
): boolean {
  const a = left?.trim();
  const b = right?.trim();
  if (!a || !b) return false;
  return a === b;
}
