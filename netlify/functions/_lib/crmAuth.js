const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const ROLE_PERMISSIONS = {
  internal_admin: new Set(['crm:read', 'crm:write', 'organizations:read', 'classification:read', 'activities:read', 'activities:write', 'segments:read', 'segments:evaluate', 'provider:read', 'provider:write', 'bootstrap:read']),
  audience_admin: new Set(['crm:read', 'crm:write', 'organizations:read', 'classification:read', 'activities:read', 'activities:write', 'segments:read', 'segments:evaluate', 'provider:read', 'provider:write']),
  organization_admin: new Set(['crm:read', 'organizations:read', 'activities:read', 'activities:write']),
  read_only_admin: new Set(['crm:read', 'organizations:read', 'classification:read']),
};

function correlationId(event = {}) {
  const incoming = event.headers?.['x-correlation-id'] || event.headers?.['X-Correlation-Id'];
  return /^[a-zA-Z0-9._-]{8,120}$/.test(String(incoming || ''))
    ? String(incoming)
    : crypto.randomUUID();
}

function json(statusCode, body, id) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Correlation-Id': id,
    },
    body: JSON.stringify({ ...body, correlationId: id }),
  };
}

function serverFlagEnabled(name) {
  return process.env[name] === 'true';
}

function getServerSupabase() {
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { enabled: false },
  });
}

function bearerToken(event = {}) {
  const value = event.headers?.authorization || event.headers?.Authorization || '';
  const match = String(value).match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

async function resolveAuthenticatedUser(event, supabase) {
  const token = bearerToken(event);
  if (!token) return { error: 'unauthenticated' };
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user?.id) return { error: 'unauthenticated' };
  return { user: data.user };
}

async function getCrmRoles(authUserId, supabase) {
  const { data, error } = await supabase
    .from('crm_admin_role_assignments')
    .select('id, organization_id, organization_unit_id, crm_admin_roles!inner(key)')
    .eq('auth_user_id', authUserId)
    .eq('status', 'active');
  if (error) return { error: error.message, assignments: [] };
  return {
    assignments: (data || []).map((row) => ({
      id: row.id,
      role: row.crm_admin_roles?.key,
      organizationId: row.organization_id || null,
      organizationUnitId: row.organization_unit_id || null,
    })),
  };
}

function assignmentAllows(assignment, permission, organizationId) {
  if (!ROLE_PERMISSIONS[assignment.role]?.has(permission)) return false;
  if (assignment.role !== 'organization_admin') {
    if (!assignment.organizationId || !organizationId) return true;
    return assignment.organizationId === organizationId;
  }
  return Boolean(assignment.organizationId && (!organizationId || assignment.organizationId === organizationId));
}

async function writeAdminAuditEvent(supabase, context, input) {
  const record = {
    actor_auth_user_id: context.user.id,
    actor_role: context.assignment.role,
    action: input.action,
    target_type: input.targetType,
    target_id: input.targetId || null,
    organization_id: input.organizationId || context.assignment.organizationId || null,
    request_correlation_id: context.correlationId,
    reason: input.reason || null,
    metadata: input.metadata || {},
  };
  const { error } = await supabase.from('admin_audit_events').insert(record);
  if (error) console.warn('[CRM_AUDIT_WRITE_FAILED]', { correlationId: context.correlationId });
}

async function requireCrmRequest(event, options) {
  const id = correlationId(event);
  if (!serverFlagEnabled(options.flag)) {
    return { response: json(404, { error: 'CRM feature unavailable.' }, id) };
  }
  const supabase = options.supabase || getServerSupabase();
  if (!supabase) return { response: json(503, { error: 'CRM service is not configured.' }, id) };
  const auth = await resolveAuthenticatedUser(event, supabase);
  if (!auth.user) return { response: json(401, { error: 'Authentication required.' }, id) };
  const roles = await getCrmRoles(auth.user.id, supabase);
  if (roles.error) return { response: json(503, { error: 'CRM authorization unavailable.' }, id) };
  const organizationId = options.organizationId || null;
  const assignment = roles.assignments.find((item) =>
    assignmentAllows(item, options.permission, organizationId),
  );
  if (!assignment) return { response: json(403, { error: 'CRM access denied.' }, id) };
  return {
    context: { user: auth.user, assignment, assignments: roles.assignments, correlationId: id, supabase },
  };
}

function parsePagination(params, maxLimit = 100) {
  const page = Math.max(1, Number.parseInt(params.get('page') || '1', 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(params.get('limit') || '25', 10) || 25));
  return { page, limit, from: (page - 1) * limit, to: page * limit - 1 };
}

function maskEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  const [local, domain] = email.split('@');
  if (!local || !domain) return null;
  return `${local.slice(0, 1)}***@${domain}`;
}

module.exports = {
  ROLE_PERMISSIONS,
  assignmentAllows,
  bearerToken,
  correlationId,
  getCrmRoles,
  getServerSupabase,
  json,
  maskEmail,
  parsePagination,
  requireCrmRequest,
  resolveAuthenticatedUser,
  serverFlagEnabled,
  writeAdminAuditEvent,
};
