# Analytics Tracking — Caiden's Courage Pilot

This document describes the GA4 + Microsoft Clarity implementation for the Caiden's Courage React application.

## IDs

| Provider | ID |
|----------|-----|
| Google Analytics 4 | `G-X3FLSWS5L7` |
| Microsoft Clarity | `x3m4u6g96g` |

## Architecture

- **Service:** `src/lib/analytics.ts`
- **Route tracker:** `src/components/analytics/AnalyticsRouteTracker.tsx` (mounted in `App.tsx`)
- **Bootstrap:** `initAnalytics()` called from `src/index.js` and lazily from the route tracker

### Public API

```ts
trackPageView(overrides?)
trackEvent(eventName, params?)
identifyUser(userData)
refreshAnalyticsIdentity()
```

GA4 is configured with `send_page_view: false` so SPA navigation does not double-count. The route tracker fires a single `page_view` per unique `pathname + search + hash + title + section`.

Clarity receives session tags for `portal_type`, `program_code`, and `user_role`, plus `identify()` when a participant record exists.

## User Identification

Approved fields only (never email, full names, or access codes):

| Role | Fields sent |
|------|-------------|
| Student | `participant_id`, `nickname`, `role: "student"`, `program_code` |
| Adult | `participant_id`, `role`, `organization`, `program_code` |

Identity is resolved from local participant records (`pilotTrackingLocalStorage`) plus active portal context. Call `refreshAnalyticsIdentity()` after profile save or portal unlock.

## Event Catalog

### Portal

| Event | When | Parameters |
|-------|------|------------|
| `portal_viewed` | First `/portal` visit per session | `source_page` |
| `family_portal_viewed` | First family portal route per session | `portal_type`, `program_code`, `user_role` |
| `facilitator_portal_viewed` | First facilitator portal route per session | `portal_type`, `program_code`, `user_role` |
| `page_view` | Every route change | `page_path`, `page_title`, `page_section`, `portal_type`, `user_role`, `program_code` |

### Assessments

| Event | Parameters |
|-------|------------|
| `student_assessment_started` | `role`, `assessment_type` |
| `student_assessment_completed` | `role`, `assessment_type`, `score`, `max_score`, `percent_score`, `understanding_score`, `support_score` |
| `adult_assessment_started` | `role`, `assessment_type` |
| `adult_assessment_completed` | same as student |

### Training & Games

| Event | Parameters |
|-------|------------|
| `training_module_started` | `module_id`, `module_title`, `week`, `character`, `role` |
| `training_module_completed` | same |
| `game_started` | `game_id`, `game_title`, `character`, `role` |
| `game_completed` | `game_id`, `game_title`, `character`, `score`, `attempts`, `role` |

### Weekly Modules

| Event | Parameters |
|-------|------------|
| `weekly_module_opened` | `week`, `title`, `role` |
| `weekly_module_downloaded` | `week`, `title`, `role` |
| `weekly_module_completed` | `week`, `title`, `role` *(wire when completion UI exists)* |

### Characters & Engagement

| Event | Parameters |
|-------|------------|
| `character_profile_viewed` | `character_name` |
| `ask_b4_opened` | — |
| `ask_b4_question_submitted` | `question_length` |
| `gallery_viewed` | — |
| `certificate_viewed` | — |

### Downloads

| Event | Parameters |
|-------|------------|
| `coloring_page_downloaded` | `asset_name`, `asset_type` |
| `worksheet_downloaded` | `asset_name`, `asset_type` |
| `facilitator_guide_downloaded` | `asset_name`, `asset_type` |
| `certificate_downloaded` | `asset_name`, `asset_type` |
| `activity_downloaded` | `asset_name`, `asset_type` |

### Pilot Sales Funnel

| Event | Parameters |
|-------|------------|
| `request_demo_clicked` | `source_page`, `portal` |
| `pilot_interest_clicked` | `source_page`, `portal` |
| `contact_form_started` | `source_page`, `portal` |
| `contact_form_submitted` | `source_page`, `portal` |
| `pricing_viewed` | `source_page`, `portal` |
| `support_pilot_clicked` | `source_page`, `portal` |

## Route Coverage

### Family Portal (`/portal/family`, `/family-hub`)

Page views resolve titles via `resolvePortalPageTitle()`:

- Home (Overview)
- Weekly Adventures (`/continue-learning`)
- Character Hub + individual character pages + game routes
- Parent Corner (`/guide`)
- Downloads, Gallery, Certificates
- B-4 Check-In, adult assessments

### Facilitator Portal (`/portal/facilitator`, `/program-dashboard`)

Hash navigation (`#overview`, `#weekly-modules`, etc.) updates `page_section` and `page_title`:

- Overview, Weekly Modules, Activities Library, Assessments, Results, Certificates, Student Gallery, Training & Resources

## Dashboard Recommendations (GA4)

| Metric | Suggested exploration |
|--------|----------------------|
| Unique Students | `page_view` or `game_started` where `user_role = student`; dedupe by `participant_id` user property |
| Unique Adults | `adult_assessment_started` or `page_view` where `user_role` in `parent`, `facilitator` |
| Assessment Completion Rate | `student_assessment_completed` / `student_assessment_started` |
| Assessment Growth Delta | Compare `adult_assessment_completed` scores (`understanding_score`, `support_score`) baseline vs growth |
| Weekly Completion Rate | `weekly_module_downloaded` / `weekly_module_opened` |
| Most Popular Character | `character_profile_viewed` and `game_completed` by `character` |
| Most Downloaded Resource | Download events by `asset_name` |
| Most Played Game | `game_completed` by `game_id` |
| Average Assessment Score | `student_assessment_completed` → avg `percent_score` |
| Average Adult Growth Delta | `adult_assessment_completed` where `assessment_type = adult_post` |

## Adding Future Events

1. Import `trackEvent` from `src/lib/analytics.ts`.
2. Fire at the user action (click, completion, mount for views).
3. Use snake_case event names and flat parameters (strings/numbers only).
4. Add the event to this document.
5. In development, events log to the console when `NODE_ENV=development` or `REACT_APP_GA_DEBUG=true`.

Example:

```ts
import { trackEvent } from '../lib/analytics';

trackEvent('my_new_event', {
  feature_id: 'week-2-reflection',
  role: 'facilitator',
});
```

## Testing Locally

1. Start the app: `yarn start`
2. Open DevTools → Console. With debug enabled you will see `[analytics] page_view` and event logs.
3. Enable GA4 DebugView:
   - Set `REACT_APP_GA_DEBUG=true` in `.env.local`
   - Install the [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger) Chrome extension, or use GA4 Admin → DebugView
4. Verify Clarity:
   - Visit [clarity.microsoft.com](https://clarity.microsoft.com), open project `x3m4u6g96g`
   - Confirm new sessions appear within a few minutes
   - Check custom tags: Portal Type, Program Code, User Role
5. Duplicate pageview check:
   - Navigate between family portal tabs — each unique path should fire one `page_view`
   - Re-render the same route — should **not** fire a second identical `page_view`
6. Custom events:
   - Complete a B-4 game → `game_started`, `game_completed`
   - Open Ask B-4 → `ask_b4_opened`
   - Submit student baseline → `student_assessment_started`, `student_assessment_completed`

## Microsoft Clarity Features

Clarity is loaded globally with project `x3m4u6g96g`, enabling:

- Session recordings
- Heatmaps
- Rage click analysis
- Dead click analysis

Recordings are tagged via `clarity('set', ...)` with portal type, program code, and user role. Identified participants use `clarity('identify', participant_id, ...)`.
