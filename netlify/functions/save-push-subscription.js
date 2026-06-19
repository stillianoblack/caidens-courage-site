const { getServiceSupabase } = require('./_lib/pushSender');

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function jsonResponse(body, status = 200) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function isUuid(value) {
  return UUID_RE.test(String(value || '').trim());
}

async function resolveUserId(supabase, body) {
  const direct = String(body.userId || '').trim();
  if (isUuid(direct)) return direct;

  const programCode = String(body.programCode || '').trim();
  if (!programCode) return null;

  const { data, error } = await supabase
    .from('pilot_programs')
    .select('id')
    .eq('program_code', programCode)
    .maybeSingle();

  if (error) {
    console.info('[PUSH_SAVE_ERROR]', {
      reason: 'program_lookup_failed',
      programCode,
      message: error.message,
    });
    return null;
  }

  const resolved = data?.id ? String(data.id).trim() : '';
  return isUuid(resolved) ? resolved : null;
}

function sanitizeChildId(value) {
  const childId = String(value || '').trim();
  return isUuid(childId) ? childId : null;
}

async function persistPushSubscription(supabase, row) {
  const { data: existing, error: readError } = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('endpoint', row.endpoint)
    .maybeSingle();

  if (readError) {
    return { ok: false, error: readError };
  }

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from('push_subscriptions')
      .update(row)
      .eq('endpoint', row.endpoint);
    return { ok: !updateError, error: updateError || null, action: 'update' };
  }

  const { error: insertError } = await supabase.from('push_subscriptions').insert({
    ...row,
    created_at: row.updated_at,
  });
  return { ok: !insertError, error: insertError || null, action: 'insert' };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    console.info('[PUSH_SAVE_ERROR]', { reason: 'invalid_json' });
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const subscription = body.subscription;
  const endpoint = subscription?.endpoint ? String(subscription.endpoint) : '';
  const enabled = body.enabled !== false;
  const programCode = String(body.programCode || '').trim() || null;

  console.info('[PUSH_SAVE_REQUEST]', {
    hasUserId: Boolean(body.userId),
    programCode,
    hasEndpoint: Boolean(endpoint),
    enabled,
    hasChildId: Boolean(body.childId),
  });

  if (!endpoint || !subscription) {
    console.info('[PUSH_SAVE_ERROR]', { reason: 'missing_endpoint_or_subscription' });
    return jsonResponse({ error: 'subscription.endpoint is required.' }, 400);
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    console.info('[PUSH_SAVE_RESULT]', { ok: false, reason: 'supabase_unconfigured' });
    return jsonResponse({ error: 'Server storage is not configured.' }, 503);
  }

  const userId = await resolveUserId(supabase, body);
  if (!userId) {
    console.info('[PUSH_SAVE_ERROR]', {
      reason: 'missing_or_invalid_user_id',
      userId: body.userId || null,
      programCode,
    });
    return jsonResponse({ error: 'Valid family user_id is required.' }, 400);
  }

  const now = new Date().toISOString();
  const row = {
    user_id: userId,
    child_id: sanitizeChildId(body.childId),
    endpoint,
    subscription,
    enabled,
    updated_at: now,
  };

  const result = await persistPushSubscription(supabase, row);

  if (!result.ok) {
    console.info('[PUSH_SAVE_ERROR]', {
      reason: 'database_write_failed',
      action: result.action || null,
      userId,
      endpoint,
      code: result.error?.code || null,
      message: result.error?.message || 'unknown',
    });
    console.info('[PUSH_SAVE_RESULT]', {
      ok: false,
      userId,
      endpoint,
      error: result.error?.message || 'unknown',
    });
    return jsonResponse(
      {
        error: 'Could not save subscription.',
        detail: result.error?.message || null,
      },
      500,
    );
  }

  console.info('[PUSH_SAVE_RESULT]', {
    ok: true,
    action: result.action,
    userId,
    childId: row.child_id,
    endpoint,
    enabled,
  });

  return jsonResponse({ ok: true, enabled, userId });
};
