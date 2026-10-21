import React from 'react';
import { render, screen } from '@testing-library/react';
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
} from '../../config/bookstoreCatalog';
import { productLinks } from '../../config/externalLinks';
import { kindleAsinFromUrl, resolveBookstoreOffer } from '../bookstoreOffers';
import type { CommerceProduct } from '../../types/commerce';

jest.mock('../../hooks/useBookstoreProducts', () => ({
  useBookstoreProducts: () => ({ products: {}, loading: false, error: null }),
}));

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

describe('bookstore offers', () => {
  test('renders the catalog without a crossed-out founders price or a kindle author-page purchase', () => {
    const { container } = render(
      <MemoryRouter>
        <BookstoreOffers />
      </MemoryRouter>,
    );

    expect(screen.getByText(FOUNDERS_EDITION_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText('$24')).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain('line-through');
    expect(screen.getByRole('button', { name: 'Get the Paperback Bundle' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Get the Hardcover Bundle' })).toBeDisabled();
    expect(screen.getByText('$59.99')).toBeInTheDocument();
    expect(screen.getByText(HARDCOVER_BUNDLE_UPGRADE_NOTE)).toBeInTheDocument();
    expect(screen.getAllByText(BUNDLE_CLAIM_WINDOW_NOTE)).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Pre-order Hardcover' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Pre-order Paperback' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Buy Digital Edition — $15.99' })).toBeDisabled();
    expect(screen.getByText('$75.99')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
    expect(screen.getByText('$30')).toBeInTheDocument();
    expect(screen.getByText('Format: EPUB')).toBeInTheDocument();
    expect(screen.getByAltText('Cover of Caiden Vale and the Focus Flame')).toHaveAttribute(
      'src',
      '/images/Caiden-vale-book/Caiden-vale-book.webp',
    );

    const kindle = screen.getByRole('link', { name: 'Buy on Amazon Kindle' });
    expect(kindle).toHaveAttribute('href', AMAZON_KINDLE_PRODUCT_URL);
    expect(kindleAsinFromUrl(kindle.getAttribute('href'))).toBe(AMAZON_KINDLE_ASIN);
    expect(kindle).toHaveAttribute('target', '_blank');
    expect(kindle).toHaveAttribute('rel', 'noopener noreferrer');

    const author = screen.getByRole('link', { name: 'Visit My Amazon Author Page' });
    expect(author).toHaveAttribute('href', AMAZON_AUTHOR_PAGE_URL);
    expect(author).toHaveAttribute('target', '_blank');
    expect(author).toHaveAttribute('rel', 'noopener noreferrer');
    expect(author.getAttribute('href')).not.toBe(kindle.getAttribute('href'));
    expect(screen.getByRole('button', { name: 'Buy Digital Edition — $15.99' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /Founder's Edition/i })).not.toBeInTheDocument();
  });

  test('uses the server price with that product payment link and keeps the bundle key stable when renamed', () => {
    const paperback = BOOKSTORE_PRODUCTS.find((product) => product.key === 'paperback')!;
    const bundle = BOOKSTORE_PRODUCTS.find((product) => product.key === 'courage_adventure_bundle')!;
    const resolvedPaperback = resolveBookstoreOffer(
      paperback,
      serverProduct({
        displayPriceCents: 3500,
        paymentLinkUrl: 'https://buy.stripe.com/custompaperback',
        availability: 'in_stock',
      }),
      { paperbackFallbackLink: productLinks.paperback },
    );
    expect(resolvedPaperback.priceLabel).toBe('$35');
    expect(resolvedPaperback.paymentLink).toBe('https://buy.stripe.com/custompaperback');
    expect(resolvedPaperback.cta).toBe('Order Paperback');

    const historicalOrder = {
      productKey: 'courage_adventure_bundle',
      productTitleSnapshot: 'Courage Adventure Bundle',
    };
    const renamed = resolveBookstoreOffer(
      bundle,
      serverProduct({
        key: 'courage_adventure_bundle',
        title: 'Guardian Collection',
        displayPriceCents: 7599,
        paymentLinkUrl: 'https://buy.stripe.com/newbundle',
        isFeatured: true,
        fulfillmentType: 'bundle',
      }),
    );
    expect(renamed.key).toBe('courage_adventure_bundle');
    expect(renamed.title).toBe('Guardian Collection');
    const seededTitle = resolveBookstoreOffer(
      bundle,
      serverProduct({
        key: 'courage_adventure_bundle',
        title: 'Courage Adventure Bundle',
        displayPriceCents: 7599,
        paymentLinkVerifiedAt: null,
        fulfillmentType: 'bundle',
      }),
    );
    expect(seededTitle.title).toBe('Signature Reserve Hardcover Bundle');
    expect(seededTitle.canCheckout).toBe(false);
    expect(renamed.priceLabel).toBe('$75.99');
    expect(historicalOrder.productTitleSnapshot).toBe('Courage Adventure Bundle');
    expect(renamed.paymentLink).not.toBe('https://buy.stripe.com/fZufZggqHbSg7cjd7O3Ru04');

    const unverified = resolveBookstoreOffer(
      bundle,
      serverProduct({
        key: 'courage_adventure_bundle',
        displayPriceCents: 7599,
        paymentLinkUrl: 'https://buy.stripe.com/stalebundle',
        paymentLinkVerifiedAt: null,
        fulfillmentType: 'bundle',
      }),
    );
    expect(unverified.canCheckout).toBe(false);
    expect(unverified.paymentLink).toBeNull();
  });

  test('keeps digital checkout closed unless the server says sales are enabled', () => {
    const digital = BOOKSTORE_PRODUCTS.find((product) => product.key === 'digital_edition')!;
    const closed = resolveBookstoreOffer(digital, serverProduct({
      key: 'digital_edition',
      title: 'Caiden Vale and the Focus Flame',
      displayPriceCents: 1599,
      fulfillmentType: 'digital',
      digitalSalesEnabled: false,
      stripePriceId: 'price_123',
    }));
    expect(closed.canCheckout).toBe(false);
    expect(closed.paymentLink).toBeNull();

    const open = resolveBookstoreOffer(digital, serverProduct({
      key: 'digital_edition',
      displayPriceCents: 1599,
      fulfillmentType: 'digital',
      digitalSalesEnabled: true,
      stripePriceId: 'price_123',
      kindleProductUrl: AMAZON_AUTHOR_PAGE_URL,
    }), { kindleEnvUrl: 'https://www.amazon.com/dp/B0EXAMPLE1' });
    expect(open.canCheckout).toBe(true);
    expect(open.checkoutMode).toBe('digital_session');
    expect(open.priceCents).toBe(1599);
    expect(open.kindleProductUrl).toBe('https://www.amazon.com/dp/B0EXAMPLE1');
    expect(closed.kindleProductUrl).toBe(AMAZON_KINDLE_PRODUCT_URL);
    expect(closed.priceCents).toBe(1599);
  });

  test('keeps bundle checkout closed until a verified test price is explicitly enabled', () => {
    const bundle = BOOKSTORE_PRODUCTS.find((product) => product.key === 'courage_adventure_paperback_bundle')!;
    const closed = resolveBookstoreOffer(bundle, serverProduct({
      key: 'courage_adventure_paperback_bundle',
      displayPriceCents: 5999,
      isActive: true,
      stripePriceId: 'price_paperback_bundle',
      paymentLinkVerifiedAt: '2026-10-20T00:00:00Z',
      fulfillmentType: 'bundle',
    }));
    expect(closed.canCheckout).toBe(false);
    expect(closed.checkoutMode).toBe('none');

    process.env.REACT_APP_BOOKSTORE_BUNDLE_CHECKOUT_ENABLED = 'true';
    const open = resolveBookstoreOffer(bundle, serverProduct({
      key: 'courage_adventure_paperback_bundle',
      displayPriceCents: 5999,
      currency: 'usd',
      isActive: true,
      stripePriceId: 'price_paperback_bundle',
      paymentLinkVerifiedAt: '2026-10-20T00:00:00Z',
      paymentLinkUrl: 'https://buy.stripe.com/fZufZggqHbSg7cjd7O3Ru04',
      fulfillmentType: 'bundle',
    }));
    delete process.env.REACT_APP_BOOKSTORE_BUNDLE_CHECKOUT_ENABLED;
    expect(open.canCheckout).toBe(false);
    expect(open.paymentLink).toBeNull();
  });
});
