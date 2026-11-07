const mockState = {
  inserts: [],
  deletes: [],
  sends: [],
  tokens: [],
  origin: 'https://caidens-courage-staging.netlify.app',
  claims: [],
  orders: [],
  recentInvitations: 0,
  sendResult: { success: true },
};

function mockQuery(table) {
  const filters = [];
  const api = {
    select() { return api; },
    eq(column, value) { filters.push(['eq', column, value]); return api; },
    gte() { return api; },
    gt() { return api; },
    is() { return api; },
    in(column, values) { filters.push(['in', column, values]); return api; },
    order() { return api; },
    limit() { return api; },
    insert(row) {
      return {
        select() {
          return {
            single: async () => {
              if (mockState.insertError) return { data: null, error: mockState.insertError };
              const id = `token-${mockState.inserts.length + 1}`;
              mockState.inserts.push({ table, row, id });
              mockState.tokens.push({ id, claimId: row.claim_id, fresh: true });
              return { data: { id }, error: null };
            },
          };
        },
      };
    },
    delete() {
      return {
        eq(column, value) {
          mockState.deletes.push({ table, column, value });
          mockState.tokens.forEach((token) => {
            if (token.id === value) token.fresh = false;
          });
          return Promise.resolve({ error: null });
        },
      };
    },
    then(onFulfilled, onRejected) {
      return Promise.resolve(resolveQuery(table, filters)).then(onFulfilled, onRejected);
    },
  };
  return api;
}

function resolveQuery(table, filters) {
  if (table === 'academy_bundle_claims') {
    const email = filters.find((filter) => filter[0] === 'eq' && filter[1] === 'customer_email')?.[2];
    return { data: mockState.claims.filter((claim) => claim.customer_email === email), error: null };
  }
  if (table === 'bookstore_orders') {
    const ids = filters.find((filter) => filter[0] === 'in')?.[2] || [];
    return {
      data: mockState.orders.filter((order) => ids.includes(order.stripe_checkout_session_id)),
      error: null,
    };
  }
  if (table === 'academy_claim_tokens') {
    const claimId = filters.find((filter) => filter[0] === 'eq' && filter[1] === 'claim_id')?.[2];
    if (claimId) {
      return {
        data: mockState.tokens.filter((token) => token.claimId === claimId && token.fresh).map((token) => ({ id: token.id })),
        error: null,
      };
    }
    return {
      data: Array.from({ length: mockState.recentInvitations }, (_, index) => ({ id: `recent-${index}` })),
      error: null,
    };
  }
  return { data: [], error: null };
}

jest.mock('../../../netlify/functions/_lib/bookstoreDelivery', () => ({
  jsonResponse: (statusCode, body) => ({
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body),
  }),
  publicSiteOrigin: () => mockState.origin,
}));

jest.mock('../../../netlify/functions/_lib/activationPreviewGuard', () => {
  const actual = jest.requireActual('../../../netlify/functions/_lib/activationPreviewGuard');
  return {
    ...actual,
    createActivationServiceClient: () => ({ from: (table) => mockQuery(table) }),
  };
});

jest.mock('../../../netlify/functions/_lib/emailProvider', () => ({
  sendAcademyClaimEmail: (input) => {
    mockState.sends.push(input);
    return Promise.resolve(mockState.sendResult);
  },
}));

const { handler, PUBLIC_MESSAGE } = require('../../../netlify/functions/academy-bundle-recovery');
const { RECOVERED_FOUNDERS_RESERVE_SESSION_ID } = jest.requireActual('../../../netlify/functions/_lib/activationPreviewGuard');

function claim(overrides) {
  return {
    id: 'claim-hardcover',
    customer_email: 'parent@example.com',
    product_key: 'courage_adventure_bundle',
    duration_days: 90,
    claim_deadline_at: '2026-12-01T00:00:00.000Z',
    activated_at: null,
    checkout_session_id: 'cs_test_hardcover',
    purchase_verified_at: '2026-11-07T15:18:12.754Z',
    ...overrides,
  };
}

function order(sessionId, productKey, status = 'paid') {
  return { stripe_checkout_session_id: sessionId, product_key: productKey, status };
}

function post(body) {
  return handler({
    httpMethod: 'POST',
    body: JSON.stringify({ email: 'parent@example.com', bundle: 'hardcover', ...body }),
  });
}

