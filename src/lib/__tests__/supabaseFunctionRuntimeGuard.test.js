const productionRef = 'bnopaocdqkknjzmmkaen';
const stagingRef = 'staging-project';

describe('Netlify Function Supabase runtime guard', () => {
  const original = process.env;

  afterEach(() => {
    process.env = original;
    jest.resetModules();
  });

  function resolve(overrides) {
    process.env = {
      ...original,
      PRODUCTION_SUPABASE_PROJECT_REF: productionRef,
      REACT_APP_SUPABASE_EXPECTED_PROJECT_REF: stagingRef,
      SUPABASE_SERVICE_ROLE_KEY: 'server-role',
      ...overrides,
    };
    return require('../../../netlify/functions/_lib/supabaseRuntime').getContextSupabaseConfig();
  }

  test('A: production context accepts production Functions', () => {
    expect(resolve({
      CONTEXT: 'production',
      SUPABASE_URL: `https://${productionRef}.supabase.co`,
    })).toEqual(expect.objectContaining({ context: 'production', projectRef: productionRef }));
  });

  test('C: production context rejects staging Functions', () => {
    expect(resolve({
      CONTEXT: 'production',
      SUPABASE_URL: `https://${stagingRef}.supabase.co`,
    })).toBeNull();
  });

  test('D: deploy-preview context accepts staging Functions', () => {
    expect(resolve({
      CONTEXT: 'deploy-preview',
      SUPABASE_URL: `https://${stagingRef}.supabase.co`,
    })).toEqual(expect.objectContaining({ context: 'deploy-preview', projectRef: stagingRef }));
  });

  test('F: deploy-preview context rejects production Functions', () => {
    expect(resolve({
      CONTEXT: 'deploy-preview',
      SUPABASE_URL: `https://${productionRef}.supabase.co`,
    })).toBeNull();
  });

  test('G: missing or unknown context and project fail closed', () => {
    expect(resolve({ CONTEXT: '', SUPABASE_URL: `https://${stagingRef}.supabase.co` })).toBeNull();
    expect(resolve({ CONTEXT: 'unknown', SUPABASE_URL: `https://${stagingRef}.supabase.co` })).toBeNull();
    expect(resolve({
      CONTEXT: 'deploy-preview',
      REACT_APP_SUPABASE_EXPECTED_PROJECT_REF: '',
      SUPABASE_URL: `https://${stagingRef}.supabase.co`,
    })).toBeNull();
  });

  test('rejects disagreement between frontend and Function runtime context', () => {
    const { validateClientRuntime } = require('../../../netlify/functions/_lib/supabaseRuntime');
    const env = {
      CONTEXT: 'deploy-preview',
      PRODUCTION_SUPABASE_PROJECT_REF: productionRef,
      REACT_APP_SUPABASE_EXPECTED_PROJECT_REF: stagingRef,
    };
    expect(validateClientRuntime({ headers: {
      'x-cc-deploy-context': 'production',
      'x-cc-supabase-project': productionRef,
    } }, env)).toBe(false);
    expect(validateClientRuntime({ headers: {
      'x-cc-deploy-context': 'deploy-preview',
      'x-cc-supabase-project': stagingRef,
    } }, env)).toBe(true);
  });
});
