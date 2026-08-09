# Narrow release-candidate readiness — 2026-07-16

## Decision

**NOT READY to request production deployment approval.**

The production Netlify site identity, current deploy, rollback target, and hosted function inventory are verified. The production environment gate fails because required safety variables are missing, Kit is not explicitly disabled, and two malformed credential-shaped environment-variable names require credential rotation and cleanup. Under the requested gate order, no release branch/worktree or commit may be created until this configuration is corrected and reverified.

No production mutation, SQL execution, deployment, push, Kit write, subscriber synchronization, campaign, or email occurred.

## Release isolation

The exact path allowlist and exclusions are in:

- `docs/deployment/release-approved-files-2026-07-16.md`
- `docs/deployment/release-excluded-files-2026-07-16.md`

Mixed files require hunk-level extraction in the eventual isolated worktree:

- `src/config/featureFlags.ts`: include only portal ownership/access-code flags; omit unrelated initial-goal work.
- `src/pages/AdminPortalPage.tsx` and `src/data/adminPortalContent.ts`: omit Question Bank wiring.

No hard separation conflict was found, but isolation has intentionally not been performed because the hosted environment gate failed. The manifest now classifies the full delta from published production commit `3d4e65a4cae1d3d93fa7b1873214279ccf677a82` through local `HEAD`, plus working-tree and untracked paths: 193 approved release paths, 3 required dependencies, 74 tests/docs, 79 unrelated paths, 124 generated/local-only paths, and zero unresolved paths. Proposed branch name after the gate passes: `codex/production-narrow-release-2026-07-16`. Proposed local commits: migrations; family/session/server boundaries; B-4 runtime/UI/Flight; Focus Flame Weeks 3–9; approved Admin/CRM; tests and operational docs.

## Corrected migrations

Unique ordered versions relevant to this correction:

1. `20260628000100_pilot_program_code_transaction.sql`
2. `20260628000200_repair_gdi_orphaned_program_code_refs.sql`
3. `20260715000200_independent_family_child_creation.sql`
4. `20260715000300_b4_selection_onboarding_legacy_staging.sql` — historical staging description only; prohibited from production.
5. `20260715000400_b4_selection_onboarding.sql` — bounded production candidate; not executed.

Migration filename versions are unique. The two 20260628 files were renamed without combining or changing SQL behavior. The safe B-4 migration counts exact `spark` rows, updates only `b4_variant_key = 'spark'`, preserves valid choices and selection timestamps, restores the allowlist, and performs postchecks. Its forward-correction strategy is documented in the SQL.

## Staging ledger reconciliation

Read-only comparison proved:

- `20260715000200`: the column, unique partial index, grants, and `create_independent_family_child` function exist. The normalized live function body exactly matches the repository definition; it is `SECURITY DEFINER`, has `search_path=public`, denies anon/authenticated execute, and allows service-role execution.
- `20260715000300`: the historical staging column/comment/constraint state exists and the data postcondition is clean (zero `spark`, zero invalid B-4 keys). The repository retains the historical SQL solely to describe what ran.
- `20260715000400`: pending locally and must not be replayed or marked applied in staging.

After staging identity is reverified and the owner explicitly approves history-only operations, prepare—but do not currently run:

```text
npx supabase migration repair 20260715000200 --status applied --linked
npx supabase migration repair 20260715000300 --status applied --linked
```

Production baseline strategy: capture a schema-only snapshot and policy/grant inventory, record the current production schema as the baseline point outside the old migration sequence, and begin the authoritative ledger with only migrations deployed after that baseline. Never replay historical/baseline SQL or fabricate old applied entries.

## Changed data-path result

Pass after correction. Compatibility-family browser flows use:

- `pilot-family-signup`
- `family-portal-children`
- `family-child-session`
- `family-child-progress`
- `portal-b4-variant`

The new Focus Flame completion path now sends module results and question attempts to `family-child-progress`, which validates the family session, exact participant ownership, bounded payload, and derives the program identity server-side. It does not use the legacy direct client for compatibility-family sessions. B-4 Flight local state is participant-keyed. The separate unchanged debt inventory is `docs/security/legacy-direct-access-debt-nonblocking.md` and is explicitly non-blocking.

## Private production placeholder review

- Masked participant ID: `1819***a92a`
- Created: 2026-07-06 22:21:24 UTC
- Family link: none
- Assessment/module/progress/badge/reward/session/gallery records: zero
- Appears active: yes (active program and recent timestamp)
- Required uniqueness conflict: none
- Recommendation: **owner review required; retain for now and archive later only after ownership is confirmed**

No identity, email, PIN, access code, or full identifier was printed or changed.

## Production Netlify and backup readiness

The checkout is linked to the same Netlify site that serves the custom production domain:

