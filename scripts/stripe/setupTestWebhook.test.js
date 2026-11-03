const test = require('node:test');
const assert = require('node:assert/strict');
const { WEBHOOK_EVENTS, WEBHOOK_URL } = require('./setupTestCatalog');
const {
  main,
  planWebhook,
  runWebhookSetup,
  stagingSiteAccepted,
  storedSecretAccepted,
} = require('./setupTestWebhook');

const EVENTS = [...WEBHOOK_EVENTS];

function stagingSite(overrides = {}) {
  return {
    name: 'caidens-courage-staging',
    url: 'https://caidens-courage-staging.netlify.app',
    ssl_url: 'https://caidens-courage-staging.netlify.app',
    custom_domain: null,
    account_slug: 'caidens',
    id: 'site_staging',
    build_settings: { repo_branch: 'staging/bookstore-academy-integration' },
    ...overrides,
  };
}

function endpoint(overrides = {}) {
  return {
    id: 'we_test_academy',
    url: WEBHOOK_URL,
    status: 'enabled',
    livemode: false,
    enabled_events: EVENTS,
    ...overrides,
  };
}

function createFakeStripe(options = {}) {
  const state = {
    account: {
      id: 'acct_test1234',
      livemode: false,
      business_profile: { name: options.accountName || 'Caiden\'s Courage', url: options.accountUrl || 'https://caidenscourage.com' },
      settings: { dashboard: { display_name: options.accountName || 'Caiden\'s Courage' } },
      email: options.email || 'owner@caidenscourage.com',
    },
    endpoints: options.endpoints || [],
    posts: [],
    deletes: [],
    gets: [],
  };
  let sequence = 1;

  async function request(spec) {
    const serialized = `${spec.path}\n${spec.body || ''}`;
    if (serialized.includes('sk_') || serialized.includes('whsec_')) throw new Error('secret_leaked_to_stripe');
    if (spec.method === 'GET' && spec.path === 'account') {
      state.gets.push('account');
      return state.account;
    }
    if (spec.method === 'GET' && spec.path.startsWith('webhook_endpoints')) {
      state.gets.push('webhook_endpoints');
      return { data: state.endpoints, has_more: false };
    }
    if (spec.method === 'DELETE') {
      state.deletes.push(spec.path);
      state.endpoints = state.endpoints.filter((item) => !spec.path.endsWith(item.id));
      return { id: spec.path, deleted: true };
    }
    if (spec.method === 'POST') {
      const fields = spec.body instanceof URLSearchParams
        ? spec.body
        : new URLSearchParams(String(spec.body || ''));
      state.posts.push(spec.path);
      if (spec.path === 'webhook_endpoints') {
        const created = endpoint({
          id: `we_created_${sequence}`,
          enabled_events: fields.getAll('enabled_events[]'),
          secret: `whsec_created_${sequence}`,
        });
        sequence += 1;
        state.endpoints.push({ ...created, secret: undefined });
        return created;
      }
      const id = spec.path.split('/')[1];
      const current = state.endpoints.find((item) => item.id === id);
      if (!current) throw new Error('missing_endpoint');
      current.enabled_events = fields.getAll('enabled_events[]');
      current.status = 'enabled';
      return { ...current };
    }
    throw new Error(`unexpected_${spec.method}_${spec.path}`);
  }

  return { state, request };
}

function createFakeNetlify({ present = false, failStore = false, site = stagingSite() } = {}) {
  const state = { identify: 0, stores: 0, accepted: false };
  return {
    state,
    async identify() {
      state.identify += 1;
      const accepted = stagingSiteAccepted(site);
      if (!accepted.ok) {
        const error = new Error(accepted.reason);
        error.identity = true;
        throw error;
      }
      return accepted;
    },
    async secretStatus() {
      return { present, isSecret: present };
    },
    async storeSigningSecret(secret) {
      state.stores += 1;
      state.accepted = typeof secret === 'string' && secret.startsWith('whsec_') && secret.length > 12;
      if (failStore || !state.accepted) throw new Error('netlify_secret_store_rejected');
      return { stored: true };
    },
  };
}

