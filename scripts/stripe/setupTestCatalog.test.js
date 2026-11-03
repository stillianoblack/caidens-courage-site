const test = require('node:test');
const assert = require('node:assert/strict');
const {
  CATALOG,
  SETUP_MARKER,
  WEBHOOK_EVENTS,
  WEBHOOK_URL,
  catalogMapping,
  classifyAccount,
  main,
  planProduct,
  planShipping,
  publicWebhook,
  resolveTestSecret,
  runSetup,
} = require('./setupTestCatalog');

const ownedMetadata = (catalogKey) => ({
  caidens_setup: SETUP_MARKER,
  caidens_catalog_key: catalogKey,
});

function createFakeStripe(options = {}) {
  const state = {
    account: {
      id: 'acct_test1234',
      business_profile: {
        name: options.accountName || 'Caiden\'s Courage',
        url: options.accountUrl || 'https://caidenscourage.com',
      },
      settings: { dashboard: { display_name: options.accountName || 'Caiden\'s Courage' } },
      email: options.email || 'owner@caidenscourage.com',
    },
    products: options.products || [],
    prices: options.prices || [],
    rates: options.rates || [],
    webhooks: options.webhooks || [],
    posts: [],
    gets: [],
  };
  let sequence = 1;

  async function request(spec) {
    if (String(spec.path).includes('sk_') || String(spec.body || '').includes('sk_')) {
      throw new Error('secret_leaked_to_request');
    }
    if (spec.method === 'GET' && spec.path === 'account') {
      state.gets.push('account');
      return state.account;
    }
    if (spec.method === 'GET') {
      const [resource, query = ''] = spec.path.split('?');
      state.gets.push(resource);
      const params = new URLSearchParams(query);
      const tables = {
        products: state.products,
        prices: state.prices,
        shipping_rates: state.rates,
        webhook_endpoints: state.webhooks,
      };
      const table = tables[resource];
      if (!table) throw new Error(`unknown_${resource}`);
      const active = params.get('active');
      let data = table;
      if (active === 'true') data = data.filter((item) => item.active !== false);
      if (active === 'false') data = data.filter((item) => item.active === false);
      return { data, has_more: false };
    }
    const fields = Object.fromEntries(new URLSearchParams(String(spec.body)));
    state.posts.push({ path: spec.path, fields, idempotencyKey: spec.idempotencyKey });
    if (spec.path === 'products') {
      const product = {
        id: `prod_test_${sequence}`,
        name: fields.name,
        description: fields.description,
        active: true,
        livemode: false,
        created: sequence,
        metadata: {
          caidens_setup: fields['metadata[caidens_setup]'],
          caidens_catalog_key: fields['metadata[caidens_catalog_key]'],
        },
      };
      sequence += 1;
      state.products.push(product);
      return product;
    }
    if (spec.path.startsWith('products/')) {
      const product = state.products.find((item) => item.id === spec.path.split('/')[1]);
      if (fields.name) product.name = fields.name;
      if (fields.description) product.description = fields.description;
      return product;
    }
    if (spec.path === 'prices') {
      const price = {
        id: `price_test_${sequence}`,
        product: fields.product,
        unit_amount: Number(fields.unit_amount),
        currency: fields.currency,
        active: true,
        livemode: false,
        type: fields['recurring[interval]'] ? 'recurring' : 'one_time',
        recurring: fields['recurring[interval]'] ? { interval: fields['recurring[interval]'] } : null,
        created: sequence,
      };
      sequence += 1;
      state.prices.push(price);
      return price;
    }
    if (spec.path === 'shipping_rates') {
      const rate = {
        id: `shr_test_${sequence}`,
        active: true,
        livemode: false,
        display_name: fields.display_name,
        fixed_amount: {
          amount: Number(fields['fixed_amount[amount]']),
          currency: fields['fixed_amount[currency]'],
        },
        metadata: {
          caidens_countries: fields['metadata[caidens_countries]'],
          caidens_rate_scope: fields['metadata[caidens_rate_scope]'],
        },
      };
      sequence += 1;
      state.rates.push(rate);
      return rate;
    }
    throw new Error(`unhandled_${spec.path}`);
  }

  return { state, request };
}