- Site: `quiet-pothos-3ae8ce`; masked site ID `7a45***df3a`; team `Caiden's Courage`.
- Custom production domain: `caidenscourage.com`; production branch: `main`; repository URL exactly matches the current `origin`.
- Current published deploy: `6a5256cf1c7b49000807a71a`, commit `3d4e65a4cae1d3d93fa7b1873214279ccf677a82`, published 2026-07-11 14:45:49 UTC.
- Immediate prior known-good production deploy: `6a5087522fb9ab000858a34b`, commit `788fecaa1be5b6a0d4cbcc79892fe1fa7992b561`, published 2026-07-10 05:48:03 UTC. It remains in `ready` state with its function artifacts available and can be restored without rebuilding. No restore was performed.
- Repository functions directory: `netlify/functions` (the site API has no separate override).
- Currently deployed functions: `b4-chat`, `notify-child-inactive-scheduled`, `notify-parent-push`, `reset-student-pin`, `reveal-student-pin`, `save-push-subscription`, `send-push`, `send-welcome-email`, `sync-kit-event`, and `verify-student-pin`.
- Standard Git-based deploy previews are available; no custom preview domain is configured.

The hosted production environment-name check passed for `SUPABASE_SERVICE_ROLE_KEY` and `KIT_API_KEY`, but failed overall. Missing required names/configuration are:

- `SUPABASE_URL`
- `PRODUCTION_SUPABASE_PROJECT_REF`
- `REACT_APP_SUPABASE_EXPECTED_PROJECT_REF`
- `PORTAL_AUTH_OWNERSHIP_ENABLED`
- `CRM_ADMIN_DIAGNOSTICS_ENABLED`
- `AUDIENCE_CRM_READ_ENABLED`
- `KIT_API_BASE_URL`
- `AUDIENCE_PROVIDER_SYNC_ENABLED=false`
- `AUDIENCE_CRM_WRITE_ENABLED=false`
- `KIT_PROVIDER_ENABLED=false`
- `KIT_WRITE_OPERATIONS_ENABLED=false`
- `KIT_WEBHOOKS_ENABLED=false`
- `KIT_MCP_ASSISTANT_ENABLED=false`
- `KIT_METRICS_SYNC_ENABLED=false`
- `WEEKLY_SUMMARY_KIT_DELIVERY_ENABLED=false`
- `LEGACY_KIT_EVENT_ENDPOINT_ENABLED=false`
- `ENABLE_CHILD_INACTIVE_PUSH=false`
- `WEEKLY_SUMMARY_PREPARATION_ENABLED=false`
- `ACHIEVEMENT_EVENTS_ENABLED=false`

`KIT_ENABLED` exists but is not the exact string `false`; because `KIT_API_KEY` also exists, the legacy Kit service resolves as enabled. This violates the explicit production safety gate even though newer write paths default closed. Two additional environment-variable names are malformed and credential-shaped. Their corresponding credential must be treated as exposed, rotated, and the malformed entries deleted/replaced without reproducing those names in logs or documentation. No Kit request was made.

Supabase production backup metadata was verified read-only: eight listed backups; latest completed at 2026-07-16 08:36:33 UTC; WAL-G backup support enabled; PITR disabled. Owner confirmation location: Supabase Dashboard → production project → Database → Backups. Record a fresh restorable backup and schema snapshot before any separately approved production window.

## Deployment package and order after the blocker clears

1. Rotate the credential implicated by the malformed credential-shaped names, remove those malformed entries, add the missing variable names, and set every listed safety flag to exact `false`.
2. Reverify the Netlify environment name-only and boolean-state gates without reading values.
3. Isolate only the approved paths/hunks from published production commit `3d4e65a4cae1d3d93fa7b1873214279ccf677a82`.
4. Create local release commits; do not push.
5. Run the full verification matrix on the isolated commit.
6. Rehearse production-approved migrations against production-shaped non-production data; never use staging baseline/seed/RLS SQL.
7. Request explicit owner approval for backup, maintenance window, exact SQL set/order, and exact application commit.
8. Keep Kit writes disabled; apply migrations and deploy only in a later explicitly approved task.

Stop for identity mismatch, missing backup/rollback target, duplicate migration version, unexpected schema drift, failed ownership denial, unsafe browser data access, missing runtime asset, scan finding, or any test/build failure.

## Verification results

- Type-check: pass.
- Lint: pass with zero errors and four pre-existing warnings.
- Targeted release tests: 10 suites / 48 tests pass.
- Full tests: 85 suites / 372 tests pass.
- Production-mode compile: pass. A second non-secret placeholder build proved the source has no hardcoded staging reference; it is verification-only and not a deploy artifact.
- Secret scan: zero repository or bundle value matches.
- Staging-reference scan: zero repository matches and zero matches in the sanitized build. The first staging-connected local build correctly contained the public staging ref and was replaced; it must never be deployed to production.
- Personal-path scan: zero runtime matches.
- Localhost scan: localhost-only cache reset/service-worker guards and local design-system QA comments only; no production API target.
- Runtime assets: 20 B-4 files, five variants × four states; no missing combination.
- Source maps: zero.
- Migration uniqueness: 18 files, zero duplicate versions.
- SQL manifest coverage: zero unlisted SQL files.
- Local Netlify inventory: 46 top-level functions; all eight required narrow-release functions present.
- Diff hygiene: seven trailing-whitespace findings, all in excluded generated `reports/question-audit.md`.
