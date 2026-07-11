const crypto = require('crypto');
const { json, maskEmail, requireCrmRequest, writeAdminAuditEvent } = require('./crmAuth');
const { applyConsentEvent, evaluateSegment, validateAdultContact } = require('./crmWorkflowRules');

function body(event) { try { return JSON.parse(event.body || '{}'); } catch { return null; } }
function idempotency(value, prefix) { return String(value || `${prefix}:${crypto.randomUUID()}`).slice(0, 200); }
function sensitiveNote(value) { return /(student pin|access code|diagnosis|medical|disability|assessment score|grade\s*[:=])/i.test(String(value || '')); }

async function createContact(event) {
  const auth = await requireCrmRequest(event, { flag: 'AUDIENCE_MANUAL_CONTACTS_ENABLED', permission: 'crm:write' });
  if (auth.response) return auth.response;
  const input = body(event);
  if (!input) return json(400, { error: 'Invalid JSON.' }, auth.context.correlationId);
  const valid = validateAdultContact(input);
  if (!valid.ok) return json(422, { error: valid.error }, auth.context.correlationId);
  const { supabase, correlationId: id, user } = auth.context;
  const email = String(input.email || '').trim().toLowerCase() || null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(422, { error: 'Invalid adult email.' }, id);
  const duplicate = email ? await supabase.from('contacts').select('id,first_name,last_name,primary_email,status').eq('normalized_email', email).limit(10) : { data: [] };
  if ((duplicate.data || []).length && input.duplicateReviewed !== true) {
    return json(409, { error: 'Possible duplicate adults require manual review.', possibleDuplicates: duplicate.data.map((row) => ({ id: row.id, name: [row.first_name,row.last_name].filter(Boolean).join(' '), maskedEmail: maskEmail(row.primary_email), status: row.status })) }, id);
  }
  const inserted = await supabase.from('contacts').insert({
    primary_email: email, normalized_email: email, first_name: input.firstName || null, last_name: input.lastName || null,
    role_title: input.roleTitle || null, audience_type: input.audienceType || 'unknown',
    contact_kind: input.contactKind || 'marketing_contact', status: 'active', created_by_type: 'admin', created_by_id: user.id,
    do_not_enroll: valid.value.doNotEnroll,
  }).select('id,first_name,last_name,primary_email,contact_kind,status,do_not_enroll,created_at').single();
  if (inserted.error) return json(503, { error: 'Contact creation failed.' }, id);
  await supabase.from('contact_sources').insert({ contact_id: inserted.data.id, source_type: input.source || 'manual_admin', captured_at: input.sourceTimestamp || new Date().toISOString(), metadata: {} });
  await supabase.from('crm_activities').insert({ contact_id: inserted.data.id, activity_type: 'contact_created', actor_auth_user_id: user.id, summary: 'Adult CRM contact created manually.', metadata: {} });
  await writeAdminAuditEvent(supabase, auth.context, { action: 'crm_contact_created', targetType: 'contact', targetId: inserted.data.id, reason: input.reason || 'manual_admin_creation' });
  return json(201, { contact: { ...inserted.data, primary_email: undefined, masked_email: maskEmail(inserted.data.primary_email) }, doNotEnroll: inserted.data.do_not_enroll }, id);
}

async function addConsent(event) {
  const auth = await requireCrmRequest(event, { flag: 'AUDIENCE_CRM_WRITE_ENABLED', permission: 'crm:write' });
  if (auth.response) return auth.response;
  const input = body(event); const { supabase, correlationId: id, user } = auth.context;
  if (!input?.contactId || !input?.purpose || !input?.statusAfter || !input?.source || !input?.occurredAt) return json(422, { error: 'Complete consent evidence is required.' }, id);
  if (input.statusAfter === 'confirmed' && !input.noticeVersion) return json(422, { error: 'Confirmed consent requires a notice version.' }, id);
  const eventRow = { contact_id: input.contactId, channel: 'email', purpose: input.purpose, action: input.action || (input.statusAfter === 'confirmed' ? 'granted' : 'corrected'), status_after: input.statusAfter, source: input.source, notice_version: input.noticeVersion || null, occurred_at: input.occurredAt, actor_type: 'admin', actor_id: user.id, evidence_reference: input.evidenceReference || null, idempotency_key: idempotency(input.idempotencyKey, 'consent') };
  const inserted = await supabase.from('consent_events').insert(eventRow).select('id').single();
  if (inserted.error) return json(inserted.error.code === '23505' ? 409 : 503, { error: 'Consent event was not recorded.' }, id);
  const current = await supabase.from('communication_preferences').select('status,version').eq('contact_id', input.contactId).eq('channel', 'email').eq('purpose', input.purpose).maybeSingle();
  const projected = applyConsentEvent(current.data, eventRow);
  const preference = await supabase.from('communication_preferences').upsert({ contact_id: input.contactId, channel: 'email', purpose: input.purpose, status: projected.status, effective_at: projected.effective_at, winning_consent_event_id: inserted.data.id, suppression_reason: projected.status === 'suppressed' ? input.reason || 'suppressed' : null, source: projected.source, version: projected.version, updated_at: new Date().toISOString() }, { onConflict: 'contact_id,channel,purpose' });
  if (preference.error) return json(503, { error: 'Consent projection failed; event remains append-only for reconciliation.' }, id);
  await supabase.from('crm_activities').insert({ contact_id: input.contactId, activity_type: 'consent_changed', actor_auth_user_id: user.id, summary: `Email ${input.purpose} preference became ${projected.status}.`, metadata: { purpose: input.purpose, status: projected.status } });
  return json(201, { status: projected.status, version: projected.version }, id);
}

