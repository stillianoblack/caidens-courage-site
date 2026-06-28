const { createClient } = require('@supabase/supabase-js');
const { sendWelcomeEmail } = require('./_lib/emailProvider');

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
  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, error: 'Method not allowed.' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { success: false, error: 'Invalid JSON.' });
  }

  if (!payload.recipientEmail || !payload.subject || !payload.body) {
    return json(400, { success: false, error: 'Missing email payload.' });
  }

  console.info('[PARENT_EMAIL_ATTEMPTED]', {
    recipient_email: payload.recipientEmail,
    email_type: payload.emailType || 'welcome',
    related_student_id: payload.relatedStudentId || null,
    related_program_id: payload.relatedProgramId || null,
  });

  const queuedLog = await logEmailAttempt(payload, 'queued');
  if (!process.env.RESEND_API_KEY) {
    console.info('[SEND_WELCOME_EMAIL]', {
      provider: 'Resend',
      recipient_email: payload.recipientEmail,
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
    });
  }

  const result = await sendWelcomeEmail(payload);
  if (!result.success) {
    console.info('[SEND_WELCOME_EMAIL]', {
      provider: 'Resend',
      recipient_email: payload.recipientEmail,
      success: false,
      skipped: false,
      reason: result.error,
    });
    const log = await updateEmailAttempt(queuedLog.id, 'failed', {
      errorMessage: result.error,
    });
    return json(502, {
      success: false,
      status: 'failed',
      log,
      error: result.error,
    });
  }

  const log = await updateEmailAttempt(queuedLog.id, 'sent', {
    providerMessageId: result.providerMessageId,
  });
  console.info('[SEND_WELCOME_EMAIL]', {
    provider: 'Resend',
    recipient_email: payload.recipientEmail,
    success: true,
    skipped: false,
    provider_message_id: result.providerMessageId ?? null,
  });
  return json(200, {
    success: true,
    status: 'sent',
    providerMessageId: result.providerMessageId,
    log,
  });
};
