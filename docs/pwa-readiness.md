# PWA readiness

## Current state

- **Manifest:** `/public/manifest.json` linked from `public/index.html`
  - `name`: Caiden's Courage
  - `short_name`: Caiden
  - `display`: standalone
  - `theme_color` / `background_color`: `#070b14` (dark navy kid shell)
  - `start_url`: `/family-hub/play-pause` (kid pause/resume gate for installed app)
- **Apple meta:** `apple-mobile-web-app-capable`, status bar, and title in `index.html`
- **Service worker:** `/public/sw.js` registered on production load from `src/index.js`
  - Install + activate only (no fetch caching — avoids stale bundles on deploy)
  - Push + notification click handlers for parent reminders

## Standalone launch routing

When the installed PWA opens in standalone display mode:

1. Active child session (paused or in progress) → `/family-hub/play-pause` (or `/family-portal/play-pause`)
2. No active child session → access code screen (`/portal`)
3. Normal browser sessions are unchanged

The play-pause gate offers:

- **Continue as [Child]** → resumes kid shell
- **Parent email** → unlocks Family Portal
- **End Session** → clears shared session and returns to access code

## Web push (parent-only)

- Opt-in card: Family Portal → Settings → Notifications
- Permission is requested only when the parent taps **Enable reminders**
- Subscriptions stored in `push_subscriptions` keyed by `user_id` (family `pilot_programs.id`), optional `child_id`
- Triggers (parents only, no kid shell prompts):
  - Child completed weekly mission
  - Badge/reward ready to claim
  - Child session paused or ended on shared device

### Env vars (Netlify + `.env.local`)

```
REACT_APP_WEB_PUSH_PUBLIC_KEY=   # browser subscription
WEB_PUSH_PUBLIC_KEY=             # same value for server
WEB_PUSH_PRIVATE_KEY=
WEB_PUSH_SUBJECT=mailto:support@caidenscourage.com
SUPABASE_SERVICE_ROLE_KEY=       # save/send subscriptions
```

Run `supabase/push_subscriptions_migration.sql` before enabling in production.

## Manual verify

1. Production build: `CI=true yarn build && npx serve -s build`
2. Chrome DevTools → Application → Manifest (no errors)
3. Application → Service Workers → registered and activated
4. Install PWA → cold launch lands on play-pause or access code (not dashboard)
5. Family Portal Settings → enable reminders → grant permission → status shows Enabled
6. Lighthouse PWA audit (optional): installable prompt requires HTTPS + icons
