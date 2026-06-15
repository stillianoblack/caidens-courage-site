import React, { useMemo, useState } from 'react';
import { PRICING_PLAN_GROUP_LABELS } from '../../../data/pricingPlansDefaults';
import { notifyPricingPlansUpdated } from '../../../hooks/usePricingPlansConfig';
import {
  isStripeLinkConfigured,
  readPricingPlansConfig,
  resetPricingPlansConfig,
  savePricingPlansConfig,
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
  const [plans, setPlans] = useState<PricingPlanRecord[]>(() => readPricingPlansConfig().plans);
  const [savedAt, setSavedAt] = useState<string | null>(readPricingPlansConfig().updatedAt);

  const grouped = useMemo(() => {
    const groups: PricingPlanGroup[] = ['family', 'small_group', 'large_organization'];
    return groups.map((group) => ({
      group,
      label: PRICING_PLAN_GROUP_LABELS[group],
      plans: plans.filter((plan) => plan.group === group),
    }));
  }, [plans]);

  const updatePlan = (id: string, patch: Partial<PricingPlanRecord>) => {
    setPlans((current) => current.map((plan) => (plan.id === id ? { ...plan, ...patch } : plan)));
  };

  const handleSave = () => {
    const next = savePricingPlansConfig(plans);
    setPlans(next.plans);
    setSavedAt(next.updatedAt);
    notifyPricingPlansUpdated();
    onCopied?.('Pricing plans saved.');
  };

  const handleReset = () => {
    const next = resetPricingPlansConfig();
    setPlans(next.plans);
    setSavedAt(next.updatedAt);
    notifyPricingPlansUpdated();
    onCopied?.('Pricing plans reset to defaults.');
  };

  return (
    <div className="adminPortal-stack">
      <section className="adminPortal-card">
        <h2 className="adminPortal-cardTitle">Payment Links / Pricing Plans</h2>
        <p className="adminPortal-cardSub">
          Edit Stripe payment links and plan copy used by Family and Facilitator upgrade modals. Changes
          save to this browser and apply immediately in the portal.
        </p>
        {savedAt ? (
          <p className="adminPortal-cardSub">Last saved: {new Date(savedAt).toLocaleString()}</p>
        ) : null}
        <div className="adminPortal-actionsRow">
          <button type="button" className="adminPortal-btn adminPortal-btn--primary" onClick={handleSave}>
            Save pricing plans
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
