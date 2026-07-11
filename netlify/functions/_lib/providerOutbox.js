const crypto = require('crypto');
const { KitV4Provider } = require('./kitV4Provider');
const { mostRestrictiveStatus } = require('./crmWorkflowRules');

function retryDelayMs(attempt, random = Math.random) { const base = Math.min(3600000, 1000 * (2 ** Math.min(attempt, 10))); return Math.round(base * (0.75 + random() * 0.5)); }
function canonicalIdempotency(input) { return crypto.createHash('sha256').update([input.providerAccountId,input.contactId,input.operation,input.targetKey || 'none',input.eligibilityVersion].join(':')).digest('hex'); }
function sanitizedError(error) { return { code: error?.code || 'provider_error', message: String(error?.message || 'Provider operation failed.').replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[redacted-email]').slice(0, 500), retryable: Boolean(error?.retryable) }; }

async function processOneOutbox(supabase, options = {}) {
  if (process.env.AUDIENCE_PROVIDER_SYNC_ENABLED !== 'true' || process.env.KIT_PROVIDER_ENABLED !== 'true' || process.env.KIT_WRITE_OPERATIONS_ENABLED !== 'true') return { status: 'disabled' };
  const claim = await supabase.rpc('crm_claim_email_sync_outbox', { p_now: new Date().toISOString() });
  const row = claim.data?.[0]; if (!row) return { status: 'empty' };
  const started = Date.now();
  const [contact, providerAccount, preferences, eligibility, providerContact, mapping] = await Promise.all([
    supabase.from('contacts').select('id,primary_email,first_name,last_name,contact_kind,do_not_enroll,provider_sync_hold').eq('id', row.contact_id).single(),
    supabase.from('provider_accounts').select('id,provider_key,status,writes_enabled').eq('id', row.provider_account_id).single(),
    supabase.from('communication_preferences').select('status,version').eq('contact_id', row.contact_id).eq('channel', 'email'),
    row.internal_segment_key ? supabase.from('segment_eligibility').select('eligible,evaluation_version,segment_definitions!inner(key)').eq('contact_id', row.contact_id).eq('segment_definitions.key', row.internal_segment_key).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from('provider_contacts').select('external_contact_id,provider_status').eq('contact_id', row.contact_id).eq('provider_account_id', row.provider_account_id).maybeSingle(),
    row.internal_segment_key ? supabase.from('provider_segment_mappings').select('external_segment_id,status').eq('provider_account_id', row.provider_account_id).eq('internal_segment_key', row.internal_segment_key).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  const restrictive = mostRestrictiveStatus((preferences.data || []).map((item) => item.status));
  const removal = row.operation === 'remove_segment' || row.operation === 'suppress';
  let cancelReason = null;
  if (contact.error || ['student','child'].includes(contact.data?.contact_kind)) cancelReason = 'invalid_adult_contact';
  else if (providerAccount.error || providerAccount.data.status === 'disabled' || !providerAccount.data.writes_enabled) cancelReason = 'provider_disabled';
  else if (contact.data.provider_sync_hold) cancelReason = 'contact_hold';
  else if (!removal && contact.data.do_not_enroll) cancelReason = 'do_not_enroll';
  else if (!removal && restrictive !== 'confirmed') cancelReason = `communication_${restrictive}`;
  else if (!removal && row.internal_segment_key && !eligibility.data?.eligible) cancelReason = 'stale_eligibility';
  else if (row.internal_segment_key && (!mapping.data?.external_segment_id || mapping.data.status !== 'verified')) cancelReason = 'mapping_unverified';
  if (cancelReason) { await supabase.from('email_sync_outbox').update({ status: cancelReason === 'contact_hold' ? 'held' : 'cancelled', updated_at: new Date().toISOString() }).eq('id', row.id); return { status: 'cancelled', reason: cancelReason }; }
  const provider = options.provider || new KitV4Provider();
  try {
    let result;
    if (row.operation === 'upsert_contact') result = await provider.upsertContact({ contactId: contact.data.id, email: contact.data.primary_email, firstName: contact.data.first_name, lastName: contact.data.last_name, explicitConfirmedConsent: true });
    else if (row.operation === 'add_segment') result = await provider.addContactToSegment({ externalContactId: providerContact.data?.external_contact_id, externalSegmentId: mapping.data.external_segment_id });
    else if (row.operation === 'remove_segment') result = await provider.removeContactFromSegment({ externalContactId: providerContact.data?.external_contact_id, externalSegmentId: mapping.data.external_segment_id });
    else if (row.operation === 'suppress') result = await provider.suppressContact({ externalContactId: providerContact.data?.external_contact_id });
    else throw Object.assign(new Error('Unsupported outbox operation.'), { code: 'unsupported_operation', retryable: false });
    await supabase.from('email_sync_attempts').insert({ outbox_id: row.id, attempt_number: row.attempt_count, started_at: new Date(started).toISOString(), completed_at: new Date().toISOString(), result_status: 'completed', retryable: false, latency_ms: Date.now() - started });
    await supabase.from('email_sync_outbox').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', row.id);
    if (result?.externalContactId) await supabase.from('provider_contacts').upsert({ contact_id: row.contact_id, provider_account_id: row.provider_account_id, external_contact_id: result.externalContactId, provider_status: result.status || 'active', last_synced_at: new Date().toISOString(), last_observed_at: new Date().toISOString(), reconciliation_status: 'matched', updated_at: new Date().toISOString() }, { onConflict: 'contact_id,provider_account_id' });
    return { status: 'completed' };
  } catch (error) {
    const safe = sanitizedError(error); const status = safe.retryable ? 'retryable_failure' : 'permanent_failure';
    await supabase.from('email_sync_attempts').insert({ outbox_id: row.id, attempt_number: row.attempt_count, started_at: new Date(started).toISOString(), completed_at: new Date().toISOString(), result_status: status, retryable: safe.retryable, sanitized_error: safe.message, latency_ms: Date.now() - started });
    await supabase.from('email_sync_outbox').update({ status, next_attempt_at: new Date(Date.now() + retryDelayMs(row.attempt_count)).toISOString(), updated_at: new Date().toISOString() }).eq('id', row.id);
    return { status, error: safe };
  }
}

module.exports = { canonicalIdempotency, processOneOutbox, retryDelayMs, sanitizedError };
