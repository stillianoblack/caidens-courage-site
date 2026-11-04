const { buildAcademyHandoffCookie } = require('../../../netlify/functions/_lib/academyBundleActivation');
const { publicSiteOrigin } = require('../../../netlify/functions/_lib/bookstoreDelivery');
const {
  ACTIVATION_PRODUCTION_PROJECT_REF,
  ACTIVATION_STAGING_PROJECT_REF,
  STAGING_PREVIEW_ORIGIN,
  claimLinkOrigin,
  createActivationServiceClient,
  resolvePreviewClaimOrigin,
} = require('../../../netlify/functions/_lib/activationPreviewGuard');

const BRANCH_PREVIEW_ORIGIN = 'https://preview-academy-bundle-activation--caidens-courage-staging.netlify.app';

function serviceKey(ref, role = 'service_role') {
  const payload = Buffer.from(JSON.stringify({ ref, role })).toString('base64url');
  return `header.${payload}.signature`;
}

function stagingEnv(overrides = {}) {
  return {
    SUPABASE_URL: `https://${ACTIVATION_STAGING_PROJECT_REF}.supabase.co`,
    SUPABASE_SERVICE_ROLE_KEY: serviceKey(ACTIVATION_STAGING_PROJECT_REF),
    ...overrides,
  };
}

describe('activation service client isolation', () => {
  test('accepts the staging project and constructs one client', () => {
    const createClient = jest.fn(() => ({ kind: 'client' }));
    const env = stagingEnv();
    const client = createActivationServiceClient(env, createClient);
    expect(client).toEqual({ kind: 'client' });
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(createClient.mock.calls[0][0]).toBe(env.SUPABASE_URL);
    expect(createClient.mock.calls[0][1]).toBe(env.SUPABASE_SERVICE_ROLE_KEY);
  });

  test('refuses a production project before constructing a client', () => {
    const createClient = jest.fn();
    const client = createActivationServiceClient({
      SUPABASE_URL: `https://${ACTIVATION_PRODUCTION_PROJECT_REF}.supabase.co`,
      SUPABASE_SERVICE_ROLE_KEY: serviceKey(ACTIVATION_PRODUCTION_PROJECT_REF),
    }, createClient);
    expect(client).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });

  test('fails closed when configuration is missing', () => {
    const createClient = jest.fn();
    expect(createActivationServiceClient({
      SUPABASE_URL: '',
      SUPABASE_SERVICE_ROLE_KEY: serviceKey(ACTIVATION_STAGING_PROJECT_REF),
    }, createClient)).toBeNull();
    expect(createActivationServiceClient({
      SUPABASE_URL: `https://${ACTIVATION_STAGING_PROJECT_REF}.supabase.co`,
      SUPABASE_SERVICE_ROLE_KEY: '',
    }, createClient)).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });

  test('refuses mismatched project credentials before constructing a client', () => {
    const createClient = jest.fn();
    expect(createActivationServiceClient(stagingEnv({
      SUPABASE_SERVICE_ROLE_KEY: serviceKey('anotherproject'),
    }), createClient)).toBeNull();
    expect(createActivationServiceClient(stagingEnv({
      SUPABASE_SERVICE_ROLE_KEY: serviceKey(ACTIVATION_PRODUCTION_PROJECT_REF),
    }), createClient)).toBeNull();
    expect(createActivationServiceClient(stagingEnv({
      SUPABASE_SERVICE_ROLE_KEY: serviceKey(ACTIVATION_STAGING_PROJECT_REF, 'anon'),
    }), createClient)).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });
});

