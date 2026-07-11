import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  formatCommercePrice,
  getCommerceProduct,
  HARDCOVER_BUNDLE_KEY,
  updateCommerceProduct,
  validateCommerceProductInput,
} from '../../../lib/commerceProductsService';
import type { CommerceProduct, CommerceProductInput } from '../../../types/commerce';

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
};

const EMPTY_FORM: CommerceProductForm = {
  title: 'Pre-Order Bundle',
  displayPrice: '59.99',
  currency: 'usd',
  paymentLinkUrl: '',
  stripeProductId: '',
  stripePriceId: '',
  isActive: true,
};

function centsToPriceInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

function priceInputToCents(value: string): number {
  const parsed = Number(value.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(parsed)) return 0;
  return Math.round(parsed * 100);
}

function productToForm(product: CommerceProduct | null): CommerceProductForm {
  if (!product) return EMPTY_FORM;
  return {
    title: product.title,
    displayPrice: centsToPriceInput(product.displayPriceCents),
    currency: product.currency,
    paymentLinkUrl: product.paymentLinkUrl ?? '',
    stripeProductId: product.stripeProductId ?? '',
    stripePriceId: product.stripePriceId ?? '',
    isActive: product.isActive,
  };
}

function formToInput(form: CommerceProductForm): CommerceProductInput {
  return {
    title: form.title,
    displayPriceCents: priceInputToCents(form.displayPrice),
    currency: form.currency,
    paymentLinkUrl: form.paymentLinkUrl,
    stripeProductId: form.stripeProductId,
    stripePriceId: form.stripePriceId,
    isActive: form.isActive,
  };
}

export default function AdminCommerceProductsTab({ onCopied }: AdminCommerceProductsTabProps) {
  const [product, setProduct] = useState<CommerceProduct | null>(null);
  const [form, setForm] = useState<CommerceProductForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const savedSnapshotRef = useRef(JSON.stringify(EMPTY_FORM));

  const loadProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextProduct = await getCommerceProduct(HARDCOVER_BUNDLE_KEY, {
        activeOnly: false,
        forceRefresh: true,
      });
      const nextForm = productToForm(nextProduct);
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
    void loadProduct();
  }, [loadProduct]);

  const input = useMemo(() => formToInput(form), [form]);
  const validation = useMemo(() => validateCommerceProductInput(input, product), [input, product]);
  const currentWebsitePrice = product
    ? formatCommercePrice(product.displayPriceCents, product.currency)
    : formatCommercePrice(input.displayPriceCents || 5999, input.currency || 'usd');

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

    if (validation.warnings.length > 0 && !window.confirm(validation.warnings[0])) {
      return;
    }

    setSaving(true);
    try {
      const saved = await updateCommerceProduct(HARDCOVER_BUNDLE_KEY, input);
      const nextForm = productToForm(saved);
      setProduct(saved);
      setForm(nextForm);
      savedSnapshotRef.current = JSON.stringify(nextForm);
      setDirty(false);
      setSuccess('Commerce product saved.');
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

  return (
    <div className="adminPortal-stack">
      <section className="adminPortal-card">
        <h2 className="adminPortal-cardTitle">Products</h2>
        <p className="adminPortal-cardSub">
          One-time purchases such as books, bundles, mission packs, and merchandise.
        </p>
        {loading ? <p className="adminPortal-cardSub">Loading commerce settings...</p> : null}
        {error ? <p className="adminPortal-error">{error}</p> : null}
        {success ? <p className="adminPortal-success">{success}</p> : null}
        {dirty ? <p className="adminPortal-warning">You have unsaved product changes.</p> : null}
      </section>

      <section className="adminPortal-card">
        <div className="adminPortal-pricingPlanEditorHead">
          <strong>Hardcover Bundle</strong>
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
          <div className="adminPortal-detailItem">
            <span className="adminPortal-detailLabel">Last updated</span>
            <span className="adminPortal-detailValue">
              {product?.updatedAt ? new Date(product.updatedAt).toLocaleString() : 'Not saved yet'}
            </span>
          </div>
        </div>

        <div className="adminPortal-actionsRow">
          <a
            className="adminPortal-btn adminPortal-btn--ghost"
            href={product?.paymentLinkUrl ?? undefined}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!product?.paymentLinkUrl}
          >
            Open checkout link
          </a>
        </div>

        <div className="adminPortal-form adminPortal-form--grid">
          <div className="adminPortal-field">
            <label htmlFor="commerce-hardcover-key">Internal product key</label>
            <input id="commerce-hardcover-key" value={HARDCOVER_BUNDLE_KEY} readOnly />
          </div>
          <div className="adminPortal-field">
            <label htmlFor="commerce-hardcover-title">Product title</label>
            <input
              id="commerce-hardcover-title"
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
            />
          </div>
          <div className="adminPortal-field">
            <label htmlFor="commerce-hardcover-price">Display price</label>
            <input
              id="commerce-hardcover-price"
              inputMode="decimal"
              value={form.displayPrice}
              onChange={(event) => updateField('displayPrice', event.target.value)}
            />
          </div>
          <div className="adminPortal-field">
            <label htmlFor="commerce-hardcover-currency">Currency</label>
            <input
              id="commerce-hardcover-currency"
              value={form.currency}
              onChange={(event) => updateField('currency', event.target.value)}
              placeholder="usd"
            />
          </div>
          <div className="adminPortal-field adminPortal-field--full">
            <label htmlFor="commerce-hardcover-payment-link">Stripe Payment Link URL</label>
            <input
              id="commerce-hardcover-payment-link"
              value={form.paymentLinkUrl}
              onChange={(event) => updateField('paymentLinkUrl', event.target.value)}
              placeholder="https://buy.stripe.com/..."
            />
            <p className="adminPortal-fieldHint">
              Active products require a Stripe checkout link. Changing the website price does not update
              Stripe automatically.
            </p>
          </div>
          <div className="adminPortal-field">
            <label htmlFor="commerce-hardcover-product-id">Stripe Product ID optional</label>
            <input
              id="commerce-hardcover-product-id"
              value={form.stripeProductId}
              onChange={(event) => updateField('stripeProductId', event.target.value)}
              placeholder="prod_..."
            />
          </div>
          <div className="adminPortal-field">
            <label htmlFor="commerce-hardcover-price-id">Stripe Price ID optional</label>
            <input
              id="commerce-hardcover-price-id"
              value={form.stripePriceId}
              onChange={(event) => updateField('stripePriceId', event.target.value)}
              placeholder="price_..."
            />
          </div>
        </div>

        {validation.warnings.length > 0 ? (
          <p className="adminPortal-warning">{validation.warnings[0]}</p>
        ) : null}

        <div className="adminPortal-actionsRow">
          <button
            type="button"
            className="adminPortal-btn adminPortal-btn--primary"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <button
            type="button"
            className="adminPortal-btn adminPortal-btn--ghost"
            onClick={() => void loadProduct()}
            disabled={saving || loading}
          >
            Refresh
          </button>
        </div>
      </section>
    </div>
  );
}
