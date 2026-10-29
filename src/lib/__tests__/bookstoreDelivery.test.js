const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {
  HISTORICAL_PAPERBACK_LINK,
  RECOVERY_PUBLIC_MESSAGE,
  createMemoryBookstoreStore,
  createRecoveryCode,
  hashRecoveryCode,
  planDigitalCheckout,
  planDigitalFulfillment,
  planPaymentLinkActivation,
  processBookstoreWebhookEvent,
  requestBookstoreRecovery,
  redeemRecoveryToken,
  resolveDigitalDownload,
  verifyStripeSignature,
} = require('../../../netlify/functions/_lib/bookstoreDelivery');

function signedHeader(body, secret, timestamp = Math.floor(Date.now() / 1000)) {
  const signature = crypto.createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
  return { header: `t=${timestamp},v1=${signature}`, timestamp };
}

function paidSession(overrides = {}) {
  return {
    id: 'cs_test_123',
    object: 'checkout.session',
    payment_status: 'paid',
    amount_total: 1599,
    currency: 'usd',
    customer_details: { email: 'Reader@Example.com' },
    payment_intent: 'pi_123',
    metadata: {
      product_key: 'digital_edition',
      product_title: 'Caiden Vale and the Focus Flame',
      amount_cents: '1599',
    },
    ...overrides,
  };
}

function seedIntent(store, overrides = {}) {
  return store.saveIntent({
    stripeCheckoutSessionId: 'cs_test_123',
    productKey: 'digital_edition',
    productTitleSnapshot: 'Caiden Vale and the Focus Flame',
    amountCents: 1599,
    currency: 'usd',
    stripePriceId: 'price_123',
    recoveryCodeHash: hashRecoveryCode('unused-server-secret'),
    ...overrides,
  });
}

function stripeDouble(overrides = {}) {
  const amount = overrides.unitAmount ?? 1599;
  return {
    async retrieveCheckoutProof() {
      if (overrides.proofError) throw overrides.proofError;
      return {
        lineItems: [
          {
            quantity: overrides.quantity ?? 1,
            amount_total: overrides.lineAmount ?? amount,
            currency: overrides.lineCurrency ?? 'usd',
            price: {
              id: overrides.priceId ?? 'price_123',
              unit_amount: amount,
              currency: overrides.priceCurrency ?? 'usd',
              active: overrides.active !== false,
            },
          },
        ],
        price: {
          id: overrides.priceId ?? 'price_123',
          unit_amount: amount,
          currency: overrides.priceCurrency ?? 'usd',
          active: overrides.active !== false,
        },
      };
    },
    async retrieveCharge() {
      if (overrides.chargeError) throw overrides.chargeError;
      return overrides.charge;
    },
  };
}

function mailerDouble() {
  const sent = [];
  return {
    sent,
    async send(payload) {
      sent.push(payload);
      return { success: true };
    },
  };
}

function paidEvent(store, extras = {}) {
  return processBookstoreWebhookEvent({
    event: {
      id: extras.id || 'evt_paid',
      type: extras.type || 'checkout.session.completed',
      data: { object: extras.session || paidSession() },
    },
    store,
    stripe: extras.stripe || stripeDouble(),
    mailer: extras.mailer || mailerDouble(),
    origin: 'https://caidenvale.com',
    now: extras.now || Date.parse('2026-10-19T12:00:00Z'),
  });
}

