# Production preflight — 2026-07-16

## Decision

# NOT READY

This was a read-only production preflight. No production SQL, deployment, user creation, Kit request, subscriber mutation, email, push, or campaign was executed. Nothing was pushed or committed.

The local build is healthy, but the release cannot safely advance to a clean release commit or deploy preview until the security, migration-history, worktree, Netlify identity, backup, and data-review gates below are resolved.

## Identity and release source

| Item | Verified result |
|---|---|
| Repository | `stillianoblack/caidens-courage-site` |
| Local branch | `main` |
| Local HEAD | `006225a5555728e1ea8ee6408968e5b043a2be20` (`feat(crm): add secure Kit sync metrics and reconciliation`) |
| Local Supabase target | Staging, `gpcs***pqw` |
| Approved staging Supabase | `gpcs***pqw` |
| Production Supabase | `bnop***aen` |
| Local Netlify context | Netlify Dev; `.netlify/state.json` has no hosted site ID |
| Staging Netlify site | Not verifiable from this checkout |
| Production Netlify site/deploy ID | Not verifiable: Netlify CLI is not logged in and the checkout is not linked |
| Local-only credentials | `.env.local`, correctly ignored and untracked; values were never printed |

The environment project-reference guards agree with staging, the Supabase CLI is linked only to staging, and `ALLOW_STAGING_DATABASE_MUTATIONS=false`. No credential cross-wiring was observed. The production hosted Netlify environment cannot be compared until the correct production site is identified read-only.

## Working-tree gate

The working tree is not releasable:

- 265 status entries: 108 modified, 21 deleted, 136 untracked.
- Tracked diff: 129 files, 16,461 insertions and 4,209 deletions, excluding untracked files.
- The tree mixes application, database, CRM, learning content, assets, generated reports, documentation, dependency locks, staging utilities, and local audit outputs.
- No clean release branch or isolated release commit was created because separating this mixed tree without an approved baseline risks omitting dependencies or including unrelated work.

Therefore there is no approved release commit and no final exact application-file allowlist yet. The full current inventory is the 265-entry `git status`; it must be reviewed and split from a known production deploy commit before packaging.

### Candidate runtime scope requiring isolation

The following categories are candidates, not approval to deploy:

- family signup, child linkage, family child/session/progress, portal ownership, and B-4 Netlify functions plus their shared authentication libraries;
- participant/B-4/child-session frontend services and approved family/kid/Admin surfaces;
- Weeks 3–9 Focus Flame challenge data and the shared existing engine integration;
- B-4 manifest, selector/avatar/Flight state code, and exactly 20 runtime images under `public/assets/b4` (five variants × four states);
- CRM/Admin functions and UI that correspond to the approved CRM Phase 1–3 schema;
- `.env.example`, `netlify.toml`, package manifests/locks, tests, and operational documentation after review.

### Required exclusions

- `.env.local` and every secret/private credential;
- `reports/` question-audit outputs and screenshots;
- staging safety gate, production-derived staging baseline, staging seed, and staging cleanup SQL;
- staging-specific RLS SQL as a production policy migration;
- deferred learning-engagement migration `20260713000100`;
- review-only/audit/remediation SQL and rollback SQL from forward order;
- staging diagnostic/fixture/apply scripts and test identities;
- high-resolution source exports not referenced at runtime;
- local cache/debug artifacts and absolute personal paths;
- any Kit canary/write data.

## Migration comparison

### Repository and staging

The staging ledger contains ten timestamped versions from `20260711000100` through `20260715000100` (with the approved intermediate versions). The live staging schema also contains the objects from:

- `20260715000200_independent_family_child_creation.sql`
- `20260715000300_b4_selection_onboarding_legacy_staging.sql`

Those two versions are absent from the staging ledger. They must be checksum/object-reviewed and the history reconciled without replaying SQL.

The former duplicate `20260628` files were renamed locally to `20260628000100` and `20260628000200` in chronological order without changing their SQL behavior. A uniqueness check now reports no duplicate migration versions. Neither migration was executed or recorded remotely.

### Production

The production database has no `supabase_migrations.schema_migrations` ledger. Exact applied-version/checksum comparison is therefore unavailable. Read-only schema evidence confirms the new CRM, ownership, B-4, signup-idempotency, and independent-child RPC objects are absent, but schema absence is not a substitute for an authoritative migration ledger.

### Provisional production order after all blockers clear

No migration is approved for execution yet. The dependency order to rehearse is:

