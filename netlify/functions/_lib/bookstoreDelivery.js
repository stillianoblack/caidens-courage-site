const crypto = require('crypto');

const DIGITAL_PRODUCT_KEY = 'digital_edition';
const DIGITAL_BUCKET = 'digital-books';
const HISTORICAL_BUNDLE_KEY = 'hardcover_bundle';
const HISTORICAL_PAPERBACK_LINK = 'https://buy.stripe.com/6oU5kCeiz4pO2W3gk03Ru03';
const REQUIRED_CURRENCY = 'usd';
const RECOVERY_PUBLIC_MESSAGE =
  'If this email has a digital purchase, we sent a one-time download link. It expires soon and works once.';
const RECOVERY_EMAIL_LIMIT = 5;
const RECOVERY_IP_LIMIT = 20;
const RECOVERY_WINDOW_MS = 60 * 60 * 1000;
const HANDLED_EVENTS = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
  'checkout.session.expired',
  'charge.refunded',
  'refund.created',
  'refund.updated',
]);

const CUSTOMER_MESSAGES = {
  unauthorized: 'We could not verify this download.',
  missing_file:
    'Your payment is confirmed, but the EPUB has not been added to the private library yet. You can return to My Books when the file is ready.',
  digital_sales_disabled: 'Digital sales are not open yet.',
  payment_not_verified: 'Payment has not been verified.',
  price_not_configured: 'Digital checkout is not configured yet.',
};

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function hashRecoveryCode(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex');
}

function createRecoveryCode() {
  return crypto.randomBytes(24).toString('base64url');
}

function normalizeEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  return email || null;
}

function paymentIntentId(session) {
  if (!session?.payment_intent) return null;
  return typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent.id || null;
}

function isSafeObjectPath(objectPath) {
  if (!objectPath || typeof objectPath !== 'string') return false;
  const path = objectPath.trim();
  if (!path || path.startsWith('/') || path.includes('\\') || path.includes('..')) return false;
  if (/^https?:/i.test(path)) return false;
  return true;
}

function resolveDownloadTtl(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 120;
  return Math.min(300, Math.max(30, Math.floor(parsed)));
}

function resolveRecoveryTtl(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1800;
  return Math.min(3600, Math.max(300, Math.floor(parsed)));
}

function retryableError(message) {
  const error = new Error(message);
  error.retryable = true;
  return error;
}

function verifyStripeSignature(rawBody, header, secret, toleranceSeconds = 300, nowMs = Date.now()) {
  if (!rawBody || !header || !secret) return false;
  const parts = String(header)
    .split(',')
    .map((part) => part.trim().split('='));
  const timestamp = parts.find((part) => part[0] === 't')?.[1];
  const signatures = parts.filter((part) => part[0] === 'v1').map((part) => part[1]).filter(Boolean);
  if (!timestamp || signatures.length === 0) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(nowMs / 1000 - ts) > toleranceSeconds) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  return signatures.some((signature) => safeEqual(signature, expected));
}

function planDigitalCheckout({ envEnabled, emailConfigured, product }) {
  if (envEnabled !== true || emailConfigured !== true) {
    return { ok: false, status: 403, reason: 'digital_sales_disabled' };
  }
  if (!product || product.key !== DIGITAL_PRODUCT_KEY) {
    return { ok: false, status: 404, reason: 'unknown_product' };
  }
  if (product.digitalSalesEnabled !== true) {
    return { ok: false, status: 403, reason: 'digital_sales_disabled' };
  }
  if (!product.stripePriceId || !String(product.stripePriceId).startsWith('price_')) {
    return { ok: false, status: 409, reason: 'price_not_configured' };
  }
  if (!Number.isInteger(product.displayPriceCents) || product.displayPriceCents <= 0) {
    return { ok: false, status: 409, reason: 'price_not_configured' };
  }
  if (String(product.currency || '').toLowerCase() !== REQUIRED_CURRENCY) {
    return { ok: false, status: 409, reason: 'price_not_configured' };
  }
  return {
    ok: true,
    priceId: product.stripePriceId,
    amountCents: product.displayPriceCents,
    currency: REQUIRED_CURRENCY,
    title: product.title,
    productKey: product.key,
  };
}

function planDigitalFulfillment({ session, intent }) {
  if (!session || !intent) return { grant: false, retryable: false, reason: 'missing_purchase' };
  if (session.id !== intent.stripeCheckoutSessionId) return { grant: false, retryable: false, reason: 'session_mismatch' };
  if (session.metadata?.product_key !== DIGITAL_PRODUCT_KEY) return { grant: false, retryable: false, reason: 'not_digital' };
  if (session.metadata.product_key !== intent.productKey) return { grant: false, retryable: false, reason: 'product_mismatch' };
  const sessionCurrency = String(session.currency || '').toLowerCase();
  const intentCurrency = String(intent.currency || '').toLowerCase();
  if (intentCurrency !== REQUIRED_CURRENCY || sessionCurrency !== intentCurrency) {
    return { grant: false, retryable: false, reason: 'currency_mismatch' };
  }
  const quoted = Number(session.metadata.amount_cents);
  if (!Number.isInteger(quoted) || quoted !== intent.amountCents) {
    return { grant: false, retryable: false, reason: 'quoted_price_mismatch' };
  }
  if (session.amount_total !== quoted) return { grant: false, retryable: false, reason: 'paid_price_mismatch' };
  if (session.payment_status !== 'paid') return { grant: false, retryable: false, reason: 'unpaid' };
  const customerEmail = normalizeEmail(session.customer_details?.email || session.customer_email);
  if (!customerEmail) return { grant: false, retryable: false, reason: 'missing_customer_email' };
  return {
    grant: true,
    retryable: false,
    reason: 'granted',
    order: {
      productKey: intent.productKey,
      productTitleSnapshot: intent.productTitleSnapshot,
      amountCents: session.amount_total,
      currency: REQUIRED_CURRENCY,
      customerEmail,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: paymentIntentId(session),
      status: 'paid',
    },
  };
}

