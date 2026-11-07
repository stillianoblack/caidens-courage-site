const { sendAcademyClaimEmail } = require('./_lib/emailProvider');
const { jsonResponse, publicSiteOrigin } = require('./_lib/bookstoreDelivery');
const {
  HARDCOVER_BUNDLE_DAYS,
  HARDCOVER_BUNDLE_KEY,
  PAPERBACK_BUNDLE_DAYS,
  PAPERBACK_BUNDLE_KEY,
  createInvitationToken,
  hashClaimCode,
  normalizeEmail,
} = require('./_lib/academyMembership');
const {
  claimLinkOrigin,
  createActivationServiceClient,
  recoveredClaimLocked,
} = require('./_lib/activationPreviewGuard');

const PUBLIC_MESSAGE = 'If an eligible purchase matches this request, a new one-time link is emailed to that purchase email.';
const BUNDLES = {
  paperback: {
    productKey: PAPERBACK_BUNDLE_KEY,
    days: PAPERBACK_BUNDLE_DAYS,
    title: 'Paperback Adventure Bundle',
  },
  hardcover: {
    productKey: HARDCOVER_BUNDLE_KEY,
    days: HARDCOVER_BUNDLE_DAYS,
    title: 'Signature Reserve Hardcover Bundle',
  },
};

function bundleChoice(value) {
  return BUNDLES[String(value || '').trim()] ? String(value).trim() : '';
}

function purchaseDate(value) {
  const date = String(value || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '';
}

function calendarDate(value, timeZone) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(parsed);
}

function purchaseDateMatches(value, date) {
  return calendarDate(value, 'UTC') === date || calendarDate(value, 'America/Los_Angeles') === date;
}

function orderFor(claim, ordersBySession) {
  const sessionId = claim?.checkout_session_id || claim?.checkoutSessionId;
  return sessionId ? ordersBySession.get(sessionId) || null : null;
}

function recoveryClaimEligible(claim, order, now, env) {
  const bundle = Object.values(BUNDLES).find((item) => item.productKey === claim?.product_key);
  if (!bundle || Number(claim.duration_days) !== bundle.days) return false;
  if (claim.activated_at) return false;
  if (recoveredClaimLocked(claim, env)) return false;
  const deadline = new Date(claim.claim_deadline_at).getTime();
  if (!Number.isFinite(deadline) || deadline <= now.getTime()) return false;
  if (!claim.purchase_verified_at) return false;
  return Boolean(order && order.status === 'paid' && order.product_key === claim.product_key);
}

function selectRecoveryClaim(claims, ordersBySession, { bundle, purchaseDate: requestedDate, now, env } = {}) {
  const choice = BUNDLES[bundle];
  if (!choice) return { claim: null };
  const eligible = (claims || []).filter((claim) => (
    claim.product_key === choice.productKey
    && recoveryClaimEligible(claim, orderFor(claim, ordersBySession), now, env)
  ));
  if (eligible.length === 1) return { claim: eligible[0], bundle: choice };
  if (eligible.length < 2 || !requestedDate) return { claim: null };
  const matched = eligible.filter((claim) => purchaseDateMatches(claim.purchase_verified_at, requestedDate));
  if (matched.length !== 1) return { claim: null };
  return { claim: matched[0], bundle: choice };
}

function acknowledged() {
  return jsonResponse(200, { message: PUBLIC_MESSAGE });
}

async function rows(query) {
  const result = await query;
  if (result.error) return null;
  return result.data || [];
}

exports.handler = async function academyBundleRecovery(event) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' });
  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'invalid_json' });
  }
  const email = normalizeEmail(body.email);
  const bundle = bundleChoice(body.bundle);
  if (!email || !bundle) return jsonResponse(400, { error: 'invalid_request' });
  if (body.purchaseDate && !purchaseDate(body.purchaseDate)) {
    return jsonResponse(400, { error: 'invalid_request' });
  }
  const client = createActivationServiceClient();
  if (!client) return acknowledged();

  const claims = await rows(
    client
      .from('academy_bundle_claims')
      .select('id, product_key, duration_days, claim_deadline_at, activated_at, checkout_session_id, purchase_verified_at, customer_email')
      .eq('customer_email', email),
  );
  if (!claims) return acknowledged();
  const sessionIds = claims.map((claim) => claim.checkout_session_id).filter(Boolean);
  const orders = sessionIds.length
    ? await rows(
      client
        .from('bookstore_orders')
        .select('status, product_key, stripe_checkout_session_id')
        .in('stripe_checkout_session_id', sessionIds),
    )
    : [];
  if (!orders) return acknowledged();
  const ordersBySession = new Map(orders.map((order) => [order.stripe_checkout_session_id, order]));
  const selected = selectRecoveryClaim(claims, ordersBySession, {
    bundle,
    purchaseDate: purchaseDate(body.purchaseDate),
    now: new Date(),
    env: process.env,
  });
  if (!selected.claim) return acknowledged();

  const outstanding = await rows(
    client
      .from('academy_claim_tokens')
      .select('id')
      .eq('claim_id', selected.claim.id)
      .eq('purpose', 'invitation')
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString()),
  );
  if (!outstanding || outstanding.length > 0) return acknowledged();

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recent = await client
    .from('academy_claim_tokens')
    .select('id, academy_bundle_claims!inner(customer_email)')
    .eq('purpose', 'invitation')
    .gte('created_at', since)
    .eq('academy_bundle_claims.customer_email', email);
  if (!recent.error && (recent.data || []).length >= 5) return acknowledged();

  const origin = claimLinkOrigin({ publicOrigin: publicSiteOrigin() });
  if (!origin) return jsonResponse(503, { error: 'staging_origin_required', message: PUBLIC_MESSAGE });

  const token = createInvitationToken();
  const inserted = await client.from('academy_claim_tokens').insert({
    claim_id: selected.claim.id,
    purpose: 'invitation',
    token_hash: hashClaimCode(token),
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  }).select('id').single();
  if (inserted.error || !inserted.data?.id) return acknowledged();

  const sent = await sendAcademyClaimEmail({
    to: email,
    claimUrl: `${origin}/story/books/claim#token=${encodeURIComponent(token)}`,
    days: selected.claim.duration_days,
    productTitle: selected.bundle.title,
    idempotencyKey: `academy-bundle-recovery-${selected.claim.id}-${hashClaimCode(token).slice(0, 12)}`,
  });
  if (!sent.success) {
    await client.from('academy_claim_tokens').delete().eq('id', inserted.data.id);
    return jsonResponse(503, { error: 'invitation_email_failed', message: PUBLIC_MESSAGE });
  }
  return acknowledged();
};

exports.PUBLIC_MESSAGE = PUBLIC_MESSAGE;
exports.selectRecoveryClaim = selectRecoveryClaim;