describe('bookstore digital delivery', () => {
  test('verifies Stripe signatures and rejects tampering or stale timestamps', () => {
    const body = JSON.stringify({ id: 'evt_1' });
    const secret = 'whsec_test';
    const { header } = signedHeader(body, secret);
    expect(verifyStripeSignature(body, header, secret)).toBe(true);
    expect(verifyStripeSignature(`${body} `, header, secret)).toBe(false);
    expect(verifyStripeSignature(body, header, 'other')).toBe(false);
    const stale = signedHeader(body, secret, Math.floor(Date.now() / 1000) - 1000);
    expect(verifyStripeSignature(body, stale.header, secret)).toBe(false);
  });

  test('does not open digital checkout from a client price or before the owner enables sales', () => {
    expect(planDigitalCheckout({
      envEnabled: true,
      emailConfigured: true,
      product: {
        key: 'digital_edition',
        title: 'Caiden Vale and the Focus Flame',
        displayPriceCents: 1599,
        currency: 'usd',
        stripePriceId: 'price_123',
        digitalSalesEnabled: true,
      },
    }).ok).toBe(true);

    expect(planDigitalCheckout({
      envEnabled: false,
      emailConfigured: true,
      product: {
        key: 'digital_edition',
        title: 'Caiden Vale and the Focus Flame',
        displayPriceCents: 1599,
        currency: 'usd',
        stripePriceId: 'price_123',
        digitalSalesEnabled: true,
      },
    }).ok).toBe(false);

    expect(planDigitalCheckout({
      envEnabled: true,
      emailConfigured: false,
      product: {
        key: 'digital_edition',
        title: 'Caiden Vale and the Focus Flame',
        displayPriceCents: 1599,
        currency: 'usd',
        stripePriceId: 'price_123',
        digitalSalesEnabled: true,
      },
    }).ok).toBe(false);
  });

  test('grants one entitlement for a verified paid session and ignores duplicate webhooks', async () => {
    const store = createMemoryBookstoreStore();
    const mailer = mailerDouble();
    await seedIntent(store);
    const first = await paidEvent(store, { mailer });
    const second = await paidEvent(store, { mailer });
    expect(first).toMatchObject({ httpStatus: 200, granted: true, outcome: 'granted' });
    expect(second).toMatchObject({ outcome: 'duplicate', granted: false });
    expect(store.entitlements).toHaveLength(1);
    expect(store.entitlements[0].customerEmail).toBe('reader@example.com');
    expect(store.orders.get('cs_test_123').productTitleSnapshot).toBe('Caiden Vale and the Focus Flame');
    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0].downloadPageUrl).toContain('https://caidenvale.com/story/books/download#token=');
    expect(mailer.sent[0].downloadPageUrl).not.toMatch(/digital-books|supabase\.co/);
  });

  test('rejects currency and Stripe price mismatches without granting access', async () => {
    const currencyStore = createMemoryBookstoreStore();
    await seedIntent(currencyStore);
    const currency = await paidEvent(currencyStore, { session: paidSession({ currency: 'eur' }) });
    expect(currency).toMatchObject({ httpStatus: 200, granted: false, outcome: 'currency_mismatch' });
    expect(currencyStore.entitlements).toHaveLength(0);

    const priceStore = createMemoryBookstoreStore();
    await seedIntent(priceStore);
    const price = await paidEvent(priceStore, { stripe: stripeDouble({ unitAmount: 5999, lineAmount: 5999 }) });
    expect(price).toMatchObject({ granted: false, outcome: 'price_amount_mismatch' });
    expect(priceStore.entitlements).toHaveLength(0);

    const mismatch = planDigitalFulfillment({
      session: paidSession({ amount_total: 1000, metadata: { product_key: 'digital_edition', amount_cents: '1599' } }),
      intent: {
        stripeCheckoutSessionId: 'cs_test_123',
        productKey: 'digital_edition',
        productTitleSnapshot: 'Caiden Vale and the Focus Flame',
        amountCents: 1599,
        currency: 'usd',
        stripePriceId: 'price_123',
        recoveryCodeHash: 'hash',
      },
    });
    expect(mismatch.grant).toBe(false);
    expect(mismatch.reason).toBe('paid_price_mismatch');
  });

  test('retries transient fulfillment failures and does not acknowledge a failed entitlement as granted', async () => {
    const store = createMemoryBookstoreStore();
    await seedIntent(store);
    const transient = new Error('stripe_unavailable');
    transient.retryable = true;
    const first = await paidEvent(store, { stripe: stripeDouble({ proofError: transient }) });
    expect(first).toMatchObject({ httpStatus: 500, granted: false });
    expect(store.events.size).toBe(0);
    expect(store.entitlements).toHaveLength(0);

    store.failEntitlement = true;
    const failedGrant = await paidEvent(store);
    expect(failedGrant).toMatchObject({ httpStatus: 500, granted: false });
    expect(store.events.size).toBe(0);
    expect(store.entitlements).toHaveLength(0);

    const retried = await paidEvent(store);
    expect(retried).toMatchObject({ httpStatus: 200, granted: true });
    expect(store.entitlements).toHaveLength(1);
    const duplicate = await paidEvent(store);
    expect(duplicate.outcome).toBe('duplicate');
    expect(store.entitlements).toHaveLength(1);
  });

  test('revokes access only for a full refund of the original order', async () => {
    const store = createMemoryBookstoreStore();
    await seedIntent(store);
    await paidEvent(store);
    const partial = await processBookstoreWebhookEvent({
      event: {
        id: 'evt_partial',
        type: 'charge.refunded',
        data: { object: { id: 'ch_123', object: 'charge', payment_intent: 'pi_123' } },
      },
      store,
      stripe: stripeDouble({
        charge: { id: 'ch_123', payment_intent: 'pi_123', amount_refunded: 500, refunded: false, currency: 'usd' },
      }),
    });
    expect(partial).toMatchObject({ granted: false, revoked: false, outcome: 'partial_refund' });
    expect(store.entitlements[0].status).toBe('active');
    expect(store.orders.get('cs_test_123').status).toBe('paid');

    const unrelated = await processBookstoreWebhookEvent({
      event: {
        id: 'evt_other',
        type: 'charge.refunded',
        data: { object: { id: 'ch_other', object: 'charge', payment_intent: 'pi_other' } },
      },
      store,
      stripe: stripeDouble({
        charge: { id: 'ch_other', payment_intent: 'pi_other', amount_refunded: 1599, refunded: true, currency: 'usd' },
      }),
    });
    expect(unrelated.outcome).toBe('ignored_unrelated');
    expect(store.entitlements[0].status).toBe('active');

    const full = await processBookstoreWebhookEvent({
      event: {
        id: 'evt_full',
        type: 'refund.updated',
        data: { object: { id: 're_123', object: 'refund', status: 'succeeded', charge: 'ch_123', payment_intent: 'pi_123' } },
      },
      store,
      stripe: stripeDouble({
        charge: { id: 'ch_123', payment_intent: 'pi_123', amount_refunded: 1599, refunded: true, currency: 'usd' },
      }),
    });
    expect(full).toMatchObject({ revoked: true, outcome: 'full_refund', granted: false });
    expect(store.entitlements[0].status).toBe('revoked');
    expect(store.orders.get('cs_test_123')).toMatchObject({
      status: 'refunded',
      amountCents: 1599,
      productTitleSnapshot: 'Caiden Vale and the Focus Flame',
      refundedAmountCents: 1599,
    });
    expect(store.refunds.size).toBe(2);
  });

  test('does not revoke a paid order when its checkout session expires', async () => {
    const store = createMemoryBookstoreStore();
    await seedIntent(store);
    await paidEvent(store);
    const expired = await processBookstoreWebhookEvent({
      event: { id: 'evt_expired', type: 'checkout.session.expired', data: { object: paidSession() } },
      store,
    });
    expect(expired.outcome).toBe('ignored_paid_session');
    expect(store.entitlements[0].status).toBe('active');

    const unpaidStore = createMemoryBookstoreStore();
    await seedIntent(unpaidStore);
    const unpaidExpired = await processBookstoreWebhookEvent({
      event: {
        id: 'evt_expired_unpaid',
        type: 'checkout.session.expired',
        data: { object: paidSession({ payment_status: 'unpaid' }) },
      },
      store: unpaidStore,
    });
    expect(unpaidExpired.outcome).toBe('expired');
    expect(unpaidStore.entitlements).toHaveLength(0);
    expect(unpaidStore.orders.get('cs_test_123').status).toBe('expired');
  });

  test('uses single-use recovery tokens and does not reveal who purchased', async () => {
    const store = createMemoryBookstoreStore();
    const mailer = mailerDouble();
    await seedIntent(store);
    await paidEvent(store, { mailer, now: Date.parse('2026-10-19T12:00:00Z') });
    const token = decodeURIComponent(new URL(mailer.sent[0].downloadPageUrl).hash.replace('#token=', ''));
    const now = Date.parse('2026-10-19T12:10:00Z');
    const preview = await redeemRecoveryToken({ token, store, now, consume: false });
    expect(preview.ok).toBe(true);

    const expired = await redeemRecoveryToken({
      token,
      store,
      now: Date.parse('2026-10-19T13:00:00Z'),
      consume: false,
    });
    expect(expired.ok).toBe(false);

    const freshStore = createMemoryBookstoreStore();
    await seedIntent(freshStore);
    const freshMailer = mailerDouble();
    await paidEvent(freshStore, { mailer: freshMailer, now: Date.parse('2026-10-19T12:00:00Z') });
    const freshToken = decodeURIComponent(new URL(freshMailer.sent[0].downloadPageUrl).hash.replace('#token=', ''));
    const redeemed = await redeemRecoveryToken({
      token: freshToken,
      store: freshStore,
      now: Date.parse('2026-10-19T12:10:00Z'),
      consume: true,
    });
    expect(redeemed.ok).toBe(true);
    const reused = await redeemRecoveryToken({
      token: freshToken,
      store: freshStore,
      now: Date.parse('2026-10-19T12:11:00Z'),
      consume: true,
    });
    expect(reused.ok).toBe(false);

    const signer = jest.fn(async ({ objectPath }) => `https://signed.example/${objectPath}?token=short`);
    const unauthorized = await resolveDigitalDownload({
      entitlement: freshStore.entitlements[0],
      file: { productKey: 'digital_edition', bucketId: 'digital-books', objectPath: 'private/owner-copy.epub' },
      email: 'reader@example.com',
      signer,
      ttlSeconds: 120,
    });
    expect(unauthorized.statusCode).toBe(403);
    expect(signer).not.toHaveBeenCalled();

    const ready = await resolveDigitalDownload({
      entitlement: freshStore.entitlements[0],
      file: { productKey: 'digital_edition', bucketId: 'digital-books', objectPath: 'private/owner-copy.epub' },
      email: redeemed.email,
      tokenAuthenticated: true,
      signer,
      ttlSeconds: 120,
    });
    expect(ready.statusCode).toBe(200);
    expect(ready.body.downloadUrl).toContain('https://signed.example/');

    const missing = await resolveDigitalDownload({
      entitlement: freshStore.entitlements[0],
      file: { productKey: 'digital_edition', bucketId: 'digital-books', objectPath: null },
      email: redeemed.email,
      tokenAuthenticated: true,
      signer,
      ttlSeconds: 120,
    });
    expect(missing.statusCode).toBe(409);
    expect(missing.body.error).toBe('missing_file');

    const buyer = await requestBookstoreRecovery({
      email: 'reader@example.com',
      ip: '10.0.0.1',
      store: freshStore,
      mailer: freshMailer,
      origin: 'https://caidenvale.com',
      now: Date.parse('2026-10-19T12:20:00Z'),
    });
    const stranger = await requestBookstoreRecovery({
      email: 'stranger@example.com',
      ip: '10.0.0.2',
      store: freshStore,
      mailer: freshMailer,
      origin: 'https://caidenvale.com',
      now: Date.parse('2026-10-19T12:20:00Z'),
    });
    expect(buyer.body).toEqual(stranger.body);
    expect(buyer.body.message).toBe(RECOVERY_PUBLIC_MESSAGE);
    expect(freshMailer.sent.filter((message) => message.to === 'stranger@example.com')).toHaveLength(0);

    const limitedMailer = mailerDouble();
    const limitedStore = createMemoryBookstoreStore();
    limitedStore.entitlements.push({
      id: 'ent_limit',
      orderId: 'order_limit',
      productKey: 'digital_edition',
      customerEmail: 'reader@example.com',
      status: 'active',
    });
    for (let attempt = 0; attempt < 6; attempt += 1) {
      await requestBookstoreRecovery({
        email: 'reader@example.com',
        ip: `10.0.0.${attempt}`,
        store: limitedStore,
        mailer: limitedMailer,
        origin: 'https://caidenvale.com',
        now: Date.parse('2026-10-19T15:00:00Z') + attempt,
      });
    }
    expect(limitedMailer.sent).toHaveLength(5);
  });

  test('keeps one entitlement when recovery email fails and does not send a second email for a replay', async () => {
    const store = createMemoryBookstoreStore();
    const mailer = {
      sent: [],
      fail: true,
      async send(payload) {
        if (this.fail) return { success: false };
        this.sent.push(payload);
        return { success: true };
      },
    };
    await seedIntent(store);
    const failed = await paidEvent(store, { mailer });
    expect(failed).toMatchObject({ httpStatus: 500, granted: false, outcome: 'recovery_email_failed' });
    expect(store.entitlements).toHaveLength(1);
    expect(store.orders.size).toBe(1);
    expect(store.events.size).toBe(0);

    mailer.fail = false;
    const retried = await paidEvent(store, { mailer });
    expect(retried).toMatchObject({ httpStatus: 200, granted: true });
    expect(store.entitlements).toHaveLength(1);
    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0].idempotencyKey).toBe('bookstore-recovery-order_1-2');

    const replay = await paidEvent(store, { mailer, id: 'evt_async', type: 'checkout.session.async_payment_succeeded' });
    expect(replay).toMatchObject({ httpStatus: 200, granted: true });
    expect(mailer.sent).toHaveLength(1);
    expect(store.entitlements).toHaveLength(1);

    const order = store.orders.get('cs_test_123');
    store.deliveries.set(order.id, {
      orderId: order.id,
      status: 'sending',
      attempt: 2,
      sentAt: null,
      updatedAt: Date.now(),
    });
    const inFlight = await paidEvent(store, { mailer, id: 'evt_inflight' });
    expect(inFlight).toMatchObject({ httpStatus: 500, outcome: 'recovery_email_in_progress', granted: false });
    expect(mailer.sent).toHaveLength(1);
    expect(store.orders.get('cs_test_123').status).toBe('paid');
    expect(store.orders.get('cs_test_123').amountCents).toBe(1599);
  });

  test('rejects mismatched payment links and leaves the historical bundle locked', () => {
    expect(planPaymentLinkActivation({
      key: 'hardcover_bundle',
      displayPriceCents: 4999,
      currency: 'usd',
      paymentLinkUrl: 'https://buy.stripe.com/new',
      isActive: true,
      current: null,
      proof: null,
    }).reason).toBe('historical_record_locked');

    const mismatched = planPaymentLinkActivation({
      key: 'hardcover',
      displayPriceCents: 4999,
      currency: 'usd',
      paymentLinkUrl: 'https://buy.stripe.com/stale',
      isActive: true,
      current: null,
      proof: {
        lineItems: [{ quantity: 1, price: { id: 'price_old', unit_amount: 5999, currency: 'usd', active: true } }],
      },
    });
    expect(mismatched.ok).toBe(false);
    expect(mismatched.reason).toBe('payment_link_price_mismatch');

    expect(planPaymentLinkActivation({
      key: 'courage_adventure_bundle',
      displayPriceCents: 7599,
      currency: 'usd',
      paymentLinkUrl: 'https://checkout.stripe.com/c/pay/cs_old',
      isActive: true,
      current: null,
      proof: null,
    }).reason).toBe('invalid_payment_link');

    const verified = planPaymentLinkActivation({
      key: 'hardcover',
      displayPriceCents: 4999,
      currency: 'usd',
      paymentLinkUrl: 'https://buy.stripe.com/hardcover',
      isActive: true,
      current: null,
      proof: {
        lineItems: [{ quantity: 1, price: { id: 'price_hc', unit_amount: 4999, currency: 'usd', active: true } }],
      },
    });
    expect(verified).toMatchObject({ ok: true, verifiedPriceId: 'price_hc' });

    expect(planPaymentLinkActivation({
      key: 'paperback',
      displayPriceCents: 3000,
      currency: 'usd',
      paymentLinkUrl: HISTORICAL_PAPERBACK_LINK,
      isActive: true,
      current: {
        paymentLinkUrl: HISTORICAL_PAPERBACK_LINK,
        displayPriceCents: 3000,
        currency: 'usd',
        isActive: true,
      },
      proof: null,
    }).ok).toBe(true);
  });

  test('keeps the purchased title when a later failed payment arrives and does not grant it', async () => {
    const store = createMemoryBookstoreStore();
    await seedIntent(store);
    await paidEvent(store);
    await store.saveOrder({
      productKey: 'digital_edition',
      productTitleSnapshot: 'Renamed later',
      amountCents: 1599,
      currency: 'usd',
      customerEmail: 'reader@example.com',
      stripeCheckoutSessionId: 'cs_test_123',
      stripePaymentIntentId: 'pi_123',
      status: 'paid',
    });
    expect(store.orders.get('cs_test_123').productTitleSnapshot).toBe('Caiden Vale and the Focus Flame');

    const failedStore = createMemoryBookstoreStore();
    await seedIntent(failedStore);
    const failed = await processBookstoreWebhookEvent({
      event: {
        id: 'evt_failed',
        type: 'checkout.session.async_payment_failed',
        data: { object: paidSession({ payment_status: 'unpaid' }) },
      },
      store: failedStore,
      stripe: stripeDouble(),
    });
    expect(failed.granted).toBe(false);
    expect(failedStore.entitlements).toHaveLength(0);
    expect(failedStore.orders.get('cs_test_123').status).toBe('failed');
  });

  test('migration does not rewrite the historical bundle and rollback does not delete purchases', () => {
    const root = path.join(__dirname, '../../..');
    const sql = fs.readFileSync(path.join(root, 'supabase/migrations/20261019_bookstore_digital_delivery.sql'), 'utf8');
    expect(sql.toLowerCase()).not.toMatch(/update\s+public\.commerce_products/);
    expect(sql).toContain('on conflict (key) do nothing');
    expect(sql).toContain("'digital_edition', null");
    expect(sql).toContain('public = false');
    expect(sql).toContain('grant select, insert, update on table public.bookstore_orders to service_role');
    expect(sql.toLowerCase()).not.toContain('grant delete');
    expect(sql).not.toContain('SUPABASE_SERVICE_ROLE_KEY');

    const rollback = fs.readFileSync(path.join(root, 'supabase/rollbacks/20261019_bookstore_digital_delivery_rollback.sql'), 'utf8');
    expect(rollback.toLowerCase()).not.toMatch(/delete\s+from\s+public\.bookstore_orders/);
    expect(rollback).toContain('No customer records were deleted');

    const quarantinePath = path.join(root, 'supabase/rollbacks/quarantine/20261019_bookstore_digital_delivery_DESTRUCTIVE_DO_NOT_RUN.sql');
    expect(fs.existsSync(path.join(root, 'supabase/migrations/20261019_bookstore_digital_delivery_DESTRUCTIVE_DO_NOT_RUN.sql'))).toBe(false);
    if (fs.existsSync(quarantinePath)) {
      expect(fs.readFileSync(quarantinePath, 'utf8')).toContain('DO NOT RUN');
    }

    const paperbackBundle = fs.readFileSync(path.join(root, 'supabase/migrations/20261020_courage_adventure_paperback_bundle.sql'), 'utf8');
    expect(paperbackBundle).toContain("'courage_adventure_paperback_bundle'");
    expect(paperbackBundle).toContain('5999');
    expect(paperbackBundle).toContain('on conflict (key) do nothing');
    expect(paperbackBundle.toLowerCase()).not.toMatch(/update\s+public\.commerce_products/);
    expect(paperbackBundle).not.toContain('hardcover_bundle');

    const lock = fs.readFileSync(path.join(root, 'supabase/migrations/20261019_commerce_products_lock_writes.sql'), 'utf8');
    expect(lock.toLowerCase()).toContain('revoke insert, update, delete on table public.commerce_products from public, anon, authenticated');
    expect(lock.toLowerCase()).toContain('grant select on table public.commerce_products to anon, authenticated');
    expect(lock.toLowerCase()).not.toMatch(/delete\s+from\s+public\.commerce_products/);
    expect(lock).toContain('commerce_products_admin_update');

    const offers = fs.readFileSync(path.join(root, 'src/components/bookstore/BookstoreOffers.tsx'), 'utf8');
    expect(offers).not.toMatch(/SERVICE_ROLE|createSignedUrl|digital-books|sessionStorage|recoveryCode/);
    expect(createRecoveryCode()).not.toContain('http');
  });
});
