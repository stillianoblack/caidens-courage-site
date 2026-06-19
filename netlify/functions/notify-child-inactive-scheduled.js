/**
 * Scheduled placeholder — child inactive 3+ days parent reminder.
 *
 * NOT enabled by default. Set ENABLE_CHILD_INACTIVE_PUSH=true after QA verification.
 * Wire to Netlify scheduled functions when ready; do not auto-send until then.
 *
 * Expected POST body:
 * { userId, childId?, childName?, inactiveDays?: number }
 */

const { sendPushNotification } = require('./_lib/pushSender');

function jsonResponse(body, status = 200) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  const enabled = process.env.ENABLE_CHILD_INACTIVE_PUSH === 'true';

  if (!enabled) {
    console.info('[PUSH_NOTIFY_SKIPPED]', {
      trigger: 'child_inactive_3_days',
      reason: 'disabled_pending_verification',
    });
    return jsonResponse({
      ok: false,
      skipped: true,
      reason: 'disabled_pending_verification',
      message: 'Child inactive push is not enabled yet.',
    });
  }

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
  const childName = body.childName ? String(body.childName).trim() : null;
  const inactiveDays = Number(body.inactiveDays) || 3;

  if (!userId || inactiveDays < 3) {
    console.info('[PUSH_NOTIFY_SKIPPED]', {
      trigger: 'child_inactive_3_days',
      reason: 'invalid_payload',
      userId,
      inactiveDays,
    });
    return jsonResponse({ error: 'userId and inactiveDays >= 3 are required.' }, 400);
  }

  const payload = {
    title: 'Check in on progress',
    body: childName
      ? `${childName} has not played in ${inactiveDays} days.`
      : `Your child has not played in ${inactiveDays} days.`,
    tag: 'cc-child-inactive',
    url: body.url || '/family-hub/weekly-adventures',
  };

  console.info('[PUSH_NOTIFY_EVENT]', {
    trigger: 'child_inactive_3_days',
    userId,
    childId,
    inactiveDays,
  });

  try {
    const result = await sendPushNotification(userId, payload, { childId });
    return jsonResponse({ ok: true, ...result });
  } catch (err) {
    console.error('[notify-child-inactive-scheduled] unexpected error', err);
    return jsonResponse({ ok: false, error: 'Notification failed.' }, 500);
  }
};
