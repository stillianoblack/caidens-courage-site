# Final pre-execution RLS validation — 2026-07-16

## Decision

**NO-GO**

The production-specific RLS migration must not be executed. Required family, child, facilitator, Admin, game, assessment, progress, reward, gallery, goal, and session workflows still make direct browser requests with the public Supabase client. A validated legacy program/access code is application data; it does not turn that browser request into a Supabase Auth ownership session. The proposed migration removes anonymous access and all browser writes from the 16 affected tables, so those paths would fail.

The isolated release candidate also fails type-check, full tests, the production build, and the protected-data-path test because required release dependencies were omitted. No executable production-schema clone is available in the repository or local toolchain, so the requested database rehearsal could not be performed without touching a hosted database.

No SQL was executed and neither hosted environment was queried or modified during this validation.

## SQL review

### Forward migration

File: `supabase/migrations/20260714000450_production_portal_ownership_rls.sql`

| Lines | Review result |
|---|---|
| 1–8 | Correctly states production-only intent, clone rehearsal requirement, authenticated ownership reads, and server-only writes. |
| 10–22 | Fails closed if any of the four required `private.portal_can_access_*` helpers is absent. |
| 24–115 | Embeds the captured 16-table/58-policy production inventory. Names match the sanitized inventory, including the unusual trailing quote in the first `assessment_results` policy. |
| 117–130 | Correct table-existence and RLS-enabled prechecks. |
| 132–143 | Exact sorted policy-set comparison is drift-sensitive and fails closed. |
| 145–159 | Requires effective SELECT/INSERT/UPDATE/DELETE privileges for `anon`, `authenticated`, and `service_role` before proceeding. This verifies effective privileges, not original grant provenance. |
| 164–205 | Drops all current policies, revokes `public`/`anon`/`authenticated`, grants authenticated SELECT only and service-role CRUD. These DDL statements are transactional when applied as a migration. |
| 207–272 | Creates exactly one ownership-scoped SELECT policy on each of 16 tables. No authenticated write policy or Admin override exists. |
| 274–321 | Checks one named policy per table, no anonymous CRUD, and authenticated SELECT-only. It does not explicitly postcheck service-role CRUD, although the preceding GRANT supplies it. |

Static conclusion: the SQL is internally coherent for an architecture in which every write and every legacy-credential access is server-mediated. The current application does not yet satisfy that condition. It also removes direct authenticated Admin writes because the policy helper is ownership-based and no internal-Admin policy is created.

### Restoration SQL

File: `supabase/rollbacks/20260714000450_production_portal_ownership_rls_rollback.sql`

| Lines | Review result |
|---|---|
| 1–3 | Correctly marked rehearsal/rollback only. |
| 4–44 | Requires exactly one `portal_ownership_select` policy on each table, drops it, and restores effective CRUD grants to `anon`, `authenticated`, and `service_role`. |
| 46–175 | Recreates all 58 captured policies with the captured names, commands, roles, `USING`, and `WITH CHECK` expressions. |
| 177 | Correctly leaves `question_attempts` with no policies while RLS remains enabled. |

Static limitation: this is a **one-time restoration script**, not idempotent. A second run fails its policy precheck. It restores captured effective CRUD behavior, but cannot prove the original ACL/grant provenance because the sanitized inventory contains effective privileges rather than raw ACL entries or grantor metadata.

## Access matrix

Legend: **Auth** = Supabase Auth ownership; **Legacy** = validated compatibility program/access credentials; **Service** = service-role function; **Anon** = direct browser public client. “Breaks” means at least one required path is not server-mediated after the proposed migration.

