const { loadClassificationPreview } = require('./crmClassifier');
const { json, maskEmail, parsePagination, requireCrmRequest } = require('./crmAuth');

function paramsFor(event) {
  return new URLSearchParams(event.rawQuery || event.queryStringParameters || {});
}

function safeSearch(value) {
  return String(value || '').trim().slice(0, 80).replace(/[^a-zA-Z0-9@._+\- '\u00C0-\u024F]/g, '');
}

function readOnly(handler) {
  return async (event) => {
    if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed.' }, 'read-only-endpoint');
    return handler(event);
  };
}

async function overview(event) {
  const auth = await requireCrmRequest(event, { flag: 'AUDIENCE_CRM_READ_ENABLED', permission: 'crm:read' });
  if (auth.response) return auth.response;
  const { supabase, correlationId: id, assignment } = auth.context;
  const scopedOrg = assignment.organizationId;
  let contacts = supabase.from('contacts').select('id', { count: 'exact', head: true });
  let organizations = supabase.from('organizations').select('id', { count: 'exact', head: true });
  if (scopedOrg) {
    organizations = organizations.eq('id', scopedOrg);
    const memberships = await supabase.from('organization_memberships').select('contact_id').eq('organization_id', scopedOrg).eq('status', 'active');
    contacts = contacts.in('id', (memberships.data || []).map((row) => row.contact_id));
  }
  const [contactCount, organizationCount] = await Promise.all([contacts, organizations]);
  if (contactCount.error || organizationCount.error) return json(503, { error: 'CRM data unavailable.' }, id);
  let classificationSummary = null;
  if (process.env.AUDIENCE_CLASSIFICATION_PREVIEW_ENABLED === 'true' && process.env.CRM_PSEUDONYM_SALT && assignment.role !== 'organization_admin') {
    try {
      classificationSummary = (await loadClassificationPreview(supabase, { page: 1, limit: 50, from: 0, to: 49 })).summary;
    } catch {
      classificationSummary = null;
    }
  }
  return json(200, { contacts: contactCount.count || 0, organizations: organizationCount.count || 0, classificationSummary, readOnly: true }, id);
}

async function contacts(event) {
  const auth = await requireCrmRequest(event, { flag: 'AUDIENCE_CRM_READ_ENABLED', permission: 'crm:read' });
  if (auth.response) return auth.response;
  const { supabase, correlationId: id, assignment } = auth.context;
  const params = paramsFor(event);
  const page = parsePagination(params);
  let query = supabase.from('contacts').select('id,first_name,last_name,primary_email,contact_kind,status,created_at', { count: 'exact' });
  if (params.get('kind')) query = query.eq('contact_kind', params.get('kind'));
  if (params.get('status')) query = query.eq('status', params.get('status'));
  const search = safeSearch(params.get('search'));
  if (search) query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,normalized_email.ilike.%${search}%`);
  if (assignment.organizationId) {
    const memberships = await supabase.from('organization_memberships').select('contact_id').eq('organization_id', assignment.organizationId).eq('status', 'active');
    query = query.in('id', (memberships.data || []).map((row) => row.contact_id));
  }
  const result = await query.order('created_at', { ascending: false }).range(page.from, page.to);
  if (result.error) return json(503, { error: 'CRM contacts unavailable.' }, id);
  const ids = (result.data || []).map((row) => row.id);
  const [sources, memberships, profiles] = ids.length ? await Promise.all([
    supabase.from('contact_sources').select('contact_id').in('contact_id', ids),
    supabase.from('organization_memberships').select('contact_id').in('contact_id', ids),
    supabase.from('crm_platform_profiles').select('contact_id').in('contact_id', ids),
  ]) : [{ data: [] }, { data: [] }, { data: [] }];
  const countFor = (rows, contactId) => (rows.data || []).filter((row) => row.contact_id === contactId).length;
  return json(200, {
    items: (result.data || []).map((row) => ({ ...row, primary_email: undefined, masked_email: maskEmail(row.primary_email), source_count: countFor(sources, row.id), organization_count: countFor(memberships, row.id), account_relationship: countFor(profiles, row.id) ? 'linked' : 'none' })),
    page: page.page, limit: page.limit, total: result.count || 0, readOnly: true,
  }, id);
}

async function contact(event) {
  const params = paramsFor(event);
  const contactId = params.get('id');
  if (!contactId) return json(400, { error: 'Missing contact id.' }, 'missing-contact-id');
  const auth = await requireCrmRequest(event, { flag: 'AUDIENCE_CRM_READ_ENABLED', permission: 'crm:read' });
  if (auth.response) return auth.response;
  const { supabase, correlationId: id, assignment } = auth.context;
  if (assignment.organizationId) {
    const scope = await supabase.from('organization_memberships').select('id').eq('contact_id', contactId).eq('organization_id', assignment.organizationId).eq('status', 'active').maybeSingle();
    if (!scope.data) return json(404, { error: 'Contact not found.' }, id);
  }
  const [record, sources, links, memberships] = await Promise.all([
    supabase.from('contacts').select('id,first_name,last_name,primary_email,contact_kind,status,created_by_type,created_at,updated_at').eq('id', contactId).maybeSingle(),
    supabase.from('contact_sources').select('id,source_type,captured_at,created_at').eq('contact_id', contactId),
    supabase.from('contact_identity_links').select('id,source_record_type,confidence,review_status,created_at').eq('contact_id', contactId),
    supabase.from('organization_memberships').select('id,organization_id,organization_unit_id,role_key,status,created_at').eq('contact_id', contactId),
  ]);
  if (record.error || !record.data) return json(404, { error: 'Contact not found.' }, id);
  return json(200, { contact: { ...record.data, primary_email: undefined, masked_email: maskEmail(record.data.primary_email), sources: sources.data || [], identity_links: links.data || [], memberships: memberships.data || [] }, readOnly: true }, id);
}

async function organizations(event) {
  const auth = await requireCrmRequest(event, { flag: 'AUDIENCE_ORGANIZATIONS_ENABLED', permission: 'organizations:read' });
  if (auth.response) return auth.response;
  const { supabase, correlationId: id, assignment } = auth.context;
  const params = paramsFor(event);
  const page = parsePagination(params);
  let query = supabase.from('organizations').select('id,name,organization_type,status,created_at,updated_at', { count: 'exact' });
  if (assignment.organizationId) query = query.eq('id', assignment.organizationId);
  if (params.get('type')) query = query.eq('organization_type', params.get('type'));
  if (params.get('status')) query = query.eq('status', params.get('status'));
  const search = safeSearch(params.get('search'));
  if (search) query = query.ilike('name', `%${search}%`);
  const result = await query.order('name').range(page.from, page.to);
  if (result.error) return json(503, { error: 'CRM organizations unavailable.' }, id);
  const ids = (result.data || []).map((row) => row.id);
  const [units, memberships] = ids.length ? await Promise.all([
    supabase.from('organization_units').select('organization_id,legacy_program_id,legacy_program_code').in('organization_id', ids),
    supabase.from('organization_memberships').select('organization_id').in('organization_id', ids),
  ]) : [{ data: [] }, { data: [] }];
  const items = (result.data || []).map((row) => ({
    ...row,
    unit_count: (units.data || []).filter((unit) => unit.organization_id === row.id).length,
    membership_count: (memberships.data || []).filter((membership) => membership.organization_id === row.id).length,
    mapped_legacy_program_count: (units.data || []).filter((unit) => unit.organization_id === row.id && (unit.legacy_program_id || unit.legacy_program_code)).length,
  }));
  return json(200, { items, page: page.page, limit: page.limit, total: result.count || 0, readOnly: true }, id);
}

async function organization(event) {
  const params = paramsFor(event);
  const organizationId = params.get('id');
  if (!organizationId) return json(400, { error: 'Missing organization id.' }, 'missing-organization-id');
  const auth = await requireCrmRequest(event, { flag: 'AUDIENCE_ORGANIZATIONS_ENABLED', permission: 'organizations:read', organizationId });
  if (auth.response) return auth.response;
  const { supabase, correlationId: id } = auth.context;
  const [record, units, memberships] = await Promise.all([
    supabase.from('organizations').select('id,name,organization_type,status,created_at,updated_at').eq('id', organizationId).maybeSingle(),
    supabase.from('organization_units').select('id,name,unit_type,status,legacy_program_id,legacy_program_code,created_at').eq('organization_id', organizationId),
    supabase.from('organization_memberships').select('id,contact_id,organization_unit_id,role_key,ownership_flag,status,created_at').eq('organization_id', organizationId),
  ]);
  if (record.error || !record.data) return json(404, { error: 'Organization not found.' }, id);
  return json(200, { organization: { ...record.data, units: units.data || [], memberships: memberships.data || [] }, readOnly: true }, id);
}

async function classification(event) {
  const auth = await requireCrmRequest(event, { flag: 'AUDIENCE_CLASSIFICATION_PREVIEW_ENABLED', permission: 'classification:read' });
  if (auth.response) return auth.response;
  const { supabase, correlationId: id, assignment } = auth.context;
  if (assignment.role === 'organization_admin' || assignment.organizationId) return json(403, { error: 'Classification preview requires global CRM read access.' }, id);
  if (!process.env.CRM_PSEUDONYM_SALT) return json(503, { error: 'Classification pseudonymization is not configured.' }, id);
  try {
    const result = await loadClassificationPreview(supabase, parsePagination(paramsFor(event), 50));
    console.info('[CRM_CLASSIFICATION_PREVIEW]', { correlationId: id, resultCount: result.candidates.length });
    return json(200, { ...result, readOnly: true, previewOnly: true }, id);
  } catch {
    return json(503, { error: 'Classification preview unavailable.' }, id);
  }
}

module.exports = { classification, contact, contacts, organization, organizations, overview, readOnly };
