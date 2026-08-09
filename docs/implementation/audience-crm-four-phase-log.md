# Audience / CRM Four-Phase Implementation Log

**Date:** 2026-07-11
**Branch:** `main`
**Overall status:** **BLOCKED — REQUIRES REVIEW**
**Production changes:** None
**Migrations executed:** None
**External calls:** None

## 1. Why implementation stopped

The architectural source of truth, [`audience-crm-implementation-blueprint.md`](../architecture/audience-crm-implementation-blueprint.md), explicitly states that no migration should be written until its “Definition of ready for the first migration” is satisfied. The repository and task context do not establish completion or approval of the following prerequisites:

1. Product approval of organization, unit, role, lifecycle, customer, interest, and screen taxonomies.
2. Legal/privacy approval of consent purposes, notice versions, suppression, retention, adult/child boundaries, and jurisdictional requirements.
3. Security approval of the replacement Admin authentication, MFA, role hierarchy, service identities, and RLS model.
4. Verification of the deployed Supabase schema against repository SQL.
5. A documented production backup and restore rehearsal.
6. Approval to run aggregate-only production data-quality queries.
7. Approved shared-email, multiple-email, identity-linking, and manual-merge rules.
8. Current official Kit, Flodesk, Stripe, and AI-provider capability verification.
9. Approved migration rollback and feature-flag design.
10. Defined read-only preview acceptance criteria and reconciliation tolerances.
11. Named owners for migration, security, privacy, provider, finance, and rollback checkpoints.

The implementation request also says to stop a phase when a prerequisite is unsafe, ambiguous, or inconsistent with the blueprint. Proceeding with database migrations, Admin authorization, consent behavior, provider synchronization, Stripe automation, or AI data handling without these decisions would violate that instruction.

## 2. Pre-flight baseline

### Working tree

Pre-existing changes observed before implementation:

- Modified: `package-lock.json`
- Modified: `yarn.lock`
- Untracked: `supabase/audits/`
- Untracked audit/architecture documents created in the preceding approved audit and blueprint tasks

These changes were not overwritten, reverted, staged, or committed during this attempt.

### Discovered architecture

| Area | Actual repository state |
|---|---|
| Framework | React 18, TypeScript 4.9, Create React App, React Router 6 |
| Admin entry | Nested `/admin` routes in `src/App.tsx`; UI in `src/pages/AdminPortalPage.tsx` |
| Admin authorization | Build-time `REACT_APP_ADMIN_EMAIL` and `REACT_APP_ADMIN_PASSCODE`, checked in the browser; session state stored in browser storage |
| Supabase client | Browser client using public anonymous key in `src/lib/supabaseClient.js` |
| Database representation | A mixture of manually run SQL files and a small `supabase/migrations/` directory; no verified deployed-schema manifest |
| RLS | Existing legacy tables include broad anonymous/authenticated policies; no Audience tables exist |
| Auth | Supabase Auth is used opportunistically by some portal utilities; no authoritative profile/role/membership system exists in repository migrations |
| Backend | Netlify JavaScript Functions; no trusted general Admin API layer |
| Stripe | Payment Links and product configuration; no verified webhook ledger |
| Kit | Browser-triggered Netlify endpoint and server-side Kit v4 helper; endpoint lacks trusted Admin/event authorization and upsert requests active subscriber state |
| Transactional email | Resend through a public Netlify endpoint; no email was invoked during this work |
| Tests | CRA/Jest, ESLint, TypeScript, production build |
| Feature flags | Mostly client constants; no server-controlled CRM feature-flag service |

### Baseline command results

| Check | Result | Notes |
|---|---|---|
| `yarn typecheck` | PASS | Exit 0 |
| `yarn lint` | PASS WITH WARNINGS | Exit 0; four pre-existing warnings in `useKidShellNavigate.ts`, `gradeQuestionRouting.test.ts`, and `gradeQuestionRoutingAudit.ts` |
| `CI=true yarn test --watchAll=false --runInBand` | PASS | 42 suites, 224 tests; existing console warnings including React `act(...)` and missing active program context |
| `yarn build` | PASS | Existing bundle-size warning; no deployment |

The baseline build output was local only and is excluded from version control.

## 3. Contradictions and ambiguities

### Blueprint readiness versus implementation request

The implementation request authorizes four phases, but also names the blueprint as source of truth and requires stopping unsafe/ambiguous phases. The blueprint forbids writing the first migration before its readiness checklist is approved. The safer, explicit instruction is therefore to stop and document blockers.

### Secure Admin requirement versus current access model

