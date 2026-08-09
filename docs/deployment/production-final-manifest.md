# Production final manifest

Status: **NO-GO — prepared only; production unchanged**
Prepared: 2026-07-14

This is the authoritative production-readiness runbook. It does not authorize deployment, database changes, email, provider sync, or Kit writes.

## A. Current facts

- Production has 23 legacy public tables, no CRM tables, and no portal-ownership tables.
- Anonymous probes returned rows from sensitive program, participant, family-link, assessment, progress, reward, and session tables. The current public boundary is unsafe.
- Staging has 62 public tables, nine unique ledger entries, zero duplicate migration versions, and no learning objects.
- Staging Auth ownership/RLS passes the disposable guardian/student/facilitator/admin/service matrix.
- Legacy access-code compatibility remains enabled; it does not create Auth ownership.
- Kit provider writes, webhooks, sync, MCP actions, and email delivery remain disabled. The real GET-only check is blocked by HTTP 401 from Kit.
- Production schema and row data have not been mutated by this workflow.

## B. Required approvals and owners

Before the window, record named approval from the product owner, database owner, application release owner, and privacy/security reviewer. Assign one operator and one independent verifier. Require an on-call rollback owner for the full observation period.

## C. NO-GO blockers

1. Inventory every production browser call that directly reads/writes the 16 sensitive legacy tables.
2. Move required writes—assessment, progress, wallet/badge/reward, goals, gallery, session, child link, and program mutation—behind authenticated server endpoints/RPCs.
3. Generate a production-specific policy/grant migration from the fresh production inventory. Do not apply `staging_legacy_rls.sql` or the review-only lockdown SQL verbatim.
4. Generate an exact restoration script for every production policy, grant, function privilege, and Storage policy changed.
5. Map real family/student/facilitator Auth user IDs to explicit programs/participants; obtain human review. Never infer from email/access codes.
6. Rehearse forward and rollback sequences on a fresh production clone with production-shaped, de-identified data.
7. Pass anonymous, cross-family, forged-ID/code, direct-write, RPC, Storage, admin, and service-role tests.
8. Resolve or explicitly defer the invalid Kit credential. All Kit write flags must remain false either way.
9. Confirm backups/PITR and measure restore time.
10. Obtain explicit production-window approval after all evidence is attached.

Any unresolved item is a stop condition.

## D. Scope

### Included after GO

1. CRM Phase 1 foundation.
2. CRM Phase 2 workflows.
3. CRM Phase 3 provider/outbox schema, with every Kit/provider write flag false.
4. Family-signup identity integrity migration.
5. Auth portal ownership schema.
6. Ownership helper hardening/recursion fix.
7. A newly generated **production-specific** ownership RLS/grant migration.
8. PostgREST schema reload.
9. Corresponding application/server changes and feature flags, with access-code compatibility still true.

### Explicitly excluded

- `20260713000100_learning_engagement_foundation.sql` and all learning/achievement communication expansion.
- staging safety gate, production-derived baseline, staging RLS, staging seed, and staging cleanup SQL.
- `production_legacy_anon_lockdown_proposal.sql` as written.
- historical standalone setup/migration SQL already represented by production.
- Kit writes, sync, webhooks, subscriber/tag/sequence mutation, and email sends.
- disabling legacy access-code compatibility.

## E. Preflight (read-only)

Run in this order and attach sanitized outputs:

1. Verify the CLI/API target equals the recorded production project ref and differs from staging.
2. Keep the production mutation gate/approval mechanism closed.
3. Export fresh schema metadata: tables, columns, constraints, indexes, functions, triggers, RLS policies, grants, Storage buckets/policies, extensions, and migration history.
4. Run the family identity dry-run audit; stop on ambiguous duplicate candidates.
5. Compare migration versions and checksums; stop on duplicates, drift, or a version present with different SQL.
6. Confirm required extensions and exact prerequisites for CRM Phase 1.
7. Confirm backup/PITR timestamp and restoration owner.
8. Run synthetic read-only smoke checks for current signup/portal/admin flows.
9. Confirm every provider/email/write flag is false in the deploy environment.
10. Review the generated production RLS forward and restoration SQL line-by-line.

## F. Clone rehearsal

Restore the fresh production snapshot into an isolated project. Apply the exact proposed sequence below. Run full app, database, Auth, RLS, RPC, Storage, and rollback tests. Restore again and repeat until forward and rollback are deterministic. A staging pass alone is insufficient because production currently has different schema, policies, grants, Storage, and migration history.

## G. Exact forward order after approval