| Table | Current production behavior | Proposed behavior | Access modes observed | Post-migration result |
|---|---|---|---|---|
| `pilot_programs` | Public/anon/auth unconditional SELECT, INSERT, UPDATE | Auth ownership SELECT; Service CRUD; no Anon | Auth, Legacy, Service, Anon | **Breaks** |
| `participants` | Public/anon/auth unconditional SELECT, INSERT, UPDATE | Auth ownership SELECT; Service CRUD; no Anon | Auth, Legacy, Service, Anon | **Breaks** |
| `student_family_links` | Anon/auth SELECT, INSERT, UPDATE | Auth ownership SELECT; Service CRUD; no Anon | Auth, Legacy, Service, Anon | **Breaks** |
| `assessment_results` | Public and anon/auth unconditional SELECT/INSERT | Auth ownership SELECT; Service CRUD; no Anon | Legacy, Service, Anon | **Breaks** |
| `assessment_results_v2` | Public and anon/auth unconditional SELECT/INSERT | Auth ownership SELECT; Service CRUD; no Anon | Legacy, Service, Anon | **Breaks** |
| `module_results` | Public and anon/auth unconditional SELECT/INSERT | Auth ownership SELECT; Service CRUD; no Anon | Legacy, Service, Anon | **Breaks** |
| `player_progress` | Auth-UID ownership plus unconditional anon/auth SELECT/INSERT | Auth participant ownership SELECT; Service CRUD; no Anon | Auth, Legacy, Service, Anon | **Breaks** |
| `player_wallets` | Auth-UID ownership plus unconditional anon/auth SELECT/INSERT/UPDATE | Auth participant ownership SELECT; Service CRUD; no Anon | Auth, Legacy, Service, Anon | **Breaks** |
| `player_badges` | Auth-UID ownership plus unconditional anon/auth SELECT/INSERT | Auth participant ownership SELECT; Service CRUD; no Anon | Auth, Legacy, Service, Anon | **Breaks** |
| `player_reward_claims` | Anon/auth ALL with unconditional predicates | Auth participant ownership SELECT; Service CRUD; no Anon | Legacy, Anon | **Breaks** |
| `kid_play_sessions` | Anon/auth SELECT, INSERT, UPDATE | Auth participant ownership SELECT; Service CRUD; no Anon | Legacy, Service, Anon | **Breaks** |
| `participant_ui_state` | Anon/auth SELECT, INSERT, UPDATE | Auth participant ownership SELECT; Service CRUD; no Anon | Legacy, Anon | **Breaks** |
| `program_goals` | Public ALL plus anon/auth SELECT, INSERT, UPDATE | Auth program ownership SELECT; Service CRUD; no Anon | Legacy, Anon | **Breaks** |
| `family_child_goals` | Anon SELECT, INSERT, UPDATE | Auth participant ownership SELECT; Service CRUD; no Anon | Legacy, Anon | **Breaks** |
| `question_attempts` | RLS enabled with no policies; browser grants ineffective | Auth participant ownership SELECT; Service CRUD; no Anon | Legacy, Service, Anon | Changed Focus Flame path works; generic direct insert still breaks |
| `student_gallery_items` | Anon SELECT, INSERT, UPDATE | Auth program/family ownership SELECT; Service CRUD; no Anon | Legacy, Anon | **Breaks** |

### Per-table code evidence

All listed frontend services use `src/lib/supabaseClient.js` unless explicitly described as a function API. That client is initialized from `REACT_APP_SUPABASE_ANON_KEY`; therefore its requests are anonymous unless a real Supabase Auth session is attached. Legacy codes stored in application/session state do not change the JWT role.

#### `pilot_programs`

- Frontend reads/writes: `src/lib/adminEmergencyAddStudentService.ts`, `src/lib/adminPilotCleanupService.ts`, `src/lib/familyClaimByCodeService.ts`, `src/lib/familyDashboardDataService.ts`, `src/lib/familyProgramDisplayNameService.ts`, `src/lib/galleryProgramSettings.ts`, `src/lib/parentChildLinkFromCampService.ts`, `src/lib/parentClaimFamilyPortalService.ts`, `src/lib/pilotProgramService.ts`, `src/lib/portalAccessResolve.ts`, `src/lib/pushSubscriptionService.ts`.
- Functions: `netlify/functions/_lib/crmClassifier.js`, `netlify/functions/_lib/familyCompatibilityAuth.js`, `netlify/functions/portal-b4-variant.js`, `netlify/functions/save-push-subscription.js`, `netlify/functions/verify-student-pin.js`.
- Evidence: functions use service role; compatibility authorization validates submitted program/access codes server-side. Direct family/facilitator/Admin browser services still read or mutate the table anonymously. Result: **not safe**.