1. CRM Phase 1 foundation (`20260711000100`), after backup and prechecks.
2. CRM Phase 2 workflows (`20260711000200`).
3. CRM Phase 3 Kit automation (`20260711000300`), with all provider writes disabled.
4. Family signup identity integrity (`20260713000200`), after duplicate-email precheck.
5. Auth portal ownership (`20260714000100`), after reviewed production account mappings.
6. A new production-specific RLS migration and exact restoration plan. Do not run `20260714000200_staging_portal_ownership_rls.sql` verbatim.
7. Only the ownership helper/reload migrations still required by the final production-specific policy design (`20260714000300`–`20260714000500`).
8. B-4 variant preference (`20260715000100`), with lock/constraint-validation timing measured in rehearsal.
9. Independent-family child creation (`20260715000200`), after its CRM Phase 1 audit dependency and service-role contract are verified.
10. The bounded B-4 selection-onboarding replacement `20260715000400_b4_selection_onboarding.sql`. The historical staging-only `20260715000300` file is prohibited from production.

The historical `20260715000300` updates every participant with a null selection timestamp and is retained only to describe staging history. The new `20260715000400` updates only exact legacy `spark` values and never marks existing/default choices confirmed. CRM migrations have no phase-specific down migrations; backup plus forward fix is required. Additive migrations should normally be retained during application rollback.

## Production aggregate data safety audit

Only aggregate counts and schema metadata were queried.

| Check | Count/result |
|---|---:|
| Duplicate active independent-family email groups | 0 |
| Placeholder participant rows | **1 — review required** |
| Orphaned participants | 0 |
| Orphaned family links | 0 |
| Duplicate family-link groups | 0 |
| Malformed grade rows | 0 |
| Noncanonical progress/session orphans across the four checked tables | 0 |
| Incomplete independent-family signup rows | 0 |
| Ownership grant tables | Absent |
| B-4 variant column | Absent |
| Signup idempotency column | Absent |

The one placeholder participant requires a review-only classification/remediation plan before unique indexes or ownership mappings are approved. No identifier or child information was retrieved or printed. Invalid B-4 values cannot exist yet because the production column is absent; legacy `spark` remains a runtime normalization concern after the column is introduced.

## RLS and server-mediated access

Security gate failed.

Nine production tables with sensitive portal data have RLS enabled but every current policy includes `anon`/`public`: `assessment_results`, `assessment_results_v2`, `kid_play_sessions`, `module_results`, `participants`, `pilot_programs`, `player_progress`, `program_goals`, and `student_family_links`. Across these tables, 38 of 38 policies include anonymous/public access.

The frontend still contains direct browser Supabase access to these protected tables in 35 source files. Tightening production RLS now would break active flows; leaving it unchanged would fail the anonymous-denial requirement. These flows must be inventoried and replaced or explicitly redesigned behind validated Netlify functions before production RLS can be approved.

The service-role key is not exposed through a `REACT_APP_*` variable, and privileged child/signup functions are designed for server-side use. A production-specific RLS forward migration, captured restoration SQL, and anonymous/family/student/facilitator/admin/service-role tests are still required.

## Netlify functions and environment

The checkout contains 46 top-level Netlify functions and 21 shared library files. Required local function files are present for:

- `pilot-family-signup`
- `family-portal-children`
- `family-child-session`
- `family-child-progress`
- `portal-b4-variant`
- `portal-ownership-session`
- `admin-session`
- CRM/Admin endpoints including `crm-kit-diagnostics`
- `learning-content` and `admin-learning-content`

Hosted production inclusion and environment presence cannot be verified until the production Netlify site is identified and the CLI has read access.