function reportText(report) {
  return JSON.stringify(report);
}

function assertNoSecrets(report) {
  const text = reportText(report);
  assert.equal(text.includes('whsec_'), false);
  assert.equal(text.includes('sk_test_'), false);
  assert.equal(text.includes('sk_live_'), false);
}

test('refuses a live key before any Stripe call', async () => {
  let called = false;
  const { exitCode, report } = await runWebhookSetup({
    env: { STRIPE_TEST_SECRET_KEY: 'sk_live_example' },
    request: async () => { called = true; },
  });
  assert.equal(exitCode, 4);
  assert.equal(called, false);
  assert.equal(report.signingStorage.status, 'not_stored');
  assertNoSecrets(report);
});

test('stops on the wrong Stripe account before creating an endpoint', async () => {
  const fake = createFakeStripe({
    accountName: 'Other Publisher',
    accountUrl: 'https://example.com',
    email: 'owner@example.com',
  });
  const netlify = createFakeNetlify();
  const { exitCode, report } = await runWebhookSetup({
    env: { STRIPE_TEST_SECRET_KEY: 'sk_test_example' },
    request: fake.request,
    netlify,
  });
  assert.equal(exitCode, 3);
  assert.equal(fake.state.posts.length, 0);
  assert.equal(netlify.state.identify, 0);
  assertNoSecrets(report);
});

test('reuses an exact endpoint and does not replace a stored signing value', async () => {
  const fake = createFakeStripe({ endpoints: [endpoint()] });
  const netlify = createFakeNetlify({ present: true });
  const { exitCode, report } = await runWebhookSetup({
    env: { STRIPE_TEST_SECRET_KEY: 'sk_test_example' },
    request: fake.request,
    netlify,
  });
  assert.equal(exitCode, 0);
  assert.equal(fake.state.posts.length, 0);
  assert.equal(netlify.state.stores, 0);
  assert.equal(report.endpoint.action, 'reuse');
  assert.equal(report.endpoint.exactEvents, true);
  assert.deepEqual(report.events, EVENTS);
  assert.equal(report.signingStorage.status, 'already_present');
  assert.equal(report.testEventSent, false);
  assertNoSecrets(report);
});

test('does not create a second endpoint when the signing value is absent', async () => {
  const fake = createFakeStripe({ endpoints: [endpoint()] });
  const netlify = createFakeNetlify({ present: false });
  const { exitCode, report } = await runWebhookSetup({
    env: { STRIPE_TEST_SECRET_KEY: 'sk_test_example' },
    request: fake.request,
    netlify,
  });
  assert.equal(exitCode, 6);
  assert.equal(fake.state.posts.length, 0);
  assert.equal(report.endpoint.action, 'reuse');
  assert.match(report.signingStorage.step, /Do not paste it into chat/);
  assert.equal(report.signingStorage.status, 'manual_required');
  assertNoSecrets(report);
});

test('updates events on the matching endpoint without creating another', async () => {
  const fake = createFakeStripe({ endpoints: [endpoint({ enabled_events: ['checkout.session.completed'] })] });
  const netlify = createFakeNetlify({ present: true });
  const { exitCode, report } = await runWebhookSetup({
    env: { STRIPE_TEST_SECRET_KEY: 'sk_test_example' },
    request: fake.request,
    netlify,
  });
  assert.equal(exitCode, 0);
  assert.deepEqual(fake.state.posts, ['webhook_endpoints/we_test_academy']);
  assert.equal(report.endpoint.exactEvents, true);
  assert.deepEqual(report.endpoint.enabledEvents, EVENTS);
  assert.equal(netlify.state.stores, 0);
  assertNoSecrets(report);
});

