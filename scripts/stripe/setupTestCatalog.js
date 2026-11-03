#!/usr/bin/env node
/**
 * Idempotent Stripe TEST-MODE catalog setup for Caiden's Courage physical checkout.
 *
 * Usage:
 *   STRIPE_TEST_SECRET_KEY=sk_test_... node scripts/stripe/setupTestCatalog.js
 *   node scripts/stripe/setupTestCatalog.js --dry-run
 *
 * Reads only STRIPE_TEST_SECRET_KEY, or STRIPE_SECRET_KEY when that value is sk_test_.
 * Refuses sk_live_. Does not print secrets, create Payment Links, write to Supabase,
 * or change Netlify. Shipping rates are created only when amount, currency, display
 * name, and destinations are all present in the environment.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const SETUP_MARKER = 'caidens_physical_checkout_test';
const WEBHOOK_URL = 'https://caidens-courage-staging.netlify.app/.netlify/functions/academy-stripe-webhook';
const WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
  'checkout.session.expired',
  'charge.refunded',
  'refund.created',
  'refund.updated',
];

const CATALOG = [
  {
    catalogKey: 'courage_adventure_bundle',
    name: 'Founder\'s Reserve — Hardcover Bundle',
    description: 'Signed hardcover, workbook, bookmark, sticker, and 90 days of Academy access.',
    amountCents: 7599,
    academyDays: 90,
  },
  {
    catalogKey: 'courage_adventure_paperback_bundle',
    name: 'Courage Adventure Bundle — Paperback',
    description: 'Paperback, workbook, bookmark, sticker, and 30 days of Academy access.',
    amountCents: 5999,
    academyDays: 30,
  },
  {
    catalogKey: 'hardcover',
    name: 'Hardcover Edition',
    description: 'Standalone hardcover, bookmark, and sticker.',
    amountCents: 4999,
    academyDays: 0,
  },
];

const SALES_FLAGS = {
  BOOKSTORE_BUNDLE_SALES_ENABLED: false,
  BOOKSTORE_PHYSICAL_SALES_ENABLED: false,
  REACT_APP_BOOKSTORE_BUNDLE_CHECKOUT_ENABLED: false,
  REACT_APP_BOOKSTORE_PHYSICAL_CHECKOUT_ENABLED: false,
  ACADEMY_MEMBERSHIP_GATE_ENABLED: false,
  STRIPE_AUTOMATIC_TAX_ENABLED: false,
};

function redact(value) {
  return String(value || '')
    .replace(/sk_(live|test)_[A-Za-z0-9]+/g, 'sk_$1_[redacted]')
    .replace(/rk_(live|test)_[A-Za-z0-9]+/g, 'rk_$1_[redacted]')
    .replace(/whsec_[A-Za-z0-9]+/g, 'whsec_[redacted]');
}

function scrub(value) {
  if (Array.isArray(value)) return value.map(scrub);
  if (value && typeof value === 'object') {
    const out = {};
    Object.entries(value).forEach(([key, item]) => {
      if (/secret|authorization|api[_-]?key|password|token/i.test(key)) return;
      out[key] = scrub(item);
    });
    return out;
  }
  if (typeof value === 'string') return redact(value);
  return value;
}

function resolveTestSecret(env = process.env) {
  const named = String(env.STRIPE_TEST_SECRET_KEY || '');
  const generic = String(env.STRIPE_SECRET_KEY || '');
  if (named.startsWith('sk_live_') || generic.startsWith('sk_live_') || named.startsWith('rk_live_') || generic.startsWith('rk_live_')) {
    return { ok: false, reason: 'live_key_refused' };
  }
  if (named.startsWith('sk_test_')) return { ok: true, secret: named, source: 'STRIPE_TEST_SECRET_KEY' };
  if (generic.startsWith('sk_test_')) return { ok: true, secret: generic, source: 'STRIPE_SECRET_KEY' };
  return { ok: false, reason: 'test_secret_missing' };
}

function classifyAccount(account) {
  const fields = [
    account?.business_profile?.name,
    account?.business_profile?.url,
    account?.settings?.dashboard?.display_name,
    account?.email,
    account?.business_profile?.support_email,
  ].filter(Boolean).join(' ').toLowerCase();
  const domain = fields.includes('caidenscourage.com');
  const named = fields.includes('caiden') && fields.includes('courage');
  const displayName = account?.settings?.dashboard?.display_name || account?.business_profile?.name || null;
  if (named || domain) return { ok: true, displayName };
  return { ok: false, reason: 'account_not_caidens_courage', displayName };
}

function maskAccountId(id) {
  const value = String(id || '');
  if (!value.startsWith('acct_') || value.length < 8) return null;
  return `acct_…${value.slice(-4)}`;
}

function productIdOf(price) {
  if (!price) return null;
  if (typeof price.product === 'string') return price.product;
  return price.product?.id || null;
}

function isOwned(product, catalogKey) {
  return Boolean(
    product
    && product.livemode !== true
    && product.metadata
    && product.metadata.caidens_setup === SETUP_MARKER
    && product.metadata.caidens_catalog_key === catalogKey,
  );
}

function priceMatches(price, definition) {
  return Boolean(
    price
    && price.livemode !== true
    && price.active !== false
    && price.unit_amount === definition.amountCents
    && String(price.currency || '').toLowerCase() === 'usd'
    && !price.recurring
    && price.type !== 'recurring',
  );
}

function chooseOwned(products, prices, definition) {
  const ranked = [...products].sort((left, right) => (left.created || 0) - (right.created || 0));
  return ranked.find((product) => prices.some((price) => (
    productIdOf(price) === product.id && priceMatches(price, definition)
  ))) || ranked[0];
}

function planProduct(definition, products, prices) {
  const live = [...products, ...prices].find((item) => item && item.livemode === true);
  if (live) return { action: 'blocked', reason: 'live_resource_present', definition };
  const owned = products.filter((product) => isOwned(product, definition.catalogKey));
  const foreign = products.filter((product) => product.name === definition.name && !isOwned(product, definition.catalogKey));
  if (foreign.length) {
    return {
      action: 'blocked',
      reason: 'name_collision',
      definition,
      productIds: foreign.map((product) => product.id),
    };
  }
  const activeOwned = owned.filter((product) => product.active !== false);
  if (owned.length && !activeOwned.length) {
    return {
      action: 'blocked',
      reason: 'inactive_owned_product',
      definition,
      productIds: owned.map((product) => product.id),
    };
  }
  if (!activeOwned.length) return { action: 'create_product', definition };
  const product = chooseOwned(activeOwned, prices, definition);
  const update = {};
  if (product.name !== definition.name) update.name = definition.name;
  if ((product.description || '') !== definition.description) update.description = definition.description;
  const matches = prices.filter((price) => productIdOf(price) === product.id && priceMatches(price, definition));
  const price = matches.sort((left, right) => (left.created || 0) - (right.created || 0))[0] || null;
  return {
    action: price ? 'reuse' : 'create_price',
    definition,
    product,
    price,
    update: Object.keys(update).length ? update : null,
    extraProductIds: activeOwned.filter((item) => item.id !== product.id).map((item) => item.id),
  };
}

function shippingApproval(env = process.env) {
  const amountRaw = env.STRIPE_TEST_SHIPPING_AMOUNT_CENTS;
  const currency = String(env.STRIPE_TEST_SHIPPING_CURRENCY || '').toLowerCase();
  const displayName = String(env.STRIPE_TEST_SHIPPING_DISPLAY_NAME || '').trim();
  const countries = String(env.STRIPE_TEST_SHIPPING_COUNTRIES || '')
    .split(',')
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
  const missing = [];
  if (!/^\d+$/.test(String(amountRaw || ''))) missing.push('amount_cents');
  if (currency !== 'usd') missing.push('currency');
  if (!displayName) missing.push('display_name');
  if (!countries.length || countries.some((country) => !/^[A-Z]{2}$/.test(country))) missing.push('destinations');
  if (missing.length) {
    return {
      approved: false,
      missing,
      decision: {
        status: 'decision_required',
        amountCents: 'Approve an integer cent amount before a test rate is created. Live Payment Links add 1000 cents for USPS Ground; that amount is not approved here.',
        currency: 'usd',
        displayName: 'Approve the delivery description, such as the carrier and service name.',
        destinations: 'Approve ISO country codes. The approved list for this checkout is US only. Checkout sessions collect that list directly; a shipping-rate metadata label does not restrict the address form.',
      },
    };
  }
  return {
    approved: true,
    amountCents: Number(amountRaw),
    currency: 'usd',
    displayName,
    countries,
  };
}

function rateMatches(rate, approval) {
  const metadataCountries = String(rate?.metadata?.caidens_countries || '')
    .split(',')
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean)
    .sort()
    .join(',');
  return Boolean(
    rate
    && rate.livemode !== true
    && rate.active !== false
    && rate.fixed_amount
    && rate.fixed_amount.amount === approval.amountCents
    && String(rate.fixed_amount.currency || '').toLowerCase() === 'usd'
    && rate.display_name === approval.displayName
    && rate.metadata?.caidens_rate_scope === 'per_checkout'
    && metadataCountries === [...approval.countries].sort().join(','),
  );
}

function planShipping(rates, env = process.env) {
  const approval = shippingApproval(env);
  const live = (rates || []).find((rate) => rate.livemode === true);
  if (live) return { action: 'blocked', reason: 'live_resource_present' };
  const observed = (rates || []).filter((rate) => rate.livemode !== true).slice(0, 20).map((rate) => ({
    id: rate.id,
    active: rate.active !== false,
    amountCents: rate.fixed_amount?.amount ?? null,
    currency: rate.fixed_amount?.currency ?? null,
    displayName: rate.display_name || null,
    recordedCountries: rate.metadata?.caidens_countries || null,
  }));
  if (!approval.approved) {
    return { action: 'decision_required', approval, observed };
  }
  const match = (rates || []).find((rate) => rateMatches(rate, approval));
  if (match) return { action: 'reuse', approval, rate: match, observed };
  return { action: 'create', approval, observed };
}

function coversEvents(enabledEvents) {
  const events = enabledEvents || [];
  if (events.includes('*')) return true;
  return WEBHOOK_EVENTS.every((event) => events.includes(event));
}

function publicWebhook(endpoint) {
  return {
    id: endpoint.id,
    url: endpoint.url,
    status: endpoint.status,
    livemode: endpoint.livemode === true,
    enabledEvents: endpoint.enabled_events || [],
    apiVersion: endpoint.api_version || null,
    matchesStaging: endpoint.url === WEBHOOK_URL && coversEvents(endpoint.enabled_events),
  };
}

function webhookInstructions() {
  return {
    endpoint: WEBHOOK_URL,
    events: WEBHOOK_EVENTS,
    signingSecretEnv: 'ACADEMY_STRIPE_WEBHOOK_SECRET',
    steps: [
      'In Stripe test mode, add the endpoint above if no matching test endpoint exists.',
      'Subscribe it to the listed events. Do not subscribe this physical-checkout check to live mode.',
      'Store the signing secret only as ACADEMY_STRIPE_WEBHOOK_SECRET on the staging Netlify site.',
      'Do not print, commit, or paste the signing secret into chat. This script does not create the endpoint.',
    ],
  };
}

function catalogMapping(results, shippingRateId = null) {
  return {
    apply: false,
    target: 'staging',
    databaseWrite: false,
    reason: 'Database writes stay off until the staging Supabase project is verified and a separate write is approved.',
    table: 'commerce_products',
    doNotModifyKeys: ['hardcover_bundle'],
    doNotChangeColumns: ['is_active', 'payment_link_url', 'payment_link_verified_at'],
    checkoutShippingCountries: ['US'],
    flatRatePerCheckout: true,
    rows: CATALOG.map((definition) => {
      const result = (results || []).find((item) => item.catalogKey === definition.catalogKey);
      return {
        key: definition.catalogKey,
        title: definition.name,
        expected_display_price_cents: definition.amountCents,
        expected_currency: 'usd',
        stripe_product_id: result?.stripeProductId || null,
        stripe_price_id: result?.stripePriceId || null,
        livemode: false,
      };
    }),
    flags: SALES_FLAGS,
    shippingRateEnv: {
      STRIPE_BUNDLE_SHIPPING_RATE_IDS: shippingRateId,
      STRIPE_PHYSICAL_SHIPPING_RATE_IDS: shippingRateId,
    },
  };
}

function credentialInstructions() {
  return {
    status: 'test_secret_missing',
    step: 'Export STRIPE_TEST_SECRET_KEY in this shell as a Stripe test secret (sk_test_ only), then rerun node scripts/stripe/setupTestCatalog.js. Do not paste the secret into chat.',
  };
}

function formBody(fields) {
  const body = new URLSearchParams();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) body.set(key, String(value));
  });
  return body;
}

function productForm(definition) {
  return formBody({
    name: definition.name,
    description: definition.description,
    active: 'true',
    shippable: 'true',
    'metadata[caidens_setup]': SETUP_MARKER,
    'metadata[caidens_catalog_key]': definition.catalogKey,
    'metadata[amount_cents]': definition.amountCents,
    'metadata[academy_days]': definition.academyDays,
    'metadata[currency]': 'usd',
  });
}

function priceForm(definition, productId) {
  return formBody({
    currency: 'usd',
    unit_amount: definition.amountCents,
    product: productId,
    'metadata[caidens_setup]': SETUP_MARKER,
    'metadata[caidens_catalog_key]': definition.catalogKey,
  });
}

function shippingForm(approval) {
  return formBody({
    display_name: approval.displayName,
    type: 'fixed_amount',
    'fixed_amount[amount]': approval.amountCents,
    'fixed_amount[currency]': 'usd',
    'metadata[caidens_setup]': SETUP_MARKER,
    'metadata[caidens_countries]': approval.countries.join(','),
    'metadata[caidens_rate_scope]': 'per_checkout',
  });
}

function detailKey(definition) {
  const digest = crypto.createHash('sha256').update(`${definition.name}\n${definition.description}`).digest('hex').slice(0, 12);
  return `caidens-${SETUP_MARKER}-${definition.catalogKey}-details-${digest}`;
}

function assertTestProduct(product, definition) {
  if (!product || product.livemode === true || !String(product.id || '').startsWith('prod_')) {
    throw new Error('test_product_rejected');
  }
  if (product.name !== definition.name) throw new Error('product_name_mismatch');
}

function assertTestPrice(price, definition, productId) {
  if (!priceMatches(price, definition) || productIdOf(price) !== productId || !String(price.id || '').startsWith('price_')) {
    throw new Error('test_price_rejected');
  }
}

async function listCollection(request, resource, extra) {
  const collected = [];
  let startingAfter = null;
  for (;;) {
    const params = new URLSearchParams(extra || {});
    params.set('limit', '100');
    if (startingAfter) params.set('starting_after', startingAfter);
    const page = await request({ method: 'GET', path: `${resource}?${params}` });
    const data = page.data || [];
    collected.push(...data);
    if (!page.has_more || !data.length) break;
    startingAfter = data[data.length - 1].id;
  }
  return collected;
}

async function loadCatalog(request) {
  const [activeProducts, inactiveProducts, activePrices, inactivePrices, activeRates, inactiveRates, webhooks] = await Promise.all([
    listCollection(request, 'products', { active: 'true' }),
    listCollection(request, 'products', { active: 'false' }),
    listCollection(request, 'prices', { active: 'true' }),
    listCollection(request, 'prices', { active: 'false' }),
    listCollection(request, 'shipping_rates', { active: 'true' }),
    listCollection(request, 'shipping_rates', { active: 'false' }),
    listCollection(request, 'webhook_endpoints', {}),
  ]);
  return {
    products: [...activeProducts, ...inactiveProducts],
    prices: [...activePrices, ...inactivePrices],
    rates: [...activeRates, ...inactiveRates],
    webhooks,
  };
}

function resultFromPlan(plan) {
  return {
    catalogKey: plan.definition.catalogKey,
    name: plan.definition.name,
    amountCents: plan.definition.amountCents,
    currency: 'usd',
    action: plan.action,
    reason: plan.reason || null,
    stripeProductId: plan.product?.id || null,
    stripePriceId: plan.price?.id || null,
    livemode: false,
    extraProductIds: plan.extraProductIds || [],
    blockedProductIds: plan.productIds || [],
  };
}

async function applyPlans(request, plans) {
  const applied = [];
  for (const plan of plans) {
    if (plan.action === 'blocked') {
      applied.push(resultFromPlan(plan));
      continue;
    }
    let product = plan.product || null;
    if (plan.action === 'create_product') {
      product = await request({
        method: 'POST',
        path: 'products',
        body: productForm(plan.definition),
        idempotencyKey: `caidens-${SETUP_MARKER}-${plan.definition.catalogKey}-product`,
      });
      assertTestProduct(product, plan.definition);
    } else if (plan.update && product?.id) {
      product = await request({
        method: 'POST',
        path: `products/${product.id}`,
        body: formBody(plan.update),
        idempotencyKey: detailKey(plan.definition),
      });
      assertTestProduct(product, plan.definition);
    }
    let price = plan.price || null;
    if (plan.action === 'create_product' || plan.action === 'create_price') {
      price = await request({
        method: 'POST',
        path: 'prices',
        body: priceForm(plan.definition, product.id),
        idempotencyKey: `caidens-${SETUP_MARKER}-${plan.definition.catalogKey}-price-${plan.definition.amountCents}`,
      });
      assertTestPrice(price, plan.definition, product.id);
    }
    applied.push(resultFromPlan({ ...plan, action: plan.action, product, price }));
  }
  return applied;
}

async function applyShipping(request, shippingPlan) {
  if (shippingPlan.action !== 'create') return shippingPlan;
  const rate = await request({
    method: 'POST',
    path: 'shipping_rates',
    body: shippingForm(shippingPlan.approval),
    idempotencyKey: `caidens-${SETUP_MARKER}-shipping-${shippingPlan.approval.amountCents}-${shippingPlan.approval.countries.join('-')}`,
  });
  if (!rate || rate.livemode === true || !String(rate.id || '').startsWith('shr_')) {
    throw new Error('test_shipping_rate_rejected');
  }
  return { ...shippingPlan, action: 'created', rate };
}

function shippingReport(shippingPlan) {
  const action = shippingPlan.action === 'create' && shippingPlan.rate ? 'created' : shippingPlan.action;
  return {
    action,
    reason: shippingPlan.reason || null,
    rateId: shippingPlan.rate?.id || null,
    amountCents: shippingPlan.approval?.amountCents || shippingPlan.rate?.fixed_amount?.amount || null,
    currency: shippingPlan.rate?.fixed_amount?.currency || shippingPlan.approval?.currency || null,
    displayName: shippingPlan.rate?.display_name || shippingPlan.approval?.displayName || null,
    countries: shippingPlan.approval?.countries || null,
    observed: shippingPlan.observed || [],
    decision: shippingPlan.approval?.decision || null,
    missing: shippingPlan.approval?.missing || [],
  };
}

const CODE_NOTES = [
  'Hardcover Checkout Sessions still require payment_link_verified_at on the catalog row. This script does not set that column.',
  'Bundle checkout still requires its own prod_ and price_ ids, is_active, Resend, and an approved shr_ rate before a session can open. Sales flags stay false.',
  'Do not attach historical Payment Links. The supplied paperback bundle Payment Link charges $59.00 and is not a $59.99 price.',
];

function baseReport(extra) {
  return scrub({
    mode: 'test',
    salesFlags: SALES_FLAGS,
    databaseWrite: false,
    codeNotes: CODE_NOTES,
    mapping: catalogMapping(extra.products || [], extra.shipping?.rateId || null),
    webhook: {
      matches: (extra.webhooks || []).filter((item) => item.matchesStaging).map((item) => item.id),
      endpoints: extra.webhooks || [],
      instructions: webhookInstructions(),
    },
    ...extra,
  });
}

async function stripeFetch(secret, spec) {
  if (!String(secret || '').startsWith('sk_test_')) throw new Error('test_secret_required');
  const headers = { Authorization: `Bearer ${secret}` };
  if (spec.idempotencyKey) headers['Idempotency-Key'] = spec.idempotencyKey;
  if (spec.body) headers['Content-Type'] = 'application/x-www-form-urlencoded';
  const response = await fetch(`https://api.stripe.com/v1/${spec.path}`, {
    method: spec.method,
    headers,
    body: spec.body || undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(redact(payload?.error?.message || 'stripe_request_failed'));
    error.code = payload?.error?.code || 'stripe_request_failed';
    throw error;
  }
  return payload;
}

async function runSetup({ env = process.env, request = null, dryRun = false } = {}) {
  const resolved = resolveTestSecret(env);
  if (!resolved.ok) {
    return {
      exitCode: resolved.reason === 'live_key_refused' ? 4 : 2,
      report: baseReport({
        credential: resolved.reason === 'live_key_refused'
          ? { status: 'live_key_refused', step: 'A live Stripe key was present. Remove it and export a test secret as STRIPE_TEST_SECRET_KEY.' }
          : credentialInstructions(),
        account: null,
        products: CATALOG.map((definition) => resultFromPlan({ action: 'not_run', definition })),
        shipping: shippingReport(planShipping([], env)),
        idempotentRerun: null,
      }),
    };
  }

  const transport = request || ((spec) => stripeFetch(resolved.secret, spec));
  const account = await transport({ method: 'GET', path: 'account' });
  const identity = classifyAccount(account);
  const accountReport = {
    verified: identity.ok === true,
    displayName: identity.displayName,
    id: maskAccountId(account?.id),
  };
  if (!identity.ok) {
    return {
      exitCode: 3,
      report: baseReport({
        credential: { status: 'test_key_accepted', source: resolved.source },
        account: { ...accountReport, reason: identity.reason },
        products: CATALOG.map((definition) => resultFromPlan({ action: 'not_run', definition })),
        shipping: shippingReport(planShipping([], env)),
        idempotentRerun: null,
      }),
    };
  }

  const loaded = await loadCatalog(transport);
  const plans = CATALOG.map((definition) => planProduct(definition, loaded.products, loaded.prices));
  const shippingPlan = planShipping(loaded.rates, env);
  const webhooks = (loaded.webhooks || []).filter((item) => item.livemode !== true).map(publicWebhook);
  if (dryRun) {
    return {
      exitCode: plans.some((plan) => plan.reason === 'live_resource_present') || shippingPlan.reason === 'live_resource_present' ? 4 : 0,
      report: baseReport({
        credential: { status: 'test_key_accepted', source: resolved.source },
        account: accountReport,
        dryRun: true,
        products: plans.map(resultFromPlan),
        shipping: shippingReport(shippingPlan),
        webhooks,
        idempotentRerun: null,
      }),
    };
  }

  if (plans.some((plan) => plan.reason === 'live_resource_present') || shippingPlan.reason === 'live_resource_present') {
    return {
      exitCode: 4,
      report: baseReport({
        credential: { status: 'test_key_accepted', source: resolved.source },
        account: accountReport,
        products: plans.map(resultFromPlan),
        shipping: shippingReport(shippingPlan),
        webhooks,
        idempotentRerun: false,
      }),
    };
  }

  const products = await applyPlans(transport, plans);
  const shipping = shippingReport(await applyShipping(transport, shippingPlan));
  const rerun = await loadCatalog(transport);
  const rerunPlans = CATALOG.map((definition) => planProduct(definition, rerun.products, rerun.prices));
  const rerunShipping = planShipping(rerun.rates, env);
  const idempotentRerun = rerunPlans.every((plan) => (
    (plan.action === 'reuse' || plan.action === 'blocked') && !plan.update
  )) && ['reuse', 'decision_required', 'blocked'].includes(rerunShipping.action);
  if (!idempotentRerun) throw new Error('duplicate_risk');
  return {
    exitCode: 0,
    report: baseReport({
      credential: { status: 'test_key_accepted', source: resolved.source },
      account: accountReport,
      dryRun: false,
      products,
      shipping,
      webhooks,
      idempotentRerun,
    }),
  };
}

function readArgs(argv) {
  return { dryRun: argv.includes('--dry-run') };
}

function writeMapping(report) {
  const dir = path.join(__dirname, 'out');
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, 'staging-catalog-mapping.json');
  fs.writeFileSync(target, `${JSON.stringify(report.mapping, null, 2)}\n`, { mode: 0o600 });
}

async function main(argv = process.argv.slice(2), env = process.env) {
  const args = readArgs(argv);
  const { exitCode, report } = await runSetup({ env, dryRun: args.dryRun });
  if (exitCode === 0 && !args.dryRun && report.credential?.status === 'test_key_accepted') {
    writeMapping(report);
  }
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  return exitCode;
}

module.exports = {
  CATALOG,
  SETUP_MARKER,
  WEBHOOK_URL,
  WEBHOOK_EVENTS,
  SALES_FLAGS,
  resolveTestSecret,
  classifyAccount,
  redact,
  scrub,
  planProduct,
  planShipping,
  priceMatches,
  publicWebhook,
  webhookInstructions,
  catalogMapping,
  credentialInstructions,
  runSetup,
  main,
};

if (require.main === module) {
  main().then((code) => {
    process.exitCode = code;
  }).catch((error) => {
    process.stderr.write(`${redact(error.message || 'setup_failed')}\n`);
    process.exitCode = 1;
  });
}
