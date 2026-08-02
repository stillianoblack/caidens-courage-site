const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const PRODUCTION_PROJECT_REF = 'bnopaocdqkknjzmmkaen';

function projectRefFromUrl(value) {
  try {
    const hostname = new URL(String(value || '')).hostname;
    return hostname.endsWith('.supabase.co') ? hostname.split('.')[0] : null;
  } catch {
    return null;
  }
}

function getProductionSupabaseConfig() {
  const url = String(process.env.SUPABASE_URL || '').trim();
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) return null;
  if (projectRefFromUrl(url) !== PRODUCTION_PROJECT_REF) {
    console.error('[SUPABASE_RUNTIME_PROJECT_MISMATCH]', {
      expectedProjectRef: PRODUCTION_PROJECT_REF,
      actualProjectRef: projectRefFromUrl(url),
      context: process.env.CONTEXT || null,
    });
    return null;
  }
  return { url, key };
}

function getProductionSupabase() {
  const config = getProductionSupabaseConfig();
  if (!config) return null;
  return createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: WebSocket },
  });
}

module.exports = {
  PRODUCTION_PROJECT_REF,
  getProductionSupabase,
  getProductionSupabaseConfig,
  projectRefFromUrl,
};
