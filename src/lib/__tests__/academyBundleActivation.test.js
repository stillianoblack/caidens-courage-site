const {
  HARDCOVER_BUNDLE_KEY,
  PAPERBACK_BUNDLE_KEY,
  hashClaimCode,
  planCommerceRefund,
} = require('../../../netlify/functions/_lib/academyMembership');
const {
  activateBundleForSignedInFamily,
  buildAcademyHandoffCookie,
  establishBundleHandoff,
  expectedEndsAt,
  publicActivationBody,
  readAcademyHandoff,
  readBundleHandoff,
} = require('../../../netlify/functions/_lib/academyBundleActivation');
const { handleBundleExchange } = require('../../../netlify/functions/academy-bundle-exchange');
const { handleBundleClaim } = require('../../../netlify/functions/academy-bundle-claim');
const { createSupabaseBundleStore } = require('../../../netlify/functions/_lib/academyBundleStore');
const { RECOVERED_FOUNDERS_RESERVE_SESSION_ID } = require('../../../netlify/functions/_lib/activationPreviewGuard');

const NOW = new Date('2026-11-03T15:30:00.000Z');
const INVITE = 'invite-fixture-token';
const HANDOFF = 'handoff-fixture-secret';
const PURCHASE_EMAIL = 'parent@example.com';

function memoryStore(overrides = {}) {
  const tokens = overrides.tokens || [{
    id: 'invite-1',
    claimId: 'claim-1',
    purpose: 'invitation',
    tokenHash: hashClaimCode(INVITE),
    expiresAt: '2026-11-03T16:00:00.000Z',
    usedAt: '2026-11-03T15:10:00.000Z',
  }];
  const claims = overrides.claims || [{
    id: 'claim-1',
    productKey: HARDCOVER_BUNDLE_KEY,
    customerEmail: PURCHASE_EMAIL,
    durationDays: 90,
    purchaseVerifiedAt: '2026-11-01T00:00:00.000Z',
    claimDeadlineAt: '2026-12-01T00:00:00.000Z',
    activatedAt: null,
    entitlementId: null,
    checkoutSessionId: 'cs_test_existing',
  }];
  const families = overrides.families || [{
    id: 'program-1',
    adminEmail: PURCHASE_EMAIL,
    accessCode: 'FAM-EXAMPLE',
  }];
  const orders = overrides.orders || [{
    sessionId: 'cs_test_existing',
    status: 'paid',
    productKey: HARDCOVER_BUNDLE_KEY,
  }];
  const entitlements = overrides.entitlements || [];
  const lookups = [];
  let loseNextUpdate = false;
  return {
    tokens,
    claims,
    entitlements,
    lookups,
    orderWrites: 0,
    claimWrites: 0,
    loseNextUpdate() {
      loseNextUpdate = true;
    },
    async tokenByHash(hash) {
      return tokens.find((token) => token.tokenHash === hash) || null;
    },
    async claimById(id) {
      return claims.find((claim) => claim.id === id) || null;
    },
    async insertActivationToken(row) {
      tokens.push({
        id: `handoff-${tokens.length + 1}`,
        claimId: row.claimId,
        purpose: 'activation',
        tokenHash: row.tokenHash,
        expiresAt: row.expiresAt,
        usedAt: null,
      });
    },
    async familyByAccessCode(code) {
      lookups.push(code);
      return families.find((family) => family.accessCode === code) || null;
    },
    async orderBySession(sessionId) {
      return orders.find((order) => order.sessionId === sessionId) || null;
    },
    async activeEntitlementForOrder(sessionId) {
      return entitlements.find((item) => item.orderReference === sessionId && item.kind === 'bundle_included' && item.status !== 'canceled') || null;
    },
    async insertEntitlement(entitlement) {
      const row = { id: `ent-${entitlements.length + 1}`, ...entitlement };
      entitlements.push(row);
      return { id: row.id };
    },
    async activateClaim({ claimId, entitlementId, activatedAt }) {
      const claim = claims.find((item) => item.id === claimId);
      if (!claim || claim.activatedAt) return false;
      if (loseNextUpdate) {
        loseNextUpdate = false;
        return false;
      }
      claim.activatedAt = activatedAt;
      claim.entitlementId = entitlementId;
      return true;
    },
    async cancelEntitlement(id) {
      const entitlement = entitlements.find((item) => item.id === id);
      if (entitlement) entitlement.status = 'canceled';
    },
    async markTokenUsed(id, usedAt) {
      const token = tokens.find((item) => item.id === id);
      if (token && !token.usedAt) token.usedAt = usedAt;
    },
  };
}