function verifyCheckoutProof({ intent, lineItems, price }) {
  const items = Array.isArray(lineItems) ? lineItems : [];
  if (items.length !== 1) return { ok: false, reason: 'line_item_mismatch' };
  const item = items[0];
  if (item.quantity !== 1) return { ok: false, reason: 'quantity_mismatch' };
  const priceId = typeof item.price === 'string' ? item.price : item.price?.id;
  if (!intent?.stripePriceId || priceId !== intent.stripePriceId) return { ok: false, reason: 'price_identity_mismatch' };
  if (!price || price.id !== intent.stripePriceId) return { ok: false, reason: 'price_not_verified' };
  if (price.active === false) return { ok: false, reason: 'price_inactive' };
  if (String(price.currency || '').toLowerCase() !== REQUIRED_CURRENCY) return { ok: false, reason: 'currency_mismatch' };
  if (price.unit_amount !== intent.amountCents) return { ok: false, reason: 'price_amount_mismatch' };
  const lineCurrency = String(item.currency || price.currency || '').toLowerCase();
  if (lineCurrency !== REQUIRED_CURRENCY) return { ok: false, reason: 'currency_mismatch' };
  if (Number(item.amount_total) !== intent.amountCents) return { ok: false, reason: 'paid_price_mismatch' };
  return { ok: true };
}

function verifyConfiguredPrice({ price, priceId, amountCents }) {
  if (!price || price.id !== priceId) return { ok: false, reason: 'price_not_verified' };
  if (price.active === false) return { ok: false, reason: 'price_inactive' };
  if (String(price.currency || '').toLowerCase() !== REQUIRED_CURRENCY) return { ok: false, reason: 'currency_mismatch' };
  if (price.unit_amount !== amountCents) return { ok: false, reason: 'price_amount_mismatch' };
  return { ok: true };
}

function verifyPaymentLinkProof({ displayPriceCents, proof }) {
  const items = proof?.lineItems || proof?.line_items?.data || [];
  if (items.length !== 1) return { ok: false, reason: 'line_item_mismatch' };
  const item = items[0];
  if (item.quantity !== 1) return { ok: false, reason: 'quantity_mismatch' };
  const price = item.price;
  if (!price || typeof price === 'string') return { ok: false, reason: 'payment_link_not_verified' };
  if (price.active === false) return { ok: false, reason: 'price_inactive' };
  if (String(price.currency || '').toLowerCase() !== REQUIRED_CURRENCY) return { ok: false, reason: 'currency_mismatch' };
  if (price.unit_amount !== displayPriceCents) return { ok: false, reason: 'payment_link_price_mismatch' };
  if (!String(price.id || '').startsWith('price_')) return { ok: false, reason: 'payment_link_not_verified' };
  return { ok: true, priceId: price.id };
}

function planPaymentLinkActivation({
  key,
  displayPriceCents,
  currency,
  paymentLinkUrl,
  isActive,
  current,
  proof,
}) {
  if (key === HISTORICAL_BUNDLE_KEY) return { ok: false, reason: 'historical_record_locked' };
  const url = String(paymentLinkUrl || '').trim();
  const currencyCode = String(currency || '').toLowerCase();
  const linkChanged = !current || (current.paymentLinkUrl || '') !== url;
  const priceChanged = !current
    || current.displayPriceCents !== displayPriceCents
    || String(current.currency || '').toLowerCase() !== currencyCode;
  const activationChanged = !current || current.isActive !== isActive;
  if (!isActive && !url) return { ok: true, verificationRequired: false };
  if (!linkChanged && !priceChanged && !activationChanged) return { ok: true, verificationRequired: false };
  if (!isActive && !linkChanged && !priceChanged) return { ok: true, verificationRequired: false };
  if (!url || !url.startsWith('https://buy.stripe.com/')) return { ok: false, reason: 'invalid_payment_link' };
  if (currencyCode !== REQUIRED_CURRENCY) return { ok: false, reason: 'currency_mismatch' };
  if (!proof) return { ok: false, reason: 'payment_link_not_verified' };
  const check = verifyPaymentLinkProof({ displayPriceCents, proof });
  if (!check.ok) return check;
  return { ok: true, verificationRequired: true, verifiedPriceId: check.priceId };
}

function planRefundAction({ order, charge }) {
  if (!order) return { revoke: false, reason: 'ignored_unrelated' };
  if (!charge?.id) return { revoke: false, reason: 'refund_not_verified' };
  const chargeIntent = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
  if (order.stripePaymentIntentId && chargeIntent && chargeIntent !== order.stripePaymentIntentId) {
    return { revoke: false, reason: 'ignored_unrelated' };
  }
  const currency = String(charge.currency || '').toLowerCase();
  if (currency !== REQUIRED_CURRENCY || currency !== String(order.currency || '').toLowerCase()) {
    return { revoke: false, reason: 'refund_currency_mismatch', amountRefunded: Number(charge.amount_refunded) || 0 };
  }
  const amountRefunded = Number(charge.amount_refunded);
  const full = charge.refunded === true && Number.isInteger(amountRefunded) && amountRefunded >= order.amountCents && order.amountCents > 0;
  if (!full) {
    return {
      revoke: false,
      reason: amountRefunded > 0 ? 'partial_refund' : 'refund_pending',
      amountRefunded: Number.isInteger(amountRefunded) ? amountRefunded : 0,
    };
  }
  return { revoke: true, reason: 'full_refund', amountRefunded };
}

