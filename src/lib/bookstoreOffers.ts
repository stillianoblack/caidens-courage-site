import {
  AMAZON_AUTHOR_PAGE_URL,
  AMAZON_KINDLE_PRODUCT_URL,
  BOOKSTORE_KEYS,
  HISTORICAL_HARDCOVER_CATALOG_CENTS,
  HISTORICAL_HARDCOVER_PAYMENT_LINK,
  HISTORICAL_HARDCOVER_UNUSED_PAYMENT_LINK,
  type BookstoreProductDefinition,
} from '../config/bookstoreCatalog';
import { productLinks } from '../config/externalLinks';
import { paymentLinkCheckoutAllowed } from './checkoutEnvironment';
import { isApprovedStripeCheckoutUrl } from './commerceProductsService';
import type { BookstoreAvailability, CommerceProduct } from '../types/commerce';

export type BookstoreCheckoutMode = 'payment_link' | 'digital_session' | 'bundle_session' | 'none';

export type ResolvedBookstoreOffer = {
  key: string;
  title: string;
  priceCents: number | null;
  priceLabel: string | null;
  description: string;
  details: string[];
  formatLabel?: string;
  coverSrc?: string;
  eyebrow?: string;
  featured: boolean;
  availability: BookstoreAvailability;
  cta: string | null;
  canCheckout: boolean;
  paymentLink: string | null;
  checkoutMode: BookstoreCheckoutMode;
  kindleProductUrl: string | null;
  legacy: boolean;
};

export function formatBookstorePrice(cents: number, currency = 'usd'): string {
  const whole = cents % 100 === 0;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    }).format(cents / 100);
  } catch {
    return whole ? `$${(cents / 100).toFixed(0)}` : `$${(cents / 100).toFixed(2)}`;
  }
}

export function kindleAsinFromUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    const match = url.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?:\/|$)/i);
    return match ? match[1].toUpperCase() : null;
  } catch {
    return null;
  }
}

export function isKindleProductUrl(value: string | null | undefined): boolean {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === AMAZON_AUTHOR_PAGE_URL) return false;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:') return false;
    const host = url.hostname.replace(/^www\./, '');
    if (host !== 'amazon.com') return false;
    if (url.pathname.toLowerCase().startsWith('/author/')) return false;
    return Boolean(kindleAsinFromUrl(trimmed));
  } catch {
    return false;
  }
}

export function resolveKindleProductUrl(
  serverUrl: string | null | undefined,
  envUrl: string | null | undefined,
  catalogUrl: string | null | undefined = AMAZON_KINDLE_PRODUCT_URL,
): string | null {
  if (isKindleProductUrl(serverUrl)) return serverUrl!.trim();
  if (isKindleProductUrl(envUrl)) return envUrl!.trim();
  if (isKindleProductUrl(catalogUrl)) return catalogUrl!.trim();
  return null;
}

function isReservedHistoricalPaymentLink(value: string | null | undefined): boolean {
  const link = String(value || '').trim();
  return link === HISTORICAL_HARDCOVER_PAYMENT_LINK
    || link === HISTORICAL_HARDCOVER_UNUSED_PAYMENT_LINK
    || link.includes('4gMaEW3DVcWkdAHebS3Ru07')
    || link.includes('fZufZggqHbSg7cjd7O3Ru04');
}

export function historicalHardcoverCheckoutTarget(product: Pick<
  CommerceProduct,
  'key' | 'isActive' | 'currency' | 'displayPriceCents' | 'paymentLinkUrl'
> | null): string | null {
  if (!product) return null;
  if (product.key !== BOOKSTORE_KEYS.legacyHardcoverBundle) return null;
  if (!product.isActive) return null;
  if (String(product.currency || '').toLowerCase() !== 'usd') return null;
  if (product.displayPriceCents !== HISTORICAL_HARDCOVER_CATALOG_CENTS) return null;
  const link = String(product.paymentLinkUrl || '').trim();
  if (link !== HISTORICAL_HARDCOVER_PAYMENT_LINK) return null;
  return HISTORICAL_HARDCOVER_PAYMENT_LINK;
}

function availabilityFor(
  definition: BookstoreProductDefinition,
  server: CommerceProduct | null,
): BookstoreAvailability {
  if (!definition.purchasable) return 'sold_out';
  return server?.availability || definition.defaultAvailability;
}

