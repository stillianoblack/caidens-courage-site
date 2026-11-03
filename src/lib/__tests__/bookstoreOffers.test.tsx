import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BookstoreOffers from '../../components/bookstore/BookstoreOffers';
import {
  AMAZON_AUTHOR_PAGE_URL,
  AMAZON_KINDLE_ASIN,
  AMAZON_KINDLE_PRODUCT_URL,
  BOOKSTORE_KEYS,
  BOOKSTORE_PRODUCTS,
  FOUNDERS_EDITION_MESSAGE,
  HARDCOVER_BUNDLE_UPGRADE_NOTE,
  BUNDLE_CLAIM_WINDOW_NOTE,
} from '../../config/bookstoreCatalog';
import { productLinks } from '../../config/externalLinks';
import { kindleAsinFromUrl, resolveBookstoreOffer } from '../bookstoreOffers';
import type { CommerceProduct } from '../../types/commerce';

const mockUseBookstoreProducts = jest.fn();

jest.mock('../../hooks/useBookstoreProducts', () => ({
  useBookstoreProducts: () => mockUseBookstoreProducts(),
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
  beforeEach(() => {
    mockUseBookstoreProducts.mockReturnValue({ products: {}, loading: false, error: null });
  });

  test('opens on the hardcover tab with only the selected Founder\'s Reserve purchase button', () => {
    const { container } = render(
      <MemoryRouter>
        <BookstoreOffers />
      </MemoryRouter>,
    );

    const foundersSummary = screen.getByText("Founder's Edition · Sold Out");
    expect(foundersSummary.tagName).toBe('SUMMARY');
    expect(foundersSummary.closest('details')).not.toHaveAttribute('open');
    expect(screen.getByText(FOUNDERS_EDITION_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText('$24')).not.toBeInTheDocument();
    expect(screen.queryByText('Purchases are disabled in this preview.')).not.toBeInTheDocument();
    expect(screen.queryByText(/Already purchased/i)).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain('line-through');
    expect(container.innerHTML).not.toContain('buy.stripe.com');
    expect(container.innerHTML).not.toContain('checkout.stripe.com');
    expect(screen.getByRole('radio', { name: 'Hardcover From $49.99' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: "Founder's Reserve — Hardcover Bundle" })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('button', { name: 'Get the Hardcover Bundle' })).toBeDisabled();
    expect(screen.getByText('Checkout is temporarily unavailable. Please try again shortly.')).toBeInTheDocument();
    expect(screen.getByText('$75.99')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
    expect(screen.getByText(HARDCOVER_BUNDLE_UPGRADE_NOTE)).toBeInTheDocument();
    expect(screen.getAllByText(BUNDLE_CLAIM_WINDOW_NOTE).length).toBeGreaterThan(0);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pre-order Hardcover' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pre-order Paperback' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Get the Paperback Bundle' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Buy Digital Edition — $15.99' })).not.toBeInTheDocument();
    expect(screen.queryByText('Buy Book Now')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: 'Hardcover Edition' }));
    expect(screen.getByRole('button', { name: 'Pre-order Hardcover' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Get the Hardcover Bundle' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: 'Paperback From $30' }));
    expect(screen.getByRole('radio', { name: 'Courage Adventure Bundle — Paperback' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('button', { name: 'Get the Paperback Bundle' })).toBeDisabled();
    expect(screen.getByText('$59.99')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'Paperback Edition' }));
    expect(screen.getByRole('button', { name: 'Pre-order Paperback' })).toBeDisabled();
    expect(screen.getByText('Product price $30. Shipping is added at checkout.')).toBeInTheDocument();
    expect(screen.getByText('$30')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: 'Digital $15.99' }));
    expect(screen.getByRole('button', { name: 'Buy Digital Edition — $15.99' })).toBeDisabled();
    expect(screen.getByText('Format: EPUB')).toBeInTheDocument();

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
  });

  test('shows a checkout return notice without treating the query as proof of payment', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/story/books?bundle=submitted']}>
        <BookstoreOffers />
      </MemoryRouter>,
    );

    const notice = screen.getByRole('status');
    expect(notice).toHaveTextContent('Payment confirmation and the Academy invitation may take a short time.');
    expect(notice).toHaveTextContent('This page does not confirm payment or activate Academy access.');
    expect(screen.getByRole('radio', { name: 'Hardcover From $49.99' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: "Founder's Reserve — Hardcover Bundle" })).toHaveAttribute('aria-checked', 'true');
    expect(container.innerHTML).not.toContain('cs_test_');
    expect(container.innerHTML).not.toContain('cs_live_');
  });

  test('sends the selected card to staging checkout and never opens a payment link', async () => {
    process.env.REACT_APP_BOOKSTORE_BUNDLE_CHECKOUT_ENABLED = 'true';
    process.env.REACT_APP_BOOKSTORE_PHYSICAL_CHECKOUT_ENABLED = 'true';
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });
    const originalFetch = global.fetch;
    global.fetch = fetchMock as unknown as typeof fetch;
    const open = jest.spyOn(window, 'open').mockReturnValue(null);
    mockUseBookstoreProducts.mockReturnValue({
      products: {
        [BOOKSTORE_KEYS.hardcover]: serverProduct({
          key: BOOKSTORE_KEYS.hardcover,
          displayPriceCents: 4999,
          isActive: true,
          stripePriceId: 'price_hardcover_test',
          paymentLinkVerifiedAt: '2026-10-20T00:00:00Z',
          paymentLinkUrl: null,
          fulfillmentType: 'physical',
        }),
        [BOOKSTORE_KEYS.paperbackBundle]: serverProduct({
          key: BOOKSTORE_KEYS.paperbackBundle,
          displayPriceCents: 5999,
          isActive: true,
          stripeProductId: 'prod_paperback_bundle',
          stripePriceId: 'price_paperback_bundle',
          paymentLinkUrl: null,
          fulfillmentType: 'bundle',
        }),
        [BOOKSTORE_KEYS.adventureBundle]: serverProduct({
          key: BOOKSTORE_KEYS.adventureBundle,
          displayPriceCents: 7599,
          isActive: true,
          stripeProductId: 'prod_founders_reserve',
          stripePriceId: 'price_founders_reserve',
          paymentLinkUrl: null,
          fulfillmentType: 'bundle',
        }),
        [BOOKSTORE_KEYS.digitalEdition]: serverProduct({
          key: BOOKSTORE_KEYS.digitalEdition,
          title: 'Caiden Vale and the Focus Flame',
          displayPriceCents: 1599,
          fulfillmentType: 'digital',
          digitalSalesEnabled: true,
          stripePriceId: 'price_digital',
        }),
      },
      loading: false,
      error: null,
    });

    const { container } = render(
      <MemoryRouter>
        <BookstoreOffers />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('radio', { name: 'Hardcover Edition' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pre-order Hardcover' }));
    expect(await screen.findByText('Hardcover checkout is not open.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'Paperback From $30' }));
    fireEvent.click(screen.getByRole('button', { name: 'Get the Paperback Bundle' }));
    expect(await screen.findByText('Bundle checkout is not open.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'Hardcover From $49.99' }));
    fireEvent.click(screen.getByRole('button', { name: 'Get the Hardcover Bundle' }));
    expect(await screen.findByText('Bundle checkout is not open.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'Digital $15.99' }));
    fireEvent.click(screen.getByRole('button', { name: 'Buy Digital Edition — $15.99' }));
    expect(await screen.findByText('Digital checkout is not open.')).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/.netlify/functions/bookstore-physical-checkout',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ productKey: BOOKSTORE_KEYS.hardcover }),
        }),
      );
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/.netlify/functions/academy-bundle-checkout',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ productKey: BOOKSTORE_KEYS.paperbackBundle }),
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/.netlify/functions/academy-bundle-checkout',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ productKey: BOOKSTORE_KEYS.adventureBundle }),
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/.netlify/functions/bookstore-checkout',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ productKey: BOOKSTORE_KEYS.digitalEdition }),
      }),
    );
    expect(open).not.toHaveBeenCalled();
    expect(container.innerHTML).not.toContain('buy.stripe.com');

    delete process.env.REACT_APP_BOOKSTORE_BUNDLE_CHECKOUT_ENABLED;
    delete process.env.REACT_APP_BOOKSTORE_PHYSICAL_CHECKOUT_ENABLED;
    global.fetch = originalFetch;
    open.mockRestore();
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
    expect(resolvedPaperback.paymentLink).toBeNull();
    expect(resolvedPaperback.canCheckout).toBe(false);
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

    process.env.REACT_APP_BOOKSTORE_BUNDLE_CHECKOUT_ENABLED = 'true';
    const founders = BOOKSTORE_PRODUCTS.find((product) => product.key === 'courage_adventure_bundle')!;
    const paperbackReady = resolveBookstoreOffer(bundle, serverProduct({
      key: 'courage_adventure_paperback_bundle',
      displayPriceCents: 5999,
      currency: 'usd',
      isActive: true,
      stripeProductId: 'prod_paperback_bundle',
      stripePriceId: 'price_paperback_bundle',
      fulfillmentType: 'bundle',
    }));
    const foundersReady = resolveBookstoreOffer(founders, serverProduct({
      key: 'courage_adventure_bundle',
      displayPriceCents: 7599,
      currency: 'usd',
      isActive: true,
      stripeProductId: 'prod_founders_reserve',
      stripePriceId: 'price_founders_reserve',
      fulfillmentType: 'bundle',
    }));
    const wrongAmount = resolveBookstoreOffer(bundle, serverProduct({
      key: 'courage_adventure_paperback_bundle',
      displayPriceCents: 5900,
      currency: 'usd',
      isActive: true,
      stripeProductId: 'prod_paperback_bundle',
      stripePriceId: 'price_paperback_bundle',
      fulfillmentType: 'bundle',
    }));
    delete process.env.REACT_APP_BOOKSTORE_BUNDLE_CHECKOUT_ENABLED;
    expect(paperbackReady.checkoutMode).toBe('bundle_session');
    expect(paperbackReady.paymentLink).toBeNull();
    expect(foundersReady.checkoutMode).toBe('bundle_session');
    expect(foundersReady.paymentLink).toBeNull();
    expect(wrongAmount.canCheckout).toBe(false);
  });

  test('keeps the hardcover session closed until a verified test price is explicitly enabled', () => {
    const hardcover = BOOKSTORE_PRODUCTS.find((product) => product.key === 'hardcover')!;
    const closed = resolveBookstoreOffer(hardcover, serverProduct({
      key: 'hardcover',
      displayPriceCents: 4999,
      currency: 'usd',
      isActive: true,
      stripePriceId: 'price_hardcover_test',
      paymentLinkVerifiedAt: '2026-10-20T00:00:00Z',
      paymentLinkUrl: 'https://buy.stripe.com/4gMaEW3DVcWkdAHebS3Ru07',
      fulfillmentType: 'physical',
    }));
    expect(closed.canCheckout).toBe(false);
    expect(closed.checkoutMode).toBe('none');
    expect(closed.paymentLink).toBeNull();

    process.env.REACT_APP_BOOKSTORE_PHYSICAL_CHECKOUT_ENABLED = 'true';
    const historical = resolveBookstoreOffer(hardcover, serverProduct({
      key: 'hardcover',
      displayPriceCents: 4999,
      currency: 'usd',
      isActive: true,
      stripePriceId: 'price_hardcover_test',
      paymentLinkVerifiedAt: '2026-10-20T00:00:00Z',
      paymentLinkUrl: 'https://buy.stripe.com/4gMaEW3DVcWkdAHebS3Ru07',
      fulfillmentType: 'physical',
    }));
    const ready = resolveBookstoreOffer(hardcover, serverProduct({
      key: 'hardcover',
      displayPriceCents: 4999,
      currency: 'usd',
      isActive: true,
      stripePriceId: 'price_hardcover_test',
      paymentLinkVerifiedAt: '2026-10-20T00:00:00Z',
      fulfillmentType: 'physical',
    }));
    delete process.env.REACT_APP_BOOKSTORE_PHYSICAL_CHECKOUT_ENABLED;
    expect(historical.canCheckout).toBe(false);
    expect(historical.paymentLink).toBeNull();
    expect(ready.checkoutMode).toBe('physical_session');
    expect(ready.paymentLink).toBeNull();
  });
});
