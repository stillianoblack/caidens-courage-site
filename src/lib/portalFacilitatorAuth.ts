import type { ActivePilotProgram } from '../types/pilotProgram';
import {
  PORTAL_EMAIL_NOT_REGISTERED_MESSAGE,
} from './portalAuthConfig';
import { logSessionIsolationWarning } from './sessionIsolationLog';

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export type FacilitatorEmailVerificationResult =
  | { success: true }
  | { success: false; message: string };

/**
 * Facilitator portal unlock requires a registered email on the scoped program.
 * Never unlock from access code alone.
 */
export function verifyFacilitatorProgramEmail(
  program: ActivePilotProgram,
  email: string,
  accessCode: string,
): FacilitatorEmailVerificationResult {
  const entered = normalizeEmail(email);
  if (!entered) {
    return { success: false, message: 'Enter your facilitator email to continue.' };
  }

  const scopedAccessCode = accessCode.trim();
  const programCode = program.programCode?.trim();
  if (!scopedAccessCode || !programCode) {
    return { success: false, message: PORTAL_EMAIL_NOT_REGISTERED_MESSAGE };
  }

  const registeredEmail = normalizeEmail(program.adminEmail || '');
  if (!registeredEmail || entered !== registeredEmail) {
    logSessionIsolationWarning('facilitator_email_not_registered', {
      program_code: programCode,
      attempted_email: entered,
    });
    return { success: false, message: PORTAL_EMAIL_NOT_REGISTERED_MESSAGE };
  }

  return { success: true };
}
