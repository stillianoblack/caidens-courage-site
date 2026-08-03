export const PRODUCTION_SUPABASE_PROJECT_REF = 'bnopaocdqkknjzmmkaen';

const NON_PRODUCTION_CONTEXTS = new Set(['deploy-preview', 'branch-deploy', 'dev', 'development']);

export function normalizeBrowserDeployContext(value) {
  const context = String(value || '').trim().toLowerCase();
  if (context === 'production') return 'production';
  if (NON_PRODUCTION_CONTEXTS.has(context)) return context === 'development' ? 'dev' : context;
  return null;
}

export function supabaseProjectRefFromUrl(value) {
  try {
    const hostname = new URL(String(value || '')).hostname;
    return hostname.endsWith('.supabase.co') ? hostname.split('.')[0] : null;
  } catch {
    return null;
  }
}

export function resolveBrowserSupabaseContext(env = process.env) {
  const rawContext = env.REACT_APP_NETLIFY_CONTEXT ||
    (env.NODE_ENV === 'development' ? 'development' : '');
  const context = normalizeBrowserDeployContext(rawContext);
  const expectedProjectRef = String(env.REACT_APP_SUPABASE_EXPECTED_PROJECT_REF || '').trim();
  const projectRef = supabaseProjectRefFromUrl(env.REACT_APP_SUPABASE_URL);
  const production = context === 'production';
  const validExpectedRef = production
    ? expectedProjectRef === PRODUCTION_SUPABASE_PROJECT_REF
    : Boolean(context && expectedProjectRef && expectedProjectRef !== PRODUCTION_SUPABASE_PROJECT_REF);
  return {
    context,
    production,
    expectedProjectRef: validExpectedRef ? expectedProjectRef : null,
    projectRef,
    valid: Boolean(context && validExpectedRef && projectRef === expectedProjectRef),
  };
}

export function isNonProductionPortalBuild() {
  const resolved = resolveBrowserSupabaseContext();
  return resolved.valid && !resolved.production;
}

/** @returns {Record<string, string>} */
export function browserRuntimeHeaders() {
  const resolved = resolveBrowserSupabaseContext();
  if (!resolved.valid || !resolved.context || !resolved.projectRef) return {};
  return {
    'X-CC-Deploy-Context': resolved.context,
    'X-CC-Supabase-Project': resolved.projectRef,
  };
}