describe('preview invitation origins', () => {
  const previewOrigin = 'https://deploy-preview-7--caidens-courage-staging.netlify.app';

  test('accepts an approved preview origin', () => {
    const env = { ACADEMY_PREVIEW_ORIGINS: previewOrigin };
    expect(resolvePreviewClaimOrigin(STAGING_PREVIEW_ORIGIN, env)).toBe(STAGING_PREVIEW_ORIGIN);
    expect(resolvePreviewClaimOrigin(previewOrigin, env)).toBe(previewOrigin);
  });

  test('refuses unknown, production, and caller-supplied origins', () => {
    const env = {
      ACADEMY_PREVIEW_ORIGINS: `https://caidenscourage.com,${previewOrigin}`,
    };
    expect(resolvePreviewClaimOrigin('https://caidenscourage.com', env)).toBeNull();
    expect(resolvePreviewClaimOrigin('https://www.caidenscourage.com', env)).toBeNull();
    expect(resolvePreviewClaimOrigin('https://quiet-pothos-3ae8ce.netlify.app', env)).toBeNull();
    expect(resolvePreviewClaimOrigin('https://evil.example', env)).toBeNull();
    expect(resolvePreviewClaimOrigin('http://caidens-courage-staging.netlify.app', env)).toBeNull();
    expect(claimLinkOrigin({
      publicOrigin: STAGING_PREVIEW_ORIGIN,
      requestedOrigin: 'https://caidenscourage.com',
      env,
    })).toBe(STAGING_PREVIEW_ORIGIN);
    expect(claimLinkOrigin({
      publicOrigin: 'https://evil.example',
      requestedOrigin: previewOrigin,
      env,
    })).toBeNull();
  });

  test('branch deploy uses DEPLOY_PRIME_URL only when it is explicitly allowlisted', () => {
    const env = {
      CONTEXT: 'branch-deploy',
      URL: STAGING_PREVIEW_ORIGIN,
      DEPLOY_PRIME_URL: BRANCH_PREVIEW_ORIGIN,
      ACADEMY_PREVIEW_ORIGINS: `https://caidenscourage.com,${BRANCH_PREVIEW_ORIGIN}`,
    };
    expect(publicSiteOrigin(env)).toBe(BRANCH_PREVIEW_ORIGIN);
    expect(claimLinkOrigin({
      publicOrigin: 'https://caidenscourage.com',
      requestedOrigin: STAGING_PREVIEW_ORIGIN,
      env,
    })).toBe(BRANCH_PREVIEW_ORIGIN);
  });

  test('branch deploy rejects published, unknown, caller-supplied, and production origins', () => {
    const env = {
      CONTEXT: 'branch-deploy',
      URL: STAGING_PREVIEW_ORIGIN,
      DEPLOY_PRIME_URL: BRANCH_PREVIEW_ORIGIN,
    };
    expect(publicSiteOrigin(env)).toBe(BRANCH_PREVIEW_ORIGIN);
    expect(claimLinkOrigin({ publicOrigin: STAGING_PREVIEW_ORIGIN, env })).toBeNull();
    expect(resolvePreviewClaimOrigin(STAGING_PREVIEW_ORIGIN, env)).toBeNull();
    expect(resolvePreviewClaimOrigin('https://evil.example', env)).toBeNull();
    expect(claimLinkOrigin({
      publicOrigin: 'https://evil.example',
      requestedOrigin: 'https://evil.example',
      env: { ...env, ACADEMY_PREVIEW_ORIGINS: 'https://evil.example' },
    })).toBeNull();
    expect(claimLinkOrigin({
      publicOrigin: BRANCH_PREVIEW_ORIGIN,
      requestedOrigin: BRANCH_PREVIEW_ORIGIN,
      env: {
        ...env,
        DEPLOY_PRIME_URL: 'https://caidenscourage.com',
        ACADEMY_PREVIEW_ORIGINS: `https://caidenscourage.com,${BRANCH_PREVIEW_ORIGIN}`,
      },
    })).toBeNull();
    expect(claimLinkOrigin({
      env: {
        ...env,
        DEPLOY_PRIME_URL: 'https://quiet-pothos-3ae8ce.netlify.app/story/books/claim',
        ACADEMY_PREVIEW_ORIGINS: 'https://quiet-pothos-3ae8ce.netlify.app',
      },
    })).toBeNull();
    expect(publicSiteOrigin({ CONTEXT: 'branch-deploy', URL: STAGING_PREVIEW_ORIGIN })).toBe('');
  });

  test('keeps the handoff cookie host-only', () => {
    const cookie = buildAcademyHandoffCookie('handoff-fixture-secret', { secure: true });
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Path=/');
    expect(cookie).not.toMatch(/Domain=/i);
    expect(cookie).not.toContain('handoff-fixture-secret=');
  });
});
