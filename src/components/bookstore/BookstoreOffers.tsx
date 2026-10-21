import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AMAZON_AUTHOR_LINK_LABEL,
  AMAZON_AUTHOR_LINK_NOTE,
  AMAZON_AUTHOR_PAGE_URL,
  AMAZON_KINDLE_LINK_LABEL,
  BOOKSTORE_KEYS,
  BOOKSTORE_PRODUCTS,
  DIGITAL_SALES_CLOSED_NOTE,
  HARDCOVER_BUNDLE_UPGRADE_NOTE,
  BUNDLE_CLAIM_WINDOW_NOTE,
  FOUNDERS_EDITION_MESSAGE,
} from '../../config/bookstoreCatalog';
import { STORY_BOOKS_LIBRARY_PATH } from '../../config/courageRoutes';
import { productLinks, openExternalUrl } from '../../config/externalLinks';
import { useBookstoreProducts } from '../../hooks/useBookstoreProducts';
import { resolveBookstoreOffer, type ResolvedBookstoreOffer } from '../../lib/bookstoreOffers';

const goldButtonClass =
  'w-full inline-flex items-center justify-center rounded-full border-2 border-transparent px-7 py-4 text-center text-[16px] font-semibold leading-snug text-navy-600 shadow-[0_10px_24px_rgba(245,210,107,0.35)] transition hover:-translate-y-[1px] hover:shadow-[0_16px_34px_rgba(245,210,107,0.45)] active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';

const outlineButtonClass =
  'w-full inline-flex items-center justify-center rounded-full border-2 border-navy-500 bg-transparent px-7 py-4 text-center text-[16px] font-semibold leading-snug text-navy-600 transition hover:bg-navy-50 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

