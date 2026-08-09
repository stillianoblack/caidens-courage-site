# SQL environment manifest

Authoritative as of 2026-07-16. This inventory covers every `*.sql` file in the repository. It supersedes older status prose where counts or staging state differ.

## Status vocabulary

- **Applied (ledger):** present in `supabase_migrations.schema_migrations` in staging.
- **Represented by baseline:** the standalone file was not executed; its production-derived object/change is already contained in `production_legacy_baseline.sql` and present in staging.
- **Applied operationally:** executed through the staging safety-gated operation, but intentionally not a migration-ledger entry.
- **Deferred:** intentionally unapplied.
- **Review-only / rollback-only:** must never run in normal forward order.
- **Pending approval:** candidate for a future production window; not executed.
- **Never:** environment must not execute this file.

Live staging evidence: 62 public tables, all ownership tables RLS-enabled, ten remote migration-ledger versions, zero learning objects, zero disposable test Auth users, and mutation gate false. The live schema also contains the objects from `20260715000200` and `20260715000300`, but those versions are absent from the remote ledger. The former duplicate local `20260628` prefix was corrected to unique versions `20260628000100` and `20260628000200` without changing SQL behavior; no migration was replayed. Source: `docs/audits/staging-state-inventory.json` and the 2026-07-16 read-only ledger/schema comparison.

## Ordered migrations

| File | Purpose and dependency | Staging | Production | Rollback / evidence |
|---|---|---|---|---|
| `20260627_pilot_programs_protection_levels.sql` | Legacy program protection columns; depends on `pilot_programs`. | Represented by baseline; file not executed. | Existing schema; never replay. | Production inventory/baseline. |
| `20260628000100_pilot_program_code_transaction.sql` | Transactional program-code rename RPC; depends on program/participant tables. Renamed locally from the duplicate short `20260628` prefix without changing behavior. | Represented by baseline; file not executed. | Existing schema; never replay. | Baseline contains RPC; production hardening must restrict it. |
| `20260628000200_repair_gdi_orphaned_program_code_refs.sql` | One-time legacy orphan repair; ordered after `20260628000100`. Renamed locally without changing behavior. | Never; fixture has no target data. | Never without a fresh dry-run and approval. | Audit SQL only; data rollback would require captured rows. |
| `20260710_commerce_products.sql` | Commerce product configuration. | Represented by baseline. | Existing schema; never replay. | Production inventory. |
| `20260711000100_audience_crm_phase1_foundation.sql` | CRM contacts, consent, roles, audit foundation. | **Applied (ledger)** first. | Pending approval after legacy lockdown readiness. | Phase-specific down migration is not present; restore from backup if needed. |
| `20260711000200_audience_crm_phase2_workflows.sql` | CRM activities, tasks, notes, segments; depends on Phase 1. | **Applied (ledger)** second. | Pending approval after Phase 1. | No down file; backup/forward fix required. |
| `20260711000300_audience_crm_phase3_kit_automation.sql` | Provider mappings/outbox/Kit automation tables; depends on Phases 1–2. | **Applied (ledger)** third; all writes disabled. | Pending approval only with Kit writes still false. | No down file; backup/forward fix required. |
| `20260713000100_learning_engagement_foundation.sql` | Five learning/achievement/communication tables, question seed, goal column. | **Deferred**: unnecessary for CRM/Kit and overlaps communication infrastructure. | **Never in current production plan.** | No rollback exists; stop until separately designed. |
| `20260713000200_family_signup_identity_integrity.sql` | Idempotent service-only family signup transaction and uniqueness. | **Applied (ledger)**; SQL not replayed during reconciliation. | Pending approval in signup window. | `rollbacks/20260713000200_..._rollback.sql`. |
| `20260714000100_auth_portal_ownership.sql` | Explicit Auth-to-program/participant grants and audit; depends on legacy tables/Auth. | **Applied (ledger)**. | Pending approval after reviewed account mapping. | Matching rollback `20260714000100_...`. |
| `20260714000200_staging_portal_ownership_rls.sql` | Auth ownership SELECT policies; writes remain server/admin-only. | **Applied (ledger)** after ownership. | **Prohibited verbatim.** Production requires a separately reviewed forward/restoration policy set after all protected browser flows are server-mediated. | Staging rollback is not a production rollback. |
| `20260714000300_portal_participant_rls_helper_hardening.sql` | Verified RLS helper hardening. | **Applied (ledger)**. | Include after ownership if retained by final rehearsal. | Matching rollback; superseded in part by 004. |
| `20260714000400_portal_participant_rls_recursion_fix.sql` | Removes participant-policy self-reference. | **Applied (ledger)**. | Include after 003. | Matching rollback. |
| `20260714000500_portal_postgrest_schema_reload.sql` | Explicit PostgREST schema refresh after policy changes. | **Applied (ledger)**. | Run last if production policy metadata changes. | No persistent object; no-op rollback. |
| `20260715000100_b4_variant_preference.sql` | Additive allowlisted participant cosmetic preference. | **Applied (ledger)**; live ownership/persistence test passed. | Pending approval after backup; run after ownership migrations. | `rollbacks/20260715000100_b4_variant_preference.rollback.sql`; rollback removes saved choices. |
| `20260715000200_independent_family_child_creation.sql` | Additive child idempotency column/index and service-role child-creation RPC; depends on legacy family tables and CRM Phase 1 `admin_audit_events`. | **Applied in live schema, missing from ledger.** Reconcile history only after checksum/object review; do not replay. | Pending review only after its Phase 1 dependency, production-specific RLS, backup, and prechecks. | No dedicated down migration; retain additive objects on app rollback or use a reviewed forward fix. |
| `20260715000300_b4_selection_onboarding_legacy_staging.sql` | Historical staging operation: adds explicit-selection timestamp and backfills every existing participant. Retained only so the ledger can describe what actually ran. | **Applied operationally, missing from ledger.** Do not replay. History repair requires explicit approval after object review. | **Prohibited.** The unbounded backfill must never run in production. | No safe row-level rollback; staging history only. |
| `20260715000400_b4_selection_onboarding.sql` | Production-safe replacement: adds the timestamp without confirming defaults and normalizes only exact legacy `spark` values; includes pre/postchecks and canonical constraint restoration. | **Pending; not executed.** | Pending approval after rehearsal; bounded/idempotent production candidate. | Retain additive column on app rollback; audited forward correction only. |

