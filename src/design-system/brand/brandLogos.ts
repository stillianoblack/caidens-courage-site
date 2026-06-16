/** Shared brand logo assets — public marketing, family portal, facilitator portal. */

const publicUrl = process.env.PUBLIC_URL ?? '';

function asset(path: string): string {
  return `${publicUrl}${path}`;
}

/** Caiden's Courage icon + wordmark — marketing site, family portal, public brand. */
export const MARKETING_LOGO_SRC = asset('/images/icons/marketing_page_logo.svg');

/** Gold Focus Flame in navy rounded square — facilitator portal + access codes. */
export const FACILITATOR_LOGO_SRC = asset('/images/icons/Facilitator_logo.svg');

/** Family portal uses the consumer Caiden's Courage wordmark. */
export const FAMILY_LOGO_SRC = MARKETING_LOGO_SRC;

export type BrandLogoVariant = 'marketing' | 'family' | 'facilitator';

export const BRAND_LOGO_ALTS: Record<BrandLogoVariant, string> = {
  marketing: "Caiden's Courage",
  family: "Caiden's Courage",
  facilitator: 'Focus Flame Academy',
};

export function resolveBrandLogoSrc(variant: BrandLogoVariant): string {
  if (variant === 'facilitator') return FACILITATOR_LOGO_SRC;
  return MARKETING_LOGO_SRC;
}
