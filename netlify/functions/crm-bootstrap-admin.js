const { correlationId, getServerSupabase, json, serverFlagEnabled } = require('./_lib/crmAuth');

exports.handler = async (event) => {
  const id = correlationId(event);
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' }, id);
  if (!serverFlagEnabled('CRM_BOOTSTRAP_ENABLED')) return json(404, { error: 'Bootstrap unavailable.' }, id);
  const email = process.env.CRM_BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const secret = process.env.CRM_BOOTSTRAP_SECRET;
  if (!email || !secret || event.headers?.['x-crm-bootstrap-secret'] !== secret) {
    return json(403, { error: 'Bootstrap denied.' }, id);
  }
  const supabase = getServerSupabase();
  if (!supabase) return json(503, { error: 'CRM service is not configured.' }, id);

  const existing = await supabase.from('crm_admin_role_assignments').select('id,auth_user_id,crm_admin_roles!inner(key)').eq('status', 'active').eq('crm_admin_roles.key', 'internal_admin');
  if (existing.error) return json(503, { error: 'Bootstrap state unavailable.' }, id);
  if ((existing.data || []).length > 1) return json(409, { error: 'Multiple bootstrap administrators already exist.' }, id);

  const users = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (users.error) return json(503, { error: 'Auth directory unavailable.' }, id);
  const user = users.data.users.find((item) => item.email?.trim().toLowerCase() === email);
  if (!user) return json(404, { error: 'Existing authenticated user not found.' }, id);
  if (existing.data?.[0]) {
    if (existing.data[0].auth_user_id === user.id) return json(200, { success: true, status: 'already_bootstrapped' }, id);
    return json(409, { error: 'Bootstrap administrator already assigned.' }, id);
  }
  const role = await supabase.from('crm_admin_roles').select('id').eq('key', 'internal_admin').single();
  if (role.error || !role.data) return json(503, { error: 'CRM role unavailable.' }, id);
  const assignment = await supabase.from('crm_admin_role_assignments').insert({ auth_user_id: user.id, role_id: role.data.id, status: 'active', granted_by: user.id }).select('id').single();
  if (assignment.error) return json(503, { error: 'Bootstrap assignment failed.' }, id);
  await supabase.from('admin_audit_events').insert({ actor_auth_user_id: user.id, actor_role: 'internal_admin', action: 'crm_internal_admin_bootstrapped', target_type: 'crm_admin_role_assignment', target_id: assignment.data.id, request_correlation_id: id, metadata: { method: 'server_environment' } });
  return json(201, { success: true, status: 'bootstrapped' }, id);
};
