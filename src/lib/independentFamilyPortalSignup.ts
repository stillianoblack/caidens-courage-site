import { applyProgramPortalUnlock } from '../config/portalContext';
import { writeLastPilotProgram } from '../config/lastPilotProgram';
import { writeParentClaimContext } from '../config/parentClaimContext';
import type { ActivePilotProgram } from '../types/pilotProgram';
import { clearActiveChild } from './activeChildContext';
import { isIndependentFamilyProgram } from './independentFamilyProgram';

export type IndependentFamilyPortalUnlockResult =
  | { success: true }
  | { success: false; message: string };

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/** Independent families verify against the signup admin/parent email — not camp roster links. */
export function verifyIndependentFamilyParentEmail(
  program: ActivePilotProgram,
  parentEmail: string,
): IndependentFamilyPortalUnlockResult {
  const email = parentEmail.trim();
  if (!email) {
    return { success: false, message: 'Enter your parent/guardian email.' };
  }
  if (!isIndependentFamilyProgram(program)) {
    return {
      success: false,
      message: 'This access code is for a camp program. Use your camp family code to claim your child.',
    };
  }

  const registeredEmail = normalizeEmail(program.adminEmail || '');
  if (registeredEmail && normalizeEmail(email) !== registeredEmail) {
    return {
      success: false,
      message: 'Enter the email you used when you created your family account.',
    };
  }

  return { success: true };
}

/** Opens an independent family portal session — zero children allowed, no camp claim. */
export function activateIndependentFamilyPortalSession(input: {
  program: ActivePilotProgram;
  parentEmail: string;
  accessCode: string;
  parentLastName?: string;
}): void {
  const accessCode = input.accessCode.trim() || input.program.familyAccessCode;

  applyProgramPortalUnlock(input.program, 'family', accessCode);
  writeLastPilotProgram(input.program, 'family', input.parentEmail.trim(), accessCode);
  writeParentClaimContext({
    email: input.parentEmail.trim(),
    lastName: input.parentLastName,
    confirmed: true,
  });
  clearActiveChild();

  console.info('[INDEPENDENT_FAMILY_PORTAL_UNLOCK]', {
    program_code: input.program.programCode,
    parent_email: normalizeEmail(input.parentEmail),
    access_code: accessCode,
  });
}

export async function unlockIndependentFamilyPortal(input: {
  program: ActivePilotProgram;
  parentEmail: string;
  accessCode: string;
  parentLastName?: string;
}): Promise<IndependentFamilyPortalUnlockResult> {
  const verified = verifyIndependentFamilyParentEmail(input.program, input.parentEmail);
  if (!verified.success) return verified;

  activateIndependentFamilyPortalSession(input);
  return { success: true };
}
