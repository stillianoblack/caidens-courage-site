const { createClient } = require('@supabase/supabase-js');

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

  const { error } = await supabase.from('email_delivery_logs').insert({
    recipient_email: payload.recipientEmail,
    email_type: payload.emailType || 'welcome',
    related_student_id: payload.relatedStudentId || null,
    related_family_id: payload.relatedFamilyId || null,
    related_program_id: payload.relatedProgramId || null,
    status,
    provider_message_id: detail.providerMessageId || null,
    error_message: detail.errorMessage || null,
    sent_at: status === 'sent' ? new Date().toISOString() : null,
  });

  if (error) return { logged: false, reason: error.message };
  return { logged: true };
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

  if (!process.env.RESEND_API_KEY && !process.env.EMAIL_PROVIDER_API_KEY) {
    const log = await logEmailAttempt(payload, 'skipped', {
      errorMessage: 'Email provider not configured.',
    });
    return json(200, {
      success: true,
      status: 'skipped',
      log,
      message: 'Welcome email logged as skipped because no provider is configured.',
    });
  }

  const log = await logEmailAttempt(payload, 'skipped', {
    errorMessage: 'Provider adapter not implemented.',
  });
  return json(200, {
    success: true,
    status: 'skipped',
    log,
    message: 'Welcome email logged as skipped until provider adapter is implemented.',
  });
};
