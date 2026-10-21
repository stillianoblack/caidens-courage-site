import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BOOKSTORE_KEYS, BOOKSTORE_PRODUCTS } from '../../../config/bookstoreCatalog';
import {
  commerceCatalogExtensionsAvailable,
  formatCommercePrice,
  getCommerceProduct,
  HARDCOVER_BUNDLE_KEY,
  validateCommerceProductInput,
} from '../../../lib/commerceProductsService';
import type { BookstoreAvailability, CommerceProduct, CommerceProductInput } from '../../../types/commerce';

type AdminCommerceProductsTabProps = {
  onCopied?: (message: string) => void;
};

type CommerceProductForm = {
  title: string;
  displayPrice: string;
  currency: string;
  paymentLinkUrl: string;
  stripeProductId: string;
  stripePriceId: string;
  isActive: boolean;
  availability: BookstoreAvailability;
  isFeatured: boolean;
  digitalSalesEnabled: boolean;
  kindleProductUrl: string;
};

const ADMIN_PRODUCTS = [
  { key: BOOKSTORE_KEYS.paperbackBundle, label: 'Courage Adventure Bundle — Paperback' },
  { key: BOOKSTORE_KEYS.adventureBundle, label: 'Courage Adventure Bundle — Hardcover' },
  { key: BOOKSTORE_KEYS.hardcover, label: 'Hardcover Edition' },
  { key: BOOKSTORE_KEYS.paperback, label: 'Paperback Edition' },
  { key: BOOKSTORE_KEYS.digitalEdition, label: 'Digital Edition' },
  { key: HARDCOVER_BUNDLE_KEY, label: 'Legacy pre-order bundle' },
];

function centsToPriceInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

function priceInputToCents(value: string): number {
  const parsed = Number(value.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(parsed)) return 0;
  return Math.round(parsed * 100);
}

function defaultsFor(key: string): CommerceProductForm {
  const definition = BOOKSTORE_PRODUCTS.find((product) => product.key === key);
  if (!definition) {
    return {
      title: 'Pre-Order Bundle',
      displayPrice: '59.99',
      currency: 'usd',
      paymentLinkUrl: '',
      stripeProductId: '',
      stripePriceId: '',
      isActive: true,
      availability: 'preorder',
      isFeatured: false,
      digitalSalesEnabled: false,
      kindleProductUrl: '',
    };
  }
  return {
    title: definition.title,
    displayPrice: definition.priceCents != null ? centsToPriceInput(definition.priceCents) : '0.00',
    currency: definition.currency,
    paymentLinkUrl: '',
    stripeProductId: '',
    stripePriceId: '',
    isActive: definition.fulfillment === 'digital',
    availability: definition.defaultAvailability,
    isFeatured: definition.featured,
    digitalSalesEnabled: false,
    kindleProductUrl: '',
  };
}

function productToForm(product: CommerceProduct | null, key: string): CommerceProductForm {
  if (!product) return defaultsFor(key);
  return {
    title: product.title,
    displayPrice: centsToPriceInput(product.displayPriceCents),
    currency: product.currency,
    paymentLinkUrl: product.paymentLinkUrl ?? '',
    stripeProductId: product.stripeProductId ?? '',
    stripePriceId: product.stripePriceId ?? '',
    isActive: product.isActive,
    availability: product.availability || defaultsFor(key).availability,
    isFeatured: product.catalogExtended ? product.isFeatured : defaultsFor(key).isFeatured,
    digitalSalesEnabled: product.digitalSalesEnabled,
    kindleProductUrl: product.kindleProductUrl ?? '',
  };
}

function formToInput(form: CommerceProductForm, key: string, includeExtended: boolean): CommerceProductInput {
  const definition = BOOKSTORE_PRODUCTS.find((product) => product.key === key);
  const input: CommerceProductInput = {
    title: form.title,
    displayPriceCents: priceInputToCents(form.displayPrice),
    currency: form.currency,
    paymentLinkUrl: form.paymentLinkUrl,
    stripeProductId: form.stripeProductId,
    stripePriceId: form.stripePriceId,
    isActive: form.isActive,
  };
  if (includeExtended) {
    input.subtitle = definition?.eyebrow || null;
    input.description = definition?.description || null;
    input.availability = form.availability;
    input.fulfillmentType = definition?.fulfillment || 'physical';
    input.sortOrder = definition ? BOOKSTORE_PRODUCTS.findIndex((product) => product.key === key) * 10 : 100;
    input.isFeatured = form.isFeatured;
    input.digitalSalesEnabled = key === BOOKSTORE_KEYS.digitalEdition ? form.digitalSalesEnabled : false;
    input.kindleProductUrl = key === BOOKSTORE_KEYS.digitalEdition ? form.kindleProductUrl : null;
  }
  return input;
}

