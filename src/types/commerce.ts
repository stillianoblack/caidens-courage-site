export type CommerceProductKey = 'hardcover_bundle' | string;

export type CommerceProductRow = {
  id: string;
  key: string;
  title: string;
  display_price_cents: number;
  currency: string;
  payment_link_url: string | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CommerceProduct = {
  id: string;
  key: CommerceProductKey;
  title: string;
  displayPriceCents: number;
  currency: string;
  paymentLinkUrl: string | null;
  stripeProductId: string | null;
  stripePriceId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CommerceProductInput = {
  title: string;
  displayPriceCents: number;
  currency: string;
  paymentLinkUrl: string | null;
  stripeProductId?: string | null;
  stripePriceId?: string | null;
  isActive: boolean;
};

export type CommerceProductValidation = {
  errors: string[];
  warnings: string[];
};