async function changeLifecycle(event) {
  const auth = await requireCrmRequest(event, { flag: 'AUDIENCE_CRM_WRITE_ENABLED', permission: 'crm:write' }); if (auth.response) return auth.response;
  const input = body(event); const { supabase, correlationId: id, user } = auth.context;
  if (!input?.contactId || !input?.toStage || !input?.reason) return json(422, { error: 'Contact, stage, and audit reason are required.' }, id);
  const current = await supabase.from('contact_lifecycle_state').select('stage,version').eq('contact_id', input.contactId).maybeSingle();
  const eventRow = await supabase.from('lifecycle_events').insert({ contact_id: input.contactId, from_stage: current.data?.stage || null, to_stage: input.toStage, reason: input.reason, evidence_type: input.evidenceType || null, evidence_id: input.evidenceId || null, actor_auth_user_id: user.id, occurred_at: input.occurredAt || new Date().toISOString(), idempotency_key: idempotency(input.idempotencyKey, 'lifecycle') }).select('id').single();
  if (eventRow.error) return json(eventRow.error.code === '23505' ? 409 : 503, { error: 'Lifecycle event was not recorded.' }, id);
  const projection = await supabase.from('contact_lifecycle_state').upsert({ contact_id: input.contactId, stage: input.toStage, winning_lifecycle_event_id: eventRow.data.id, version: (current.data?.version || 0) + 1, updated_at: new Date().toISOString() });
  if (projection.error) return json(503, { error: 'Lifecycle projection failed; history remains available.' }, id);
  await supabase.from('crm_activities').insert({ contact_id: input.contactId, activity_type: 'lifecycle_changed', actor_auth_user_id: user.id, summary: `Lifecycle changed to ${input.toStage}.`, metadata: {} });
  return json(201, { stage: input.toStage, version: (current.data?.version || 0) + 1 }, id);
}

async function addInterest(event) {
  const auth = await requireCrmRequest(event, { flag: 'AUDIENCE_CRM_WRITE_ENABLED', permission: 'crm:write' }); if (auth.response) return auth.response;
  const input = body(event); const { supabase, correlationId: id, user } = auth.context;
  if (!input?.contactId || !input?.interestKey || !input?.source) return json(422, { error: 'Interest and source are required.' }, id);
  const result = await supabase.from('contact_interests').insert({ contact_id: input.contactId, interest_key: input.interestKey, source: input.source, confidence: input.confidence || 'high', expressed_at: input.expressedAt || new Date().toISOString(), status: input.status || 'active' }).select('id').single();
  if (result.error) return json(503, { error: 'Interest could not be recorded.' }, id);
  await supabase.from('crm_activities').insert({ contact_id: input.contactId, activity_type: 'interest_changed', actor_auth_user_id: user.id, summary: `Interest recorded: ${input.interestKey}.`, metadata: {} });
  return json(201, { id: result.data.id }, id);
}

async function addNote(event) {
  const auth = await requireCrmRequest(event, { flag: 'AUDIENCE_ACTIVITIES_ENABLED', permission: 'activities:write', organizationId: body(event)?.organizationId }); if (auth.response) return auth.response;
  const input = body(event); const { supabase, correlationId: id, user } = auth.context;
  if (!input?.body || (!input.contactId && !input.organizationId)) return json(422, { error: 'Note body and related record are required.' }, id);
  if (sensitiveNote(input.body)) return json(422, { error: 'Do not place child medical, assessment, grade, or access-code data in CRM notes.' }, id);
  const result = await supabase.from('crm_notes').insert({ contact_id: input.contactId || null, organization_id: input.organizationId || null, body: String(input.body).slice(0, 5000), created_by: user.id }).select('id,created_at').single();
  if (result.error) return json(503, { error: 'Note could not be recorded.' }, id);
  await supabase.from('crm_activities').insert({ contact_id: input.contactId || null, organization_id: input.organizationId || null, activity_type: 'note_added', actor_auth_user_id: user.id, summary: 'CRM note added.', metadata: {} });
  return json(201, { note: result.data }, id);
}