test('creates one endpoint and stores the signing value without returning it', async () => {
  const fake = createFakeStripe();
  const netlify = createFakeNetlify();
  const { exitCode, report } = await runWebhookSetup({
    env: { STRIPE_TEST_SECRET_KEY: 'sk_test_example' },
    request: fake.request,
    netlify,
  });
  assert.equal(exitCode, 0);
  assert.equal(fake.state.posts.length, 1);
  assert.equal(netlify.state.stores, 1);
  assert.equal(netlify.state.accepted, true);
  assert.equal(report.endpoint.action, 'created');
  assert.equal(report.endpoint.url, WEBHOOK_URL);
  assert.equal(report.endpoint.livemode, false);
  assert.deepEqual(report.endpoint.enabledEvents, EVENTS);
  assert.equal(report.signingStorage.status, 'stored');
  assert.equal(report.signingStorage.context, 'production');
  assert.deepEqual(report.signingStorage.scopes, ['functions', 'runtime']);
  assert.equal(report.salesFlagsChanged, false);
  assert.equal(report.databaseWrite, false);
  assert.equal(report.testEventSent, false);
  assertNoSecrets(report);

  const again = createFakeNetlify({ present: true });
  const second = await runWebhookSetup({
    env: { STRIPE_TEST_SECRET_KEY: 'sk_test_example' },
    request: fake.request,
    netlify: again,
  });
  assert.equal(second.exitCode, 0);
  assert.equal(fake.state.posts.length, 1);
  assert.equal(second.report.endpoint.action, 'reuse');
  assertNoSecrets(second.report);
});

test('rolls back a created endpoint when staging secret storage fails', async () => {
  const fake = createFakeStripe();
  const netlify = createFakeNetlify({ failStore: true });
  const { exitCode, report } = await runWebhookSetup({
    env: { STRIPE_TEST_SECRET_KEY: 'sk_test_example' },
    request: fake.request,
    netlify,
  });
  assert.equal(exitCode, 5);
  assert.equal(report.endpointRolledBack, true);
  assert.equal(fake.state.deletes.length, 1);
  assert.equal(fake.state.endpoints.length, 0);
  assert.equal(report.signingStorage.status, 'not_stored');
  assertNoSecrets(report);
});

test('rejects the production site before creating an endpoint', async () => {
  const fake = createFakeStripe();
  const netlify = createFakeNetlify({
    site: stagingSite({
      name: 'quiet-pothos-3ae8ce',
      url: 'https://caidenscourage.com',
      ssl_url: 'https://caidenscourage.com',
    }),
  });
  const { exitCode, report } = await runWebhookSetup({
    env: { STRIPE_TEST_SECRET_KEY: 'sk_test_example' },
    request: fake.request,
    netlify,
  });
  assert.equal(exitCode, 5);
  assert.equal(fake.state.posts.length, 0);
  assert.equal(report.reason, 'site_name_rejected');
  assertNoSecrets(report);
});

test('blocks duplicate or live endpoints', () => {
  assert.equal(planWebhook([endpoint(), endpoint({ id: 'we_other' })]).reason, 'duplicate_endpoints');
  assert.equal(planWebhook([endpoint({ livemode: true })]).reason, 'live_endpoint_present');
});

test('rejects a readable non-production value and a production host', () => {
  assert.equal(storedSecretAccepted({
    key: 'ACADEMY_STRIPE_WEBHOOK_SECRET',
    is_secret: true,
    scopes: ['functions', 'runtime'],
    values: [
      { context: 'production', value: 'present' },
      { context: 'dev', value: 'present' },
    ],
  }), false);
  assert.equal(stagingSiteAccepted(stagingSite({
    ssl_url: 'https://caidenscourage.com',
    url: 'https://caidenscourage.com',
  })).reason, 'site_url_rejected');
});

test('the command reports the credential step without a Stripe call', async () => {
  const chunks = [];
  const original = process.stdout.write;
  process.stdout.write = (chunk) => {
    chunks.push(String(chunk));
    return true;
  };
  try {
    const code = await main([], {});
    const text = chunks.join('');
    assert.equal(code, 2);
    assert.match(text, /STRIPE_TEST_SECRET_KEY/);
    assert.match(text, /Do not paste the secret into chat/);
    assert.equal(text.includes('sk_live_'), false);
    assert.equal(text.includes('whsec_'), false);
  } finally {
    process.stdout.write = original;
  }
});
