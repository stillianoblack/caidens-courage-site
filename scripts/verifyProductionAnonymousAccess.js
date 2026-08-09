const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BUNDLE_PATH = '/private/tmp/caidens-production-main.js';
const TABLES = [
  'pilot_programs',
  'participants',
  'assessment_results',
  'assessment_results_v2',
  'module_results',
  'player_progress',
  'program_goals',
  'player_wallets',
  'player_badges',
  'player_reward_claims',
  'kid_play_sessions',
  'student_family_links',
];

function readEnvFile() {
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

function extractPublicProductionConfiguration() {
  if (!fs.existsSync(BUNDLE_PATH)) throw new Error('The downloaded production bundle is unavailable.');
  const bundle = fs.readFileSync(BUNDLE_PATH, 'utf8');
  const urls = [...new Set(bundle.match(/https:\/\/[a-z0-9]{20}\.supabase\.co/g) || [])];
  const tokens = [...new Set(bundle.match(/eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g) || [])];
  if (urls.length !== 1 || tokens.length !== 1) {
    throw new Error('Could not identify one unambiguous public production Supabase configuration.');
  }
  return { url: urls[0], anonKey: tokens[0] };
}

async function main() {
  const env = readEnvFile();
  const productionRef = env.PRODUCTION_SUPABASE_PROJECT_REF;
  const { url, anonKey } = extractPublicProductionConfiguration();
  const detectedRef = new URL(url).hostname.split('.')[0];
  if (!productionRef || detectedRef !== productionRef) {
    throw new Error('The public bundle does not match the configured production project reference.');
  }

  const results = {};
  for (const table of TABLES) {
    try {
      const response = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, Accept: 'application/json' },
      });
      const body = await response.text();
      if (response.ok) {
        const rows = JSON.parse(body);
        results[table] = Array.isArray(rows) && rows.length > 0 ? 'ROWS_RETURNED' : 'ALLOWED_ZERO_ROWS';
      } else if (response.status === 401 && /invalid api key/i.test(body)) {
        results[table] = 'REQUEST_ERROR_INVALID_PUBLIC_KEY';
      } else if (response.status === 401 || response.status === 403 || /permission denied|row-level security/i.test(body)) {
        results[table] = 'DENIED';
      } else {
        results[table] = `REQUEST_ERROR_HTTP_${response.status}`;
      }
    } catch {
      results[table] = 'REQUEST_ERROR_NETWORK';
    }
  }

  console.log(JSON.stringify(results, null, 2));
  if (Object.values(results).includes('ROWS_RETURNED')) {
    throw new Error('Production anonymous access returned at least one sensitive row.');
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
