import { readActivePilotProgram } from '../config/activePilotProgram';
import { readActiveAccessCode } from '../config/portalContext';
import { readParentClaimContext } from '../config/parentClaimContext';
import { readLegacyFamilyPortalSession } from '../config/familyPortalAccess';
import { isFamilyClaimCode } from './familyClaimCode';
import { lookupPortalProgramByAccessCodeDetailed } from './portalAccessResolve';
import { programScopesMatch } from './portalProgramScope';
import {
  readRememberedProgramAccessRecord,
  readRememberedProgramForContext,
  hasRememberedProgramAccess,
} from './rememberedProgramAccess';
import { hasActiveStudentPinSession } from './studentPinSession';
import { normalizeAccessCodeInput } from './portalAccessCodes';
import { fetchStudentFamilyLinksByFamilyProgram } from './studentFamilyLinkService';
import { isSupabaseConfigured } from './supabaseClient';

export const KID_PLAY_RETURN_ACCESS_ERROR =
  "We couldn't find that access. Please check your code and try again.";

export const KID_PLAY_RETURN_PIN_ERROR =
  'That student PIN did not match. Check the PIN from your facilitator or parent settings.';

export const KID_PLAY_RETURN_EMAIL_NOT_CONNECTED =
  'That email is not connected to this child or program.';

/** True when play-pause / Return To Session can run without sending users to /portal. */
export function hasKidPlayReturnSessionContext(): boolean {
  return (
    readLegacyFamilyPortalSession() ||
    hasRememberedProgramAccess() ||
    hasActiveStudentPinSession()
  );
}

export const STUDENT_PIN_INPUT_RE = /^\d{4,8}$/;

function normalizeAccessCode(raw: string): string {
  return normalizeAccessCodeInput(raw);
}

function normalizeSecret(raw: string): string {
  return raw.trim().toUpperCase();
}

/** Match return-screen access code against the active session program (no routing side effects). */
export function verifyKidPlayReturnAccessCodeLocal(accessCode: string): boolean {
  const normalized = normalizeAccessCode(accessCode);
  if (!normalized) return false;

  const stored = readActiveAccessCode();
  if (stored && normalizeAccessCode(stored) === normalized) {
    return true;
  }

  const remembered = readRememberedProgramAccessRecord();
  if (remembered && normalizeAccessCode(remembered.access_code) === normalized) {
    return true;
  }

  if (isFamilyClaimCode(accessCode) && remembered?.access_code) {
    if (normalizeSecret(remembered.access_code) === normalizeSecret(accessCode)) {
      return true;
    }
  }

  const program = readActivePilotProgram();
  if (!program) return false;

  const candidates = [
    program.familyAccessCode,
    program.facilitatorAccessCode,
    program.programCode,
  ]
    .filter(Boolean)
    .map((code) => normalizeAccessCode(code!));

  return candidates.includes(normalized);
}

async function accessCodeMatchesScopedProgram(accessCode: string): Promise<boolean> {
  const trimmed = accessCode.trim();
  if (!trimmed) return false;

  if (verifyKidPlayReturnAccessCodeLocal(trimmed)) {
    return true;
  }

  if (!isSupabaseConfigured()) {
    return false;
  }

  const lookup = await lookupPortalProgramByAccessCodeDetailed(trimmed);
  if (lookup.status !== 'found' || !lookup.result) {
    return false;
  }

  const active = readActivePilotProgram();
  const rememberedProgram = readRememberedProgramForContext();
  const rememberedRecord = readRememberedProgramAccessRecord();
  const scopeProgramCode =
    active?.programCode?.trim() ||
    rememberedProgram?.programCode?.trim() ||
    rememberedRecord?.program_code?.trim() ||
    readParentClaimContext()?.programCode?.trim() ||
    '';

  if (!scopeProgramCode) {
    return false;
  }

  const lookupProgramCode = lookup.result.program.programCode.trim();

  if (programScopesMatch(lookupProgramCode, scopeProgramCode)) {
    return true;
  }

  if (normalizeAccessCode(lookup.result.program.familyAccessCode) === normalizeAccessCode(trimmed)) {
    return programScopesMatch(scopeProgramCode, lookupProgramCode) ||
      Boolean(lookup.claimCodeContext);
  }

  if (lookup.claimCodeContext) {
    const rememberedCode = rememberedRecord?.access_code?.trim();
    if (rememberedCode && normalizeSecret(rememberedCode) === normalizeSecret(trimmed)) {
      return true;
    }

    const campCode =
      lookup.claimCodeContext.campProgramCode?.trim() || lookupProgramCode;
    const { links } = await fetchStudentFamilyLinksByFamilyProgram(scopeProgramCode);
    if (links.some((link) => programScopesMatch(link.camp_program_code, campCode))) {
      return true;
    }

    const claim = readParentClaimContext({ programCode: scopeProgramCode });
    if (claim?.campProgramCode && programScopesMatch(claim.campProgramCode, campCode)) {
      return true;
    }
  }

  return false;
}

/** Portal-equivalent lookup when local session codes do not match. */
export async function verifyKidPlayReturnAccessCode(accessCode: string): Promise<boolean> {
  return accessCodeMatchesScopedProgram(accessCode);
}

export function hasActivePortalProgramScope(): boolean {
  return Boolean(readActivePilotProgram()?.programCode?.trim());
}

/** Hide access code on Return To Session when portal/program context is already established. */
export function shouldHideReturnSessionAccessCode(input?: {
  inShellSessionId?: string | null;
}): boolean {
  if (input?.inShellSessionId?.trim()) return true;
  return (
    hasRememberedProgramAccess() ||
    hasActivePortalProgramScope() ||
    Boolean(readActiveAccessCode()?.trim()) ||
    hasActiveStudentPinSession()
  );
}

/** Skip re-entering access code when we already know the scoped program. */
export function canSkipReturnAccessCode(input?: {
  inShellSessionId?: string | null;
}): boolean {
  return shouldHideReturnSessionAccessCode(input);
}

/** @deprecated Use canSkipReturnAccessCode */
export function canSkipReturnAccessCodeForStudentPin(input?: {
  inShellSessionId?: string | null;
}): boolean {
  return canSkipReturnAccessCode(input);
}
