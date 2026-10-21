const crypto = require('crypto');

const MONTHLY_CENTS = 999;
const ANNUAL_CENTS = 9900;
const PAPERBACK_BUNDLE_KEY = 'courage_adventure_paperback_bundle';
const HARDCOVER_BUNDLE_KEY = 'courage_adventure_bundle';
const PAPERBACK_BUNDLE_DAYS = 30;
const HARDCOVER_BUNDLE_DAYS = 90;
const TRANSITION_DAYS = 30;
const UNCLAIMED_OFFER_DAYS = 180;
const ACCESS_STATUSES = new Set(['active', 'trialing']);

const PLANS = {
  month: {
    planKey: 'focus_flame_family_monthly',
    interval: 'month',
    amountCents: MONTHLY_CENTS,
    name: 'Focus Flame Family Monthly',
  },
  year: {
    planKey: 'focus_flame_family_annual',
    interval: 'year',
    amountCents: ANNUAL_CENTS,
    name: 'Focus Flame Family Annual',
  },
};

const PRESERVED_PROMISE_SOURCES = new Set([
  'bundle_copy_without_end_date',
  'founders_guardian_language',
  'historical_preorder_unreviewed',
  'product_page_academy_pill',
]);

function addDays(value, days) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

function normalizeEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  return email || null;
}

function isIndependentFamily(programType) {
  const normalized = String(programType || '').trim().toLowerCase().replace(/\s+/g, '_');
  return normalized === 'independent_family' || normalized === 'independent family';
}

function gateEnabled(env = process.env) {
  return env.ACADEMY_MEMBERSHIP_GATE_ENABLED === 'true';
}

function stripeKeyMode(secretKey) {
  const key = String(secretKey || '');
  if (key.startsWith('sk_test_')) return 'test';
  if (key.startsWith('sk_live_')) return 'live';
  return 'missing';
}

function bundleDurationDays(productKey) {
  if (productKey === PAPERBACK_BUNDLE_KEY) return PAPERBACK_BUNDLE_DAYS;
  if (productKey === HARDCOVER_BUNDLE_KEY) return HARDCOVER_BUNDLE_DAYS;
  return null;
}

function classifyHistoricalPromise(record) {
  if (!record) return { preserve: false, source: null, expiresAt: null };
  const source = record.promiseSource || record.promise_source || null;
  const kind = record.kind || null;
  const unrestricted = kind === 'unrestricted_promise' || PRESERVED_PROMISE_SOURCES.has(source);
  if (!unrestricted) return { preserve: false, source, expiresAt: record.endsAt || record.ends_at || null };
  return { preserve: true, source: source || 'unrestricted_promise', expiresAt: null };
}

function entitlementIsActive(entitlement, now) {
  if (!entitlement) return false;
  if (entitlement.kind === 'unrestricted_promise') return classifyHistoricalPromise(entitlement).preserve;
  if (entitlement.kind === 'subscription') {
    if (!ACCESS_STATUSES.has(entitlement.status)) return false;
  } else if (entitlement.status !== 'active') {
    return false;
  }
  if (!entitlement.endsAt && !entitlement.ends_at) return entitlement.kind === 'unrestricted_promise';
  const endsAt = new Date(entitlement.endsAt || entitlement.ends_at);
  return now.getTime() < endsAt.getTime();
}

