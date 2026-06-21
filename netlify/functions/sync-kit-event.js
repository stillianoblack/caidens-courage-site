const {
  isKitEnabled,
  syncKitSubscriberTags,
  upsertKitSubscriber,
  writeIntegrationLog,
} = require('./_lib/kitService');

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
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

  const eventName = String(payload.eventName || '').trim();
  if (!eventName) {
    return json(400, { success: false, error: 'Missing eventName.' });
  }

  const metadata = {
    ...(payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : {}),
    participant_id: payload.participantId?.trim() || payload.metadata?.participant_id || null,
    source: payload.metadata?.source || 'sync-kit-event',
  };

  const tags = Array.isArray(payload.tags)
    ? payload.tags.map((tag) => String(tag).trim()).filter(Boolean)
    : [];

  const parentEmail = normalizeEmail(payload.parentEmail);
  const facilitatorEmail = normalizeEmail(payload.facilitatorEmail);
  const targetEmail = parentEmail || facilitatorEmail;

  if (!isKitEnabled()) {
    return json(200, {
      success: true,
      status: 'skipped',
      reason: 'kit_disabled',
      kitEnabled: false,
    });
  }

  try {
    if (targetEmail && tags.length) {
      const result = await syncKitSubscriberTags({
        email: targetEmail,
        tags,
        eventName,
        metadata,
      });
      return json(200, {
        success: result.ok !== false,
        status: result.skipped ? 'skipped' : result.ok ? 'success' : 'failed',
        kitEnabled: true,
        result,
      });
    }

    if (targetEmail) {
      const result = await upsertKitSubscriber({
        email: targetEmail,
        firstName: metadata.first_name || metadata.firstName,
        lastName: metadata.last_name || metadata.lastName,
        metadata,
      });
      return json(200, {
        success: result.ok !== false,
        status: result.skipped ? 'skipped' : result.ok ? 'success' : 'failed',
        kitEnabled: true,
        result,
      });
    }

    await writeIntegrationLog({
      eventName,
      email: null,
      tagName: tags[0] || null,
      status: 'skipped',
      errorMessage:
        metadata.skip_reason === 'no_parent_email' ? 'no_parent_email' : 'no_target_email',
      metadata,
    });

    return json(200, {
      success: true,
      status: 'skipped',
      reason: metadata.skip_reason === 'no_parent_email' ? 'no_parent_email' : 'no_target_email',
      kitEnabled: true,
    });
  } catch (error) {
    console.warn('[SYNC_KIT_EVENT]', eventName, error);
    return json(200, {
      success: false,
      status: 'failed',
      kitEnabled: true,
      error: error instanceof Error ? error.message : 'Kit sync failed.',
    });
  }
};
