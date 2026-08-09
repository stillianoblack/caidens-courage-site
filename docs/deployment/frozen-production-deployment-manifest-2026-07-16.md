# Frozen production deployment manifest — 2026-07-16

Status: **FROZEN SNAPSHOT — NO-GO / NOT EXECUTABLE**

This is a documentary freeze only. It does not authorize or perform a deployment, push, SQL operation, data change, Kit write, campaign, or email. No branch, worktree, commit, deploy, or database operation was created by freezing this manifest.

## Freeze identity

- Published production base commit: `3d4e65a4cae1d3d93fa7b1873214279ccf677a82`
- Local repository HEAD: `006225a5555728e1ea8ee6408968e5b043a2be20`
- Candidate scope: published production base through local HEAD plus tracked working-tree and untracked paths
- Classified candidate paths: **473**
- Candidate-content SHA-256: `12fb2dde6b9c117f7e43a477dd77c37aec04b952c8efee7452c3feebed3506ed`
- Git-status SHA-256: `605d14cffaf919588d034027b672edb5a8abf42e4192ac092b81ed10fd90de8c`
- Netlify production deploy currently published: `6a5256cf1c7b49000807a71a`
- Verified rollback deploy: `6a5087522fb9ab000858a34b` at commit `788fecaa1be5b6a0d4cbcc79892fe1fa7992b561`

The manifest file itself is an administrative record created after the content digest and is not part of that frozen candidate digest.

## Blocking condition

The exact forward SQL set cannot be made executable because the required production-specific ownership RLS/grant migration and its exact restoration SQL do not exist as reviewed repository files. The staging RLS file is explicitly prohibited in production. The three mixed application files below also require hunk-level isolation before a release commit can exist:

- `src/config/featureFlags.ts`: include portal ownership/access-code compatibility flags only; exclude initial-goal work.
- `src/pages/AdminPortalPage.tsx`: include CRM/Auth/dashboard/navigation work only; exclude Question Bank wiring.
- `src/data/adminPortalContent.ts`: include approved CRM/Admin navigation only; exclude Question Bank navigation.

Until those artifacts are isolated and reviewed, the number of SQL migrations authorized for execution is **zero**.

## Planned SQL forward order after blockers are cleared

The following dependency order is frozen for rehearsal. Eleven concrete migration files exist; step 8 is deliberately unresolved and prevents execution:

1. `supabase/migrations/20260711000100_audience_crm_phase1_foundation.sql`
2. `supabase/migrations/20260711000200_audience_crm_phase2_workflows.sql`
3. `supabase/migrations/20260711000300_audience_crm_phase3_kit_automation.sql`
4. `supabase/migrations/20260713000200_family_signup_identity_integrity.sql`
5. `supabase/migrations/20260714000100_auth_portal_ownership.sql`
6. `supabase/migrations/20260714000300_portal_participant_rls_helper_hardening.sql`
7. `supabase/migrations/20260714000400_portal_participant_rls_recursion_fix.sql`
8. `MISSING — production-specific ownership RLS/grant migration and restoration SQL`
9. `supabase/migrations/20260714000500_portal_postgrest_schema_reload.sql`
10. `supabase/migrations/20260715000100_b4_variant_preference.sql`
11. `supabase/migrations/20260715000200_independent_family_child_creation.sql`
12. `supabase/migrations/20260715000400_b4_selection_onboarding.sql`

After each migration: reconcile the migration ledger/checksum and run its bounded schema/authorization postcheck before continuing. Never use a general migration push that could include excluded SQL.

## SQL explicitly excluded from forward execution

- `supabase/migrations/20260627_pilot_programs_protection_levels.sql`
- `supabase/migrations/20260628000100_pilot_program_code_transaction.sql`
- `supabase/migrations/20260628000200_repair_gdi_orphaned_program_code_refs.sql`
- `supabase/migrations/20260710_commerce_products.sql`
- `supabase/migrations/20260713000100_learning_engagement_foundation.sql`
- `supabase/migrations/20260714000200_staging_portal_ownership_rls.sql`
- `supabase/migrations/20260715000300_b4_selection_onboarding_legacy_staging.sql`
- `supabase/schema/production_legacy_baseline.sql`
- `supabase/schema/staging_legacy_rls.sql`
- `supabase/schema/staging_safety_gate.sql`
- `supabase/seeds/staging_fictional_seed.sql`
- `supabase/seeds/staging_fictional_cleanup.sql`
- `supabase/security/production_legacy_anon_lockdown_proposal.sql`
- `all files under supabase/audits/`
- `all files under supabase/rollbacks/ (rollback-only; never forward)`

Repository-only migration filename corrections, never SQL execution inputs:

