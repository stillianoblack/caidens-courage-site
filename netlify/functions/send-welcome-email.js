const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const { sendWelcomeEmail } = require('./_lib/emailProvider');
const {
  createDeliveryAttempt,
  findDeliveryByEventKey,
  recipientIdentifier,
  updateDeliveryAttempt,
} = require('./_lib/emailDeliveryLog');
const { buildWelcomeEmail } = require('./_lib/welcomeEmailBuilder');

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function resolveCorrelationId(event) {
  const supplied = event.headers?.['x-correlation-id'] || event.headers?.['X-Correlation-Id'];
  return /^[a-zA-Z0-9._:-]{8,160}$/.test(String(supplied || ''))
    ? String(supplied)
    : crypto.randomUUID();
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, error: 'Method not allowed.' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { success: false, error: 'Invalid JSON.' });
  }

  const correlationId = resolveCorrelationId(event);
  if (!payload.recipientEmail) {
    return json(400, { success: false, error: 'Missing email payload.' });
  }
  const transactionalWelcome = !payload.emailType || payload.emailType === 'welcome';
  const built = transactionalWelcome
    ? buildWelcomeEmail(payload)
    : payload.subject && payload.body && payload.html
      ? {
          success: true,
          subject: payload.subject,
          text: payload.body,
          html: payload.html,
          programType: payload.programType || 'compatibility',
          recipientRole: payload.recipientRole || 'admin',
          templateType: payload.templateType || payload.emailType,
        }
      : { success: false, error: 'missing_email_content' };
  if (!built.success) {
    return json(400, {
      success: false,
      error: built.error,
      correlationId,
    });
  }
  const deliveryPayload = {
    ...payload,
    programType: built.programType,
    recipientRole: built.recipientRole,
    templateType: built.templateType,
    correlationId,
    emailProvider: 'resend',
  };
  const recipientHash = recipientIdentifier(payload.recipientEmail);
  const supabase = getSupabase();

  console.info('[WELCOME_EMAIL_ATTEMPTED]', {
    recipient_identifier: recipientHash,
    program_type: built.programType,
    recipient_role: built.recipientRole,
    template_type: built.templateType,
    correlation_id: correlationId,
    related_student_id: payload.relatedStudentId || null,
    related_program_id: payload.relatedProgramId || null,
  });

  const existing = await findDeliveryByEventKey(supabase, payload.deliveryEventKey);
  const retryApproved = payload.allowRetry === true && existing?.status === 'failed' && existing?.retry_eligible;
  if (existing && !retryApproved) {
    console.info('[WELCOME_EMAIL_DUPLICATE_SUPPRESSED]', {
      recipient_identifier: recipientHash,
      correlation_id: correlationId,
      delivery_event_key_present: Boolean(payload.deliveryEventKey),
      existing_status: existing.status,
    });
    return json(200, {
      success: true,
      status: 'duplicate_suppressed',
      providerMessageId: existing.provider_message_id || null,
      correlationId,
    });
  }

  const queuedLog = retryApproved
    ? {
        ...(await updateDeliveryAttempt(supabase, existing.id, 'queued', { correlationId })),
        id: existing.id,
      }
    : await createDeliveryAttempt(supabase, deliveryPayload);
  if (queuedLog.duplicate) {
    return json(200, {
      success: true,
      status: 'duplicate_suppressed',
      providerMessageId: queuedLog.existing?.provider_message_id || null,
      correlationId,
    });
  }

  if (!process.env.RESEND_API_KEY) {
    console.info('[SEND_WELCOME_EMAIL]', {
      provider: 'Resend',
      recipient_identifier: recipientHash,
      correlation_id: correlationId,
      success: false,
      skipped: true,
      reason: 'RESEND_API_KEY missing',
    });
    const log = await updateDeliveryAttempt(supabase, queuedLog.id, 'failed', {
      errorMessage: 'RESEND_API_KEY is not configured.',
      correlationId,
    });
    return json(503, {
      success: false,
      status: 'failed',
      log,
      error: 'Email delivery is not configured.',
      correlationId,
    });
  }

  const result = await sendWelcomeEmail({
    ...deliveryPayload,
    subject: built.subject,
    html: built.html,
    text: built.text,
  });
  if (!result.success) {
    console.info('[SEND_WELCOME_EMAIL]', {
      provider: 'Resend',
      recipient_identifier: recipientHash,
      correlation_id: correlationId,
      success: false,
      skipped: false,
      reason: result.error,
    });
    const log = await updateDeliveryAttempt(supabase, queuedLog.id, 'failed', {
      errorMessage: result.error,
      correlationId,
    });
    return json(502, {
      success: false,
      status: 'failed',
      log,
      error: result.error,
      correlationId,
    });
  }

  const log = await updateDeliveryAttempt(supabase, queuedLog.id, 'sent', {
    providerMessageId: result.providerMessageId,
    correlationId,
    retryEligible: false,
  });
  console.info('[SEND_WELCOME_EMAIL]', {
    provider: 'Resend',
    recipient_identifier: recipientHash,
    correlation_id: correlationId,
    success: true,
    skipped: false,
    provider_message_id: result.providerMessageId ?? null,
  });
  return json(200, {
    success: true,
    status: 'sent',
    providerMessageId: result.providerMessageId,
    log,
    correlationId,
  });
};
