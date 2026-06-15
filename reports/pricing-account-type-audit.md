# Pricing & Account Type Audit

Generated: 2026-06-15T22:51:54.184Z

## Summary

- Total catalogued entries: **18**
- Dynamic (portal config): **4**
- Hardcoded Stripe links: **7**
- Missing Stripe links in defaults: **4**
- Admin Payment Links tab: **yes**
- Family modal dynamic: **yes**
- Facilitator modal dynamic: **yes**

## Pricing groups

| Group | Account / program types |
| --- | --- |
| **Family** | Family Portal, Digital Book + Family Portal, Independent Family |
| **Small Group** | Camp / Youth Program, After-School Program, Homeschool Group, Teacher / Classroom |
| **Large Organization** | School, District, large camp / after-school (Camp Plus tier) |

## Program type → pricing group

| Program type | Pricing group |
| --- | --- |
| Independent Family | family |
| Camp / Youth Program | small_group |
| After-School Program | small_group |
| Homeschool Group | small_group |
| Teacher / Classroom | small_group |
| School | large_organization |
| District | large_organization |

## Default portal plans (admin-editable)

| Plan | Group | Price | Stripe configured |
| --- | --- | --- | --- |
| Family Portal | family | $79/year | no — CTA disabled |
| Digital Book + Family Portal | family | $129/year | no — CTA disabled |
| Camp Pilot | small_group | $750 | yes |
| Camp Plus | small_group | $1,000 | yes |
| School Plan | large_organization | Custom quote | no — CTA disabled |
| District Plan | large_organization | Custom quote | no — CTA disabled |

## Discovered prices & payment links

| Location | Label | Price | Stripe URL | Group | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| src/data/pricingPlansDefaults.ts | Family Portal | $79/year | — | family | missing_stripe | Default plan seed — admin overrides via Payment Links tab (localStorage). |
| src/data/pricingPlansDefaults.ts | Digital Book + Family Portal | $129/year | — | family | missing_stripe | Default plan seed — admin overrides via Payment Links tab (localStorage). |
| src/data/pricingPlansDefaults.ts | Camp Pilot | $750 | [link](https://buy.stripe.com/dRmfZg0rJ1dC4078Ry3Ru05) | small_group | dynamic | Default plan seed — admin overrides via Payment Links tab (localStorage). |
| src/data/pricingPlansDefaults.ts | Camp Plus | $1,000 | [link](https://buy.stripe.com/6oUcN45M33lK1RZ3xe3Ru06) | small_group | dynamic | Default plan seed — admin overrides via Payment Links tab (localStorage). |
| src/data/pricingPlansDefaults.ts | School Plan | Custom quote | — | large_organization | missing_stripe | Default plan seed — admin overrides via Payment Links tab (localStorage). |
| src/data/pricingPlansDefaults.ts | District Plan | Custom quote | — | large_organization | missing_stripe | Default plan seed — admin overrides via Payment Links tab (localStorage). |
| src/config/externalLinks.ts | Limited Edition Pre-order | Product page pricing | [link](https://buy.stripe.com/9B6bJ03DVe0ogMTaZG3Ru00) | product_shop | hardcoded | Shop / product preorder links — not part of portal upgrade pricing config. |
| src/config/externalLinks.ts | Hardcover Bundle | Product page pricing | [link](https://buy.stripe.com/fZufZggqHbSg7cjd7O3Ru04) | product_shop | hardcoded | Shop / product preorder links — not part of portal upgrade pricing config. |
| src/config/externalLinks.ts | Paperback | Product page pricing | [link](https://buy.stripe.com/6oU5kCeiz4pO2W3gk03Ru03) | product_shop | hardcoded | Shop / product preorder links — not part of portal upgrade pricing config. |
| src/config/externalLinks.ts | B-4 Plush | Product page pricing | [link](https://buy.stripe.com/6oUaEWa2j9K89kr9VC3Ru01) | product_shop | hardcoded | Shop / product preorder links — not part of portal upgrade pricing config. |
| src/config/externalLinks.ts | T-Shirt | Product page pricing | [link](https://buy.stripe.com/9B6dR80rJ2hGaov0l23Ru02) | product_shop | hardcoded | Shop / product preorder links — not part of portal upgrade pricing config. |
| src/config/personaPages.ts (marketing) | Help your child build confidence, focus, and emotional language at home. | See persona page tier | [link](https://buy.stripe.com/dRmfZg0rJ1dC4078Ry3Ru05) | marketing_only | hardcoded | Public marketing persona page — still hardcoded; align with admin config in a follow-up. |
| src/config/personaPages.ts (marketing) | Camp Plus | See persona page tier | [link](https://buy.stripe.com/6oUcN45M33lK1RZ3xe3Ru06) | small_group | hardcoded | Public marketing persona page — still hardcoded; align with admin config in a follow-up. |
| src/components/family-portal/FamilyUpgradePricingModal.tsx | Family upgrade modal | From pricing config | — | family | dynamic | Pulls active family plans via usePricingPlansConfig. |
| src/components/pilot-dashboard/PilotUpgradePricingModal.tsx | Facilitator upgrade modal | From pricing config by program type | — | small_group | dynamic | Maps program type → family | small_group | large_organization. |
| src/config/personaPages.ts (marketing) | Families persona pricing | $79/year, $129/year | — | marketing_only | contact_only | Contact / waitlist CTAs |
| src/config/personaPages.ts (marketing) | Teachers persona pricing | $99/year | — | marketing_only | contact_only | Contact CTA only |
| src/config/personaPages.ts (marketing) | Schools persona pricing | $999–$2,500/year, $1,999–$5,000+ | — | marketing_only | contact_only | Contact CTA only |

## Still hardcoded (recommended follow-up)

- `src/config/personaPages.ts` — Camp Pilot / Camp Plus marketing CTAs use Stripe URLs directly.
- `src/config/externalLinks.ts` — product shop preorder links (limited edition, bundles, merch).
- Marketing persona pages for Families, Teachers, and Schools use contact CTAs or inline prices not yet wired to admin config.

## Missing Stripe links (defaults)

- **Family Portal** (family) — configure in Admin → Payment Links
- **Digital Book + Family Portal** (family) — configure in Admin → Payment Links
- **School Plan** (large_organization) — configure in Admin → Payment Links
- **District Plan** (large_organization) — configure in Admin → Payment Links

## QA checklist

| Check | Pass | Detail |
| --- | --- | --- |
| Admin Payment Links tab | ✅ | Admin portal exposes pricing-plans tab |
| Family Portal upgrade modal uses config | ✅ | No hardcoded Stripe URLs in family modal |
| Facilitator upgrade modal uses config | ✅ | No hardcoded Stripe URLs in facilitator modal |
| Missing Stripe link fallback | ✅ | Disabled CTA + message when Stripe URL missing |
| Camp / After-School share small_group | ✅ | Both program types resolve to small_group pricing |
| Independent Family uses family plans | ✅ | Independent Family resolves to family pricing group |
| School / District use large_organization | ✅ | School and District resolve to large_organization plans |
| Hardcoded Stripe URLs outside defaults | ❌ | src/components/admin/tabs/AdminPricingPlansTab.tsx, src/config/externalLinks.ts, src/config/personaPages.ts |

## Admin configuration

Edit plans at **Admin Portal → Payment Links** (`?tab=pricing-plans`).
Changes persist in browser localStorage (`cc-pricing-plans-config`) and broadcast via `cc-pricing-plans-updated`.