function authorizeDownload({ entitlement, file, email, tokenAuthenticated }) {
  if (!entitlement || entitlement.status !== 'active') {
    return { ok: false, status: 403, reason: 'unauthorized' };
  }
  if (tokenAuthenticated !== true) return { ok: false, status: 403, reason: 'unauthorized' };
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || normalizedEmail !== normalizeEmail(entitlement.customerEmail)) {
    return { ok: false, status: 403, reason: 'unauthorized' };
  }
  if (file && file.productKey !== entitlement.productKey) {
    return { ok: false, status: 403, reason: 'unauthorized' };
  }
  if (!file || !isSafeObjectPath(file.objectPath)) {
    return { ok: false, status: 409, reason: 'missing_file' };
  }
  return {
    ok: true,
    bucket: file.bucketId || DIGITAL_BUCKET,
    objectPath: file.objectPath.trim(),
    productKey: entitlement.productKey,
  };
}

function failedOrderFrom(session, intent, status = 'failed') {
  return {
    productKey: intent.productKey,
    productTitleSnapshot: intent.productTitleSnapshot,
    amountCents: Number.isInteger(session.amount_total) ? session.amount_total : intent.amountCents,
    currency: intent.currency,
    customerEmail: normalizeEmail(session.customer_details?.email || session.customer_email),
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: paymentIntentId(session),
    status,
  };
}

async function fulfillPaidSession({ session, store, stripe }) {
  const intent = session?.id ? await store.getIntentBySession(session.id) : null;
  const plan = planDigitalFulfillment({ session, intent });
  if (!plan.grant) {
    if (intent && session?.id && (plan.reason === 'unpaid' || plan.reason === 'expired')) {
      await store.saveOrder(failedOrderFrom(session, intent, plan.reason === 'expired' ? 'expired' : 'failed'));
    }
    return { granted: false, retryable: false, reason: plan.reason };
  }
  if (!stripe?.retrieveCheckoutProof) return { granted: false, retryable: true, reason: 'stripe_unavailable' };
  let proof;
  try {
    proof = await stripe.retrieveCheckoutProof(session.id);
  } catch (error) {
    if (error?.retryable) return { granted: false, retryable: true, reason: 'stripe_unavailable' };
    return { granted: false, retryable: false, reason: 'price_not_verified' };
  }
  const priceCheck = verifyCheckoutProof({ intent, lineItems: proof?.lineItems, price: proof?.price });
  if (!priceCheck.ok) return { granted: false, retryable: false, reason: priceCheck.reason };
  const order = await store.saveOrder({ ...plan.order, stripeChargeId: proof.chargeId || null });
  const entitlement = await store.saveEntitlement({
    orderId: order.id,
    productKey: plan.order.productKey,
    customerEmail: plan.order.customerEmail,
    recoveryCodeHash: intent.recoveryCodeHash,
    checkoutSessionId: session.id,
    status: 'active',
  });
  return { granted: true, retryable: false, reason: 'granted', order, entitlement };
}

const RECOVERY_EMAIL_LEASE_MS = 2 * 60 * 1000;

async function deliverRecoveryLink({ store, mailer, origin, email, now = Date.now(), ttlSeconds = 1800, idempotencyKey }) {
  const normalized = normalizeEmail(email);
  if (!normalized || !mailer?.send) throw retryableError('recovery_email_unavailable');
  const token = createRecoveryCode();
  const downloadPageUrl = `${String(origin || '').replace(/\/$/, '')}/story/books/download#token=${encodeURIComponent(token)}`;
  if (!downloadPageUrl.startsWith('https://') && !downloadPageUrl.startsWith('http://')) {
    throw retryableError('recovery_email_unavailable');
  }
  if (/storage|digital-books|supabase\.co/i.test(downloadPageUrl)) throw retryableError('recovery_email_unavailable');
  await store.saveRecoveryToken({
    tokenHash: hashRecoveryCode(token),
    customerEmail: normalized,
    expiresAt: new Date(now + ttlSeconds * 1000).toISOString(),
  });
  const result = await mailer.send({ to: normalized, downloadPageUrl, idempotencyKey });
  if (!result?.success) throw retryableError('recovery_email_failed');
  return { ok: true };
}

async function ensurePurchaseRecoveryEmail({ store, mailer, origin, order, now = Date.now(), ttlSeconds = 1800 }) {
  if (!order?.id || !order.customerEmail) throw retryableError('recovery_email_unavailable');
  const existing = await store.getRecoveryDelivery(order.id);
  if (existing?.status === 'sent') return { ok: true, skipped: true };
  if (existing?.status === 'sending' && now - existing.updatedAt < RECOVERY_EMAIL_LEASE_MS) {
    return { ok: false, retryable: true, reason: 'recovery_email_in_progress' };
  }
  const attempt = existing?.status === 'sending' ? existing.attempt : (existing?.attempt || 0) + 1;
  await store.saveRecoveryDelivery({
    orderId: order.id,
    status: 'sending',
    attempt,
    sentAt: null,
    updatedAt: now,
  });
  try {
    await deliverRecoveryLink({
      store,
      mailer,
      origin,
      email: order.customerEmail,
      now,
      ttlSeconds,
      idempotencyKey: `bookstore-recovery-${order.id}-${attempt}`,
    });
  } catch (error) {
    await store.saveRecoveryDelivery({
      orderId: order.id,
      status: 'failed',
      attempt,
      sentAt: null,
      updatedAt: now,
    });
    if (error?.retryable) return { ok: false, retryable: true, reason: error.message || 'recovery_email_failed' };
    throw error;
  }
  await store.saveRecoveryDelivery({
    orderId: order.id,
    status: 'sent',
    attempt,
    sentAt: new Date(now).toISOString(),
    updatedAt: now,
  });
  return { ok: true, skipped: false };
}

