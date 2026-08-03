import {
  PRODUCTION_SUPABASE_PROJECT_REF,
  isNonProductionPortalBuild,
  resolveBrowserSupabaseContext,
} from '../supabaseRuntimeContext';

const stagingRef = 'staging-project';

describe('browser Supabase runtime context', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  test('A: production context accepts the production browser', () => {
    expect(resolveBrowserSupabaseContext({
      REACT_APP_NETLIFY_CONTEXT: 'production',
      REACT_APP_SUPABASE_EXPECTED_PROJECT_REF: PRODUCTION_SUPABASE_PROJECT_REF,
      REACT_APP_SUPABASE_URL: `https://${PRODUCTION_SUPABASE_PROJECT_REF}.supabase.co`,
    })).toEqual(expect.objectContaining({ valid: true, production: true }));
  });

  test('B: production context rejects a staging browser', () => {
    expect(resolveBrowserSupabaseContext({
      REACT_APP_NETLIFY_CONTEXT: 'production',
      REACT_APP_SUPABASE_EXPECTED_PROJECT_REF: PRODUCTION_SUPABASE_PROJECT_REF,
      REACT_APP_SUPABASE_URL: `https://${stagingRef}.supabase.co`,
    }).valid).toBe(false);
  });

  test('D: deploy-preview context accepts the configured staging browser', () => {
    expect(resolveBrowserSupabaseContext({
      REACT_APP_NETLIFY_CONTEXT: 'deploy-preview',
      REACT_APP_SUPABASE_EXPECTED_PROJECT_REF: stagingRef,
      REACT_APP_SUPABASE_URL: `https://${stagingRef}.supabase.co`,
    })).toEqual(expect.objectContaining({ valid: true, production: false }));
  });

  test('E: deploy-preview context rejects a production browser', () => {
    expect(resolveBrowserSupabaseContext({
      REACT_APP_NETLIFY_CONTEXT: 'deploy-preview',
      REACT_APP_SUPABASE_EXPECTED_PROJECT_REF: stagingRef,
      REACT_APP_SUPABASE_URL: `https://${PRODUCTION_SUPABASE_PROJECT_REF}.supabase.co`,
    }).valid).toBe(false);
  });

  test('G: missing or unknown context/project fails closed', () => {
    expect(resolveBrowserSupabaseContext({
      REACT_APP_SUPABASE_EXPECTED_PROJECT_REF: stagingRef,
      REACT_APP_SUPABASE_URL: `https://${stagingRef}.supabase.co`,
    }).valid).toBe(false);
    expect(resolveBrowserSupabaseContext({
      REACT_APP_NETLIFY_CONTEXT: 'unknown',
      REACT_APP_SUPABASE_EXPECTED_PROJECT_REF: stagingRef,
      REACT_APP_SUPABASE_URL: `https://${stagingRef}.supabase.co`,
    }).valid).toBe(false);
  });

  test('shows the environment banner only for a valid non-production build', () => {
    process.env = {
      ...originalEnv,
      REACT_APP_NETLIFY_CONTEXT: 'deploy-preview',
      REACT_APP_SUPABASE_EXPECTED_PROJECT_REF: stagingRef,
      REACT_APP_SUPABASE_URL: `https://${stagingRef}.supabase.co`,
    };
    expect(isNonProductionPortalBuild()).toBe(true);
    process.env.REACT_APP_NETLIFY_CONTEXT = 'production';
    process.env.REACT_APP_SUPABASE_EXPECTED_PROJECT_REF = PRODUCTION_SUPABASE_PROJECT_REF;
    process.env.REACT_APP_SUPABASE_URL = `https://${PRODUCTION_SUPABASE_PROJECT_REF}.supabase.co`;
    expect(isNonProductionPortalBuild()).toBe(false);
  });
});