- [DELETE] `supabase/migrations/20260628_pilot_program_code_transaction.sql`
- [DELETE] `supabase/migrations/20260628_repair_gdi_orphaned_program_code_refs.sql`
- [DELETE] `supabase/migrations/20260711_audience_crm_phase1_foundation.sql`
- [DELETE] `supabase/migrations/20260711_audience_crm_phase2_workflows.sql`
- [DELETE] `supabase/migrations/20260711_audience_crm_phase3_kit_automation.sql`
- [RETAIN AS HISTORY; DO NOT EXECUTE] `supabase/migrations/20260628000100_pilot_program_code_transaction.sql`
- [RETAIN AS HISTORY; DO NOT EXECUTE] `supabase/migrations/20260628000200_repair_gdi_orphaned_program_code_refs.sql`

## Netlify Functions in the proposed deploy (42)

Netlify packages every top-level function in the isolated release tree. `UNCHANGED` functions are carried forward from the published deploy, `MODIFY` functions change in this release, and `ADD` functions are new. Shared files under `netlify/functions/_lib/` are listed in the application-file section.

- [ADD] `admin-family-identity-diagnostic`
- [ADD] `admin-session`
- [UNCHANGED] `b4-chat`
- [ADD] `crm-activities`
- [ADD] `crm-bootstrap-admin`
- [ADD] `crm-classification-preview`
- [ADD] `crm-consent`
- [ADD] `crm-contact`
- [ADD] `crm-contacts`
- [ADD] `crm-create-contact`
- [ADD] `crm-email-performance`
- [ADD] `crm-evaluate-segments`
- [ADD] `crm-interest`
- [ADD] `crm-kit-diagnostics`
- [ADD] `crm-kit-metrics-sync`
- [ADD] `crm-kit-reconciliation`
- [ADD] `crm-lifecycle`
- [ADD] `crm-note`
- [ADD] `crm-organization`
- [ADD] `crm-organizations`
- [ADD] `crm-overview`
- [ADD] `crm-provider-actions`
- [ADD] `crm-provider-status`
- [ADD] `crm-provider-worker`
- [ADD] `crm-sync-activity`
- [ADD] `crm-task`
- [ADD] `family-child-progress`
- [ADD] `family-child-session`
- [ADD] `family-portal-children`
- [ADD] `kit-crm-webhook`
- [UNCHANGED] `notify-child-inactive-scheduled`
- [UNCHANGED] `notify-parent-push`
- [ADD] `pilot-family-signup`
- [ADD] `portal-b4-variant`
- [ADD] `portal-ownership-session`
- [UNCHANGED] `reset-student-pin`
- [UNCHANGED] `reveal-student-pin`
- [UNCHANGED] `save-push-subscription`
- [UNCHANGED] `send-push`
- [UNCHANGED] `send-welcome-email`
- [MODIFY] `sync-kit-event`
- [UNCHANGED] `verify-student-pin`

Excluded top-level functions: `admin-learning-content`, `learning-achievement-event`, `learning-content`, `weekly-learning-summary-scheduled`.

## Application path changes in the proposed deploy (145)

Statuses are relative to the currently published production commit. DELETE entries intentionally remove superseded runtime assets.

