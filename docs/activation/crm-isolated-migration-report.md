# CRM Isolated Migration Report

**Date:** 2026-07-11
**Status:** **PARTIAL — REQUIRES CONFIGURATION**

## Target determination

- Target environment type: none available.
- Supabase CLI: not installed.
- Docker: not installed/available.
- `supabase/config.toml`: absent.
- Ignored `.env.local`: contains a masked **remote** Supabase URL.
- Remote project reference/host: withheld; isolation cannot be demonstrated.
- Production confirmation: **not confirmed**, therefore no connection was made.

## Migration files prepared in order

1. `20260711000100_audience_crm_phase1_foundation.sql`
2. `20260711000200_audience_crm_phase2_workflows.sql`
3. `20260711000300_audience_crm_phase3_kit_automation.sql`

## Execution

**NOT RUN.** No database command, migration, reset, push, link, or SQL query was executed. Duration: not applicable.

Static migration tests verify additive structure, absence of destructive DROP/TRUNCATE/DELETE statements, RLS enablement, no permissive CRM policies, safe holds, and adult-only contact kinds.

## Expected CRM tables after isolated execution

Phase 1: `crm_admin_roles`, `crm_admin_role_assignments`, `contacts`, `crm_platform_profiles`, `contact_sources`, `contact_identity_links`, `organizations`, `organization_units`, `organization_memberships`, `invitations`, `access_grants`, `guardian_relationships`, `admin_audit_events`.

Phase 2: `consent_events`, `communication_preferences`, `lifecycle_events`, `contact_lifecycle_state`, `contact_interests`, `customer_relationships`, `entitlements`, `crm_notes`, `crm_tasks`, `crm_activities`, `segment_definitions`, `segment_eligibility`, `provider_accounts`, `provider_segment_mappings`.

Phase 3: `provider_contacts`, `email_sync_outbox`, `email_sync_attempts`, `provider_webhook_events`, `provider_metric_sync_runs`, `provider_broadcasts`, `provider_broadcast_metrics`, `provider_tag_snapshots`, `provider_sequence_snapshots`.

## Required next step

Install Docker Desktop and the Supabase CLI, initialize `supabase/config.toml`, confirm all URLs are localhost, then run the documented local workflow. Never reuse the current remote `.env.local` values for migration or RLS verification.
