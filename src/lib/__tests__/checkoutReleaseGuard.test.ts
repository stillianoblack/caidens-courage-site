import {
  CHECKOUT_PRODUCTION_PROJECT_REF,
  CHECKOUT_STAGING_PROJECT_REF,
  resolveCheckoutEnvironment,
} from '../checkoutEnvironment';

describe('production checkout identity', () => {
  test('allows live payment links only for the production project on a production host', () => {
    const production = resolveCheckoutEnvironment({
      appEnvironment: 'production',
      supabaseUrl: `https://${CHECKOUT_PRODUCTION_PROJECT_REF}.supabase.co`,
      expectedProjectRef: CHECKOUT_PRODUCTION_PROJECT_REF,
      hostname: 'caidenscourage.com',
    });
    expect(production.name).toBe('production');
    expect(production.allowLivePaymentLinks).toBe(true);
    expect(production.allowVerifiedTestCheckout).toBe(false);

    const staging = resolveCheckoutEnvironment({
      appEnvironment: 'staging',
      supabaseUrl: `https://${CHECKOUT_STAGING_PROJECT_REF}.supabase.co`,
      expectedProjectRef: CHECKOUT_STAGING_PROJECT_REF,
      hostname: 'caidens-courage-staging.netlify.app',
    });
    expect(staging.allowLivePaymentLinks).toBe(false);

    const mixed = resolveCheckoutEnvironment({
      appEnvironment: 'production',
      supabaseUrl: `https://${CHECKOUT_STAGING_PROJECT_REF}.supabase.co`,
      expectedProjectRef: CHECKOUT_STAGING_PROJECT_REF,
      hostname: 'caidenscourage.com',
    });
    expect(mixed.allowLivePaymentLinks).toBe(false);
    expect(mixed.consistent).toBe(false);
  });
});