#### `participants`

- Frontend reads/writes: `src/lib/adminEmergencyAddStudentService.ts`, `src/lib/adminPilotCleanupService.ts`, `src/lib/campChildOnboarding.ts`, `src/lib/familyClaimByCodeService.ts`, `src/lib/familyResultsService.ts`, `src/lib/inviteParentForStudent.ts`, `src/lib/kidPlayReturnSessionVerify.ts`, `src/lib/kitParentEmails.ts`, `src/lib/participantGradeService.ts`, `src/lib/participantReassignmentService.ts`, `src/lib/pilotProgramAdminScale.ts`, `src/lib/pilotTrackingService.ts`, `src/lib/studentFamilyLinkService.ts`, `src/lib/studentPinService.ts`.
- Functions: `netlify/functions/_lib/crmClassifier.js`, `netlify/functions/_lib/studentPinPersistence.js`, `netlify/functions/_lib/weeklyLearningSummary.js`, `netlify/functions/admin-family-identity-diagnostic.js`, `netlify/functions/family-child-progress.js`, `netlify/functions/family-child-session.js`, `netlify/functions/family-portal-children.js`, `netlify/functions/portal-b4-variant.js`, `netlify/functions/reset-student-pin.js`, `netlify/functions/reveal-student-pin.js`, `netlify/functions/verify-student-pin.js`.
- Evidence: the named family endpoints are Service + validated Legacy/Auth and remain viable. Direct grade, tracking, reassignment, PIN, family linkage, facilitator, and Admin paths remain Anon. Result: **not safe**.

#### `student_family_links`

- Frontend reads/writes: `src/lib/adminPilotCleanupService.ts`, `src/lib/familyClaimByCodeService.ts`, `src/lib/kidPlayReturnSessionVerify.ts`, `src/lib/kitParentEmails.ts`, `src/lib/pilotTrackingService.ts`, `src/lib/studentFamilyLinkService.ts`, `src/lib/studentPinService.ts`.
- Functions: `netlify/functions/_lib/crmClassifier.js`, `netlify/functions/admin-family-identity-diagnostic.js`, `netlify/functions/family-portal-children.js`, `netlify/functions/reset-student-pin.js`, `netlify/functions/reveal-student-pin.js`.
- Evidence: family child listing and PIN endpoints are Service-mediated, but direct linking, tracking, Admin cleanup, and compatibility lookups are not. Result: **not safe**.

#### `assessment_results`

- Frontend reads/writes: `src/lib/adminPilotCleanupService.ts`, `src/lib/assessmentResultsService.ts`, `src/lib/b4CheckInStatus.ts`, `src/lib/familyDashboardDataService.ts`, `src/lib/familyResultsService.ts`, `src/lib/participantReassignmentService.ts`.
- Functions: none directly.
- Evidence: `assessmentResultsService.ts` routes only the compatibility baseline branch through `family-child-session`; general assessment reads/inserts remain direct Anon. Result: **not safe**.

#### `assessment_results_v2`

- Frontend reads/writes: `src/lib/adminPilotCleanupService.ts`, `src/lib/assessmentResultsService.ts`, `src/lib/b4CheckInStatus.ts`, `src/lib/familyResultsService.ts`, `src/lib/pilotTrackingService.ts`.
- Functions: `netlify/functions/_lib/achievementService.js`, `netlify/functions/_lib/weeklyLearningSummary.js`, `netlify/functions/admin-family-identity-diagnostic.js`, `netlify/functions/family-child-session.js`.
- Evidence: family baseline completion through `family-child-session` is Service + Legacy; general assessment and pilot tracking remain Anon. Two supporting functions are excluded/disabled in the candidate release. Result: **not safe**.

