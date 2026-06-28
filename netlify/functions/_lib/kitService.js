const { createClient } = require('@supabase/supabase-js');

const DEFAULT_KIT_BASE_URL = 'https://api.kit.com';
const PROVIDER = 'kit';

/** @type {Map<string, number> | null} */
let tagIdByName = null;

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function getKitBaseUrl() {
  return (process.env.KIT_API_BASE_URL || DEFAULT_KIT_BASE_URL).replace(/\/+$/, '');
}

function isKitEnabled() {
  if (process.env.KIT_ENABLED === 'false') return false;
  const apiKey = process.env.KIT_API_KEY?.trim();
  if (!apiKey) return false;
  return process.env.KIT_ENABLED === 'true' || Boolean(apiKey);
}

function sanitizeKitErrorBody(body) {
  if (!body || typeof body !== 'object') return body || null;
  const blocked = new Set(['api_key', 'apiKey', 'token', 'access_token', 'authorization']);
  return Object.fromEntries(
    Object.entries(body)
      .filter(([key]) => !blocked.has(key))
      .map(([key, value]) => [
        key,
        typeof value === 'string' && value.length > 500 ? `${value.slice(0, 500)}...` : value,
      ]),
  );
}

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { enabled: false },
  });
}

async function writeIntegrationLog(entry) {
  const supabase = getSupabase();
  if (!supabase) {
    console.info('[KIT_INTEGRATION_LOG]', entry);
    return { logged: false, reason: 'supabase_env_missing' };
  }

  const { data, error } = await supabase
    .from('integration_logs')
    .insert({
      provider: PROVIDER,
      event_name: entry.eventName,
      email: entry.email || null,
      tag_name: entry.tagName || null,
      status: entry.status,
      error_message: entry.errorMessage || null,
      metadata: entry.metadata || {},
    })
    .select('id')
    .maybeSingle();

  if (error) {
    console.warn('[KIT_INTEGRATION_LOG_FAILED]', error.message, entry);
    return { logged: false, reason: error.message };
  }

  return { logged: true, id: data?.id || null };
}

async function hasSuccessfulTagLog(email, tagName, participantId) {
  const supabase = getSupabase();
  if (!supabase) return false;

  let query = supabase
    .from('integration_logs')
    .select('id')
    .eq('provider', PROVIDER)
    .eq('email', email)
    .eq('tag_name', tagName)
    .eq('status', 'success')
    .limit(1);

  if (participantId) {
    query = query.contains('metadata', { participant_id: participantId });
  }

  const { data } = await query;
  return Boolean(data?.length);
}

async function kitRequest(path, options = {}) {
  const apiKey = process.env.KIT_API_KEY?.trim();
  const response = await fetch(`${getKitBaseUrl()}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Kit-Api-Key': apiKey,
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }

  if (!response.ok) {
    const message =
      body?.errors?.join?.(', ') ||
      body?.error ||
      body?.message ||
      `Kit API ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.body = body;
    console.warn('[KIT_API_ERROR]', {
      path,
      status: response.status,
      body: sanitizeKitErrorBody(body),
    });
    throw error;
  }

  return body;
}

async function loadTagMap() {
  if (tagIdByName) return tagIdByName;
  tagIdByName = new Map();
  let after = null;

  for (let page = 0; page < 20; page += 1) {
    const query = after ? `?after=${encodeURIComponent(after)}` : '';
    const payload = await kitRequest(`/v4/tags${query}`);
    const tags = payload?.tags || [];
    for (const tag of tags) {
      if (tag?.name && tag?.id != null) {
        tagIdByName.set(String(tag.name).trim(), Number(tag.id));
      }
    }
    const pagination = payload?.pagination;
    if (!pagination?.has_next_page || !pagination?.end_cursor) break;
    after = pagination.end_cursor;
  }

  return tagIdByName;
}

async function resolveTagId(tagName) {
  const map = await loadTagMap();
  return map.get(String(tagName).trim()) ?? null;
}

