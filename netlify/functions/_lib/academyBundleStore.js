function unavailable(error) {
  const failure = new Error('claim_unavailable');
  failure.status = 503;
  failure.reason = 'claim_unavailable';
  failure.cause = error;
  return failure;
}

function mapToken(row) {
  if (!row) return null;
  return {
    id: row.id,
    claimId: row.claim_id,
    purpose: row.purpose,
    expiresAt: row.expires_at,
    usedAt: row.used_at,
  };
}

function mapClaim(row) {
  if (!row) return null;
  return {
    id: row.id,
    productKey: row.product_key,
    customerEmail: row.customer_email,
    durationDays: row.duration_days,
    purchaseVerifiedAt: row.purchase_verified_at,
    claimDeadlineAt: row.claim_deadline_at,
    activatedAt: row.activated_at,
    entitlementId: row.entitlement_id,
    checkoutSessionId: row.checkout_session_id,
  };
}

function createSupabaseBundleStore(client) {
  return {
    async tokenByHash(hash) {
      const result = await client
        .from('academy_claim_tokens')
        .select('id, claim_id, purpose, expires_at, used_at')
        .eq('token_hash', hash)
        .maybeSingle();
      if (result.error) throw unavailable(result.error);
      return mapToken(result.data);
    },
    async claimById(id) {
      const result = await client
        .from('academy_bundle_claims')
        .select('id, product_key, customer_email, duration_days, purchase_verified_at, claim_deadline_at, activated_at, entitlement_id, checkout_session_id')
        .eq('id', id)
        .maybeSingle();
      if (result.error) throw unavailable(result.error);
      return mapClaim(result.data);
    },
    async insertActivationToken({ claimId, tokenHash, expiresAt }) {
      const result = await client.from('academy_claim_tokens').insert({
        claim_id: claimId,
        purpose: 'activation',
        token_hash: tokenHash,
        expires_at: expiresAt,
      });
      if (result.error) throw unavailable(result.error);
    },
    async familyByAccessCode(code) {
      const result = await client
        .from('pilot_programs')
        .select('id, admin_email')
        .eq('family_access_code', code)
        .maybeSingle();
      if (result.error) throw unavailable(result.error);
      if (!result.data) return null;
      return { id: result.data.id, adminEmail: result.data.admin_email };
    },
    async orderBySession(sessionId) {
      const result = await client
        .from('bookstore_orders')
        .select('status, product_key')
        .eq('stripe_checkout_session_id', sessionId)
        .maybeSingle();
      if (result.error) throw unavailable(result.error);
      if (!result.data) return null;
      return { status: result.data.status, productKey: result.data.product_key };
    },
    async activeEntitlementForOrder(sessionId) {
      const result = await client
        .from('academy_entitlements')
        .select('id, starts_at, status, kind')
        .eq('order_reference', sessionId)
        .eq('kind', 'bundle_included')
        .neq('status', 'canceled')
        .limit(1);
      if (result.error) throw unavailable(result.error);
      const row = result.data?.[0];
      if (!row) return null;
      return { id: row.id, startsAt: row.starts_at };
    },
    async insertEntitlement(entitlement) {
      const result = await client
        .from('academy_entitlements')
        .insert({
          family_program_id: entitlement.familyProgramId,
          customer_email: entitlement.customerEmail,
          kind: entitlement.kind,
          status: entitlement.status,
          starts_at: entitlement.startsAt,
          ends_at: entitlement.endsAt,
          product_key: entitlement.productKey,
          order_reference: entitlement.orderReference,
        })
        .select('id')
        .single();
      if (result.error) throw unavailable(result.error);
      return { id: result.data.id };
    },
    async activateClaim({ claimId, entitlementId, activatedAt }) {
      const result = await client
        .from('academy_bundle_claims')
        .update({ activated_at: activatedAt, entitlement_id: entitlementId })
        .eq('id', claimId)
        .is('activated_at', null)
        .select('id');
      if (result.error) throw unavailable(result.error);
      return Array.isArray(result.data) && result.data.length > 0;
    },
    async cancelEntitlement(id) {
      const result = await client
        .from('academy_entitlements')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('id', id);
      if (result.error) throw unavailable(result.error);
    },
    async markTokenUsed(id, usedAt) {
      const result = await client
        .from('academy_claim_tokens')
        .update({ used_at: usedAt })
        .eq('id', id)
        .is('used_at', null);
      if (result.error) throw unavailable(result.error);
    },
  };
}

module.exports = { createSupabaseBundleStore };
