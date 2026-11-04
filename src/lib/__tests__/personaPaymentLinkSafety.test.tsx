import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EditorialPricingTierCard } from '../../components/courage/PersonaMarketingPrimitives';
import { openExternalUrl } from '../../config/externalLinks';
import {
  CHECKOUT_PRODUCTION_PROJECT_REF,
  CHECKOUT_STAGING_PROJECT_REF,
  visibleCheckoutHref,
  type CheckoutEnvironmentInput,
} from '../checkoutEnvironment';

const CAMP_LINK = 'https://buy.stripe.com/dRmfZg0rJ1dC4078Ry3Ru05';

function productionIdentity(overrides: CheckoutEnvironmentInput = {}): CheckoutEnvironmentInput {
  return {
    appEnvironment: 'production',
    supabaseUrl: `https://${CHECKOUT_PRODUCTION_PROJECT_REF}.supabase.co`,
    expectedProjectRef: CHECKOUT_PRODUCTION_PROJECT_REF,
    productionProjectRef: CHECKOUT_PRODUCTION_PROJECT_REF,
    stagingProjectRef: CHECKOUT_STAGING_PROJECT_REF,
    hostname: 'caidenscourage.com',
    ...overrides,
  };
}

describe('persona payment link hosts', () => {
  test('keeps the camp payment link on an approved production host', () => {
    expect(visibleCheckoutHref(CAMP_LINK, productionIdentity())).toBe(CAMP_LINK);
  });

  test('removes the camp payment link on a preview host', () => {
    const preview = 'deploy-preview-7--caidens-courage-staging.netlify.app';
    expect(visibleCheckoutHref(CAMP_LINK, productionIdentity({ hostname: preview }))).toBeNull();
    const { container } = render(
      <MemoryRouter>
        <EditorialPricingTierCard
          tier={{
            title: 'Camp pilot',
            price: 'Included',
            cta: { label: 'Start Camp Pilot', href: CAMP_LINK, external: true },
          }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: 'Start Camp Pilot' })).toBeDisabled();
    expect(container.innerHTML).not.toContain('buy.stripe.com');
    const open = jest.spyOn(window, 'open').mockReturnValue(null);
    expect(openExternalUrl(CAMP_LINK)).toBe(false);
    expect(open).not.toHaveBeenCalled();
    open.mockRestore();
  });
});