#### `module_results`

- Frontend reads/writes: `src/lib/adminPilotCleanupService.ts`, `src/lib/pilotTrackingService.ts`.
- Functions: `netlify/functions/_lib/achievementService.js`, `netlify/functions/_lib/weeklyLearningSummary.js`, `netlify/functions/admin-family-identity-diagnostic.js`, `netlify/functions/family-child-progress.js`.
- Evidence: the changed Focus Flame flow uses `family-child-progress` and remains Service + validated Legacy, but generic module tracking remains direct Anon. Result: **not safe**.

#### `player_progress`

- Frontend reads/writes: `src/lib/adventureWeekProgress.ts`, `src/lib/characterDiscoveryService.ts`, `src/lib/completeMissionWithSupabase.ts`, `src/lib/familyPlayerProgressDisplay.ts`, `src/lib/getCourageInTheDarkProgress.ts`, `src/lib/missionRewardClaimService.ts`, `src/lib/participantQuestService.ts`, `src/lib/playerInventoryModel.ts`, `src/lib/rewardClaimService.ts`.
- Functions: `netlify/functions/_lib/achievementService.js`, `netlify/functions/admin-family-identity-diagnostic.js`, `netlify/functions/family-child-progress.js`.
- Evidence: changed family child progress is Service-mediated; adventure, character, quest, inventory, completion, and reward flows still read/write directly. Result: **not safe**.

#### `player_wallets`

- Frontend reads/writes: `src/hooks/useFocusCoinWallet.ts`, `src/lib/childRewardCompletionSnapshot.ts`, `src/lib/getCourageInTheDarkProgress.ts`, `src/lib/missionRewardClaimService.ts`, `src/lib/monthlyChallengeProgress.ts`, `src/lib/participantDebug.ts`, `src/lib/participantQuestService.ts`, `src/lib/rewardClaimService.ts`.
- Functions: `netlify/functions/admin-family-identity-diagnostic.js`, `netlify/functions/family-child-progress.js`.
- Evidence: wallet display/update and reward/quest writes remain direct Anon outside the changed server endpoint. Result: **not safe**.

#### `player_badges`

- Frontend reads/writes: `src/lib/childInventoryEarnedState.ts`, `src/lib/childProgressStatus.ts`, `src/lib/getCourageInTheDarkProgress.ts`, `src/lib/missionRewardClaimService.ts`, `src/lib/participantQuestService.ts`, `src/lib/rewardClaimService.ts`.
- Functions: `netlify/functions/_lib/achievementService.js`, `netlify/functions/_lib/weeklyLearningSummary.js`, `netlify/functions/admin-family-identity-diagnostic.js`, `netlify/functions/family-child-progress.js`.
- Evidence: badge reads and award writes still have direct Anon implementations; excluded/disabled server helpers cannot cover them. Result: **not safe**.

#### `player_reward_claims`

- Frontend reads/writes: `src/lib/characterDiscoveryService.ts`, `src/lib/monthlyChallengeProgress.ts`, `src/lib/playerInventoryModel.ts`, `src/lib/rewardClaimService.ts`.
- Functions: none.
- Evidence: all observed runtime access is direct browser access. Result: **not safe**.

#### `kid_play_sessions`

- Frontend reads/writes: `src/lib/kidPlaySessionService.ts`.
- Functions: `netlify/functions/family-child-session.js`.
- Evidence: compatibility fetch/update/end paths use the function, but creation and non-compatibility fallback remain direct browser operations. Result: **not safe**.

#### `participant_ui_state`

