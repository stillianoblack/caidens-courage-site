import { sendResendEmail, type ResendEmailResult } from './providers/resend';

export type EmailKind =
  | 'welcome'
  | 'access_code'
  | 'pin_reset'
  | 'certificate'
  | 'mission_completed'
  | 'inactive_reminder';

export type BrandedEmailInput = {
  to: string;
  subject?: string;
  studentName?: string;
  programName?: string;
  familyAccessCode?: string;
  portalLink?: string;
  pin?: string;
  body?: string;
  html?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shell(title: string, body: string): string {
  return `
    <div style="margin:0;padding:28px;background:#07101f;font-family:Inter,Arial,sans-serif;color:#f8fafc;">
      <div style="max-width:620px;margin:0 auto;border:1px solid rgba(229,192,106,.28);border-radius:18px;background:#0f1b2d;overflow:hidden;">
        <div style="padding:24px 28px;border-bottom:1px solid rgba(229,192,106,.22);">
          <div style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#e5c06a;">Caiden's Courage</div>
          <h1 style="margin:8px 0 0;font-size:28px;line-height:1.15;color:#ffffff;">${escapeHtml(title)}</h1>
        </div>
        <div style="padding:26px 28px;font-size:16px;line-height:1.65;color:#dbeafe;">${body}</div>
      </div>
    </div>
  `;
}

function welcomeHtml(input: BrandedEmailInput): string {
  const studentName = escapeHtml(input.studentName || 'your student');
  const programName = escapeHtml(input.programName || "Caiden's Courage");
  const code = escapeHtml(input.familyAccessCode || 'Provided by your program');
  const portalLink = escapeHtml(input.portalLink || 'https://caidenscourage.com/portal');
  return shell(
    "Welcome to Caiden's Courage",
    `
      <p style="margin:0 0 18px;">Welcome aboard. ${studentName} is ready to begin their Focus Flame adventure with ${programName}.</p>
      <div style="margin:20px 0;padding:18px;border-radius:14px;background:rgba(229,192,106,.12);border:1px solid rgba(229,192,106,.26);">
        <p style="margin:0 0 8px;"><strong>Student:</strong> ${studentName}</p>
        <p style="margin:0 0 8px;"><strong>Program:</strong> ${programName}</p>
        <p style="margin:0;"><strong>Family access code:</strong> ${code}</p>
      </div>
      <p style="margin:0 0 18px;">Open your family portal, enter your family access code, and follow the prompts to connect to your child.</p>
      <p style="margin:0 0 20px;"><a href="${portalLink}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#4f7df3;color:#fff;text-decoration:none;font-weight:700;">Open Family Portal</a></p>
      <p style="margin:0;color:#a7b4cc;">Parents can view progress, certificates, and activity updates from the portal.</p>
    `,
  );
}

function textFallback(input: BrandedEmailInput, title: string): string {
  return (
    input.body ||
    [
      title,
      '',
      input.studentName ? `Student Name: ${input.studentName}` : '',
      input.programName ? `Program Name: ${input.programName}` : '',
      input.familyAccessCode ? `Family Access Code: ${input.familyAccessCode}` : '',
      input.pin ? `Student PIN: ${input.pin}` : '',
      input.portalLink ? `Open: ${input.portalLink}` : '',
    ]
      .filter(Boolean)
      .join('\n')
  );
}

async function send(kind: EmailKind, title: string, input: BrandedEmailInput): Promise<ResendEmailResult> {
  const html = input.html || (kind === 'welcome' ? welcomeHtml(input) : shell(title, `<p>${escapeHtml(input.body || title)}</p>`));
  return sendResendEmail({
    to: input.to,
    subject: input.subject || title,
    html,
    text: textFallback(input, title),
  });
}

export function sendWelcomeEmail(input: BrandedEmailInput): Promise<ResendEmailResult> {
  return send('welcome', "Welcome to Caiden's Courage", input);
}

export function sendAccessCodeEmail(input: BrandedEmailInput): Promise<ResendEmailResult> {
  return send('access_code', "Your Caiden's Courage access code", input);
}

export function sendPinResetEmail(input: BrandedEmailInput): Promise<ResendEmailResult> {
  return send('pin_reset', "Your student's new Caiden's Courage PIN", input);
}

export function sendCertificateEmail(input: BrandedEmailInput): Promise<ResendEmailResult> {
  return send('certificate', "Caiden's Courage certificate earned", input);
}

export function sendMissionCompletedEmail(input: BrandedEmailInput): Promise<ResendEmailResult> {
  return send('mission_completed', "Mission completed in Caiden's Courage", input);
}

export function sendInactiveReminderEmail(input: BrandedEmailInput): Promise<ResendEmailResult> {
  return send('inactive_reminder', "Ready to continue the adventure?", input);
}
