const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const PRODUCTION_PROJECT_REF = 'bnopaocdqkknjzmmkaen';
const PRODUCTION_CONTEXTS = new Set(['production']);
const NON_PRODUCTION_CONTEXTS = new Set(['deploy-preview', 'branch-deploy', 'dev', 'development']);

function normalizeContext(value) {
  const context = String(value || '').trim().toLowerCase();
  if (PRODUCTION_CONTEXTS.has(context)) return 'production';
  if (NON_PRODUCTION_CONTEXTS.has(context)) return context === 'development' ? 'dev' : context;
  return null;
}

function projectRefFromUrl(value) {
  try {
    const hostname = new URL(String(value || '')).hostname;
    return hostname.endsWith('.supabase.co') ? hostname.split('.')[0] : null;
  } catch {
    return null;
  }
}

function resolveExpectedProjectRef(env = process.env) {
  const context = normalizeContext(env.CONTEXT || env.NETLIFY_CONTEXT);
  if (!context) return { context: null, expectedProjectRef: null, production: false };
  if (context === 'production') {
    const configuredProductionRef = String(env.PRODUCTION_SUPABASE_PROJECT_REF || '').trim();
    if (configuredProductionRef !== PRODUCTION_PROJECT_REF) {
      return { context, expectedProjectRef: null, production: true };
    }
    return { context, expectedProjectRef: PRODUCTION_PROJECT_REF, production: true };
  }
  const expectedProjectRef = String(env.REACT_APP_SUPABASE_EXPECTED_PROJECT_REF || '').trim();
  if (!expectedProjectRef || expectedProjectRef === PRODUCTION_PROJECT_REF) {
    return { context, expectedProjectRef: null, production: false };
  }
  return { context, expectedProjectRef, production: false };
}

function getContextSupabaseConfig(env = process.env) {
  const resolved = resolveExpectedProjectRef(env);
  const url = String(env.SUPABASE_URL || '').trim();
  const key = String(env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const actualProjectRef = projectRefFromUrl(url);
  if (!resolved.context || !resolved.expectedProjectRef || !url || !key || actualProjectRef !== resolved.expectedProjectRef) {
    console.error('[SUPABASE_RUNTIME_CONTEXT_MISMATCH]', {
      context: resolved.context,
      expectedProjectRef: resolved.expectedProjectRef,
      actualProjectRef,
    });
    return null;
  }
  return { url, key, context: resolved.context, projectRef: actualProjectRef };
}

function getContextSupabase() {
  const config = getContextSupabaseConfig();
  if (!config) return null;
  return createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: WebSocket },
  });
}

function validateClientRuntime(event, env = process.env) {
  const server = resolveExpectedProjectRef(env);
  const clientContext = normalizeContext(event?.headers?.['x-cc-deploy-context']);
  const clientProjectRef = String(event?.headers?.['x-cc-supabase-project'] || '').trim();
  return Boolean(
    server.context &&
    server.expectedProjectRef &&
    clientContext === server.context &&
    clientProjectRef === server.expectedProjectRef
  );
}

module.exports = {
  NON_PRODUCTION_CONTEXTS,
  PRODUCTION_PROJECT_REF,
  getContextSupabase,
  getContextSupabaseConfig,
  normalizeContext,
  projectRefFromUrl,
  resolveExpectedProjectRef,
  validateClientRuntime,
  // Backward-compatible name used by shared helpers.
  getProductionSupabase: getContextSupabase,
};
