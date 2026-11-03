#!/usr/bin/env node
/**
 * Idempotent Stripe TEST-MODE webhook setup for the staging Academy purchase flow.
 *
 * Usage:
 *   STRIPE_TEST_SECRET_KEY=sk_test_... node scripts/stripe/setupTestWebhook.js
 *
 * Refuses live keys. Reuses one matching test endpoint. Creates one only when
 * the staging Netlify site is verified, then stores the signing secret as
 * ACADEMY_STRIPE_WEBHOOK_SECRET on that site's Functions production context.
 * Does not print the secret, write Git, deploy, or enable checkout.
 */

const fs = require('fs');
const path = require('path');
const {
  WEBHOOK_EVENTS,
  WEBHOOK_URL,
  classifyAccount,
  redact,
  resolveTestSecret,
  scrub,
} = require('./setupTestCatalog');

const STAGING_SITE_NAME = 'caidens-courage-staging';
const STAGING_SITE_URL = 'https://caidens-courage-staging.netlify.app';
const STAGING_BRANCH = 'staging/bookstore-academy-integration';
const SECRET_ENV = 'ACADEMY_STRIPE_WEBHOOK_SECRET';
const SECRET_SCOPES = ['functions', 'runtime'];
const SECRET_CONTEXT = 'production';
const PRODUCTION_HOSTS = new Set([
  'caidenscourage.com',
  'www.caidenscourage.com',
  'caidenvale.com',
  'www.caidenvale.com',
  'quiet-pothos-3ae8ce.netlify.app',
]);

function maskAccountId(id) {
  const value = String(id || '');
  if (!value.startsWith('acct_') || value.length < 8) return null;
  return `acct_…${value.slice(-4)}`;
}

function eventsExact(events) {
  const got = [...new Set(events || [])].sort();
  const want = [...WEBHOOK_EVENTS].sort();
  return got.length === want.length && got.every((event, index) => event === want[index]);
}

function hostOf(value) {
  try {
    return new URL(String(value)).host;
  } catch {
    return '';
  }
}

function stagingSiteAccepted(site) {
  if (!site || site.name !== STAGING_SITE_NAME) return { ok: false, reason: 'site_name_rejected' };
  const urls = [site.url, site.ssl_url].filter(Boolean).map((value) => String(value).replace(/\/$/, ''));
  const hosts = [
    hostOf(site.url),
    hostOf(site.ssl_url),
    site.custom_domain || '',
  ].filter(Boolean);
  if (!urls.includes(STAGING_SITE_URL)) return { ok: false, reason: 'site_url_rejected' };
  if (hosts.some((host) => PRODUCTION_HOSTS.has(host))) return { ok: false, reason: 'production_site_rejected' };
  if (site.build_settings?.repo_branch !== STAGING_BRANCH) return { ok: false, reason: 'branch_rejected' };
  if (!site.account_slug || !site.id) return { ok: false, reason: 'site_identity_incomplete' };
  return {
    ok: true,
    name: site.name,
    url: STAGING_SITE_URL,
    branch: STAGING_BRANCH,
    accountSlug: site.account_slug,
    siteId: site.id,
  };
}

function planWebhook(endpoints) {
  const list = endpoints || [];
  if (list.some((endpoint) => endpoint.livemode === true && endpoint.url === WEBHOOK_URL)) {
    return { action: 'blocked', reason: 'live_endpoint_present' };
  }
  const matches = list.filter((endpoint) => endpoint.livemode !== true && endpoint.url === WEBHOOK_URL);
  if (matches.length > 1) return { action: 'blocked', reason: 'duplicate_endpoints' };
  if (matches.length === 0) return { action: 'create' };
  const endpoint = matches[0];
  if (eventsExact(endpoint.enabled_events) && endpoint.status !== 'disabled') {
    return { action: 'reuse', endpoint };
  }
  return { action: 'update', endpoint };
}

