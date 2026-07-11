import { isSupabaseConfigured, supabase } from './supabaseClient';
import type {
  CommerceProduct,
  CommerceProductInput,
  CommerceProductKey,
  CommerceProductRow,
  CommerceProductValidation,
} from '../types/commerce';

export const HARDCOVER_BUNDLE_KEY = 'hardcover_bundle';
export const COMMERCE_PRODUCTS_UPDATED_EVENT = 'cc-commerce-products-updated';

const COMMERCE_TABLE = 'commerce_products';
const APPROVED_STRIPE_CHECKOUT_PREFIXES = ['https://buy.stripe.com/', 'https://checkout.stripe.com/'];
const CACHE_TTL_MS = 60 * 1000;

let activeProductsCache: { products: CommerceProduct[]; fetchedAt: number } | null = null;
let activeProductsPromise: Promise<CommerceProduct[]> | null = null;

function mapCommerceProductRow(row: CommerceProductRow): CommerceProduct {
  return {
    id: row.id,
    key: row.key,
    title: row.title,
    displayPriceCents: row.display_price_cents,
    currency: row.currency,
    paymentLinkUrl: row.payment_link_url,
    stripeProductId: row.stripe_product_id,
    stripePriceId: row.stripe_price_id,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeInput(input: CommerceProductInput) {
  return {
    title: input.title.trim(),
    display_price_cents: input.displayPriceCents,
    currency: input.currency.trim().toLowerCase(),
    payment_link_url: input.paymentLinkUrl?.trim() || null,
    stripe_product_id: input.stripeProductId?.trim() || null,
    stripe_price_id: input.stripePriceId?.trim() || null,
    is_active: input.isActive,
  };
}

export function isApprovedStripeCheckoutUrl(value: string | null | undefined): boolean {
  const trimmed = value?.trim();
  if (!trimmed) return false;
  return APPROVED_STRIPE_CHECKOUT_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
}

export function formatCommercePrice(displayPriceCents: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(displayPriceCents / 100);
  } catch {
    return `$${(displayPriceCents / 100).toFixed(2)}`;
  }
}

export function validateCommerceProductInput(
  input: CommerceProductInput,
  current?: CommerceProduct | null,
): CommerceProductValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const normalized = normalizeInput(input);

  if (!normalized.title) errors.push('Product title is required.');
  if (!Number.isFinite(input.displayPriceCents) || input.displayPriceCents <= 0) {
    errors.push('Display price must be greater than zero.');
  }
  if (!normalized.currency) errors.push('Currency is required.');
  if (normalized.payment_link_url && !isApprovedStripeCheckoutUrl(normalized.payment_link_url)) {
    errors.push('Stripe Payment Link must start with https://buy.stripe.com/ or https://checkout.stripe.com/.');
  }
  if (normalized.stripe_product_id && !normalized.stripe_product_id.startsWith('prod_')) {
    errors.push('Stripe Product ID must start with prod_.');
  }
  if (normalized.stripe_price_id && !normalized.stripe_price_id.startsWith('price_')) {
    errors.push('Stripe Price ID must start with price_.');
  }
  if (normalized.is_active && !normalized.payment_link_url) {
    errors.push('Active products require a Stripe Payment Link URL.');
  }
  if (
    current &&
    current.displayPriceCents !== input.displayPriceCents &&
    current.paymentLinkUrl === normalized.payment_link_url
  ) {
    warnings.push(
      'You changed the displayed price. Confirm that the Stripe Payment Link charges the same amount before publishing.',
    );
  }

  return { errors, warnings };
}

export function invalidateCommerceProductsCache(): void {
  activeProductsCache = null;
  activeProductsPromise = null;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(COMMERCE_PRODUCTS_UPDATED_EVENT));
  }
}

async function requireCommerceClient() {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Commerce settings require Supabase configuration.');
  }
  return supabase;
}

export async function getActiveCommerceProducts(options?: { forceRefresh?: boolean }): Promise<CommerceProduct[]> {
  const now = Date.now();
  if (
    !options?.forceRefresh &&
    activeProductsCache &&
    now - activeProductsCache.fetchedAt < CACHE_TTL_MS
  ) {
    return activeProductsCache.products;
  }
  if (!options?.forceRefresh && activeProductsPromise) return activeProductsPromise;

  activeProductsPromise = (async () => {
    const client = await requireCommerceClient();
    const { data, error } = await client
      .from(COMMERCE_TABLE)
      .select('*')
      .eq('is_active', true)
      .order('title', { ascending: true });

    if (error) {
      console.error('[commerce] Failed to load active commerce products.', error);
      throw error;
    }

    const products = ((data ?? []) as CommerceProductRow[]).map(mapCommerceProductRow);
    activeProductsCache = { products, fetchedAt: Date.now() };
    activeProductsPromise = null;
    return products;
  })().catch((error) => {
    activeProductsPromise = null;
    throw error;
  });

  return activeProductsPromise;
}

export async function getCommerceProduct(
  key: CommerceProductKey,
  options?: { activeOnly?: boolean; forceRefresh?: boolean },
): Promise<CommerceProduct | null> {
  const activeOnly = options?.activeOnly ?? true;

  if (activeOnly) {
    const products = await getActiveCommerceProducts({ forceRefresh: options?.forceRefresh });
    return products.find((product) => product.key === key) ?? null;
  }

  const client = await requireCommerceClient();
  const { data, error } = await client.from(COMMERCE_TABLE).select('*').eq('key', key).maybeSingle();
  if (error) {
    console.error(`[commerce] Failed to load commerce product "${key}".`, error);
    throw error;
  }
  return data ? mapCommerceProductRow(data as CommerceProductRow) : null;
}

export async function updateCommerceProduct(
  key: CommerceProductKey,
  input: CommerceProductInput,
): Promise<CommerceProduct> {
  const validation = validateCommerceProductInput(input);
  if (validation.errors.length > 0) {
    throw new Error(validation.errors.join(' '));
  }

  const client = await requireCommerceClient();
  const payload = {
    key,
    ...normalizeInput(input),
  };

  const { data, error } = await client
    .from(COMMERCE_TABLE)
    .upsert(payload, { onConflict: 'key' })
    .select('*')
    .single();

  if (error) {
    console.error(`[commerce] Failed to save commerce product "${key}".`, error);
    throw error;
  }

  invalidateCommerceProductsCache();
  return mapCommerceProductRow(data as CommerceProductRow);
}