Earlier staging history repairs used `supabase migration repair --status applied` only after live schema evidence proved already-executed changes. The two 20260715 schema/ledger discrepancies above remain unresolved; no applied SQL was replayed during this preflight.

## Operational schema, security, and seed SQL

| File | Purpose / dependency | Staging | Production | Rollback / order |
|---|---|---|---|---|
| `schema/staging_safety_gate.sql` | Enforces expected staging ref/environment/mutation flag. | Applied operationally before all staging operations. | **Never.** | Drop only when retiring staging tooling. |
| `schema/production_legacy_baseline.sql` | Exact 23-table production-derived legacy compatibility baseline. | Applied operationally once. | **Never**; production is its source. | Restore staging snapshot/drop provisioned objects only in isolated reset. |
| `schema/staging_legacy_rls.sql` | Removes broad public legacy access; internal-admin/service boundary. | Applied operationally after baseline. | Never verbatim; production needs reviewed plan. | Restore captured policies/grants. |
| `seeds/staging_fictional_seed.sql` | Reserved `.example` fictional programs/participants/results. | Applied operationally; idempotent. | **Never.** | `staging_fictional_cleanup.sql`. |
| `seeds/staging_fictional_cleanup.sql` | Deletes only reserved fictional fixture IDs/markers. | Cleanup-only; not run in final state. | **Never.** | Seed again if needed. |
| `security/production_legacy_anon_lockdown_proposal.sql` | Review-only emergency revoke/drop-policy proposal; ends in `ROLLBACK`. | Review-only. | **Pending approval; never run as-is.** | Exact restoration must be generated from inventory. |

