# Family Portal push notifications MVP

Parent-only web push reminders for the Family Portal. Facilitator portal is out of scope; shared services in `src/lib/pushSubscriptionService.ts` and `src/lib/parentPushNotify.ts` are reusable for a future facilitator pass.

## Supabase table: `public.push_subscriptions`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Family account id — `pilot_programs.id` |
| `child_id` | uuid nullable | Optional participant scope |
| `endpoint` | text | **Unique** push endpoint URL |
| `subscription` | jsonb | Browser PushSubscription JSON |
| `enabled` | boolean | Default `true` |
| `user_agent` | text nullable | Captured on save |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

Migration: `supabase/push_subscriptions_migration.sql`

**Not stored:** `parent_email` (email is used only in app UI to verify parent identity before opt-in).

Indexes: `user_id`, `child_id` (partial), `enabled` (partial), `endpoint` (unique).

## Environment variables

### Client (`.env.local` / Netlify build)

```
REACT_APP_WEB_PUSH_PUBLIC_KEY=   # VAPID public key for browser subscribe
```

### Netlify functions (server only)

```
WEB_PUSH_PUBLIC_KEY=             # Same value as REACT_APP_WEB_PUSH_PUBLIC_KEY
WEB_PUSH_PRIVATE_KEY=
WEB_PUSH_SUBJECT=mailto:support@caidenscourage.com
SUPABASE_URL=                    # or REACT_APP_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=
ENABLE_CHILD_INACTIVE_PUSH=false # Keep false until inactive reminder QA is done
```

Generate VAPID keys:

```bash
npx web-push generate-vapid-keys
```

## Architecture

| Layer | Path | Role |
|-------|------|------|
| Settings UI | `FamilyPushNotificationsCard` | Opt-in only in Family Portal |
| Client service | `pushSubscriptionService.ts` | Status, subscribe, save |
| Notify client | `parentPushNotify.ts` | Fire-and-forget event triggers + dedupe |
| Save | `netlify/functions/save-push-subscription.js` | Upsert by `endpoint` |
| Send | `netlify/functions/send-push.js` | Send to all enabled subs for `user_id` |
| Event copy | `netlify/functions/notify-parent-push.js` | Parent-facing titles/bodies |
| Inactive placeholder | `netlify/functions/notify-child-inactive-scheduled.js` | **Disabled by default** |

Service worker: `public/sw.js` (production only, via `src/index.js`).

## Notification events (live)

| Trigger | Title | Body |
|---------|-------|------|
| `child_completed_weekly_mission` | Mission complete! | `[Child] finished [Mission].` |
| `reward_ready_to_claim` | Reward ready | `[Child] earned a new reward to claim.` |
| `child_session_paused` | Child session paused | `[Child]'s game session paused after inactivity.` |
| `child_session_ended` | Child session ended | `[Child]'s shared device session ended safely.` |

Dedupe: client-side keys in `parentPushNotifyDedupe.ts` prevent replay/resubmit duplicates. Mission/reward triggers only fire on first successful claim (`!alreadyClaimed`).

## Dev logging (development builds)

| Tag | When |
|-----|------|
| `[PUSH_SUBSCRIPTION_STATUS]` | Settings screen status resolution |
| `[PUSH_SAVE_RESULT]` | After save/disable subscription API call |
| `[PUSH_NOTIFY_EVENT]` | Before notify API call (client + server) |
| `[PUSH_NOTIFY_SKIPPED]` | Missing user id, dedupe hit, or inactive job disabled |

## Manual test steps

1. Run `supabase/push_subscriptions_migration.sql` in Supabase SQL editor.
2. Set env vars locally and on Netlify; redeploy functions.
3. `CI=true yarn build && npx serve -s build` (HTTPS required for push in most browsers — use Netlify preview or `localhost` where supported).
4. Open **Family Portal → Settings → Notifications**.
5. Confirm status resolves to one of:
   - Reminders unavailable on this browser
   - Push service not configured
   - Reminders off
   - Reminders enabled
6. Tap **Enable reminders** → grant permission → status shows **Reminders enabled**.
7. Verify row in `push_subscriptions` with correct `user_id` (family program uuid).
8. Complete a weekly mission claim as a child → parent device receives **Mission complete!**
9. Claim a new reward → **Reward ready** (once per dedupe key).
10. Idle-timeout kid session → **Child session paused** (once per session id).
11. End session from pause gate → **Child session ended** (once per session id).
12. Replay same mission claim → no duplicate push (`[PUSH_NOTIFY_SKIPPED] dedupe` in dev console).

### Inactive 3-day placeholder

```bash
curl -X POST https://YOUR_SITE/.netlify/functions/notify-child-inactive-scheduled \
  -H 'Content-Type: application/json' \
  -d '{"userId":"FAMILY_PROGRAM_UUID","childId":"PARTICIPANT_UUID","childName":"Alex","inactiveDays":3}'
```

Expected with `ENABLE_CHILD_INACTIVE_PUSH=false`:

```json
{ "ok": false, "skipped": true, "reason": "disabled_pending_verification" }
```

## Browser limitations

| Platform | Install / push notes |
|----------|---------------------|
| **Chrome / Edge (desktop)** | Full support after HTTPS + SW + permission |
| **Android Chrome** | Works in browser and installed PWA |
| **iOS Safari 16.4+** | Push only for **installed** PWAs (Add to Home Screen); not in regular Safari tabs |
| **iOS** | Permission prompt only after user gesture (Enable reminders button) |
| **Firefox** | Supported on desktop; mobile support varies |
| **Private / incognito** | Subscriptions may not persist |

Kid shell never calls `Notification.requestPermission()` — opt-in is Family Portal settings only.

## Out of scope (this MVP)

- Facilitator portal notification settings
- Daily B-4 reminder spam
- Auto-scheduled inactive-child sends (placeholder only)
- Email/SMS fallbacks