Each migration is a separate transaction. Reconcile the ledger after each commit. Never use a general push that includes the deferred learning migration.

1. `20260711000100_audience_crm_phase1_foundation.sql`
2. Verify CRM objects, RLS, bootstrap disabled, no provider writes.
3. `20260711000200_audience_crm_phase2_workflows.sql`
4. Verify activities/tasks/segments and authorization.
5. `20260711000300_audience_crm_phase3_kit_automation.sql`
6. Verify provider/outbox tables; confirm all workers/writes disabled.
7. `20260713000200_family_signup_identity_integrity.sql`
8. Verify service-only RPC grants, uniqueness, idempotency, timeout/retry behavior.
9. `20260714000100_auth_portal_ownership.sql`
10. Apply reviewed real-account ownership grants from an approved mapping; verify audit totals.
11. `20260714000300_portal_participant_rls_helper_hardening.sql`
12. `20260714000400_portal_participant_rls_recursion_fix.sql`
13. Apply the generated production-specific ownership RLS/grant migration. Its semantics may derive from `20260714000200_staging_portal_ownership_rls.sql`, but its policy drops, grants, and rollback must match the fresh production inventory.
14. `20260714000500_portal_postgrest_schema_reload.sql`
15. Deploy server/application code with Auth ownership enabled and access-code compatibility still enabled.
16. Run smoke/negative tests before opening normal traffic.

Migration history repair is allowed only when live schema evidence proves SQL already executed successfully. Never use repair to conceal a failed or partially applied migration.

## H. Validation matrix

| Actor | Required result |
|---|---|
| Anonymous | No sensitive table rows; no direct writes; no privileged RPC/Storage upload. |
| Guardian | Only explicitly granted children/program; no sibling/family crossover; no direct protected writes. |
| Student | Only explicit self/program scope. |
| Facilitator | Assigned program roster only. |
| Internal admin | Authenticated role-scoped admin access and audit events. |
| Service role | Server-only operation; never exposed to browser. |
| Kit/provider | GET-only if credential valid; every mutation path disabled. |

Functional checks: family signup idempotency; family link/hydration; baseline and B-4 assessment; module/progress/reward idempotency; goals/gallery/session behavior; admin CRM screens; sign-in/sign-out; compatibility access codes; error/timeout recovery.

## I. Rollback order

Trigger rollback for any authorization leak, widespread 401/403, signup corruption, data-integrity error, migration drift, or unexplained elevated error rate.

1. Close traffic or enable maintenance mode; disable new signup and portal writes.
2. Roll back application code/feature flags; set Auth ownership false if the old boundary must resume. Keep all provider/email writes false.
3. Run the generated production policy/grant restoration script and reload PostgREST.
4. Roll back 004, then 003, only if the ownership helper sequence must be removed.
5. Run ownership rollback in dependency order: ownership RLS first, then `20260714000100_auth_portal_ownership_rollback.sql`.
6. Run `20260713000200_family_signup_identity_integrity_rollback.sql` only if the signup migration is the cause and data prerequisites permit it.
7. CRM Phases 3→2→1 have no repository down migrations; use the rehearsed backup/restore or approved forward-fix plan. Do not improvise destructive drops.
8. Reconcile migration history only after rollback state is independently verified.
9. Repeat anonymous and cross-family probes before reopening traffic.

If restoration cannot complete inside the approved recovery objective, restore the pre-window snapshot/PITR target.

## J. Downtime, monitoring, and stop rules

Plan a maintenance window because production policy replacement can immediately break current anonymous browser flows. Expected user impact includes blocked signup, portal reads/writes, assessment/progress saves, and admin access during validation. The exact duration must come from clone rehearsal; do not promise zero downtime.

Monitor authentication failures, 401/403/5xx rates, signup RPC failures, database locks/latency, RLS denial logs, audit events, duplicate/idempotency conflicts, and provider/email queues. Observe through at least one normal usage cycle before declaring complete.

Immediate stop/rollback conditions:

- target ref or migration history mismatch;
- any anonymous sensitive row or write;
- any cross-family/cross-program row;
- owner unable to access explicitly granted data;
- service-role key visible client-side;
- any Kit/email/provider non-GET action;
- learning objects appear;
- partial migration or missing rollback evidence;
- data loss, duplicate identities, or unrecoverable signup failure.

## Final approval gate

Production remains NO-GO until sections B–F are signed, all blockers are closed, the clone rehearsal evidence is attached, and the user gives an explicit production-change instruction in a new task. This document itself grants no authority to mutate production.