function testEnv(extra = {}) {
  return { STRIPE_TEST_SECRET_KEY: 'sk_test_localfixture', ...extra };
}

test('refuses live keys and ignores non-test secrets', () => {
  assert.equal(resolveTestSecret({ STRIPE_SECRET_KEY: 'sk_live_localfixture' }).reason, 'live_key_refused');
  assert.equal(resolveTestSecret({ STRIPE_TEST_SECRET_KEY: 'sk_live_localfixture' }).reason, 'live_key_refused');
  assert.equal(resolveTestSecret({ STRIPE_SECRET_KEY: 'sk_test_localfixture', STRIPE_TEST_SECRET_KEY: 'sk_live_localfixture' }).reason, 'live_key_refused');
  assert.equal(resolveTestSecret({}).reason, 'test_secret_missing');
  assert.equal(resolveTestSecret({ STRIPE_SECRET_KEY: 'sk_test_localfixture' }).source, 'STRIPE_SECRET_KEY');
  assert.equal(resolveTestSecret({ STRIPE_TEST_SECRET_KEY: 'sk_test_localfixture' }).source, 'STRIPE_TEST_SECRET_KEY');
});

test('accepts only a Caiden\'s Courage account identity', () => {
  assert.equal(classifyAccount({
    business_profile: { name: 'Caiden\'s Courage', url: 'https://caidenscourage.com' },
    settings: { dashboard: { display_name: 'Caiden\'s Courage' } },
  }).ok, true);
  assert.equal(classifyAccount({
    business_profile: { url: 'https://www.caidenscourage.com' },
    email: 'owner@caidenscourage.com',
  }).ok, true);
  assert.equal(classifyAccount({
    settings: { dashboard: { display_name: 'Montage Crew' } },
  }).reason, 'account_not_caidens_courage');
});

test('plans one-time prices without reusing a $59.00 or recurring price', () => {
  const definition = CATALOG.find((item) => item.catalogKey === 'courage_adventure_paperback_bundle');
  const product = {
    id: 'prod_owned',
    name: definition.name,
    description: definition.description,
    active: true,
    livemode: false,
    created: 1,
    metadata: ownedMetadata(definition.catalogKey),
  };
  assert.equal(planProduct(definition, [product], [{
    id: 'price_5900',
    product: 'prod_owned',
    unit_amount: 5900,
    currency: 'usd',
    active: true,
    livemode: false,
    type: 'one_time',
    recurring: null,
  }]).action, 'create_price');
  assert.equal(planProduct(definition, [product], [{
    id: 'price_recurring',
    product: 'prod_owned',
    unit_amount: 5999,
    currency: 'usd',
    active: true,
    livemode: false,
    type: 'recurring',
    recurring: { interval: 'month' },
  }]).action, 'create_price');
  const reuse = planProduct(definition, [product], [{
    id: 'price_5999',
    product: 'prod_owned',
    unit_amount: 5999,
    currency: 'usd',
    active: true,
    livemode: false,
    type: 'one_time',
    recurring: null,
    created: 2,
  }]);
  assert.equal(reuse.action, 'reuse');
  assert.equal(reuse.price.id, 'price_5999');
});

test('does not modify a product that merely shares the catalog name', () => {
  const definition = CATALOG.find((item) => item.catalogKey === 'hardcover');
  const plan = planProduct(definition, [{
    id: 'prod_historical',
    name: definition.name,
    active: true,
    livemode: false,
    metadata: {},
  }], []);
  assert.equal(plan.action, 'blocked');
  assert.equal(plan.reason, 'name_collision');
  assert.deepEqual(plan.productIds, ['prod_historical']);
});