- [MODIFY] `.env.example`
- [MODIFY] `netlify.toml`
- [ADD] `netlify/functions/_lib/crmAuth.js`
- [ADD] `netlify/functions/_lib/crmClassifier.js`
- [ADD] `netlify/functions/_lib/crmHandlers.js`
- [ADD] `netlify/functions/_lib/crmWorkflowHandlers.js`
- [ADD] `netlify/functions/_lib/crmWorkflowRules.js`
- [ADD] `netlify/functions/_lib/emailMarketingProvider.js`
- [ADD] `netlify/functions/_lib/familyCompatibilityAuth.js`
- [ADD] `netlify/functions/_lib/kitLifecycleConfig.js`
- [ADD] `netlify/functions/_lib/kitReconciliation.js`
- [MODIFY] `netlify/functions/_lib/kitService.js`
- [ADD] `netlify/functions/_lib/kitV4Provider.js`
- [ADD] `netlify/functions/_lib/portalOwnershipAuth.js`
- [ADD] `netlify/functions/_lib/providerHandlers.js`
- [ADD] `netlify/functions/_lib/providerOutbox.js`
- [ADD] `public/assets/b4/anchor/blinking/b4-anchor-blinking.png`
- [ADD] `public/assets/b4/anchor/happy/b4-anchor-happy.png`
- [ADD] `public/assets/b4/anchor/hurt/b4-anchor-hurt.png`
- [ADD] `public/assets/b4/anchor/idle/b4-anchor-idle.png`
- [ADD] `public/assets/b4/courage/blinking/b4-courage-blinking.png`
- [ADD] `public/assets/b4/courage/happy/b4-courage-happy.png`
- [ADD] `public/assets/b4/courage/hurt/b4-courage-hurt.png`
- [ADD] `public/assets/b4/courage/idle/b4-courage-idle.png`
- [ADD] `public/assets/b4/fusion/blinking/b4-fusion-blinking.png`
- [ADD] `public/assets/b4/fusion/happy/b4-fusion-happy.png`
- [ADD] `public/assets/b4/fusion/hurt/b4-fusion-hurt.png`
- [ADD] `public/assets/b4/fusion/idle/b4-fusion-idle.png`
- [ADD] `public/assets/b4/pattern/blinking/b4-pattern-blinking.png`
- [ADD] `public/assets/b4/pattern/happy/b4-pattern-happy.png`
- [ADD] `public/assets/b4/pattern/hurt/b4-pattern-hurt.png`
- [ADD] `public/assets/b4/pattern/idle/b4-pattern-idle.png`
- [ADD] `public/assets/b4/shield/blinking/b4-shield-blinking.png`
- [ADD] `public/assets/b4/shield/happy/b4-shield-happy.png`
- [ADD] `public/assets/b4/shield/hurt/b4-shield-hurt.png`
- [ADD] `public/assets/b4/shield/idle/b4-shield-idle.png`
- [DELETE] `public/images/B-4FlightGame/Blinking/Blinking.png`
- [DELETE] `public/images/B-4FlightGame/Blinking/Blinking@2x.png`
- [DELETE] `public/images/B-4FlightGame/Blinking/Blinking@3x.png`
- [DELETE] `public/images/B-4FlightGame/Blinking/Blinking@4x.png`
- [DELETE] `public/images/B-4FlightGame/Happy/Happy.png`
- [DELETE] `public/images/B-4FlightGame/Happy/Happy@2x.png`
- [DELETE] `public/images/B-4FlightGame/Happy/Happy@3x.png`
- [DELETE] `public/images/B-4FlightGame/Happy/Happy@4x.png`
- [DELETE] `public/images/B-4FlightGame/Hurt/Hurt.png`
- [DELETE] `public/images/B-4FlightGame/Hurt/Hurt@2x.png`
- [DELETE] `public/images/B-4FlightGame/Hurt/Hurt@3x.png`
- [DELETE] `public/images/B-4FlightGame/Hurt/Hurt@4x.png`
- [DELETE] `public/images/B-4FlightGame/Idle/Idle.png`
- [DELETE] `public/images/B-4FlightGame/Idle/Idle@2x-transparent.png`
- [DELETE] `public/images/B-4FlightGame/Idle/Idle@2x.png`
- [DELETE] `public/images/B-4FlightGame/Idle/Idle@3x.png`
- [DELETE] `public/images/B-4FlightGame/Idle/Idle@4x-transparent.png`
- [DELETE] `public/images/B-4FlightGame/Idle/Idle@4x.png`
- [ADD] `src/components/admin/AdminGroupedNavigation.tsx`
- [MODIFY] `src/components/admin/admin-portal.css`
- [ADD] `src/components/admin/tabs/AdminCrmProviderTab.tsx`
- [ADD] `src/components/admin/tabs/AdminCrmTab.tsx`
- [ADD] `src/components/admin/tabs/AdminCrmWorkflowTab.tsx`
- [ADD] `src/components/admin/tabs/AdminDashboardTab.tsx`
- [ADD] `src/components/admin/tabs/AdminKitDiagnosticsTab.tsx`
- [MODIFY] `src/components/admin/tabs/AdminManageAccountsTab.tsx`
- [MODIFY] `src/components/b4-baseline-check/B4BaselineGradeGate.tsx`
- [MODIFY] `src/components/b4/B4BaselineCheckFlow.tsx`
- [ADD] `src/components/b4/B4CircleAvatar.tsx`
- [ADD] `src/components/b4/B4UnitOnboardingModal.tsx`
- [ADD] `src/components/b4/B4VariantSelector.tsx`
- [ADD] `src/components/b4/b4-circle-avatar.css`
- [ADD] `src/components/b4/b4-variant-selector.css`
- [MODIFY] `src/components/caiden/CaidenFocusQuestHub.tsx`
- [MODIFY] `src/components/caiden/CaidenQuestFlow.tsx`
- [ADD] `src/components/family-portal/FamilyChildB4Control.tsx`
- [MODIFY] `src/components/family-portal/FamilyChildGradeConfig.tsx`
- [MODIFY] `src/components/family-portal/FamilyChildSummaryCard.tsx`
- [MODIFY] `src/components/family-portal/FamilyChildrenDashboardGrid.tsx`
- [MODIFY] `src/components/family-portal/FamilyMissionCoachPanel.tsx`
- [MODIFY] `src/components/family-portal/FocusFlameProfileReadyCard.tsx`
- [MODIFY] `src/components/family-portal/StartChildGameButton.tsx`
- [MODIFY] `src/components/family-portal/family-dashboard.css`
- [MODIFY] `src/components/family-portal/panels/FamilyContinueLearningPanel.tsx`
- [MODIFY] `src/components/family-portal/panels/FamilyProgramSettingsPanel.tsx`
- [MODIFY] `src/components/family-portal/panels/FamilyWeeklyAdventuresLauncher.tsx`
- [MODIFY] `src/components/family-portal/settings/SettingsPageLayout.tsx`
- [MODIFY] `src/components/game-assessment/GameAssessmentFlow.tsx`
- [MODIFY] `src/components/kid-play-shell/B4FocusFlightUnlockModal.tsx`
- [MODIFY] `src/components/kid-play-shell/KidArcadePanel.tsx`
- [ADD] `src/components/kid-play-shell/KidPlayB4ProfileControl.tsx`
- [MODIFY] `src/components/kid-play-shell/KidPlayShellNav.tsx`
- [MODIFY] `src/components/kid-play-shell/kid-play-shell-nav.css`
- [MODIFY] `src/components/kid-play-shell/kid-play-shell.css`
- [MODIFY] `src/components/pilot-program/PilotProgramSignupForm.tsx`
- [MODIFY] `src/config/featureFlags.ts`
- [MODIFY] `src/context/ActiveParticipantContext.tsx`
- [ADD] `src/context/AdminAuthContext.tsx`
- [MODIFY] `src/data/adminPortalContent.ts`
- [MODIFY] `src/data/b4/avatar.ts`
- [ADD] `src/data/b4/variantManifest.ts`
- [ADD] `src/data/caiden/focusFlameChallenges.ts`
- [MODIFY] `src/data/caiden/index.ts`
- [MODIFY] `src/games/b4-focus-flight/B4FocusFlightGame.tsx`
- [MODIFY] `src/games/b4-focus-flight/B4FocusFlightPage.tsx`
- [MODIFY] `src/games/b4-focus-flight/components/GameResults.tsx`
- [MODIFY] `src/games/b4-focus-flight/components/GameShell.tsx`
- [ADD] `src/games/b4-focus-flight/phaser/B4FlightStateMachine.ts`
- [MODIFY] `src/games/b4-focus-flight/phaser/assetKeys.ts`
- [MODIFY] `src/games/b4-focus-flight/phaser/createGame.ts`
- [MODIFY] `src/games/b4-focus-flight/phaser/scenes/GameScene.ts`
- [MODIFY] `src/games/b4-focus-flight/phaser/scenes/PreloadScene.ts`
- [ADD] `src/hooks/useB4Variant.ts`
- [MODIFY] `src/hooks/useQuestionInteraction.ts`
- [MODIFY] `src/index.js`
- [MODIFY] `src/lib/adventureWeekProgress.ts`
- [MODIFY] `src/lib/appVersion.ts`
- [MODIFY] `src/lib/assessmentResultsService.ts`
- [MODIFY] `src/lib/b4BaselineCheckStorage.ts`
- [MODIFY] `src/lib/b4CheckInStatus.ts`
- [MODIFY] `src/lib/b4FocusFlightUnlock.ts`
- [ADD] `src/lib/b4VariantService.ts`
- [MODIFY] `src/lib/childProfileService.ts`
- [ADD] `src/lib/crmApi.ts`
- [ADD] `src/lib/crmProviderApi.ts`
- [ADD] `src/lib/crmWorkflowApi.ts`
- [ADD] `src/lib/familyChildProgressApi.ts`
- [ADD] `src/lib/familyChildSessionApi.ts`
- [MODIFY] `src/lib/familyKidPlayLaunch.ts`
- [ADD] `src/lib/familyPortalChildrenApi.ts`
- [MODIFY] `src/lib/gameAssessmentValidation.ts`
- [MODIFY] `src/lib/getCourageInTheDarkProgress.ts`
- [MODIFY] `src/lib/hydrateExistingFamilyChildren.ts`
- [MODIFY] `src/lib/independentFamilyPortalSignup.ts`
- [MODIFY] `src/lib/kidPlaySessionService.ts`
- [MODIFY] `src/lib/launchFamilyKidPlay.ts`
- [MODIFY] `src/lib/participantGradeService.ts`
- [MODIFY] `src/lib/pilotProgramService.ts`
- [MODIFY] `src/lib/pilotTrackingService.ts`
- [ADD] `src/lib/portalOwnershipSession.ts`
- [MODIFY] `src/lib/recordInteractiveCompletion.ts`
- [MODIFY] `src/lib/week0AssessmentStorage.ts`
- [MODIFY] `src/pages/AdminPortalPage.tsx`
- [MODIFY] `src/pages/AdminRouteLayout.tsx`
- [MODIFY] `src/pages/CaidenQuestPage.tsx`
- [MODIFY] `src/pages/KidPlaySessionLayout.tsx`
- [MODIFY] `src/pages/PilotProgramSignupPage.tsx`
- [MODIFY] `src/types/gameAssessment.ts`
- [MODIFY] `src/types/pilotProgram.ts`

