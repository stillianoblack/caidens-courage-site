export type PricingPlanGroup = 'family' | 'small_group' | 'large_organization';

export type PricingPlanRecord = {
  id: string;
  group: PricingPlanGroup;
  planName: string;
  audienceLabel: string;
  priceLabel: string;
  description: string;
  features: string[];
  stripeUrl: string;
  ctaLabel: string;
  recommendedBadge?: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
};

export type PricingPlansConfig = {
  updatedAt: string;
  plans: PricingPlanRecord[];
};
