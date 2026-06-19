const { sendPushNotification } = require('./_lib/pushSender');

function jsonResponse(body, status = 200) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

const TRIGGER_COPY = {
  child_completed_weekly_mission: (input) => ({
    title: 'Mission complete!',
    body: input.childName
      ? `${input.childName} finished ${input.detail || 'a mission'}.`
      : `Your child finished ${input.detail || 'a mission'}.`,
    tag: 'cc-mission-complete',
  }),
  reward_ready_to_claim: (input) => ({
    title: 'Reward ready',
    body: input.childName
      ? `${input.childName} earned a new reward to claim.`
      : 'Your child earned a new reward to claim.',
    tag: 'cc-reward-ready',
  }),
  child_session_paused: (input) => ({
    title: 'Child session paused',
    body: input.childName
      ? `${input.childName}'s game session paused after inactivity.`
      : 'Your child\'s game session paused after inactivity.',
    tag: 'cc-session-paused',
  }),
  child_session_ended: (input) => ({
    title: 'Child session ended',
    body: input.childName
      ? `${input.childName}'s shared device session ended safely.`
      : 'Your child\'s shared device session ended safely.',
    tag: 'cc-session-ended',
  }),
  child_inactive_3_days: (input) => ({
    title: 'Check in on progress',
    body: input.childName
      ? `${input.childName} has not played in a few days.`
      : 'Your child has not played in a few days.',
    tag: 'cc-child-inactive',
  }),
};

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
  const trigger = body.trigger;
  const dedupeKey = body.dedupeKey ? String(body.dedupeKey).trim() : null;
  const builder = TRIGGER_COPY[trigger];

  if (!userId || !builder) {
    return jsonResponse({ error: 'userId and valid trigger are required.' }, 400);
  }

  const payload = {
    ...builder(body),
    url: body.url || '/family-hub/weekly-adventures',
  };

  console.info('[PUSH_NOTIFY_EVENT]', {
    trigger,
    userId,
    childId,
    dedupeKey,
    title: payload.title,
  });

  try {
    const result = await sendPushNotification(userId, payload, { childId });
    return jsonResponse({ ok: true, ...result });
  } catch (err) {
    console.error('[notify-parent-push] unexpected error', err);
    return jsonResponse({ ok: false, error: 'Notification failed.' }, 500);
  }
};
