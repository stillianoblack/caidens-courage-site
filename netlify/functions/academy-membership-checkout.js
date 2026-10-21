const { getServiceClient, jsonResponse, publicSiteOrigin } = require('./_lib/bookstoreDelivery');
const {
  PLANS,
  normalizeEmail,
  planSubscriptionCheckout,
  stripeKeyMode,
} = require('./_lib/academyMembership');

async function retrievePrice(secretKey, priceId) {
  const response = await fetch(`https://api.stripe.com/v1/prices/${encodeURIComponent(priceId)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const payload = await response.json();
  if (!response.ok) {
    const error = new Error('price_lookup_failed');
    error.retryable = response.status >= 500;
    throw error;
  }
  return payload;
}

async function createSubscriptionSession({ secretKey, priceId, email, programId, origin }) {
  const body = new URLSearchParams();
  body.set('mode', 'subscription');
  body.set('line_items[0][price]', priceId);
  body.set('line_items[0][quantity]', '1');
  body.set('customer_email', email);
  body.set('success_url', `${origin}/portal/family?membership=submitted`);
  body.set('cancel_url', `${origin}/portal/family?membership=cancelled`);
  body.set('metadata[purpose]', 'academy_membership');
  body.set('subscription_data[metadata][family_program_id]', programId);
  body.set('subscription_data[metadata][parent_email]', email);
  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  const payload = await response.json();
  if (!response.ok || !payload.url) {
    const error = new Error('checkout_failed');
    error.retryable = response.status >= 500;
    throw error;
  }
  return payload.url;
}

exports.handler = async function academyMembershipCheckout(event) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' });
  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'invalid_json' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKeyMode(secretKey) !== 'test') {
    return jsonResponse(409, {
      error: 'live_billing_disabled',
      message: 'Membership billing stays closed until a Stripe test key is configured.',
    });
  }

  const interval = body.interval === 'year' ? 'year' : body.interval === 'month' ? 'month' : null;
  const plan = interval ? PLANS[interval] : null;
  const email = normalizeEmail(body.parentEmail);
  const programCode = String(body.programCode || '').trim();
  if (!plan || !email || !programCode) return jsonResponse(400, { error: 'invalid_request' });

  const client = getServiceClient();
  if (!client) return jsonResponse(503, { error: 'billing_not_configured' });

  const programResult = await client
    .from('pilot_programs')
    .select('id, program_type, admin_email')
    .eq('program_code', programCode)
    .maybeSingle();
  if (programResult.error || !programResult.data) return jsonResponse(404, { error: 'family_not_found' });
  if (normalizeEmail(programResult.data.admin_email) !== email) {
    return jsonResponse(403, { error: 'email_mismatch' });
  }

  const existing = await client
    .from('academy_entitlements')
    .select('status')
    .eq('family_program_id', programResult.data.id)
    .eq('kind', 'subscription');
  const current = (existing.data || []).find((row) => ['active', 'trialing', 'past_due', 'unpaid'].includes(row.status));

  const planResult = await client
    .from('academy_membership_plans')
    .select('plan_key, stripe_price_id, is_active, amount_cents')
    .eq('plan_key', plan.planKey)
    .maybeSingle();
  if (planResult.error || !planResult.data?.stripe_price_id) {
    return jsonResponse(409, { error: 'plan_not_activated', message: 'Membership checkout is not open yet.' });
  }

  let price;
  try {
    price = await retrievePrice(secretKey, planResult.data.stripe_price_id);
  } catch (error) {
    return jsonResponse(error.retryable ? 503 : 409, { error: 'price_not_verified' });
  }

  const decision = planSubscriptionCheckout({
    secretKey,
    interval,
    price,
    planActive: planResult.data.is_active === true,
    existingSubscription: current || null,
  });
  if (!decision.ok) {
    return jsonResponse(decision.status, {
      error: decision.reason,
      message: decision.reason === 'duplicate_membership'
        ? 'This family already has a membership. Use the billing portal to change it.'
        : 'Membership checkout is not open yet.',
    });
  }

  try {
    const url = await createSubscriptionSession({
      secretKey,
      priceId: decision.priceId,
      email,
      programId: programResult.data.id,
      origin: publicSiteOrigin(),
    });
    return jsonResponse(200, { url, granted: false });
  } catch (error) {
    return jsonResponse(error.retryable ? 503 : 502, { error: 'checkout_failed', granted: false });
  }
};