async function handleExpiredSession({ session, store }) {
  if (!session?.id || session.metadata?.product_key !== DIGITAL_PRODUCT_KEY) {
    return { granted: false, retryable: false, reason: 'ignored_unrelated' };
  }
  const existing = await store.getOrderBySession(session.id);
  if (existing && (existing.status === 'paid' || existing.status === 'refunded')) {
    return { granted: false, retryable: false, reason: 'ignored_paid_session' };
  }
  const intent = await store.getIntentBySession(session.id);
  if (!intent) return { granted: false, retryable: false, reason: 'ignored_unrelated' };
  await store.saveOrder(failedOrderFrom({ ...session, payment_status: 'unpaid' }, intent, 'expired'));
  return { granted: false, retryable: false, reason: 'expired' };
}

function refundAuditId(eventObject, charge, plan) {
  if (eventObject?.object === 'refund' && eventObject.id) return eventObject.id;
  const latest = charge?.refunds?.data?.[0]?.id;
  if (latest) return latest;
  return `charge:${charge.id}:${plan.revoke ? 'full' : charge.amount_refunded}`;
}

async function handleRefundEvent({ event, store, stripe }) {
  const eventObject = event.data?.object;
  if (!eventObject) return { granted: false, retryable: false, reason: 'ignored_unrelated' };
  if (eventObject.object === 'refund' && eventObject.status && eventObject.status !== 'succeeded' && eventObject.status !== 'pending') {
    return { granted: false, retryable: false, reason: 'refund_ignored' };
  }
  const paymentIntent = typeof eventObject.payment_intent === 'string'
    ? eventObject.payment_intent
    : eventObject.payment_intent?.id;
  const chargeId = eventObject.object === 'charge' ? eventObject.id : eventObject.charge;
  const order = (paymentIntent && await store.getOrderByPaymentIntent(paymentIntent))
    || (chargeId && await store.getOrderByCharge(chargeId))
    || null;
  if (!order) return { granted: false, retryable: false, reason: 'ignored_unrelated' };
  if (!stripe?.retrieveCharge || !chargeId) return { granted: false, retryable: true, reason: 'stripe_unavailable' };
  let charge;
  try {
    charge = await stripe.retrieveCharge(chargeId);
  } catch (error) {
    if (error?.retryable) return { granted: false, retryable: true, reason: 'stripe_unavailable' };
    return { granted: false, retryable: false, reason: 'refund_not_verified' };
  }
  const plan = planRefundAction({ order, charge });
  if (plan.reason === 'ignored_unrelated') return { granted: false, retryable: false, reason: plan.reason };
  await store.recordRefund({
    stripeRefundId: refundAuditId(eventObject, charge, plan),
    stripeChargeId: charge.id,
    stripePaymentIntentId: order.stripePaymentIntentId,
    orderId: order.id,
    amountCents: plan.amountRefunded,
    currency: String(charge.currency || order.currency || REQUIRED_CURRENCY).toLowerCase(),
    status: plan.revoke ? 'succeeded' : plan.reason,
    fullRefund: plan.revoke === true,
  });
  if (!plan.revoke) return { granted: false, revoked: false, retryable: false, reason: plan.reason };
  await store.markOrderRefunded(order.id, { amountRefunded: plan.amountRefunded, chargeId: charge.id });
  await store.revokeEntitlementForOrder(order.id, 'full_refund');
  return { granted: false, revoked: true, retryable: false, reason: 'full_refund' };
}

async function processBookstoreWebhookEvent({ event, store, stripe, mailer, origin, now = Date.now(), recoveryTtlSeconds = 1800 }) {
  if (!event?.id || !event.type) return { httpStatus: 400, outcome: 'invalid_event', granted: false };
  if (!HANDLED_EVENTS.has(event.type)) return { httpStatus: 200, outcome: 'ignored', granted: false };
  if (await store.hasEvent(event.id)) return { httpStatus: 200, outcome: 'duplicate', granted: false };

  try {
    let result;
    if (event.type === 'checkout.session.expired') {
      result = await handleExpiredSession({ session: event.data?.object, store });
    } else if (event.type === 'charge.refunded' || event.type === 'refund.created' || event.type === 'refund.updated') {
      result = await handleRefundEvent({ event, store, stripe });
    } else {
      const session = event.data?.object;
      if (!session || session.metadata?.product_key !== DIGITAL_PRODUCT_KEY) {
        await store.recordEvent(event.id, event.type, 'ignored_unrelated');
        return { httpStatus: 200, outcome: 'ignored_unrelated', granted: false };
      }
      result = await fulfillPaidSession({ session, store, stripe });
      if (result.granted) {
        const emailResult = await ensurePurchaseRecoveryEmail({
          store,
          mailer,
          origin,
          order: result.order,
          now,
          ttlSeconds: recoveryTtlSeconds,
        });
        if (!emailResult.ok) {
          return { httpStatus: 500, outcome: emailResult.reason, granted: false };
        }
      }
    }
    if (result.retryable) return { httpStatus: 500, outcome: result.reason, granted: false };
    await store.recordEvent(event.id, event.type, result.reason);
    return {
      httpStatus: 200,
      outcome: result.reason,
      granted: result.granted === true,
      revoked: result.revoked === true,
    };
  } catch (error) {
    if (error?.retryable) return { httpStatus: 500, outcome: error.message || 'retryable_failure', granted: false };
    throw error;
  }
}