The requested name `production_public_api_rls_proposal.sql` does not exist. The corresponding design is `docs/security/production-public-api-rls-proposal.md`; the only SQL proposal is the lockdown file above.

## Rollback files

| File | Purpose | Staging | Production |
|---|---|---|---|
| `rollbacks/20260713000200_family_signup_identity_integrity_rollback.sql` | Remove signup RPC/integrity additions. | Rollback-only. | Rollback-only after approved migration. |
| `rollbacks/20260714000100_auth_portal_ownership_rollback.sql` | Remove ownership tables/functions. | Rollback-only; run after policy rollback. | Rollback-only. |
| `rollbacks/20260714000200_staging_portal_ownership_rls_rollback.sql` | Remove ownership policies/grants. | Rollback-only; run before ownership rollback. | Must be adapted from production preflight. |
| `rollbacks/20260714000300_portal_participant_rls_helper_hardening_rollback.sql` | Restore initial helper. | Rollback-only with full ownership rollback. | Rollback-only. |
| `rollbacks/20260714000400_portal_participant_rls_recursion_fix_rollback.sql` | Restore one-argument participant policy. | Rollback-only. | Rollback-only. |
| `rollbacks/20260714000500_portal_postgrest_schema_reload_rollback.sql` | Documents no-op rollback. | Rollback-only. | Rollback-only. |
| `rollbacks/20260715000100_b4_variant_preference.rollback.sql` | Remove B-4 preference column. | Rollback-only. | Avoid after user choices exist; restore backup instead. |

## Audit and data-repair SQL

| File | Purpose | Staging | Production |
|---|---|---|---|
| `audits/20260628_london_gdi_duplicate_dry_run.sql` | Detect duplicate/orphan GDI rows. | Review-only; not needed for fixture. | Read-only only with approval. |
| `audits/20260628_london_gdi_review_first_merge.sql` | Review-first merge candidate. | Review-only. | **Never** without regenerated evidence and rollback capture. |
| `audits/20260713_family_signup_student_identity_dry_run.sql` | Detect family-signup identity collisions. | Used as review evidence; no mutation. | Required preflight read-only query. |

## Legacy standalone SQL

These files predate the ordered migration system. None was replayed into staging. “Baseline” means the production-derived baseline already represents the deployed object/change; “Absent” means the object is intentionally absent from production and staging unless a later ordered migration adds it.

