import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BookstoreOffers from '../../components/bookstore/BookstoreOffers';
import { CAMPS_PAGE } from '../../config/personaPages';
import { getStripePreorderUrl, openExternalUrl, productLinks } from '../../config/externalLinks';
import { DEFAULT_PRICING_PLANS } from '../../data/pricingPlansDefaults';
import ConfigurablePricingCard from '../../components/shared/ConfigurablePricingCard';
import {
  CHECKOUT_PRODUCTION_PROJECT_REF,
  CHECKOUT_STAGING_PROJECT_REF,
  canFollowCheckoutUrl,
  canOpenExternalUrl,
  resolveCheckoutEnvironment,
  visibleCheckoutHref,
  type CheckoutEnvironmentInput,
} from '../checkoutEnvironment';
import { blockStripeNavigationEvent, installCheckoutNavigationGuard } from '../checkoutNavigationGuard';

jest.mock('../../hooks/useBookstoreProducts', () => ({
  useBookstoreProducts: () => ({
    products: {},
    loading: false,
    error: new Error('missing supabase configuration'),
  }),
}));

const PAPERBACK_LINK = productLinks.paperback;
const TEST_SESSION = 'https://checkout.stripe.com/c/pay/cs_test_verified123';
const LIVE_SESSION = 'https://checkout.stripe.com/c/pay/cs_live_verified123';

function identity(overrides: CheckoutEnvironmentInput = {}): CheckoutEnvironmentInput {
  return {
    appEnvironment: '',
    supabaseUrl: '',
    expectedProjectRef: '',
    productionProjectRef: CHECKOUT_PRODUCTION_PROJECT_REF,
    stagingProjectRef: CHECKOUT_STAGING_PROJECT_REF,
    hostname: 'caidens-courage-staging.netlify.app',
    ...overrides,
  };
}

function stagingIdentity(overrides: CheckoutEnvironmentInput = {}): CheckoutEnvironmentInput {
  return identity({
    appEnvironment: 'staging',
    supabaseUrl: `https://${CHECKOUT_STAGING_PROJECT_REF}.supabase.co`,
    expectedProjectRef: CHECKOUT_STAGING_PROJECT_REF,
    hostname: 'caidens-courage-staging.netlify.app',
    ...overrides,
  });
}

function productionIdentity(overrides: CheckoutEnvironmentInput = {}): CheckoutEnvironmentInput {
  return identity({
    appEnvironment: 'production',
    supabaseUrl: `https://${CHECKOUT_PRODUCTION_PROJECT_REF}.supabase.co`,
    expectedProjectRef: CHECKOUT_PRODUCTION_PROJECT_REF,
    hostname: 'caidenscourage.com',
    ...overrides,
  });
}

const hardcodedStripeUrls = [
  ...Object.values(productLinks),
  getStripePreorderUrl(),
  ...DEFAULT_PRICING_PLANS.map((plan) => plan.stripeUrl),
  ...CAMPS_PAGE.pricing.map((tier) => tier.cta?.href),
].filter((url): url is string => Boolean(url));

