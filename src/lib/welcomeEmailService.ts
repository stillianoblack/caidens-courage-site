import { buildStudentLoginUrl } from './familyClaimCode';

export type WelcomeEmailInput = {
  parentEmail?: string | null;
  parentFirstName?: string | null;
  familyOrProgramName?: string;
  familyAccessCode?: string | null;
  facilitatorAccessCode?: string | null;
  programCode?: string | null;
  childName?: string;
  studentPin?: string | null;
  loginUrl?: string;
  templateType?: 'family' | 'camp_parent' | 'staff';
  programType?:
    | 'independent_family'
    | 'Independent Family'
    | 'Camp / Youth Program'
    | 'Teacher / Classroom'
    | 'After-School Program'
    | 'School'
    | 'District'
    | 'Homeschool Group';
  recipientRole?: 'parent_guardian' | 'facilitator' | 'educator';
  deliveryEventKey?: string | null;
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

export function buildWelcomeEmailBody(input: WelcomeEmailInput): string {
  const parentFirstName = input.parentFirstName?.trim() || 'there';
  const accessLabel = input.familyAccessCode?.trim().startsWith('CLAIM-')
    ? `Family Claim Code: ${input.familyAccessCode}`
    : `Family Access Code: ${input.familyAccessCode || 'Provided by your program'}`;

  return [
    `Hi ${parentFirstName},`,
    '',
    'Welcome to Focus Flame Academy',
    'A Caiden’s Courage Learning Adventure',
    '',
    'Your family is ready to begin its Focus Flame adventure.',
    '',
    'Your family access information is below:',
    '',
    input.familyOrProgramName ? `Family / Program Name: ${input.familyOrProgramName}` : null,
    accessLabel,
    input.childName ? `Learner: ${input.childName}` : null,
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
  ].filter((line): line is string => line !== null).join('\n');
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
    subject: 'Welcome to Focus Flame Academy — Your Adventure Starts Here',
    body: buildWelcomeEmailBody(input),
    templateType: input.templateType ?? 'family',
    programType: input.programType ?? 'independent_family',
    recipientRole: input.recipientRole ?? 'parent_guardian',
    recipientName: input.parentFirstName,
    learnerName: input.childName,
    programName: input.familyOrProgramName,
    familyAccessCode: input.familyAccessCode ?? null,
    facilitatorAccessCode: input.facilitatorAccessCode ?? null,
    programCode: input.programCode ?? null,
    portalLink: buildWelcomePortalLink(input),
    deliveryEventKey: input.deliveryEventKey ?? null,
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
        recipient_present: true,
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
      recipient_present: true,
      success: true,
      skipped: false,
    });
    return { success: true, skipped: false, provider: 'Resend' };
  } catch {
    console.info('[WELCOME_EMAIL]', {
      provider: 'Resend',
      recipient_present: true,
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
