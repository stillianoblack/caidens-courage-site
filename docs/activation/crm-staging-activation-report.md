# CRM Staging Activation Report

**Status:** **PARTIAL — REQUIRES CONFIGURATION**

**Reviewed:** 2026-07-11

The configured hosted URL and `REACT_APP_SUPABASE_EXPECTED_PROJECT_REF` resolve to the same masked project reference (`gpcs***pqw`). The product owner identifies this project as `caidens-courage-staging`, separate from production. Production was not queried or modified.

The mandatory credential and target gate passed without printing secret values. `KIT_API_KEY`, `CRM_ADULT_TEST_EMAIL`, and the staging feature flags remain absent. No substitute email was inferred.

## Migration review

The three Phase 1–3 SQL files were reviewed in order. They create tables, indexes, role/segment seed definitions, comments, and an outbox claim function; add only `role_title`, `audience_type`, `do_not_enroll`, and `provider_sync_hold` columns; and enable RLS without browser policies. No `DROP`, `TRUNCATE`, destructive `ALTER`, legacy-row update, contact creation, organization creation, or automatic provider-queue insertion was found.

The Phase 3 `UPDATE` occurs only inside the service-role-only atomic outbox claim function and affects an explicitly claimable pending/retryable row. New outbox rows default to `held`.

The duplicate migration versions were resolved locally without changing SQL contents:

1. `20260711000100_audience_crm_phase1_foundation.sql`
2. `20260711000200_audience_crm_phase2_workflows.sql`
3. `20260711000300_audience_crm_phase3_kit_automation.sql`

Pre/post SHA-256 hashes match for every file.

## Activation results

| Area | Result |
|---|---|
| Target proof | Passed: URL reference equals expected reference; owner identified it as staging |
| Migration application | Passed: exactly Phase 1–3 applied through an isolated staging-only CLI workspace; remote history is current |
| Hosted tables and RLS | Passed: 36/36 service-role reachable, 36/36 hidden from anonymous reads, anonymous insert denied with 401 |
| Empty-state invariants | Passed: zero contacts, organizations, outbox rows, and provider contacts after migration and test cleanup |
| Seed definitions | Passed: four role definitions and thirteen segment definitions |
| Real authorization matrix | Passed: no-role denial, internal/audience global access, organization scope, read-only restriction, and browser-table protection |
| Exact admin bootstrap | Passed: one exact Auth match, one `internal_admin` assignment, one audit event, idempotent second call |
| Bootstrap shutdown | Passed: ephemeral runtime flag disabled; persistent `CRM_BOOTSTRAP_ENABLED` is absent |
| Staging feature flags | CRM/display flags enabled; provider, Kit write, webhook, and MCP flags false |
| CRM screens | Supabase Auth sign-in and server role resolution implemented; signed-out route verification completed, credentialed browser verification pending product-owner password entry |
| Jordan Test contact | Not created; private adult email absent |
| Kit read-only | Not run; key absent |
| Reconciliation preview | Not run |
| Kit mappings | Proposal only; nothing stored |
| Kit write canary | Prepared only; not approved or executed |

## Local validation

- Type-check: passed.
- Lint: passed with four existing warnings and no errors.
- Full test suite: 56 suites and 260 tests passed.
- Controlled webhook fixtures: passed for unsubscribe, duplicate delivery, malformed payload, invalid secret, unresolved subscriber, restrictive-state precedence, and non-reactivation after a later purchase.
- Production build: compiled successfully. The build was validation only and was not deployed.
- Real staging RLS/authorization: passed with disposable users and complete cleanup.
- Real Kit read-only tests: blocked by missing `KIT_API_KEY`.

## Required continuation

Complete credentialed browser verification with the bootstrapped staging user. Configure `CRM_ADULT_TEST_EMAIL` with a product-owner-controlled adult address before creating Jordan Test. Optionally configure the server-only Kit read-only key. Kit and provider write flags remain disabled until the separate canary approval.

No database reset, production query, beta-user access, provider mutation, email, deployment, commit, or push occurred.