function resolveAcademyAccess({
  now = new Date(),
  gateOn = false,
  programType = null,
  entitlements = [],
  legacyComplimentary = null,
} = {}) {
  const progressRetained = true;
  if (!gateOn) {
    return { enforced: false, allowed: true, reason: 'gate_disabled', expiresAt: null, progressRetained };
  }
  if (programType && !isIndependentFamily(programType)) {
    return { enforced: true, allowed: true, reason: 'authorized_program', expiresAt: null, progressRetained };
  }
  const preserved = (entitlements || []).find((item) => classifyHistoricalPromise(item).preserve);
  if (preserved) {
    return {
      enforced: true,
      allowed: true,
      reason: 'preserved_unrestricted_promise',
      expiresAt: null,
      promiseSource: classifyHistoricalPromise(preserved).source,
      progressRetained,
    };
  }
  const active = (entitlements || []).find((item) => entitlementIsActive(item, now));
  if (active) {
    return {
      enforced: true,
      allowed: true,
      reason: active.kind,
      expiresAt: active.endsAt || active.ends_at || null,
      progressRetained,
    };
  }
  if (legacyComplimentary) {
    if (!legacyComplimentary.transitionStartedAt) {
      return { enforced: true, allowed: true, reason: 'complimentary_pending_transition', expiresAt: null, progressRetained };
    }
    const endsAt = addDays(legacyComplimentary.transitionStartedAt, TRANSITION_DAYS);
    if (now.getTime() < endsAt.getTime()) {
      return {
        enforced: true,
        allowed: true,
        reason: 'complimentary_transition',
        expiresAt: endsAt.toISOString(),
        progressRetained,
      };
    }
    return {
      enforced: true,
      allowed: false,
      reason: 'complimentary_transition_ended',
      expiresAt: endsAt.toISOString(),
      progressRetained,
    };
  }
  return { enforced: true, allowed: false, reason: 'membership_required', expiresAt: null, progressRetained };
}

function planSubscriptionCheckout({
  secretKey,
  interval,
  price,
  planActive = false,
  existingSubscription = null,
} = {}) {
  const mode = stripeKeyMode(secretKey);
  if (mode === 'live') return { ok: false, status: 409, reason: 'live_billing_disabled' };
  if (mode !== 'test') return { ok: false, status: 503, reason: 'billing_not_configured' };
  const plan = PLANS[interval];
  if (!plan) return { ok: false, status: 400, reason: 'unknown_plan' };
  if (!planActive) return { ok: false, status: 409, reason: 'plan_not_activated' };
  if (existingSubscription && ['active', 'trialing', 'past_due', 'unpaid'].includes(existingSubscription.status)) {
    return { ok: false, status: 409, reason: 'duplicate_membership' };
  }
  if (!price?.id) return { ok: false, status: 409, reason: 'price_not_verified' };
  if (price.livemode === true) return { ok: false, status: 409, reason: 'live_price_rejected' };
  if (price.unit_amount !== plan.amountCents || String(price.currency || '').toLowerCase() !== 'usd') {
    return { ok: false, status: 409, reason: 'price_mismatch' };
  }
  if (price.recurring?.interval !== plan.interval) return { ok: false, status: 409, reason: 'interval_mismatch' };
  return { ok: true, plan, priceId: price.id };
}

function planSubscriptionState(subscription, expectedPrices = []) {
  const price = subscription?.items?.data?.[0]?.price || subscription?.price || null;
  const expected = expectedPrices.find((item) => item.id === price?.id);
  if (!price || !expected) return { grant: false, reason: 'price_not_approved', progressRetained: true };
  if (price.livemode === true) return { grant: false, reason: 'live_price_rejected', progressRetained: true };
  if (price.unit_amount !== expected.amountCents || String(price.currency || '').toLowerCase() !== 'usd') {
    return { grant: false, reason: 'price_mismatch', progressRetained: true };
  }
  if (price.recurring?.interval !== expected.interval) {
    return { grant: false, reason: 'interval_mismatch', progressRetained: true };
  }
  const status = subscription.status;
  const periodEndSeconds = subscription.current_period_end;
  const endsAt = periodEndSeconds ? new Date(periodEndSeconds * 1000).toISOString() : null;
  const grant = ACCESS_STATUSES.has(status);
  return {
    grant,
    reason: grant ? 'subscription_verified' : `subscription_${status || 'inactive'}`,
    status: status || 'incomplete',
    endsAt,
    cancelAtPeriodEnd: subscription.cancel_at_period_end === true,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id || null,
    stripePriceId: price.id,
    amountCents: expected.amountCents,
    interval: expected.interval,
    progressRetained: true,
  };
}

