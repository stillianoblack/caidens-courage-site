import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BookstoreOffers from '../../components/bookstore/BookstoreOffers';
import {
  AMAZON_AUTHOR_PAGE_URL,
  AMAZON_KINDLE_ASIN,
  AMAZON_KINDLE_PRODUCT_URL,
  BOOKSTORE_PRODUCTS,
  FOUNDERS_EDITION_MESSAGE,
  HARDCOVER_BUNDLE_UPGRADE_NOTE,
  BUNDLE_CLAIM_WINDOW_NOTE,
  HISTORICAL_HARDCOVER_PAYMENT_LINK,
  HISTORICAL_HARDCOVER_UNUSED_PAYMENT_LINK,
} from '../../config/bookstoreCatalog';
import { productLinks } from '../../config/externalLinks';
import { kindleAsinFromUrl, resolveBookstoreOffer } from '../bookstoreOffers';
import type { CommerceProduct } from '../../types/commerce';

const mockCheckoutAllowed = jest.fn(() => false);

jest.mock('../../hooks/useBookstoreProducts', () => ({
  useBookstoreProducts: () => ({ products: {}, loading: false, error: null }),
}));

jest.mock('../../lib/checkoutEnvironment', () => {
  const actual = jest.requireActual('../../lib/checkoutEnvironment');
  return {
    ...actual,
    paymentLinkCheckoutAllowed: () => mockCheckoutAllowed(),
    resolveCheckoutEnvironment: () => ({
      name: 'unknown',
      consistent: false,
      allowLivePaymentLinks: false,
      allowVerifiedTestCheckout: false,
    }),
  };
});

function serverProduct(overrides: Partial<CommerceProduct>): CommerceProduct {
  return {
    id: '1',
    key: 'paperback',
    title: 'Paperback Edition',
    displayPriceCents: 3000,
    currency: 'usd',
    paymentLinkUrl: productLinks.paperback,
    stripeProductId: null,
    stripePriceId: null,
    isActive: true,
    createdAt: '',
    updatedAt: '',
    catalogExtended: true,
    subtitle: null,
    description: null,
    availability: 'preorder',
    fulfillmentType: 'physical',
    sortOrder: 30,
    isFeatured: false,
    digitalSalesEnabled: false,
    kindleProductUrl: null,
    ...overrides,
  };
}

