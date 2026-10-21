const { getServiceClient, jsonResponse } = require('./_lib/bookstoreDelivery');
const { hashClaimCode, normalizeEmail, planBundleClaim, planClaimTokenUse } = require('./_lib/academyMembership');

exports.handler = async function academyBundleClaim(event) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' });
  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'invalid_json' });
  }

  const email = normalizeEmail(body.parentEmail);
  const programCode = String(body.programCode || '').trim();
  const claimCode = String(body.claimCode || '').trim();
  const activationToken = String(body.activationToken || '').trim();
  if (!email || !programCode || (!claimCode && !activationToken)) return jsonResponse(400, { error: 'invalid_request' });

  const client = getServiceClient();
  if (!client) return jsonResponse(503, { error: 'claim_not_configured' });

  const programResult = await client
    .from('pilot_programs')
    .select('id, admin_email')
    .eq('program_code', programCode)
    .maybeSingle();
  if (programResult.error || !programResult.data) return jsonResponse(404, { error: 'family_not_found' });
  if (normalizeEmail(programResult.data.admin_email) !== email) return jsonResponse(403, { error: 'email_mismatch' });

  let tokenRow = null;
  let claimResult;
  if (activationToken) {
    const tokenResult = await client
      .from('academy_claim_tokens')
      .select('id, claim_id, purpose, expires_at, used_at')
      .eq('token_hash', hashClaimCode(activationToken))
      .maybeSingle();
    if (tokenResult.error) return jsonResponse(503, { error: 'claim_unavailable' });
    const tokenDecision = planClaimTokenUse({
      tokenRow: tokenResult.data
        ? { purpose: tokenResult.data.purpose, usedAt: tokenResult.data.used_at, expiresAt: tokenResult.data.expires_at }
        : null,
      now: new Date(),
      purpose: 'activation',
    });
    if (!tokenDecision.ok) return jsonResponse(409, { error: tokenDecision.reason, granted: false });
    tokenRow = tokenResult.data;
    claimResult = await client
      .from('academy_bundle_claims')
      .select('id, product_key, customer_email, duration_days, purchase_verified_at, claim_deadline_at, activated_at, entitlement_id, checkout_session_id')
      .eq('id', tokenRow.claim_id)
      .maybeSingle();
  } else {
    claimResult = await client
      .from('academy_bundle_claims')
      .select('id, product_key, customer_email, duration_days, purchase_verified_at, claim_deadline_at, activated_at, entitlement_id, checkout_session_id')
      .eq('claim_code_hash', hashClaimCode(claimCode))
      .maybeSingle();
  }
  if (claimResult.error) return jsonResponse(503, { error: 'claim_unavailable' });
  const claim = claimResult.data;
  if (!claim) return jsonResponse(404, { error: 'claim_not_found' });

  const decision = planBundleClaim({
    order: {
      proof: 'stripe_webhook',
      status: 'paid',
      customerEmail: claim.customer_email,
      productKey: claim.product_key,
      paidAt: claim.purchase_verified_at,
      claimDeadlineAt: claim.claim_deadline_at,
    },
    parentEmail: email,
    existingClaim: claim.activated_at
      ? { activatedAt: claim.activated_at, entitlementId: claim.entitlement_id }
      : null,
  });
  if (!decision.ok) return jsonResponse(409, { error: decision.reason, granted: false });
  if (decision.duplicate) {
    return jsonResponse(200, { granted: true, duplicate: true, progressRetained: true });
  }

  const { data: entitlement, error: insertError } = await client
    .from('academy_entitlements')
    .insert({
      family_program_id: programResult.data.id,
      customer_email: email,
      kind: 'bundle_included',
      status: 'active',
      starts_at: decision.startsAt,
      ends_at: decision.endsAt,
      product_key: claim.product_key,
      order_reference: claim.checkout_session_id,
    })
    .select('id')
    .single();
  if (insertError) return jsonResponse(500, { error: 'claim_not_saved', granted: false });

  const { error: updateError } = await client
    .from('academy_bundle_claims')
    .update({ activated_at: decision.startsAt, entitlement_id: entitlement.id })
    .eq('id', claim.id)
    .is('activated_at', null);
  if (updateError) return jsonResponse(500, { error: 'claim_not_saved', granted: false });
  if (tokenRow) {
    await client.from('academy_claim_tokens').update({ used_at: decision.startsAt }).eq('id', tokenRow.id).is('used_at', null);
  }

  return jsonResponse(200, {
    granted: true,
    duplicate: false,
    startsAt: decision.startsAt,
    endsAt: decision.endsAt,
    progressRetained: true,
  });
};
