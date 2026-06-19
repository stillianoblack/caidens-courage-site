const { sendPushNotification } = require('./_lib/pushSender');

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
  const payload = body.payload || {
    title: body.title,
    body: body.body,
    url: body.url,
    tag: body.tag,
  };

  if (!userId || !payload?.title) {
    return jsonResponse({ error: 'userId and payload.title are required.' }, 400);
  }

  try {
    const result = await sendPushNotification(userId, payload, { childId });
    return jsonResponse({ ok: true, ...result });
  } catch (err) {
    console.error('[send-push] unexpected error', err);
    return jsonResponse({ ok: false, error: 'Push send failed.' }, 500);
  }
};