function publicEndpoint(endpoint, action) {
  if (!endpoint) return null;
  return {
    id: endpoint.id || null,
    url: endpoint.url || null,
    status: endpoint.status || null,
    livemode: endpoint.livemode === true,
    enabledEvents: [...(endpoint.enabled_events || [])],
    exactEvents: eventsExact(endpoint.enabled_events),
    action,
  };
}

function webhookForm(extra = {}) {
  const body = new URLSearchParams();
  Object.entries(extra).forEach(([key, value]) => {
    if (value !== undefined && value !== null) body.append(key, String(value));
  });
  WEBHOOK_EVENTS.forEach((event) => body.append('enabled_events[]', event));
  return body;
}

function credentialInstructions() {
  return {
    status: 'test_secret_missing',
    step: 'Export STRIPE_TEST_SECRET_KEY in this shell as a Stripe test secret (sk_test_ only), then rerun node scripts/stripe/setupTestWebhook.js. Do not paste the secret into chat. The script stores the signing secret on staging Netlify and does not print it.',
  };
}

function secretReport(status, extra = {}) {
  return {
    env: SECRET_ENV,
    site: STAGING_SITE_NAME,
    context: SECRET_CONTEXT,
    scopes: SECRET_SCOPES,
    status,
    ...extra,
  };
}

function storedSecretAccepted(entry, { exactScopes = false } = {}) {
  if (!entry || entry.key !== SECRET_ENV || entry.is_secret !== true) return false;
  const scopes = entry.scopes || [];
  if (!scopes.includes('functions') || scopes.includes('post-processing')) return false;
  if (exactScopes) {
    const same = scopes.length === SECRET_SCOPES.length && SECRET_SCOPES.every((scope) => scopes.includes(scope));
    if (!same || scopes.includes('builds')) return false;
  }
  const values = entry.values || [];
  const production = values.find((value) => value.context === SECRET_CONTEXT);
  const elsewhere = values.some((value) => value.context !== SECRET_CONTEXT && String(value.value || '').length > 0);
  return Boolean(production && String(production.value || '').length > 0) && !elsewhere;
}

function createNetlifyClient({
  token,
  fetchImpl = fetch,
  configPath = path.join(process.env.HOME || '', 'Library/Preferences/netlify/config.json'),
} = {}) {
  const auth = token || readNetlifyToken(configPath);
  async function api(pathname, options = {}) {
    const response = await fetchImpl(`https://api.netlify.com/api/v1${pathname}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${auth}`,
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`netlify_${response.status}`);
    return text ? JSON.parse(text) : null;
  }

  return {
    async identify() {
      const sites = await api('/sites?filter=all&per_page=100');
      const site = (Array.isArray(sites) ? sites : []).find((item) => item.name === STAGING_SITE_NAME);
      const accepted = stagingSiteAccepted(site);
      if (!accepted.ok) {
        const error = new Error(accepted.reason);
        error.identity = true;
        throw error;
      }
      return accepted;
    },
    async secretStatus() {
      const site = await this.identify();
      const vars = await api(`/accounts/${site.accountSlug}/env?site_id=${encodeURIComponent(site.siteId)}`);
      const entry = (Array.isArray(vars) ? vars : []).find((item) => item.key === SECRET_ENV) || null;
      return {
        present: storedSecretAccepted(entry),
        isSecret: entry?.is_secret === true,
      };
    },
    async storeSigningSecret(secret) {
      if (!String(secret || '').startsWith('whsec_')) throw new Error('signing_secret_rejected');
      const site = await this.identify();
      const vars = await api(`/accounts/${site.accountSlug}/env?site_id=${encodeURIComponent(site.siteId)}`);
      const exists = (Array.isArray(vars) ? vars : []).some((item) => item.key === SECRET_ENV);
      const body = {
        key: SECRET_ENV,
        is_secret: true,
        scopes: SECRET_SCOPES,
        values: [{ context: SECRET_CONTEXT, value: secret }],
      };
      const pathname = exists
        ? `/accounts/${site.accountSlug}/env/${encodeURIComponent(SECRET_ENV)}?site_id=${encodeURIComponent(site.siteId)}`
        : `/accounts/${site.accountSlug}/env?site_id=${encodeURIComponent(site.siteId)}`;
      const payload = await api(pathname, {
        method: exists ? 'PUT' : 'POST',
        body: JSON.stringify(exists ? body : [body]),
      });
      const entry = Array.isArray(payload) ? payload.find((item) => item.key === SECRET_ENV) : payload;
      if (!storedSecretAccepted(entry, { exactScopes: true })) throw new Error('netlify_secret_store_rejected');
      return { stored: true };
    },
  };
}

