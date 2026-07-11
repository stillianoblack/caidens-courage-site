# Audience / CRM Phase 1 Local Setup

## Safe environment

Use only an isolated local/test Supabase project. Confirm its project reference is not production before running any SQL. This implementation did not connect to or migrate a database.

1. Apply `supabase/migrations/20260711_audience_crm_phase1_foundation.sql` in the isolated project.
2. Set server-only Supabase URL/service-role variables in the local Netlify runtime.
3. Set `AUDIENCE_CRM_READ_ENABLED=true`, `AUDIENCE_ORGANIZATIONS_ENABLED=true`, and optionally `AUDIENCE_CLASSIFICATION_PREVIEW_ENABLED=true`.
4. Set `CRM_PSEUDONYM_SALT` to a local secret.
5. Create the first Auth user through the normal Supabase Auth flow.
6. Temporarily set `CRM_BOOTSTRAP_ENABLED=true`, `CRM_BOOTSTRAP_ADMIN_EMAIL`, and `CRM_BOOTSTRAP_SECRET` server-side.
7. POST to the bootstrap function with the matching secret header. Confirm one assignment and audit event.
8. Set `CRM_BOOTSTRAP_ENABLED=false` and remove the bootstrap secret.
9. Set `REACT_APP_AUDIENCE_CRM_DISPLAY_ENABLED=true` only to show Admin navigation.

## Read-only verification

- Anonymous direct selects/inserts on every CRM table must fail.
- An authenticated user without a CRM assignment must receive 403.
- An organization admin must receive 404/403 for another organization.
- CRM UI requests must go only to `/.netlify/functions/crm-*`.
- Classification preview must leave CRM and legacy table counts unchanged.
- No import, merge, approve, sync, enroll, or convert control should appear.

## Validation

Run `yarn typecheck`, `yarn lint`, `CI=true yarn test --watchAll=false --runInBand`, and `yarn build`.
