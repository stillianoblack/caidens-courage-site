const { getServiceClient, jsonResponse } = require('./_lib/bookstoreDelivery');
const { gateEnabled, normalizeEmail, resolveAcademyAccess } = require('./_lib/academyMembership');

function missingTable(error) {
  const message = String(error?.message || error?.code || '');
  return error?.code === '42P01' || /academy_entitlements|schema cache|does not exist/i.test(message);
}

exports.handler = async function academyMembershipStatus(event) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' });
  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'invalid_json' });
  }

  const open = { enforced: false, allowed: true, reason: 'gate_disabled', progressRetained: true };
  if (!gateEnabled()) return jsonResponse(200, open);

  const cutoff = process.env.ACADEMY_MEMBERSHIP_EXISTING_FAMILY_CUTOFF;
  if (!cutoff) return jsonResponse(200, { ...open, reason: 'cutoff_not_configured' });

  const client = getServiceClient();
  const programCode = String(body.programCode || '').trim();
  if (!client || !programCode) return jsonResponse(200, { ...open, reason: 'program_unresolved' });

  const programResult = await client
    .from('pilot_programs')
    .select('id, program_type, admin_email, created_at')
    .eq('program_code', programCode)
    .maybeSingle();
  if (programResult.error || !programResult.data) {
    return jsonResponse(200, { ...open, reason: 'program_unresolved' });
  }

  const entitlementResult = await client
    .from('academy_entitlements')
    .select('kind, status, starts_at, ends_at, promise_source, transition_started_at')
    .eq('family_program_id', programResult.data.id);
  if (entitlementResult.error) {
    if (missingTable(entitlementResult.error)) return jsonResponse(200, { ...open, reason: 'migration_not_applied' });
    return jsonResponse(503, { error: 'membership_unavailable', progressRetained: true });
  }

  const createdAt = programResult.data.created_at;
  const legacy = createdAt && new Date(createdAt).getTime() < new Date(cutoff).getTime()
    ? { transitionStartedAt: null }
    : null;
  const decision = resolveAcademyAccess({
    gateOn: true,
    programType: programResult.data.program_type,
    entitlements: (entitlementResult.data || []).map((row) => ({
      kind: row.kind,
      status: row.status,
      endsAt: row.ends_at,
      promiseSource: row.promise_source,
    })),
    legacyComplimentary: legacy,
  });
  return jsonResponse(200, {
    ...decision,
    parentEmail: normalizeEmail(programResult.data.admin_email),
  });
};
