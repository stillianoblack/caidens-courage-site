const { getServiceClient, jsonResponse, publicSiteOrigin } = require('./_lib/bookstoreDelivery');
const {
  createInvitationToken,
  hashClaimCode,
  planClaimTokenUse,
} = require('./_lib/academyMembership');

exports.handler = async function academyBundleExchange(event) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' });
  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'invalid_json' });
  }
  const token = String(body.token || '').trim();
  if (!token) return jsonResponse(400, { error: 'invalid_request' });
  const client = getServiceClient();
  if (!client) return jsonResponse(503, { error: 'claim_not_configured' });

  const tokenResult = await client
    .from('academy_claim_tokens')
    .select('id, claim_id, purpose, expires_at, used_at')
    .eq('token_hash', hashClaimCode(token))
    .maybeSingle();
  if (tokenResult.error) return jsonResponse(503, { error: 'claim_unavailable' });
  const decision = planClaimTokenUse({
    tokenRow: tokenResult.data
      ? { purpose: tokenResult.data.purpose, usedAt: tokenResult.data.used_at, expiresAt: tokenResult.data.expires_at }
      : null,
    now: new Date(),
    purpose: 'invitation',
  });
  if (!decision.ok) return jsonResponse(409, { error: decision.reason, granted: false });

  const claimResult = await client
    .from('academy_bundle_claims')
    .select('id, product_key, duration_days, customer_email, activated_at, claim_deadline_at')
    .eq('id', tokenResult.data.claim_id)
    .maybeSingle();
  if (claimResult.error || !claimResult.data) return jsonResponse(404, { error: 'claim_not_found', granted: false });
  if (claimResult.data.activated_at) return jsonResponse(409, { error: 'already_claimed', granted: false });
  if (new Date(claimResult.data.claim_deadline_at).getTime() <= Date.now()) {
    return jsonResponse(409, { error: 'offer_expired', granted: false });
  }

  const activationToken = createInvitationToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  const { error: insertError } = await client.from('academy_claim_tokens').insert({
    claim_id: claimResult.data.id,
    purpose: 'activation',
    token_hash: hashClaimCode(activationToken),
    expires_at: expiresAt,
  });
  if (insertError) return jsonResponse(500, { error: 'claim_not_saved', granted: false });
  await client.from('academy_claim_tokens').update({ used_at: new Date().toISOString() }).eq('id', tokenResult.data.id).is('used_at', null);

  return jsonResponse(200, {
    granted: false,
    activationToken,
    productKey: claimResult.data.product_key,
    days: claimResult.data.duration_days,
    signupPath: '/pilot-program-signup',
    portalPath: '/portal/family',
    origin: publicSiteOrigin(),
  });
};