export default function AdminCommerceProductsTab({ onCopied }: AdminCommerceProductsTabProps) {
  const [selectedKey, setSelectedKey] = useState<string>(BOOKSTORE_KEYS.adventureBundle);
  const [product, setProduct] = useState<CommerceProduct | null>(null);
  const [form, setForm] = useState<CommerceProductForm>(defaultsFor(BOOKSTORE_KEYS.adventureBundle));
  const [extensionsAvailable, setExtensionsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const savedSnapshotRef = useRef(JSON.stringify(defaultsFor(BOOKSTORE_KEYS.adventureBundle)));

  const loadProduct = useCallback(async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const [nextProduct, extended] = await Promise.all([
        getCommerceProduct(key, { activeOnly: false, forceRefresh: true }),
        commerceCatalogExtensionsAvailable().catch(() => false),
      ]);
      const nextForm = productToForm(nextProduct, key);
      setExtensionsAvailable(extended);
      setProduct(nextProduct);
      setForm(nextForm);
      savedSnapshotRef.current = JSON.stringify(nextForm);
      setDirty(false);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Commerce settings could not be loaded. Confirm the commerce_products migration has been run.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProduct(selectedKey);
  }, [loadProduct, selectedKey]);

  const input = useMemo(
    () => formToInput(form, selectedKey, extensionsAvailable),
    [form, selectedKey, extensionsAvailable],
  );
  const validation = useMemo(() => validateCommerceProductInput(input, product), [input, product]);
  const currentWebsitePrice = product
    ? formatCommercePrice(product.displayPriceCents, product.currency)
    : formatCommercePrice(input.displayPriceCents || 0, input.currency || 'usd');

  const updateField = <K extends keyof CommerceProductForm>(key: K, value: CommerceProductForm[K]) => {
    setSuccess(null);
    setDirty(true);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    if (validation.errors.length > 0) {
      setError(validation.errors.join(' '));
      return;
    }
    if (validation.warnings.length > 0 && !window.confirm(validation.warnings[0])) return;

    if (selectedKey === HARDCOVER_BUNDLE_KEY) {
      setError('The historical hardcover bundle is locked and was not changed.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/.netlify/functions/bookstore-save-product', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: selectedKey, ...input }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || 'The product was not saved.');
      }
      const saved = await getCommerceProduct(selectedKey, { activeOnly: false, forceRefresh: true });
      if (!saved) throw new Error('The product was saved, but it could not be reloaded.');
      const nextForm = productToForm(saved, selectedKey);
      setProduct(saved);
      setForm(nextForm);
      savedSnapshotRef.current = JSON.stringify(nextForm);
      setDirty(false);
      setSuccess('Commerce product saved. The product key stayed the same.');
      onCopied?.('Commerce product saved.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Commerce product could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    setDirty(JSON.stringify(form) !== savedSnapshotRef.current);
  }, [form]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  const chooseProduct = (key: string) => {
    if (key === selectedKey) return;
    if (dirty && !window.confirm('Discard unsaved product changes?')) return;
    setSuccess(null);
    setSelectedKey(key);
  };

  return (
    <div className="adminPortal-stack">
      <section className="adminPortal-card">
        <h2 className="adminPortal-cardTitle">Products</h2>
        <p className="adminPortal-cardSub">
          Book editions and the Courage Adventure Bundle. Renaming a title does not change the product key stored on orders.
        </p>
        {loading ? <p className="adminPortal-cardSub">Loading commerce settings...</p> : null}
        {error ? <p className="adminPortal-error">{error}</p> : null}
        {success ? <p className="adminPortal-success">{success}</p> : null}
        {dirty ? <p className="adminPortal-warning">You have unsaved product changes.</p> : null}
        {!extensionsAvailable && !loading ? (
          <p className="adminPortal-warning">
            Availability, Kindle URL, and digital-sales fields appear after the bookstore migration is applied.
          </p>
        ) : null}
      </section>

      <section className="adminPortal-card">
        <div className="adminPortal-field">
          <label htmlFor="commerce-product-picker">Product</label>
          <select
            id="commerce-product-picker"
            value={selectedKey}
            onChange={(event) => chooseProduct(event.target.value)}
          >
            {ADMIN_PRODUCTS.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="adminPortal-pricingPlanEditorHead">
          <strong>{ADMIN_PRODUCTS.find((item) => item.key === selectedKey)?.label}</strong>
          <label className="adminPortal-inlineCheck">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => updateField('isActive', event.target.checked)}
            />
            Active
          </label>
        </div>

        <div className="adminPortal-detailGrid">
          <div className="adminPortal-detailItem">
            <span className="adminPortal-detailLabel">Current website price</span>
            <span className="adminPortal-detailValue">{currentWebsitePrice}</span>
          </div>
          <div className="adminPortal-detailItem adminPortal-detailItem--wide">
            <span className="adminPortal-detailLabel">Current checkout URL</span>
            <span className="adminPortal-detailValue">{product?.paymentLinkUrl || 'Not configured'}</span>
          </div>
        </div>

        <div className="adminPortal-form adminPortal-form--grid">
          <div className="adminPortal-field">
            <label htmlFor="commerce-product-key">Internal product key</label>
            <input id="commerce-product-key" value={selectedKey} readOnly />
          </div>
          <div className="adminPortal-field">
            <label htmlFor="commerce-product-title">Product title</label>
            <input id="commerce-product-title" value={form.title} onChange={(event) => updateField('title', event.target.value)} />
          </div>
          <div className="adminPortal-field">
            <label htmlFor="commerce-product-price">Display price</label>
            <input
              id="commerce-product-price"
              inputMode="decimal"
              value={form.displayPrice}
              onChange={(event) => updateField('displayPrice', event.target.value)}
            />
          </div>
          <div className="adminPortal-field">
            <label htmlFor="commerce-product-currency">Currency</label>
            <input
              id="commerce-product-currency"
              value={form.currency}
              onChange={(event) => updateField('currency', event.target.value)}
              placeholder="usd"
            />
          </div>
          <div className="adminPortal-field adminPortal-field--full">
            <label htmlFor="commerce-product-payment-link">Stripe Payment Link URL</label>
            <input
              id="commerce-product-payment-link"
              value={form.paymentLinkUrl}
              onChange={(event) => updateField('paymentLinkUrl', event.target.value)}
              placeholder="https://buy.stripe.com/..."
            />
            <p className="adminPortal-fieldHint">
              Checkout stays off until the server confirms this Payment Link charges the displayed USD price. The historical hardcover bundle cannot be changed here.
            </p>
          </div>
          <div className="adminPortal-field">
            <label htmlFor="commerce-product-id">Stripe Product ID optional</label>
            <input
              id="commerce-product-id"
              value={form.stripeProductId}
              onChange={(event) => updateField('stripeProductId', event.target.value)}
              placeholder="prod_..."
            />
          </div>
          <div className="adminPortal-field">
            <label htmlFor="commerce-price-id">Stripe Price ID</label>
            <input
              id="commerce-price-id"
              value={form.stripePriceId}
              onChange={(event) => updateField('stripePriceId', event.target.value)}
              placeholder="price_..."
            />
          </div>
          {extensionsAvailable ? (
            <div className="adminPortal-field">
              <label htmlFor="commerce-availability">Availability</label>
              <select
                id="commerce-availability"
                value={form.availability}
                onChange={(event) => updateField('availability', event.target.value as BookstoreAvailability)}
              >
                <option value="in_stock">In stock — Order</option>
                <option value="preorder">Pre-order</option>
                <option value="sold_out">Sold out</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          ) : null}
          {extensionsAvailable ? (
            <div className="adminPortal-field">
              <label className="adminPortal-inlineCheck">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) => updateField('isFeatured', event.target.checked)}
                />
                Featured gold card
              </label>
            </div>
          ) : null}
          {extensionsAvailable && selectedKey === BOOKSTORE_KEYS.digitalEdition ? (
            <>
              <div className="adminPortal-field adminPortal-field--full">
                <label className="adminPortal-inlineCheck">
                  <input
                    type="checkbox"
                    checked={form.digitalSalesEnabled}
                    onChange={(event) => updateField('digitalSalesEnabled', event.target.checked)}
                  />
                  Enable digital sales
                </label>
                <p className="adminPortal-fieldHint">
                  Also set BOOKSTORE_DIGITAL_SALES_ENABLED=true on the server after KDP Select compatibility and delivery testing.
                </p>
              </div>
              <div className="adminPortal-field adminPortal-field--full">
                <label htmlFor="commerce-kindle-url">Kindle product URL</label>
                <input
                  id="commerce-kindle-url"
                  value={form.kindleProductUrl}
                  onChange={(event) => updateField('kindleProductUrl', event.target.value)}
                  placeholder="https://www.amazon.com/dp/..."
                />
                <p className="adminPortal-fieldHint">
                  Leave blank until the Kindle listing exists. Do not paste the author page here.
                </p>
              </div>
            </>
          ) : null}
        </div>

        {selectedKey === BOOKSTORE_KEYS.adventureBundle || selectedKey === BOOKSTORE_KEYS.paperbackBundle ? (
          <p className="adminPortal-fieldHint">
            Orders keep this product key and the title from the moment of purchase. Checkout stays off until a new verified Payment Link is saved. The older hardcover_bundle row is left unchanged.
          </p>
        ) : null}

        {validation.warnings.length > 0 ? <p className="adminPortal-warning">{validation.warnings[0]}</p> : null}

        <div className="adminPortal-actionsRow">
          <button type="button" className="adminPortal-btn adminPortal-btn--primary" onClick={handleSave} disabled={saving || loading || selectedKey === HARDCOVER_BUNDLE_KEY}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={() => void loadProduct(selectedKey)} disabled={saving || loading}>
            Refresh
          </button>
        </div>
      </section>
    </div>
  );
}
