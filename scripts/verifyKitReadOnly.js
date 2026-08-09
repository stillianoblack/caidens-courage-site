const fs = require('fs');
const path = require('path');
const { KitV4Provider } = require('../netlify/functions/_lib/kitV4Provider');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'docs', 'audits', 'kit-read-only-result.json');
const REQUIRED_FALSE_FLAGS = [
  'AUDIENCE_PROVIDER_SYNC_ENABLED',
  'KIT_WRITE_OPERATIONS_ENABLED',
  'KIT_WEBHOOKS_ENABLED',
  'KIT_MCP_ASSISTANT_ENABLED',
];

function readLocalEnv() {
  return Object.fromEntries(
    fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.trim().startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      }),
  );
}

async function main() {
  const env = { ...readLocalEnv(), ...process.env };
  for (const flag of REQUIRED_FALSE_FLAGS) {
    if (env[flag] !== 'false') throw new Error(`${flag} must equal false for Kit read-only verification.`);
  }
  if (!env.KIT_API_KEY) throw new Error('KIT_API_KEY is not configured.');

  const methods = [];
  const readOnlyFetch = async (url, options = {}) => {
    const method = String(options.method || 'GET').toUpperCase();
    methods.push(method);
    if (method !== 'GET') throw new Error(`Blocked non-read Kit request: ${method}.`);
    return fetch(url, options);
  };
  const provider = new KitV4Provider({
    apiKey: env.KIT_API_KEY,
    baseUrl: env.KIT_API_BASE_URL,
    fetch: readOnlyFetch,
  });

  // The first real request is intentionally the smallest approved V4 read.
  const tags = await provider.listTags();

  const accountResponse = await readOnlyFetch(`${provider.baseUrl}/v4/account`, {
    headers: { 'X-Kit-Api-Key': env.KIT_API_KEY, Accept: 'application/json' },
  });
  if (!accountResponse.ok) throw new Error(`Kit account verification failed with HTTP ${accountResponse.status}.`);
  await accountResponse.text();

  const subscribers = await provider.listSubscribers({ limit: 25, status: 'all' });
  let subscriberSecondPageCount = 0;
  if (subscribers.nextCursor) {
    const next = await provider.listSubscribers({ limit: 25, status: 'all', cursor: subscribers.nextCursor });
    subscriberSecondPageCount = next.items.length;
  }
  const sequences = await provider.listSequences();
  const broadcasts = await provider.listBroadcasts();
  let broadcastMetricKeys = [];
  if (broadcasts.items[0]?.id != null) {
    const stats = await provider.getBroadcastStats({ externalBroadcastId: broadcasts.items[0].id });
    broadcastMetricKeys = Object.keys(stats.metrics || {}).sort();
  }

  const result = {
    generated_at: new Date().toISOString(),
    mode: 'read-only',
    writes_enabled: false,
    account_access: true,
    subscribers: {
      first_page_count: subscribers.items.length,
      provider_total_count: subscribers.totalCount,
      has_next_page: Boolean(subscribers.nextCursor),
      second_page_count: subscriberSecondPageCount,
    },
    tags: { first_page_count: tags.items.length, has_next_page: Boolean(tags.nextCursor) },
    sequences: { first_page_count: sequences.items.length, has_next_page: Boolean(sequences.nextCursor) },
    broadcasts: {
      first_page_count: broadcasts.items.length,
      has_next_page: Boolean(broadcasts.nextCursor),
      metrics_checked: broadcasts.items.length > 0,
      metric_keys: broadcastMetricKeys,
    },
    request_methods: [...new Set(methods)],
  };
  if (result.request_methods.some((method) => method !== 'GET')) {
    throw new Error('Kit read-only verification observed a non-GET request.');
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(result, null, 2)}\n`, { mode: 0o600 });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  const statusMatch = String(error.message).match(/HTTP (\d{3})/);
  const failure = {
    generated_at: new Date().toISOString(),
    mode: 'read-only',
    status: 'blocked',
    writes_enabled: false,
    failure_class: statusMatch ? 'provider_authentication_or_request_rejected' : 'local_safety_or_configuration',
    http_status: statusMatch ? Number(statusMatch[1]) : null,
    request_methods: statusMatch ? ['GET'] : [],
    secrets_recorded: false,
  };
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(failure, null, 2)}\n`, { mode: 0o600 });
  console.error(error.message);
  process.exitCode = 1;
});