function planBundleClaim({
  order,
  parentEmail,
  now = new Date(),
  existingClaim = null,
} = {}) {
  const email = normalizeEmail(parentEmail);
  if (!order || order.proof !== 'stripe_webhook' || order.status !== 'paid') {
    return { ok: false, reason: 'purchase_not_verified' };
  }
  if (order.proofSource === 'payment_link_redirect') return { ok: false, reason: 'payment_link_redirect_not_proof' };
  if (!email || normalizeEmail(order.customerEmail) !== email) return { ok: false, reason: 'email_mismatch' };
  const days = bundleDurationDays(order.productKey);
  if (!days) return { ok: false, reason: 'product_has_no_included_access' };
  if (existingClaim?.activatedAt) {
    return { ok: true, duplicate: true, entitlement: existingClaim, progressRetained: true };
  }
  const deadline = new Date(existingClaim?.claimDeadlineAt || order.claimDeadlineAt || addDays(order.paidAt, UNCLAIMED_OFFER_DAYS));
  if (now.getTime() > deadline.getTime()) return { ok: false, reason: 'unclaimed_offer_expired' };
  return {
    ok: true,
    duplicate: false,
    days,
    startsAt: now.toISOString(),
    endsAt: addDays(now, days).toISOString(),
    claimDeadlineAt: deadline.toISOString(),
    progressRetained: true,
  };
}

function planAdminPriceSave({ secretKey, plan, stripePrice, submittedPriceId } = {}) {
  if (stripeKeyMode(secretKey) === 'live') return { ok: false, reason: 'live_billing_disabled' };
  const known = Object.values(PLANS).find((item) => item.planKey === plan?.planKey);
  if (!known) return { ok: false, reason: 'unknown_plan' };
  if (!stripePrice || stripePrice.id !== submittedPriceId) return { ok: false, reason: 'price_not_verified' };
  if (stripePrice.livemode === true) return { ok: false, reason: 'live_price_rejected' };
  if (stripePrice.unit_amount !== known.amountCents || String(stripePrice.currency || '').toLowerCase() !== 'usd') {
    return { ok: false, reason: 'amount_mismatch' };
  }
  if (stripePrice.recurring?.interval !== known.interval) return { ok: false, reason: 'interval_mismatch' };
  return {
    ok: true,
    stripePriceId: stripePrice.id,
    amountCents: known.amountCents,
    changesEntitlements: false,
  };
}

function buildTransitionNotice({ parentFirstName = 'there', expiresOn = null } = {}) {
  return {
    subject: "A note about your family's Focus Flame Academy access",
    transactional: false,
    requiresConsent: true,
    body: [
      `Hi ${parentFirstName},`,
      '',
      'Focus Flame Academy is moving to an optional family membership.',
      'Families who received complimentary access are proposed to keep it for 30 days after a transition start date that has not begun.',
      expiresOn ? `The proposed end date is ${expiresOn}.` : 'No end date is active yet, and nothing has been charged.',
      '',
      'If you would like to continue after that period, you can choose Focus Flame Family for $9.99/month or $99/year.',
      'We will not charge you unless you start a membership.',
      'Families with a documented unrestricted Academy promise keep that access unless they agree to a change.',
      'Your family profile and learning progress stay saved either way.',
      '',
      'This message is a draft. It is not being sent.',
    ].join('\n'),
  };
}

function planTransitionEmail(env = process.env) {
  if (env.ACADEMY_TRANSITION_EMAILS_ENABLED !== 'true') {
    return { send: false, reason: 'transition_emails_disabled' };
  }
  return { send: false, reason: 'sending_requires_a_separate_approval' };
}

