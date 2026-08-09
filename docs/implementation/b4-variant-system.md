# B-4 variant system

Status: implemented and asset-verified in staging.

The canonical manifest is `src/data/b4/variantManifest.ts`. It owns the five approved keys, child-facing names/descriptors, colors, state paths, the default, and legacy `spark` normalization. New writes store `courage`; arbitrary values and asset URLs are rejected.

Runtime assets are generated into `public/assets/b4/<variant>/<state>/`. All 20 files are transparent 1200×680 canvases with centered, aspect-ratio-preserving art. The source exports remain under `public/images/B-4FlightGame/B-4-units/`; @3x/@4x sources are not used by the runtime manifest.

| Variant | Idle | Happy | Hurt | Blinking | Audit note |
|---|---|---|---|---|---|
| Courage | present | present | present | present | distinct exports |
| Pattern | present | present | present | present | four byte-distinct, visually distinct exports; normalized geometry matches |
| Shield | present | present | present | present | distinct exports |
| Anchor | present | present | present | present | three source filenames incorrectly say `fusion_1`; visual files are distinct |
| Fusion | present | present | present | present | distinct exports |

Persistence uses `participants.b4_variant_key`, applied to staging by `20260715000100_b4_variant_preference.sql`. The protected `portal-b4-variant` endpoint validates the Auth actor, exact participant ownership or facilitator roster, or `internal_admin`; it updates only the variant and timestamp. A disposable live staging test proved persistence, refresh restoration, invalid rejection, `spark → courage`, and cross-participant denial, then restored the fixture and removed the Auth user.

Pattern verification (2026-07-15): all four source and runtime SHA-256 hashes are unique. Runtime files are transparent 1200×680 PNGs. Alpha-bound inspection reports the same `[60, 40, 1080, 600]` visual bounds and center `[599.5, 339.5]` for idle, happy, hurt, and blinking, so state changes do not shift the sprite. The manifest paths map directly to the four named states; no Pattern fallback remains.

Implemented surfaces: family child card, family settings selector, Arcade card/unlock, Flight landing/rotation/results, and Flight gameplay. These refetch immediately after save. Remaining production-readiness work is listed in `docs/deployment/final-go-no-go.md`.
