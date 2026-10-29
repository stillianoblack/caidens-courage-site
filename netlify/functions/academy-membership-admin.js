const { requireAdmin } = require('./_lib/adminAuth');
const { jsonResponse } = require('./_lib/bookstoreDelivery');
const { planAdminPriceSave, planTransitionEmail, stripeKeyMode } = require('./_lib/academyMembership');

async function retrievePrice(secretKey, priceId) {
  const response = await fetch(`https://api.stripe.com/v1/prices/${encodeURIComponent(priceId)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const payload = await response.json();
  if (!response.ok) return null;
  return payload;
}

exports.handler = async function academyMembershipAdmin(event) {
  const admin = await requireAdmin(event);
  if (admin.response) return admin.response;
  const client = admin.context.supabase;

  if (event.httpMethod === 'GET') {
    const [plans, entitlements, payments, families] = await Promise.all([
      client.from('academy_membership_plans').select('plan_key, display_name, amount_cents, billing_interval, stripe_price_id, is_active'),
      client.from('academy_entitlements').select('kind, status, ends_at, promise_source'),
      client.from('academy_payments').select('amount_paid_cents, currency'),
      client.from('pilot_programs').select('id, created_at').eq('program_type', 'independent_family'),
    ]);
    const missing = [plans.error, entitlements.error, payments.error].some((error) =>
      error && (error.code === '42P01' || /academy_/i.test(error.message || '')));
    if (missing) {
      return jsonResponse(200, {
        migrationApplied: false,
        plans: [],
        activePaidFamilies: 0,
        complimentaryFamilies: families.data?.length || 0,
        expiringAccess: 0,
        cancellations: 0,
        revenueCents: 0,
        transitionEmail: planTransitionEmail(),
      });
    }
    const rows = entitlements.data || [];
    const soon = Date.now() + 14 * 24 * 60 * 60 * 1000;
    return jsonResponse(200, {
      migrationApplied: true,
      plans: plans.data || [],
      activePaidFamilies: rows.filter((row) => row.kind === 'subscription' && row.status === 'active').length,
      complimentaryFamilies: (families.data || []).length,
      preservedPromises: rows.filter((row) => row.kind === 'unrestricted_promise').length,
      expiringAccess: rows.filter((row) => row.ends_at && new Date(row.ends_at).getTime() < soon && row.status === 'active').length,
      cancellations: rows.filter((row) => row.status === 'canceled').length,
      revenueCents: (payments.data || []).reduce((sum, row) => sum + (row.amount_paid_cents || 0), 0),
      transitionEmail: planTransitionEmail(),
    });
  }

  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' });
  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'invalid_json' });
  }
  if (body.entitlement || body.endsAt || body.revoke || body.charge) {
    return jsonResponse(409, { error: 'entitlements_not_editable', message: 'Admin saves cannot change customer access.' });
  }
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKeyMode(secretKey) === 'live') return jsonResponse(409, { error: 'live_billing_disabled' });

  const planResult = await client
    .from('academy_membership_plans')
    .select('plan_key, amount_cents, billing_interval')
    .eq('plan_key', body.planKey)
    .maybeSingle();
  if (!planResult.data) return jsonResponse(404, { error: 'unknown_plan' });
  const stripePrice = await retrievePrice(secretKey, body.stripePriceId);
  const decision = planAdminPriceSave({
    secretKey,
    plan: { planKey: planResult.data.plan_key, interval: planResult.data.billing_interval },
    stripePrice,
    submittedPriceId: body.stripePriceId,
  });
  if (!decision.ok) return jsonResponse(409, { error: decision.reason, changesEntitlements: false });

  const { error } = await client
    .from('academy_membership_plans')
    .update({
      stripe_price_id: decision.stripePriceId,
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('plan_key', planResult.data.plan_key);
  if (error) return jsonResponse(500, { error: 'plan_not_saved' });
  return jsonResponse(200, { saved: true, isActive: false, changesEntitlements: false });
};
