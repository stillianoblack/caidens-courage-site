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

export function buildWelcomeEmailBody(input: WelcomeEmailInput): string {
  const parentFirstName = input.parentFirstName?.trim() || 'there';
  return [
    `Hi ${parentFirstName},`,
    '',
    "Welcome to Caiden's Courage! We’re excited to have your family join the Focus Flame journey.",
    '',
    'Your family access information is below:',
    '',
    `Family / Program Name: ${input.familyOrProgramName}`,
    `Family Access Code: ${input.familyAccessCode || 'Provided by your program'}`,
    `Child: ${input.childName}`,
    input.studentPin ? `Student PIN: ${input.studentPin}` : 'Student PIN: Ask your facilitator for a reset if needed.',
    `Login Link: ${input.loginUrl || buildStudentLoginUrl()}`,
    '',
    'Your child can use their Student PIN to start their adventure, complete weekly missions, earn badges, and build their Focus Flame skills.',
    '',
    'You can use your Family Access Code to connect your family portal, view progress, see certificates, and follow along with your child’s growth.',
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

export async function queueWelcomeEmail(input: WelcomeEmailInput): Promise<void> {
  const recipientEmail = input.parentEmail?.trim();
  if (!recipientEmail) return;

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
      console.info('[WELCOME_EMAIL_FAILED]', {
        recipient_email: recipientEmail,
        related_student_id: input.relatedStudentId ?? null,
        reason: 'send_function_failed',
      });
    }
  } catch {
    console.info('[WELCOME_EMAIL_FAILED]', {
      recipient_email: recipientEmail,
      related_student_id: input.relatedStudentId ?? null,
      reason: 'send_function_unavailable',
    });
  }
}
