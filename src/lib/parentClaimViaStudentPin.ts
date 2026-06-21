import type { ActivePilotProgram } from '../types/pilotProgram';
import { setActiveChild } from './activeChildContext';
import { resolveFamilyPortalOverviewPath } from './familyKidLanding';
import { writeLastPilotProgram } from '../config/lastPilotProgram';
import {
  activatePrivateFamilyPortalFromClaim,
  createOrResolveFamilyProgramForParent,
} from './parentClaimFamilyPortalService';
import {
  backfillStudentFamilyLinkParentContact,
  ensureCampStudentFamilyLink,
  fetchParticipantsByIds,
  markStudentFamilyLinksClaimed,
  type StudentFamilyLink,
} from './studentFamilyLinkService';
import { revealStudentPinViaFunction } from './studentPinService';
import { isPlaceholderParentName, resolveStudentDisplayNameOrFallback } from './studentDisplayName';
import { trackKitParentSignup } from './kitIntegration';
import { queueWelcomeEmail } from './welcomeEmailService';

export type ParentClaimViaStudentPinInput = {
  program: ActivePilotProgram;
  accessCode: string;
  participantId: string;
  childDisplayName?: string;
  parentEmail: string;
  parentFirstName?: string;
  parentLastName?: string;
  parentPhone?: string;
};

export type ParentClaimViaStudentPinResult = {
  success: boolean;
  message?: string;
  familyProgram?: ActivePilotProgram;
  overviewPath?: string;
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

async function resolveCampLink(input: {
  participantId: string;
  campProgramCode: string;
  parentEmail: string;
  parentFirstName?: string;
  parentLastName?: string;
  parentPhone?: string;
}): Promise<{ success: boolean; link?: StudentFamilyLink; error?: string }> {
  const ensure = await ensureCampStudentFamilyLink({
    studentId: input.participantId,
    campProgramCode: input.campProgramCode,
  });
  if (!ensure.success || !ensure.link) {
    return { success: false, error: ensure.error ?? 'Could not prepare family link.' };
  }

  const backfill = await backfillStudentFamilyLinkParentContact({
    linkId: ensure.link.id,
    parentEmail: input.parentEmail,
    parentFirstName: input.parentFirstName,
    parentLastName: input.parentLastName,
    parentPhone: input.parentPhone,
  });

  if (!backfill.success || !backfill.link) {
    return { success: false, error: backfill.error ?? 'Could not save parent contact.' };
  }

  return { success: true, link: backfill.link };
}

export async function completeParentClaimViaStudentPin(
  input: ParentClaimViaStudentPinInput,
): Promise<ParentClaimViaStudentPinResult> {
  const email = input.parentEmail.trim();
  if (!isValidEmail(email)) {
    return { success: false, message: 'Enter a valid parent/guardian email.' };
  }

  const participantId = input.participantId.trim();
  const campProgramCode = input.program.programCode.trim();
  if (!participantId || !campProgramCode) {
    return { success: false, message: 'Missing student or program context.' };
  }

  const linkResult = await resolveCampLink({
    participantId,
    campProgramCode,
    parentEmail: email,
    parentFirstName: input.parentFirstName,
    parentLastName: input.parentLastName,
    parentPhone: input.parentPhone,
  });

  if (!linkResult.success || !linkResult.link) {
    return { success: false, message: linkResult.error ?? 'Could not connect parent to student.' };
  }

  const familyProgram = await createOrResolveFamilyProgramForParent({
    parentEmail: email,
    parentLastName:
      input.parentLastName?.trim() ||
      (linkResult.link.parent_last_name?.trim() &&
      !isPlaceholderParentName(linkResult.link.parent_last_name)
        ? linkResult.link.parent_last_name.trim()
        : 'Family'),
    parentFirstName: input.parentFirstName?.trim() || linkResult.link.parent_first_name || undefined,
    campProgram: input.program,
    existingFamilyProgramCode: linkResult.link.family_program_code,
  });

  if (!familyProgram) {
    return { success: false, message: 'Could not set up your family portal.' };
  }

  const claimResult = await markStudentFamilyLinksClaimed({
    linkIds: [linkResult.link.id],
    familyProgramCode: familyProgram.programCode,
    parentEmail: email,
    parentPhone: input.parentPhone,
    parentFirstName: input.parentFirstName?.trim() || linkResult.link.parent_first_name || undefined,
    parentLastName:
      input.parentLastName?.trim() ||
      linkResult.link.parent_last_name?.trim() ||
      undefined,
  });

  if (!claimResult.success) {
    return { success: false, message: claimResult.error ?? 'Could not complete parent claim.' };
  }

  activatePrivateFamilyPortalFromClaim({
    familyProgram,
    accessCode: input.accessCode,
    parentEmail: email,
    parentFirstName: input.parentFirstName?.trim() || linkResult.link.parent_first_name || undefined,
    parentPhone: input.parentPhone,
    parentLastName: input.parentLastName?.trim() || linkResult.link.parent_last_name || undefined,
    campProgramCode,
  });

  writeLastPilotProgram(familyProgram, 'family', email, input.accessCode);

  const { participants } = await fetchParticipantsByIds([participantId]);
  const participant = participants[0];
  const childName =
    input.childDisplayName?.trim() ||
    (participant
      ? resolveStudentDisplayNameOrFallback(
          { nickname: participant.nickname, first_name: participant.first_name },
          'Student',
        )
      : 'Your child');

  if (participant) {
    setActiveChild({
      participantId: participant.id,
      displayName: childName,
      firstName: participant.first_name?.trim(),
    });
  }

  let studentPin: string | undefined;
  try {
    const pinResult = await revealStudentPinViaFunction({
      participantId,
      programCode: campProgramCode,
      parentEmail: email,
      actorRole: 'parent',
    });
    if ('pin' in pinResult) {
      studentPin = pinResult.pin;
    }
  } catch {
    /* optional in welcome email */
  }

  trackKitParentSignup({
    parentEmail: email,
    eventName: 'parent_claim',
    metadata: {
      family_program_code: familyProgram.programCode,
      participant_id: participantId,
    },
    welcomeEmail: {
      parentEmail: email,
      parentFirstName: input.parentFirstName,
      familyOrProgramName: familyProgram.programName || campProgramCode,
      familyAccessCode: familyProgram.familyAccessCode ?? undefined,
      childName,
      studentPin,
      loginUrl: undefined,
      relatedStudentId: participantId,
      relatedProgramId: familyProgram.programCode,
    },
  });

  void queueWelcomeEmail({
    parentEmail: email,
    parentFirstName: input.parentFirstName,
    familyOrProgramName: familyProgram.programName || campProgramCode,
    familyAccessCode: familyProgram.familyAccessCode ?? undefined,
    childName,
    studentPin,
    loginUrl: undefined,
    relatedStudentId: participantId,
    relatedProgramId: familyProgram.programCode,
  });

  console.info('[PARENT_CLAIM_VIA_PIN]', {
    parent_email: email,
    participant_id: participantId,
    family_program_code: familyProgram.programCode,
  });

  return {
    success: true,
    familyProgram,
    overviewPath: resolveFamilyPortalOverviewPath(),
  };
}