function verifiedPhysicalLink(definitionKey: string, server: CommerceProduct | null, candidate: string): boolean {
  if (!isApprovedStripeCheckoutUrl(candidate)) return false;
  if (!server) return definitionKey === BOOKSTORE_KEYS.paperback;
  if (!Object.prototype.hasOwnProperty.call(server, 'paymentLinkVerifiedAt')) return true;
  if (server.paymentLinkVerifiedAt) return true;
  return definitionKey === BOOKSTORE_KEYS.paperback
    && server.displayPriceCents === 3000
    && server.currency.toLowerCase() === 'usd'
    && candidate === productLinks.paperback;
}

function callToAction(
  definition: BookstoreProductDefinition,
  availability: BookstoreAvailability,
  priceLabel: string | null,
): string | null {
  if (!definition.purchasable) return null;
  if (definition.fulfillment === 'digital') {
    return priceLabel ? `Buy Digital Edition — ${priceLabel}` : 'Buy Digital Edition';
  }
  if (availability === 'sold_out') return 'Sold Out';
  if (availability === 'unavailable') return 'Unavailable';
  if (availability === 'in_stock') return definition.ctaInStock || null;
  return definition.ctaPreorder || definition.ctaInStock || null;
}

export function resolveBookstoreOffer(
  definition: BookstoreProductDefinition,
  server: CommerceProduct | null,
  options?: {
    paperbackFallbackLink?: string | null;
    kindleEnvUrl?: string | null;
    checkoutLocked?: boolean;
  },
): ResolvedBookstoreOffer {
  const usesServer = Boolean(server);
  const priceCents = usesServer ? server!.displayPriceCents : definition.priceCents;
  const currency = usesServer ? server!.currency : definition.currency;
  const priceLabel = priceCents != null ? formatBookstorePrice(priceCents, currency) : null;
  const availability = availabilityFor(definition, usesServer ? server : null);
  const serverTitle = server?.title?.trim();
  const title = serverTitle && !(
    definition.key === BOOKSTORE_KEYS.adventureBundle && serverTitle === 'Courage Adventure Bundle'
  )
    ? serverTitle
    : definition.title;
  const featured = server?.catalogExtended ? Boolean(server.isFeatured) : definition.featured;
  const kindleProductUrl =
    definition.key === BOOKSTORE_KEYS.digitalEdition
      ? resolveKindleProductUrl(server?.kindleProductUrl, options?.kindleEnvUrl)
      : null;

  let paymentLink: string | null = null;
  let checkoutMode: BookstoreCheckoutMode = 'none';
  let canCheckout = false;

  const bundleCheckoutKey =
    definition.key === BOOKSTORE_KEYS.paperbackBundle || definition.key === BOOKSTORE_KEYS.adventureBundle;
  if (definition.purchasable && !options?.checkoutLocked && priceCents != null && priceCents > 0) {
    if (bundleCheckoutKey) {
      const historicalLink = isReservedHistoricalPaymentLink(server?.paymentLinkUrl);
      const verifiedTestPrice = Boolean(
        process.env.REACT_APP_BOOKSTORE_BUNDLE_CHECKOUT_ENABLED === 'true'
        && server?.isActive
        && server.paymentLinkVerifiedAt
        && server.stripePriceId?.startsWith('price_')
        && server.displayPriceCents === definition.priceCents
        && String(server.currency || '').toLowerCase() === 'usd'
        && !historicalLink,
      );
      if (verifiedTestPrice) {
        checkoutMode = 'bundle_session';
        canCheckout = true;
      }
    } else if (definition.fulfillment === 'digital') {
      checkoutMode = 'digital_session';
      canCheckout = Boolean(server?.digitalSalesEnabled && server.stripePriceId?.startsWith('price_'));
    } else if (availability === 'in_stock' || availability === 'preorder') {
      const serverLink = server?.isActive ? server.paymentLinkUrl : null;
      const fallbackLink =
        !server && definition.key === BOOKSTORE_KEYS.paperback ? options?.paperbackFallbackLink : null;
      const candidate = (serverLink || fallbackLink || '').trim();
      if (verifiedPhysicalLink(definition.key, server, candidate) && paymentLinkCheckoutAllowed()) {
        paymentLink = candidate;
        checkoutMode = 'payment_link';
        canCheckout = true;
      }
    }
  }

  return {
    key: definition.key,
    title,
    priceCents,
    priceLabel,
    description: definition.description,
    details: definition.details,
    formatLabel: definition.formatLabel,
    coverSrc: definition.coverSrc,
    eyebrow: definition.eyebrow,
    featured,
    availability,
    cta: callToAction(definition, availability, priceLabel),
    canCheckout,
    paymentLink: canCheckout && checkoutMode === 'payment_link' ? paymentLink : null,
    checkoutMode: canCheckout ? checkoutMode : 'none',
    kindleProductUrl,
    legacy: definition.fulfillment === 'legacy',
  };
}