async function resolveDigitalDownload({ entitlement, file, email, tokenAuthenticated, signer, ttlSeconds }) {
  const decision = authorizeDownload({ entitlement, file, email, tokenAuthenticated });
  if (!decision.ok) {
    return {
      statusCode: decision.status,
      body: { error: decision.reason, message: CUSTOMER_MESSAGES[decision.reason] },
    };
  }
  const downloadUrl = await signer({
    bucket: decision.bucket,
    objectPath: decision.objectPath,
    ttlSeconds,
  });
  return {
    statusCode: 200,
    body: {
      status: 'ready',
      downloadUrl,
      cta: 'Download Your Book',
      expiresIn: ttlSeconds,
      productKey: decision.productKey,
    },
  };
}

async function requestBookstoreRecovery({ email, ip, store, mailer, origin, now = Date.now(), ttlSeconds = 1800 }) {
  const normalized = normalizeEmail(email);
  const body = { message: RECOVERY_PUBLIC_MESSAGE };
  if (!normalized) return { statusCode: 200, body };
  const emailHash = hashRecoveryCode(`email:${normalized}`);
  const ipHash = hashRecoveryCode(`ip:${ip || 'unknown'}`);
  const recentEmail = await store.countRecoveryAttempts(emailHash, now - RECOVERY_WINDOW_MS);
  const recentIp = await store.countRecoveryAttempts(ipHash, now - RECOVERY_WINDOW_MS);
  await store.recordRecoveryAttempt(emailHash, now);
  await store.recordRecoveryAttempt(ipHash, now);
  if (recentEmail >= RECOVERY_EMAIL_LIMIT || recentIp >= RECOVERY_IP_LIMIT || !mailer?.send) {
    return { statusCode: 200, body };
  }
  const matches = await store.listEntitlementsByEmail(normalized);
  if (matches.some((match) => match.status === 'active')) {
    try {
      await deliverRecoveryLink({ store, mailer, origin, email: normalized, now, ttlSeconds });
    } catch (error) {
      console.error('[bookstore] Recovery email was not sent.');
    }
  }
  return { statusCode: 200, body };
}

async function redeemRecoveryToken({ token, store, now = Date.now(), consume }) {
  if (!token) return { ok: false, status: 403, reason: 'unauthorized' };
  const tokenHash = hashRecoveryCode(token);
  const existing = await store.getRecoveryToken(tokenHash);
  if (!existing || existing.usedAt || Date.parse(existing.expiresAt) <= now) {
    return { ok: false, status: 403, reason: 'unauthorized' };
  }
  if (!consume) return { ok: true, email: existing.customerEmail, tokenHash, pending: true };
  const consumed = await store.consumeRecoveryToken(tokenHash, new Date(now).toISOString());
  if (!consumed) return { ok: false, status: 403, reason: 'unauthorized' };
  return { ok: true, email: consumed.customerEmail, tokenHash };
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

function createMemoryBookstoreStore() {
  const events = new Map();
  const intents = new Map();
  const orders = new Map();
  const entitlements = [];
  const refunds = new Map();
  const tokens = [];
  const attempts = [];
  const deliveries = new Map();

  return {
    async hasEvent(id) {
      return events.has(id);
    },
    async recordEvent(id, type, outcome) {
      if (events.has(id)) return false;
      events.set(id, { id, type, outcome });
      return true;
    },
    async getIntentBySession(sessionId) {
      return intents.get(sessionId) || null;
    },
    async saveIntent(intent) {
      intents.set(intent.stripeCheckoutSessionId, intent);
      return intent;
    },
    async getOrderBySession(sessionId) {
      return orders.get(sessionId) || null;
    },
    async getOrderByPaymentIntent(paymentIntentIdValue) {
      return [...orders.values()].find((order) => order.stripePaymentIntentId === paymentIntentIdValue) || null;
    },
    async getOrderByCharge(chargeId) {
      return [...orders.values()].find((order) => order.stripeChargeId === chargeId) || null;
    },
    async saveOrder(order) {
      const existing = orders.get(order.stripeCheckoutSessionId);
      if (!existing) {
        const saved = { ...order, id: `order_${orders.size + 1}`, refundedAmountCents: order.refundedAmountCents || 0 };
        orders.set(order.stripeCheckoutSessionId, saved);
        return saved;
      }
      if (existing.status === 'paid' || existing.status === 'refunded' || order.status !== 'paid') return existing;
      const upgraded = {
        ...existing,
        status: 'paid',
        amountCents: order.amountCents,
        customerEmail: order.customerEmail,
        stripePaymentIntentId: order.stripePaymentIntentId,
        stripeChargeId: order.stripeChargeId || existing.stripeChargeId,
      };
      orders.set(order.stripeCheckoutSessionId, upgraded);
      return upgraded;
    },
    async markOrderRefunded(orderId, { amountRefunded, chargeId }) {
      const order = [...orders.values()].find((row) => row.id === orderId);
      if (!order || order.status !== 'paid') return order || null;
      order.status = 'refunded';
      order.refundedAmountCents = amountRefunded;
      order.stripeChargeId = chargeId || order.stripeChargeId;
      return order;
    },
    async recordRefund(refund) {
      if (refunds.has(refund.stripeRefundId)) return refunds.get(refund.stripeRefundId);
      refunds.set(refund.stripeRefundId, refund);
      return refund;
    },
    async saveEntitlement(entitlement) {
      if (this.failEntitlement) {
        this.failEntitlement = false;
        throw retryableError('entitlement_unavailable');
      }
      const existing = entitlements.find(
        (row) => row.orderId === entitlement.orderId && row.productKey === entitlement.productKey,
      );
      if (existing) return existing;
      const saved = { ...entitlement, id: `ent_${entitlements.length + 1}` };
      entitlements.push(saved);
      return saved;
    },
    async revokeEntitlementForOrder(orderId, reason) {
      entitlements.forEach((row) => {
        if (row.orderId === orderId && row.status === 'active') {
          row.status = 'revoked';
          row.revocationReason = reason;
        }
      });
    },
    async getEntitlementBySession(sessionId) {
      return entitlements.find((row) => row.checkoutSessionId === sessionId && row.status === 'active') || null;
    },
    async listEntitlementsByEmail(email) {
      const normalized = normalizeEmail(email);
      if (!normalized) return [];
      return entitlements.filter((row) => normalizeEmail(row.customerEmail) === normalized && row.status === 'active');
    },
    async getFile(productKey) {
      return this.files?.get(productKey) || null;
    },
    async countRecoveryAttempts(subjectHash, sinceMs) {
      return attempts.filter((attempt) => attempt.subjectHash === subjectHash && attempt.createdAt >= sinceMs).length;
    },
    async recordRecoveryAttempt(subjectHash, createdAt) {
      attempts.push({ subjectHash, createdAt });
    },
    async saveRecoveryToken(token) {
      tokens.push({ ...token, usedAt: null });
      return token;
    },
    async getRecoveryToken(tokenHash) {
      return tokens.find((token) => token.tokenHash === tokenHash) || null;
    },
    async consumeRecoveryToken(tokenHash, usedAt) {
      const token = tokens.find((row) => row.tokenHash === tokenHash);
      if (!token || token.usedAt || Date.parse(token.expiresAt) <= Date.parse(usedAt)) return null;
      token.usedAt = usedAt;
      return { customerEmail: token.customerEmail };
    },
    async getRecoveryDelivery(orderId) {
      return deliveries.get(orderId) || null;
    },
    async saveRecoveryDelivery(delivery) {
      deliveries.set(delivery.orderId, { ...delivery });
      return delivery;
    },
    files: new Map(),
    orders,
    entitlements,
    refunds,
    tokens,
    events,
    deliveries,
  };
}

function mapOrderRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    productKey: row.product_key,
    productTitleSnapshot: row.product_title_snapshot,
    amountCents: row.amount_cents,
    currency: row.currency,
    customerEmail: row.customer_email,
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    stripeChargeId: row.stripe_charge_id,
    refundedAmountCents: row.refunded_amount_cents,
    status: row.status,
  };
}

