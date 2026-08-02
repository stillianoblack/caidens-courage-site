describe('Netlify Function Supabase runtime guard', () => {
  const original = process.env;

  afterEach(() => {
    process.env = original;
    jest.resetModules();
  });

  test('rejects a non-production project URL', () => {
    process.env = {
      ...original,
      SUPABASE_URL: 'https://stagingproject.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'server-role',
    };
    const { getProductionSupabaseConfig } = require('../../../netlify/functions/_lib/supabaseRuntime');
    expect(getProductionSupabaseConfig()).toBeNull();
  });

  test('accepts only the approved production project URL', () => {
    process.env = {
      ...original,
      SUPABASE_URL: 'https://bnopaocdqkknjzmmkaen.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'server-role',
    };
    const { getProductionSupabaseConfig } = require('../../../netlify/functions/_lib/supabaseRuntime');
    expect(getProductionSupabaseConfig()).toEqual({
      url: 'https://bnopaocdqkknjzmmkaen.supabase.co',
      key: 'server-role',
    });
  });
});
