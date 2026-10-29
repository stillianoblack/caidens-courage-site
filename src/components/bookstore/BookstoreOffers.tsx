import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  HISTORICAL_HARDCOVER_DETAILS,
  HISTORICAL_HARDCOVER_PAYMENT_LINK,
  HISTORICAL_HARDCOVER_TITLE,
  HISTORICAL_HARDCOVER_VERIFIED_PRICE_LABEL,
} from '../../config/bookstoreCatalog';
import { PARENTS_PATH } from '../../config/courageRoutes';
import { productLinks, openExternalUrl } from '../../config/externalLinks';
import { useCommerceProduct } from '../../hooks/useCommerceProduct';
import { useBookstoreProducts } from '../../hooks/useBookstoreProducts';
import { HARDCOVER_BUNDLE_KEY, isApprovedStripeCheckoutUrl } from '../../lib/commerceProductsService';
import { navigateToVerifiedTestCheckout, paymentLinkCheckoutAllowed } from '../../lib/checkoutEnvironment';
import {
  historicalHardcoverCheckoutTarget,
  resolveBookstoreOffer,
  type ResolvedBookstoreOffer,
} from '../../lib/bookstoreOffers';

type BookFormat = 'digital' | 'paperback' | 'hardcover';

const PRESENTATION: Record<string, { title: string; eyebrow?: string; academy?: string }> = {
  [BOOKSTORE_KEYS.digitalEdition]: {
    title: 'Digital Edition',
  },
  [BOOKSTORE_KEYS.paperback]: {
    title: 'Paperback Edition',
  },
  [BOOKSTORE_KEYS.paperbackBundle]: {
    title: 'Courage Adventure Bundle — Paperback',
    eyebrow: 'Ideal for Young Readers & Students',
    academy: '30 days of Focus Flame Academy access included.',
  },
  [BOOKSTORE_KEYS.hardcover]: {
    title: 'Hardcover Edition',
  },
  [BOOKSTORE_KEYS.adventureBundle]: {
    title: "Founder's Reserve — Hardcover Bundle",
    eyebrow: 'For Collectors & Hardcover Lovers',
    academy: '90 days of Focus Flame Academy access included.',
  },
};

const FORMAT_OPTIONS: { id: BookFormat; label: string; startingPrice: string; keys: string[] }[] = [
  { id: 'digital', label: 'Digital', startingPrice: '$15.99', keys: [BOOKSTORE_KEYS.digitalEdition] },
  {
    id: 'paperback',
    label: 'Paperback',
    startingPrice: 'From $30',
    keys: [BOOKSTORE_KEYS.paperback, BOOKSTORE_KEYS.paperbackBundle],
  },
  {
    id: 'hardcover',
    label: 'Hardcover',
    startingPrice: 'From $49.99',
    keys: [BOOKSTORE_KEYS.hardcover, BOOKSTORE_KEYS.adventureBundle],
  },
];

const goldButtonClass =
  'w-full inline-flex items-center justify-center rounded-full border-2 border-transparent px-7 py-4 text-center text-[16px] font-semibold leading-snug text-navy-600 shadow-[0_10px_24px_rgba(245,210,107,0.35)] transition hover:-translate-y-[1px] hover:shadow-[0_16px_34px_rgba(245,210,107,0.45)] active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';

const outlineButtonClass =
  'w-full inline-flex items-center justify-center rounded-full border-2 border-navy-500 bg-transparent px-7 py-4 text-center text-[16px] font-semibold leading-snug text-navy-600 transition hover:bg-navy-50 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

function defaultEdition(format: BookFormat): string {
  if (format === 'digital') return BOOKSTORE_KEYS.digitalEdition;
  if (format === 'paperback') return BOOKSTORE_KEYS.paperbackBundle;
  return BOOKSTORE_KEYS.adventureBundle;
}

function openBookstorePaymentLink(url: string) {
  if (!paymentLinkCheckoutAllowed()) return;
  if (!isApprovedStripeCheckoutUrl(url)) return;
  if (url.includes('cs_test_') || url.includes('cs_live_')) return;
  openExternalUrl(url);
}

