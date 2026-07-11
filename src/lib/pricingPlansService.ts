import { DEFAULT_PRICING_PLANS } from '../data/pricingPlansDefaults';
import type { PricingPlanGroup, PricingPlanRecord, PricingPlansConfig } from '../types/pricingPlans';

const STORAGE_KEY = 'cc-pricing-plans-config';

function mergeWithDefaults(overrides: PricingPlanRecord[]): PricingPlanRecord[] {
  const overrideMap = new Map(overrides.map((plan) => [plan.id, plan]));
  return DEFAULT_PRICING_PLANS.map((defaults) => {
    const override = overrideMap.get(defaults.id);
    return override ? { ...defaults, ...override, id: defaults.id, group: defaults.group } : defaults;
  }).sort((a, b) => a.sortOrder - b.sortOrder || a.planName.localeCompare(b.planName));
}

export function readPricingPlansConfig(): PricingPlansConfig {
  if (typeof window === 'undefined') {
    return { updatedAt: '', plans: mergeWithDefaults([]) };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { updatedAt: '', plans: mergeWithDefaults([]) };
    }
    const parsed = JSON.parse(raw) as PricingPlansConfig;
    return {
      updatedAt: parsed.updatedAt ?? '',
      plans: mergeWithDefaults(Array.isArray(parsed.plans) ? parsed.plans : []),
    };
  } catch {
    return { updatedAt: '', plans: mergeWithDefaults([]) };
  }
}

export function getMembershipPlans(): PricingPlansConfig {
  return readPricingPlansConfig();
}

export function savePricingPlansConfig(plans: PricingPlanRecord[]): PricingPlansConfig {
  const next: PricingPlansConfig = {
    updatedAt: new Date().toISOString(),
    plans: mergeWithDefaults(plans),
  };

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return next;
}

export function updateMembershipPlans(plans: PricingPlanRecord[]): PricingPlansConfig {
  return savePricingPlansConfig(plans);
}

export function resetPricingPlansConfig(): PricingPlansConfig {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  return readPricingPlansConfig();
}

export function resetMembershipPlansToDefaults(): PricingPlansConfig {
  return resetPricingPlansConfig();
}

export function getActivePricingPlans(group?: PricingPlanGroup): PricingPlanRecord[] {
  const { plans } = readPricingPlansConfig();
  return plans.filter((plan) => plan.active && (!group || plan.group === group));
}

export function isStripeLinkConfigured(url: string | undefined | null): boolean {
  const trimmed = url?.trim() ?? '';
  return trimmed.startsWith('https://') && !trimmed.startsWith('#');
}

export function warnMissingStripeLink(plan: PricingPlanRecord): void {
  if (process.env.NODE_ENV === 'production') return;
  if (isStripeLinkConfigured(plan.stripeUrl)) return;
  console.warn(`[pricing] Stripe link not configured for plan "${plan.id}" (${plan.planName}).`);
}