function readNetlifyToken(configPath) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const users = config.users || {};
  const token = users[Object.keys(users)[0]]?.auth?.token;
  if (!token) throw new Error('netlify_auth_missing');
  return token;
}

async function listEndpoints(request) {
  const payload = await request({ method: 'GET', path: 'webhook_endpoints?limit=100' });
  return payload.data || [];
}

async function runWebhookSetup({
  env = process.env,
  request = null,
  netlify = null,
  dryRun = false,
} = {}) {
  const resolved = resolveTestSecret(env);
  if (!resolved.ok) {
    return {
      exitCode: resolved.reason === 'live_key_refused' ? 4 : 2,
      report: {
        credential: resolved.reason === 'live_key_refused'
          ? { status: 'live_key_refused', step: 'A live Stripe key was present. Remove it and export a test secret as STRIPE_TEST_SECRET_KEY.' }
          : credentialInstructions(),
        account: null,
        endpoint: null,
        signingStorage: secretReport('not_stored'),
        databaseWrite: false,
        salesFlagsChanged: false,
        testEventSent: false,
      },
    };
  }

  const transport = request || ((spec) => stripeFetch(resolved.secret, spec));
  const account = await transport({ method: 'GET', path: 'account' });
  const identity = classifyAccount(account);
  const accountReport = {
    verified: identity.ok === true,
    displayName: identity.displayName,
    id: maskAccountId(account?.id),
    livemode: account?.livemode === true,
  };
  if (!identity.ok || account?.livemode === true) {
    return {
      exitCode: 3,
      report: {
        credential: { status: 'test_key_accepted', source: resolved.source },
        account: { ...accountReport, reason: account?.livemode === true ? 'live_account_rejected' : identity.reason },
        endpoint: null,
        signingStorage: secretReport('not_stored'),
        databaseWrite: false,
        salesFlagsChanged: false,
        testEventSent: false,
      },
    };
  }

  const endpoints = await listEndpoints(transport);
  const plan = planWebhook(endpoints);
  if (plan.action === 'blocked') {
    return {
      exitCode: 4,
      report: baseReport({
        credential: { status: 'test_key_accepted', source: resolved.source },
        account: accountReport,
        endpoint: publicEndpoint(plan.endpoint, plan.action),
        reason: plan.reason,
        signingStorage: secretReport('not_stored'),
      }),
    };
  }

  if (dryRun) {
    return {
      exitCode: 0,
      report: baseReport({
        credential: { status: 'test_key_accepted', source: resolved.source },
        account: accountReport,
        dryRun: true,
        endpoint: publicEndpoint(plan.endpoint, plan.action),
        signingStorage: secretReport('not_stored'),
      }),
    };
  }

  const netlifyClient = netlify || createNetlifyClient();
  let site;
  try {
    site = await netlifyClient.identify();
  } catch (error) {
    return {
      exitCode: 5,
      report: baseReport({
        credential: { status: 'test_key_accepted', source: resolved.source },
        account: accountReport,
        endpoint: publicEndpoint(plan.endpoint, 'not_changed'),
        reason: error.identity ? error.message : 'netlify_identity_failed',
        signingStorage: secretReport('not_stored'),
      }),
    };
  }

  if (plan.action === 'reuse' || plan.action === 'update') {
    let endpoint = plan.endpoint;
    if (plan.action === 'update') {
      endpoint = await transport({
        method: 'POST',
        path: `webhook_endpoints/${encodeURIComponent(endpoint.id)}`,
        body: webhookForm({ url: WEBHOOK_URL, disabled: 'false' }),
      });
    }
    const secretState = await netlifyClient.secretStatus();
    return {
      exitCode: secretState.present ? 0 : 6,
      report: baseReport({
        credential: { status: 'test_key_accepted', source: resolved.source },
        account: accountReport,
        site: { name: site.name, url: site.url, branch: site.branch, context: SECRET_CONTEXT },
        endpoint: publicEndpoint(endpoint, plan.action),
        signingStorage: secretReport(secretState.present ? 'already_present' : 'manual_required', {
          step: secretState.present
            ? null
            : 'The matching test endpoint already exists, and Stripe will not return its signing secret again. Put the saved signing secret in ACADEMY_STRIPE_WEBHOOK_SECRET on the staging site Functions production context. Do not paste it into chat.',
        }),
      }),
    };
  }

  let created = null;
  try {
    created = await transport({
      method: 'POST',
      path: 'webhook_endpoints',
      body: webhookForm({
        url: WEBHOOK_URL,
        description: 'Caiden staging Academy purchase flow',
        'metadata[caidens_setup]': 'caidens_academy_webhook_test',
      }),
      idempotencyKey: 'caidens-staging-academy-webhook-v1',
    });
    if (!eventsExact(created.enabled_events) || created.url !== WEBHOOK_URL || created.livemode === true) {
      throw new Error('webhook_configuration_rejected');
    }
    if (!String(created.secret || '').startsWith('whsec_')) throw new Error('signing_secret_missing');
    await netlifyClient.storeSigningSecret(created.secret);
    const confirmed = await listEndpoints(transport);
    const match = confirmed.find((endpoint) => endpoint.id === created.id);
    return {
      exitCode: 0,
      report: baseReport({
        credential: { status: 'test_key_accepted', source: resolved.source },
        account: accountReport,
        site: { name: site.name, url: site.url, branch: site.branch, context: SECRET_CONTEXT },
        endpoint: publicEndpoint(match || created, 'created'),
        signingStorage: secretReport('stored'),
      }),
    };
  } catch (error) {
    let rolledBack = false;
    if (created?.id) {
      try {
        await transport({ method: 'DELETE', path: `webhook_endpoints/${encodeURIComponent(created.id)}` });
        rolledBack = true;
      } catch {
        rolledBack = false;
      }
    }
    return {
      exitCode: 5,
      report: baseReport({
        credential: { status: 'test_key_accepted', source: resolved.source },
        account: accountReport,
        site: { name: site.name, url: site.url, branch: site.branch, context: SECRET_CONTEXT },
        endpoint: publicEndpoint(created, rolledBack ? 'rolled_back' : 'create_failed'),
        reason: redact(error.message || 'webhook_setup_failed'),
        endpointRolledBack: rolledBack,
        signingStorage: secretReport('not_stored'),
      }),
    };
  }
}

