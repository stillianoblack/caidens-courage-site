import { ensureStudentAccessReady } from './ensureStudentAccessReady';
import {
  backfillStudentFamilyLinkParentContact,
  ensureCampStudentFamilyLink,
  fetchParticipantsByIds,
} from './studentFamilyLinkService';
import { trackKitParentSignup } from './kitIntegration';
import { revealStudentPinViaFunction, type ParentConnectionStatus } from './studentPinService';
import { resolveStudentDisplayNameOrFallback } from './studentDisplayName';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import { queueWelcomeEmail } from './welcomeEmailService';

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
  welcomeEmailSkipped?: boolean;
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

  const ready = await ensureStudentAccessReady({
    participantId,
    programCodeHint: campProgramCode,
  });
  if (!ready.success) {
    return { success: false, message: ready.error };
  }

  const programCode = ready.access.programCode;

  const ensureLink = await ensureCampStudentFamilyLink({ studentId: participantId, campProgramCode: programCode });
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

  const familyClaimCode = ready.access.familyClaimCode ?? undefined;
  const familyClaimUrl = ready.access.familyClaimUrl ?? undefined;

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
  let welcomeEmailSkipped = false;
  if (input.sendWelcomeEmail !== false) {
    try {
      const pinResult = await revealStudentPinViaFunction({
        participantId,
        programCode,
        actorRole: 'facilitator',
      });
      if ('pin' in pinResult) {
        studentPin = pinResult.pin;
      }
    } catch {
      /* optional */
    }

    trackKitParentSignup({
      parentEmail,
      eventName: 'parent_signup',
      metadata: {
        participant_id: participantId,
        camp_program_code: programCode,
        source: 'roster_invite',
      },
    });

    const emailResult = await queueWelcomeEmail({
      parentEmail,
      parentFirstName: input.parentFirstName,
      familyOrProgramName: programCode,
      familyAccessCode: familyClaimCode,
      childName,
      studentPin,
      loginUrl: familyClaimUrl,
      relatedStudentId: participantId,
      relatedProgramId: programCode,
    });

    welcomeEmailSkipped = emailResult.skipped || !emailResult.success;

    console.info('[INVITE_PARENT_EMAIL]', {
      provider: emailResult.provider,
      kit: 'Kit tag event queued separately',
      recipient_email: parentEmail,
      success: emailResult.success,
      skipped: welcomeEmailSkipped,
      reason: emailResult.reason ?? null,
    });
  } else {
    console.info('[INVITE_PARENT_EMAIL]', {
      provider: 'skipped',
      kit: 'skipped',
      recipient_email: parentEmail,
      success: true,
      skipped: true,
      reason: 'sendWelcomeEmail=false',
    });
  }

  console.info('[INVITE_PARENT_FOR_STUDENT]', {
    participant_id: participantId,
    camp_program_code: programCode,
    parent_email: parentEmail,
    send_welcome: input.sendWelcomeEmail !== false,
    welcome_email_skipped: welcomeEmailSkipped,
  });

  const baseMessage = `Invite saved for ${childName}. Parent status: Invited.`;
  const isLocalDev =
    process.env.NODE_ENV === 'development' || process.env.REACT_APP_PORTAL_DEV_LOG === '1';
  return {
    success: true,
    message:
      welcomeEmailSkipped && isLocalDev
        ? `${baseMessage} Parent connected. Email skipped in local config.`
        : welcomeEmailSkipped
          ? `${baseMessage} Welcome email could not be sent — check email config.`
          : baseMessage,
    familyClaimCode,
    familyClaimUrl,
    parentConnectionStatus: 'invited',
    welcomeEmailSkipped,
  };
}