test('requires an explicit shipping approval and does not invent a rate', () => {
  const undecided = planShipping([{
    id: 'shr_observed',
    active: true,
    livemode: false,
    display_name: 'USPS Ground',
    fixed_amount: { amount: 1000, currency: 'usd' },
    metadata: {},
  }], {});
  assert.equal(undecided.action, 'decision_required');
  assert.deepEqual(undecided.approval.missing.sort(), ['amount_cents', 'currency', 'destinations', 'display_name']);
  const approval = {
    STRIPE_TEST_SHIPPING_AMOUNT_CENTS: '1000',
    STRIPE_TEST_SHIPPING_CURRENCY: 'usd',
    STRIPE_TEST_SHIPPING_DISPLAY_NAME: 'USPS Ground',
    STRIPE_TEST_SHIPPING_COUNTRIES: 'US',
  };
  assert.equal(planShipping([{
    id: 'shr_other',
    active: true,
    livemode: false,
    display_name: 'USPS Ground',
    fixed_amount: { amount: 1000, currency: 'usd' },
    metadata: { caidens_countries: 'US' },
  }], approval).action, 'create');
  assert.equal(planShipping([{
    id: 'shr_match',
    active: true,
    livemode: false,
    display_name: 'USPS Ground',
    fixed_amount: { amount: 1000, currency: 'usd' },
    metadata: { caidens_countries: 'US', caidens_rate_scope: 'per_checkout' },
  }], approval).action, 'reuse');
});

test('webhook summaries omit signing secrets', () => {
  const summary = publicWebhook({
    id: 'we_123',
    url: WEBHOOK_URL,
    status: 'enabled',
    livemode: false,
    enabled_events: WEBHOOK_EVENTS,
    secret: 'whsec_should_not_appear',
  });
  assert.equal(summary.matchesStaging, true);
  assert.equal(Object.hasOwn(summary, 'secret'), false);
});

test('missing or live credentials make no Stripe calls', async () => {
  const fake = createFakeStripe();
  const missing = await runSetup({ env: {}, request: fake.request });
  assert.equal(missing.exitCode, 2);
  assert.equal(fake.state.gets.length, 0);
  assert.equal(missing.report.mapping.apply, false);
  assert.equal(missing.report.mapping.rows.every((row) => row.stripe_price_id === null), true);
  const live = await runSetup({ env: { STRIPE_SECRET_KEY: 'sk_live_localfixture' }, request: fake.request });
  assert.equal(live.exitCode, 4);
  assert.equal(fake.state.gets.length, 0);
  assert.equal(JSON.stringify(live.report).includes('sk_live_localfixture'), false);
});

test('stops before writes when the account is not Caiden\'s Courage', async () => {
  const fake = createFakeStripe({
    accountName: 'Other Publisher',
    accountUrl: 'https://example.com',
    email: 'owner@example.com',
  });
  const result = await runSetup({ env: testEnv(), request: fake.request });
  assert.equal(result.exitCode, 3);
  assert.deepEqual(fake.state.posts, []);
  assert.deepEqual(fake.state.gets, ['account']);
  assert.equal(JSON.stringify(result.report).includes('owner@caidenscourage.com'), false);
});

test('creates the three one-time test products once and reuses them on rerun', async () => {
  const fake = createFakeStripe({
    webhooks: [{
      id: 'we_staging',
      url: WEBHOOK_URL,
      status: 'enabled',
      livemode: false,
      enabled_events: WEBHOOK_EVENTS,
      secret: 'whsec_should_not_appear',
    }],
  });
  const first = await runSetup({ env: testEnv(), request: fake.request });
  assert.equal(first.exitCode, 0);
  assert.equal(first.report.idempotentRerun, true);
  assert.equal(first.report.shipping.action, 'decision_required');
  assert.equal(fake.state.posts.some((post) => post.path === 'shipping_rates'), false);
  assert.equal(fake.state.posts.some((post) => post.path === 'payment_links'), false);
  assert.deepEqual(
    first.report.products.map((product) => [product.catalogKey, product.amountCents, product.action]),
    [
      ['courage_adventure_bundle', 7599, 'create_product'],
      ['courage_adventure_paperback_bundle', 5999, 'create_product'],
      ['hardcover', 4999, 'create_product'],
    ],
  );
  assert.equal(first.report.products.every((product) => (
    product.stripeProductId.startsWith('prod_') && product.stripePriceId.startsWith('price_') && product.livemode === false
  )), true);
  assert.equal(fake.state.prices.every((price) => price.type === 'one_time' && !price.recurring), true);
  const createdPosts = fake.state.posts.length;
  const second = await runSetup({ env: testEnv(), request: fake.request });
  assert.equal(second.exitCode, 0);
  assert.equal(second.report.products.every((product) => product.action === 'reuse'), true);
  assert.equal(fake.state.posts.length, createdPosts);
  assert.equal(JSON.stringify(second.report).includes('whsec_should_not_appear'), false);
  assert.equal(JSON.stringify(second.report).includes('sk_test_localfixture'), false);
  assert.deepEqual(second.report.webhook.matches, ['we_staging']);
});

