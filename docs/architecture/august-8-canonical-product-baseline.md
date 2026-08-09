# Caiden's Courage — August 8 Canonical Product Baseline

This document records the approved product baseline captured by the canonical Git checkpoint. The checkpoint, rather than an older branch or deploy, is the source of truth for the surfaces below.

## Public site

- Canonical shell: `src/components/courage/CourageHeader.tsx`, `src/config/courageNav.ts`, and `src/config/courageRoutes.ts`.
- The desktop and mobile navigation use the current Home, The Story, Kids, For, Games, and Enter the World structure.
- The Story dropdown includes The Story, Characters, The World, and Learn More About Caiden Vale with the approved descriptions and styling.
- The current homepage and story presentation remain the approved public experience.

## Portal

- Canonical entry: the `/portal` route and the current `PortalHero` / `PortalAccessForm` composition.
- The approved entry screen is “Choose your guide.” with Student, Facilitator, and Parents / Guardians roles.
- The legacy access-code screen is not the portal landing page; role-specific access follows selection.

## Family

- Canonical marketing surface: `src/pages/ParentsPage.tsx` and the current persona-page configuration and components.
- The approved presentation uses the green B-4 family direction and the current pricing and family messaging.
- The family portal retains current onboarding, child cards, goals, weekly adventures, and child Play launch behavior.

## Pilot signup

- Canonical page and form: `src/pages/PilotProgramSignupPage.tsx` and `src/components/pilot-program/PilotProgramSignupForm.tsx`.
- Preserve the current redesigned signup flow, validation, tracking, and staging-safe service integration.

## Admin

- Canonical shell: `src/pages/AdminPortalPage.tsx` with `AdminGroupedNavigation.tsx` and `adminPortalContent.ts`.
- Authentication is the approved email plus Admin passcode flow implemented by `src/config/adminAccess.ts`, using `REACT_APP_ADMIN_EMAIL` and `REACT_APP_ADMIN_PASSCODE`.
- Do not replace the Admin entry flow with Supabase Auth or `crm_admin_role_assignments`.
- The grouped information architecture covers Dashboard; People; CRM; Marketing; Commerce; Programs; Learning; and Tools / Maintenance.
- Programs includes Pilot Programs and Pilot Outcomes. Pilot Outcomes contains the recovered Program Health and Live Learning Signals reporting.
- Preserve Question Bank, Kit Diagnostics, Design System, and the existing grouped CRM and commerce tools.
- The reporting endpoints use a short-lived, HttpOnly Admin passcode session cookie. Some older CRM/Kit endpoints still retain their pre-existing Supabase-role authorization internally; that is known technical debt and is not the canonical top-level Admin login model.

## Kid Play and Arcade

- Canonical shell: `src/pages/KidPlaySessionLayout.tsx`, `src/components/kid-play-shell/KidPlayShellPage.tsx`, and `KidPlayShellNav.tsx`.
- Preserve active child/session context, selected B-4, current progress, and production-authenticated routes.
- Canonical Arcade: `src/components/kid-play-shell/KidArcadePanel.tsx` and `kid-arcade.css`.
- Story Quest is the featured Arcade experience. B-4 Focus Flight and the representative locked/coming-soon game states remain as implemented.
- `/preview/arcade` is a development/deploy-preview-only review shortcut and must not be available in production.

## Story Quest

- Canonical route/page: `src/pages/StoryModePage.tsx` and the Story Mode components.
- Canonical story data: `src/data/storyMode/dragonNestCampaign.ts`.
- Large B-4 asset: `B-4student-hover.webp`.
- Small B-4 asset: `B-4student.webp`.
- Every chapter has five question slots.
- Chapter 1, “Welcome to Courage Camp,” is playable.
- Chapter 2, “Courage in the Dark,” is playable.
- Chapters 3–6 are visible and locked in production.
- Story Sparks progress from 0/5 to 5/5 within a chapter.
- Chapter 1 completion unlocks Chapter 2, and Next Chapter opens Chapter 2 Question 1 directly.
- Preserve the direct question flow: no chapter intro, map, B-4 setup, Step Forward, or other interstitial screens.
- Preview mode may open all chapters for development verification; production progression rules remain enforced.

## Locked baseline decisions

- Do not restore approved current product surfaces from repository HEAD, origin/main, or an older production deploy.
- Do not merge historical Admin analytics branches wholesale; only the compatible reporting implementation belongs in this baseline.
- Do not expose preview/debug UI or preview route access in production.
- Do not commit environment files, credentials, generated builds, local caches, screenshots, logs, or temporary audit/recovery exports.
