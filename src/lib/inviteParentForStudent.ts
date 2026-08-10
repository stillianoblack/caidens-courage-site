import { inviteCampCompatibilityParent } from './campChildSessionApi';
import { trackKitParentSignup } from './kitIntegration';
import type { ParentConnectionStatus } from './studentPinService';
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

async function buildParentInviteDeliveryKey(
  participantId: string,
  parentEmail: string,
): Promise<string> {
  const normalizedEmail = parentEmail.trim().toLowerCase();
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalizedEmail));
  const recipientHash = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  return `participant:${participantId}:parent-welcome:${recipientHash}`;
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

  let invite;
  try {
    invite = await inviteCampCompatibilityParent({
      participantId,
      parentEmail,
      parentFirstName: input.parentFirstName,
      parentLastName: input.parentLastName,
    });
  } catch (caught) {
    const error = caught as Error & { correlationId?: string | null };
    return {
      success: false,
      message: error.correlationId
        ? `B-4 couldn't connect this parent yet. Support code: ${error.correlationId.slice(0, 8)}.`
        : "B-4 couldn't connect this parent yet. Please try again.",
    };
  }

  const programCode = campProgramCode;
  const familyClaimCode = invite.familyClaimCode;
  const familyClaimUrl = invite.familyClaimUrl;
  const childName = invite.childName;

  let welcomeEmailSkipped = false;
  if (input.sendWelcomeEmail !== false) {
    trackKitParentSignup({
      parentEmail,
      eventName: 'parent_signup',
      metadata: {
        participant_id: participantId,
        camp_program_code: programCode,
        source: 'roster_invite',
      },
    });

    const deliveryEventKey = await buildParentInviteDeliveryKey(participantId, parentEmail);
    const emailResult = await queueWelcomeEmail({
      parentEmail,
      parentFirstName: input.parentFirstName,
      familyOrProgramName: programCode,
      familyAccessCode: familyClaimCode,
      childName,
      loginUrl: familyClaimUrl,
      templateType: 'camp_parent',
      programType: 'Camp / Youth Program',
      recipientRole: 'parent_guardian',
      deliveryEventKey,
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
