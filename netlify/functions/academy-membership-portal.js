const { getServiceClient, jsonResponse, publicSiteOrigin } = require('./_lib/bookstoreDelivery');
const { normalizeEmail, stripeKeyMode } = require('./_lib/academyMembership');

exports.handler = async function academyMembershipPortal(event) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' });
  if (stripeKeyMode(process.env.STRIPE_SECRET_KEY) !== 'test') {
    return jsonResponse(409, { error: 'live_billing_disabled' });
  }
  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'invalid_json' });
  }
  const email = normalizeEmail(body.parentEmail);
  const programCode = String(body.programCode || '').trim();
  const client = getServiceClient();
  if (!client || !email || !programCode) return jsonResponse(400, { error: 'invalid_request' });

  const programResult = await client
    .from('pilot_programs')
    .select('id, admin_email')
    .eq('program_code', programCode)
    .maybeSingle();
  if (!programResult.data || normalizeEmail(programResult.data.admin_email) !== email) {
    return jsonResponse(403, { error: 'email_mismatch' });
  }
  const entitlementResult = await client
    .from('academy_entitlements')
    .select('stripe_customer_id')
    .eq('family_program_id', programResult.data.id)
    .eq('kind', 'subscription')
    .not('stripe_customer_id', 'is', null)
    .limit(1)
    .maybeSingle();
  const customerId = entitlementResult.data?.stripe_customer_id;
  if (!customerId) return jsonResponse(404, { error: 'billing_customer_missing' });

  const form = new URLSearchParams();
  form.set('customer', customerId);
  form.set('return_url', `${publicSiteOrigin()}/portal/family`);
  const response = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form,
  });
  const payload = await response.json();
  if (!response.ok || !payload.url) return jsonResponse(502, { error: 'portal_unavailable' });
  return jsonResponse(200, { url: payload.url });
};
