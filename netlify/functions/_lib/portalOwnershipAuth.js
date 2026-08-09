const {
  correlationId,
  getServerSupabase,
  json,
  resolveAuthenticatedUser,
  serverFlagEnabled,
} = require('./crmAuth');

async function getActivePortalOwnership(authUserId, supabase) {
  const now = new Date().toISOString();
  const membershipsResult = await supabase
    .from('portal_program_memberships')
    .select('id, program_id, portal_role, compatibility_mode, valid_until')
    .eq('auth_user_id', authUserId)
    .eq('status', 'active');
  if (membershipsResult.error) return { error: membershipsResult.error.message };

  const accessResult = await supabase
    .from('portal_participant_access')
    .select('membership_id, participant_id, access_scope, valid_until')
    .eq('auth_user_id', authUserId)
    .eq('status', 'active');
  if (accessResult.error) return { error: accessResult.error.message };

  const active = (row) => !row.valid_until || row.valid_until > now;
  const memberships = (membershipsResult.data || []).filter(active);
  const membershipIds = new Set(memberships.map((row) => row.id));
  const participantAccess = (accessResult.data || [])
    .filter((row) => membershipIds.has(row.membership_id) && active(row));
  return { memberships, participantAccess };
}

async function requirePortalOwnership(event, options = {}) {
  const id = correlationId(event);
  if (!serverFlagEnabled('PORTAL_AUTH_OWNERSHIP_ENABLED')) {
    return { response: json(404, { error: 'Portal Auth ownership is unavailable.' }, id) };
  }
  const supabase = options.supabase || getServerSupabase();
  if (!supabase) return { response: json(503, { error: 'Portal authorization is not configured.' }, id) };
  const auth = await resolveAuthenticatedUser(event, supabase);
  if (!auth.user) return { response: json(401, { error: 'Authentication required.' }, id) };
  const ownership = await getActivePortalOwnership(auth.user.id, supabase);
  if (ownership.error) return { response: json(503, { error: 'Portal authorization is unavailable.' }, id) };
  if (!ownership.memberships.length) return { response: json(403, { error: 'Portal access denied.' }, id) };
  return { context: { user: auth.user, correlationId: id, supabase, ...ownership } };
}

module.exports = { getActivePortalOwnership, requirePortalOwnership };