## Verification/support files retained in release source but not deployed (74)

These files support review and tests. They are not SQL execution inputs or Netlify runtime artifacts.

- `docs/activation/crm-activation-verification-log.md`
- `docs/activation/crm-rls-authorization-verification.md`
- `docs/activation/crm-staging-activation-report.md`
- `docs/activation/kit-read-only-verification.md`
- `docs/deployment/final-go-no-go.md`
- `docs/deployment/narrow-release-readiness-2026-07-16.md`
- `docs/deployment/production-final-manifest.md`
- `docs/deployment/production-preflight-2026-07-16.md`
- `docs/deployment/release-approved-files-2026-07-16.md`
- `docs/deployment/release-excluded-files-2026-07-16.md`
- `docs/deployment/sql-environment-manifest.md`
- `docs/implementation/admin-supabase-auth-integration.md`
- `docs/implementation/audience-crm-four-phase-log.md`
- `docs/implementation/audience-crm-phase-1-log.md`
- `docs/implementation/audience-crm-phases-2-3-log.md`
- `docs/implementation/b4-flight-state-system.md`
- `docs/implementation/b4-variant-system.md`
- `docs/implementation/focus-flame-challenges-week-3-9.md`
- `docs/runbooks/admin-auth-rollback.md`
- `docs/runbooks/audience-crm-phase-1-rollback.md`
- `docs/runbooks/kit-provider-rollback.md`
- `docs/security/admin-authentication.md`
- `docs/security/audience-crm-consent-and-provider-security.md`
- `docs/security/audience-crm-phase-1-security.md`
- `docs/security/legacy-direct-access-debt-nonblocking.md`
- `docs/security/portal-auth-ownership-transition.md`
- `docs/security/production-public-api-rls-proposal.md`
- `src/components/pilot-program/PilotProgramSignupForm.test.tsx`
- `src/lib/__tests__/adminSessionEndpoint.test.ts`
- `src/lib/__tests__/b4CheckInParticipantScope.test.ts`
- `src/lib/__tests__/b4CircleAvatar.test.tsx`
- `src/lib/__tests__/b4OnboardingExperience.test.tsx`
- `src/lib/__tests__/b4VariantSystem.test.ts`
- `src/lib/__tests__/changedReleaseDataPaths.test.ts`
- `src/lib/__tests__/crmPhase1Auth.test.ts`
- `src/lib/__tests__/crmPhase1Classifier.test.ts`
- `src/lib/__tests__/crmPhase1Endpoints.test.ts`
- `src/lib/__tests__/crmPhase1Migration.test.ts`
- `src/lib/__tests__/crmPhase1UiSafety.test.ts`
- `src/lib/__tests__/crmPhase2Consent.test.ts`
- `src/lib/__tests__/crmPhase2Migration.test.ts`
- `src/lib/__tests__/crmPhase2ProviderContract.test.ts`
- `src/lib/__tests__/crmPhase2Segments.test.ts`
- `src/lib/__tests__/crmPhase3KitContract.test.ts`
- `src/lib/__tests__/crmPhase3Migration.test.ts`
- `src/lib/__tests__/crmPhase3Outbox.test.ts`
- `src/lib/__tests__/crmPhase3Reconciliation.test.ts`
- `src/lib/__tests__/crmPhase3Webhook.test.ts`
- `src/lib/__tests__/familyChildB4Cards.test.tsx`
- `src/lib/__tests__/familyChildProgressEndpoint.test.ts`
- `src/lib/__tests__/familyChildSessionEndpoint.test.ts`
- `src/lib/__tests__/familyChildrenHydration.test.ts`
- `src/lib/__tests__/familyPortalChildLinkageRegression.test.tsx`
- `src/lib/__tests__/familyPortalChildrenEndpoint.test.ts`
- `src/lib/__tests__/familySignupProgressRegression.test.ts`
- `src/lib/__tests__/familySignupReleaseGuards.test.ts`
- `src/lib/__tests__/focusFlameChallenges.test.ts`
- `src/lib/__tests__/kidPlayB4ProfileControl.test.tsx`
- `src/lib/__tests__/pilotFamilySignupClient.test.ts`
- `src/lib/__tests__/pilotFamilySignupEndpoint.test.ts`
- `src/lib/__tests__/portalB4VariantEndpoint.test.ts`
- `src/lib/__tests__/portalOwnershipAuth.test.ts`
- `src/lib/__tests__/productionLegacyBaseline.test.js`
- `src/lib/__tests__/stagingSafetyGate.test.js`
- `src/pages/PilotProgramSignupPage.test.tsx`
- `supabase/migrations/20260628000100_pilot_program_code_transaction.sql`
- `supabase/migrations/20260628000200_repair_gdi_orphaned_program_code_refs.sql`
- `supabase/rollbacks/20260713000200_family_signup_identity_integrity_rollback.sql`
- `supabase/rollbacks/20260714000100_auth_portal_ownership_rollback.sql`
- `supabase/rollbacks/20260714000200_staging_portal_ownership_rls_rollback.sql`
- `supabase/rollbacks/20260714000300_portal_participant_rls_helper_hardening_rollback.sql`
- `supabase/rollbacks/20260714000400_portal_participant_rls_recursion_fix_rollback.sql`
- `supabase/rollbacks/20260714000500_portal_postgrest_schema_reload_rollback.sql`
- `supabase/rollbacks/20260715000100_b4_variant_preference.rollback.sql`

