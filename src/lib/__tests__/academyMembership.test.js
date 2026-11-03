const fs = require('fs');
const path = require('path');
const {
  resolveAcademyAccess,
  planSubscriptionCheckout,
  planSubscriptionState,
  planBundleClaim,
  planAdminPriceSave,
  planTransitionEmail,
  classifyHistoricalPromise,
  processAcademyWebhookEvent,
  planBundleCheckout,
  planPhysicalCheckout,
  planBundleFulfillment,
  planPhysicalFulfillment,
  recoverRecordedBundlePurchase,
  planClaimTokenUse,
  bundlePriceMatches,
  applyCheckoutShippingCountries,
  PAPERBACK_BUNDLE_KEY,
  HARDCOVER_BUNDLE_KEY,
  HARDCOVER_EDITION_KEY,
} = require('../../../netlify/functions/_lib/academyMembership');

const monthlyPrice = {
  id: 'price_monthly_test',
  unit_amount: 999,
  currency: 'usd',
  livemode: false,
  recurring: { interval: 'month' },
};
const annualPrice = {
  id: 'price_annual_test',
  unit_amount: 9900,
  currency: 'usd',
  livemode: false,
  recurring: { interval: 'year' },
};

function memoryStore() {
  const events = new Map();
  const subscriptions = [];
  const offers = [];
  const payments = [];
  const failures = [];
  const orders = [];
  const fulfillments = [];
  const tokens = [];
  const entitlements = [];
  return {
    events,
    subscriptions,
    offers,
    payments,
    failures,
    orders,
    fulfillments,
    tokens,
    entitlements,
    async hasEvent(id) { return events.has(id); },
    async recordEvent(id, _type, outcome) {
      if (!events.has(id)) events.set(id, outcome || 'recorded');
    },
    async eventOutcome(id) { return events.has(id) ? events.get(id) : null; },
    async findOrderBySession(sessionId) { return orders.find((order) => order.sessionId === sessionId) || null; },
    async saveSubscription(decision) { subscriptions.push(decision); },
    async markPaymentFailed(failure) { failures.push(failure); },
    async recordPayment(payment) { payments.push(payment); },
    async saveBundleOffer(offer) {
      const saved = { ...offer, id: `claim-${offers.length + 1}`, activatedAt: null, invitationSentAt: null };
      offers.push(saved);
      return saved;
    },
    async saveBundleOrder(order) {
      const existing = orders.find((item) => item.sessionId === order.sessionId);
      if (existing) return existing;
      const saved = { ...order, id: `order-${orders.length + 1}` };
      orders.push(saved);
      return saved;
    },
    async markBundleOrderStatus(update) { failures.push(update); },
    async saveFulfillment(row) { fulfillments.push(row); },
    async findClaimBySession(sessionId) { return offers.find((offer) => offer.checkoutSessionId === sessionId) || null; },
    async saveClaimToken(token) { tokens.push(token); },
    async markInvitationSent(claimId, sentAt) {
      const claim = offers.find((offer) => offer.id === claimId);
      if (claim) claim.invitationSentAt = sentAt;
    },
    async findOrderByPaymentIntent(paymentIntentId) {
      return orders.find((order) => order.paymentIntentId === paymentIntentId) || null;
    },
    async markOrderRefunded(orderId, details) {
      const order = orders.find((item) => item.id === orderId);
      if (!order || order.productKey === 'hardcover_bundle') return null;
      order.status = 'refunded';
      order.refundedAmountCents = details.amountRefunded;
      return order;
    },
    async findBundleEntitlement(order) {
      return entitlements.find((item) => item.orderReference === order.sessionId && item.kind === 'bundle_included') || null;
    },
    async revokeBundleEntitlement(entitlementId) {
      const entitlement = entitlements.find((item) => item.id === entitlementId);
      if (!entitlement || entitlement.kind !== 'bundle_included') return { revoked: false };
      entitlement.status = 'canceled';
      return { revoked: true };
    },
  };
}

function paidBundleSession({ productKey, amount, tax = 480, shipping = 599, email = 'parent@example.com' }) {
  return {
    id: `cs_${productKey}`,
    payment_status: 'paid',
    currency: 'usd',
    amount_subtotal: amount,
    amount_total: amount + tax + shipping,
    total_details: { amount_tax: tax, amount_shipping: shipping },
    customer_details: { email },
    metadata: {
      purpose: 'academy_bundle',
      product_key: productKey,
      amount_cents: String(amount),
      product_title: productKey,
      stripe_product_id: 'prod_bundle_test',
    },
    line_items: {
      data: [{
        quantity: 1,
        price: {
          id: 'price_bundle_test',
          unit_amount: amount,
          currency: 'usd',
          livemode: false,
          type: 'one_time',
          product: 'prod_bundle_test',
        },
      }],
    },
    shipping_details: {
      name: 'Parent',
      address: { line1: '1 Vale Lane', city: 'Portland', state: 'OR', postal_code: '97201', country: 'US' },
    },
    shipping_cost: { shipping_rate: { id: 'shr_test_ground', display_name: 'Ground' } },
    payment_intent: 'pi_bundle',
  };
}

