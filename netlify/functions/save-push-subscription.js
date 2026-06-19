const { getServiceSupabase } = require('./_lib/pushSender');

function jsonResponse(body, status = 200) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const userId = String(body.userId || '').trim();
  const childId = body.childId ? String(body.childId).trim() : null;
  const subscription = body.subscription;
  const enabled = body.enabled !== false;
  const endpoint = subscription?.endpoint ? String(subscription.endpoint) : '';

  if (!userId || !endpoint) {
    console.info('[PUSH_SAVE_RESULT]', { ok: false, reason: 'missing_user_id_or_endpoint' });
    return jsonResponse({ error: 'userId and subscription.endpoint are required.' }, 400);
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    console.info('[PUSH_SAVE_RESULT]', { ok: false, reason: 'supabase_unconfigured' });
    return jsonResponse({ error: 'Server storage is not configured.' }, 503);
  }

  const now = new Date().toISOString();
  const row = {
    user_id: userId,
    child_id: childId || null,
    endpoint,
    subscription,
    enabled,
    user_agent: event.headers['user-agent'] || null,
    updated_at: now,
  };

  const { error } = await supabase.from('push_subscriptions').upsert(row, {
    onConflict: 'endpoint',
  });

  if (error) {
    console.info('[PUSH_SAVE_RESULT]', {
      ok: false,
      userId,
      endpoint,
      error: error.message,
    });
    return jsonResponse({ error: 'Could not save subscription.' }, 500);
  }

  console.info('[PUSH_SAVE_RESULT]', {
    ok: true,
    userId,
    childId,
    endpoint,
    enabled,
  });

  return jsonResponse({ ok: true, enabled });
};
