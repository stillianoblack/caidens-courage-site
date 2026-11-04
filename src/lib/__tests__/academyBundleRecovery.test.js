const mockState = {
  inserts: [],
  sends: 0,
  lastUrl: '',
  origin: 'https://caidens-courage-staging.netlify.app',
  claim: {
    id: 'claim-1',
    product_key: 'courage_adventure_bundle',
    duration_days: 90,
    claim_deadline_at: '2026-12-01T00:00:00.000Z',
    activated_at: null,
  },
};

function mockQuery(table) {
  const api = {
    select() { return api; },
    eq() { return api; },
    gte() { return api; },
    is() { return api; },
    order() { return api; },
    limit() { return api; },
    maybeSingle: async () => ({
      data: table === 'academy_bundle_claims' ? mockState.claim : null,
      error: null,
    }),
    insert: async () => {
      mockState.inserts.push(table);
      return { error: null };
    },
    then(onFulfilled, onRejected) {
      return Promise.resolve({ data: [], error: null }).then(onFulfilled, onRejected);
    },
  };
  return api;
}

jest.mock('../../../netlify/functions/_lib/bookstoreDelivery', () => ({
  getServiceClient: () => ({ from: (table) => mockQuery(table) }),
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
    mockState.sends += 1;
    mockState.lastUrl = input.claimUrl;
    return Promise.resolve({ success: true });
  },
}));

const { handler } = require('../../../netlify/functions/academy-bundle-recovery');

describe('academy bundle recovery', () => {
  beforeEach(() => {
    mockState.inserts = [];
    mockState.sends = 0;
    mockState.lastUrl = '';
    mockState.origin = 'https://caidens-courage-staging.netlify.app';
    mockState.claim = {
      id: 'claim-1',
      product_key: 'courage_adventure_bundle',
      duration_days: 90,
      claim_deadline_at: '2026-12-01T00:00:00.000Z',
      activated_at: null,
    };
  });

  test('sends a replacement invitation for the existing claim without a new order', async () => {
    const response = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({ email: 'parent@example.com' }),
    });
    expect(response.statusCode).toBe(200);
    expect(mockState.inserts).toEqual(['academy_claim_tokens']);
    expect(mockState.sends).toBe(1);
    expect(mockState.inserts).not.toContain('bookstore_orders');
    expect(mockState.inserts).not.toContain('academy_bundle_claims');
    expect(mockState.inserts).not.toContain('academy_entitlements');
    expect(mockState.lastUrl.startsWith('https://caidens-courage-staging.netlify.app/story/books/claim#token=')).toBe(true);
  });

  test('ignores a caller-supplied origin and keeps the approved preview host', async () => {
    const response = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({
        email: 'parent@example.com',
        origin: 'https://caidenscourage.com',
      }),
    });
    expect(response.statusCode).toBe(200);
    expect(mockState.sends).toBe(1);
    expect(mockState.lastUrl.startsWith('https://caidens-courage-staging.netlify.app/story/books/claim#token=')).toBe(true);
    expect(mockState.lastUrl).not.toContain('caidenscourage.com');
  });

  test('does not email the recovered founders reserve claim', async () => {
    const { RECOVERED_FOUNDERS_RESERVE_SESSION_ID } = jest.requireActual('../../../netlify/functions/_lib/activationPreviewGuard');
    mockState.claim = {
      ...mockState.claim,
      checkout_session_id: RECOVERED_FOUNDERS_RESERVE_SESSION_ID,
    };
    const response = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({ email: 'parent@example.com' }),
    });
    expect(response.statusCode).toBe(200);
    expect(mockState.inserts).toEqual([]);
    expect(mockState.sends).toBe(0);
  });

  test('branch deploy sends the explicitly allowlisted deploy URL', async () => {
    const previous = {
      CONTEXT: process.env.CONTEXT,
      URL: process.env.URL,
      DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL,
      ACADEMY_PREVIEW_ORIGINS: process.env.ACADEMY_PREVIEW_ORIGINS,
    };
    const previewOrigin = 'https://preview-academy-bundle-activation--caidens-courage-staging.netlify.app';
    process.env.CONTEXT = 'branch-deploy';
    process.env.URL = 'https://caidens-courage-staging.netlify.app';
    process.env.DEPLOY_PRIME_URL = previewOrigin;
    process.env.ACADEMY_PREVIEW_ORIGINS = previewOrigin;
    mockState.origin = 'https://caidenscourage.com';
    try {
      const response = await handler({
        httpMethod: 'POST',
        body: JSON.stringify({
          email: 'parent@example.com',
          origin: 'https://caidenscourage.com',
        }),
      });
      expect(response.statusCode).toBe(200);
      expect(mockState.sends).toBe(1);
      expect(mockState.lastUrl.startsWith(`${previewOrigin}/story/books/claim#token=`)).toBe(true);
      expect(mockState.lastUrl).not.toContain('caidenscourage.com');
      expect(mockState.lastUrl.startsWith('https://caidens-courage-staging.netlify.app/')).toBe(false);
    } finally {
      Object.entries(previous).forEach(([key, value]) => {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      });
    }
  });

  test('branch deploy does not send when its deploy URL is not explicitly allowlisted', async () => {
    const previous = {
      CONTEXT: process.env.CONTEXT,
      URL: process.env.URL,
      DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL,
      ACADEMY_PREVIEW_ORIGINS: process.env.ACADEMY_PREVIEW_ORIGINS,
    };
    process.env.CONTEXT = 'branch-deploy';
    process.env.URL = 'https://caidens-courage-staging.netlify.app';
    process.env.DEPLOY_PRIME_URL = 'https://preview-academy-bundle-activation--caidens-courage-staging.netlify.app';
    delete process.env.ACADEMY_PREVIEW_ORIGINS;
    try {
      const response = await handler({
        httpMethod: 'POST',
        body: JSON.stringify({
          email: 'parent@example.com',
          origin: process.env.DEPLOY_PRIME_URL,
        }),
      });
      expect(response.statusCode).toBe(503);
      expect(mockState.inserts).toEqual([]);
      expect(mockState.sends).toBe(0);
    } finally {
      Object.entries(previous).forEach(([key, value]) => {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      });
    }
  });

  test('refuses an unknown or production public origin', async () => {
    mockState.origin = 'https://preview.example';
    const unknown = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({ email: 'parent@example.com' }),
    });
    expect(unknown.statusCode).toBe(503);
    mockState.origin = 'https://caidenscourage.com';
    const production = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({ email: 'parent@example.com' }),
    });
    expect(production.statusCode).toBe(503);
    expect(mockState.inserts).toEqual([]);
    expect(mockState.sends).toBe(0);
  });

  test('an expired claim does not create an invitation or an order', async () => {
    mockState.claim = {
      ...mockState.claim,
      claim_deadline_at: '2026-10-01T00:00:00.000Z',
    };
    const response = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({ email: 'parent@example.com' }),
    });
    expect(response.statusCode).toBe(200);
    expect(mockState.inserts).toEqual([]);
    expect(mockState.sends).toBe(0);
  });
});