Required server-side variable names include `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, a production project-reference guard, `KIT_API_KEY`, `KIT_API_BASE_URL`, CRM authorization/bootstrap configuration, and the release flags below. Browser variables must be limited to the Supabase public URL/anon key, the expected public project ref, and display-only feature flags. `CRM_BOOTSTRAP_ENABLED` must remain false after any separately approved bootstrap.

## Kit boundary

Kit requests use `X-Kit-Api-Key` server-side. The local credential value did not appear in tracked or untracked release files. Production Kit credential presence was not verifiable and no Kit request was made during this preflight.

These must remain false in the initial production release:

- `AUDIENCE_PROVIDER_SYNC_ENABLED=false`
- `KIT_WRITE_OPERATIONS_ENABLED=false`
- `KIT_WEBHOOKS_ENABLED=false`
- `KIT_MCP_ASSISTANT_ENABLED=false`
- `KIT_METRICS_SYNC_ENABLED=false`
- `WEEKLY_SUMMARY_KIT_DELIVERY_ENABLED=false`
- `LEGACY_KIT_EVENT_ENDPOINT_ENABLED=false`

Read-only provider verification may be enabled only after production credentials and hosted flags are independently confirmed. No write canary belongs in the core release.

## Backup and rollback readiness

Backup gate is not verified. Before approval, record:

1. Supabase PITR/backup availability and latest restorable timestamp.
2. A schema-only export plus encrypted targeted data exports for every affected table, stored outside the repository.
3. The production Netlify site ID, current production deploy ID, and its Git commit.
4. The exact pre-release database schema/policies/grants and production row-count prechecks.

Rollback order:

1. Freeze traffic-changing actions and disable new display/write flags.
2. Roll Netlify functions and frontend back together to the recorded prior deploy.
3. Retain safe additive database objects unless they create an immediate security or correctness issue.
4. Use reviewed forward fixes for policy/function defects; restore PITR/targeted backup only when data/schema integrity requires it.
5. Do not drop B-4 columns after real selections exist unless data loss is explicitly approved.
6. Re-run anonymous denial, family isolation, child-session, signup idempotency, and no-Kit-write verification.

No rollback command was executed.

## Deploy preview

Not created. A deploy preview would violate the clean-release-source gate because there is no isolated commit and no verified hosted Netlify site/context. Once the approved file allowlist is isolated from the known production commit, the preview must use non-production data and repeat visual, function-contract, cache/service-worker, asset, secret, and reference checks.

## Local verification

| Check | Result |
|---|---|
| Type-check | Pass |
| Lint | Pass with 0 errors and 4 existing warnings |
| Targeted release tests | Pass: 9 suites, 41 tests |
| Full tests | Pass: 83 suites, 361 tests |
| Production build | Pass |
| Source maps | Pass: 0 emitted |
| Secret-value scan | Pass: 0 matches outside `.env.local` |
| Staging-reference scan | Pass: 0 repository matches to the configured staging ref |
| Absolute personal path scan | Pass for runtime source/public/functions |
| Localhost scan | Expected localhost-only cache/dev guards and documentation only; no production API target found |
| Runtime B-4 asset inventory | Pass: 20 files, all five variants/four states |
| Migration manifest | Partial: local versions are unique; two live staging objects remain missing from the ledger |
| Netlify hosted inventory | Fail: checkout not linked; CLI not authenticated |
| Diff hygiene | 7 trailing-whitespace findings, all in an excluded generated question report |

## Required release sequence after a new READY decision

1. Owner approves the exact known production Git commit and production Netlify/Supabase identities.
2. Freeze unrelated changes and isolate the approved allowlist in a clean release branch/commit.
3. Confirm PITR/backups, prior Netlify deploy ID, rollback artifact, and restoration SQL. **Owner approval required.**
4. Reconcile staging migration history and establish an authoritative production migration baseline without replaying SQL.
5. Complete placeholder-row review and all migration prechecks.
6. Rehearse the production-specific RLS migration, bounded B-4 backfill, locks, postchecks, and rollback against a production-shaped non-production database.
7. Build and accept a non-production deploy preview from the exact release commit.
8. Re-run type-check, lint, targeted/full tests, build, secret/reference scans, and function contract tests.
9. Owner approves the maintenance window and exact migration/application artifacts.
10. Apply only the approved additive migrations in the rehearsed order. **Explicit owner approval required.**
11. Verify RPC grants, RLS, anonymous denial, ownership isolation, and migration postchecks.
12. Deploy functions and frontend from the same approved commit. **Explicit owner approval required.**
13. Verify cache/service-worker update and run no-write smoke tests.
14. If separately approved, perform one owner-controlled adult family-signup smoke test; verify one family, participant, and link with no duplicates. **Separate explicit owner approval required.**
15. Verify child session, B-4 choice, Weekly Adventures, progress isolation, Admin/Auth, and Kit read-only/no-write behavior.
16. Monitor structured errors and choose GO or application rollback.

Estimated maintenance window after every blocker is cleared and rehearsal passes: **45–60 minutes plus monitoring**. The current state is NOT READY, so no window should be scheduled yet.

## Blockers to clear

1. Identify the known production deploy commit and hosted Netlify site/deploy/environment read-only.
2. Isolate the 265-entry mixed working tree into an approved, dependency-complete release commit.
3. Reconcile the two staging schema/ledger discrepancies without replaying SQL.
4. Establish an authoritative production migration baseline/history.
5. Replace remaining direct browser access to protected tables and create production-specific RLS forward/restoration SQL.
6. Review the one placeholder production participant without exposing its identity.
7. Replace the unbounded B-4 onboarding update with an approved bounded plan.
8. Confirm backups/PITR and rehearse migration/rollback on production-shaped non-production data.
9. Build and accept the clean deploy preview.
