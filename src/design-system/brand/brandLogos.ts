/** Shared brand logo assets — public marketing, family portal, facilitator portal. */

const publicUrl = process.env.PUBLIC_URL ?? '';

function asset(path: string): string {
  return `${publicUrl}${path}`;
}

/** Caiden's Courage icon + wordmark — marketing site, family portal, public brand. */
export const MARKETING_LOGO_SRC = asset('/images/icons/marketing_page_logo.svg');

/** Dark-footer variant: white icon square + gold mark + gold wordmark (marketing footer only). */
export const MARKETING_FOOTER_LOGO_SRC = asset('/images/icons/marketing_footer_logo.svg');

/** Caiden Vale story-world wordmark — Vale marketing pages only (not portals). */
export const CAIDEN_VALE_LOGO_SRC = asset('/images/logos/CaidenVale_Logo_Web.svg');

/** Focus Flame Academy mark — kid shell loaders, transitions, and academy splash screens. */
export const FOCUS_FLAME_ACADEMY_MARK_SRC = asset('/images/icons/focus-flame-mark.svg');

/** @deprecated Use FOCUS_FLAME_ACADEMY_MARK_SRC — kid shell boot loader and hard-navigation transition overlay. */
export const FOCUS_FLAME_ICON_SRC = FOCUS_FLAME_ACADEMY_MARK_SRC;

/** Square Focus Flame icon — facilitator portal shell branding. */
export const FACILITATOR_LOGO_SRC = asset('/images/icons/Facilitator_logo.svg');

/** Wide Focus Flame wordmark — marketing/access contexts only. */
export const FACILITATOR_WORDMARK_SRC = asset('/images/icons/Focus-Flame.svg');

/** Family portal uses the consumer Caiden's Courage wordmark. */
export const FAMILY_LOGO_SRC = MARKETING_LOGO_SRC;

export type BrandLogoVariant = 'marketing' | 'family' | 'facilitator';

export const BRAND_LOGO_ALTS: Record<BrandLogoVariant, string> = {
  marketing: "Caiden's Courage",
  family: "Caiden's Courage",
  facilitator: 'Focus Flame Academy',
};

export function resolveBrandLogoSrc(
  variant: BrandLogoVariant,
  size?: 'portalIcon' | 'portalWordmark' | 'marketingHeader' | 'accessCode',
): string {
  if (variant === 'facilitator') {
    if (size === 'portalWordmark') return FACILITATOR_WORDMARK_SRC;
    return FACILITATOR_LOGO_SRC;
  }
  return MARKETING_LOGO_SRC;
}
