const crypto = require('crypto');
const { json, maskEmail, requireCrmRequest, writeAdminAuditEvent } = require('./crmAuth');
const { KitV4Provider, CAPABILITIES } = require('./kitV4Provider');
const { buildReconciliationPreview } = require('./kitReconciliation');
const { canonicalIdempotency, processOneOutbox } = require('./providerOutbox');
const { applyConsentEvent } = require('./crmWorkflowRules');

function body(event) { try { return JSON.parse(event.body || '{}'); } catch { return null; } }
function restrictiveWebhookState(eventType) { return { unsubscribe: ['provider_unsubscribe','unsubscribed'], complaint: ['provider_complaint','suppressed'], bounce: ['provider_bounce','suppressed'] }[eventType] || null; }
async function kitAccount(supabase) { return supabase.from('provider_accounts').select('id,provider_key,status,writes_enabled,capabilities,updated_at').eq('provider_key', 'kit').maybeSingle(); }

async function providerStatus(event) {
  const auth = await requireCrmRequest(event, { flag: 'AUDIENCE_CRM_READ_ENABLED', permission: 'provider:read' }); if (auth.response) return auth.response;
  const account = await kitAccount(auth.context.supabase);
  return json(200, { provider: 'kit', configured: Boolean(process.env.KIT_API_KEY), apiVersion: 'v4', authentication: 'api_key', capabilities: CAPABILITIES, account: account.data || null, flags: { provider: process.env.KIT_PROVIDER_ENABLED === 'true', writes: process.env.KIT_WRITE_OPERATIONS_ENABLED === 'true', metrics: process.env.KIT_METRICS_SYNC_ENABLED === 'true', webhooks: process.env.KIT_WEBHOOKS_ENABLED === 'true', mcp: process.env.KIT_MCP_ASSISTANT_ENABLED === 'true' } }, auth.context.correlationId);
}

