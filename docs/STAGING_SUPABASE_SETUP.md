# Existing Supabase staging activation

This project uses the existing `gpcs***pqw` Supabase project as staging. Do not create a third Supabase project. Production remains `bnop***aen` and must never be linked or mutated from this workspace.

## Safety configuration

Store credentials only in the project-root `.env.local`; never commit or print them. The non-secret gates are:

```dotenv
ENVIRONMENT=staging
EXPECTED_STAGING_SUPABASE_PROJECT_REF=<EXISTING_STAGING_REF>
PRODUCTION_SUPABASE_PROJECT_REF=<PRODUCTION_REF>
ALLOW_STAGING_DATABASE_MUTATIONS=false
```

The configured browser and server Supabase URLs, expected staging ref, and CLI-linked ref must all resolve to the existing staging project. The production ref must differ from every one of them. Set `ALLOW_STAGING_DATABASE_MUTATIONS=true` only for an explicitly reviewed staging operation, then return it to `false` immediately.

Keep all learning, Kit, provider, webhook, scheduled-delivery, and email-write flags disabled. Server secrets must not use a `REACT_APP_` prefix.

## Completed staging provisioning (2026-07-13)

The existing staging project retained its 36 CRM/Auth tables and received the 23-table production legacy compatibility baseline. No production application rows, Auth users, contacts, storage objects, secrets, or provider data were copied.

Completed operations, all protected by the central staging/ref gate:

1. inventoried production schema metadata without reading application rows;
2. confirmed zero naming conflicts between the 23 legacy tables and 36 CRM tables;
3. applied `supabase/schema/production_legacy_baseline.sql` atomically;
4. applied `supabase/schema/staging_legacy_rls.sql`;
5. applied the deterministic `.example` fictional seed twice and verified idempotency;
6. applied only `20260713000200_family_signup_identity_integrity.sql`;
7. verified anonymous, family, student, and facilitator test identities cannot read sensitive legacy tables, while internal admin and service-role checks pass;
8. ran the family-signup endpoint twice with the same idempotency key and confirmed one family and one named student;
9. confirmed the signup created no Auth user and no CRM contact.

The learning migration `20260713000100_learning_engagement_foundation.sql` was not applied. Kit writes remained disabled.

## Repeatable commands

Review the target before any write:

```bash
npm run db:safety:baseline
```

The guarded operations are deliberately enumerated; the executor does not accept arbitrary SQL paths:

```bash
npm run db:apply:baseline
npm run db:apply:rls
npm run db:apply:seed
npm run db:apply:critical-signup
```

Read-only/invariant checks:

```bash
node scripts/verifyStagingFixture.js
node scripts/verifyStagingLegacyRls.js
npm run db:verify:family-signup
```

## Authorization limitation

The deployed family, student, and facilitator portals still establish access-code/local-storage sessions rather than Supabase Auth identities. Staging therefore denies their direct browser access instead of pretending an access code is an ownership boundary. Internal admins are authorized through the existing CRM role assignment, and server functions use the service role.

Before family/student/facilitator portal UI verification can pass under secure RLS, add a reviewed Auth-backed ownership mapping and move permitted legacy reads/writes behind authenticated, server-validated boundaries. Do not weaken staging RLS to reproduce production's public policies.

## Rollback

- Stop testing and set `ALLOW_STAGING_DATABASE_MUTATIONS=false`.
- The critical signup migration rollback proposal is `supabase/rollbacks/20260713000200_family_signup_identity_integrity_rollback.sql`.
- Fictional fixed-ID seed cleanup is `supabase/seeds/staging_fictional_cleanup.sql` and must run only through the staging gate.
- Do not delete or recreate the existing staging project; it contains the retained CRM activation.
- Never run cleanup, reset, link, or migration commands against production.

## Current decision

Staging schema provisioning and the atomic signup endpoint pass. Full portal activation and production deployment remain NO-GO because portal identity is not Auth-backed and production anonymous probes returned sensitive rows. See `docs/activation/legacy-staging-provisioning-report.md` and `docs/security/production-public-api-rls-proposal.md`.
