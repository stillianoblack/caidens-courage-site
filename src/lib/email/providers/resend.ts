export type ResendEmailPayload = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
};

export type ResendEmailResult =
  | { success: true; providerMessageId: string }
  | { success: false; error: string };

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export async function sendResendEmail(payload: ResendEmailPayload): Promise<ResendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { success: false, error: 'RESEND_API_KEY is not configured.' };
  }

  const from =
    payload.from?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
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

    const data = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!response.ok) {
      return { success: false, error: data.message || `Resend failed with ${response.status}.` };
    }

    return { success: true, providerMessageId: data.id || '' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Resend delivery failed.',
    };
  }
}
