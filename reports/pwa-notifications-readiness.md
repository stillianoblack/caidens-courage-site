# PWA + Notifications Readiness

**Date:** 2026-06-16  
**Scope:** Audit only — no push notification implementation in this pass.

## Current PWA status

| Item | Status | Notes |
|------|--------|-------|
| Web app manifest | Present | `public/manifest.json` — `standalone` display, theme/background colors, `start_url: "."` |
| App icons (192 / 512) | Present | `public/logo192.png`, `public/logo512.png` (maskable + any) |
| Favicon | Present | `public/favicon.ico` referenced in manifest |
| Service worker (active) | **Not registered** | No `src/serviceWorkerRegistration` in repo; CRA/workbox deps exist transitively but SW is not wired |
| Vite PWA plugin | N/A | Project uses Create React App (`react-scripts`), not Vite PWA |
| HTTPS / installability | Depends on host | Netlify/production HTTPS enables install prompt when manifest + icons + SW criteria are met |
| Kid play shell routes | Shell-safe | `/play/session/:id/*` suitable as future `start_url` target for child PWA mode |

## Missing for full PWA install

1. **Service worker registration** — register CRA/workbox SW or add explicit `serviceWorkerRegistration.ts` and call from `index.tsx`.
2. **Manifest `start_url`** — consider `/portal/family/weekly-adventures` or dedicated `/play` entry for family vs camp.
3. **Apple touch icon** — add `apple-touch-icon` link in `public/index.html` if missing.
4. **Offline strategy** — define precache vs network-first for mission assets (large game bundles).

## Notifications plan

### Phase 1 — Local in-app badges only (recommended now)

- **Inventory nav badge** — `useInventoryNotificationBadge` + `markInventoryHasNewRewards` after mission claim (implemented).
- **Quest claim indicators** — weekly/daily/monthly quest UI in Weekly Adventures (existing).
- **No browser permission** required.

### Phase 2 — PWA install prompt

- Register SW + verify Lighthouse PWA checklist.
- Optional custom “Add to Home Screen” coach for family devices.
- **Browser permission:** install prompt only (not notification permission).

### Phase 3 — Optional web push (future)

- **Requires:** push subscription API, VAPID keys, backend worker to send pushes (Supabase Edge Function or dedicated service).
- **Requires:** user notification permission in browser.
- **Not started** — no established push service in this codebase.
- **Safe scope:** reward ready, weekly quest complete, facilitator roster reminders (adult-only).

## Backend requirements for push (Phase 3)

- Store `push_subscriptions` per parent account (not child session).
- Respect COPPA: no marketing push to children; parent device only.
- Idle/session end flows should not depend on push.

## Recommended next steps

1. Ship Phase 1 badges in kid shell nav (done in this pass).
2. Add SW registration behind env flag; test install on iOS Safari + Android Chrome.
3. Defer web push until pilot requests parent re-engagement outside the app.