function activeGrants(store) {
  return store.entitlements.filter((item) => item.kind === 'bundle_included' && item.status === 'active');
}

describe('bundle invitation handoff', () => {
  test('keeps a ready invitation across a later visit without the email token', async () => {
    const store = memoryStore();
    const opened = await establishBundleHandoff({
      store,
      invitationToken: INVITE,
      now: NOW,
      secret: HANDOFF,
    });
    const response = publicActivationBody(opened);
    expect(response).toEqual({
      granted: false,
      ready: true,
      days: 90,
      productKey: HARDCOVER_BUNDLE_KEY,
    });
    expect(JSON.stringify(response)).not.toContain(INVITE);
    expect(JSON.stringify(response)).not.toContain(HANDOFF);
    expect(opened.cookie).toContain('HttpOnly');
    expect(opened.cookie).toContain('Secure');
    expect(opened.cookie).not.toContain(INVITE);
    expect(readAcademyHandoff(opened.cookie)).toBe(HANDOFF);
    expect(store.tokens.find((token) => token.id === 'invite-1').usedAt).toBe('2026-11-03T15:10:00.000Z');
    expect(store.orderWrites).toBe(0);
    expect(store.claimWrites).toBe(0);

    const returned = await readBundleHandoff({ store, handoffSecret: HANDOFF, now: NOW });
    expect(publicActivationBody(returned)).toMatchObject({ ready: true, days: 90 });
    expect(JSON.stringify(publicActivationBody(returned))).not.toContain(HANDOFF);
  });

  test('http exchange sets the cookie and the next visit can omit the invitation token', async () => {
    const store = memoryStore();
    const first = await handleBundleExchange({
      httpMethod: 'POST',
      headers: { 'x-forwarded-proto': 'https' },
      body: JSON.stringify({ token: INVITE }),
    }, { store, now: NOW, secret: HANDOFF });
    const firstBody = JSON.parse(first.body);
    expect(firstBody).toEqual({
      granted: false,
      ready: true,
      days: 90,
      productKey: HARDCOVER_BUNDLE_KEY,
    });
    expect(first.body).not.toContain(INVITE);
    expect(first.body).not.toContain(HANDOFF);
    expect(first.headers['Set-Cookie']).toContain('HttpOnly');
    expect(first.headers['Set-Cookie']).not.toContain(INVITE);

    const second = await handleBundleExchange({
      httpMethod: 'POST',
      headers: { cookie: first.headers['Set-Cookie'] },
      body: JSON.stringify({}),
    }, { store, now: NOW });
    expect(JSON.parse(second.body)).toMatchObject({ ready: true, days: 90 });
    expect(second.body).not.toContain(HANDOFF);
    expect(second.headers['Set-Cookie']).toBeUndefined();
  });

  test('an expired handoff does not grant access and can be replaced by recovery', async () => {
    const store = memoryStore({
      tokens: [{
        id: 'handoff-old',
        claimId: 'claim-1',
        purpose: 'activation',
        tokenHash: hashClaimCode(HANDOFF),
        expiresAt: '2026-11-03T15:00:00.000Z',
        usedAt: null,
      }],
    });
    const resumed = await readBundleHandoff({ store, handoffSecret: HANDOFF, now: NOW });
    expect(resumed).toMatchObject({ ok: false, reason: 'token_expired' });
    const blocked = await activateBundleForSignedInFamily({
      store,
      handoffSecret: HANDOFF,
      familyAccessCode: 'FAM-EXAMPLE',
      parentEmail: PURCHASE_EMAIL,
      now: NOW,
    });
    expect(blocked).toMatchObject({ ok: false, reason: 'token_expired' });
    expect(activeGrants(store)).toHaveLength(0);
    expect(store.claims[0].activatedAt).toBeNull();
  });

  test('cookie helper round-trips without using browser storage keys', () => {
    const cookie = buildAcademyHandoffCookie(HANDOFF);
    expect(readAcademyHandoff(`theme=light; ${cookie}; other=1`)).toBe(HANDOFF);
    expect(cookie).not.toContain('localStorage');
    expect(cookie).not.toContain('sessionStorage');
  });
});

