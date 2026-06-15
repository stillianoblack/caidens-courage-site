import { useEffect, useState } from 'react';
import { readPricingPlansConfig } from '../lib/pricingPlansService';
import type { PricingPlansConfig } from '../types/pricingPlans';

const PRICING_PLANS_UPDATED_EVENT = 'cc-pricing-plans-updated';

export function notifyPricingPlansUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(PRICING_PLANS_UPDATED_EVENT));
}

export function usePricingPlansConfig(): PricingPlansConfig {
  const [config, setConfig] = useState<PricingPlansConfig>(() => readPricingPlansConfig());

  useEffect(() => {
    const refresh = () => setConfig(readPricingPlansConfig());
    window.addEventListener('storage', refresh);
    window.addEventListener(PRICING_PLANS_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(PRICING_PLANS_UPDATED_EVENT, refresh);
    };
  }, []);

  return config;
}