describe('bookstore release offers', () => {
  beforeEach(() => {
    mockCheckoutAllowed.mockReturnValue(false);
  });

  test('keeps new products closed and preserves the sold-out founders section', () => {
    const { container } = render(
      <MemoryRouter>
        <BookstoreOffers />
      </MemoryRouter>,
    );

    const foundersSummary = screen.getByText("Founder's Edition · Sold Out");
    expect(foundersSummary.tagName).toBe('SUMMARY');
    expect(foundersSummary.closest('details')).not.toBeNull();
    expect(screen.getByText(FOUNDERS_EDITION_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText('$24')).not.toBeInTheDocument();
    expect(screen.getAllByText('Purchases are disabled in this preview.')).toHaveLength(1);
    expect(screen.queryByText('Checkout is temporarily unavailable. Please try again shortly.')).not.toBeInTheDocument();
    expect(screen.queryByText(/Already Purchased/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Existing pre-order/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Hardcover + Companion Workbook')).not.toBeInTheDocument();
    expect(screen.queryByText('$59.00')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pre-order current hardcover bundle' })).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain(HISTORICAL_HARDCOVER_PAYMENT_LINK);
    expect(container.innerHTML).not.toContain(HISTORICAL_HARDCOVER_UNUSED_PAYMENT_LINK);
    expect(screen.getByRole('radio', { name: 'Hardcover From $49.99' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('button', { name: 'Get the Hardcover Bundle' })).toBeDisabled();
    expect(screen.getAllByText('$75.99').length).toBeGreaterThan(0);
    expect(screen.getByText('$49.99')).toBeInTheDocument();
    expect(screen.getByText(HARDCOVER_BUNDLE_UPGRADE_NOTE)).toBeInTheDocument();
    expect(screen.getAllByText(BUNDLE_CLAIM_WINDOW_NOTE).length).toBeGreaterThan(0);
    expect(screen.queryByText('Signed First Edition Copy')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Open My Books' })).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain('buy.stripe.com');
    expect(container.innerHTML).not.toContain('checkout.stripe.com');
    expect(container.innerHTML).not.toContain('cs_test_');
    expect(container.innerHTML).not.toContain('cs_live_');

    fireEvent.click(screen.getByRole('radio', { name: 'Paperback From $30' }));
    expect(screen.getByRole('button', { name: 'Get the Paperback Bundle' })).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: /Paperback Edition/ }));
    expect(screen.getByRole('button', { name: 'Pre-order Paperback' })).toBeDisabled();
    expect(screen.getByText('Product price $30. Shipping is added at checkout.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: 'Digital $15.99' }));
    expect(screen.getByRole('button', { name: 'Buy Digital Edition — $15.99' })).toBeDisabled();
    expect(screen.getByText('Format: EPUB')).toBeInTheDocument();

    const kindle = screen.getByRole('link', { name: 'Buy on Amazon Kindle' });
    expect(kindle).toHaveAttribute('href', AMAZON_KINDLE_PRODUCT_URL);
    expect(kindleAsinFromUrl(kindle.getAttribute('href'))).toBe(AMAZON_KINDLE_ASIN);
    const author = screen.getByRole('link', { name: 'Visit My Amazon Author Page' });
    expect(author).toHaveAttribute('href', AMAZON_AUTHOR_PAGE_URL);
    expect(author.getAttribute('href')).not.toBe(kindle.getAttribute('href'));
  });

  test('opens the paperback checkout and leaves the historical bundle off the storefront', () => {
    mockCheckoutAllowed.mockReturnValue(true);
    const open = jest.spyOn(window, 'open').mockImplementation(() => null);

    const { container } = render(
      <MemoryRouter>
        <BookstoreOffers />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Purchases are disabled in this preview.')).not.toBeInTheDocument();
    expect(screen.getByText('Checkout is temporarily unavailable. Please try again shortly.')).toBeInTheDocument();
    expect(screen.queryByText(/Existing pre-order/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Hardcover + Companion Workbook')).not.toBeInTheDocument();
    expect(screen.queryByText('$59.00')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pre-order current hardcover bundle' })).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain(HISTORICAL_HARDCOVER_PAYMENT_LINK);
    expect(container.innerHTML).not.toContain(HISTORICAL_HARDCOVER_UNUSED_PAYMENT_LINK);

    fireEvent.click(screen.getByRole('radio', { name: 'Paperback From $30' }));
    fireEvent.click(screen.getByRole('radio', { name: /Paperback Edition/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Pre-order Paperback' }));
    expect(open).toHaveBeenCalledWith(productLinks.paperback, '_blank', 'noopener,noreferrer');
    expect(open).not.toHaveBeenCalledWith(HISTORICAL_HARDCOVER_PAYMENT_LINK, '_blank', 'noopener,noreferrer');
    expect(open).not.toHaveBeenCalledWith(HISTORICAL_HARDCOVER_UNUSED_PAYMENT_LINK, '_blank', 'noopener,noreferrer');
    open.mockRestore();
  });

  test('does not attach either historical payment link to a new bundle', () => {
    const bundle = BOOKSTORE_PRODUCTS.find((product) => product.key === 'courage_adventure_bundle')!;
    process.env.REACT_APP_BOOKSTORE_BUNDLE_CHECKOUT_ENABLED = 'true';
    for (const paymentLinkUrl of [HISTORICAL_HARDCOVER_PAYMENT_LINK, HISTORICAL_HARDCOVER_UNUSED_PAYMENT_LINK]) {
      const offer = resolveBookstoreOffer(bundle, serverProduct({
        key: 'courage_adventure_bundle',
        displayPriceCents: 7599,
        currency: 'usd',
        isActive: true,
        stripePriceId: 'price_founders_reserve',
        paymentLinkVerifiedAt: '2026-10-29T00:00:00Z',
        paymentLinkUrl,
        fulfillmentType: 'bundle',
      }));
      expect(offer.canCheckout).toBe(false);
      expect(offer.paymentLink).toBeNull();
      expect(offer.paymentLink).not.toBe(paymentLinkUrl);
    }
    delete process.env.REACT_APP_BOOKSTORE_BUNDLE_CHECKOUT_ENABLED;

    const paperback = BOOKSTORE_PRODUCTS.find((product) => product.key === 'paperback')!;
    mockCheckoutAllowed.mockReturnValue(true);
    const openPaperback = resolveBookstoreOffer(paperback, null, {
      paperbackFallbackLink: productLinks.paperback,
    });
    expect(openPaperback.paymentLink).toBe(productLinks.paperback);
    expect(openPaperback.canCheckout).toBe(true);

    const digital = BOOKSTORE_PRODUCTS.find((product) => product.key === 'digital_edition')!;
    const closedDigital = resolveBookstoreOffer(digital, serverProduct({
      key: 'digital_edition',
      displayPriceCents: 1599,
      fulfillmentType: 'digital',
      digitalSalesEnabled: false,
      stripePriceId: 'price_digital',
    }));
    expect(closedDigital.canCheckout).toBe(false);

    const hardcover = BOOKSTORE_PRODUCTS.find((product) => product.key === 'hardcover')!;
    const closedHardcover = resolveBookstoreOffer(hardcover, null);
    expect(closedHardcover.canCheckout).toBe(false);
    expect(closedHardcover.priceCents).toBe(4999);
  });
});
