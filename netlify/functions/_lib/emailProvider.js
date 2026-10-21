const RESEND_ENDPOINT = 'https://api.resend.com/emails';

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function brandedShell(title, body) {
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

function welcomeEmailHtml(payload) {
  const studentName = escapeHtml(payload.studentName || payload.childName || 'your student');
  const programName = escapeHtml(payload.programName || payload.familyOrProgramName || "Caiden's Courage");
  const programCode = escapeHtml(payload.programCode || '');
  const code = escapeHtml(payload.familyAccessCode || 'Provided by your program');
  const portalLink = escapeHtml(payload.portalLink || payload.loginUrl || 'https://caidenscourage.com/portal');
  return brandedShell(
    "Welcome to Caiden's Courage",
    `
      <p style="margin:0 0 18px;">Welcome aboard. ${studentName} is ready to begin their Focus Flame adventure with ${programName}.</p>
      <div style="margin:20px 0;padding:18px;border-radius:14px;background:rgba(229,192,106,.12);border:1px solid rgba(229,192,106,.26);">
        <p style="margin:0 0 8px;"><strong>Student:</strong> ${studentName}</p>
        <p style="margin:0 0 8px;"><strong>Program:</strong> ${programName}</p>
        ${programCode ? `<p style="margin:0 0 8px;"><strong>Program code:</strong> ${programCode}</p>` : ''}
        <p style="margin:0;"><strong>Family access code:</strong> ${code}</p>
      </div>
      <p style="margin:0 0 18px;">Open your family portal, enter your family access code, and follow the prompts to connect to your child.</p>
      <p style="margin:0 0 20px;"><a href="${portalLink}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#4f7df3;color:#fff;text-decoration:none;font-weight:700;">Open Family Portal</a></p>
      <p style="margin:0 0 18px;color:#a7b4cc;"><strong>Next steps:</strong> sign in, connect to your child, and begin the first adventure. Parents can view progress, certificates, and activity updates from the portal.</p>
      <p style="margin:0;color:#a7b4cc;">Need help? Contact <a href="mailto:hello@caidenscourage.com" style="color:#e5c06a;">hello@caidenscourage.com</a>.</p>
    `,
  );
}

async function sendResendEmail(payload) {
  const apiKey = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim();
  if (!apiKey) {
    return { success: false, error: 'RESEND_API_KEY is not configured.' };
  }

  const from =
    (payload.from && payload.from.trim()) ||
    (process.env.RESEND_FROM_EMAIL && process.env.RESEND_FROM_EMAIL.trim()) ||
    "Caiden's Courage <hello@caidenscourage.com>";

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(payload.idempotencyKey ? { 'Idempotency-Key': payload.idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, error: data.message || `Resend failed with ${response.status}.` };
    }
    return { success: true, providerMessageId: data.id || null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Resend delivery failed.' };
  }
}

function sendWelcomeEmail(payload) {
  return sendResendEmail({
    to: payload.recipientEmail || payload.to,
    subject: payload.subject || "Welcome to Caiden's Courage",
    html: payload.html || welcomeEmailHtml(payload),
    text: payload.body || payload.text,
  });
}

function sendAccessCodeEmail(payload) {
  return sendResendEmail(payload);
}

function sendPinResetEmail(payload) {
  return sendResendEmail(payload);
}

function sendCertificateEmail(payload) {
  return sendResendEmail(payload);
}

function sendMissionCompletedEmail(payload) {
  return sendResendEmail(payload);
}

function sendInactiveReminderEmail(payload) {
  return sendResendEmail(payload);
}

function resendConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim());
}

function bookstoreRecoveryEmailHtml(downloadPageUrl) {
  const href = escapeHtml(downloadPageUrl);
  return brandedShell(
    'Your download link',
    `
      <p style="margin:0 0 18px;">Use this one-time link to open your digital edition download page. It expires in 30 minutes and works once.</p>
      <p style="margin:0 0 20px;"><a href="${href}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#e5c06a;color:#10213d;text-decoration:none;font-weight:700;">Open download page</a></p>
      <p style="margin:0;color:#a7b4cc;">This email does not include the book file. When you need the book again, request a new link from My Books.</p>
    `,
  );
}

function academyClaimEmailHtml({ claimUrl, days, productTitle }) {
  const href = escapeHtml(claimUrl);
  return brandedShell(
    'Activate your Academy access',
    `
      <p style="margin:0 0 18px;">Thank you for purchasing ${escapeHtml(productTitle)}. A parent can activate ${escapeHtml(String(days))} days of Focus Flame Academy access for the family.</p>
      <p style="margin:0 0 18px;">This invitation expires in 30 minutes and works once. The access period starts when you activate it, not when you bought the bundle. Activate within 180 days of purchase. This does not start a paid membership.</p>
      <p style="margin:0 0 20px;"><a href="${href}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#e5c06a;color:#10213d;text-decoration:none;font-weight:700;">Activate Academy access</a></p>
      <p style="margin:0;color:#a7b4cc;">If this link expires, request another invitation from the bookstore claim page. The new link is sent only to the purchase email.</p>
    `,
  );
}

function sendAcademyClaimEmail(payload) {
  return sendResendEmail({
    to: payload.to,
    subject: 'Activate your Focus Flame Academy access',
    html: academyClaimEmailHtml(payload),
    text: `Activate ${payload.days} days of Focus Flame Academy access for ${payload.productTitle}. Open this one-time link: ${payload.claimUrl}\nThe link expires in 30 minutes. Access starts when a parent activates it and must be claimed within 180 days of purchase. This does not start a paid membership.`,
    idempotencyKey: payload.idempotencyKey,
  });
}

function sendBookstoreRecoveryEmail(payload) {
  const downloadPageUrl = payload.downloadPageUrl;
  return sendResendEmail({
    to: payload.to,
    subject: 'Your Caiden Vale download link',
    html: bookstoreRecoveryEmailHtml(downloadPageUrl),
    text: `Open this one-time download page: ${downloadPageUrl}\nThe link expires in 30 minutes and works once. This email does not include the book file.`,
    idempotencyKey: payload.idempotencyKey,
  });
}

module.exports = {
  sendWelcomeEmail,
  sendAccessCodeEmail,
  sendPinResetEmail,
  sendCertificateEmail,
  sendMissionCompletedEmail,
  sendInactiveReminderEmail,
  sendBookstoreRecoveryEmail,
  sendAcademyClaimEmail,
  resendConfigured,
};
