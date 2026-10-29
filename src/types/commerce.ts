export type CommerceProductKey = 'hardcover_bundle' | string;

export type BookstoreAvailability = 'in_stock' | 'preorder' | 'sold_out' | 'unavailable';

export type BookstoreFulfillment = 'physical' | 'digital' | 'bundle' | 'legacy' | 'merchandise';

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
  subtitle?: string | null;
  description?: string | null;
  availability?: BookstoreAvailability | null;
  fulfillment_type?: BookstoreFulfillment | null;
  sort_order?: number | null;
  is_featured?: boolean | null;
  digital_sales_enabled?: boolean | null;
  kindle_product_url?: string | null;
  payment_link_verified_at?: string | null;
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
  catalogExtended?: boolean;
  subtitle?: string | null;
  description?: string | null;
  availability?: BookstoreAvailability | null;
  fulfillmentType?: BookstoreFulfillment | null;
  sortOrder?: number | null;
  isFeatured?: boolean;
  digitalSalesEnabled?: boolean;
  kindleProductUrl?: string | null;
  paymentLinkVerifiedAt?: string | null;
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
