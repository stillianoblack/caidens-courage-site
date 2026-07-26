const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const { buildWelcomeEmail } = require('./welcomeEmailBuilder');

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
  const built =
    payload.html && (payload.body || payload.text)
      ? {
          success: true,
          subject: payload.subject,
          html: payload.html,
          text: payload.body || payload.text,
        }
      : buildWelcomeEmail(payload);
  if (!built.success) {
    return Promise.resolve({ success: false, error: built.error });
  }
  return sendResendEmail({
    to: payload.recipientEmail || payload.to,
    subject: payload.subject || built.subject,
    html: payload.html || built.html,
    text: payload.body || payload.text || built.text,
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

module.exports = {
  sendWelcomeEmail,
  sendAccessCodeEmail,
  sendPinResetEmail,
  sendCertificateEmail,
  sendMissionCompletedEmail,
  sendInactiveReminderEmail,
};
