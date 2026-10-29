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
  planClaimTokenUse,
  PAPERBACK_BUNDLE_KEY,
  HARDCOVER_BUNDLE_KEY,
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
  const events = new Set();
  const subscriptions = [];
  const offers = [];
  const payments = [];
  const failures = [];
  const orders = [];
  const fulfillments = [];
  const tokens = [];
  return {
    events,
    subscriptions,
    offers,
    payments,
    failures,
    orders,
    fulfillments,
    tokens,
    async hasEvent(id) { return events.has(id); },
    async recordEvent(id) { events.add(id); },
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
    },
    line_items: {
      data: [{ quantity: 1, price: { id: 'price_bundle_test', unit_amount: amount, currency: 'usd', livemode: false } }],
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
        origin: 'https://example.test',
        approvedRates: ['shr_test_ground'],
      },
      now,
    });
    expect(result).toMatchObject({ granted: false, outcome: 'invitation_sent' });
    expect(store.offers[0].durationDays).toBe(30);
    expect(store.offers[0].claimCode).toBeUndefined();
    expect(store.orders).toHaveLength(1);
    expect(store.fulfillments[0]).toMatchObject({ line1: '1 Vale Lane', taxCents: 480, shippingCents: 599, methodLabel: 'Ground' });
    expect(sent[0].claimUrl).toContain('https://example.test/story/books/claim#token=');
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
        origin: 'https://example.test',
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
        origin: 'https://example.test',
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
});