function OfferCard({
  offer,
  onDigitalCheckout,
  onBundleCheckout,
  digitalMessage,
  bundleMessage,
  catalogLoading,
}: {
  offer: ResolvedBookstoreOffer;
  onDigitalCheckout: () => void;
  onBundleCheckout: () => void;
  digitalMessage: string | null;
  bundleMessage: string | null;
  catalogLoading: boolean;
}) {
  const featured = offer.featured || offer.key === BOOKSTORE_KEYS.adventureBundle;
  return (
    <article
      data-product-key={offer.key}
      className={
        featured
          ? 'rounded-2xl border-2 border-[#E5C06A] bg-white p-4 sm:p-5 shadow-[0_8px_24px_rgba(229,192,106,0.28)]'
          : offer.legacy
            ? 'rounded-2xl border border-gray-200 bg-gray-50/80 p-4 sm:p-5'
            : 'rounded-2xl border border-gray-200 bg-white p-4 sm:p-5'
      }
    >
      <div className={offer.coverSrc ? 'flex flex-col gap-4 sm:flex-row sm:items-start' : undefined}>
        {offer.coverSrc ? (
          <img
            src={offer.coverSrc}
            alt="Cover of Caiden Vale and the Focus Flame"
            className="h-36 w-28 flex-shrink-0 rounded-xl border border-navy-100 object-cover shadow-sm"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg font-bold text-navy-500">{offer.title}</h3>
              {offer.eyebrow ? (
                <span className="rounded-full bg-[#F2D06B] px-2.5 py-0.5 text-xs font-semibold text-navy-600">
                  {offer.eyebrow}
                </span>
              ) : null}
            </div>
            {offer.priceLabel ? (
              <span className="text-xl font-bold text-navy-600">{offer.priceLabel}</span>
            ) : null}
          </div>

          {offer.legacy ? (
            <p className="text-sm leading-relaxed text-navy-600">{FOUNDERS_EDITION_MESSAGE}</p>
          ) : (
            <>
              {offer.key === 'digital_edition' ? (
                <p className="mb-1 text-sm leading-relaxed text-navy-600">{offer.description}</p>
              ) : null}
              {offer.formatLabel ? (
                <p className="mb-3 text-sm font-medium text-navy-500">Format: {offer.formatLabel}</p>
              ) : null}
              {offer.details.length > 0 && offer.key !== 'digital_edition' ? (
                <ul className="mb-4 space-y-1.5 text-sm text-navy-600">
                  {offer.details.map((detail) => (
                    <li key={detail} className="flex items-start">
                      <span className="mr-2 mt-0.5 flex-shrink-0 text-navy-400/60">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          )}

          {offer.key === BOOKSTORE_KEYS.paperbackBundle || offer.key === BOOKSTORE_KEYS.adventureBundle ? (
            <p className="mb-4 text-sm leading-relaxed text-navy-600">{BUNDLE_CLAIM_WINDOW_NOTE}</p>
          ) : null}
          {offer.key === BOOKSTORE_KEYS.adventureBundle ? (
            <p className="mb-4 text-sm font-semibold leading-relaxed text-navy-600">{HARDCOVER_BUNDLE_UPGRADE_NOTE}</p>
          ) : null}

          {offer.cta ? (
            <button
              type="button"
              className={featured ? goldButtonClass : outlineButtonClass}
              style={featured ? { backgroundColor: '#F2D06B' } : undefined}
              disabled={!offer.canCheckout}
              onClick={() => {
                if (offer.checkoutMode === 'digital_session') onDigitalCheckout();
                if (offer.checkoutMode === 'bundle_session') onBundleCheckout();
                if (offer.checkoutMode === 'payment_link' && offer.paymentLink) openExternalUrl(offer.paymentLink);
              }}
            >
              {offer.cta}
            </button>
          ) : null}

          {offer.key === 'digital_edition' && offer.kindleProductUrl ? (
            <a
              href={offer.kindleProductUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3 text-center text-[15px] font-medium text-navy-600 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-300 focus-visible:ring-offset-2"
            >
              {AMAZON_KINDLE_LINK_LABEL}
            </a>
          ) : null}
          {offer.key === 'digital_edition' && !catalogLoading && !offer.canCheckout ? (
            <p id="digital-sales-note" className="mt-3 text-sm leading-relaxed text-navy-500">
              {DIGITAL_SALES_CLOSED_NOTE}
            </p>
          ) : null}
          {digitalMessage && offer.key === 'digital_edition' ? (
            <p className="mt-3 text-sm font-semibold text-red-700">{digitalMessage}</p>
          ) : null}
          {bundleMessage && (offer.key === BOOKSTORE_KEYS.paperbackBundle || offer.key === BOOKSTORE_KEYS.adventureBundle) ? (
            <p className="mt-3 text-sm font-semibold text-red-700">{bundleMessage}</p>
          ) : null}
          {!catalogLoading && !offer.legacy && offer.checkoutMode === 'none' && offer.key !== 'digital_edition' && offer.cta ? (
            <p className="mt-3 text-sm font-semibold text-red-700">
              Checkout is temporarily unavailable. Please try again shortly.
            </p>
          ) : null}
          {offer.key === 'digital_edition' ? (
            <p className="mt-3 text-sm text-navy-500">
              <Link to={STORY_BOOKS_LIBRARY_PATH} className="font-semibold text-navy-600 underline-offset-2 hover:underline">
                Already purchased? Open My Books
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function BookstoreOffers() {
  const { products, loading, error } = useBookstoreProducts();
  const [digitalMessage, setDigitalMessage] = useState<string | null>(null);
  const [bundleMessage, setBundleMessage] = useState<string | null>(null);
  const [digitalPending, setDigitalPending] = useState(false);
  const kindleEnvUrl = process.env.REACT_APP_KINDLE_PRODUCT_URL;

  const offers = BOOKSTORE_PRODUCTS.map((definition) =>
    resolveBookstoreOffer(definition, products[definition.key] ?? null, {
      paperbackFallbackLink: productLinks.paperback,
      kindleEnvUrl,
      checkoutLocked: loading,
    }),
  );
  const startDigitalCheckout = async () => {
    setDigitalMessage(null);
    setDigitalPending(true);
    try {
      const response = await fetch('/.netlify/functions/bookstore-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productKey: 'digital_edition' }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.url) {
        setDigitalMessage(payload.message || 'Digital checkout is not open.');
        return;
      }
      window.location.assign(payload.url);
    } catch {
      setDigitalMessage('Digital checkout is not open.');
    } finally {
      setDigitalPending(false);
    }
  };

  const startBundleCheckout = async (productKey: string) => {
    setBundleMessage(null);
    setDigitalPending(true);
    try {
      const response = await fetch('/.netlify/functions/academy-bundle-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productKey }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.url) {
        setBundleMessage('Bundle checkout is not open.');
        return;
      }
      window.location.assign(payload.url);
    } catch {
      setBundleMessage('Bundle checkout is not open.');
    } finally {
      setDigitalPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-4" aria-busy={loading}>
      {error ? (
        <p className="text-sm text-navy-500">
          Live catalog settings could not be loaded. Paperback checkout still uses the existing payment link.
        </p>
      ) : null}
      {offers.map((offer) => (
        <OfferCard
          key={offer.key}
          offer={{
            ...offer,
            canCheckout: offer.canCheckout && !digitalPending,
          }}
          digitalMessage={digitalMessage}
          bundleMessage={bundleMessage}
          catalogLoading={loading}
          onDigitalCheckout={() => {
            void startDigitalCheckout();
          }}
          onBundleCheckout={() => {
            void startBundleCheckout(offer.key);
          }}
        />
      ))}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <a
          href={AMAZON_AUTHOR_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3 text-[15px] font-medium text-navy-600 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-300 focus-visible:ring-offset-2"
        >
          {AMAZON_AUTHOR_LINK_LABEL}
        </a>
        <p className="mt-3 text-xs leading-relaxed text-navy-400">{AMAZON_AUTHOR_LINK_NOTE}</p>
      </div>
    </div>
  );
}
