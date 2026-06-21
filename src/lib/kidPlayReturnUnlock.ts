import { readActivePilotProgram } from '../config/activePilotProgram';
import { readActiveAccessCode } from '../config/portalContext';
import { readLegacyFamilyPortalSession } from '../config/familyPortalAccess';
import { hasRememberedProgramAccess } from './rememberedProgramAccess';
import { hasActiveStudentPinSession } from './studentPinSession';
import { normalizeAccessCodeInput } from './portalAccessCodes';
import { lookupPilotProgramByAccessCodeDetailed } from './pilotProgramService';
import { isSupabaseConfigured } from './supabaseClient';

export const KID_PLAY_RETURN_ACCESS_ERROR =
  "We couldn't find that access. Please check your code and try again.";

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

/** Match return-screen access code against the active session program (no routing side effects). */
export function verifyKidPlayReturnAccessCodeLocal(accessCode: string): boolean {
  const normalized = normalizeAccessCode(accessCode);
  if (!normalized) return false;

  const stored = readActiveAccessCode();
  if (stored && normalizeAccessCode(stored) === normalized) {
    return true;
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

/** Portal-equivalent lookup when local session codes do not match. */
export async function verifyKidPlayReturnAccessCode(accessCode: string): Promise<boolean> {
  const trimmed = accessCode.trim();
  if (!trimmed) return false;

  if (verifyKidPlayReturnAccessCodeLocal(trimmed)) {
    return true;
  }

  if (!isSupabaseConfigured()) {
    return false;
  }

  const lookup = await lookupPilotProgramByAccessCodeDetailed(trimmed);
  if (lookup.status !== 'found' || !lookup.result) {
    return false;
  }

  const active = readActivePilotProgram();
  if (active && lookup.result.program.programCode !== active.programCode) {
    return false;
  }

  return true;
}