function encryptClaimCode(code, secret) {
  if (!secret) return null;
  const key = crypto.createHash('sha256').update(String(secret)).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(String(code), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

function decryptClaimCode(payload, secret) {
  if (!payload || !secret) return null;
  const [ivPart, tagPart, dataPart] = String(payload).split('.');
  if (!ivPart || !tagPart || !dataPart) return null;
  const key = crypto.createHash('sha256').update(String(secret)).digest();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivPart, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(dataPart, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

function approvedShippingRateIds(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.startsWith('shr_'));
}

function planBundleCheckout({
  secretKey,
  salesEnabled,
  emailConfigured,
  product,
  shippingRateIds = [],
}) {
  if (stripeKeyMode(secretKey) === 'live') return { ok: false, status: 409, reason: 'live_billing_disabled' };
  if (stripeKeyMode(secretKey) !== 'test') return { ok: false, status: 503, reason: 'checkout_not_configured' };
  if (salesEnabled !== true) return { ok: false, status: 409, reason: 'bundle_sales_disabled' };
  if (emailConfigured !== true) return { ok: false, status: 409, reason: 'invitation_email_not_configured' };
  if (!product || product.key === 'hardcover_bundle') return { ok: false, status: 409, reason: 'historical_record_locked' };
  const days = bundleDurationDays(product.key);
  if (!days) return { ok: false, status: 404, reason: 'unknown_product' };
  const expected = days === PAPERBACK_BUNDLE_DAYS ? 5999 : 7599;
  if (product.displayPriceCents !== expected || String(product.currency || '').toLowerCase() !== 'usd') {
    return { ok: false, status: 409, reason: 'price_mismatch' };
  }
  if (product.isActive !== true || !String(product.stripePriceId || '').startsWith('price_') || !product.paymentLinkVerifiedAt) {
    return { ok: false, status: 409, reason: 'price_not_verified' };
  }
  const rates = approvedShippingRateIds(Array.isArray(shippingRateIds) ? shippingRateIds.join(',') : shippingRateIds);
  if (!rates.length) return { ok: false, status: 409, reason: 'shipping_not_configured' };
  return {
    ok: true,
    productKey: product.key,
    title: product.title,
    amountCents: expected,
    currency: 'usd',
    days,
    priceId: product.stripePriceId,
    shippingRateIds: rates,
  };
}

function planBundleFulfillment({ session, approvedRates = [] }) {
  if (!session || session.metadata?.purpose !== 'academy_bundle') return { ok: false, reason: 'not_bundle' };
  const productKey = session.metadata.product_key;
  if (productKey === 'hardcover_bundle') return { ok: false, reason: 'historical_record_locked' };
  const days = bundleDurationDays(productKey);
  if (!days) return { ok: false, reason: 'unknown_product' };
  if (session.payment_status !== 'paid') return { ok: false, reason: 'unpaid' };
  if (String(session.currency || '').toLowerCase() !== 'usd') return { ok: false, reason: 'currency_mismatch' };
  const expected = days === PAPERBACK_BUNDLE_DAYS ? 5999 : 7599;
  const line = session.line_items?.data?.[0];
  const price = line && typeof line.price === 'object' ? line.price : null;
  if (!line || line.quantity !== 1 || !price?.id || !String(price.id).startsWith('price_')) {
    return { ok: false, reason: 'price_not_verified' };
  }
  if (price.livemode === true) return { ok: false, reason: 'live_price_rejected' };
  if (price.unit_amount !== expected || String(price.currency || '').toLowerCase() !== 'usd') {
    return { ok: false, reason: 'price_mismatch' };
  }
  if (Number(session.metadata.amount_cents) !== expected) return { ok: false, reason: 'quoted_price_mismatch' };
  if (session.amount_subtotal !== expected) return { ok: false, reason: 'subtotal_mismatch' };
  const taxCents = Number(session.total_details?.amount_tax || 0);
  const shippingCents = Number(session.total_details?.amount_shipping || 0);
  if (!Number.isInteger(taxCents) || taxCents < 0 || !Number.isInteger(shippingCents) || shippingCents < 0) {
    return { ok: false, reason: 'total_mismatch' };
  }
  if (session.amount_total !== expected + taxCents + shippingCents) return { ok: false, reason: 'total_mismatch' };
  const address = session.shipping_details?.address;
  if (!address?.line1 || !address.city || !address.postal_code || !address.country) {
    return { ok: false, reason: 'shipping_address_missing' };
  }
  const rawRate = session.shipping_cost?.shipping_rate;
  const rateId = typeof rawRate === 'string' ? rawRate : rawRate?.id;
  if (!rateId || !String(rateId).startsWith('shr_')) return { ok: false, reason: 'shipping_method_missing' };
  if (approvedRates.length && !approvedRates.includes(rateId)) return { ok: false, reason: 'shipping_method_not_approved' };
  const customerEmail = normalizeEmail(session.customer_details?.email || session.customer_email);
  if (!customerEmail) return { ok: false, reason: 'missing_customer_email' };
  return {
    ok: true,
    productKey,
    days,
    amountCents: expected,
    taxCents,
    shippingCents,
    totalCents: session.amount_total,
    currency: 'usd',
    customerEmail,
    shipping: {
      name: session.shipping_details?.name || '',
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      state: address.state || '',
      postalCode: address.postal_code,
      country: address.country,
      rateId,
      methodLabel: (typeof rawRate === 'object' && rawRate.display_name) || 'Shipping',
    },
  };
}

function planClaimTokenUse({ tokenRow, now, purpose }) {
  if (!tokenRow || tokenRow.purpose !== purpose) return { ok: false, reason: 'token_invalid' };
  if (tokenRow.usedAt) return { ok: false, reason: 'token_used' };
  if (!tokenRow.expiresAt || new Date(tokenRow.expiresAt).getTime() <= now.getTime()) {
    return { ok: false, reason: 'token_expired' };
  }
  return { ok: true };
}

function createInvitationToken() {
  return crypto.randomBytes(24).toString('base64url');
}

async function fulfillVerifiedBundlePurchase({
  event,
  session,
  store,
  mailer,
  now = new Date(),
  origin,
  tokenTtlSeconds = 1800,
  approvedRates = [],
}) {
  if (!event?.id || !event.type) return { httpStatus: 400, outcome: 'invalid_event', granted: false };
  if (await store.hasEvent(event.id)) return { httpStatus: 200, outcome: 'duplicate', granted: false };

  if (event.type === 'checkout.session.async_payment_failed' || event.type === 'checkout.session.expired') {
    if (session?.metadata?.purpose !== 'academy_bundle') {
      return { httpStatus: 200, outcome: 'not_applicable', granted: false };
    }
    if (store.markBundleOrderStatus) {
      await store.markBundleOrderStatus({ sessionId: session.id, status: event.type === 'checkout.session.expired' ? 'expired' : 'failed' });
    }
    await store.recordEvent(event.id, event.type, 'payment_not_completed');
    return { httpStatus: 200, outcome: 'payment_not_completed', granted: false };
  }

  const decision = planBundleFulfillment({ session, approvedRates });
  if (!decision.ok) {
    if (decision.reason === 'not_bundle') return { httpStatus: 200, outcome: 'not_applicable', granted: false };
    await store.recordEvent(event.id, event.type, decision.reason);
    return { httpStatus: 200, outcome: decision.reason, granted: false };
  }

  const order = await store.saveBundleOrder({
    sessionId: session.id,
    paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null,
    productKey: decision.productKey,
    title: session.metadata.product_title || decision.productKey,
    amountCents: decision.totalCents,
    currency: 'usd',
    customerEmail: decision.customerEmail,
    status: 'paid',
  });
  await store.saveFulfillment({
    orderId: order.id,
    sessionId: session.id,
    ...decision.shipping,
    shippingCents: decision.shippingCents,
    taxCents: decision.taxCents,
    subtotalCents: decision.amountCents,
    fulfillmentStatus: 'unfulfilled',
  });
  let claim = await store.findClaimBySession(session.id);
  const token = createInvitationToken();
  const tokenHash = hashClaimCode(token);
  if (!claim) {
    claim = await store.saveBundleOffer({
      checkoutSessionId: session.id,
      productKey: decision.productKey,
      customerEmail: decision.customerEmail,
      amountCents: decision.amountCents,
      claimCodeHash: tokenHash,
      durationDays: decision.days,
      paidAt: now.toISOString(),
      claimDeadlineAt: addDays(now, UNCLAIMED_OFFER_DAYS).toISOString(),
      proof: 'stripe_webhook',
    });
  }
  if (claim.activatedAt) {
    await store.recordEvent(event.id, event.type, 'already_claimed');
    return { httpStatus: 200, outcome: 'already_claimed', granted: false };
  }
  if (claim.invitationSentAt) {
    await store.recordEvent(event.id, event.type, 'invitation_already_sent');
    return { httpStatus: 200, outcome: 'duplicate', granted: false };
  }

  const expiresAt = new Date(now.getTime() + tokenTtlSeconds * 1000).toISOString();
  await store.saveClaimToken({
    claimId: claim.id,
    purpose: 'invitation',
    tokenHash,
    expiresAt,
  });
  const claimUrl = `${String(origin || '').replace(/\/$/, '')}/story/books/claim#token=${encodeURIComponent(token)}`;
  const sent = await mailer.send({
    to: decision.customerEmail,
    claimUrl,
    days: decision.days,
    productTitle: session.metadata.product_title || 'Courage Adventure Bundle',
    idempotencyKey: `academy-bundle-${session.id}`,
  });
  if (!sent?.success) {
    const error = new Error('invitation_email_failed');
    error.retryable = true;
    throw error;
  }
  await store.markInvitationSent(claim.id, now.toISOString());
  await store.recordEvent(event.id, event.type, 'invitation_sent');
  return { httpStatus: 200, outcome: 'invitation_sent', granted: false, claimUrl };
}

function createClaimCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(10);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
}

function hashClaimCode(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex');
}

async function processAcademyWebhookEvent({
  event,
  store,
  stripe,
  expectedPrices = [],
  now = new Date(),
  claimCodeSecret = null,
}) {
  if (!event?.id || !event.type) return { httpStatus: 400, outcome: 'invalid_event', granted: false };
  if (await store.hasEvent(event.id)) return { httpStatus: 200, outcome: 'duplicate', granted: false };

  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    let subscription = event.data?.object;
    if (stripe?.retrieveSubscription && subscription?.id) {
      subscription = await stripe.retrieveSubscription(subscription.id);
    }
    const decision = planSubscriptionState(subscription, expectedPrices);
    await store.saveSubscription({ ...decision, metadata: subscription?.metadata || {}, now: now.toISOString() });
    await store.recordEvent(event.id, event.type, decision.reason);
    return { httpStatus: 200, outcome: decision.reason, granted: decision.grant === true };
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data?.object || {};
    await store.markPaymentFailed({
      stripeSubscriptionId: invoice.subscription || null,
      stripeInvoiceId: invoice.id || null,
    });
    await store.recordEvent(event.id, event.type, 'payment_failed');
    return { httpStatus: 200, outcome: 'payment_failed', granted: false };
  }

  if (event.type === 'invoice.paid') {
    const invoice = event.data?.object || {};
    if (invoice.amount_paid > 0 && invoice.id) {
      await store.recordPayment({
        stripeInvoiceId: invoice.id,
        stripeSubscriptionId: invoice.subscription || null,
        amountPaidCents: invoice.amount_paid,
        currency: invoice.currency || 'usd',
        paidAt: now.toISOString(),
      });
    }
    await store.recordEvent(event.id, event.type, 'payment_recorded');
    return { httpStatus: 200, outcome: 'payment_recorded', granted: false };
  }

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_failed' || event.type === 'checkout.session.expired') {
    const session = event.data?.object;
    if (session?.metadata?.purpose !== 'academy_bundle') {
      return { httpStatus: 200, outcome: 'not_applicable', granted: false };
    }
    const verified = stripe?.retrieveCheckoutSession ? await stripe.retrieveCheckoutSession(session.id) : session;
    return fulfillVerifiedBundlePurchase({
      event,
      session: verified,
      store,
      mailer: stripe?.mailer,
      now,
      origin: stripe?.origin,
      approvedRates: stripe?.approvedRates || [],
      claimCodeSecret,
    });
  }

  return { httpStatus: 200, outcome: 'not_applicable', granted: false };
}

module.exports = {
  MONTHLY_CENTS,
  ANNUAL_CENTS,
  PAPERBACK_BUNDLE_KEY,
  HARDCOVER_BUNDLE_KEY,
  PAPERBACK_BUNDLE_DAYS,
  HARDCOVER_BUNDLE_DAYS,
  TRANSITION_DAYS,
  UNCLAIMED_OFFER_DAYS,
  PLANS,
  PRESERVED_PROMISE_SOURCES,
  addDays,
  normalizeEmail,
  isIndependentFamily,
  gateEnabled,
  stripeKeyMode,
  bundleDurationDays,
  classifyHistoricalPromise,
  resolveAcademyAccess,
  planSubscriptionCheckout,
  planSubscriptionState,
  planBundleClaim,
  planAdminPriceSave,
  buildTransitionNotice,
  planTransitionEmail,
  approvedShippingRateIds,
  planBundleCheckout,
  planBundleFulfillment,
  planClaimTokenUse,
  createInvitationToken,
  fulfillVerifiedBundlePurchase,
  createClaimCode,
  hashClaimCode,
  encryptClaimCode,
  decryptClaimCode,
  processAcademyWebhookEvent,
};
