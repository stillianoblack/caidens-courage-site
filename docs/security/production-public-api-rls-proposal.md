# Production public API and RLS hardening proposal

Status: proposal only; not applied.
Scope: production metadata plus minimum anonymous `limit=1` probes from 2026-07-13. Response row contents were not printed. No production configuration was changed.

## Immediate conclusion

Do not apply a blanket policy rewrite directly to production. The deployed browser currently performs legitimate legacy operations through the anonymous Supabase client. Removing public policies before those calls move behind authenticated, server-mediated boundaries would break signup, portal hydration, assessment, progress, reward, goals, and gallery flows.

The anonymous probes returned at least one row from `pilot_programs`, `participants`, `assessment_results`, `assessment_results_v2`, `module_results`, `player_progress`, `player_wallets`, `player_badges`, `player_reward_claims`, `kid_play_sessions`, and `student_family_links`. `program_goals` was anonymously allowed but returned zero rows. This confirms the metadata finding is an active exposure, not merely a theoretical policy risk. Production deployment is NO-GO until remediated.

The review-only emergency deny patch is `supabase/security/production_legacy_anon_lockdown_proposal.sql`. It ends with `ROLLBACK` and must not be converted to a production migration until the current browser calls have server-mediated replacements and a restoration script has been generated from the captured inventory.

## Proposed remediation sequence

1. Add a durable ownership model.
   - Map each authenticated guardian/facilitator to allowed `pilot_programs` and `participants` records.
   - Use existing CRM `guardian_relationships`, organization memberships, and access grants only after their relationship to the legacy participant model is explicitly defined.
   - Do not infer authorization from email, access codes, last names, or client-selected participant IDs.

2. Move privileged legacy writes behind server functions.
   - Family signup, child linking, assessment writes, mission completion, wallet/badge changes, goals, and admin cleanup should use narrowly scoped server endpoints or RPCs.
   - Validate the authenticated user server-side and use the service role only inside the server boundary.

3. Replace unconditional policies in staging first.
   - Remove all `USING (true)` / `WITH CHECK (true)` policies on sensitive family, child, assessment, progress, reward, and session tables.
   - Add authenticated policies based on explicit ownership joins.
   - Leave service-role operations to server functions.
   - Verify an owner can access only linked children and a non-owner receives zero rows/authorization errors.

4. Tighten grants after policy verification.
   - Revoke anon CRUD from sensitive tables.
   - Grant authenticated users only the operations actually required after server migration.
   - Keep service role server-only.

5. Harden RPC execution.
   - Revoke anonymous execution of `rename_pilot_program_transaction`.
   - Require an authenticated admin role or server-only caller.
   - Change the function `search_path` from `public` to `pg_catalog, public` and schema-qualify referenced objects.
   - Revoke direct execution of trigger-only helper functions from anon/authenticated roles.

6. Harden Storage.
   - Remove anonymous upload/update policies for `adventure-assets`, `student_gallery`, and the orphan `camp-achievements` policy.
   - Use authenticated, owner-scoped paths or short-lived signed upload flows.
   - Decide whether gallery objects should remain public; if not, make the bucket private and serve signed URLs.
   - Confirm whether `camp-achievements` should exist before recreating it.

7. Reduce duplicate policy surface.
   - Consolidate duplicate public and anon policies so each table/operation has one auditable rule.
   - Add policy tests that fail whenever an unconditional sensitive-table policy is introduced.

## Staging authorization matrix

Before any production proposal is approved, verify these cases with fictional data:

| Actor | Linked child | Unlinked child | Admin operations | Provider writes |
| --- | --- | --- | --- | --- |
| anon | none | none | none | none |
| authenticated guardian | read/update explicitly permitted family fields | none | none | none |
| authenticated facilitator | program-scoped roster/actions only | none | none | none |
| internal admin | role-scoped admin endpoints | role-scoped | permitted endpoints only | still disabled |
| service role | server-only | server-only | server-only | disabled unless separately approved |

Required negative tests: anonymous SELECT/INSERT/UPDATE/DELETE, cross-family reads, forged participant IDs, forged family/program codes, direct RPC execution, direct wallet/reward mutation, and anonymous storage uploads.

## Production prerequisites

- successful staging compatibility and seed validation;
- a reviewed ownership schema and migration path;
- complete browser-to-server call inventory;
- passing RLS/RPC/storage negative tests;
- rollback scripts and a maintenance window;
- explicit product-owner approval.

No Kit setting, provider write flag, production schema, or production policy should change as part of this proposal review.
