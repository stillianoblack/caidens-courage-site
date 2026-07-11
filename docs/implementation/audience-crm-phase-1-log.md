# Audience / CRM Phase 1 Implementation Log

**Date:** 2026-07-11  
**Branch:** `main`  
**Scope:** Secure, additive, read-only CRM foundation

## Baseline

Pre-existing unrelated changes were recorded and preserved: `package-lock.json`, `yarn.lock`, and `supabase/audits/`. The preceding audit, blueprint, and four-phase log were also untracked at the start of this phase.

| Check | Baseline result |
|---|---|
| Type-check | Passed |
| Lint | Passed with four pre-existing warnings |
| Tests | 42 suites and 224 tests passed |
| Build | Passed with the existing bundle-size warning |

## Verified architecture

- React 18 / TypeScript / Create React App / React Router 6.
- Existing Admin uses a browser passcode; it remains unchanged for non-CRM screens.
- CRM authorization will use Supabase Auth bearer tokens verified in Netlify Functions.
- Server-side Supabase access uses the service-role key only inside Netlify Functions.
- Repository SQL is not a verified deployed-schema history; no remote database will be queried.
- Tests use CRA/Jest; backend helpers are CommonJS JavaScript.
- Server CRM flags are environment variables and default off.

## File-change plan

1. Add one additive Phase 1 migration with role definitions, adult contacts, organizations, memberships, invitations/access structures, audit events, and default-deny RLS.
2. Add server helpers for flags, bearer-token verification, role/scope authorization, correlation IDs, audit events, masking, pagination, and classification.
3. Add six read-only CRM endpoints and a disabled, one-time bootstrap endpoint.
4. Add a read-only Admin CRM tab with Overview, Contacts, Organizations, and Classification Preview views; it never reads CRM tables from the browser Supabase client.
5. Add authorization, classifier, migration-safety, and UI-state tests.
6. Add Phase 1 runtime/security/local-setup/rollback documentation.

## Migration plan

The migration is additive only and is not executed during this phase unless an unmistakably isolated local Supabase environment is already configured. All new tables enable RLS and expose no anonymous or ordinary authenticated policies. Role assignment and audit writes are server-only. Legacy records are neither backfilled nor changed.

## Feature flags

- `AUDIENCE_CRM_READ_ENABLED=false` by default
- `AUDIENCE_ORGANIZATIONS_ENABLED=false` by default
- `AUDIENCE_CLASSIFICATION_PREVIEW_ENABLED=false` by default
- `CRM_BOOTSTRAP_ENABLED=false` by default
- `REACT_APP_AUDIENCE_CRM_DISPLAY_ENABLED=false` controls navigation visibility only

## Rollback approach

Disable all server flags and the display flag first. This removes application exposure without deleting data. Revert the Phase 1 application commit if necessary. The additive tables remain default-deny; database removal is not part of the automated rollback and requires a separately approved change after confirming they contain no required audit/history data.

## Safety boundaries

- No existing record import, update, merge, or deletion.
- No Auth-user creation or metadata changes.
- No provider, email, Stripe, AI, deployment, or production database action.
- No child details in CRM responses; classification uses adult-bearing fields only and masks emails.

## Final validation

### Implemented

- One additive migration defining 13 default-deny CRM tables and four role definitions.
- Server bearer-token validation, role/scope authorization, server feature flags, correlation IDs, masking, and minimized logs.
- Six read-only CRM endpoints and one disabled/idempotent bootstrap endpoint.
- Read-only classifier using verified adult-bearing legacy sources only.
- CRM Overview, Contacts, Organizations, and Classification Preview Admin views.
- Five Phase 1 test suites covering 16 authorization, classifier, migration, endpoint-gate, and UI-safety cases.
- Runtime, security, local-setup, and rollback documentation.

### Results

| Check | Final result |
|---|---|
| Type-check | Passed |
| Lint | Passed with the same four pre-existing warnings |
| Phase 1 tests | 5 suites, 16 tests passed |
| Full tests | 47 suites, 240 tests passed |
| Build | Passed; existing bundle-size warning |
| JavaScript syntax | All new Netlify Function files passed `node --check` |
| Diff whitespace | `git diff --check` passed |

### Database execution

**NOT RUN — NO ISOLATED DATABASE.** No `supabase/config.toml` or unmistakably isolated local Supabase environment is configured. No remote database was queried. Static migration tests verify additive-only statements, required RLS enablement, absence of browser policies, adult-only contact kinds, and no unique normalized-email constraint.

### Remaining production prerequisites

- Verify the deployed Supabase schema before applying the migration.
- Rehearse migration and RLS tests in an isolated Supabase project.
- Bootstrap one existing Auth user in that isolated environment, then disable bootstrap.
- Require MFA for privileged CRM roles.
- Configure rate limiting/WAF, secrets, monitoring, retention, and operational ownership.
- Keep all production flags disabled until security review and staged acceptance complete.
