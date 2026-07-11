import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PRICING_PLAN_GROUP_LABELS } from '../../../data/pricingPlansDefaults';
import { notifyPricingPlansUpdated } from '../../../hooks/usePricingPlansConfig';
import {
  getMembershipPlans,
  isStripeLinkConfigured,
  resetMembershipPlansToDefaults,
  updateMembershipPlans,
} from '../../../lib/pricingPlansService';
import type { PricingPlanGroup, PricingPlanRecord } from '../../../types/pricingPlans';

type AdminPricingPlansTabProps = {
  onCopied?: (message: string) => void;
};

function featuresToText(features: string[]): string {
  return features.join('\n');
}

function textToFeatures(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function AdminPricingPlansTab({ onCopied }: AdminPricingPlansTabProps) {
  const initialConfig = getMembershipPlans();
  const [plans, setPlans] = useState<PricingPlanRecord[]>(() => initialConfig.plans);
  const [savedAt, setSavedAt] = useState<string | null>(initialConfig.updatedAt || null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const savedSnapshotRef = useRef(JSON.stringify(initialConfig.plans));

  const grouped = useMemo(() => {
    const groups: PricingPlanGroup[] = ['family', 'small_group', 'large_organization'];
    return groups.map((group) => ({
      group,
      label: PRICING_PLAN_GROUP_LABELS[group],
      plans: plans.filter((plan) => plan.group === group),
    }));
  }, [plans]);

  const updatePlan = (id: string, patch: Partial<PricingPlanRecord>) => {
    setError(null);
    setDirty(true);
    setPlans((current) => current.map((plan) => (plan.id === id ? { ...plan, ...patch } : plan)));
  };

  const handleSave = () => {
    const validationErrors = plans.flatMap((plan) => {
      const errors: string[] = [];
      if (!plan.audienceLabel.trim()) errors.push(`${plan.planName}: audience / account type is required.`);
      if (!plan.priceLabel.trim()) errors.push(`${plan.planName}: display price label is required.`);
      if (plan.active && !plan.ctaLabel.trim()) errors.push(`${plan.planName}: CTA label is required for active plans.`);
      return errors;
    });
    if (validationErrors.length > 0) {
      setError(validationErrors.join(' '));
      return;
    }

    const previousPlans = JSON.parse(savedSnapshotRef.current) as PricingPlanRecord[];
    const changedPriceSameLink = plans.some((plan) => {
      const previous = previousPlans.find((item) => item.id === plan.id);
      return previous && previous.priceLabel !== plan.priceLabel && previous.stripeUrl === plan.stripeUrl;
    });
    if (
      changedPriceSameLink &&
      !window.confirm(
        'You changed the displayed price. Confirm that the Stripe Payment Link charges the same amount before publishing.',
      )
    ) {
      return;
    }

    setSaving(true);
    const next = updateMembershipPlans(plans);
    setPlans(next.plans);
    setSavedAt(next.updatedAt);
    savedSnapshotRef.current = JSON.stringify(next.plans);
    setDirty(false);
    setSaving(false);
    notifyPricingPlansUpdated();
    onCopied?.('Membership plans saved.');
  };

  const handleReset = () => {
    const next = resetMembershipPlansToDefaults();
    setPlans(next.plans);
    setSavedAt(next.updatedAt || null);
    savedSnapshotRef.current = JSON.stringify(next.plans);
    setDirty(false);
    notifyPricingPlansUpdated();
    onCopied?.('Membership plans reset to defaults.');
  };

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
        <h2 className="adminPortal-cardTitle">Membership Plans</h2>
        <p className="adminPortal-cardSub">
          Recurring or access-based plans for families, educators, camps, schools, and districts.
          These settings power Family, Educator, Camp, School, and related upgrade experiences.
        </p>
        {savedAt ? (
          <p className="adminPortal-cardSub">Last saved: {new Date(savedAt).toLocaleString()}</p>
        ) : (
          <p className="adminPortal-cardSub">Last saved: Not saved yet</p>
        )}
        {error ? <p className="adminPortal-error">{error}</p> : null}
        {dirty ? <p className="adminPortal-warning">You have unsaved membership plan changes.</p> : null}
        <div className="adminPortal-actionsRow">
          <button
            type="button"
            className="adminPortal-btn adminPortal-btn--primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save membership plans'}
          </button>
          <button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={handleReset}>
            Reset to defaults
          </button>
        </div>
      </section>

      {grouped.map(({ group, label, plans: groupPlans }) => (
        <section key={group} className="adminPortal-card">
          <h3 className="adminPortal-cardTitle">{label}</h3>
          <div className="adminPortal-stack">
            {groupPlans.map((plan) => (
              <article key={plan.id} className="adminPortal-pricingPlanEditor">
                <div className="adminPortal-pricingPlanEditorHead">
                  <strong>{plan.planName}</strong>
                  <label className="adminPortal-inlineCheck">
                    <input
                      type="checkbox"
                      checked={plan.active}
                      onChange={(event) => updatePlan(plan.id, { active: event.target.checked })}
                    />
                    Active
                  </label>
                  <label className="adminPortal-inlineCheck">
                    <input
                      type="checkbox"
                      checked={plan.featured}
                      onChange={(event) => updatePlan(plan.id, { featured: event.target.checked })}
                    />
                    Featured
                  </label>
                </div>

                <div className="adminPortal-form adminPortal-form--grid">
                  <div className="adminPortal-field">
                    <label htmlFor={`${plan.id}-audience`}>Audience / account type</label>
                    <input
                      id={`${plan.id}-audience`}
                      value={plan.audienceLabel}
                      onChange={(event) => updatePlan(plan.id, { audienceLabel: event.target.value })}
                    />
                  </div>
                  <div className="adminPortal-field">
                    <label htmlFor={`${plan.id}-price`}>Price label</label>
                    <input
                      id={`${plan.id}-price`}
                      value={plan.priceLabel}
                      onChange={(event) => updatePlan(plan.id, { priceLabel: event.target.value })}
                    />
                  </div>
                  <div className="adminPortal-field">
                    <label htmlFor={`${plan.id}-cta`}>CTA label</label>
                    <input
                      id={`${plan.id}-cta`}
                      value={plan.ctaLabel}
                      onChange={(event) => updatePlan(plan.id, { ctaLabel: event.target.value })}
                    />
                  </div>
                  <div className="adminPortal-field">
                    <label htmlFor={`${plan.id}-badge`}>Recommended badge</label>
                    <input
                      id={`${plan.id}-badge`}
                      value={plan.recommendedBadge ?? ''}
                      onChange={(event) =>
                        updatePlan(plan.id, { recommendedBadge: event.target.value || undefined })
                      }
                    />
                  </div>
                  <div className="adminPortal-field adminPortal-field--full">
                    <label htmlFor={`${plan.id}-stripe`}>Stripe payment link</label>
                    <input
                      id={`${plan.id}-stripe`}
                      value={plan.stripeUrl}
                      onChange={(event) => updatePlan(plan.id, { stripeUrl: event.target.value })}
                      placeholder="https://buy.stripe.com/..."
                    />
                    {!isStripeLinkConfigured(plan.stripeUrl) ? (
                      <p className="adminPortal-fieldHint">Missing Stripe link — CTA will be disabled in modals.</p>
                    ) : null}
                  </div>
                  <div className="adminPortal-field adminPortal-field--full">
                    <label htmlFor={`${plan.id}-features`}>Feature bullets (one per line)</label>
                    <textarea
                      id={`${plan.id}-features`}
                      rows={5}
                      value={featuresToText(plan.features)}
                      onChange={(event) => updatePlan(plan.id, { features: textToFeatures(event.target.value) })}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