| File | Purpose | Staging / production classification |
|---|---|---|
| `adult_assessment_results_extension.sql` | Adult assessment fields. | Baseline; never replay. |
| `adventure_months_migration.sql` | Adventure-month model. | Baseline; never replay. |
| `adventure_months_release_migration.sql` | Adventure release fields. | Baseline; never replay. |
| `adventures_cms_full_migration.sql` | Full adventure CMS. | Baseline; never replay. |
| `adventures_cms_rewards_assets_migration.sql` | Reward/assets fields. | Baseline; never replay. |
| `adventures_cms_spots_migration.sql` | Adventure spots. | Baseline; never replay. |
| `adventures_image_fields_migration.sql` | Adventure image fields. | Baseline; never replay. |
| `adventures_is_featured_migration.sql` | Featured marker. | Baseline; never replay. |
| `adventures_schema_cache_fix.sql` | Historical schema refresh/fix. | Superseded; never replay. |
| `adventures_setup.sql` | Initial adventures table. | Baseline; never replay. |
| `adventures_storage_bucket_setup.sql` | Adventure bucket/policies. | Review-only; bucket exists in production, not recreated by baseline. |
| `assessment_results_setup.sql` | Assessment results table. | Baseline; never replay. |
| `camp_achievement_screenshots_setup.sql` | Screenshot metadata/storage. | Baseline table; storage policy requires separate review. |
| `email_delivery_logs_setup.sql` | Legacy email log table. | Absent; deferred/never in current plan. |
| `family_child_goals_setup.sql` | Family goal table. | Baseline; never replay. |
| `fix_player_progress_participant_id.sql` | Progress participant linkage repair. | Baseline schema; data repair never replay. |
| `integration_logs_migration.sql` | Integration log table. | Baseline; never replay. |
| `kid_play_sessions_migration.sql` | Kid session table. | Baseline; never replay. |
| `participant_quests_setup.sql` | Quest table. | Absent; deferred. |
| `participant_reassignment_helper.sql` | Admin reassignment RPC/helper. | Not in production inventory; review-only. |
| `participant_ui_state_setup.sql` | UI state table. | Baseline; never replay. |
| `participant_week_progress_setup.sql` | Weekly progress table. | Absent; deferred. |
| `participants_grade_band.sql` | Participant grade band. | Baseline; never replay. |
| `participants_grade_level.sql` | Participant grade level. | Baseline; never replay. |
| `participants_student_pin_access_migration.sql` | PIN access columns. | Baseline; never replay. |
| `participants_tracking_columns_migration.sql` | Tracking columns. | Baseline; never replay. |
| `participants_update_policy.sql` | Historical update policy. | Superseded by staging RLS; production policy review only. |
| `pilot_programs_archive.sql` | Program archive fields. | Baseline; never replay. |
| `pilot_programs_independent_family.sql` | Independent-family fields. | Baseline; never replay. |
| `pilot_programs_portal_prep_migration.sql` | Portal preparation fields. | Baseline; never replay. |
| `pilot_programs_scale_prep_migration.sql` | Scale/index fields. | Baseline; never replay. |
| `pilot_programs_setup.sql` | Initial programs table. | Baseline; never replay. |
| `pilot_tracking_rls_policies.sql` | Historical broad tracking policies. | Superseded; **never** run in staging or production. |
| `pilot_tracking_setup.sql` | Tracking tables. | Baseline; never replay. |
| `pilot_waitlist_setup.sql` | Waitlist table. | Baseline; never replay. |
| `player_mission_progress_setup.sql` | Mission-progress table. | Absent; deferred. |
| `program_code_aliases_and_unique_access_codes.sql` | Alias/unique-code model. | Absent; deferred. |
| `program_goals_setup.sql` | Program goals. | Baseline; never replay. |
| `push_subscriptions_migration.sql` | Push subscriptions. | Baseline; never replay. |
| `question_attempts_full_migration.sql` | Full question attempts schema. | Baseline; never replay. |
| `question_attempts_growth_metadata_migration.sql` | Growth metadata. | Baseline; never replay. |
| `question_attempts_migration.sql` | Initial question attempts. | Superseded by full/baseline; never replay. |
| `student_family_links_camp_parent_claim.sql` | Parent-claim linkage. | Baseline; never replay. |
| `student_family_links_setup.sql` | Initial family links. | Baseline; never replay. |
| `student_gallery_family_columns.sql` | Gallery family fields. | Baseline; never replay. |
| `student_gallery_review_timestamps.sql` | Gallery moderation timestamps. | Baseline; never replay. |
| `student_gallery_setup.sql` | Gallery metadata/storage setup. | Baseline table; storage requires separate review. |
| `student_gallery_update_policy.sql` | Historical gallery update policy. | Superseded; never run. |
| `student_gallery_visibility.sql` | Gallery visibility fields. | Baseline; never replay. |
| `student_pin_reveal_value_migration.sql` | PIN reveal value. | Baseline; never replay. |

## Environment order and stop rules

Staging operational order was: safety gate → baseline → staging RLS → fictional seed → CRM 1/2/3 → signup integrity → ownership → ownership RLS → helper corrections → PostgREST reload → B-4 preference → independent-family child creation → B-4 selection onboarding. The last two objects are live but their ledger entries are missing. Learning was skipped. Production must not reuse baseline/seed/staging SQL and must not proceed until the ledger, production-specific RLS, and bounded onboarding backfill are resolved.

Stop immediately for a project-ref mismatch, duplicate migration version, unexpected existing object, missing rollback evidence, failed anonymous/cross-family denial, any Kit non-GET attempt, or any production change without explicit approval.