- Frontend reads/writes: `src/lib/participantUiState.ts`.
- Functions: none.
- Evidence: UI-state SELECT/upsert is direct browser access. Local fallback does not preserve cloud behavior. Result: **not safe**.

#### `program_goals`

- Frontend reads/writes: `src/lib/adminPilotCleanupService.ts`, `src/lib/programGoalsService.ts`.
- Functions: none.
- Evidence: onboarding goals SELECT/upsert and Admin cleanup are direct browser operations. Result: **not safe**.

#### `family_child_goals`

- Frontend reads/writes: `src/lib/adminPilotCleanupService.ts`, `src/lib/familyChildGoalsService.ts`.
- Functions: none.
- Evidence: child-goal SELECT/upsert is direct browser access with legacy app credentials only. Result: **not safe**.

#### `question_attempts`

- Frontend reads/writes: `src/lib/questionAttemptService.ts`.
- Functions: `netlify/functions/family-child-progress.js`.
- Evidence: the changed Focus Flame question-attempt workflow uses Service + validated Legacy and will work. The generic service still directly inserts from the browser, and the proposed policy provides SELECT only. Result: **not fully safe**.

#### `student_gallery_items`

- Frontend reads/writes: `src/lib/adminPilotCleanupService.ts`, `src/lib/studentGalleryService.ts`.
- Functions: none.
- Evidence: gallery SELECT/INSERT/UPDATE and Admin cleanup are entirely direct browser operations. Result: **not safe**.

## Required workflow verification

| Workflow | Access after proposed RLS | Evidence |
|---|---|---|
| `pilot-family-signup` | Works | Service-role client invokes the protected signup RPC; no browser table access is required for the corrected submit path. |
| `family-portal-children` | Works | Service role plus `authorizeFamilyCompatibilitySession`; exact family/program credentials and participant scope are checked server-side. |
| `family-child-session` | Works for compatibility paths | Service role plus compatibility validation; participant scope is checked before session/baseline access. Direct fallback/create code in `kidPlaySessionService.ts` remains unsafe. |
| `family-child-progress` | Works for changed Focus Flame path | Service role plus compatibility validation; module result, question attempt, progress, wallet, and badge operations are participant-scoped. |
| `portal-b4-variant` | Works | Service role; accepts either a verified Supabase Auth ownership session or validated family compatibility credentials. |
| `portal-ownership-session` | Works | Service role validates Bearer Supabase Auth and resolves ownership server-side. |
| Assessments | Partial | Compatibility baseline uses `family-child-session`; generic `assessmentResultsService.ts` remains direct. |
| Module results | Partial | Changed Focus Flame uses `family-child-progress`; generic `pilotTrackingService.ts` remains direct. |
| Question attempts | Partial | Changed path is server-mediated; `questionAttemptService.ts` remains direct. |
| Badges/rewards/wallet/gallery | Fails gate | Most reads and writes remain direct browser calls; gallery has no server function. |
| Kid sessions | Partial | Compatibility fetch/update/end is server-mediated; direct create and fallback remain. |
| Admin | Fails gate | Admin Auth exists, but direct Admin table operations have neither ownership nor internal-Admin policies and no complete server replacement. |
| Facilitator | Fails gate | Legacy access-code roster/tracking paths still use the browser client. |

## Database rehearsal result

**Not performed; gate fails.** The local environment has no PostgreSQL server/client, Supabase CLI, Docker runtime, captured database dump, or production-schema clone. The repository has only a sanitized schema/policy inventory and baseline artifacts. Executing against staging or production was expressly prohibited.

Static checks completed:

- 16 target tables are declared in the forward migration.
- 58 captured policy names are present in the forward precheck.
- Exactly 16 new ownership policies are declared.
- The restoration file declares all 58 captured policies.
- The restored policy-name set matches the captured inventory.
- No application-data `INSERT`, `UPDATE`, or `DELETE` statement is present; statements are policy/grant DDL only.
- Forward migration postchecks anonymous privilege removal and authenticated SELECT-only access.