async function upsertKitSubscriber({ email, firstName, lastName, metadata = {} }) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return { ok: false, skipped: true, reason: 'missing_email' };
  }

  if (!isKitEnabled()) {
    console.info('[KIT_SYNC]', {
      step: 'kit_api_disabled',
      email: normalizedEmail,
      kit_enabled: false,
      reason: 'KIT_ENABLED false or KIT_API_KEY missing',
    });
    await writeIntegrationLog({
      eventName: 'kit_subscriber_upsert',
      email: normalizedEmail,
      status: 'skipped',
      errorMessage: 'Kit integration disabled or KIT_API_KEY missing.',
      metadata,
    });
    return { ok: true, skipped: true, reason: 'kit_disabled' };
  }

  try {
    console.info('[KIT_SYNC]', {
      step: 'subscriber_upsert_attempted',
      email: normalizedEmail,
      kit_enabled: true,
    });
    const payload = {
      email_address: normalizedEmail,
      first_name: firstName?.trim() || null,
      state: 'active',
    };
    if (lastName?.trim()) {
      payload.fields = { last_name: lastName.trim() };
    }

    const result = await kitRequest('/v4/subscribers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    console.info('[KIT_SYNC]', {
      step: 'subscriber_created_or_found',
      email: normalizedEmail,
      subscriber_id: result?.subscriber?.id ?? null,
    });

    return {
      ok: true,
      skipped: false,
      subscriberId: result?.subscriber?.id ?? null,
    };
  } catch (error) {
    await writeIntegrationLog({
      eventName: 'kit_subscriber_upsert',
      email: normalizedEmail,
      status: 'failed',
      errorMessage: error.message,
      metadata,
    });
    return {
      ok: false,
      skipped: false,
      error: error.message,
      status: error.status ?? null,
      body: sanitizeKitErrorBody(error.body),
    };
  }
}

async function applyKitTag({ email, tagName, eventName, metadata = {} }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedTag = String(tagName || '').trim();

  if (!normalizedEmail) {
    console.info('[KIT_SYNC]', {
      step: 'parent_email_attempted',
      email: null,
      skipped: true,
      reason: 'no_parent_email',
    });
    await writeIntegrationLog({
      eventName: eventName || 'kit_tag_apply',
      email: null,
      tagName: normalizedTag || null,
      status: 'skipped',
      errorMessage: 'no_parent_email',
      metadata,
    });
    return { ok: true, skipped: true, reason: 'no_parent_email' };
  }

  if (!normalizedTag) {
    return { ok: false, skipped: true, reason: 'missing_tag_name' };
  }

  if (!isKitEnabled()) {
    console.info('[KIT_SYNC]', {
      step: 'kit_api_disabled',
      email: normalizedEmail,
      tag: normalizedTag,
      kit_enabled: false,
      reason: 'KIT_ENABLED false or KIT_API_KEY missing',
    });
    await writeIntegrationLog({
      eventName: eventName || 'kit_tag_apply',
      email: normalizedEmail,
      tagName: normalizedTag,
      status: 'skipped',
      errorMessage: 'Kit integration disabled or KIT_API_KEY missing.',
      metadata,
    });
    return { ok: true, skipped: true, reason: 'kit_disabled' };
  }

  const participantId = metadata?.participant_id || metadata?.participantId || null;
  if (await hasSuccessfulTagLog(normalizedEmail, normalizedTag, participantId)) {
    console.info('[KIT_SYNC]', {
      step: 'tag_apply_skipped',
      email: normalizedEmail,
      tag: normalizedTag,
      reason: 'duplicate_tag_event',
    });
    await writeIntegrationLog({
      eventName: eventName || 'kit_tag_apply',
      email: normalizedEmail,
      tagName: normalizedTag,
      status: 'skipped',
      errorMessage: 'duplicate_tag_event',
      metadata,
    });
    return { ok: true, skipped: true, reason: 'duplicate_tag_event' };
  }

  try {
    await upsertKitSubscriber({
      email: normalizedEmail,
      firstName: metadata?.first_name || metadata?.firstName,
      lastName: metadata?.last_name || metadata?.lastName,
      metadata,
    });

    const tagId = await resolveTagId(normalizedTag);
    if (!tagId) {
      console.warn('[KIT_SYNC]', {
        step: 'tag_lookup_failed',
        email: normalizedEmail,
        tag: normalizedTag,
      });
      await writeIntegrationLog({
        eventName: eventName || 'kit_tag_apply',
        email: normalizedEmail,
        tagName: normalizedTag,
        status: 'failed',
        errorMessage: `Kit tag not found: ${normalizedTag}`,
        metadata,
      });
      return { ok: false, skipped: false, error: `Kit tag not found: ${normalizedTag}` };
    }

    await kitRequest(`/v4/tags/${tagId}/subscribers`, {
      method: 'POST',
      body: JSON.stringify({ email_address: normalizedEmail }),
    });

    await writeIntegrationLog({
      eventName: eventName || 'kit_tag_apply',
      email: normalizedEmail,
      tagName: normalizedTag,
      status: 'success',
      metadata,
    });

    console.info('[KIT_SYNC]', {
      step: 'tag_applied',
      email: normalizedEmail,
      tag: normalizedTag,
      tag_id: tagId,
    });

    return { ok: true, skipped: false, tagName: normalizedTag };
  } catch (error) {
    await writeIntegrationLog({
      eventName: eventName || 'kit_tag_apply',
      email: normalizedEmail,
      tagName: normalizedTag,
      status: 'failed',
      errorMessage: error.message,
      metadata,
    });
    console.warn('[KIT_SYNC]', {
      step: 'tag_apply_failed',
      email: normalizedEmail,
      tag: normalizedTag,
      error: error.message,
      status: error.status ?? null,
      body: sanitizeKitErrorBody(error.body),
    });
    return {
      ok: false,
      skipped: false,
      error: error.message,
      status: error.status ?? null,
      body: sanitizeKitErrorBody(error.body),
    };
  }
}