describe('checkout environment guard', () => {
  test('fails closed when Supabase configuration is missing', () => {
    const environment = resolveCheckoutEnvironment(identity());
    expect(environment).toMatchObject({
      name: 'unknown',
      consistent: false,
      allowLivePaymentLinks: false,
      allowVerifiedTestCheckout: false,
    });
    expect(canOpenExternalUrl(PAPERBACK_LINK, identity())).toBe(false);
    expect(canFollowCheckoutUrl(TEST_SESSION, { verifiedTestSession: true }, identity())).toBe(false);
  });

  test('blocks live payment links, fallbacks, and non-bookstore links in staging', () => {
    const environment = resolveCheckoutEnvironment(stagingIdentity());
    expect(environment.allowLivePaymentLinks).toBe(false);
    expect(environment.allowVerifiedTestCheckout).toBe(true);
    hardcodedStripeUrls.forEach((url) => {
      expect(visibleCheckoutHref(url, stagingIdentity())).toBeNull();
      expect(canOpenExternalUrl(url, stagingIdentity())).toBe(false);
      expect(canFollowCheckoutUrl(url, { verifiedTestSession: true }, stagingIdentity())).toBe(false);
    });
  });

  test('allows a verified test Checkout Session only for a consistent staging identity', () => {
    expect(canFollowCheckoutUrl(TEST_SESSION, { verifiedTestSession: true }, stagingIdentity())).toBe(true);
    expect(canFollowCheckoutUrl(TEST_SESSION, { verifiedTestSession: false }, stagingIdentity())).toBe(false);
    expect(canFollowCheckoutUrl(LIVE_SESSION, { verifiedTestSession: true }, stagingIdentity())).toBe(false);
    expect(canOpenExternalUrl(TEST_SESSION, stagingIdentity())).toBe(false);
  });

  test('preserves production payment links on a production host', () => {
    const environment = resolveCheckoutEnvironment(productionIdentity());
    expect(environment).toMatchObject({
      name: 'production',
      consistent: true,
      allowLivePaymentLinks: true,
    });
    expect(visibleCheckoutHref(PAPERBACK_LINK, productionIdentity())).toBe(PAPERBACK_LINK);
    expect(canFollowCheckoutUrl(LIVE_SESSION, undefined, productionIdentity())).toBe(true);
    expect(resolveCheckoutEnvironment(productionIdentity({ appEnvironment: '' })).allowLivePaymentLinks).toBe(true);
    expect(visibleCheckoutHref('https://www.amazon.com/dp/B0HNDXXRBV', stagingIdentity())).toBe(
      'https://www.amazon.com/dp/B0HNDXXRBV',
    );
  });

  test('fails closed when the environment name and Supabase project disagree', () => {
    const productionOnStagingProject = stagingIdentity({ appEnvironment: 'production' });
    const stagingOnProductionProject = productionIdentity({
      appEnvironment: 'staging',
      hostname: 'caidenscourage.com',
    });
    const expectedMismatch = stagingIdentity({ expectedProjectRef: CHECKOUT_PRODUCTION_PROJECT_REF });
    const unknownProject = identity({
      appEnvironment: 'staging',
      supabaseUrl: 'https://cccccccccccccccccccc.supabase.co',
      expectedProjectRef: 'cccccccccccccccccccc',
    });

    [productionOnStagingProject, stagingOnProductionProject, expectedMismatch, unknownProject].forEach((input) => {
      expect(resolveCheckoutEnvironment(input).consistent).toBe(false);
      expect(canOpenExternalUrl(PAPERBACK_LINK, input)).toBe(false);
      expect(canFollowCheckoutUrl(TEST_SESSION, { verifiedTestSession: true }, input)).toBe(false);
    });
  });

  test('blocks a production project when it is served from a non-production host', () => {
    const misdirected = productionIdentity({ hostname: 'caidens-courage-staging.netlify.app' });
    expect(resolveCheckoutEnvironment(misdirected).allowLivePaymentLinks).toBe(false);
    expect(visibleCheckoutHref(PAPERBACK_LINK, misdirected)).toBeNull();
  });

  test('does not open a hardcoded Stripe link from the shared checkout helper', () => {
    const open = jest.spyOn(window, 'open').mockReturnValue(null);
    expect(openExternalUrl(PAPERBACK_LINK)).toBe(false);
    expect(open).not.toHaveBeenCalled();
    open.mockRestore();
  });

  test('removes camp payment links from the pricing card and blocks anchor navigation', () => {
    const camp = DEFAULT_PRICING_PLANS.find((plan) => plan.id === 'camp-pilot');
    expect(camp?.stripeUrl).toContain('buy.stripe.com');
    const { container } = render(<ConfigurablePricingCard plan={camp!} />);
    expect(screen.getByRole('button', { name: 'Start Camp Pilot' })).toBeDisabled();
    expect(container.innerHTML).not.toContain('buy.stripe.com');

    render(
      <MemoryRouter>
        <BookstoreOffers />
      </MemoryRouter>,
    );
    expect(screen.getByText('Live catalog settings could not be loaded. Checkout stays closed until the catalog is available.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pre-order Paperback' })).toBeDisabled();
    expect(document.body.innerHTML).not.toContain('buy.stripe.com');

    installCheckoutNavigationGuard();
    const anchor = document.createElement('a');
    anchor.href = PAPERBACK_LINK;
    document.body.appendChild(anchor);
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    anchor.dispatchEvent(event);
    blockStripeNavigationEvent(event);
    expect(event.defaultPrevented).toBe(true);
    anchor.remove();
  });
});