async function task(event) {
  const auth = await requireCrmRequest(event, { flag: 'AUDIENCE_ACTIVITIES_ENABLED', permission: 'activities:write', organizationId: body(event)?.organizationId }); if (auth.response) return auth.response;
  const input = body(event); const { supabase, correlationId: id, user } = auth.context;
  if (input.action === 'complete') {
    const result = await supabase.from('crm_tasks').update({ status: 'completed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', input.taskId).select('id').single();
    return result.error ? json(503, { error: 'Task could not be completed.' }, id) : json(200, { task: result.data }, id);
  }
  if (!input.title) return json(422, { error: 'Task title is required.' }, id);
  const result = await supabase.from('crm_tasks').insert({ title: input.title, description: input.description || null, related_contact_id: input.contactId || null, related_organization_id: input.organizationId || null, assigned_to_auth_user_id: input.assignedTo || user.id, created_by_auth_user_id: user.id, priority: input.priority || 'normal', status: 'open', due_at: input.dueAt || null, reminder_at: input.reminderAt || null }).select('id,status,created_at').single();
  if (result.error) return json(503, { error: 'Task could not be created.' }, id);
  await supabase.from('crm_activities').insert({ contact_id: input.contactId || null, organization_id: input.organizationId || null, activity_type: input.reminderAt ? 'reminder_created' : 'task_created', actor_auth_user_id: user.id, summary: 'CRM task created.', metadata: {} });
  return json(201, { task: result.data }, id);
}

async function listActivities(event) {
  const params = new URLSearchParams(event.rawQuery || event.queryStringParameters || {}); const organizationId = params.get('organizationId');
  const auth = await requireCrmRequest(event, { flag: 'AUDIENCE_ACTIVITIES_ENABLED', permission: 'activities:read', organizationId }); if (auth.response) return auth.response;
  let query = auth.context.supabase.from('crm_activities').select('id,contact_id,organization_id,activity_type,summary,occurred_at,created_at').order('occurred_at', { ascending: false }).limit(100);
  if (params.get('contactId')) query = query.eq('contact_id', params.get('contactId'));
  if (organizationId) query = query.eq('organization_id', organizationId);
  const result = await query; return result.error ? json(503, { error: 'Activities unavailable.' }, auth.context.correlationId) : json(200, { items: result.data || [] }, auth.context.correlationId);
}

async function evaluateSegments(event) {
  const auth = await requireCrmRequest(event, { flag: 'AUDIENCE_SEGMENTS_ENABLED', permission: 'segments:evaluate' }); if (auth.response) return auth.response;
  const input = body(event); const { supabase, correlationId: id } = auth.context; if (!input?.contactId) return json(422, { error: 'Contact is required.' }, id);
  const [contact, lifecycle, interests, preferences, customers, definitions] = await Promise.all([
    supabase.from('contacts').select('id,audience_type,do_not_enroll').eq('id', input.contactId).single(),
    supabase.from('contact_lifecycle_state').select('stage,version').eq('contact_id', input.contactId).maybeSingle(),
    supabase.from('contact_interests').select('interest_key').eq('contact_id', input.contactId).eq('status', 'active'),
    supabase.from('communication_preferences').select('purpose,status,version').eq('contact_id', input.contactId).eq('channel', 'email'),
    supabase.from('customer_relationships').select('relationship_type,customer_status,evidence_type,evidence_id').eq('contact_id', input.contactId),
    supabase.from('segment_definitions').select('id,key,rule_version').eq('active', true),
  ]);
  if (contact.error) return json(404, { error: 'Contact not found.' }, id);
  const verifiedCustomer = (customers.data || []).find((row) => row.evidence_type && row.evidence_id && row.customer_status === 'active');
  const facts = { audienceType: contact.data.audience_type, doNotEnroll: contact.data.do_not_enroll, lifecycle: lifecycle.data?.stage || 'unknown', interests: (interests.data || []).map((row) => row.interest_key), communicationStatuses: (preferences.data || []).map((row) => row.status), confirmedPurposes: (preferences.data || []).filter((row) => row.status === 'confirmed').map((row) => row.purpose), customerStatus: verifiedCustomer ? 'verified_active' : 'none', customerType: verifiedCustomer?.relationship_type || null };
  const results = (definitions.data || []).map((definition) => ({ definition, result: evaluateSegment(definition.key, facts) }));
  for (const item of results) {
    await supabase.from('segment_eligibility').upsert({ contact_id: input.contactId, segment_definition_id: item.definition.id, eligible: item.result.eligible, evidence_summary: item.result.evidence, confidence: 'high', exclusion_reason: item.result.exclusion.join(',' ) || null, rule_version: item.definition.rule_version, consent_preference_version: Math.max(0, ...(preferences.data || []).map((row) => row.version || 0)), evaluated_at: new Date().toISOString(), evaluation_version: Date.now() }, { onConflict: 'contact_id,segment_definition_id' });
  }
  return json(200, { items: results.map((item) => ({ segment: item.definition.key, ...item.result })), providerEnrollmentOccurred: false }, id);
}

module.exports = { addConsent, addInterest, addNote, changeLifecycle, createContact, evaluateSegments, listActivities, sensitiveNote, task };
