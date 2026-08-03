#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PRODUCTION_PROJECT_REF = 'bnopaocdqkknjzmmkaen';
const allowedContexts = new Set(['production', 'deploy-preview', 'branch-deploy', 'dev']);
const rawContext = String(process.env.CONTEXT || '').trim().toLowerCase();
const context = rawContext === 'development' ? 'dev' : rawContext;
const expectedProjectRef = String(process.env.REACT_APP_SUPABASE_EXPECTED_PROJECT_REF || '').trim();

if (!allowedContexts.has(context) || !expectedProjectRef) {
  throw new Error('[runtime-context] missing or unknown Netlify context/project');
}
if (context === 'production' && expectedProjectRef !== PRODUCTION_PROJECT_REF) {
  throw new Error('[runtime-context] production project mismatch');
}
if (context !== 'production' && expectedProjectRef === PRODUCTION_PROJECT_REF) {
  throw new Error('[runtime-context] non-production build cannot use production');
}

const destination = path.join(
  process.cwd(),
  'netlify/functions/_lib/generatedRuntimeContext.js',
);
const contents = [
  '// Generated during the Netlify build. Contains no credentials.',
  `module.exports = ${JSON.stringify({ context, expectedProjectRef }, null, 2)};`,
  '',
].join('\n');
fs.writeFileSync(destination, contents, { encoding: 'utf8', mode: 0o600 });
console.log(`[runtime-context] sealed ${context} context for Functions`);