function HistoricalHardcoverOffer() {
  const { product, loading, error } = useCommerceProduct(HARDCOVER_BUNDLE_KEY);
  const target = historicalHardcoverCheckoutTarget(product);
  const checkoutOpen = Boolean(target) && paymentLinkCheckoutAllowed();

  if (loading) {
    return <p className="text-sm text-navy-500">Loading the current hardcover pre-order...</p>;
  }

  if (error || !target) {
    return (
      <section aria-label="Current hardcover pre-order" className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-400">Existing pre-order</p>
        <p className="mt-2 text-sm leading-relaxed text-navy-600">
          The current hardcover bundle checkout is hidden until its Stripe price and contents are confirmed.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Current hardcover pre-order" className="rounded-2xl border-2 border-navy-200 bg-white p-4 sm:p-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-400">
        Existing pre-order · separate from Founder&apos;s Reserve
      </p>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-navy-500">{HISTORICAL_HARDCOVER_TITLE}</h3>
        <span className="text-xl font-bold text-navy-600">{HISTORICAL_HARDCOVER_VERIFIED_PRICE_LABEL}</span>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm text-navy-600">
        {HISTORICAL_HARDCOVER_DETAILS.map((detail) => (
          <li key={detail}>{detail}</li>
        ))}
      </ul>
      <p className="mt-3 text-sm leading-relaxed text-navy-500">
        Product price {HISTORICAL_HARDCOVER_VERIFIED_PRICE_LABEL}. Shipping is added at checkout.
      </p>
      <button
        type="button"
        className={`${goldButtonClass} mt-4`}
        style={{ backgroundColor: '#F2D06B' }}
        disabled={!checkoutOpen}
        onClick={() => openBookstorePaymentLink(HISTORICAL_HARDCOVER_PAYMENT_LINK)}
      >
        Pre-order current hardcover bundle
      </button>
    </section>
  );
}

function displayDetails(offer: ResolvedBookstoreOffer): string[] {
  const details = offer.key === BOOKSTORE_KEYS.adventureBundle
    ? offer.details.filter((detail) => !/^90 days of Focus Flame Academy access/i.test(detail))
    : offer.details;
  if (offer.key === BOOKSTORE_KEYS.paperback || offer.key === BOOKSTORE_KEYS.hardcover) {
    const membership = 'Academy membership sold separately';
    return details.includes(membership) ? details : [...details, membership];
  }
  return details;
}

export default function BookstoreOffers() {
  const { products, loading, error } = useBookstoreProducts();
  const location = useLocation();
  const bundleReturned = new URLSearchParams(location.search).get('bundle') === 'submitted';
  const [format, setFormat] = useState<BookFormat>('hardcover');
  const [editionKey, setEditionKey] = useState<string>(BOOKSTORE_KEYS.adventureBundle);
  const [digitalMessage, setDigitalMessage] = useState<string | null>(null);
  const [bundleMessage, setBundleMessage] = useState<string | null>(null);
  const [digitalPending, setDigitalPending] = useState(false);
  const kindleEnvUrl = process.env.REACT_APP_KINDLE_PRODUCT_URL;
  const liveCheckoutOpen = paymentLinkCheckoutAllowed();
  const previewCheckoutClosed = !liveCheckoutOpen;

  const offers = BOOKSTORE_PRODUCTS.map((definition) =>
    resolveBookstoreOffer(definition, products[definition.key] ?? null, {
      paperbackFallbackLink: productLinks.paperback,
      kindleEnvUrl,
      checkoutLocked: loading,
    }),
  );
  const byKey = Object.fromEntries(offers.map((offer) => [offer.key, offer]));
  const visibleKeys = FORMAT_OPTIONS.find((option) => option.id === format)?.keys || [];
  const selected = byKey[editionKey] && visibleKeys.includes(editionKey)
    ? byKey[editionKey]
    : byKey[defaultEdition(format)];

  const chooseFormat = (next: BookFormat) => {
    setFormat(next);
    setEditionKey(defaultEdition(next));
  };

  const moveRadio = (
    event: React.KeyboardEvent<HTMLDivElement>,
    order: string[],
    current: string,
    choose: (next: string) => void,
  ) => {
    const target = event.target as HTMLElement;
    if (target.getAttribute('role') !== 'radio') return;
    const index = order.indexOf(current);
    if (index < 0) return;
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowDown' && event.key !== 'ArrowLeft' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    const next = order[(index + (forward ? 1 : order.length - 1)) % order.length];
    choose(next);
    window.requestAnimationFrame(() => {
      event.currentTarget.querySelector<HTMLButtonElement>(`[data-choice="${next}"]`)?.focus();
    });
  };

  const onFormatKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    moveRadio(event, FORMAT_OPTIONS.map((option) => option.id), format, (next) => chooseFormat(next as BookFormat));
  };

  const onEditionKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!selected) return;
    moveRadio(event, visibleKeys, selected.key, setEditionKey);
  };

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
      if (!response.ok || !payload.url || !navigateToVerifiedTestCheckout(payload.url)) {
        setDigitalMessage(payload.message || 'Digital checkout is not open.');
        return;
      }
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
      if (!response.ok || !payload.url || !navigateToVerifiedTestCheckout(payload.url)) {
        setBundleMessage('Bundle checkout is not open.');
        return;
      }
    } catch {
      setBundleMessage('Bundle checkout is not open.');
    } finally {
      setDigitalPending(false);
    }
  };

  const startCheckout = (offer: ResolvedBookstoreOffer) => {
    if (offer.checkoutMode === 'digital_session') void startDigitalCheckout();
    if (offer.checkoutMode === 'bundle_session') void startBundleCheckout(offer.key);
    if (offer.checkoutMode === 'payment_link' && offer.paymentLink) openBookstorePaymentLink(offer.paymentLink);
  };

  const productionCheckoutClosedCopy = 'Checkout is temporarily unavailable. Please try again shortly.';

  return (
    <div className="flex flex-col gap-5" aria-busy={loading}>
      {bundleReturned ? (
        <div className="rounded-2xl border border-[#E5C06A] bg-[#fff8e6] p-4 text-sm leading-relaxed text-navy-600">
          <p className="font-semibold text-navy-500">Included Academy access is not active yet.</p>
          <p className="mt-1">
            Returning from checkout does not grant access and does not start a paid membership.
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-navy-500">
          Live catalog settings could not be loaded. Checkout stays closed until the catalog is available.
        </p>
      ) : null}

      <details className="rounded-2xl border border-gray-200 bg-gray-50/80 px-4 py-3 sm:px-5">
        <summary className="cursor-pointer font-display text-base font-bold text-navy-500">
          Founder&apos;s Edition · Sold Out
        </summary>
        <p className="mt-3 text-sm leading-relaxed text-navy-600">{FOUNDERS_EDITION_MESSAGE}</p>
      </details>

      <HistoricalHardcoverOffer />

      {previewCheckoutClosed && !error ? (
        <p className="text-sm text-navy-500">Purchases are disabled in this preview.</p>
      ) : null}

      <div
        role="radiogroup"
        aria-label="Book format"
        className="grid grid-cols-3 gap-2"
        onKeyDown={onFormatKeyDown}
      >
        {FORMAT_OPTIONS.map((option) => {
          const active = option.id === format;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${option.label} ${option.startingPrice}`}
              data-choice={option.id}
              tabIndex={active ? 0 : -1}
              className={
                active
                  ? 'min-h-11 rounded-2xl border-2 border-[#E5C06A] bg-[#fff8e6] px-2 py-3 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300'
                  : 'min-h-11 rounded-2xl border border-gray-200 bg-white px-2 py-3 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-300'
              }
              onClick={() => chooseFormat(option.id)}
            >
              <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-navy-500">{option.label}</span>
              <span className="mt-1 block text-sm font-bold text-navy-600">{option.startingPrice}</span>
            </button>
          );
        })}
      </div>

      <div role="radiogroup" aria-label="Edition" className="grid gap-3" onKeyDown={onEditionKeyDown}>
        {visibleKeys.map((key) => {
          const offer = byKey[key];
          const card = PRESENTATION[key];
          if (!offer || !card) return null;
          const active = selected?.key === key;
          const featured = key === BOOKSTORE_KEYS.adventureBundle;
          const cardMessage = offer.key === BOOKSTORE_KEYS.digitalEdition ? digitalMessage : (
            offer.key === BOOKSTORE_KEYS.paperbackBundle || offer.key === BOOKSTORE_KEYS.adventureBundle ? bundleMessage : null
          );
          return (
            <article
              key={key}
              data-product-key={key}
              className={
                featured
                  ? `rounded-2xl border-2 shadow-[0_8px_24px_rgba(229,192,106,0.28)] ${active ? 'border-[#E5C06A] bg-[#fff8e6] p-4' : 'border-[#E5C06A] bg-white'}`
                  : `rounded-2xl border ${active ? 'border-navy-500 bg-white p-4' : 'border-gray-200 bg-white'}`
              }
            >
              <button
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={card.title}
                data-choice={key}
                tabIndex={active ? 0 : -1}
                className={`flex w-full items-start justify-between gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-300 ${active ? '' : 'p-4'} ${featured && !active ? 'p-4' : ''}`}
                onClick={() => setEditionKey(key)}
              >
                <span>
                  {card.eyebrow ? (
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#b0892e]">{card.eyebrow}</span>
                  ) : null}
                  <span className="block font-display text-lg font-bold text-navy-500">{card.title}</span>
                </span>
                {offer.priceLabel ? <span className="text-xl font-bold text-navy-600">{offer.priceLabel}</span> : null}
              </button>
              {active ? (
                <div className="mt-3">
                  {card.academy ? (
                    <p className="rounded-xl bg-[#F2D06B]/40 px-3 py-2 text-sm font-semibold text-navy-600">{card.academy}</p>
                  ) : null}
                  <ul className="mt-3 space-y-1.5 text-sm text-navy-600">
                    {displayDetails(offer).map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                  {offer.formatLabel ? <p className="mt-2 text-sm font-medium text-navy-500">Format: {offer.formatLabel}</p> : null}
                  {card.academy ? (
                    <p className="mt-3 text-sm leading-relaxed text-navy-600">{BUNDLE_CLAIM_WINDOW_NOTE}</p>
                  ) : null}
                  {offer.key === BOOKSTORE_KEYS.adventureBundle ? (
                    <p className="mt-2 text-sm font-semibold leading-relaxed text-navy-600">{HARDCOVER_BUNDLE_UPGRADE_NOTE}</p>
                  ) : null}
                  {offer.key === BOOKSTORE_KEYS.paperback ? (
                    <p className="mt-3 text-sm leading-relaxed text-navy-500">Product price $30. Shipping is added at checkout.</p>
                  ) : null}
                  {offer.cta ? (
                    <button
                      type="button"
                      className={`${featured ? goldButtonClass : outlineButtonClass} mt-4`}
                      style={featured ? { backgroundColor: '#F2D06B' } : undefined}
                      disabled={!offer.canCheckout || digitalPending}
                      onClick={() => startCheckout(offer)}
                    >
                      {offer.cta}
                    </button>
                  ) : null}
                  {offer.key === BOOKSTORE_KEYS.digitalEdition && !loading && !offer.canCheckout ? (
                    <p id="digital-sales-note" className="mt-3 text-sm leading-relaxed text-navy-500">{DIGITAL_SALES_CLOSED_NOTE}</p>
                  ) : null}
                  {!loading && !offer.canCheckout && liveCheckoutOpen ? (
                    <p className="mt-3 text-sm text-navy-500">{productionCheckoutClosedCopy}</p>
                  ) : null}
                  {cardMessage ? <p className="mt-3 text-sm font-semibold text-red-700">{cardMessage}</p> : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <p className="text-sm leading-relaxed text-navy-600">
          Ordering directly through Caiden&apos;s Courage helps support future stories, interactive adventures, and animation.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          {selected?.kindleProductUrl || byKey[BOOKSTORE_KEYS.digitalEdition]?.kindleProductUrl ? (
            <a
              href={(selected?.kindleProductUrl || byKey[BOOKSTORE_KEYS.digitalEdition]?.kindleProductUrl) as string}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3 text-center text-[15px] font-medium text-navy-600 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-300 focus-visible:ring-offset-2"
            >
              {AMAZON_KINDLE_LINK_LABEL}
            </a>
          ) : null}
          <a
            href={AMAZON_AUTHOR_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3 text-center text-[15px] font-medium text-navy-600 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-300 focus-visible:ring-offset-2"
          >
            {AMAZON_AUTHOR_LINK_LABEL}
          </a>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-navy-400">{AMAZON_AUTHOR_LINK_NOTE}</p>
        <p className="mt-2 text-sm text-navy-500">
          Academy membership for a book on its own is a separate choice.{' '}
          <Link to={PARENTS_PATH} className="font-semibold text-navy-600 underline-offset-2 hover:underline">
            Explore Focus Flame Academy
          </Link>
        </p>
      </div>

    </div>
  );
}
