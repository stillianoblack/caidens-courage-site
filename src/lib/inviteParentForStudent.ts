import {
  backfillStudentFamilyLinkParentContact,
  ensureCampStudentFamilyLink,
  fetchParticipantsByIds,
} from './studentFamilyLinkService';
import { ensureFamilyClaimCodeForParticipant, revealStudentPinViaFunction } from './studentPinService';
import { buildFamilyClaimUrl } from './familyClaimCode';
import { resolveStudentDisplayNameOrFallback } from './studentDisplayName';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import { queueWelcomeEmail } from './welcomeEmailService';
import type { ParentConnectionStatus } from './studentPinService';

export type InviteParentForStudentInput = {
  participantId: string;
  campProgramCode: string;
  parentEmail: string;
  parentFirstName?: string;
  parentLastName?: string;
  sendWelcomeEmail?: boolean;
};

export type InviteParentForStudentResult = {
  success: boolean;
  message: string;
  familyClaimCode?: string;
  familyClaimUrl?: string;
  parentConnectionStatus?: ParentConnectionStatus;
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function inviteParentForStudent(
  input: InviteParentForStudentInput,
): Promise<InviteParentForStudentResult> {
  const parentEmail = input.parentEmail.trim();
  const participantId = input.participantId.trim();
  const campProgramCode = input.campProgramCode.trim();

  if (!parentEmail || !isValidEmail(parentEmail)) {
    return { success: false, message: 'Enter a valid parent/guardian email.' };
  }
  if (!participantId || !campProgramCode) {
    return { success: false, message: 'Missing student or program.' };
  }

  const ensureLink = await ensureCampStudentFamilyLink({ studentId: participantId, campProgramCode });
  if (!ensureLink.success || !ensureLink.link) {
    return { success: false, message: ensureLink.error ?? 'Could not prepare family link.' };
  }

  const backfill = await backfillStudentFamilyLinkParentContact({
    linkId: ensureLink.link.id,
    parentEmail,
    parentFirstName: input.parentFirstName,
    parentLastName: input.parentLastName || 'Family',
  });

  if (!backfill.success) {
    return { success: false, message: backfill.error ?? 'Could not save parent email.' };
  }

  const claimResult = await ensureFamilyClaimCodeForParticipant({ participantId });
  const familyClaimCode = 'code' in claimResult ? claimResult.code : undefined;
  const familyClaimUrl = familyClaimCode ? buildFamilyClaimUrl(familyClaimCode) : undefined;

  if (isSupabaseConfigured() && supabase) {
    await supabase
      .from('participants')
      .update({
        parent_connection_status: 'invited',
        guardian_email: parentEmail,
      })
      .eq('id', participantId);
  }

  const { participants } = await fetchParticipantsByIds([participantId]);
  const participant = participants[0];
  const childName = participant
    ? resolveStudentDisplayNameOrFallback(
        { nickname: participant.nickname, first_name: participant.first_name },
        'Student',
      )
    : 'Student';

  let studentPin: string | undefined;
  if (input.sendWelcomeEmail !== false) {
    try {
      const pinResult = await revealStudentPinViaFunction({
        participantId,
        programCode: campProgramCode,
        actorRole: 'facilitator',
      });
      if ('pin' in pinResult) {
        studentPin = pinResult.pin;
      }
    } catch {
      /* optional */
    }

    void queueWelcomeEmail({
      parentEmail,
      parentFirstName: input.parentFirstName,
      familyOrProgramName: campProgramCode,
      familyAccessCode: familyClaimCode,
      childName,
      studentPin,
      loginUrl: familyClaimUrl,
      relatedStudentId: participantId,
      relatedProgramId: campProgramCode,
    });
  }

  console.info('[INVITE_PARENT_FOR_STUDENT]', {
    participant_id: participantId,
    camp_program_code: campProgramCode,
    parent_email: parentEmail,
    send_welcome: input.sendWelcomeEmail !== false,
  });

  return {
    success: true,
    message: `Invite saved for ${childName}. Parent status: Invited.`,
    familyClaimCode,
    familyClaimUrl,
    parentConnectionStatus: 'invited',
  };
}
