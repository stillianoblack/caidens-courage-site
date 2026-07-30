# Academy reporting and product-surface UX audit

## Pre-change behavior

- `CourageToolsPopup` was mounted globally in `AppLayout` and suppressed through a small denylist. Admin, login, signup, claim, invitation, reset, and future authenticated routes were not centrally protected.
- Popup frequency was controlled by `cc_courage_tools_popup_dismissed_at` and `cc_courage_tools_popup_submitted`.
- `B4UnitOnboardingModal` rendered a full-screen loading backdrop and a full-screen retry error whenever `enforce` was enabled.
- `useB4Variant` already used participant-keyed session storage and rejected another participant's cached value, but retry happened immediately rather than after bounded backoff.
- Individual Pilot Outcomes were calculated server-side by `pilotOutcomes.js`; portfolio summary was a sum/average of program outputs and had no cross-program student eligibility model.
- Canonical reporting sources were participants, assessments, module results, weekly progress, wallets, rewards, and Kid Shell sessions. Question attempts and participant mission progress were not loaded by the portfolio endpoint.
- Existing verified-outcome calculations required matched baseline/post data and did not convert activity into growth.

## Release behavior

- Popup eligibility is a centralized public-route allowlist combined with authentication-loading, authenticated-session, and application-session checks. Existing dismissal/submission frequency rules remain unchanged.
- Kid Shell renders after session authentication without waiting for B-4. B-4 areas use their existing neutral avatar state, revalidate in the background, retry once after 250 ms, and show only a contextual retry notice after final failure.
- Academy eligibility is server-owned: at least three normalized active dates and two distinct completed canonical learning activities, with test/synthetic exclusions and server-mediated overrides.
- Academy aggregation reuses the canonical `buildProgramOutcome` calculation after eligibility scoping, preserving Program Health, Live Student Progress, Verified Outcomes, and dashboard/PDF parity.
- The shareable Academy PDF contains aggregate evidence and methodology only; student names, PINs, access codes, and guardian information are excluded.

## Migration

`supabase/migrations/20260730000100_academy_reporting_overrides.sql` is additive and idempotent. It was prepared but not executed.