async function syncKitSubscriberTags({ email, tags, metadata = {}, eventName = 'kit_sync_tags' }) {
  const normalizedEmail = normalizeEmail(email);
  const tagList = Array.isArray(tags) ? tags.filter(Boolean) : [];

  console.info('[KIT_SYNC]', {
    step: 'parent_email_attempted',
    email: normalizedEmail || null,
    event_name: eventName,
    tags: tagList,
    kit_enabled: isKitEnabled(),
    welcome_sequence_configured: false,
  });

  if (!normalizedEmail) {
    await writeIntegrationLog({
      eventName,
      email: null,
      tagName: tagList[0] || null,
      status: 'skipped',
      errorMessage: 'no_parent_email',
      metadata,
    });
    return { ok: true, skipped: true, reason: 'no_parent_email', results: [] };
  }

  if (!tagList.length) {
    return { ok: true, skipped: true, reason: 'no_tags', results: [] };
  }

  const upsert = await upsertKitSubscriber({
    email: normalizedEmail,
    firstName: metadata?.first_name || metadata?.firstName,
    lastName: metadata?.last_name || metadata?.lastName,
    metadata,
  });

  if (!upsert.ok && !upsert.skipped) {
    return { ok: false, skipped: false, results: [], error: upsert.error };
  }

  const results = [];
  for (const tagName of tagList) {
    const result = await applyKitTag({
      email: normalizedEmail,
      tagName,
      eventName,
      metadata,
    });
    results.push({ tagName, ...result });
  }

  const failed = results.find((row) => row.ok === false && !row.skipped);
  return {
    ok: !failed,
    skipped: results.every((row) => row.skipped),
    results,
    error: failed?.error,
  };
}

module.exports = {
  isKitEnabled,
  upsertKitSubscriber,
  applyKitTag,
  syncKitSubscriberTags,
  writeIntegrationLog,
};