describe('academy membership decisions', () => {
  const now = new Date('2026-10-20T12:00:00Z');

  test('keeps the gate open until enforcement is explicitly enabled', () => {
    const decision = resolveAcademyAccess({ now, gateOn: false, programType: 'independent_family' });
    expect(decision).toMatchObject({ enforced: false, allowed: true, reason: 'gate_disabled', progressRetained: true });
  });

  test('preserves school and camp access and unrestricted promises', () => {
    expect(resolveAcademyAccess({ now, gateOn: true, programType: 'School' }).reason).toBe('authorized_program');
    expect(resolveAcademyAccess({ now, gateOn: true, programType: 'Camp / Youth Program' }).allowed).toBe(true);
    const preserved = resolveAcademyAccess({
      now,
      gateOn: true,
      programType: 'independent_family',
      entitlements: [{ kind: 'unrestricted_promise', status: 'active', promiseSource: 'bundle_copy_without_end_date' }],
    });
    expect(preserved).toMatchObject({ allowed: true, reason: 'preserved_unrestricted_promise', expiresAt: null });
    expect(classifyHistoricalPromise({ promiseSource: 'founders_guardian_language' }).preserve).toBe(true);
    expect(classifyHistoricalPromise({ promiseSource: 'historical_preorder_unreviewed' }).expiresAt).toBeNull();
  });

  test('requires membership for a new family and keeps complimentary access before a transition starts', () => {
    expect(resolveAcademyAccess({
      now,
      gateOn: true,
      programType: 'independent_family',
    })).toMatchObject({ allowed: false, reason: 'membership_required', progressRetained: true });

    expect(resolveAcademyAccess({
      now,
      gateOn: true,
      programType: 'independent_family',
      legacyComplimentary: { transitionStartedAt: null },
    }).reason).toBe('complimentary_pending_transition');

    const ended = resolveAcademyAccess({
      now,
      gateOn: true,
      programType: 'independent_family',
      legacyComplimentary: { transitionStartedAt: '2026-09-01T00:00:00Z' },
    });
    expect(ended.allowed).toBe(false);
    expect(ended.progressRetained).toBe(true);
  });

  test('grants only a verified test subscription and blocks duplicates, live mode, and failed payments', () => {
    expect(planSubscriptionCheckout({
      secretKey: 'sk_test_123',
      interval: 'month',
      price: monthlyPrice,
      planActive: true,
    }).ok).toBe(true);
    expect(planSubscriptionCheckout({
      secretKey: 'sk_live_123',
      interval: 'month',
      price: monthlyPrice,
      planActive: true,
    }).reason).toBe('live_billing_disabled');
    expect(planSubscriptionCheckout({
      secretKey: 'sk_test_123',
      interval: 'year',
      price: annualPrice,
      planActive: true,
      existingSubscription: { status: 'active' },
    }).reason).toBe('duplicate_membership');

    const active = planSubscriptionState({
      id: 'sub_123',
      status: 'active',
      current_period_end: 1790000000,
      cancel_at_period_end: true,
      customer: 'cus_123',
      items: { data: [{ price: annualPrice }] },
    }, [{ id: annualPrice.id, amountCents: 9900, interval: 'year' }]);
    expect(active).toMatchObject({ grant: true, cancelAtPeriodEnd: true, progressRetained: true });

    const failed = planSubscriptionState({
      id: 'sub_123',
      status: 'past_due',
      customer: 'cus_123',
      items: { data: [{ price: monthlyPrice }] },
    }, [{ id: monthlyPrice.id, amountCents: 999, interval: 'month' }]);
    expect(failed).toMatchObject({ grant: false, progressRetained: true });
  });

  test('activates bundle access from a verified purchase and rejects a payment-link redirect', () => {
    const paidAt = '2026-10-01T00:00:00Z';
    const paperback = planBundleClaim({
      now,
      parentEmail: 'parent@example.com',
      order: {
        proof: 'stripe_webhook',
        status: 'paid',
        customerEmail: 'parent@example.com',
        productKey: PAPERBACK_BUNDLE_KEY,
        paidAt,
      },
    });
    expect(paperback.ok).toBe(true);
    expect(paperback.days).toBe(30);
    expect(paperback.startsAt).toBe(now.toISOString());
    expect(paperback.startsAt).not.toBe(paidAt);
    expect(new Date(paperback.endsAt).getTime() - now.getTime()).toBe(30 * 24 * 60 * 60 * 1000);

    const hardcover = planBundleClaim({
      now,
      parentEmail: 'parent@example.com',
      order: {
        proof: 'stripe_webhook',
        status: 'paid',
        customerEmail: 'parent@example.com',
        productKey: HARDCOVER_BUNDLE_KEY,
        paidAt,
      },
    });
    expect(hardcover.days).toBe(90);
    expect(planBundleClaim({
      now,
      parentEmail: 'parent@example.com',
      order: { proof: 'stripe_webhook', proofSource: 'payment_link_redirect', status: 'paid', customerEmail: 'parent@example.com', productKey: PAPERBACK_BUNDLE_KEY, paidAt },
    }).reason).toBe('payment_link_redirect_not_proof');
    expect(planBundleClaim({
      now: new Date('2027-05-01T00:00:00Z'),
      parentEmail: 'parent@example.com',
      order: { proof: 'stripe_webhook', status: 'paid', customerEmail: 'parent@example.com', productKey: PAPERBACK_BUNDLE_KEY, paidAt },
    }).reason).toBe('unclaimed_offer_expired');
    expect(planBundleClaim({
      now,
      parentEmail: 'parent@example.com',
      order: { proof: 'stripe_webhook', status: 'paid', customerEmail: 'parent@example.com', productKey: 'paperback', paidAt },
    }).reason).toBe('product_has_no_included_access');
  });

  test('refuses unverified admin price changes and does not send transition email', () => {
    expect(planAdminPriceSave({
      secretKey: 'sk_test_123',
      plan: { planKey: 'focus_flame_family_monthly' },
      submittedPriceId: monthlyPrice.id,
      stripePrice: monthlyPrice,
    })).toMatchObject({ ok: true, changesEntitlements: false });
    expect(planAdminPriceSave({
      secretKey: 'sk_test_123',
      plan: { planKey: 'focus_flame_family_monthly' },
      submittedPriceId: 'price_other',
      stripePrice: { ...monthlyPrice, unit_amount: 100 },
    }).reason).toBe('price_not_verified');
    expect(planTransitionEmail({}).send).toBe(false);
  });

  test('records a paperback bundle purchase and emails a one-time invitation without granting access', async () => {
    const store = memoryStore();
    const sent = [];
    const session = paidBundleSession({ productKey: PAPERBACK_BUNDLE_KEY, amount: 5999 });
    const result = await processAcademyWebhookEvent({
      event: { id: 'evt_bundle', type: 'checkout.session.completed', data: { object: session } },
      store,
      stripe: {
        retrieveCheckoutSession: async () => session,
        mailer: { send: async (payload) => { sent.push(payload); return { success: true }; } },
        origin: 'https://caidens-courage-staging.netlify.app',
        approvedRates: ['shr_test_ground'],
      },
      now,
    });
    expect(result).toMatchObject({ granted: false, outcome: 'invitation_sent' });
    expect(store.offers[0].durationDays).toBe(30);
    expect(store.offers[0].claimCode).toBeUndefined();
    expect(store.orders).toHaveLength(1);
    expect(store.fulfillments[0]).toMatchObject({ line1: '1 Vale Lane', taxCents: 480, shippingCents: 599, methodLabel: 'Ground' });
    expect(sent[0].claimUrl).toContain('https://caidens-courage-staging.netlify.app/story/books/claim#token=');
    expect(sent[0].claimUrl).not.toContain('parent@example.com');
    expect(JSON.stringify(store.tokens[0])).not.toContain(sent[0].claimUrl.split('token=')[1]);
    expect(store.tokens[0].tokenHash).toHaveLength(64);

    const duplicate = await processAcademyWebhookEvent({
      event: { id: 'evt_bundle', type: 'checkout.session.completed', data: { object: session } },
      store,
      stripe: { retrieveCheckoutSession: async () => session, mailer: { send: async () => ({ success: true }) } },
    });
    expect(duplicate.outcome).toBe('duplicate');
    expect(store.orders).toHaveLength(1);
    expect(sent).toHaveLength(1);
  });

  test('fulfills a paid asynchronous checkout and does not record it before payment', async () => {
    const store = memoryStore();
    const sent = [];
    const session = paidBundleSession({ productKey: PAPERBACK_BUNDLE_KEY, amount: 5999 });
    session.id = 'cs_async';
    const unpaid = { ...session, payment_status: 'unpaid' };
    const stripe = {
      retrieveCheckoutSession: async () => unpaid,
      mailer: { send: async (payload) => { sent.push(payload); return { success: true }; } },
      origin: 'https://caidens-courage-staging.netlify.app',
      approvedRates: ['shr_test_ground'],
    };
    const pending = await processAcademyWebhookEvent({
      event: { id: 'evt_async_pending', type: 'checkout.session.async_payment_succeeded', data: { object: unpaid } },
      store,
      stripe,
      now,
    });
    expect(pending.outcome).toBe('unpaid');
    expect(store.orders).toHaveLength(0);
    expect(sent).toHaveLength(0);

    const paid = await processAcademyWebhookEvent({
      event: { id: 'evt_async_paid', type: 'checkout.session.async_payment_succeeded', data: { object: session } },
      store,
      stripe: { ...stripe, retrieveCheckoutSession: async () => session },
      now,
    });
    expect(paid).toMatchObject({ granted: false, outcome: 'invitation_sent' });
    expect(store.orders).toHaveLength(1);
    expect(sent).toHaveLength(1);
  });

  test('reads the current shipping address, keeps a missing address from creating an order, and recovers it once', async () => {
    const legacy = paidBundleSession({ productKey: HARDCOVER_BUNDLE_KEY, amount: 7599, tax: 0, shipping: 1000 });
    const current = {
      ...legacy,
      id: 'cs_current_shipping',
      shipping_details: undefined,
      collected_information: {
        shipping_details: {
          name: 'Parent',
          address: { line1: '9 Current St', city: 'Portland', state: 'OR', postal_code: '97201', country: 'US' },
        },
      },
    };
    expect(planBundleFulfillment({ session: current, approvedRates: ['shr_test_ground'] }).shipping).toMatchObject({
      line1: '9 Current St',
      country: 'US',
    });
    const outside = {
      ...current,
      collected_information: {
        shipping_details: {
          name: 'Parent',
          address: { line1: '9 Current St', city: 'Toronto', state: 'ON', postal_code: 'M5V', country: 'CA' },
        },
      },
    };
    expect(planBundleFulfillment({ session: outside, approvedRates: ['shr_test_ground'] }).reason).toBe('shipping_country_not_approved');

    const physical = {
      ...current,
      id: 'cs_physical',
      metadata: {
        purpose: 'physical_book',
        product_key: HARDCOVER_EDITION_KEY,
        amount_cents: '4999',
      },
      amount_subtotal: 4999,
      amount_total: 5999,
      total_details: { amount_tax: 0, amount_shipping: 1000 },
      line_items: {
        data: [{
          quantity: 1,
          price: {
            id: 'price_hardcover_test',
            unit_amount: 4999,
            currency: 'usd',
            livemode: false,
            type: 'one_time',
            product: 'prod_hardcover_test',
          },
        }],
      },
    };
    expect(planPhysicalFulfillment({ session: physical, approvedRates: ['shr_test_ground'] }).shipping.line1).toBe('9 Current St');

    const store = memoryStore();
    const sent = [];
    const missing = { ...legacy, id: 'cs_missing_shipping', shipping_details: undefined };
    const stripe = {
      retrieveCheckoutSession: async () => missing,
      mailer: { send: async (payload) => { sent.push(payload); return { success: true }; } },
      origin: 'https://caidens-courage-staging.netlify.app',
      approvedRates: ['shr_test_ground'],
    };
    const failed = await processAcademyWebhookEvent({
      event: { id: 'evt_missing_address', type: 'checkout.session.completed', data: { object: missing } },
      store,
      stripe,
      now,
    });
    expect(failed.outcome).toBe('shipping_address_missing');
    expect(store.orders).toHaveLength(0);
    expect(sent).toHaveLength(0);

    const replay = await processAcademyWebhookEvent({
      event: { id: 'evt_missing_address', type: 'checkout.session.completed', data: { object: current } },
      store,
      stripe: { ...stripe, retrieveCheckoutSession: async () => current },
      now,
    });
    expect(replay.outcome).toBe('duplicate');
    expect(store.orders).toHaveLength(0);
    expect(sent).toHaveLength(0);

    const recoveredSession = { ...current, id: 'cs_missing_shipping' };
    const recovered = await recoverRecordedBundlePurchase({
      recordedEvent: { id: 'evt_missing_address', type: 'checkout.session.completed', outcome: 'shipping_address_missing' },
      session: recoveredSession,
      store,
      mailer: stripe.mailer,
      origin: 'https://caidens-courage-staging.netlify.app',
      approvedRates: ['shr_test_ground'],
      now,
    });
    expect(recovered).toMatchObject({ granted: false, outcome: 'invitation_sent' });
    expect(store.orders).toHaveLength(1);
    expect(sent).toHaveLength(1);
    await expect(store.eventOutcome('evt_missing_address')).resolves.toBe('shipping_address_missing');

    const second = await recoverRecordedBundlePurchase({
      recordedEvent: { id: 'evt_missing_address', type: 'checkout.session.completed', outcome: 'shipping_address_missing' },
      session: recoveredSession,
      store,
      mailer: stripe.mailer,
      origin: 'https://caidens-courage-staging.netlify.app',
      approvedRates: ['shr_test_ground'],
      now,
    });
    expect(second.outcome).toBe('duplicate');
    expect(store.orders).toHaveLength(1);
    expect(sent).toHaveLength(1);
  });

  test('refuses a production claim host and a recurring bundle price', async () => {
    const store = memoryStore();
    const session = paidBundleSession({ productKey: PAPERBACK_BUNDLE_KEY, amount: 5999 });
    await expect(processAcademyWebhookEvent({
      event: { id: 'evt_origin', type: 'checkout.session.completed', data: { object: session } },
      store,
      stripe: {
        retrieveCheckoutSession: async () => session,
        mailer: { send: async () => ({ success: true }) },
        origin: 'https://caidenscourage.com',
        approvedRates: ['shr_test_ground'],
      },
      now,
    })).rejects.toThrow('staging_origin_required');
    expect(store.orders).toHaveLength(0);
    expect(store.events.has('evt_origin')).toBe(false);

    const recurringStore = memoryStore();
    const recurring = paidBundleSession({ productKey: HARDCOVER_BUNDLE_KEY, amount: 7599 });
    recurring.id = 'cs_recurring';
    recurring.line_items.data[0].price.recurring = { interval: 'month' };
    recurring.line_items.data[0].price.type = 'recurring';
    const recurringResult = await processAcademyWebhookEvent({
      event: { id: 'evt_recurring', type: 'checkout.session.completed', data: { object: recurring } },
      store: recurringStore,
      stripe: {
        retrieveCheckoutSession: async () => recurring,
        mailer: { send: async () => ({ success: true }) },
        origin: 'https://caidens-courage-staging.netlify.app',
        approvedRates: ['shr_test_ground'],
      },
      now,
    });
    expect(recurringResult.outcome).toBe('subscription_not_allowed');
    expect(recurringStore.orders).toHaveLength(0);
    expect(recurringStore.offers).toHaveLength(0);
  });

  test('records the signature reserve purchase as 90 days and rejects failed, mismatched, and historical payments', async () => {
    const store = memoryStore();
    const session = paidBundleSession({ productKey: HARDCOVER_BUNDLE_KEY, amount: 7599, email: 'parent@example.com' });
    const sent = [];
    const result = await processAcademyWebhookEvent({
      event: { id: 'evt_reserve', type: 'checkout.session.completed', data: { object: session } },
      store,
      stripe: {
        retrieveCheckoutSession: async () => session,
        mailer: { send: async (payload) => { sent.push(payload); return { success: true }; } },
        origin: 'https://caidens-courage-staging.netlify.app',
      },
      now,
    });
    expect(result.granted).toBe(false);
    expect(store.offers[0].durationDays).toBe(90);
    expect(sent[0].days).toBe(90);

    const failed = memoryStore();
    const failedResult = await processAcademyWebhookEvent({
      event: { id: 'evt_failed', type: 'checkout.session.async_payment_failed', data: { object: { ...session, id: 'cs_failed', payment_status: 'unpaid' } } },
      store: failed,
      stripe: { retrieveCheckoutSession: async (id) => ({ ...session, id, payment_status: 'unpaid', metadata: session.metadata }) },
      now,
    });
    expect(failedResult).toMatchObject({ granted: false, outcome: 'payment_not_completed' });
    expect(failed.offers).toHaveLength(0);

    const mismatch = memoryStore();
    const badTax = { ...session, id: 'cs_tax', amount_total: session.amount_subtotal };
    const mismatchResult = await processAcademyWebhookEvent({
      event: { id: 'evt_tax', type: 'checkout.session.completed', data: { object: badTax } },
      store: mismatch,
      stripe: { retrieveCheckoutSession: async () => badTax, mailer: { send: async () => ({ success: true }) }, origin: 'https://example.test' },
      now,
    });
    expect(mismatchResult.outcome).toBe('total_mismatch');
    expect(mismatch.orders).toHaveLength(0);

    const historical = { ...session, id: 'cs_old', metadata: { ...session.metadata, product_key: 'hardcover_bundle' } };
    const historicalStore = memoryStore();
    const historicalResult = await processAcademyWebhookEvent({
      event: { id: 'evt_old', type: 'checkout.session.completed', data: { object: historical } },
      store: historicalStore,
      stripe: { retrieveCheckoutSession: async () => historical, mailer: { send: async () => ({ success: true }) }, origin: 'https://example.test' },
      now,
    });
    expect(historicalResult.outcome).toBe('historical_record_locked');
    expect(historicalStore.orders).toHaveLength(0);
  });

  test('does not record a webhook success when the invitation email fails, and rejects bad claim tokens', async () => {
    const store = memoryStore();
    const session = paidBundleSession({ productKey: PAPERBACK_BUNDLE_KEY, amount: 5999 });
    await expect(processAcademyWebhookEvent({
      event: { id: 'evt_email', type: 'checkout.session.completed', data: { object: session } },
      store,
      stripe: {
        retrieveCheckoutSession: async () => session,
        mailer: { send: async () => ({ success: false }) },
        origin: 'https://caidens-courage-staging.netlify.app',
      },
      now,
    })).rejects.toThrow('invitation_email_failed');
    expect(store.events.has('evt_email')).toBe(false);
    expect(store.orders).toHaveLength(1);

    expect(planClaimTokenUse({
      tokenRow: { purpose: 'invitation', usedAt: null, expiresAt: '2026-10-20T11:00:00Z' },
      now,
      purpose: 'invitation',
    }).reason).toBe('token_expired');
    expect(planClaimTokenUse({
      tokenRow: { purpose: 'invitation', usedAt: '2026-10-20T11:00:00Z', expiresAt: '2026-10-20T13:00:00Z' },
      now,
      purpose: 'invitation',
    }).reason).toBe('token_used');
    expect(planBundleCheckout({
      secretKey: 'sk_test_123',
      salesEnabled: false,
      emailConfigured: true,
      shippingRateIds: ['shr_test_ground'],
      product: {
        key: PAPERBACK_BUNDLE_KEY,
        title: 'Paperback Adventure Bundle',
        displayPriceCents: 5999,
        currency: 'usd',
        isActive: true,
        stripePriceId: 'price_bundle_test',
        paymentLinkVerifiedAt: '2026-10-20T00:00:00Z',
      },
    }).reason).toBe('bundle_sales_disabled');
    expect(planBundleCheckout({
      secretKey: 'sk_live_123',
      salesEnabled: true,
      emailConfigured: true,
      shippingRateIds: ['shr_test_ground'],
      product: { key: HARDCOVER_BUNDLE_KEY, displayPriceCents: 7599, currency: 'usd', isActive: true, stripePriceId: 'price_bundle_test', paymentLinkVerifiedAt: '2026-10-20T00:00:00Z' },
    }).reason).toBe('live_billing_disabled');
  });

  test('migration does not alter historical orders or start billing', () => {
    const sql = fs.readFileSync(path.join(process.cwd(), 'supabase/migrations/20261020_academy_memberships.sql'), 'utf8');
    expect(sql).toContain('focus_flame_family_monthly');
    expect(sql).toContain('999');
    expect(sql).toContain('9900');
    expect(sql).toContain('is_active');
    expect(sql.toLowerCase()).not.toMatch(/update\s+public\.bookstore_orders/);
    expect(sql.toLowerCase()).not.toMatch(/update\s+public\.digital_entitlements/);
    expect(sql).not.toContain('hardcover_bundle');
    const fulfillment = fs.readFileSync(path.join(process.cwd(), 'supabase/migrations/20261020_academy_bundle_fulfillment.sql'), 'utf8');
    expect(fulfillment).toContain('bookstore_order_fulfillment');
    expect(fulfillment).toContain('academy_claim_tokens');
    expect(fulfillment.toLowerCase()).not.toMatch(/update\s+public\.bookstore_orders/);
    expect(fulfillment).not.toContain('fZufZggqHbSg7cjd7O3Ru04');
    const checkout = fs.readFileSync(path.join(process.cwd(), 'netlify/functions/bookstore-checkout.js'), 'utf8');
    expect(checkout).toContain('DIGITAL_PRODUCT_KEY');
    expect(checkout).not.toContain('courage_adventure_paperback_bundle');
  });

  test('opens a test-mode hardcover session only and never starts Academy access', () => {
    const product = {
      key: HARDCOVER_EDITION_KEY,
      title: 'Hardcover Edition',
      displayPriceCents: 4999,
      currency: 'usd',
      isActive: true,
      stripePriceId: 'price_hardcover_test',
      paymentLinkVerifiedAt: '2026-10-20T00:00:00Z',
    };
    expect(planPhysicalCheckout({
      secretKey: 'sk_test_123',
      salesEnabled: true,
      shippingRateIds: ['shr_test_ground'],
      product,
    })).toMatchObject({ ok: true, amountCents: 4999, days: 0, purpose: 'physical_book' });
    expect(planPhysicalCheckout({
      secretKey: 'sk_live_123',
      salesEnabled: true,
      shippingRateIds: ['shr_test_ground'],
      product,
    }).reason).toBe('live_billing_disabled');
    expect(planPhysicalCheckout({
      secretKey: 'sk_test_123',
      salesEnabled: false,
      shippingRateIds: ['shr_test_ground'],
      product,
    }).reason).toBe('physical_sales_disabled');
    expect(planPhysicalCheckout({
      secretKey: 'sk_test_123',
      salesEnabled: true,
      shippingRateIds: [],
      product,
    }).reason).toBe('shipping_not_configured');
    expect(planPhysicalCheckout({
      secretKey: 'sk_test_123',
      salesEnabled: true,
      shippingRateIds: ['shr_test_ground'],
      product: { ...product, paymentLinkUrl: 'https://buy.stripe.com/4gMaEW3DVcWkdAHebS3Ru07' },
    }).reason).toBe('historical_record_locked');
    expect(planBundleCheckout({
      secretKey: 'sk_test_123',
      salesEnabled: true,
      emailConfigured: true,
      shippingRateIds: ['shr_test_ground'],
      product: {
        key: PAPERBACK_BUNDLE_KEY,
        displayPriceCents: 5999,
        currency: 'usd',
        isActive: true,
        stripePriceId: 'price_bundle_test',
        stripeProductId: 'prod_paperback_bundle',
        paymentLinkUrl: 'https://buy.stripe.com/4gMaEW3DVcWkdAHebS3Ru07',
      },
    }).reason).toBe('historical_record_locked');
    expect(planBundleCheckout({
      secretKey: 'sk_test_123',
      salesEnabled: true,
      emailConfigured: true,
      shippingRateIds: ['shr_test_ground'],
      product: {
        key: PAPERBACK_BUNDLE_KEY,
        title: 'Paperback Adventure Bundle',
        displayPriceCents: 5999,
        currency: 'usd',
        isActive: true,
        stripePriceId: 'price_paperback_bundle',
        stripeProductId: 'prod_paperback_bundle',
      },
    })).toMatchObject({ ok: true, amountCents: 5999, days: 30, stripeProductId: 'prod_paperback_bundle' });
    expect(planBundleCheckout({
      secretKey: 'sk_test_123',
      salesEnabled: true,
      emailConfigured: true,
      shippingRateIds: ['shr_test_ground'],
      product: {
        key: HARDCOVER_BUNDLE_KEY,
        title: 'Signature Reserve Hardcover Bundle',
        displayPriceCents: 7599,
        currency: 'usd',
        isActive: true,
        stripePriceId: 'price_founders_reserve',
        stripeProductId: 'prod_founders_reserve',
      },
    })).toMatchObject({ ok: true, amountCents: 7599, days: 90, stripeProductId: 'prod_founders_reserve' });
    expect(planBundleCheckout({
      secretKey: 'sk_test_123',
      salesEnabled: true,
      emailConfigured: true,
      shippingRateIds: ['shr_test_ground'],
      product: {
        key: PAPERBACK_BUNDLE_KEY,
        displayPriceCents: 5999,
        currency: 'usd',
        isActive: true,
        stripePriceId: 'price_paperback_bundle',
      },
    }).reason).toBe('price_not_verified');
    expect(bundlePriceMatches({
      id: 'price_paperback_bundle',
      unit_amount: 5999,
      currency: 'usd',
      livemode: false,
      type: 'one_time',
      product: 'prod_paperback_bundle',
    }, {
      priceId: 'price_paperback_bundle',
      amountCents: 5999,
      stripeProductId: 'prod_paperback_bundle',
    })).toBe(true);
    expect(bundlePriceMatches({
      id: 'price_paperback_bundle',
      unit_amount: 5900,
      currency: 'usd',
      product: 'prod_paperback_bundle',
    }, {
      priceId: 'price_paperback_bundle',
      amountCents: 5999,
      stripeProductId: 'prod_paperback_bundle',
    })).toBe(false);

    const physicalSource = fs.readFileSync(path.join(process.cwd(), 'netlify/functions/bookstore-physical-checkout.js'), 'utf8');
    expect(physicalSource).toContain("body.set('mode', 'payment')");
    expect(physicalSource).not.toContain('academy_days');
    expect(physicalSource).not.toContain("mode', 'subscription'");
    expect(physicalSource).toContain("metadata[purpose]', 'physical_book'");
    expect(physicalSource).toContain('STRIPE_AUTOMATIC_TAX_ENABLED');
    const { buildPhysicalCheckoutParams } = require('../../../netlify/functions/bookstore-physical-checkout');
    const params = buildPhysicalCheckoutParams({
      plan: { priceId: 'price_hardcover_test', productKey: 'hardcover', title: 'Hardcover Edition', amountCents: 4999, shippingRateIds: ['shr_test_ground'] },
      successUrl: 'https://example.test/story/books?hardcover=submitted',
      cancelUrl: 'https://example.test/story/books',
      automaticTax: false,
    });
    expect(params.get('mode')).toBe('payment');
    expect(params.get('shipping_address_collection[allowed_countries][0]')).toBe('US');
    expect(params.get('shipping_address_collection[allowed_countries][1]')).toBeNull();
    expect(params.get('shipping_options[0][shipping_rate]')).toBe('shr_test_ground');
    expect(params.get('automatic_tax[enabled]')).toBeNull();
    expect(params.get('metadata[academy_days]')).toBeNull();
    const bundleSource = fs.readFileSync(path.join(process.cwd(), 'netlify/functions/academy-bundle-checkout.js'), 'utf8');
    expect(bundleSource).toContain('applyCheckoutShippingCountries');
    expect(bundleSource).not.toContain("'CA'");
    const countries = new URLSearchParams();
    applyCheckoutShippingCountries(countries);
    expect(countries.get('shipping_address_collection[allowed_countries][0]')).toBe('US');
    expect(countries.get('shipping_address_collection[allowed_countries][1]')).toBeNull();
    const canada = paidBundleSession({ productKey: PAPERBACK_BUNDLE_KEY, amount: 5999 });
    canada.shipping_details.address.country = 'CA';
    expect(planBundleFulfillment({ session: canada, approvedRates: ['shr_test_ground'] }).reason).toBe('shipping_country_not_approved');
  });

  test('records a hardcover order without an invitation and refunds only the matching bundle entitlement', async () => {
    const store = memoryStore();
    const session = {
      ...paidBundleSession({ productKey: HARDCOVER_EDITION_KEY, amount: 4999, tax: 0 }),
      id: 'cs_hardcover',
      mode: 'payment',
      payment_intent: 'pi_hardcover',
      metadata: {
        purpose: 'physical_book',
        product_key: HARDCOVER_EDITION_KEY,
        amount_cents: '4999',
        product_title: 'Hardcover Edition',
      },
    };
    const sent = [];
    const result = await processAcademyWebhookEvent({
      event: { id: 'evt_hardcover', type: 'checkout.session.completed', data: { object: session } },
      store,
      stripe: {
        retrieveCheckoutSession: async () => session,
        mailer: { send: async (payload) => { sent.push(payload); return { success: true }; } },
        approvedRates: ['shr_test_ground'],
      },
      now,
    });
    expect(result).toMatchObject({ granted: false, outcome: 'physical_order_recorded', academyDays: 0 });
    expect(store.offers).toHaveLength(0);
    expect(store.orders).toHaveLength(1);
    expect(store.fulfillments[0]).toMatchObject({ taxCents: 0, shippingCents: 599, rateId: 'shr_test_ground' });
    expect(sent).toHaveLength(0);

    const duplicate = await processAcademyWebhookEvent({
      event: { id: 'evt_hardcover', type: 'checkout.session.completed', data: { object: session } },
      store,
      stripe: { retrieveCheckoutSession: async () => session },
    });
    expect(duplicate.outcome).toBe('duplicate');
    expect(store.orders).toHaveLength(1);

    store.entitlements.push(
      { id: 'ent_family', kind: 'unrestricted_promise', status: 'active', orderReference: 'historical', promiseSource: 'founders_guardian_language' },
      { id: 'ent_bundle', kind: 'bundle_included', status: 'active', orderReference: 'cs_bundle_refund' },
    );
    const bundleSession = paidBundleSession({ productKey: PAPERBACK_BUNDLE_KEY, amount: 5999 });
    bundleSession.id = 'cs_bundle_refund';
    bundleSession.payment_intent = 'pi_bundle_refund';
    await processAcademyWebhookEvent({
      event: { id: 'evt_bundle_refund_purchase', type: 'checkout.session.completed', data: { object: bundleSession } },
      store,
      stripe: {
        retrieveCheckoutSession: async () => bundleSession,
        mailer: { send: async () => ({ success: true }) },
        origin: 'https://caidens-courage-staging.netlify.app',
        approvedRates: ['shr_test_ground'],
      },
      now,
    });
    const bundleOrder = store.orders.find((order) => order.sessionId === 'cs_bundle_refund');
    const partial = await processAcademyWebhookEvent({
      event: {
        id: 'evt_partial',
        type: 'charge.refunded',
        data: { object: { object: 'charge', id: 'ch_partial', refunded: false, amount_refunded: 100, currency: 'usd', payment_intent: 'pi_bundle_refund' } },
      },
      store,
      stripe: {},
    });
    expect(partial).toMatchObject({ outcome: 'partial_refund', revoked: false });
    expect(bundleOrder.status).toBe('paid');
    expect(store.entitlements.find((item) => item.id === 'ent_bundle').status).toBe('active');

    const full = await processAcademyWebhookEvent({
      event: {
        id: 'evt_full',
        type: 'charge.refunded',
        data: { object: { object: 'charge', id: 'ch_full', refunded: true, amount_refunded: bundleOrder.amountCents, currency: 'usd', payment_intent: 'pi_bundle_refund' } },
      },
      store,
      stripe: {},
    });
    expect(full).toMatchObject({ outcome: 'full_refund', revoked: true });
    expect(bundleOrder.status).toBe('refunded');
    expect(store.entitlements.find((item) => item.id === 'ent_bundle').status).toBe('canceled');
    expect(store.entitlements.find((item) => item.id === 'ent_family').status).toBe('active');

    const hardcoverOrder = store.orders.find((order) => order.sessionId === 'cs_hardcover');
    const hardcoverRefund = await processAcademyWebhookEvent({
      event: {
        id: 'evt_hardcover_refund',
        type: 'charge.refunded',
        data: { object: { object: 'charge', id: 'ch_hardcover', refunded: true, amount_refunded: hardcoverOrder.amountCents, currency: 'usd', payment_intent: 'pi_hardcover' } },
      },
      store,
      stripe: {},
    });
    expect(hardcoverRefund).toMatchObject({ outcome: 'full_refund', revoked: false });
    expect(hardcoverOrder.status).toBe('refunded');
    expect(store.entitlements.find((item) => item.id === 'ent_family').status).toBe('active');

    expect(planBundleClaim({
      now,
      parentEmail: 'parent@example.com',
      order: {
        proof: 'stripe_webhook',
        status: 'refunded',
        customerEmail: 'parent@example.com',
        productKey: PAPERBACK_BUNDLE_KEY,
        paidAt: '2026-10-01T00:00:00Z',
      },
    }).reason).toBe('purchase_not_verified');

    const { handler } = require('../../../netlify/functions/academy-stripe-webhook');
    const unsigned = await handler({ httpMethod: 'POST', body: '{}', headers: {}, isBase64Encoded: false });
    expect(unsigned.statusCode).toBe(400);
    expect(JSON.parse(unsigned.body).error).toBe('invalid_signature');
  });
});
