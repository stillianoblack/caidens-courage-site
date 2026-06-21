import { readActivePilotProgram } from '../config/activePilotProgram';
import { readActiveAccessCode } from '../config/portalContext';
import { readParentClaimContext } from '../config/parentClaimContext';
import { isIndependentFamilyProgram, inferProgramTypeFromCode, INDEPENDENT_FAMILY_PROGRAM_TYPE } from './independentFamilyProgram';
import { lookupStudentByFamilyClaimCode } from './familyClaimByCodeService';
import { isFamilyClaimCode } from './familyClaimCode';
import { lookupPortalProgramByAccessCodeDetailed } from './portalAccessResolve';
import {
  readRememberedProgramAccessCode,
  readRememberedProgramForContext,
} from './rememberedProgramAccess';
import { readRememberedDeviceSession } from './rememberedDeviceSession';
import { fetchStudentFamilyLinksByFamilyProgram } from './studentFamilyLinkService';
import { PORTAL_PIN_MISMATCH_MESSAGE } from './portalIdentity';
import { readStudentPinSession } from './studentPinSession';
import { verifyStudentPinLogin } from './studentPinService';

async function addCampCodesFromAccessCode(accessCode: string, codes: Set<string>): Promise<void> {
  const trimmed = accessCode.trim();
  if (!trimmed) return;

  if (isFamilyClaimCode(trimmed)) {
    const claimLookup = await lookupStudentByFamilyClaimCode(trimmed);
    if (claimLookup.student?.programCode?.trim()) {
      codes.add(claimLookup.student.programCode.trim());
    }
    return;
  }

  const lookup = await lookupPortalProgramByAccessCodeDetailed(trimmed);
  if (lookup.status !== 'found' || !lookup.result) return;

  const { program } = lookup.result;
  const programCode = program.programCode.trim();
  if (!programCode) return;

  if (lookup.claimCodeContext?.campProgramCode?.trim()) {
    codes.add(lookup.claimCodeContext.campProgramCode.trim());
    return;
  }

  if (!isIndependentFamilyProgram(program)) {
    codes.add(programCode);
    return;
  }

  // Independent family students are enrolled under the family program_code directly.
  codes.add(programCode);

  const { links } = await fetchStudentFamilyLinksByFamilyProgram(programCode);
  for (const link of links) {
    if (link.camp_program_code?.trim()) {
      codes.add(link.camp_program_code.trim());
    }
  }
}

/** Collect camp program codes where student PIN rows live (family portal uses a separate program code). */
export async function resolveStudentPinProgramCodeCandidates(input?: {
  accessCodeHint?: string;
  campProgramCodeHint?: string;
}): Promise<string[]> {
  const codes = new Set<string>();

  if (input?.campProgramCodeHint?.trim()) {
    codes.add(input.campProgramCodeHint.trim());
  }

  const pinSession = readStudentPinSession({ allowCampUnderFamilyPortal: true });
  if (pinSession?.programCode?.trim()) {
    codes.add(pinSession.programCode.trim());
  }

  const device = readRememberedDeviceSession();
  if (device?.program_code?.trim()) {
    codes.add(device.program_code.trim());
  }

  const claim = readParentClaimContext();
  if (claim?.campProgramCode?.trim()) {
    codes.add(claim.campProgramCode.trim());
  }

  const active = readActivePilotProgram();
  const remembered = readRememberedProgramForContext();
  const portalProgram = active ?? remembered;

  if (portalProgram?.programCode?.trim()) {
    codes.add(portalProgram.programCode.trim());
  }

  const familyProgramCode =
    (portalProgram && isIndependentFamilyProgram(portalProgram) ? portalProgram.programCode : null) ||
    claim?.programCode?.trim() ||
    null;

  if (familyProgramCode) {
    if (
      inferProgramTypeFromCode(familyProgramCode) === INDEPENDENT_FAMILY_PROGRAM_TYPE &&
      !codes.has(familyProgramCode)
    ) {
      codes.add(familyProgramCode);
    }

    const { links } = await fetchStudentFamilyLinksByFamilyProgram(familyProgramCode);
    for (const link of links) {
      if (link.camp_program_code?.trim()) {
        codes.add(link.camp_program_code.trim());
      }
    }
  }

  const accessCode =
    input?.accessCodeHint?.trim() ||
    readRememberedProgramAccessCode()?.trim() ||
    readActiveAccessCode()?.trim() ||
    claim?.accessCode?.trim() ||
    '';

  if (accessCode) {
    await addCampCodesFromAccessCode(accessCode, codes);
  }

  return Array.from(codes);
}

export async function verifyStudentPinLoginWithProgramFallback(input: {
  pin: string;
  firstNameHint?: string;
  accessCodeHint?: string;
  campProgramCodeHint?: string;
}): Promise<
  | { success: true; participantId: string; displayName: string; programCode: string }
  | { success: false; error: string }
> {
  const pin = input.pin.trim();
  if (!pin) {
    return { success: false, error: 'Enter a student PIN to continue.' };
  }

  const candidates = await resolveStudentPinProgramCodeCandidates({
    accessCodeHint: input.accessCodeHint,
    campProgramCodeHint: input.campProgramCodeHint,
  });
  if (!candidates.length) {
    return { success: false, error: PORTAL_PIN_MISMATCH_MESSAGE };
  }

  let lastError = PORTAL_PIN_MISMATCH_MESSAGE;
  for (const programCode of candidates) {
    const result = await verifyStudentPinLogin({
      programCode,
      pin,
      firstNameHint: input.firstNameHint,
    });
    if (result.success) {
      return result;
    }
    lastError = result.error;
  }

  return { success: false, error: lastError };
}