describe('academy bundle recovery', () => {
  beforeEach(() => {
    mockState.inserts = [];
    mockState.deletes = [];
    mockState.sends = [];
    mockState.tokens = [];
    mockState.origin = 'https://caidens-courage-staging.netlify.app';
    mockState.recentInvitations = 0;
    mockState.sendResult = { success: true };
    mockState.insertError = null;
    mockState.claims = [claim()];
    mockState.orders = [order('cs_test_hardcover', 'courage_adventure_bundle')];
  });

  test('sends one invitation for the only eligible claim', async () => {
    const response = await post();
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ message: PUBLIC_MESSAGE });
    expect(response.body).not.toContain('claim-hardcover');
    expect(response.body).not.toContain('token=');
    expect(mockState.inserts.map((entry) => entry.row.claim_id)).toEqual(['claim-hardcover']);
    expect(mockState.inserts[0].row.purpose).toBe('invitation');
    expect(mockState.sends).toHaveLength(1);
    expect(mockState.sends[0].days).toBe(90);
    expect(mockState.sends[0].claimUrl.startsWith('https://caidens-courage-staging.netlify.app/story/books/claim#token=')).toBe(true);
    expect(mockState.inserts.some((entry) => entry.table !== 'academy_claim_tokens')).toBe(false);
  });

  test('uses the purchase date when several eligible claims share a bundle', async () => {
    mockState.claims = [
      claim({ id: 'claim-early', checkout_session_id: 'cs_early', purchase_verified_at: '2026-11-01T18:00:00.000Z' }),
      claim({ id: 'claim-later', checkout_session_id: 'cs_later', purchase_verified_at: '2026-11-07T15:18:12.754Z' }),
    ];
    mockState.orders = [
      order('cs_early', 'courage_adventure_bundle'),
      order('cs_later', 'courage_adventure_bundle'),
    ];

    const ambiguous = await post();
    expect(ambiguous.statusCode).toBe(200);
    expect(mockState.sends).toHaveLength(0);
    expect(mockState.inserts).toHaveLength(0);

    const selected = await post({ purchaseDate: '2026-11-07' });
    expect(selected.statusCode).toBe(200);
    expect(mockState.inserts.map((entry) => entry.row.claim_id)).toEqual(['claim-later']);
    expect(mockState.sends[0].days).toBe(90);
    expect(selected.body).not.toContain('claim-later');
  });

  test('skips the locked older claim and invites the selected newer purchase', async () => {
    mockState.claims = [
      claim({
        id: 'claim-locked',
        checkout_session_id: RECOVERED_FOUNDERS_RESERVE_SESSION_ID,
        purchase_verified_at: '2026-11-03T15:01:14.729Z',
      }),
      claim({ id: 'claim-new-hardcover', checkout_session_id: 'cs_new_hardcover' }),
      claim({
        id: 'claim-paperback',
        product_key: 'courage_adventure_paperback_bundle',
        duration_days: 30,
        checkout_session_id: 'cs_paperback',
        purchase_verified_at: '2026-11-07T15:19:59.906Z',
      }),
    ];
    mockState.orders = [
      order(RECOVERED_FOUNDERS_RESERVE_SESSION_ID, 'courage_adventure_bundle'),
      order('cs_new_hardcover', 'courage_adventure_bundle'),
      order('cs_paperback', 'courage_adventure_paperback_bundle'),
    ];

    const hardcover = await post({ bundle: 'hardcover' });
    const paperback = await post({ bundle: 'paperback' });
    expect(hardcover.statusCode).toBe(200);
    expect(paperback.statusCode).toBe(200);
    expect(mockState.inserts.map((entry) => entry.row.claim_id)).toEqual(['claim-new-hardcover', 'claim-paperback']);
    expect(mockState.sends.map((message) => message.days)).toEqual([90, 30]);
    expect(mockState.inserts.some((entry) => entry.row.claim_id === 'claim-locked')).toBe(false);
    expect(hardcover.body).not.toContain(RECOVERED_FOUNDERS_RESERVE_SESSION_ID);
  });

  test('does not email a refunded, activated, unpaid, or expired claim', async () => {
    mockState.orders = [order('cs_test_hardcover', 'courage_adventure_bundle', 'refunded')];
    const refunded = await post();

    mockState.orders = [order('cs_test_hardcover', 'courage_adventure_bundle', 'pending')];
    const unpaid = await post();

    mockState.orders = [order('cs_test_hardcover', 'courage_adventure_bundle')];
    mockState.claims = [claim({ activated_at: '2026-11-07T16:00:00.000Z' })];
    const activated = await post();

    mockState.claims = [claim({ claim_deadline_at: '2026-10-01T00:00:00.000Z' })];
    const expired = await post();

    expect([refunded, unpaid, activated, expired].map((response) => response.statusCode)).toEqual([200, 200, 200, 200]);
    expect(mockState.sends).toHaveLength(0);
    expect(mockState.inserts).toHaveLength(0);
    expect(JSON.parse(refunded.body)).toEqual({ message: PUBLIC_MESSAGE });
  });

  test('keeps the public acknowledgement when invitation sends are rate limited', async () => {
    mockState.recentInvitations = 5;
    const response = await post();
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ message: PUBLIC_MESSAGE });
    expect(mockState.sends).toHaveLength(0);
    expect(mockState.inserts).toHaveLength(0);
  });

  test('removes only the new token when delivery fails', async () => {
    mockState.tokens = [{ id: 'paperback-token', claimId: 'claim-paperback', fresh: true }];
    mockState.sendResult = { success: false };
    const response = await post();
    expect(response.statusCode).toBe(503);
    expect(JSON.parse(response.body).error).toBe('invitation_email_failed');
    expect(mockState.inserts).toHaveLength(1);
    expect(mockState.deletes).toEqual([{ table: 'academy_claim_tokens', column: 'id', value: 'token-1' }]);
    expect(mockState.tokens.find((token) => token.id === 'paperback-token').fresh).toBe(true);
    expect(mockState.tokens.find((token) => token.id === 'token-1').fresh).toBe(false);
  });

  test('a duplicate request does not mint or invalidate an open invitation', async () => {
    mockState.tokens = [{ id: 'open-hardcover', claimId: 'claim-hardcover', fresh: true }];
    mockState.claims.push(claim({
      id: 'claim-paperback',
      product_key: 'courage_adventure_paperback_bundle',
      duration_days: 30,
      checkout_session_id: 'cs_paperback',
    }));
    mockState.orders.push(order('cs_paperback', 'courage_adventure_paperback_bundle'));
    mockState.tokens.push({ id: 'open-paperback', claimId: 'claim-paperback', fresh: true });

    const response = await post();
    expect(response.statusCode).toBe(200);
    expect(mockState.inserts).toHaveLength(0);
    expect(mockState.sends).toHaveLength(0);
    expect(mockState.deletes).toHaveLength(0);
    expect(mockState.tokens.every((token) => token.fresh)).toBe(true);
  });

  test('binds the invitation to the selected claim and leaves the other claim untouched', async () => {
    mockState.claims.push(claim({
      id: 'claim-paperback',
      product_key: 'courage_adventure_paperback_bundle',
      duration_days: 30,
      checkout_session_id: 'cs_paperback',
    }));
    mockState.orders.push(order('cs_paperback', 'courage_adventure_paperback_bundle'));
    mockState.tokens = [{ id: 'open-paperback', claimId: 'claim-paperback', fresh: true }];

    const response = await post({ bundle: 'hardcover' });
    expect(response.statusCode).toBe(200);
    expect(mockState.inserts.map((entry) => entry.row.claim_id)).toEqual(['claim-hardcover']);
    expect(mockState.deletes).toHaveLength(0);
    expect(mockState.tokens.find((token) => token.claimId === 'claim-paperback').fresh).toBe(true);
    expect(mockState.sends[0].claimUrl).toContain('caidens-courage-staging.netlify.app');
    expect(mockState.sends[0].claimUrl).not.toContain('caidenscourage.com');
  });

  test('ignores a caller-supplied origin and refuses an unapproved host', async () => {
    const ignored = await post({ origin: 'https://caidenscourage.com' });
    expect(ignored.statusCode).toBe(200);
    expect(mockState.sends[0].claimUrl.startsWith('https://caidens-courage-staging.netlify.app/story/books/claim#token=')).toBe(true);

    mockState.inserts = [];
    mockState.sends = [];
    mockState.tokens = [];
    mockState.origin = 'https://caidenscourage.com';
    const production = await post();
    expect(production.statusCode).toBe(503);
    expect(mockState.inserts).toHaveLength(0);
    expect(mockState.sends).toHaveLength(0);
  });
});
