# Legacy staging provisioning and family-signup verification

Date: 2026-07-13
Target: existing staging project `gpcs***pqw`
Production: `bnop***aen` (read-only anonymous probes only)

## Outcome

The existing CRM staging project was preserved and extended with the 23-table legacy compatibility baseline. The baseline, staging RLS, fictional seed, and critical family-signup migration were applied only to staging. The learning migration was not applied. No deployment, push, email, Kit write, provider sync, or production mutation occurred.

The atomic signup endpoint passed twice with the same idempotency key. The first response created the family/student pair; the second returned `reused=true` with the same participant. A verified migration defect initially omitted the legacy family-link/enrollment row; the RPC was corrected and reapplied idempotently. Aggregate database verification then found exactly one active family, exactly one student named `Aurora Test`, one valid family link/enrollment, the expected `3rd–5th` grade band, zero placeholder students, zero Auth users, and zero CRM contacts for the fictional address.

## Schema and data checks

- 59 public staging tables after provisioning: 23 legacy plus 36 retained CRM/Auth tables.
- Fictional seed rerun was idempotent.
- No duplicate independent-family emails, duplicate student identities, orphan family links, or placeholder students.
- Legacy baseline/B4 completion, progress, and wallet fixtures remained present.
- `create_independent_family_signup` is `SECURITY DEFINER` and executable only by `service_role`.
- Rollback SQL exists for the critical signup migration.

## Authorization matrix

Sensitive-table test set: pilot programs, participants, family links, assessments, module results, progress, wallets, badges, and kid sessions.

| Actor | Result |
| --- | --- |
| anonymous | denied on all tested sensitive tables |
| authenticated family test user | denied on all |
| authenticated student test user | denied on all |
| authenticated facilitator test user | denied on all |
| authenticated internal admin | allowed; expected fictional rows visible |
| service role | allowed; expected fictional rows visible |

The family/student/facilitator denial is intentional: the current portals use local access-code sessions and have no Supabase Auth ownership mapping. Full secure portal UI testing is blocked until that architecture is corrected.

## Production anonymous probe

A minimum `limit=1` anonymous request returned a row from pilot programs, participants, both assessment tables, module results, progress, wallets, badges, reward claims, kid sessions, and family links. `program_goals` was anonymously allowed but returned zero rows. Row contents were not printed or retained in this report.

This is a critical privacy finding. Production was not changed. The review-only emergency patch is `supabase/security/production_legacy_anon_lockdown_proposal.sql`; applying it now would break current anonymous portal traffic, so it requires an Auth/server-boundary migration and maintenance/rollback approval first.

## Decision

**NO-GO for production deployment.**

Staging schema compatibility and atomic signup integrity pass, but two release blockers remain:

1. production anonymous API access returns sensitive rows;
2. family/student/facilitator portal ownership is not represented by Supabase Auth, so secure scoped RLS cannot authorize legitimate users yet.

Keep learning and Kit features disabled. Keep `ALLOW_STAGING_DATABASE_MUTATIONS=false`. Do not deploy the family-signup code alone while the portal cannot securely hydrate the resulting account.

## Verification commands

- Full test suite: 66 suites, 297 tests passed.
- TypeScript: passed with no errors.
- Lint: passed with no errors; four pre-existing warnings remain.
- Production build: compiled successfully.
- Staging mutation gate restored to `false` after the final RPC correction.

The browser form accepted the fictional values and demonstrated the structured failure path: the loading state reset and every value remained. The server endpoint itself succeeded and redirected in its response contract, but a successful portal screenshot is intentionally unavailable because secure staging RLS blocks the access-code-only browser session. The pre-submit screenshot is in `docs/activation/screenshots/staging-signup-ready.png`; it must not be represented as proof of a successful portal redirect.

## Estimated production procedure after remediation

Estimated maintenance and smoke-test window: 60–90 minutes, excluding the Auth/ownership engineering work and review lead time.

1. Freeze production changes and record current deploy/database versions (5 minutes).
2. Re-run production anonymous probes and take a schema/policy backup (10 minutes).
3. Apply the reviewed Auth/server-boundary migration and production RLS patch in a transaction (10–15 minutes).
4. Deploy only the files in `narrow-critical-deployment-manifest.md` (10 minutes).
5. Submit a unique production-safe test family, verify one child/link, and repeat for idempotency (10 minutes).
6. Verify family hydration, baseline/B-4 state, replay state, rewards, refresh/sign-in persistence, and child isolation (15–25 minutes).
7. Repeat anonymous/cross-family negative tests and confirm Kit/provider/email logs remain empty (10 minutes).
8. Roll back the deploy and database transaction/policy restoration immediately if any authorization, hydration, or progress check fails.