Not proven without a clone:

- All live production prechecks pass.
- Service-role CRUD remains functional in the actual schema.
- Ownership helper semantics match all real rows and legacy shapes.
- Exact effective behavior after forward and restoration.
- Restoration of original ACL provenance.
- Zero application-row changes at transaction level.

## Mixed-file isolation rehearsal

Temporary detached worktree base: published production commit `3d4e65a4cae1d3d93fa7b1873214279ccf677a82`. No branch or commit was created.

- `git apply --check docs/deployment/production-release-mixed-file-hunks.patch`: **PASS**.
- Patch application in temporary worktree: **PASS**.
- Only approved hunk removals were applied to the three mixed files; deferred initial-goals and Question Bank symbols were absent afterward.
- Candidate allowlist comparison: zero unexpected release files after excluding the temporary `node_modules` test symlink.
- Type-check: **FAIL** — omitted `MissionCoachCard` prop support, `achievementEvents`, and Kit test fixture dependencies.
- Lint: **PASS** — 0 errors, 4 existing warnings.
- Full tests: **FAIL** — 35 suites failed, 44 passed; 1 test failed and 186 passed. Primary causes are omitted `achievementEvents`, Kit fixture, production inventory/baseline test data, and related imports.
- Production build: **FAIL** — cannot resolve `src/lib/achievementEvents.ts` from included `pilotTrackingService.ts`.
- Protected-data-path tests: **FAIL** — 2 suites passed and 1 failed; the included test imports excluded `QuestionBankRoute.tsx`.
- Secret scan: **PASS for real secrets** — only safe test placeholders in `src/lib/__tests__/adminSessionEndpoint.test.ts` were detected.
- Staging-reference scan: **PASS** — no configured staging project reference in candidate runtime paths.
- Personal-path scan: no personal Desktop/Downloads runtime reference was identified.
- Asset check/build-bundle check: **NOT COMPLETE** because the production build failed.

Candidate manifest dependencies that must be resolved before another freeze:

- Runtime: `src/lib/achievementEvents.ts`.
- Runtime UI: `src/design-system/components/MissionCoachCard.tsx` and its CSS, or an approved compatible hunk that preserves `avatarContent`.
- Tests: `src/test-fixtures/kitWebhookFixtures.ts`.
- Protected-path test dependency: `src/components/learning/QuestionBankRoute.tsx`, or change the test manifest with explicit approval.
- Baseline test data: `docs/audits/production-schema-inventory.json` and `supabase/schema/production_legacy_baseline.sql`, if that test remains part of the isolated gate.

## Production and rollback order

This is the candidate order only; execution is not approved.

1. `20260711000100_audience_crm_phase1_foundation.sql`
2. `20260711000200_audience_crm_phase2_workflows.sql`
3. `20260711000300_audience_crm_phase3_kit_automation.sql`
4. `20260713000200_family_signup_identity_integrity.sql`
5. `20260714000100_auth_portal_ownership.sql`
6. `20260714000300_portal_participant_rls_helper_hardening.sql`
7. `20260714000400_portal_participant_rls_recursion_fix.sql`
8. `20260714000450_production_portal_ownership_rls.sql` — **blocked by this report**
9. `20260714000500_portal_postgrest_schema_reload.sql`
10. `20260715000100_b4_variant_preference.sql`
11. `20260715000200_independent_family_child_creation.sql`
12. `20260715000400_b4_selection_onboarding.sql`

Explicit exclusions: staging RLS migration, staging legacy B-4 migration, staging seeds/cleanup/safety SQL, production legacy baseline, deferred learning-engagement migration, review-only SQL, and rollback files during forward execution.

Rollback order for an RLS incident:

1. Stop affected traffic and record the failure/correlation evidence.
2. Republish the recorded known-good Netlify deploy without rebuilding.
3. Run `supabase/rollbacks/20260714000450_production_portal_ownership_rls_rollback.sql` only after verifying its one-policy-per-table precheck against the incident state.
4. Reload the PostgREST schema cache using the approved schema-reload operation.
5. Verify the 58-policy inventory and effective CRUD grants against the captured inventory.
6. Smoke-test the restored paths before reopening traffic.

