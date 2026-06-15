# Staging Question Rewrites

This folder holds **review-only** question rewrites. Production mission files are unchanged.

## Generate / refresh staging content

```bash
npm run rewrite:staging    # builds src/data/staging/manifest.json
npm run audit:questions:v2 # before/after audit + PDF
```

## Preview staging in the app

```bash
REACT_APP_STAGING_QUESTIONS=true yarn start
```

When enabled, adaptive builders load overrides from `manifest.json` and use content version `adaptive_staging_v3_final` (separate from production completion tracking).

## Difficulty upgrade (v4)

```bash
npm run rewrite:staging:difficulty   # all 512 questions + v3 audit PDF
```

## Deploy to production

Only after review, apply approved overrides to source mission files manually or via an approved promotion script. **Do not** enable `REACT_APP_STAGING_QUESTIONS` in production builds until promoted.