Phase 1 requires server-verifiable Admin roles and restrictive RLS, but the repository has no server-side Admin identity/role authority. Choosing an Auth/MFA/role model changes access for real administrators and requires product/security ownership. A guessed role bootstrap could lock out legitimate administrators or grant excessive access.

### Deployed schema versus repository SQL

The task asks to identify the deployed database schema “represented by migrations,” but the repository includes many manually run setup/migration SQL files with no authoritative applied-history record. Repository inspection cannot prove which objects or policies are deployed. No live database query was authorized or performed.

### Feature flags

The task requires server-controlled flags. The repository has no such framework. Adding client environment flags would not meet the security requirement. Selecting a flag service, database-backed flag table, or server environment strategy requires an approved operational owner and access model.

### Provider choice and capabilities

Kit exists but is currently unsafe for automatic marketing activation. Flodesk capability and credentials are not established. Live/current vendor capability verification and provider approval are prerequisites to Phase 3.

### Consent and identity

Current consent data is insufficient, and shared-email/identity rules are undecided. Those choices affect unique constraints, data retention, segmentation, and legal behavior; they cannot be safely inferred from code.

## 4. Files expected to change after approval

This is a planning inventory, not a completed change list.

### Phase 1

- New additive migration(s) under `supabase/migrations/`
- New server-side Admin authorization helpers and Audience read endpoints under `netlify/functions/`
- New CRM types/services under `src/types/` and `src/lib/`
- `src/App.tsx`, `src/pages/AdminPortalPage.tsx`, `src/data/adminPortalContent.ts`, and Admin styles/components
- Server and client feature-flag definitions
- Authorization, classifier, and UI tests

### Phase 2

- Additive consent, lifecycle, interest, customer, activity, task, note, and segment migrations
- Protected CRM write endpoints and services
- Provider-neutral contract and mock adapter
- CRM workflow UI and tests

### Phase 3

- Additive provider/outbox/webhook/commerce-event migrations
- Provider worker, adapter, webhooks, Stripe webhook, invitation/onboarding endpoints
- Email Journeys and Sync Activity UI
- Contract, idempotency, retry, signature, conversion, and safety tests

### Phase 4

- Server-only provider-neutral AI service and redaction/validation layer
- Approval-only assistant UI
- Audit/usage records and safety tests

## 5. Proposed migration sequence after readiness approval

All migrations remain additive and must first run in an isolated local/test Supabase environment.

1. Admin roles, profiles, organizations, units, contacts, sources, identity links, memberships, invitations, access grants, guardian relationships, and audit events.
2. Consent events/preferences, lifecycle events/projection, interests, customer relationships, entitlements, notes, tasks, activities, segment definitions, and eligibility.
3. Provider accounts/contacts/mappings, sync outbox/attempts, webhook events, commerce events, and processing state.
4. AI request/audit metadata only if the approved design requires persistence.

Each migration needs default-deny RLS, negative authorization tests, a forward rehearsal, a rollback/disable plan, and an approval checkpoint. No legacy row is updated by these foundation migrations.

## 6. Required feature flags

The approved implementation must provide server-authoritative flags with the following production defaults:

| Flag | Default outside local/test | Local/test default |
|---|---:|---:|
| `audience_crm_read` | disabled | may be enabled after Auth/RLS tests |
| `audience_crm_write` | disabled | disabled until Phase 2 tests pass |
| `audience_organizations` | disabled | may be enabled read-only after Phase 1 |
| `audience_activities` | disabled | may be enabled after Phase 2 |
| `audience_segments` | disabled | may be enabled preview-only after Phase 2 |
| `audience_provider_sync` | disabled | disabled unless explicit sandbox configuration exists |
| `audience_stripe_automation` | disabled | disabled unless explicit Stripe test configuration exists |
| `audience_ai_assistant` | disabled | disabled unless explicit server-side test configuration exists |

Client flags may hide routes but never grant authorization.

## 7. Rollback approach

- Keep all schema additions isolated from legacy portal tables and behavior.
- Disable routes and workers through server-authoritative flags before reverting application code.
- Never delete outbox, consent, lifecycle, commerce, webhook, or audit history during rollback.
- Make current-state projections rebuildable from append-only events.
- Stop provider workers without discarding queued/held intents.
- Preserve the most restrictive consent state during every rollback.
- Reverse new links/memberships with audited status changes rather than destructive deletion.
- Do not remove the legacy Admin mechanism until the replacement is verified and a backward-compatible transition is approved; it must never authorize Audience APIs.

## 8. Phase status

### Phase 1 — Foundation