Broader rollback files, if a different migration is proven causal, run in strict reverse dependency order: participant recursion fix, helper hardening, ownership foundation, family signup integrity, then CRM repair/restore procedures. Additive B-4/child columns should normally be retained to avoid data loss. No rollback should be attempted without a fresh incident-specific plan.

## Release host and backup checkpoint

- Netlify site: `quiet-pothos-3ae8ce` (`7a45***df3a`), production domain `caidenscourage.com`, production branch `main`.
- Current published deploy: `6a5256cf1c7b49000807a71a`, commit `3d4e65a4cae1d3d93fa7b1873214279ccf677a82`.
- Rollback deploy: `6a5087522fb9ab000858a34b`, commit beginning `788fec`; previously verified as available for republish without rebuilding.

Required database checkpoint before any future execution approval:

1. Confirm point-in-time recovery or create a new restorable production backup immediately before the maintenance window.
2. Capture schema, policies, raw ACLs/grants, functions, and migration history.
3. Record backup ID, UTC timestamp, owner, checksum/verification result, and a tested restore target.
4. Abort if the backup cannot be restored or if production policy/grant inventory differs from the captured precheck.

PITR was previously reported unavailable; execution remains blocked until a verified restorable checkpoint exists.

## Approved file manifest

**No executable release manifest is approved.** The frozen candidate is documented in `docs/deployment/frozen-production-deployment-manifest-2026-07-16.md`, and the proposed RLS artifacts are:

- `supabase/migrations/20260714000450_production_portal_ownership_rls.sql`
- `supabase/rollbacks/20260714000450_production_portal_ownership_rls_rollback.sql`
- `docs/deployment/production-release-mixed-file-hunks.patch`

They remain review-only. The application allowlist must be regenerated after all direct affected-table access is server-mediated and the missing runtime/test dependencies are explicitly classified.

## Future smoke-test checklist

- Admin: sign in, refresh, role resolution, account/program management, cleanup read-only preview, sign out.
- Family: signup, return login, family dashboard, list child, add child, grade save, B-4 save, refresh persistence.
- Child: create/resume kid session, baseline completion recognized, Week 1 unlock, module result, question attempt, progress, wallet, badge, reward claim, gallery read/write.
- Facilitator: access-code login, assigned roster only, participant progress, no cross-program access.
- Auth/RLS: anonymous denied on all 16 tables; owned authenticated reads allowed; cross-family/cross-roster reads denied; service CRUD allowed.
- Compatibility: approved legacy codes work only through server functions; invalid codes and mismatched participant IDs are denied.
- Regression: assessments, game completion, rewards, gallery, goals, UI state, B-4, family/child sessions, CRM/Admin, public site.
- Operational: function logs/correlation IDs, no Kit writes, no email/campaign, no unexpected data mutation, rollback deploy immediately available.

## Unresolved risks and blockers

1. Required direct browser access remains on all affected domains; 15 tables have definitive breakage and `question_attempts` has a generic direct-write gap.
2. Authenticated Admin direct operations have no Admin RLS override and no complete server replacement.
3. Facilitator legacy-credential flows are not completely server-mediated.
4. Forward and restoration SQL have not been executed against a production-shaped clone.
5. Restoration cannot prove original ACL provenance and is intentionally one-time.
6. The release candidate does not type-check, pass full tests, build, or pass all protected-path tests.
7. The isolated manifest omits required runtime/test dependencies.
8. Asset/bundle verification cannot complete until the build succeeds.
9. A verified restorable production database checkpoint is not yet recorded.

## Safety confirmation

No SQL was executed. Production and staging were not modified. No branch, commit, push, deploy, email, campaign, or Kit write occurred.