## Files excluded from the release candidate (203)

### Unrelated work (79)

- `deno.lock`
- `docs/CONTENT_ENGINE.md`
- `docs/KIT_AUTOMATION_SETUP.md`
- `docs/STAGING_SUPABASE_SETUP.md`
- `docs/activation/crm-isolated-migration-report.md`
- `docs/activation/full-expansion-readiness.md`
- `docs/activation/kit-segment-mapping-proposal.md`
- `docs/activation/kit-write-canary-plan.md`
- `docs/activation/legacy-staging-provisioning-report.md`
- `docs/activation/narrow-critical-deployment-manifest.md`
- `docs/architecture/audience-crm-implementation-blueprint.md`
- `docs/architecture/audience-crm-phase-1-runtime.md`
- `docs/architecture/audience-crm-phase-2-runtime.md`
- `docs/architecture/audience-crm-phase-3-runtime.md`
- `docs/content/week-3-9-question-coverage.md`
- `docs/content/week-3-9-question-review.md`
- `docs/implementation/learning-engagement-phases-1-3.md`
- `docs/integrations/kit-api-setup.md`
- `docs/integrations/kit-capability-matrix.md`
- `docs/integrations/kit-mcp-setup.md`
- `docs/runbooks/audience-crm-phase-1-local-setup.md`
- `docs/runbooks/kit-metrics-sync.md`
- `docs/runbooks/kit-provider-sync.md`
- `docs/runbooks/kit-subscriber-reconciliation.md`
- `docs/runbooks/kit-webhooks.md`
- `netlify/functions/_lib/achievementService.js`
- `netlify/functions/_lib/learningContent.js`
- `netlify/functions/_lib/weeklyLearningSummary.js`
- `netlify/functions/admin-learning-content.js`
- `netlify/functions/learning-achievement-event.js`
- `netlify/functions/learning-content.js`
- `netlify/functions/weekly-learning-summary-scheduled.js`
- `package-lock.json`
- `package.json`
- `src/components/admin/tabs/AdminQuestionBankTab.tsx`
- `src/components/family-portal/FamilyParentOnboardingGate.tsx`
- `src/components/family-portal/panels/FamilyOverviewPanel.tsx`
- `src/components/kid-play-shell/KidPlayShellPage.tsx`
- `src/components/learning/MilestoneCelebration.tsx`
- `src/components/learning/QuestionBankExperience.tsx`
- `src/components/learning/QuestionBankRoute.tsx`
- `src/components/learning/question-bank-experience.css`
- `src/components/onboarding/DashboardOnboardingCard.tsx`
- `src/components/onboarding/dashboard-onboarding-card.css`
- `src/components/pilot-dashboard/panels/PilotOverviewPanel.tsx`
- `src/data/b4/b4AdaptiveBuilder.ts`
- `src/data/b4/b4AdaptiveMissions.ts`
- `src/data/b4/b4AdaptiveRegistry.ts`
- `src/data/caiden/questAdaptiveCampLeaderChallenge.ts`
- `src/data/charlie/charlieAdaptiveBuilder.ts`
- `src/data/charlie/charlieAdaptiveMissions.ts`
- `src/data/charlie/charlieAdaptiveRegistry.ts`
- `src/data/familyPortalContent.ts`
- `src/data/familyPortalNavMetadata.ts`
- `src/data/zeke/zekeAdaptiveBuilder.ts`
- `src/data/zeke/zekeAdaptiveMissions.ts`
- `src/data/zeke/zekeAdaptiveRegistry.ts`
- `src/design-system/components/MissionCoachCard.tsx`
- `src/design-system/components/mission-coach-card.css`
- `src/hooks/useDashboardOnboarding.ts`
- `src/hooks/useProgramGoalsOnboarding.ts`
- `src/lib/__tests__/goalSelectionLaunchReadiness.test.ts`
- `src/lib/__tests__/learningContentServer.test.ts`
- `src/lib/__tests__/learningEngagementServices.test.ts`
- `src/lib/__tests__/questionAuditInitialization.test.ts`
- `src/lib/__tests__/questionBankResolver.test.ts`
- `src/lib/__tests__/questionImport.test.ts`
- `src/lib/achievementEvents.ts`
- `src/lib/completeMissionWithSupabase.ts`
- `src/lib/familyPortalNav.ts`
- `src/lib/learningContentApi.ts`
- `src/lib/programGoalsService.ts`
- `src/lib/questionBankResolver.ts`
- `src/lib/questionImport.ts`
- `src/pages/AdminAdventurePreviewPage.tsx`
- `src/pages/DesignSystemPage.tsx`
- `src/routes/kidPlayShellChildRoutes.tsx`
- `supabase/migrations/20260713000100_learning_engagement_foundation.sql`
- `yarn.lock`

