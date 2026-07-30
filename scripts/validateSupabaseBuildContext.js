const fs = require('fs');
const path = require('path');

const productionContext = process.env.CONTEXT === 'production';
const previewContext = ['deploy-preview', 'branch-deploy', 'dev'].includes(process.env.CONTEXT || '');
const clientUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const clientPublicKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const productionRef = process.env.PRODUCTION_SUPABASE_PROJECT_REF || '';
const expectedRef = process.env.REACT_APP_SUPABASE_EXPECTED_PROJECT_REF || '';
const projectRef = (() => {
  try {
    return new URL(clientUrl).hostname.split('.')[0] || '';
  } catch {
    return '';
  }
})();

function decodeLegacyJwtClaims(value) {
  const segments = value.split('.');
  if (segments.length !== 3) return null;
  try {
    return JSON.parse(Buffer.from(segments[1], 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

const clientKeyClaims = decodeLegacyJwtClaims(clientPublicKey);

function fail(message) {
  console.error(`[supabase-build-context] ${message}`);
  process.exit(1);
}

const legacyAdminKeys = ['EMAIL', 'PASSCODE'].map((suffix) =>
  ['REACT', 'APP', 'ADMIN', suffix].join('_'));

if (legacyAdminKeys.some((key) => process.env[key])) {
  fail('Legacy client-side admin credentials must be removed before building.');
}

function findClientCredentialReference(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const nested = findClientCredentialReference(absolutePath);
      if (nested) return nested;
      continue;
    }
    if (!/\.(?:js|jsx|ts|tsx)$/.test(entry.name)) continue;
    const source = fs.readFileSync(absolutePath, 'utf8');
    if (legacyAdminKeys.some((key) => source.includes(key))) return absolutePath;
  }
  return null;
}

const clientSourceDirectory = process.env.CLIENT_SOURCE_DIR || path.resolve(process.cwd(), 'src');
const clientCredentialReference = findClientCredentialReference(clientSourceDirectory);
if (clientCredentialReference) {
  fail(`Client-side admin credential reference found in ${path.relative(process.cwd(), clientCredentialReference)}.`);
}

if (productionContext) {
  if (!clientUrl || !clientPublicKey || !productionRef) {
    fail(
      'Production builds require a Supabase URL, browser public key, and PRODUCTION_SUPABASE_PROJECT_REF.',
    );
  }
  if (projectRef !== productionRef || (expectedRef && expectedRef !== productionRef)) {
    fail('Production Supabase configuration does not match the approved production project.');
  }
  if (
    clientKeyClaims &&
    (clientKeyClaims.ref !== productionRef || clientKeyClaims.role !== 'anon')
  ) {
    fail('Production browser credential does not match the approved production project.');
  }
  if (!clientKeyClaims && !clientPublicKey.startsWith('sb_publishable_')) {
    fail('Production browser credential is not a recognized public Supabase credential.');
  }
}

if (
  previewContext &&
  productionRef &&
  (projectRef === productionRef || expectedRef === productionRef) &&
  process.env.ALLOW_PREVIEW_PRODUCTION_SUPABASE !== 'true'
) {
  fail('Preview and branch builds may not target production without explicit approval.');
}

if (
  previewContext &&
  clientKeyClaims &&
  projectRef &&
  clientKeyClaims.ref !== projectRef
) {
  fail('Browser Supabase URL and credential belong to different projects.');
}

console.info('[supabase-build-context] deploy context validated');
