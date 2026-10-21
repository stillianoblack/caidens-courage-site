const {
  verifyStripeSignature,
  jsonResponse,
  getServiceClient,
  publicSiteOrigin,
} = require('./_lib/bookstoreDelivery');
const { sendAcademyClaimEmail } = require('./_lib/emailProvider');
const { processAcademyWebhookEvent, stripeKeyMode, approvedShippingRateIds } = require('./_lib/academyMembership');

function createStore(client) {
  return {
    async hasEvent(eventId) {
      const { data, error } = await client
        .from('academy_webhook_events')
        .select('stripe_event_id')
        .eq('stripe_event_id', eventId)
        .maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },
    async recordEvent(eventId, eventType, outcome) {
      const { error } = await client.from('academy_webhook_events').insert({
        stripe_event_id: eventId,
        event_type: eventType,
        outcome,
      });
      if (error && !/duplicate|unique/i.test(error.message || '')) throw error;
    },
    async saveSubscription(decision) {
      if (!decision.stripeSubscriptionId) return;
      const metadata = decision.metadata || {};
      const status = decision.grant ? 'active' : decision.status === 'past_due' ? 'past_due' : 'canceled';
      const row = {
        family_program_id: metadata.family_program_id || null,
        customer_email: metadata.parent_email || null,
        kind: 'subscription',
        status,
        ends_at: decision.endsAt,
        stripe_customer_id: decision.stripeCustomerId,
        stripe_subscription_id: decision.stripeSubscriptionId,
        stripe_price_id: decision.stripePriceId,
        updated_at: new Date().toISOString(),
      };
      const { error } = await client
        .from('academy_entitlements')
        .upsert(row, { onConflict: 'stripe_subscription_id' });
      if (error) throw error;
    },
    async markPaymentFailed({ stripeSubscriptionId }) {
      if (!stripeSubscriptionId) return;
      const { error } = await client
        .from('academy_entitlements')
        .update({ status: 'past_due', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', stripeSubscriptionId)
        .eq('kind', 'subscription');
      if (error) throw error;
    },
    async recordPayment(payment) {
      const { error } = await client.from('academy_payments').upsert({
        stripe_invoice_id: payment.stripeInvoiceId,
        stripe_subscription_id: payment.stripeSubscriptionId,
        amount_paid_cents: payment.amountPaidCents,
        currency: payment.currency,
        paid_at: payment.paidAt,
      }, { onConflict: 'stripe_invoice_id' });
      if (error) throw error;
    },
    async saveBundleOrder(order) {
      const { data: existing, error: readError } = await client
        .from('bookstore_orders')
        .select('id, status, product_key')
        .eq('stripe_checkout_session_id', order.sessionId)
        .maybeSingle();
      if (readError) throw readError;
      if (existing) return { id: existing.id, status: existing.status, productKey: existing.product_key };
      const { data, error } = await client
        .from('bookstore_orders')
        .insert({
          product_key: order.productKey,
          product_title_snapshot: order.title,
          amount_cents: order.amountCents,
          currency: order.currency,
          customer_email: order.customerEmail,
          stripe_checkout_session_id: order.sessionId,
          stripe_payment_intent_id: order.paymentIntentId,
          status: order.status,
        })
        .select('id, status, product_key')
        .single();
      if (error) throw error;
      return { id: data.id, status: data.status, productKey: data.product_key };
    },
    async markBundleOrderStatus({ sessionId, status }) {
      const { error } = await client
        .from('bookstore_orders')
        .update({ status })
        .eq('stripe_checkout_session_id', sessionId)
        .neq('product_key', 'hardcover_bundle')
        .in('status', ['failed', 'expired']);
      if (error) throw error;
    },
    async saveFulfillment(fulfillment) {
      const { error } = await client.from('bookstore_order_fulfillment').upsert({
        order_id: fulfillment.orderId,
        checkout_session_id: fulfillment.sessionId,
        shipping_name: fulfillment.name,
        shipping_line1: fulfillment.line1,
        shipping_line2: fulfillment.line2,
        shipping_city: fulfillment.city,
        shipping_state: fulfillment.state,
        shipping_postal_code: fulfillment.postalCode,
        shipping_country: fulfillment.country,
        shipping_rate_id: fulfillment.rateId,
        shipping_method_label: fulfillment.methodLabel,
        shipping_cents: fulfillment.shippingCents,
        tax_cents: fulfillment.taxCents,
        subtotal_cents: fulfillment.subtotalCents,
        fulfillment_status: fulfillment.fulfillmentStatus,
      }, { onConflict: 'order_id' });
      if (error) throw error;
    },
    async findClaimBySession(sessionId) {
      const { data, error } = await client
        .from('academy_bundle_claims')
        .select('id, activated_at, invitation_sent_at, customer_email, duration_days, product_key')
        .eq('checkout_session_id', sessionId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        id: data.id,
        activatedAt: data.activated_at,
        invitationSentAt: data.invitation_sent_at,
        customerEmail: data.customer_email,
        durationDays: data.duration_days,
        productKey: data.product_key,
      };
    },
    async saveBundleOffer(offer) {
      const { data, error } = await client.from('academy_bundle_claims').upsert({
        checkout_session_id: offer.checkoutSessionId,
        product_key: offer.productKey,
        customer_email: offer.customerEmail,
        claim_code_hash: offer.claimCodeHash,
        duration_days: offer.durationDays,
        purchase_verified_at: offer.paidAt,
        claim_deadline_at: offer.claimDeadlineAt,
      }, { onConflict: 'checkout_session_id' }).select('id, activated_at, invitation_sent_at').single();
      if (error) throw error;
      console.info('[academy] Bundle invitation prepared. The claim token is not logged.');
      return { id: data.id, activatedAt: data.activated_at, invitationSentAt: data.invitation_sent_at };
    },
    async saveClaimToken(token) {
      const { error } = await client.from('academy_claim_tokens').insert({
        claim_id: token.claimId,
        purpose: token.purpose,
        token_hash: token.tokenHash,
        expires_at: token.expiresAt,
      });
      if (error) throw error;
    },
    async markInvitationSent(claimId, sentAt) {
      const { error } = await client
        .from('academy_bundle_claims')
        .update({ invitation_sent_at: sentAt })
        .eq('id', claimId);
      if (error) throw error;
    },
  };
}

async function stripeGet(secretKey, path) {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const payload = await response.json();
  if (!response.ok) {
    const error = new Error('stripe_lookup_failed');
    error.retryable = response.status >= 500;
    throw error;
  }
  return payload;
}

exports.handler = async function academyStripeWebhook(event) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' });

  const secret = process.env.ACADEMY_STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : event.body || '';
  const signature = event.headers?.['stripe-signature'] || event.headers?.['Stripe-Signature'];
  if (!secret || !verifyStripeSignature(rawBody, signature, secret)) {
    return jsonResponse(400, { error: 'invalid_signature' });
  }

  let stripeEvent;
  try {
    stripeEvent = JSON.parse(rawBody);
  } catch {
    return jsonResponse(400, { error: 'invalid_json' });
  }

  if (stripeKeyMode(process.env.STRIPE_SECRET_KEY) === 'live') {
    return jsonResponse(200, { outcome: 'live_billing_disabled', granted: false });
  }

  const client = getServiceClient();
  if (!client) return jsonResponse(503, { error: 'membership_not_configured' });
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const { data: plans } = await client
    .from('academy_membership_plans')
    .select('stripe_price_id, amount_cents, billing_interval');
  const verifiedPrices = (plans || [])
    .filter((plan) => plan.stripe_price_id)
    .map((plan) => ({
      id: plan.stripe_price_id,
      amountCents: plan.amount_cents,
      interval: plan.billing_interval,
    }));

  try {
    const result = await processAcademyWebhookEvent({
      event: stripeEvent,
      store: createStore(client),
      stripe: secretKey
        ? {
            retrieveSubscription: (id) => stripeGet(secretKey, `subscriptions/${encodeURIComponent(id)}`),
            retrieveCheckoutSession: (id) => stripeGet(
              secretKey,
              `checkout/sessions/${encodeURIComponent(id)}?expand[]=line_items.data.price&expand[]=shipping_cost.shipping_rate`,
            ),
            mailer: { send: sendAcademyClaimEmail },
            origin: publicSiteOrigin(),
            approvedRates: approvedShippingRateIds(process.env.STRIPE_BUNDLE_SHIPPING_RATE_IDS),
          }
        : null,
      expectedPrices: verifiedPrices,
      claimCodeSecret: process.env.ACADEMY_CLAIM_CODE_KEY || null,
    });
    return jsonResponse(result.httpStatus, { outcome: result.outcome, granted: result.granted === true });
  } catch (error) {
    if (error?.retryable) return jsonResponse(500, { error: 'retryable_failure', granted: false });
    const missing = error?.code === '42P01' || /academy_/i.test(error?.message || '');
    if (missing) return jsonResponse(200, { outcome: 'migration_not_applied', granted: false });
    console.error('[academy] Membership webhook failed.');
    return jsonResponse(500, { error: 'membership_webhook_failed', granted: false });
  }
};
