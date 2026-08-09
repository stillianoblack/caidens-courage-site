# Narrow critical deployment manifest

Status: prepared, **not approved for deployment**. Production remains NO-GO.

## Include only after blockers are resolved

Signup transaction, timeout, validation, and UI reset:

- `netlify/functions/pilot-family-signup.js`
- `src/components/pilot-program/PilotProgramSignupForm.tsx`
- `src/pages/PilotProgramSignupPage.tsx`
- `src/lib/pilotProgramService.ts`
- `src/lib/independentFamilyPortalSignup.ts`
- `src/types/pilotProgram.ts`
- `src/lib/__tests__/pilotFamilySignupEndpoint.test.ts`

Identity/hydration and progress consistency:

- `src/lib/hydrateExistingFamilyChildren.ts`
- `src/lib/week0AssessmentStorage.ts`
- `src/lib/getCourageInTheDarkProgress.ts`
- `src/lib/__tests__/familyChildrenHydration.test.ts`
- `src/lib/__tests__/familySignupProgressRegression.test.ts`

Initial goal-selection gate:

- `src/config/featureFlags.ts`
- `src/hooks/useProgramGoalsOnboarding.ts`
- `src/lib/__tests__/goalSelectionLaunchReadiness.test.ts`

Database change and rollback:

- `supabase/migrations/20260713000200_family_signup_identity_integrity.sql`
- `supabase/rollbacks/20260713000200_family_signup_identity_integrity_rollback.sql`

The deployment must preserve the corrected family-link/enrollment insert in the critical migration and the service-role-only RPC grant.

## Explicitly exclude

- `supabase/migrations/20260713000100_learning_engagement_foundation.sql`
- learning-content/question-bank UI and server functions
- achievement-event services and calls
- dashboard onboarding additions unrelated to disabling the old blocking goal modal
- weekly-summary preparation or delivery
- Kit diagnostics, Kit event delivery, provider synchronization, and email delivery changes
- CRM Phase 2/3 activation changes
- the review-only production lockdown SQL (separate security change window)

## Deployment prerequisites

1. Replace local access-code ownership with an Auth-backed server authorization boundary for family/student/facilitator portal data.
2. Stage and validate the production RLS lockdown against a production-shaped dataset.
3. Generate and rehearse an exact production policy/grant rollback from the captured inventory.
4. Rerun signup, family-link, portal hydration, baseline/B-4, reward-idempotency, cross-family isolation, full tests, typecheck, lint, and build.
5. Obtain explicit production maintenance-window approval.

Do not deploy the family-signup endpoint alone while its successful redirect cannot securely hydrate the new account.