describe('bundle activation for a signed-in family', () => {
  async function openAndActivate(store, { accessCode = 'FAM-EXAMPLE', email = PURCHASE_EMAIL, now = NOW, env } = {}) {
    await establishBundleHandoff({ store, invitationToken: INVITE, now, secret: HANDOFF });
    return activateBundleForSignedInFamily({
      store,
      handoffSecret: HANDOFF,
      familyAccessCode: accessCode,
      parentEmail: email,
      now,
      env,
    });
  }

  test('preparation cannot activate the recovered founders reserve claim', async () => {
    const store = memoryStore({
      claims: [{
        id: 'claim-1',
        productKey: HARDCOVER_BUNDLE_KEY,
        customerEmail: PURCHASE_EMAIL,
        durationDays: 90,
        purchaseVerifiedAt: '2026-11-01T00:00:00.000Z',
        claimDeadlineAt: '2026-12-01T00:00:00.000Z',
        activatedAt: null,
        entitlementId: null,
        checkoutSessionId: RECOVERED_FOUNDERS_RESERVE_SESSION_ID,
      }],
      orders: [{
        sessionId: RECOVERED_FOUNDERS_RESERVE_SESSION_ID,
        status: 'paid',
        productKey: HARDCOVER_BUNDLE_KEY,
      }],
    });
    const blocked = await openAndActivate(store, { env: {} });
    expect(blocked).toMatchObject({ ok: false, granted: false, reason: 'recovered_claim_locked' });
    expect(activeGrants(store)).toHaveLength(0);
    expect(store.claims[0].activatedAt).toBeNull();
    expect(store.orderWrites).toBe(0);
    expect(store.claimWrites).toBe(0);
  });

  test('new and existing families activate the original claim once', async () => {
    const store = memoryStore();
    const first = await openAndActivate(store);
    expect(first).toMatchObject({ granted: true, duplicate: false });
    expect(first.startsAt).toBe(NOW.toISOString());
    expect(first.startsAt).not.toBe(store.claims[0].purchaseVerifiedAt);
    expect(first.endsAt).toBe(expectedEndsAt(NOW, 90));
    expect(activeGrants(store)).toHaveLength(1);
    expect(activeGrants(store)[0]).toMatchObject({
      familyProgramId: 'program-1',
      customerEmail: PURCHASE_EMAIL,
      orderReference: 'cs_test_existing',
      kind: 'bundle_included',
    });

    const second = await activateBundleForSignedInFamily({
      store,
      handoffSecret: HANDOFF,
      familyAccessCode: 'FAM-EXAMPLE',
      parentEmail: PURCHASE_EMAIL,
      now: new Date('2026-11-03T15:40:00.000Z'),
    });
    expect(second).toMatchObject({ granted: true, duplicate: true });
    expect(activeGrants(store)).toHaveLength(1);
    expect(store.orderWrites).toBe(0);
    expect(store.claimWrites).toBe(0);
    expect(store.claims).toHaveLength(1);
  });

  test('a 30-day paperback bundle starts on activation', async () => {
    const store = memoryStore({
      claims: [{
        id: 'claim-1',
        productKey: PAPERBACK_BUNDLE_KEY,
        customerEmail: PURCHASE_EMAIL,
        durationDays: 30,
        purchaseVerifiedAt: '2026-10-01T00:00:00.000Z',
        claimDeadlineAt: '2026-12-01T00:00:00.000Z',
        activatedAt: null,
        entitlementId: null,
        checkoutSessionId: 'cs_test_existing',
      }],
      orders: [{ sessionId: 'cs_test_existing', status: 'paid', productKey: PAPERBACK_BUNDLE_KEY }],
    });
    const result = await openAndActivate(store);
    expect(result.startsAt).toBe(NOW.toISOString());
    expect(result.endsAt).toBe(expectedEndsAt(NOW, 30));
    expect(activeGrants(store)).toHaveLength(1);
  });

  test('rejects a family access code that does not belong to the purchase email', async () => {
    const store = memoryStore({
      families: [
        { id: 'program-other', adminEmail: 'other@example.com', accessCode: 'FAM-OTHER' },
        { id: 'program-1', adminEmail: PURCHASE_EMAIL, accessCode: 'FAM-EXAMPLE' },
      ],
    });
    await establishBundleHandoff({ store, invitationToken: INVITE, now: NOW, secret: HANDOFF });
    const mismatched = await handleBundleClaim({
      httpMethod: 'POST',
      headers: { cookie: buildAcademyHandoffCookie(HANDOFF) },
      body: JSON.stringify({
        programCode: 'CMP-EXAMPLE',
        familyAccessCode: 'FAM-OTHER',
        parentEmail: PURCHASE_EMAIL,
      }),
    }, { store, now: NOW });
    expect(mismatched.statusCode).toBe(409);
    expect(JSON.parse(mismatched.body)).toMatchObject({ error: 'email_mismatch', granted: false });
    expect(store.lookups).toEqual(['FAM-OTHER']);
    expect(activeGrants(store)).toHaveLength(0);

    const codeOnly = await handleBundleClaim({
      httpMethod: 'POST',
      headers: { cookie: buildAcademyHandoffCookie(HANDOFF) },
      body: JSON.stringify({ programCode: 'CMP-EXAMPLE' }),
    }, { store, now: NOW });
    expect(codeOnly.statusCode).toBe(400);
    expect(store.lookups).toEqual(['FAM-OTHER']);
    expect(activeGrants(store)).toHaveLength(0);
  });

  test('does not grant a refunded purchase and still revokes an included entitlement on a full refund', async () => {
    const store = memoryStore({
      orders: [{ sessionId: 'cs_test_existing', status: 'refunded', productKey: HARDCOVER_BUNDLE_KEY }],
    });
    const result = await openAndActivate(store);
    expect(result).toMatchObject({ ok: false, reason: 'purchase_not_verified' });
    expect(activeGrants(store)).toHaveLength(0);
    expect(store.claims[0].activatedAt).toBeNull();

    expect(planCommerceRefund({
      order: { productKey: HARDCOVER_BUNDLE_KEY, amountCents: 7599, currency: 'usd' },
      charge: { refunded: true, amount_refunded: 7599, currency: 'usd' },
      entitlement: { kind: 'bundle_included', status: 'active' },
    })).toMatchObject({ revoke: true, reason: 'full_refund' });
    expect(planCommerceRefund({
      order: { productKey: HARDCOVER_BUNDLE_KEY, amountCents: 7599, currency: 'usd' },
      charge: { refunded: true, amount_refunded: 7599, currency: 'usd' },
      entitlement: { kind: 'unrestricted_promise', status: 'active', promiseSource: 'founders_guardian_language' },
    }).revoke).toBe(false);
  });

  test('a lost activation update cannot leave a second active entitlement', async () => {
    const store = memoryStore();
    store.loseNextUpdate();
    await establishBundleHandoff({ store, invitationToken: INVITE, now: NOW, secret: HANDOFF });
    const lost = await activateBundleForSignedInFamily({
      store,
      handoffSecret: HANDOFF,
      familyAccessCode: 'FAM-EXAMPLE',
      parentEmail: PURCHASE_EMAIL,
      now: NOW,
    });
    expect(lost).toMatchObject({ granted: true, duplicate: true });
    expect(activeGrants(store)).toHaveLength(0);
    expect(store.entitlements).toHaveLength(1);
    expect(store.entitlements[0].status).toBe('canceled');
    expect(store.claims[0].activatedAt).toBeNull();
  });

  test('links an existing included entitlement instead of inserting another', async () => {
    const store = memoryStore({
      entitlements: [{
        id: 'ent-existing',
        kind: 'bundle_included',
        status: 'active',
        startsAt: '2026-11-03T15:00:00.000Z',
        orderReference: 'cs_test_existing',
      }],
    });
    const result = await openAndActivate(store);
    expect(result.duplicate).toBe(true);
    expect(store.entitlements).toHaveLength(1);
    expect(store.claims[0].entitlementId).toBe('ent-existing');
  });
});

describe('supabase family lookup', () => {
  test('uses the family access code and not the program code', async () => {
    const filters = [];
    const client = {
      from(table) {
        const api = {
          select() { return api; },
          eq(column, value) {
            filters.push({ table, column, value });
            return api;
          },
          maybeSingle: async () => ({ data: null, error: null }),
        };
        return api;
      },
    };
    await createSupabaseBundleStore(client).familyByAccessCode('FAM-EXAMPLE');
    expect(filters).toEqual([
      { table: 'pilot_programs', column: 'family_access_code', value: 'FAM-EXAMPLE' },
    ]);
  });
});