function mapEntitlement(row, sessionId) {
  if (!row) return null;
  return {
    id: row.id,
    orderId: row.order_id,
    productKey: row.product_key,
    customerEmail: row.customer_email,
    recoveryCodeHash: row.recovery_code_hash,
    checkoutSessionId: sessionId,
    status: row.status,
  };
}

function createSupabaseBookstoreStore(client) {
  return {
    async hasEvent(id) {
      const { data, error } = await client
        .from('bookstore_webhook_events')
        .select('stripe_event_id')
        .eq('stripe_event_id', id)
        .maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },
    async recordEvent(id, type, outcome) {
      const { error } = await client.from('bookstore_webhook_events').insert({
        stripe_event_id: id,
        event_type: type,
        outcome,
      });
      if (error?.code === '23505') return false;
      if (error) throw error;
      return true;
    },
    async getIntentBySession(sessionId) {
      const { data, error } = await client
        .from('bookstore_checkout_intents')
        .select('*')
        .eq('stripe_checkout_session_id', sessionId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        stripeCheckoutSessionId: data.stripe_checkout_session_id,
        productKey: data.product_key,
        productTitleSnapshot: data.product_title_snapshot,
        amountCents: data.amount_cents,
        currency: data.currency,
        stripePriceId: data.stripe_price_id,
        recoveryCodeHash: data.recovery_code_hash,
      };
    },
    async saveIntent(intent) {
      const { error } = await client.from('bookstore_checkout_intents').insert({
        stripe_checkout_session_id: intent.stripeCheckoutSessionId,
        product_key: intent.productKey,
        product_title_snapshot: intent.productTitleSnapshot,
        amount_cents: intent.amountCents,
        currency: intent.currency,
        stripe_price_id: intent.stripePriceId,
        recovery_code_hash: intent.recoveryCodeHash,
      });
      if (error) throw error;
      return intent;
    },
    async getOrderBySession(sessionId) {
      const { data, error } = await client
        .from('bookstore_orders')
        .select('*')
        .eq('stripe_checkout_session_id', sessionId)
        .maybeSingle();
      if (error) throw error;
      return mapOrderRow(data);
    },
    async getOrderByPaymentIntent(paymentIntent) {
      const { data, error } = await client
        .from('bookstore_orders')
        .select('*')
        .eq('stripe_payment_intent_id', paymentIntent)
        .maybeSingle();
      if (error) throw error;
      return mapOrderRow(data);
    },
    async getOrderByCharge(chargeId) {
      const { data, error } = await client
        .from('bookstore_orders')
        .select('*')
        .eq('stripe_charge_id', chargeId)
        .maybeSingle();
      if (error) throw error;
      return mapOrderRow(data);
    },
    async saveOrder(order) {
      const { data: existing, error: readError } = await client
        .from('bookstore_orders')
        .select('*')
        .eq('stripe_checkout_session_id', order.stripeCheckoutSessionId)
        .maybeSingle();
      if (readError) throw readError;
      if (!existing) {
        const { data, error } = await client
          .from('bookstore_orders')
          .insert({
            product_key: order.productKey,
            product_title_snapshot: order.productTitleSnapshot,
            amount_cents: order.amountCents,
            currency: order.currency,
            customer_email: order.customerEmail,
            stripe_checkout_session_id: order.stripeCheckoutSessionId,
            stripe_payment_intent_id: order.stripePaymentIntentId,
            stripe_charge_id: order.stripeChargeId || null,
            status: order.status,
          })
          .select('*')
          .single();
        if (error?.code === '23505') return this.saveOrder(order);
        if (error) throw error;
        return mapOrderRow(data);
      }
      if (existing.status === 'paid' || existing.status === 'refunded' || order.status !== 'paid') return mapOrderRow(existing);
      const { data, error } = await client
        .from('bookstore_orders')
        .update({
          status: 'paid',
          amount_cents: order.amountCents,
          customer_email: order.customerEmail,
          stripe_payment_intent_id: order.stripePaymentIntentId,
          stripe_charge_id: order.stripeChargeId || existing.stripe_charge_id,
        })
        .eq('id', existing.id)
        .neq('status', 'paid')
        .select('*')
        .single();
      if (error) throw error;
      return mapOrderRow(data);
    },
    async markOrderRefunded(orderId, { amountRefunded, chargeId }) {
      const { data, error } = await client
        .from('bookstore_orders')
        .update({
          status: 'refunded',
          refunded_amount_cents: amountRefunded,
          stripe_charge_id: chargeId,
        })
        .eq('id', orderId)
        .eq('status', 'paid')
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return mapOrderRow(data);
    },
    async recordRefund(refund) {
      const { data, error } = await client
        .from('bookstore_refunds')
        .insert({
          stripe_refund_id: refund.stripeRefundId,
          stripe_charge_id: refund.stripeChargeId,
          stripe_payment_intent_id: refund.stripePaymentIntentId,
          order_id: refund.orderId,
          amount_cents: refund.amountCents,
          currency: refund.currency,
          status: refund.status,
          full_refund: refund.fullRefund,
        })
        .select('*')
        .single();
      if (error?.code === '23505') return refund;
      if (error) throw error;
      return data;
    },
    async saveEntitlement(entitlement) {
      const { data: existing, error: readError } = await client
        .from('digital_entitlements')
        .select('*')
        .eq('order_id', entitlement.orderId)
        .eq('product_key', entitlement.productKey)
        .maybeSingle();
      if (readError) throw readError;
      if (existing) return mapEntitlement(existing, entitlement.checkoutSessionId);
      const { data, error } = await client
        .from('digital_entitlements')
        .insert({
          order_id: entitlement.orderId,
          product_key: entitlement.productKey,
          customer_email: entitlement.customerEmail,
          recovery_code_hash: entitlement.recoveryCodeHash,
          status: 'active',
        })
        .select('*')
        .single();
      if (error?.code === '23505') return this.saveEntitlement(entitlement);
      if (error) throw error;
      return mapEntitlement(data, entitlement.checkoutSessionId);
    },
    async revokeEntitlementForOrder(orderId, reason) {
      const { error } = await client
        .from('digital_entitlements')
        .update({
          status: 'revoked',
          revoked_at: new Date().toISOString(),
          revocation_reason: reason,
        })
        .eq('order_id', orderId)
        .eq('status', 'active');
      if (error) throw error;
    },
    async getEntitlementBySession(sessionId) {
      const { data: order, error: orderError } = await client
        .from('bookstore_orders')
        .select('*')
        .eq('stripe_checkout_session_id', sessionId)
        .eq('status', 'paid')
        .maybeSingle();
      if (orderError) throw orderError;
      if (!order) return null;
      const { data, error } = await client
        .from('digital_entitlements')
        .select('*')
        .eq('order_id', order.id)
        .eq('status', 'active')
        .maybeSingle();
      if (error) throw error;
      return mapEntitlement(data, sessionId);
    },
    async listEntitlementsByEmail(email) {
      const normalized = normalizeEmail(email);
      if (!normalized) return [];
      const { data, error } = await client
        .from('digital_entitlements')
        .select('*')
        .eq('customer_email', normalized)
        .eq('status', 'active');
      if (error) throw error;
      const matches = [];
      for (const row of data || []) {
        const { data: order, error: orderError } = await client
          .from('bookstore_orders')
          .select('stripe_checkout_session_id, status')
          .eq('id', row.order_id)
          .maybeSingle();
        if (orderError) throw orderError;
        if (order?.status !== 'paid') continue;
        matches.push(mapEntitlement(row, order.stripe_checkout_session_id));
      }
      return matches;
    },
    async getFile(productKey) {
      const { data, error } = await client
        .from('digital_book_files')
        .select('*')
        .eq('product_key', productKey)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        productKey: data.product_key,
        bucketId: data.bucket_id,
        objectPath: data.object_path,
      };
    },
    async countRecoveryAttempts(subjectHash, sinceMs) {
      const { count, error } = await client
        .from('bookstore_recovery_attempts')
        .select('id', { count: 'exact', head: true })
        .eq('subject_hash', subjectHash)
        .gte('created_at', new Date(sinceMs).toISOString());
      if (error) throw error;
      return count || 0;
    },
    async recordRecoveryAttempt(subjectHash, createdAt) {
      const { error } = await client.from('bookstore_recovery_attempts').insert({
        subject_hash: subjectHash,
        created_at: new Date(createdAt).toISOString(),
      });
      if (error) throw error;
    },
    async saveRecoveryToken(token) {
      const { error } = await client.from('bookstore_recovery_tokens').insert({
        token_hash: token.tokenHash,
        customer_email: token.customerEmail,
        expires_at: token.expiresAt,
      });
      if (error) throw error;
      return token;
    },
    async getRecoveryToken(tokenHash) {
      const { data, error } = await client
        .from('bookstore_recovery_tokens')
        .select('*')
        .eq('token_hash', tokenHash)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        tokenHash: data.token_hash,
        customerEmail: data.customer_email,
        expiresAt: data.expires_at,
        usedAt: data.used_at,
      };
    },
    async consumeRecoveryToken(tokenHash, usedAt) {
      const { data, error } = await client
        .from('bookstore_recovery_tokens')
        .update({ used_at: usedAt })
        .eq('token_hash', tokenHash)
        .is('used_at', null)
        .gt('expires_at', usedAt)
        .select('customer_email')
        .maybeSingle();
      if (error) throw error;
      return data ? { customerEmail: data.customer_email } : null;
    },
    async getRecoveryDelivery(orderId) {
      const { data, error } = await client
        .from('bookstore_recovery_deliveries')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        orderId: data.order_id,
        status: data.status,
        attempt: data.attempt,
        sentAt: data.sent_at,
        updatedAt: Date.parse(data.updated_at),
      };
    },
    async saveRecoveryDelivery(delivery) {
      const { error } = await client.from('bookstore_recovery_deliveries').upsert({
        order_id: delivery.orderId,
        status: delivery.status,
        attempt: delivery.attempt,
        sent_at: delivery.sentAt,
        updated_at: new Date(delivery.updatedAt || Date.now()).toISOString(),
      }, { onConflict: 'order_id' });
      if (error) throw error;
      return delivery;
    },
  };
}