### Generated or local-only artifacts (124)

- `docs/activation/screenshots/staging-signup-ready.png`
- `docs/audits/PRODUCTION_SCHEMA_INVENTORY.md`
- `docs/audits/audience-crm-email-audit.md`
- `docs/audits/kit-read-only-result.json`
- `docs/audits/production-schema-inventory.json`
- `docs/audits/staging-portal-ownership-result.json`
- `docs/audits/staging-state-inventory.json`
- `public/images/B-4FlightGame/B-4-units/B-4-anchor/Blinking/blinking-fusion_1@2x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-anchor/Blinking/blinking-fusion_1@3x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-anchor/Blinking/blinking-fusion_1@4x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-anchor/Blinking/blinking-fusion_1@caiden.png`
- `public/images/B-4FlightGame/B-4-units/B-4-anchor/Happy/happy-fusion_1@2x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-anchor/Happy/happy-fusion_1@3x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-anchor/Happy/happy-fusion_1@4x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-anchor/Happy/happy-fusion_1@caiden.png`
- `public/images/B-4FlightGame/B-4-units/B-4-anchor/Hurt/hurt-anchor@2x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-anchor/Hurt/hurt-anchor@3x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-anchor/Hurt/hurt-anchor@4x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-anchor/Hurt/hurt-anchor@caiden.png`
- `public/images/B-4FlightGame/B-4-units/B-4-anchor/Idle/idle-fusion_1@2x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-anchor/Idle/idle-fusion_1@3x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-anchor/Idle/idle-fusion_1@4x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-anchor/Idle/idle-fusion_1@caiden.png`
- `public/images/B-4FlightGame/B-4-units/B-4-courage/Blinking/Blinking.png`
- `public/images/B-4FlightGame/B-4-units/B-4-courage/Blinking/Blinking@2x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-courage/Blinking/Blinking@3x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-courage/Blinking/Blinking@4x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-courage/Happy/Happy.png`
- `public/images/B-4FlightGame/B-4-units/B-4-courage/Happy/Happy@2x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-courage/Happy/Happy@3x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-courage/Happy/Happy@4x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-courage/Hurt/Hurt.png`
- `public/images/B-4FlightGame/B-4-units/B-4-courage/Hurt/Hurt@2x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-courage/Hurt/Hurt@3x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-courage/Hurt/Hurt@4x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-courage/Idle/Idle.png`
- `public/images/B-4FlightGame/B-4-units/B-4-courage/Idle/Idle@2x-transparent.png`
- `public/images/B-4FlightGame/B-4-units/B-4-courage/Idle/Idle@2x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-courage/Idle/Idle@3x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-courage/Idle/Idle@4x-transparent.png`
- `public/images/B-4FlightGame/B-4-units/B-4-courage/Idle/Idle@4x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-fusion/Blinking/blinking-fusion@2x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-fusion/Blinking/blinking-fusion@3x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-fusion/Blinking/blinking-fusion@4x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-fusion/Blinking/blinking-fusion@caiden.png`
- `public/images/B-4FlightGame/B-4-units/B-4-fusion/Happy/happy-fusion@2x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-fusion/Happy/happy-fusion@3x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-fusion/Happy/happy-fusion@4x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-fusion/Happy/happy-fusion@caiden.png`
- `public/images/B-4FlightGame/B-4-units/B-4-fusion/Hurt/hurt-fusion@2x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-fusion/Hurt/hurt-fusion@3x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-fusion/Hurt/hurt-fusion@4x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-fusion/Hurt/hurt-fusion@caiden.png`
- `public/images/B-4FlightGame/B-4-units/B-4-fusion/Idle/idle-fusion@2x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-fusion/Idle/idle-fusion@3x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-fusion/Idle/idle-fusion@4x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-fusion/Idle/idle-fusion@caiden.png`
- `public/images/B-4FlightGame/B-4-units/B-4-pattern/Blinking/blinking-pattern@2x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-pattern/Blinking/blinking-pattern@3x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-pattern/Blinking/blinking-pattern@4x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-pattern/Blinking/blinking-pattern@caiden.png`
- `public/images/B-4FlightGame/B-4-units/B-4-pattern/Happy/happy-pattern@2x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-pattern/Happy/happy-pattern@3x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-pattern/Happy/happy-pattern@4x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-pattern/Happy/happy-pattern@caiden.png`
- `public/images/B-4FlightGame/B-4-units/B-4-pattern/Hurt/hurt-pattern@2x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-pattern/Hurt/hurt-pattern@3x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-pattern/Hurt/hurt-pattern@4x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-pattern/Hurt/hurt-pattern@caiden.png`
- `public/images/B-4FlightGame/B-4-units/B-4-pattern/Idle/idle-pattern@2x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-pattern/Idle/idle-pattern@3x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-pattern/Idle/idle-pattern@4x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-pattern/Idle/idle-pattern@caiden.png`
- `public/images/B-4FlightGame/B-4-units/B-4-shield/Blinking/blinking-shield@2x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-shield/Blinking/blinking-shield@3x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-shield/Blinking/blinking-shield@4x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-shield/Blinking/blinking-shield@caiden.png`
- `public/images/B-4FlightGame/B-4-units/B-4-shield/Happy/happy-shield@2x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-shield/Happy/happy-shield@3x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-shield/Happy/happy-shield@4x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-shield/Happy/happy-shield@caiden.png`
- `public/images/B-4FlightGame/B-4-units/B-4-shield/Hurt/hurt-shield@2x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-shield/Hurt/hurt-shield@3x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-shield/Hurt/hurt-shield@4x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-shield/Hurt/hurt-shield@caiden.png`
- `public/images/B-4FlightGame/B-4-units/B-4-shield/Idle/idle-shield@2x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-shield/Idle/idle-shield@3x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-shield/Idle/idle-shield@4x.png`
- `public/images/B-4FlightGame/B-4-units/B-4-shield/Idle/idle-shield@caiden.png`
- `public/local-cache-reset.html`
- `reports/question-audit.json`
- `reports/question-audit.md`
- `reports/question-audit.pdf`
- `reports/question-duplicates-action-plan.md`
- `reports/question-quality-next-pass.md`
- `reports/question-rewrite-priority.md`
- `scripts/applyStagingDatabaseOperation.js`
- `scripts/assertStagingDatabaseSafety.js`
- `scripts/buildB4RuntimeAssets.js`
- `scripts/diagnoseStagingFamilyLinkage.js`
- `scripts/generateProductionLegacyBaseline.js`
- `scripts/inventoryStagingState.js`
- `scripts/inventorySupabaseSchema.js`
- `scripts/lib/stagingSafetyGate.js`
- `scripts/question-audit/generateWeek3To9Review.ts`
- `scripts/verifyKitReadOnly.js`
- `scripts/verifyProductionAnonymousAccess.js`
- `scripts/verifyStagingB4Variant.js`
- `scripts/verifyStagingFamilySignup.js`
- `scripts/verifyStagingFixture.js`
- `scripts/verifyStagingLegacyRls.js`
- `scripts/verifyStagingPortalOwnership.js`
- `src/test-fixtures/kitWebhookFixtures.ts`
- `supabase/.gitignore`
- `supabase/audits/20260628_london_gdi_duplicate_dry_run.sql`
- `supabase/audits/20260628_london_gdi_review_first_merge.sql`
- `supabase/audits/20260713_family_signup_student_identity_dry_run.sql`
- `supabase/config.toml`
- `supabase/schema/production_legacy_baseline.sql`
- `supabase/schema/staging_legacy_rls.sql`
- `supabase/schema/staging_safety_gate.sql`
- `supabase/security/production_legacy_anon_lockdown_proposal.sql`
- `supabase/seeds/staging_fictional_cleanup.sql`
- `supabase/seeds/staging_fictional_seed.sql`