test('a dry run and a name collision do not create products', async () => {
  const definition = CATALOG.find((item) => item.catalogKey === 'hardcover');
  const fake = createFakeStripe({
    products: [{
      id: 'prod_historical',
      name: definition.name,
      description: 'historical',
      active: true,
      livemode: false,
      metadata: {},
    }],
  });
  const dry = await runSetup({ env: testEnv(), request: fake.request, dryRun: true });
  assert.equal(dry.exitCode, 0);
  assert.equal(fake.state.posts.length, 0);
  const blocked = await runSetup({ env: testEnv(), request: fake.request });
  assert.equal(blocked.report.products.find((product) => product.catalogKey === 'hardcover').reason, 'name_collision');
  assert.equal(fake.state.posts.some((post) => post.fields?.name === definition.name), false);
});

test('creates the approved US-only flat shipping rate once', async () => {
  const env = testEnv({
    STRIPE_TEST_SHIPPING_AMOUNT_CENTS: '1000',
    STRIPE_TEST_SHIPPING_CURRENCY: 'usd',
    STRIPE_TEST_SHIPPING_DISPLAY_NAME: 'USPS Ground',
    STRIPE_TEST_SHIPPING_COUNTRIES: 'US',
  });
  const fake = createFakeStripe();
  const first = await runSetup({ env, request: fake.request });
  const shippingPost = fake.state.posts.find((post) => post.path === 'shipping_rates');
  assert.equal(first.report.shipping.action, 'created');
  assert.equal(first.report.shipping.rateId.startsWith('shr_'), true);
  assert.equal(shippingPost.fields.type, 'fixed_amount');
  assert.equal(shippingPost.fields['fixed_amount[amount]'], '1000');
  assert.equal(shippingPost.fields['fixed_amount[currency]'], 'usd');
  assert.equal(shippingPost.fields.display_name, 'USPS Ground');
  assert.equal(shippingPost.fields['metadata[caidens_countries]'], 'US');
  assert.equal(shippingPost.fields['metadata[caidens_rate_scope]'], 'per_checkout');
  assert.equal(first.report.mapping.shippingRateEnv.STRIPE_BUNDLE_SHIPPING_RATE_IDS, first.report.shipping.rateId);
  assert.equal(first.report.mapping.shippingRateEnv.STRIPE_PHYSICAL_SHIPPING_RATE_IDS, first.report.shipping.rateId);
  assert.deepEqual(first.report.mapping.checkoutShippingCountries, ['US']);
  const posts = fake.state.posts.length;
  const second = await runSetup({ env, request: fake.request });
  assert.equal(second.report.shipping.action, 'reuse');
  assert.equal(second.report.shipping.rateId, first.report.shipping.rateId);
  assert.equal(fake.state.posts.length, posts);
});

test('prepared catalog mapping does not write or enable sales', () => {
  const mapping = catalogMapping([]);
  assert.equal(mapping.apply, false);
  assert.equal(mapping.databaseWrite, false);
  assert.deepEqual(mapping.doNotModifyKeys, ['hardcover_bundle']);
  assert.equal(Object.values(mapping.flags).every((value) => value === false), true);
  assert.deepEqual(mapping.rows.map((row) => row.expected_display_price_cents), [7599, 5999, 4999]);
  assert.deepEqual(mapping.checkoutShippingCountries, ['US']);
  assert.equal(mapping.flatRatePerCheckout, true);
  assert.equal(mapping.shippingRateEnv.STRIPE_BUNDLE_SHIPPING_RATE_IDS, null);
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