async function stripeRequest(secretKey, path, method = 'GET') {
  let response;
  try {
    response = await fetch(`https://api.stripe.com/v1/${path}`, {
      method,
      headers: { Authorization: `Bearer ${secretKey}` },
    });
  } catch (error) {
    throw retryableError('stripe_unavailable');
  }
  const payload = await response.json().catch(() => ({}));
  if (response.status === 429 || response.status >= 500) throw retryableError('stripe_unavailable');
  if (!response.ok) {
    const error = new Error(payload?.error?.message || 'stripe_rejected');
    error.retryable = false;
    error.statusCode = response.status;
    throw error;
  }
  return payload;
}

function createStripeBookstoreClient(secretKey) {
  return {
    async retrievePrice(priceId) {
      return stripeRequest(secretKey, `prices/${encodeURIComponent(priceId)}`);
    },
    async retrieveCharge(chargeId) {
      return stripeRequest(secretKey, `charges/${encodeURIComponent(chargeId)}?expand[]=refunds`);
    },
    async retrieveCheckoutProof(sessionId) {
      const lineItems = await stripeRequest(
        secretKey,
        `checkout/sessions/${encodeURIComponent(sessionId)}/line_items?expand[]=data.price`,
      );
      const first = lineItems.data?.[0];
      const embedded = first?.price;
      const price = embedded && typeof embedded === 'object'
        ? embedded
        : embedded
          ? await stripeRequest(secretKey, `prices/${encodeURIComponent(embedded)}`)
          : null;
      return { lineItems: lineItems.data || [], price };
    },
    async findPaymentLink(url) {
      let startingAfter = '';
      for (let page = 0; page < 5; page += 1) {
        const params = new URLSearchParams({ limit: '100' });
        if (startingAfter) params.set('starting_after', startingAfter);
        const payload = await stripeRequest(secretKey, `payment_links?${params.toString()}`);
        const match = (payload.data || []).find((link) => link.url === url);
        if (match) {
          return stripeRequest(secretKey, `payment_links/${encodeURIComponent(match.id)}?expand[]=line_items.data.price`);
        }
        if (!payload.has_more || !payload.data?.length) return null;
        startingAfter = payload.data[payload.data.length - 1].id;
      }
      return null;
    },
  };
}

