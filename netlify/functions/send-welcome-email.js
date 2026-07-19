const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
const { sendWelcomeEmail } = require('./_lib/emailProvider');

function correlationId(event = {}) {
  const supplied = event.headers?.['x-correlation-id'] || event.headers?.['X-Correlation-Id'];
  return /^[a-zA-Z0-9._-]{8,120}$/.test(String(supplied || ''))
    ? String(supplied)
    : crypto.randomUUID();
}

function json(statusCode, body, id) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Correlation-Id': id,
    },
    body: JSON.stringify({ ...body, correlationId: id }),
  };
}

function maskEmail(value) {
  const [local = '', domain = ''] = String(value || '').trim().toLowerCase().split('@');
  if (!local || !domain) return 'masked';
  return `${local.slice(0, 1)}***@${domain}`;
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function providerErrorCategory(result = {}) {
  const message = String(result.error || '').toLowerCase();
  if (message.includes('domain') && message.includes('verif')) return 'sender_domain_not_verified';
  if (message.includes('api key') || message.includes('unauthorized')) return 'api_key_authorization';
  if (message.includes('reply')) return 'reply_to_invalid';
  if (message.includes('sender') || message.includes('from')) return 'sender_invalid';
  if (message.includes('recipient')) return 'recipient_invalid';
  if (result.providerErrorCode === 'network_error') return 'provider_network_error';
  if (result.providerErrorCode === 'validation_error') return 'request_validation';
  return 'provider_rejection_other';
}

function previewBaseUrl() {
  const value = process.env.DEPLOY_PRIME_URL || process.env.URL || '';
  try {
    return new URL(value).origin;
  } catch {
    return 'http://localhost:8888';
  }
}

function canaryPayload(recipientEmail) {
  const day = new Date().toISOString().slice(0, 10);
  const recipientHash = crypto.createHash('sha256').update(recipientEmail).digest('hex').slice(0, 16);
  return {
    recipientEmail,
    emailType: 'welcome_canary',
    subject: "Caiden's Courage transactional email test",
    body: [
      "Welcome to Caiden's Courage.",
      '',
      'This is a controlled staging test of transactional email delivery.',
      'No child information, access code, PIN, or marketing enrollment is included.',
    ].join('\n'),
    childName: 'Staging Test Member',
    programName: "Caiden's Courage Staging",
    portalLink: `${previewBaseUrl()}/portal`,
    idempotencyKey: `welcome-canary/${day}/${recipientHash}`,
  };
}

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: WebSocket },
  });
}

async function logEmailAttempt(payload, status, detail = {}) {
  const supabase = getSupabase();
  if (!supabase) {
    return { logged: false, reason: 'supabase_env_missing' };
  }

  const record = {
    recipient_email: payload.recipientEmail,
    email_type: payload.emailType || 'welcome',
    related_student_id: payload.relatedStudentId || null,
    related_family_id: payload.relatedFamilyId || null,
    related_program_id: payload.relatedProgramId || null,
    status,
    provider_message_id: detail.providerMessageId || null,
    error_message: detail.errorMessage || null,
    sent_at: status === 'sent' ? new Date().toISOString() : null,
    delivered_at: status === 'delivered' ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from('email_delivery_logs')
    .insert(record)
    .select('id')
    .maybeSingle();

  if (error) return { logged: false, reason: error.message };
  return { logged: true, id: data?.id || null };
}

async function updateEmailAttempt(logId, status, detail = {}) {
  const supabase = getSupabase();
  if (!supabase || !logId) {
    return { logged: false, reason: supabase ? 'missing_log_id' : 'supabase_env_missing' };
  }

  const now = new Date().toISOString();
  const patch = {
    status,
    provider_message_id: detail.providerMessageId || null,
    error_message: detail.errorMessage || null,
    sent_at: status === 'sent' ? now : null,
    delivered_at: status === 'delivered' ? now : null,
  };

  const { error } = await supabase.from('email_delivery_logs').update(patch).eq('id', logId);
  if (error) return { logged: false, reason: error.message };
  return { logged: true, id: logId };
}

exports.handler = async (event) => {
  const id = correlationId(event);
  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, error: 'Method not allowed.' }, id);
  }

  // This legacy browser endpoint is closed in production. The only supported use is a
  // preview-only, server-configured adult canary. Real transactional sends must originate
  // from an authorized server workflow that resolves its own recipient and template.
  if (process.env.CONTEXT === 'production') {
    return json(404, { success: false, error: 'Not found.' }, id);
  }
  if (process.env.TRANSACTIONAL_EMAIL_CANARY_ENABLED !== 'true') {
    return json(404, { success: false, error: 'Email canary is disabled.' }, id);
  }

  let request;
  try {
    request = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { success: false, error: 'Invalid JSON.' }, id);
  }
  if (request.action !== 'send_welcome_canary') {
    return json(400, { success: false, error: 'Invalid canary request.' }, id);
  }

  const recipientEmail = String(process.env.CRM_ADULT_TEST_EMAIL || '').trim().toLowerCase();
  if (!validEmail(recipientEmail)) {
    return json(503, { success: false, error: 'Canary recipient is not configured.' }, id);
  }
  const payload = canaryPayload(recipientEmail);

  console.info('[PARENT_EMAIL_ATTEMPTED]', {
    correlationId: id,
    recipient_email: maskEmail(payload.recipientEmail),
    email_type: payload.emailType,
  });

  const queuedLog = await logEmailAttempt(payload, 'queued');
  if (!process.env.RESEND_API_KEY) {
    console.info('[SEND_WELCOME_EMAIL]', {
      correlationId: id,
      provider: 'Resend',
      recipient_email: maskEmail(payload.recipientEmail),
      success: false,
      skipped: true,
      reason: 'RESEND_API_KEY missing',
    });
    const log = await updateEmailAttempt(queuedLog.id, 'failed', {
      errorMessage: 'RESEND_API_KEY is not configured.',
    });
    return json(503, {
      success: false,
      status: 'failed',
      log,
      error: 'Email delivery is not configured.',
    }, id);
  }

  const result = await sendWelcomeEmail(payload);
  if (!result.success) {
    const errorCategory = providerErrorCategory(result);
    console.info('[SEND_WELCOME_EMAIL]', {
      correlationId: id,
      provider: 'Resend',
      recipient_email: maskEmail(payload.recipientEmail),
      success: false,
      skipped: false,
      reason: 'provider_rejected',
      provider_status: result.providerStatus || null,
      provider_error_code: result.providerErrorCode || null,
      provider_error_category: errorCategory,
    });
    const log = await updateEmailAttempt(queuedLog.id, 'failed', {
      errorMessage: result.error,
    });
    return json(502, {
      success: false,
      status: 'failed',
      log,
      error: 'Email provider rejected the canary.',
      providerStatus: result.providerStatus || null,
      providerErrorCategory: errorCategory,
    }, id);
  }

  const log = await updateEmailAttempt(queuedLog.id, 'sent', {
    providerMessageId: result.providerMessageId,
  });
  console.info('[SEND_WELCOME_EMAIL]', {
    correlationId: id,
    provider: 'Resend',
    recipient_email: maskEmail(payload.recipientEmail),
    success: true,
    skipped: false,
    provider_message_id: result.providerMessageId ?? null,
  });
  return json(200, {
    success: true,
    status: 'sent',
    log,
  }, id);
};
