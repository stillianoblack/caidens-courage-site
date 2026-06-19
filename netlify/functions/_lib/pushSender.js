/**
 * Server-side web push sender (Netlify functions).
 * Requires WEB_PUSH_PUBLIC_KEY, WEB_PUSH_PRIVATE_KEY, WEB_PUSH_SUBJECT env vars.
 */

const webpush = require('web-push');

function configureWebPush() {
  const publicKey = process.env.WEB_PUSH_PUBLIC_KEY?.trim();
  const privateKey = process.env.WEB_PUSH_PRIVATE_KEY?.trim();
  const subject = process.env.WEB_PUSH_SUBJECT?.trim() || 'mailto:support@caidenscourage.com';

  if (!publicKey || !privateKey) {
    return { ok: false, error: 'Web push VAPID keys are not configured.' };
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return { ok: true };
}

function resolveSupabaseUrl() {
  return (
    process.env.SUPABASE_URL ||
    process.env.REACT_APP_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ''
  ).trim();
}

function resolveSupabaseServiceKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    ''
  ).trim();
}

function getServiceSupabase() {
  const url = resolveSupabaseUrl();
  const serviceKey = resolveSupabaseServiceKey();
  if (!url || !serviceKey) {
    console.info('[PUSH_SAVE_ERROR]', {
      reason: 'supabase_env_missing',
      hasUrl: Boolean(url),
      hasServiceKey: Boolean(serviceKey),
    });
    return null;
  }
  const { createClient } = require('@supabase/supabase-js');
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * @param {string} userId - Family/parent account id (pilot_programs.id).
 * @param {{ title: string, body: string, url?: string, tag?: string }} payload
 * @param {{ childId?: string | null }} [options]
 */
async function sendPushNotification(userId, payload, options = {}) {
  const vapid = configureWebPush();
  if (!vapid.ok) {
    console.warn('[send-push]', vapid.error);
    return { sent: 0, skipped: 0, removed: 0, failed: 0, error: vapid.error };
  }

  const familyUserId = String(userId || '').trim();
  if (!familyUserId) {
    return { sent: 0, skipped: 0, removed: 0, failed: 0, error: 'Missing userId.' };
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    console.warn('[send-push] Supabase service role not configured.');
    return { sent: 0, skipped: 0, removed: 0, failed: 0, error: 'Database unavailable.' };
  }

  let query = supabase
    .from('push_subscriptions')
    .select('id, endpoint, subscription, enabled, child_id')
    .eq('user_id', familyUserId);

  const childId = options.childId ? String(options.childId).trim() : null;
  if (childId) {
    query = query.or(`child_id.is.null,child_id.eq.${childId}`);
  }

  const { data: rows, error } = await query;

  if (error) {
    console.error('[send-push] load subscriptions failed', error.message);
    return { sent: 0, skipped: 0, removed: 0, failed: 0, error: error.message };
  }

  const pushPayload = JSON.stringify({
    title: payload.title || "Caiden's Courage",
    body: payload.body || '',
    url: payload.url || '/family-hub/weekly-adventures',
    tag: payload.tag || 'caidens-courage-parent',
  });

  let sent = 0;
  let skipped = 0;
  let removed = 0;
  let failed = 0;

  for (const row of rows || []) {
    if (!row.enabled) {
      skipped += 1;
      continue;
    }

    const subscription = row.subscription;
    if (!subscription?.endpoint) {
      skipped += 1;
      continue;
    }

    try {
      await webpush.sendNotification(subscription, pushPayload);
      sent += 1;
    } catch (err) {
      const statusCode = err?.statusCode;
      console.warn('[send-push] delivery failed', {
        userId: familyUserId,
        endpoint: row.endpoint,
        statusCode,
        message: err?.message,
      });

      if (statusCode === 404 || statusCode === 410) {
        await supabase.from('push_subscriptions').delete().eq('id', row.id);
        removed += 1;
      } else {
        failed += 1;
      }
    }
  }

  return { sent, skipped, removed, failed };
}

module.exports = {
  configureWebPush,
  getServiceSupabase,
  sendPushNotification,
};
