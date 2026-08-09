import { buildStudentLoginUrl } from './familyClaimCode';

export type WelcomeEmailInput = {
  parentEmail?: string | null;
  parentFirstName?: string | null;
  familyOrProgramName: string;
  familyAccessCode?: string | null;
  childName: string;
  studentPin?: string | null;
  loginUrl?: string;
  relatedStudentId?: string | null;
  relatedFamilyId?: string | null;
  relatedProgramId?: string | null;
};

export type WelcomeEmailResult = {
  success: boolean;
  skipped: boolean;
  provider: 'Resend' | 'skipped';
  reason?: string;
};

function maskEmail(value: string): string {
  const [local = '', domain = ''] = value.trim().split('@');
  if (!local || !domain) return 'masked';
  return `${local.slice(0, 1)}***@${domain}`;
}

export function buildWelcomeEmailBody(input: WelcomeEmailInput): string {
  const parentFirstName = input.parentFirstName?.trim() || 'there';
  const accessLabel = input.familyAccessCode?.trim().startsWith('CLAIM-')
    ? `Family Claim Code: ${input.familyAccessCode}`
    : `Family Access Code: ${input.familyAccessCode || 'Provided by your program'}`;

  return [
    `Hi ${parentFirstName},`,
    '',
    "Welcome to Caiden's Courage! We’re excited to have your family join the Focus Flame journey.",
    '',
    'Your family access information is below:',
    '',
    `Family / Program Name: ${input.familyOrProgramName}`,
    accessLabel,
    `Child: ${input.childName}`,
    input.studentPin ? `Student PIN: ${input.studentPin}` : 'Student PIN: Ask your facilitator for a reset if needed.',
    `Family Portal Link: ${input.loginUrl || buildStudentLoginUrl()}`,
    '',
    'Your child can use their Student PIN to start their adventure, complete weekly missions, earn badges, and build their Focus Flame skills.',
    '',
    'Use the Family Portal Link above to connect your family portal, view progress, see certificates, and follow along with your child’s growth.',
    '',
    'If you have any questions, just reply to this email and we’ll help you get started.',
    '',
    'Welcome aboard,',
    'The Caiden’s Courage Team',
  ].join('\n');
}

export function buildWelcomePortalLink(input: WelcomeEmailInput): string {
  return input.loginUrl || `${window.location.origin}/portal`;
}

export async function queueWelcomeEmail(input: WelcomeEmailInput): Promise<WelcomeEmailResult> {
  const recipientEmail = input.parentEmail?.trim();
  if (!recipientEmail) {
    return { success: false, skipped: true, provider: 'skipped', reason: 'missing_recipient' };
  }

  const payload = {
    recipientEmail,
    emailType: 'welcome',
    subject: "Welcome to Caiden's Courage",
    body: buildWelcomeEmailBody(input),
    childName: input.childName,
    studentName: input.childName,
    programName: input.familyOrProgramName,
    familyAccessCode: input.familyAccessCode ?? null,
    portalLink: buildWelcomePortalLink(input),
    relatedStudentId: input.relatedStudentId ?? null,
    relatedFamilyId: input.relatedFamilyId ?? null,
    relatedProgramId: input.relatedProgramId ?? null,
  };

  try {
    const response = await fetch('/.netlify/functions/send-welcome-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      let reason = 'send_function_failed';
      try {
        const body = (await response.json()) as { error?: string };
        if (body.error?.includes('not configured')) {
          reason = 'RESEND_API_KEY missing';
        } else if (body.error) {
          reason = body.error;
        }
      } catch {
        /* ignore parse errors */
      }
      console.info('[WELCOME_EMAIL]', {
        provider: 'Resend',
        recipient_email: maskEmail(recipientEmail),
        success: false,
        skipped: response.status === 503,
        reason,
        status: response.status,
      });
      return {
        success: false,
        skipped: response.status === 503,
        provider: response.status === 503 ? 'skipped' : 'Resend',
        reason,
      };
    }

    console.info('[WELCOME_EMAIL]', {
      provider: 'Resend',
      recipient_email: maskEmail(recipientEmail),
      success: true,
      skipped: false,
    });
    return { success: true, skipped: false, provider: 'Resend' };
  } catch {
    console.info('[WELCOME_EMAIL]', {
      provider: 'Resend',
      recipient_email: maskEmail(recipientEmail),
      success: false,
      skipped: true,
      reason: 'send_function_unavailable',
    });
    return {
      success: false,
      skipped: true,
      provider: 'skipped',
      reason: 'send_function_unavailable',
    };
  }
}
