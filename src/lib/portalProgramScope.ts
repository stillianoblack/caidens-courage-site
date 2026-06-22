import { readActivePilotProgram } from '../config/activePilotProgram';
import { readScopedParentClaimRecord } from '../config/parentClaimContext';
import { readActiveAccessCode, readActiveFamilyContext } from '../config/portalContext';
import { readRememberedProgramAccessRecord } from './rememberedProgramAccess';

const STUDENT_PIN_SESSION_KEY = 'cc-student-pin-session';

export function readPinSessionProgramCodeRaw(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STUDENT_PIN_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { programCode?: string };
    return parsed.programCode?.trim() || null;
  } catch {
    return null;
  }
}

export const SESSION_MISMATCH_MESSAGE =
  'This saved session belongs to another family or program. Please switch program or enter the correct access code.';

export type PortalProgramScope = {
  programCode: string;
  accessCode?: string;
  familyId?: string;
};

export function resolvePortalProgramScopeExcludingParentClaim(): PortalProgramScope | null {
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

  const pinProgramCode = readPinSessionProgramCodeRaw();
  if (pinProgramCode) {
    return {
      programCode: pinProgramCode,
      accessCode: readActiveAccessCode()?.trim() || undefined,
    };
  }

  return null;
}

export function resolvePortalProgramScope(): PortalProgramScope | null {
  const withoutParentClaim = resolvePortalProgramScopeExcludingParentClaim();
  if (withoutParentClaim) {
    return withoutParentClaim;
  }

  const parentClaim = readScopedParentClaimRecord();
  const claimProgramCode =
    parentClaim?.programCode?.trim() || parentClaim?.campProgramCode?.trim() || '';
  if (claimProgramCode) {
    return {
      programCode: claimProgramCode,
      accessCode: parentClaim?.accessCode?.trim() || readActiveAccessCode()?.trim() || undefined,
      familyId: parentClaim?.familyId?.trim() || undefined,
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
