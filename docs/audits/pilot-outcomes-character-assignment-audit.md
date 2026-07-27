# Weekly character assignment audit

Audit date: 2026-07-26  
Production project: `bnopaocdqkknjzmmkaen`  
Staging project: `gpcsombdaxlvlizoupqw`

## Findings

- Production has active Weeks 1–8.
- Every production week contains the ordered hotspot set Caiden, Miranda, B-4, Charlie, and Zeke.
- Weeks 1–4 have explicit comic thumbnails.
- Weeks 5–8 have no explicit thumbnail, comic thumbnail, map background, background image, or hero image.
- Staging currently has no active/published/scheduled adventure rows, so it cannot validate production character presentation.
- The schema has hotspot-level `character_key` values but no canonical week-level `lead_character_key`.
- The UI previously used the first hotspot image when week artwork was absent. Because Caiden is first in every production hotspot array, Weeks 5–8 could misleadingly appear Caiden-led.

## Application correction

Character artwork is now used as a fallback only when all configured hotspots identify one unambiguous character. Mixed-character weeks without explicit week artwork use the neutral placeholder. This prevents accidental Caiden assignment.

## Production data correction plan — not applied

1. Owner/content review assigns the intended lead character or distinct comic thumbnail for Weeks 5–8.
2. Upload one approved week-level thumbnail per week.
3. Review Month 2 on mobile and desktop.
4. If a durable lead-character field is desired, add an explicitly reviewed additive `lead_character_key` column rather than inferring it from hotspot order.
5. Do not modify Weeks 1–4 unless the existing explicit comic art is rejected in content review.