## Exact future execution order

No step below is authorized by this document.

1. Recreate this candidate in an isolated release worktree from published production commit `3d4e65a4cae1d3d93fa7b1873214279ccf677a82`; apply only the allowlisted paths and the three approved hunk selections.
2. Add and review the missing production-specific RLS/grant forward migration and exact restoration SQL; update this manifest with their real filenames and checksums.
3. Recompute the candidate digest; require zero unclassified paths, zero secrets, zero staging references, zero personal paths, and unique migration versions.
4. Run type-check, lint, targeted tests, full tests, production build, function inventory, asset validation, and changed-data-path checks against the isolated commit.
5. Rehearse the exact SQL sequence above on production-shaped non-production data, including restoration; stop on drift, unexpected objects, failed denials, or rollback mismatch.
6. Obtain explicit approval for the exact release commit, backup/PITR checkpoint, maintenance window, SQL checksums, and rollback owners.
7. Verify production project identity and close normal write traffic for the approved maintenance window.
8. Apply SQL steps 1–12 one at a time, with ledger/checksum and bounded postchecks after each step.
9. Deploy the isolated application commit to Netlify with all Kit/provider/write/sync/webhook/campaign/email flags false.
10. Verify function inventory, Admin Auth/CRM, family signup, child creation/session/progress, B-4 persistence/Flight, Focus Flame Weeks 3–9, anonymous denial, cross-family denial, and no provider writes.
11. Reopen traffic only after the independent verifier signs the smoke/authorization matrix.
12. If a stop condition occurs, republish rollback deploy `6a5087522fb9ab000858a34b` without rebuilding and execute only the separately reviewed restoration plan appropriate to the failed database step.

## Freeze conclusion

**NO-GO.** The file inventory is exact at the frozen path level, but the release is not executable until the missing production RLS/restoration artifacts exist and the three mixed files are isolated. Production and staging were untouched.
