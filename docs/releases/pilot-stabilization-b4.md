# Pilot Stabilization Release — `pilot-stabilization-b4`

**Release date:** June 10, 2026  
**Production URL:** https://caidenscourage.com  
**Tag:** `pilot-stabilization-b4`

## Summary

Stabilizes the Blue Ribbon pilot experience across Family and Facilitator portals: reliable Ask B-4 assistant, live family dashboard data, parent–child linking, program goals persistence, gallery workflow polish, mobile layout fixes, and shared design-system components.

## Included

### Ask B-4 Assistant
- Mount B-4 in portal `AppShell` via `B4Assistant` (body portal, singleton guard)
- Hide duplicate global widget on portal routes
- Eager-load launcher CSS so bubble is visible before chat chunk loads
- Reopen reliability: launcher stays mounted; toggle open/close; pending-open queue
- Open-state layering: panel above launcher; z-index stack; safe-area offsets
- Family-friendly starters and deep links

### Family Portal
- Live Supabase overview metrics and child summary card at top of Home
- Parent ↔ child linking guards and duplicate Add Child prevention
- Mobile header/search/KPI/toast layout fixes (no horizontal scroll)
- Goals onboarding drawer with frequency controls (24h remind, 7d skip)

### Facilitator Portal
- Program-scoped dashboard panels and gallery workflow improvements
- Goals onboarding aligned with Family portal behavior
- B-4 assistant on facilitator shell

### Design System & Shared Shell
- Portal design system: toasts, slide-out drawer, goals drawer, marketing showcase
- Family and Facilitator design system documentation sync
- Shared game shell routing preserved

### Program & Data
- Blue Ribbon program assignment sync
- Goals save/remind/skip persistence (Supabase + localStorage fallback)
- Gallery visibility and submission flow improvements

## Explicitly excluded (Friday review)

- Navigation architecture changes
- Outlet key / routing refactors
- Scroll-management refactors
- Suspense / loading architecture changes
- Lazy-loading strategy changes
- Portal shell rewrites

## Pre-deploy verification

| Check | Status |
|-------|--------|
| Production build (`yarn build`) | Pass |
| TypeScript (`tsc --noEmit`) | Pass |
| ESLint (`yarn lint`) | Pass |
| Family Portal routes compile | Pass |
| Facilitator Portal routes compile | Pass |
| B-4 open/close/reopen logic present | Pass (code review) |
| Parent–child linking guards | Pass (code review) |
| Blue Ribbon assignment sync | Pass (code review) |
| Goals persistence service | Pass (code review) |
| Gallery submission service | Pass (code review) |

**Post-deploy smoke test recommended:** Family Home, Facilitator Overview, B-4 reopen loop, family access code link, goals save, gallery upload on production Supabase.

## Known issues (deferred)

- **Navigation jump on portal tab change:** Facilitator sidebar uses full page reload (`window.location.replace`); Family portal double scroll-reset + global `scroll-behavior: smooth` causes visible scroll animation. Scheduled for Friday navigation optimization review.
- **Facilitator tab navigation:** Hard reload is intentional for session stability; SPA migration deferred.

## Deploy

Netlify builds from `main` (`yarn build` → `build/`). Push tag `pilot-stabilization-b4` to trigger production deploy.