async function providerActions(event) {
  const auth = await requireCrmRequest(event, { flag: 'AUDIENCE_PROVIDER_SYNC_ENABLED', permission: 'provider:write' }); if (auth.response) return auth.response;
  const input = body(event); const { supabase, correlationId: id } = auth.context;
  if (!input?.action) return json(422, { error: 'Provider action required.' }, id);
  if (input.action !== 'hold_contact' && process.env.KIT_WRITE_OPERATIONS_ENABLED !== 'true') return json(404, { error: 'Kit write operations are disabled.' }, id);
  if (input.action === 'hold_contact' || input.action === 'release_contact') {
    const hold = input.action === 'hold_contact';
    const result = await supabase.from('contacts').update({ provider_sync_hold: hold }).eq('id', input.contactId).select('id').single();
    if (result.error) return json(503, { error: 'Contact hold could not be changed.' }, id);
    await writeAdminAuditEvent(supabase, auth.context, { action: hold ? 'provider_contact_held' : 'provider_contact_released', targetType: 'contact', targetId: input.contactId });
    return json(200, { held: hold }, id);
  }
  const account = await kitAccount(supabase); if (!account.data) return json(409, { error: 'Kit provider account metadata is not configured.' }, id);
  if (input.action === 'queue') {
    const key = canonicalIdempotency({ providerAccountId: account.data.id, contactId: input.contactId, operation: input.operation, targetKey: input.segmentKey, eligibilityVersion: input.eligibilityVersion });
    const result = await supabase.from('email_sync_outbox').insert({ contact_id: input.contactId, provider_account_id: account.data.id, operation: input.operation, internal_segment_key: input.segmentKey || null, idempotency_key: key, eligibility_version: input.eligibilityVersion, consent_version: input.consentVersion, status: 'held', correlation_id: id }).select('id,status').single();
    return result.error ? json(result.error.code === '23505' ? 409 : 503, { error: 'Sync intent could not be queued.' }, id) : json(201, { intent: result.data, held: true }, id);
  }
  if (input.action === 'retry') {
    const result = await supabase.from('email_sync_outbox').update({ status: 'pending', next_attempt_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', input.outboxId).in('status', ['retryable_failure','held']).select('id,status').single();
    return result.error ? json(409, { error: 'Operation is not eligible for retry.' }, id) : json(200, { intent: result.data }, id);
  }
  return json(422, { error: 'Unsupported provider action.' }, id);
}

async function syncActivity(event) {
  const auth = await requireCrmRequest(event, { flag: 'AUDIENCE_CRM_READ_ENABLED', permission: 'provider:read' }); if (auth.response) return auth.response;
  const result = await auth.context.supabase.from('email_sync_outbox').select('id,contact_id,operation,internal_segment_key,status,attempt_count,next_attempt_at,correlation_id,created_at,updated_at,contacts(primary_email,provider_sync_hold),email_sync_attempts(result_status,sanitized_error,completed_at)').order('created_at', { ascending: false }).limit(100);
  if (result.error) return json(503, { error: 'Sync activity unavailable.' }, auth.context.correlationId);
  return json(200, { items: (result.data || []).map((row) => ({ ...row, contacts: undefined, masked_email: maskEmail(row.contacts?.primary_email), hold: row.contacts?.provider_sync_hold, attempts: row.email_sync_attempts || [] })) }, auth.context.correlationId);
}

async function reconciliationPreview(event) {
  const auth = await requireCrmRequest(event, { flag: 'AUDIENCE_PROVIDER_SYNC_ENABLED', permission: 'provider:read' }); if (auth.response) return auth.response;
  if (process.env.KIT_PROVIDER_ENABLED !== 'true') return json(404, { error: 'Kit provider disabled.' }, auth.context.correlationId);
  const provider = new KitV4Provider(); const remote = await provider.listSubscribers({ limit: 100, status: 'all' });
  const local = await auth.context.supabase.from('contacts').select('id,primary_email,communication_preferences(status)').limit(500);
  if (local.error) return json(503, { error: 'Local contacts unavailable.' }, auth.context.correlationId);
  const contacts = (local.data || []).map((row) => ({ ...row, communication_status: (row.communication_preferences || []).map((item) => item.status).sort().pop() || 'unknown' }));
  return json(200, { items: buildReconciliationPreview(contacts, remote.items), nextCursor: remote.nextCursor, previewOnly: true, writes: false }, auth.context.correlationId);
}

async function metricsSync(event) {
  const auth = await requireCrmRequest(event, { flag: 'KIT_METRICS_SYNC_ENABLED', permission: 'provider:write' }); if (auth.response) return auth.response;
  if (process.env.KIT_PROVIDER_ENABLED !== 'true') return json(404, { error: 'Kit provider disabled.' }, auth.context.correlationId);
  const { supabase, correlationId: id } = auth.context; const account = await kitAccount(supabase); if (!account.data) return json(409, { error: 'Kit provider account metadata missing.' }, id);
  const run = await supabase.from('provider_metric_sync_runs').insert({ provider_account_id: account.data.id, status: 'running' }).select('id').single();
  try {
    const provider = new KitV4Provider(); const page = await provider.getBroadcastStats({}); let processed = 0;
    for (const item of page.items) {
      const broadcast = await supabase.from('provider_broadcasts').upsert({ provider_account_id: account.data.id, external_broadcast_id: String(item.id), subject: item.subject || null, status: item.stats?.status || null, sent_at: item.send_at || null, synced_at: new Date().toISOString() }, { onConflict: 'provider_account_id,external_broadcast_id' }).select('id').single();
      if (broadcast.data) await supabase.from('provider_broadcast_metrics').upsert({ provider_broadcast_id: broadcast.data.id, recipients: item.stats?.recipients ?? null, opens: item.stats?.emails_opened ?? null, open_rate: item.stats?.open_rate ?? null, clicks: item.stats?.total_clicks ?? null, click_rate: item.stats?.click_rate ?? null, unsubscribes: item.stats?.unsubscribes ?? null, unsubscribe_rate: item.stats?.unsubscribe_rate ?? null, delivered: null, bounces: null, complaints: null, synced_at: new Date().toISOString(), source_version: 'kit-v4' }, { onConflict: 'provider_broadcast_id' });
      processed += 1;
    }
    await supabase.from('provider_metric_sync_runs').update({ status: 'completed', completed_at: new Date().toISOString(), records_processed: processed }).eq('id', run.data?.id);
    return json(200, { processed, nextCursor: page.nextCursor, metricsSource: 'Kit-reported' }, id);
  } catch (error) {
    await supabase.from('provider_metric_sync_runs').update({ status: 'failed', completed_at: new Date().toISOString(), error_summary: String(error.message || 'sync failed').slice(0, 300) }).eq('id', run.data?.id);
    return json(502, { error: 'Kit metrics sync failed.' }, id);
  }
}

async function metricsRead(event) {
  const auth = await requireCrmRequest(event, { flag: 'AUDIENCE_CRM_READ_ENABLED', permission: 'provider:read' }); if (auth.response) return auth.response;
  const [broadcasts, runs] = await Promise.all([
    auth.context.supabase.from('provider_broadcasts').select('id,subject,status,sent_at,synced_at,provider_broadcast_metrics(recipients,opens,open_rate,clicks,click_rate,unsubscribes,unsubscribe_rate,delivered,bounces,complaints)').order('sent_at', { ascending: false }).limit(100),
    auth.context.supabase.from('provider_metric_sync_runs').select('id,status,started_at,completed_at,records_processed,failures,error_summary').order('started_at', { ascending: false }).limit(25),
  ]);
  return json(200, { broadcasts: broadcasts.data || [], syncRuns: runs.data || [], source: 'Kit-reported where non-null; null means unavailable' }, auth.context.correlationId);
}

async function worker(event) {
  if (event.httpMethod !== 'POST' || !process.env.CRM_WORKER_SECRET || event.headers?.['x-crm-worker-secret'] !== process.env.CRM_WORKER_SECRET) return json(403, { error: 'Worker denied.' }, crypto.randomUUID());
  const { getServerSupabase } = require('./crmAuth'); const supabase = getServerSupabase(); if (!supabase) return json(503, { error: 'Worker unavailable.' }, crypto.randomUUID());
  const result = await processOneOutbox(supabase); return json(200, result, crypto.randomUUID());
}

async function webhook(event) {
  const id = crypto.randomUUID();
  if (event.httpMethod !== 'POST' || process.env.KIT_WEBHOOKS_ENABLED !== 'true') return json(404, { error: 'Webhook unavailable.' }, id);
  if (!process.env.KIT_WEBHOOK_SECRET || event.headers?.['x-kit-webhook-secret'] !== process.env.KIT_WEBHOOK_SECRET) return json(401, { error: 'Webhook verification failed.' }, id);
  const payload = body(event); if (!payload || !payload.event?.type || !payload.subscriber?.id) return json(400, { error: 'Malformed webhook.' }, id);
  const { getServerSupabase } = require('./crmAuth'); const supabase = getServerSupabase(); if (!supabase) return json(503, { error: 'Webhook service unavailable.' }, id);
  const eventType = String(payload.event.type); const restrictive = restrictiveWebhookState(eventType);
  if (!restrictive) return json(202, { status: 'ignored_unsupported_event' }, id);
  const externalId = String(payload.event.id || crypto.createHash('sha256').update(`${eventType}:${payload.subscriber.id}:${payload.event.occurred_at || ''}`).digest('hex'));
  const providerContact = await supabase.from('provider_contacts').select('contact_id').eq('external_contact_id', String(payload.subscriber.id)).maybeSingle();
  const ledger = await supabase.from('provider_webhook_events').insert({ provider: 'kit', external_event_id: externalId, event_type: eventType, signature_status: 'shared_secret_verified', resolved_contact_id: providerContact.data?.contact_id || null, sanitized_payload: { subscriber_id: String(payload.subscriber.id), event_type: eventType }, processing_status: providerContact.data ? 'processing' : 'unresolved' }).select('id').single();
  if (ledger.error?.code === '23505') return json(200, { status: 'duplicate' }, id);
  if (!providerContact.data) return json(202, { status: 'unresolved' }, id);
  const current = await supabase.from('communication_preferences').select('status,version').eq('contact_id', providerContact.data.contact_id).eq('channel', 'email').eq('purpose', 'marketing').maybeSingle();
  const eventRow = { contact_id: providerContact.data.contact_id, channel: 'email', purpose: 'marketing', action: restrictive[0], status_after: restrictive[1], source: 'kit_webhook', occurred_at: payload.event.occurred_at || new Date().toISOString(), actor_type: 'provider', idempotency_key: `kit:${externalId}` };
  const consent = await supabase.from('consent_events').insert(eventRow).select('id').single();
  if (consent.error || !consent.data) {
    await supabase.from('provider_webhook_events').update({ processing_status: 'failed', processed_at: new Date().toISOString(), error_summary: 'Consent event could not be recorded.' }).eq('id', ledger.data.id);
    return json(503, { error: 'Restrictive event could not be applied.' }, id);
  }
  const projected = applyConsentEvent(current.data, eventRow);
  await supabase.from('communication_preferences').upsert({ contact_id: providerContact.data.contact_id, channel: 'email', purpose: 'marketing', status: projected.status, effective_at: projected.effective_at, winning_consent_event_id: consent.data.id, suppression_reason: eventType, source: 'kit_webhook', version: projected.version, updated_at: new Date().toISOString() }, { onConflict: 'contact_id,channel,purpose' });
  await supabase.from('contacts').update({ provider_sync_hold: true }).eq('id', providerContact.data.contact_id);
  await supabase.from('provider_webhook_events').update({ processing_status: 'processed', processed_at: new Date().toISOString() }).eq('id', ledger.data.id);
  return json(200, { status: 'processed', communicationStatus: projected.status }, id);
}

module.exports = { metricsRead, metricsSync, providerActions, providerStatus, reconciliationPreview, restrictiveWebhookState, syncActivity, webhook, worker };