function getServiceClient() {
  const { createClient } = require('@supabase/supabase-js');
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function digitalSalesEnvEnabled() {
  return process.env.BOOKSTORE_DIGITAL_SALES_ENABLED === 'true';
}

function publicSiteOrigin() {
  return process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://caidenvale.com';
}

function clientIp(event = {}) {
  const header = event.headers?.['x-nf-client-connection-ip']
    || event.headers?.['x-forwarded-for']
    || event.headers?.['X-Forwarded-For']
    || '';
  return String(header).split(',')[0].trim() || 'unknown';
}

module.exports = {
  DIGITAL_PRODUCT_KEY,
  DIGITAL_BUCKET,
  HISTORICAL_BUNDLE_KEY,
  HISTORICAL_PAPERBACK_LINK,
  RECOVERY_PUBLIC_MESSAGE,
  CUSTOMER_MESSAGES,
  safeEqual,
  hashRecoveryCode,
  createRecoveryCode,
  normalizeEmail,
  isSafeObjectPath,
  resolveDownloadTtl,
  resolveRecoveryTtl,
  verifyStripeSignature,
  planDigitalCheckout,
  planDigitalFulfillment,
  verifyCheckoutProof,
  verifyConfiguredPrice,
  planPaymentLinkActivation,
  planRefundAction,
  authorizeDownload,
  fulfillPaidSession,
  processBookstoreWebhookEvent,
  resolveDigitalDownload,
  requestBookstoreRecovery,
  redeemRecoveryToken,
  jsonResponse,
  createMemoryBookstoreStore,
  createSupabaseBookstoreStore,
  createStripeBookstoreClient,
  getServiceClient,
  digitalSalesEnvEnabled,
  publicSiteOrigin,
  clientIp,
};