**BLOCKED — REQUIRES REVIEW**

- **Exact blocker:** No approved Admin Auth/MFA/role bootstrap; deployed schema is unverified; no approved RLS/tenant-scope model; blueprint readiness checklist is incomplete.
- **Affected areas:** `src/config/adminAccess.ts`, `src/pages/AdminPortalPage.tsx`, `src/App.tsx`, `src/lib/supabaseClient.js`, new Netlify functions, new migrations, Admin navigation.
- **Risk:** Incorrect implementation could expose adult/child PII, grant unauthorized cross-organization access, lock out existing Admins, or create schema conflicts.
- **Recommended resolution:** Security/product/database owners approve the role bootstrap, organization scope, deployed-schema diff, default-deny policies, feature-flag authority, and isolated migration environment.
- **Still valid:** Completed audit, blueprint, pre-flight architecture map, baseline results, and proposed additive/rollback sequence.

Because Phase 1 is blocked, no read-only CRM UI was added: even read-only data would be unsafe behind the current browser passcode and anonymous Supabase policies.

### Phase 2 — Business workflows

**BLOCKED — REQUIRES REVIEW**

- **Exact blocker:** Phase 1 security/data foundation is unavailable; consent language/purposes, identity rules, lifecycle/customer evidence, and note-retention policy are unapproved.
- **Affected areas:** Future consent/lifecycle/activity/segment migrations, protected write APIs, CRM workflow UI, provider contract.
- **Risk:** Invalid consent claims, duplicate identities, unauthorized writes, sensitive notes, and unsafe segment eligibility.
- **Recommended resolution:** Complete and approve Phase 1 plus legal/privacy/product decisions.
- **Earlier work still valid:** Phase 1 planning artifacts and the provider-neutral architecture.

### Phase 3 — Automation

**BLOCKED — REQUIRES REVIEW**

- **Exact blocker:** Phases 1–2 are incomplete; no approved provider/capability matrix, sandbox, webhook secret/signature contract, Stripe webhook configuration, or customer identity rules exist.
- **Affected areas:** Kit helper/endpoints, future adapter/outbox/webhooks, Stripe ledger, onboarding, journey/sync UI.
- **Risk:** Real subscriber mutation, email enrollment without consent, suppression weakening, webhook spoofing, incorrect customer conversion, or wrong organization assignment.
- **Recommended resolution:** Approve provider and Stripe sandbox designs after Phases 1–2; keep all automation disabled until contract tests pass.
- **Provider limitation:** Existing Kit code can upsert contacts as active and does not implement full suppression/reconciliation semantics; Flodesk capabilities are unverified.

### Phase 4 — Intelligence

**BLOCKED — REQUIRES REVIEW**

- **Exact blocker:** Phases 1–3 are incomplete; no approved AI provider, data-processing terms, redaction schema, model policy, rate/usage limits, or safe source-scope contract exists.
- **Affected areas:** Future server AI service, assistant UI, audit/usage records, redaction and approval tests.
- **Risk:** Adult or child PII disclosure, hallucinated CRM facts, unapproved state changes, or hidden automation.
- **Recommended resolution:** Approve a provider-neutral AI safety/data contract after the CRM authorization and domain model are operational.

## 9. Required approvals to resume

| Owner | Approval/evidence needed |
|---|---|
| Security | Supabase Auth/MFA architecture, role bootstrap, server authorization, RLS scope, service identities |
| Database owner | Deployed schema inventory, isolated local/test project, backup/restore evidence, migration conventions |
| Product | Taxonomies, Admin capabilities, workflow precedence, ambiguity handling |
| Legal/privacy | Consent, suppression, retention, notes, exports, provider/AI data rules |
| Finance | Stripe source-of-truth and customer/entitlement transition rules |
| Marketing | Provider choice, Kit transition, segment/journey mappings, sandbox recipients |
| Engineering/operations | Server feature flags, queues/workers, kill switches, webhooks, monitoring, rollback owners |

## 10. Safety verification

- No production migration was written or executed.
- No database was queried or modified.
- No Auth user, profile, participant, student, guardian, facilitator, program, purchase, membership, subscription, assessment, or progress record was changed.
- No live Kit, Flodesk, Stripe, email, or AI API was called.
- No email was sent.
- No provider subscriber, segment, workflow, or journey was created or changed.
- No child data was sent to a marketing or AI provider.
- No dependency was installed or removed.
- No deployment, push, or production feature activation occurred.
- No phase commit was created because no phase passed its required gate.
- Pre-existing unrelated working-tree changes were not overwritten.