function baseReport(extra) {
  return scrub({
    mode: 'test',
    webhookUrl: WEBHOOK_URL,
    events: WEBHOOK_EVENTS,
    databaseWrite: false,
    salesFlagsChanged: false,
    testEventSent: false,
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
    body: spec.body ? spec.body.toString() : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(redact(payload?.error?.message || 'stripe_request_failed'));
  return payload;
}

function readArgs(argv) {
  return { dryRun: argv.includes('--dry-run') };
}

async function main(argv = process.argv.slice(2), env = process.env) {
  const { exitCode, report } = await runWebhookSetup({ env, dryRun: readArgs(argv).dryRun });
  process.stdout.write(`${JSON.stringify(scrub(report), null, 2)}\n`);
  return exitCode;
}

module.exports = {
  SECRET_CONTEXT,
  SECRET_ENV,
  SECRET_SCOPES,
  STAGING_SITE_URL,
  eventsExact,
  planWebhook,
  runWebhookSetup,
  stagingSiteAccepted,
  storedSecretAccepted,
  main,
};

if (require.main === module) {
  main().then((code) => {
    process.exitCode = code;
  }).catch((error) => {
    process.stderr.write(`${redact(error.message || 'webhook_setup_failed')}\n`);
    process.exitCode = 1;
  });
}
