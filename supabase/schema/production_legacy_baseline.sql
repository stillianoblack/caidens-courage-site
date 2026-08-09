-- Caiden's Courage production-compatible legacy schema baseline.
-- Generated from production catalog metadata at 2026-07-13T19:49:55.788Z.
-- This file contains schema metadata only. It contains no production application rows, Auth users,
-- credentials, contact records, assessments, progress records, or storage objects.
-- Apply only to a newly provisioned, empty staging project after the staging safety gate passes.
-- Do not apply to production. Do not combine this file with feature migrations.

SELECT private.assert_staging_safety(false);

-- Extensions used directly by this application schema.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
SET search_path = public, extensions;
-- Supabase manages plpgsql, pg_stat_statements, supabase_vault, and the storage schema.

CREATE TABLE "public"."adventure_months" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "month_number" integer NOT NULL,
  "month_title" text NOT NULL,
  "month_subtitle" text,
  "month_description" text,
  "month_hero_image_url" text,
  "certificate_title" text,
  "certificate_reward_name" text,
  "certificate_required_weeks" integer DEFAULT 4 NOT NULL,
  "is_published" boolean DEFAULT false NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "certificate_asset_url" text,
  "certificate_asset_type" text DEFAULT 'image'::text,
  "release_mode" text DEFAULT 'all_available'::text NOT NULL,
  "release_interval_days" integer,
  "release_start_at" timestamp with time zone
);

CREATE TABLE "public"."adventures" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "subtitle" text,
  "description" text,
  "week_number" integer NOT NULL,
  "status" text DEFAULT 'draft'::text NOT NULL,
  "cta_text" text,
  "hero_image_url" text,
  "thumbnail_image_url" text,
  "background_image_url" text,
  "reward_value" integer DEFAULT 0,
  "unlock_date" timestamp with time zone,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "preview_activities" jsonb DEFAULT '[]'::jsonb,
  "hotspots" jsonb DEFAULT '[]'::jsonb,
  "weekly_reward_name" text,
  "weekly_reward_type" text,
  "weekly_reward_svg_url" text,
  "weekly_reward_image_url" text,
  "weekly_reward_description" text,
  "weekly_reward_rarity" text,
  "weekly_reward_coin_value" integer DEFAULT 0,
  "coloring_page_pdf_url" text,
  "weekly_module_pdf_url" text,
  "comic_pdf_url" text,
  "certificate_pdf_or_image_url" text,
  "facilitator_kit_pdf_url" text,
  "is_admin_preview" boolean DEFAULT false,
  "is_live" boolean DEFAULT false,
  "thumbnail_url" text,
  "reward_svg_url" text,
  "reward_image_url" text,
  "reward_name" text,
  "reward_type" text,
  "certificate_url" text,
  "interactive_header_url" text,
  "comic_thumbnail_url" text,
  "map_background_url" text,
  "is_featured" boolean DEFAULT false NOT NULL,
  "month_number" integer,
  "adventure_month_id" uuid
);

CREATE TABLE "public"."assessment_results" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "nickname" text NOT NULL,
  "student_id" uuid DEFAULT gen_random_uuid(),
  "assessment_type" text,
  "program_code" text DEFAULT ''::text,
  "group_name" text DEFAULT ''::text,
  "feelings_score" bigint,
  "reading_score" bigint,
  "focus_moves_score" bigint,
  "modules_completed" text DEFAULT ''::text,
  "completed_at" timestamp with time zone DEFAULT now(),
  "overall_score" bigint,
  "program_id" uuid,
  "program_name" text,
  "family_code" text,
  "first_name" text,
  "email" text,
  "role" text,
  "child_age_range" text,
  "organization" text,
  "email_opt_in" boolean DEFAULT true,
  "understanding_score" integer,
  "support_score" integer,
  "total_score" integer,
  "total_questions" integer DEFAULT 12,
  "adult_assessment_phase" text,
  "assessment_payload" jsonb
);

CREATE TABLE "public"."assessment_results_v2" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "participant_id" uuid,
  "role" text NOT NULL,
  "assessment_type" text NOT NULL,
  "program_code" text DEFAULT 'BlueRibbon2026'::text,
  "group_name" text,
  "reading_score" integer,
  "focus_score" integer,
  "confidence_score" integer,
  "understanding_score" integer,
  "support_score" integer,
  "total_score" integer,
  "max_score" integer,
  "percent_score" numeric,
  "answers_json" jsonb,
  "completed_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE "public"."camp_achievement_screenshots" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "participant_id" uuid NOT NULL,
  "week_id" text NOT NULL,
  "mission_id" text NOT NULL,
  "character_id" text,
  "mission_title" text,
  "badge_unlocked" text,
  "coins_earned" integer DEFAULT 0,
  "storage_path" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE "public"."commerce_products" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "key" text NOT NULL,
  "title" text NOT NULL,
  "display_price_cents" integer NOT NULL,
  "currency" text DEFAULT 'usd'::text NOT NULL,
  "payment_link_url" text,
  "stripe_product_id" text,
  "stripe_price_id" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."family_child_goals" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "family_program_code" text NOT NULL,
  "child_id" uuid,
  "child_name" text,
  "parent_email" text,
  "goals" text[] DEFAULT '{}'::text[] NOT NULL,
  "strengths" text[] DEFAULT '{}'::text[] NOT NULL,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."integration_logs" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "provider" text NOT NULL,
  "event_name" text NOT NULL,
  "email" text,
  "tag_name" text,
  "status" text DEFAULT 'skipped'::text NOT NULL,
  "error_message" text,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."kid_play_sessions" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "child_id" uuid NOT NULL,
  "participant_id" uuid,
  "organization_id" uuid,
  "launched_by_user_id" uuid,
  "session_source" text NOT NULL,
  "device_mode" text NOT NULL,
  "status" text DEFAULT 'active'::text NOT NULL,
  "started_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_activity_at" timestamp with time zone DEFAULT now() NOT NULL,
  "ended_at" timestamp with time zone,
  "ended_reason" text,
  "device_label" text,
  "resume_payload" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."module_results" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "participant_id" uuid,
  "role" text NOT NULL,
  "program_code" text DEFAULT 'BlueRibbon2026'::text,
  "group_name" text,
  "module_id" text NOT NULL,
  "module_title" text NOT NULL,
  "character" text,
  "skill_area" text,
  "score" integer,
  "max_score" integer,
  "percent_score" numeric,
  "time_spent_seconds" integer,
  "attempt_number" integer DEFAULT 1,
  "answers_json" jsonb,
  "completed_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE "public"."participant_ui_state" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "participant_id" uuid NOT NULL,
  "state_key" text NOT NULL,
  "state_value" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."participants" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "role" text NOT NULL,
  "nickname" text,
  "first_name" text,
  "email" text,
  "program_code" text DEFAULT 'BlueRibbon2026'::text,
  "group_name" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "adult_role" text,
  "grade_band" text,
  "allow_stretch_level" boolean DEFAULT false,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "grade_level" text,
  "program_name" text,
  "organization" text,
  "child_age_range" text,
  "email_opt_in" boolean DEFAULT false,
  "last_name" text,
  "student_pin_hash" text,
  "student_pin_fingerprint" text,
  "student_pin_last_rotated_at" timestamp with time zone,
  "student_pin_enabled" boolean DEFAULT true NOT NULL,
  "parent_connection_status" text DEFAULT 'unclaimed'::text NOT NULL,
  "family_claim_code" text,
  "family_claim_code_created_at" timestamp with time zone,
  "family_claim_code_used_at" timestamp with time zone,
  "guardian_email" text,
  "guardian_phone" text,
  "family_account_id" uuid,
  "student_pin_reveal_value" text
);

CREATE TABLE "public"."pilot_programs" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "program_name" text NOT NULL,
  "program_code" text NOT NULL,
  "program_type" text DEFAULT 'camp'::text NOT NULL,
  "admin_first_name" text NOT NULL,
  "admin_email" text NOT NULL,
  "estimated_students" integer,
  "age_range" text,
  "group_name" text,
  "family_access_code" text,
  "facilitator_access_code" text,
  "pricing_tier" text,
  "payment_status" text DEFAULT 'not_paid'::text,
  "pilot_status" text DEFAULT 'active'::text,
  "agreed_to_terms" boolean DEFAULT false,
  "agreed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  "child_count" integer,
  "gallery_enabled" boolean DEFAULT true,
  "gallery_community_sharing" boolean DEFAULT false,
  "gallery_family_submit_enabled" boolean DEFAULT true,
  "gallery_require_approval" boolean DEFAULT true,
  "archived_at" timestamp with time zone,
  "archived_by" text,
  "estimated_student_count_range" text,
  "account_context" text,
  "portal_type" text,
  "age_grade_band" text,
  "age_grade_notes" text,
  "feature_flags" jsonb,
  "protection_level" text DEFAULT 'testing'::text NOT NULL
);

CREATE TABLE "public"."pilot_waitlist" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "parent_name" text,
  "parent_email" text NOT NULL,
  "child_age" text,
  "source" text,
  "interest_type" text DEFAULT 'general_pilot'::text NOT NULL,
  "page_path" text,
  "notes" text
);

CREATE TABLE "public"."player_badges" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid,
  "badge_name" text NOT NULL,
  "mission_id" text,
  "unlocked_at" timestamp with time zone DEFAULT now() NOT NULL,
  "participant_id" uuid,
  "week_id" text,
  "earned_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."player_progress" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid,
  "week_id" text NOT NULL,
  "mission_id" text NOT NULL,
  "character_id" text NOT NULL,
  "mission_title" text NOT NULL,
  "character_name" text NOT NULL,
  "coins_earned" integer DEFAULT 0 NOT NULL,
  "badge_unlocked" text,
  "reward_item" text,
  "completed_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "participant_id" uuid
);

CREATE TABLE "public"."player_reward_claims" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "participant_id" text NOT NULL,
  "reward_key" text NOT NULL,
  "reward_name" text,
  "claimed_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."player_wallets" (
  "user_id" uuid,
  "total_coins" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "participant_id" uuid
);

CREATE TABLE "public"."program_goals" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "program_code" text NOT NULL,
  "portal_type" text DEFAULT 'facilitator'::text NOT NULL,
  "selected_goals" text[] DEFAULT '{}'::text[] NOT NULL,
  "custom_goal" text,
  "completed_at" timestamp with time zone,
  "dismissed_until" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."push_subscriptions" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid,
  "child_id" uuid,
  "endpoint" text NOT NULL,
  "p256dh" text NOT NULL,
  "auth" text NOT NULL,
  "user_agent" text,
  "device_label" text,
  "enabled" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."question_attempts" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "participant_id" uuid NOT NULL,
  "program_code" text NOT NULL,
  "module_id" text,
  "assessment_type" text,
  "question_id" text NOT NULL,
  "first_selected_answer" jsonb,
  "final_selected_answer" jsonb,
  "is_correct_first_try" boolean DEFAULT false NOT NULL,
  "is_correct_final" boolean DEFAULT false NOT NULL,
  "attempts_count" integer DEFAULT 1 NOT NULL,
  "hints_used_count" integer DEFAULT 0 NOT NULL,
  "time_spent_seconds" integer,
  "completed_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "first_selected_answer_jsonb" jsonb,
  "final_selected_answer_jsonb" jsonb,
  "week_number" integer,
  "mission_id" text,
  "character" text,
  "grade_level" text,
  "grade_band" text,
  "content_version" text,
  "selected_answer" text,
  "correct_answer" text,
  "used_hint" boolean DEFAULT false NOT NULL,
  "attempt_type" text DEFAULT 'initial'::text NOT NULL,
  "is_replay" boolean DEFAULT false NOT NULL,
  "attempt_scope" text,
  "original_module_id" text,
  "question_set_version" text,
  "first_attempt_accuracy" numeric,
  "final_accuracy" numeric,
  "answered_count" integer,
  "correct_count" integer,
  "started_at" timestamp with time zone
);

CREATE TABLE "public"."student_family_links" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "student_id" uuid NOT NULL,
  "camp_program_code" text,
  "family_program_code" text,
  "parent_email" text,
  "parent_last_name" text,
  "relationship" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "parent_phone" text,
  "parent_first_name" text,
  "parent_claimed" boolean DEFAULT false,
  "claimed_at" timestamp with time zone
);

CREATE TABLE "public"."student_gallery_items" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "title" text,
  "student_nickname" text,
  "program_code" text DEFAULT 'BlueRibbon2026'::text,
  "group_name" text,
  "file_url" text,
  "file_path" text,
  "status" text DEFAULT 'pending'::text,
  "program_id" uuid,
  "program_name" text,
  "family_code" text,
  "caption" text,
  "facilitator_note" text,
  "upload_source" text DEFAULT 'submit'::text,
  "submitter_key" text,
  "reviewed_at" timestamp with time zone,
  "reviewed_by" text,
  "approved_at" timestamp with time zone,
  "rejected_at" timestamp with time zone,
  "visibility" text DEFAULT 'program_private'::text,
  "uploaded_by_role" text
);

-- Primary keys, unique/check constraints, and foreign keys.

ALTER TABLE "public"."adventure_months"
  ADD CONSTRAINT "adventure_months_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."adventures"
  ADD CONSTRAINT "adventures_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."assessment_results"
  ADD CONSTRAINT "assessment_results_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."assessment_results_v2"
  ADD CONSTRAINT "assessment_results_v2_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."camp_achievement_screenshots"
  ADD CONSTRAINT "camp_achievement_screenshots_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."commerce_products"
  ADD CONSTRAINT "commerce_products_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."family_child_goals"
  ADD CONSTRAINT "family_child_goals_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."integration_logs"
  ADD CONSTRAINT "integration_logs_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."kid_play_sessions"
  ADD CONSTRAINT "kid_play_sessions_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."module_results"
  ADD CONSTRAINT "module_results_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."participant_ui_state"
  ADD CONSTRAINT "participant_ui_state_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."participants"
  ADD CONSTRAINT "participants_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."pilot_programs"
  ADD CONSTRAINT "pilot_programs_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."pilot_waitlist"
  ADD CONSTRAINT "pilot_waitlist_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."player_badges"
  ADD CONSTRAINT "player_badges_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."player_progress"
  ADD CONSTRAINT "player_progress_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."player_reward_claims"
  ADD CONSTRAINT "player_reward_claims_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."program_goals"
  ADD CONSTRAINT "program_goals_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."push_subscriptions"
  ADD CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."question_attempts"
  ADD CONSTRAINT "question_attempts_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."student_family_links"
  ADD CONSTRAINT "student_family_links_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."student_gallery_items"
  ADD CONSTRAINT "student_gallery_items_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."adventure_months"
  ADD CONSTRAINT "adventure_months_month_number_key" UNIQUE (month_number);

ALTER TABLE "public"."commerce_products"
  ADD CONSTRAINT "commerce_products_key_key" UNIQUE (key);

ALTER TABLE "public"."family_child_goals"
  ADD CONSTRAINT "family_child_goals_family_program_code_child_id_key" UNIQUE (family_program_code, child_id);

ALTER TABLE "public"."participant_ui_state"
  ADD CONSTRAINT "participant_ui_state_participant_id_state_key_key" UNIQUE (participant_id, state_key);

ALTER TABLE "public"."pilot_programs"
  ADD CONSTRAINT "pilot_programs_program_code_key" UNIQUE (program_code);

ALTER TABLE "public"."player_reward_claims"
  ADD CONSTRAINT "player_reward_claims_participant_id_reward_key_key" UNIQUE (participant_id, reward_key);

ALTER TABLE "public"."push_subscriptions"
  ADD CONSTRAINT "push_subscriptions_endpoint_key" UNIQUE (endpoint);

ALTER TABLE "public"."adventures"
  ADD CONSTRAINT "adventures_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'scheduled'::text, 'active'::text, 'archived'::text]));

ALTER TABLE "public"."assessment_results_v2"
  ADD CONSTRAINT "assessment_results_v2_role_check" CHECK (role = ANY (ARRAY['student'::text, 'parent'::text, 'facilitator'::text]));

ALTER TABLE "public"."commerce_products"
  ADD CONSTRAINT "commerce_products_display_price_cents_check" CHECK (display_price_cents > 0);

ALTER TABLE "public"."integration_logs"
  ADD CONSTRAINT "integration_logs_status_check" CHECK (status = ANY (ARRAY['success'::text, 'skipped'::text, 'failed'::text]));

ALTER TABLE "public"."kid_play_sessions"
  ADD CONSTRAINT "kid_play_sessions_device_mode_check" CHECK (device_mode = ANY (ARRAY['home_device'::text, 'shared_camp_device'::text, 'shared_school_device'::text, 'child_owned_device'::text]));

ALTER TABLE "public"."kid_play_sessions"
  ADD CONSTRAINT "kid_play_sessions_session_source_check" CHECK (session_source = ANY (ARRAY['family_home'::text, 'camp_roster_launch'::text, 'facilitator_roster_launch'::text, 'school_access_code'::text, 'future_child_pin'::text]));

ALTER TABLE "public"."kid_play_sessions"
  ADD CONSTRAINT "kid_play_sessions_status_check" CHECK (status = ANY (ARRAY['active'::text, 'ended'::text, 'expired'::text, 'moved'::text]));

ALTER TABLE "public"."module_results"
  ADD CONSTRAINT "module_results_role_check" CHECK (role = ANY (ARRAY['student'::text, 'parent'::text, 'facilitator'::text]));

ALTER TABLE "public"."participants"
  ADD CONSTRAINT "participants_grade_band_check" CHECK (grade_band IS NULL OR (grade_band = ANY (ARRAY['2-3'::text, '3-4'::text, '4-5'::text, '5-6'::text])));

ALTER TABLE "public"."participants"
  ADD CONSTRAINT "participants_parent_connection_status_check" CHECK (parent_connection_status = ANY (ARRAY['unclaimed'::text, 'invited'::text, 'connected'::text]));

ALTER TABLE "public"."participants"
  ADD CONSTRAINT "participants_role_check" CHECK (role = ANY (ARRAY['student'::text, 'parent'::text, 'facilitator'::text]));

ALTER TABLE "public"."pilot_programs"
  ADD CONSTRAINT "pilot_programs_protection_level_check" CHECK (protection_level = ANY (ARRAY['testing'::text, 'internal'::text, 'pilot'::text, 'production'::text]));

ALTER TABLE "public"."adventures"
  ADD CONSTRAINT "adventures_adventure_month_id_fkey" FOREIGN KEY (adventure_month_id) REFERENCES adventure_months(id) ON DELETE SET NULL;

ALTER TABLE "public"."assessment_results_v2"
  ADD CONSTRAINT "assessment_results_v2_participant_id_fkey" FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE SET NULL;

ALTER TABLE "public"."kid_play_sessions"
  ADD CONSTRAINT "kid_play_sessions_child_id_fkey" FOREIGN KEY (child_id) REFERENCES participants(id) ON DELETE CASCADE;

ALTER TABLE "public"."kid_play_sessions"
  ADD CONSTRAINT "kid_play_sessions_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES pilot_programs(id) ON DELETE SET NULL;

ALTER TABLE "public"."kid_play_sessions"
  ADD CONSTRAINT "kid_play_sessions_participant_id_fkey" FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE SET NULL;

ALTER TABLE "public"."module_results"
  ADD CONSTRAINT "module_results_participant_id_fkey" FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE SET NULL;

ALTER TABLE "public"."participant_ui_state"
  ADD CONSTRAINT "participant_ui_state_participant_id_fkey" FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE;

ALTER TABLE "public"."player_badges"
  ADD CONSTRAINT "player_badges_participant_id_fkey" FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE;

ALTER TABLE "public"."player_badges"
  ADD CONSTRAINT "player_badges_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."player_progress"
  ADD CONSTRAINT "player_progress_participant_id_fkey" FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE;

ALTER TABLE "public"."player_progress"
  ADD CONSTRAINT "player_progress_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."player_wallets"
  ADD CONSTRAINT "player_wallets_participant_id_fkey" FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE;

ALTER TABLE "public"."player_wallets"
  ADD CONSTRAINT "player_wallets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."push_subscriptions"
  ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."question_attempts"
  ADD CONSTRAINT "question_attempts_participant_id_fkey" FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE;

-- Non-constraint indexes.

CREATE INDEX adventure_months_sort_order_idx ON public.adventure_months USING btree (sort_order, month_number);

CREATE INDEX adventures_adventure_month_id_idx ON public.adventures USING btree (adventure_month_id);

CREATE INDEX adventures_is_featured_idx ON public.adventures USING btree (is_featured) WHERE (is_featured = true);

CREATE INDEX adventures_month_number_idx ON public.adventures USING btree (month_number, sort_order);

CREATE INDEX adventures_sort_order_idx ON public.adventures USING btree (sort_order);

CREATE INDEX adventures_status_idx ON public.adventures USING btree (status);

CREATE INDEX adventures_week_number_idx ON public.adventures USING btree (week_number);

CREATE INDEX assessment_results_assessment_type_idx ON public.assessment_results USING btree (assessment_type);

CREATE INDEX assessment_results_completed_at_idx ON public.assessment_results USING btree (completed_at DESC);

CREATE INDEX assessment_results_program_code_idx ON public.assessment_results USING btree (program_code);

CREATE INDEX idx_assessment_results_adult_phase ON public.assessment_results USING btree (adult_assessment_phase);

CREATE INDEX idx_assessment_results_assessment_type ON public.assessment_results USING btree (assessment_type);

CREATE INDEX idx_assessment_results_email_program ON public.assessment_results USING btree (email, program_code);

CREATE INDEX assessment_results_v2_assessment_type_idx ON public.assessment_results_v2 USING btree (assessment_type);

CREATE INDEX assessment_results_v2_completed_at_idx ON public.assessment_results_v2 USING btree (completed_at DESC);

CREATE INDEX assessment_results_v2_participant_id_idx ON public.assessment_results_v2 USING btree (participant_id);

CREATE INDEX assessment_results_v2_program_code_idx ON public.assessment_results_v2 USING btree (program_code);

CREATE INDEX camp_achievement_screenshots_participant_idx ON public.camp_achievement_screenshots USING btree (participant_id);

CREATE INDEX camp_achievement_screenshots_week_idx ON public.camp_achievement_screenshots USING btree (week_id);

CREATE INDEX camp_achievement_screenshots_week_mission_idx ON public.camp_achievement_screenshots USING btree (participant_id, week_id, mission_id);

CREATE INDEX commerce_products_is_active_idx ON public.commerce_products USING btree (is_active);

CREATE INDEX commerce_products_key_idx ON public.commerce_products USING btree (key);

CREATE INDEX family_child_goals_parent_email_idx ON public.family_child_goals USING btree (parent_email);

CREATE INDEX family_child_goals_program_idx ON public.family_child_goals USING btree (family_program_code);

CREATE INDEX integration_logs_email_idx ON public.integration_logs USING btree (lower(email), created_at DESC) WHERE (email IS NOT NULL);

CREATE INDEX integration_logs_event_idx ON public.integration_logs USING btree (provider, event_name, created_at DESC);

CREATE INDEX integration_logs_provider_status_idx ON public.integration_logs USING btree (provider, status, created_at DESC);

CREATE INDEX kid_play_sessions_active_activity_idx ON public.kid_play_sessions USING btree (last_activity_at DESC) WHERE (status = 'active'::text);

CREATE INDEX kid_play_sessions_child_status_idx ON public.kid_play_sessions USING btree (child_id, status);

CREATE INDEX kid_play_sessions_organization_idx ON public.kid_play_sessions USING btree (organization_id) WHERE (organization_id IS NOT NULL);

CREATE INDEX kid_play_sessions_participant_status_idx ON public.kid_play_sessions USING btree (participant_id, status) WHERE (participant_id IS NOT NULL);

CREATE INDEX module_results_completed_at_idx ON public.module_results USING btree (completed_at DESC);

CREATE INDEX module_results_module_id_idx ON public.module_results USING btree (module_id);

CREATE INDEX module_results_participant_id_idx ON public.module_results USING btree (participant_id);

CREATE INDEX module_results_program_code_idx ON public.module_results USING btree (program_code);

CREATE INDEX participant_ui_state_key_idx ON public.participant_ui_state USING btree (state_key);

CREATE INDEX participant_ui_state_participant_idx ON public.participant_ui_state USING btree (participant_id);

CREATE INDEX participants_email_role_program_idx ON public.participants USING btree (lower(email), role, program_code) WHERE (email IS NOT NULL);

CREATE UNIQUE INDEX participants_family_claim_code_unique ON public.participants USING btree (family_claim_code) WHERE (family_claim_code IS NOT NULL);

CREATE INDEX participants_parent_connection_status_idx ON public.participants USING btree (program_code, parent_connection_status) WHERE (role = 'student'::text);

CREATE INDEX participants_program_code_idx ON public.participants USING btree (program_code);

CREATE UNIQUE INDEX participants_program_pin_fingerprint_unique ON public.participants USING btree (program_code, student_pin_fingerprint) WHERE ((student_pin_fingerprint IS NOT NULL) AND (role = 'student'::text));

CREATE INDEX participants_role_idx ON public.participants USING btree (role);

CREATE INDEX participants_student_lookup_idx ON public.participants USING btree (lower(nickname), role, program_code, COALESCE(group_name, ''::text)) WHERE (nickname IS NOT NULL);

CREATE INDEX pilot_programs_account_context_idx ON public.pilot_programs USING btree (account_context);

CREATE INDEX pilot_programs_age_grade_band_idx ON public.pilot_programs USING btree (age_grade_band);

CREATE INDEX pilot_programs_archived_at_idx ON public.pilot_programs USING btree (archived_at DESC NULLS LAST) WHERE (archived_at IS NOT NULL);

CREATE INDEX pilot_programs_family_access_code_idx ON public.pilot_programs USING btree (family_access_code);

CREATE INDEX pilot_programs_pilot_status_idx ON public.pilot_programs USING btree (pilot_status);

CREATE INDEX pilot_programs_portal_type_idx ON public.pilot_programs USING btree (portal_type);

CREATE INDEX pilot_programs_program_code_idx ON public.pilot_programs USING btree (program_code);

CREATE INDEX pilot_programs_program_type_idx ON public.pilot_programs USING btree (program_type);

CREATE INDEX pilot_waitlist_created_at_idx ON public.pilot_waitlist USING btree (created_at DESC);

CREATE INDEX pilot_waitlist_email_idx ON public.pilot_waitlist USING btree (parent_email);

CREATE INDEX pilot_waitlist_interest_type_idx ON public.pilot_waitlist USING btree (interest_type);

CREATE UNIQUE INDEX player_badges_participant_badge_unique ON public.player_badges USING btree (participant_id, badge_name);

CREATE UNIQUE INDEX player_badges_participant_mission_badge_uidx ON public.player_badges USING btree (participant_id, mission_id, badge_name) WHERE ((participant_id IS NOT NULL) AND (mission_id IS NOT NULL) AND (badge_name IS NOT NULL));

CREATE INDEX player_badges_participant_week_idx ON public.player_badges USING btree (participant_id, week_id) WHERE (participant_id IS NOT NULL);

CREATE INDEX player_badges_user_week_idx ON public.player_badges USING btree (user_id, week_id);

CREATE INDEX player_progress_mission_id_idx ON public.player_progress USING btree (mission_id);

CREATE UNIQUE INDEX player_progress_participant_mission_uidx ON public.player_progress USING btree (participant_id, mission_id) WHERE ((participant_id IS NOT NULL) AND (mission_id IS NOT NULL));

CREATE UNIQUE INDEX player_progress_participant_mission_unique ON public.player_progress USING btree (participant_id, mission_id);

CREATE INDEX player_progress_participant_week_idx ON public.player_progress USING btree (participant_id, week_id) WHERE (participant_id IS NOT NULL);

CREATE INDEX player_progress_user_week_idx ON public.player_progress USING btree (user_id, week_id);

CREATE UNIQUE INDEX player_wallets_participant_id_uidx ON public.player_wallets USING btree (participant_id) WHERE (participant_id IS NOT NULL);

CREATE UNIQUE INDEX player_wallets_participant_unique ON public.player_wallets USING btree (participant_id);

CREATE INDEX idx_program_goals_portal_type ON public.program_goals USING btree (portal_type);

CREATE INDEX idx_program_goals_program_code ON public.program_goals USING btree (program_code);

CREATE INDEX program_goals_program_code_idx ON public.program_goals USING btree (program_code);

CREATE INDEX push_subscriptions_child_id_idx ON public.push_subscriptions USING btree (child_id);

CREATE INDEX push_subscriptions_enabled_idx ON public.push_subscriptions USING btree (enabled) WHERE (enabled = true);

CREATE INDEX push_subscriptions_endpoint_idx ON public.push_subscriptions USING btree (endpoint);

CREATE INDEX push_subscriptions_user_id_idx ON public.push_subscriptions USING btree (user_id);

CREATE INDEX question_attempts_attempt_scope_idx ON public.question_attempts USING btree (attempt_scope);

CREATE INDEX question_attempts_attempt_type_idx ON public.question_attempts USING btree (attempt_type);

CREATE INDEX question_attempts_is_replay_idx ON public.question_attempts USING btree (is_replay);

CREATE INDEX question_attempts_mission_id_idx ON public.question_attempts USING btree (mission_id);

CREATE INDEX question_attempts_module_idx ON public.question_attempts USING btree (module_id, question_id);

CREATE INDEX question_attempts_participant_idx ON public.question_attempts USING btree (participant_id, completed_at DESC);

CREATE INDEX question_attempts_program_code_idx ON public.question_attempts USING btree (program_code);

CREATE INDEX question_attempts_question_id_idx ON public.question_attempts USING btree (question_id);

CREATE INDEX question_attempts_week_number_idx ON public.question_attempts USING btree (week_number);

CREATE INDEX student_family_links_camp_program_idx ON public.student_family_links USING btree (camp_program_code);

CREATE INDEX student_family_links_family_program_idx ON public.student_family_links USING btree (family_program_code);

CREATE INDEX student_family_links_parent_email_idx ON public.student_family_links USING btree (lower(parent_email));

CREATE INDEX student_family_links_parent_phone_idx ON public.student_family_links USING btree (parent_phone);

CREATE UNIQUE INDEX student_family_links_student_camp_unique ON public.student_family_links USING btree (student_id, camp_program_code);

CREATE UNIQUE INDEX student_family_links_student_family_unique ON public.student_family_links USING btree (student_id, family_program_code);

CREATE INDEX student_family_links_student_id_idx ON public.student_family_links USING btree (student_id);

-- Public functions and RPCs captured from production metadata.

CREATE OR REPLACE FUNCTION public.rename_pilot_program_transaction(old_program_code_input text, new_program_code_input text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  old_code text := upper(btrim(old_program_code_input));
  new_code text := upper(btrim(new_program_code_input));
  changed_counts jsonb := '[]'::jsonb;
  affected integer;
begin
  if old_code = '' or new_code = '' then
    raise exception 'Old and new program codes are required.';
  end if;

  if exists (
    select 1
    from public.pilot_programs
    where program_code = old_code
  ) then
    raise exception 'Old code % is still owned by a pilot program. Rename the pilot row first or verify target state.', old_code;
  end if;

  if not exists (
    select 1
    from public.pilot_programs
    where program_code = new_code
  ) then
    raise exception 'New program code % does not exist in pilot_programs.', new_code;
  end if;

  update public.participants
  set program_code = new_code
  where program_code = old_code;

  get diagnostics affected = row_count;
  changed_counts := changed_counts || jsonb_build_object(
    'table', 'participants',
    'column', 'program_code',
    'rowsUpdated', affected
  );

  update public.student_family_links
  set camp_program_code = new_code
  where camp_program_code = old_code;

  get diagnostics affected = row_count;
  changed_counts := changed_counts || jsonb_build_object(
    'table', 'student_family_links',
    'column', 'camp_program_code',
    'rowsUpdated', affected
  );

  update public.student_family_links
  set family_program_code = new_code
  where family_program_code = old_code;

  get diagnostics affected = row_count;
  changed_counts := changed_counts || jsonb_build_object(
    'table', 'student_family_links',
    'column', 'family_program_code_only_if_old_code_matched',
    'rowsUpdated', affected
  );

  return jsonb_build_object(
    'ok', true,
    'oldProgramCode', old_code,
    'newProgramCode', new_code,
    'rowsUpdated', changed_counts
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_commerce_products_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Application-owned triggers. Supabase-managed storage triggers are intentionally excluded.

CREATE TRIGGER commerce_products_set_updated_at BEFORE UPDATE ON commerce_products FOR EACH ROW EXECUTE FUNCTION set_commerce_products_updated_at();

-- Row-level security state.

ALTER TABLE "public"."adventure_months" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."adventures" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."assessment_results" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."assessment_results_v2" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."camp_achievement_screenshots" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."commerce_products" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."family_child_goals" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."integration_logs" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."kid_play_sessions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."module_results" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."participant_ui_state" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."participants" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."pilot_programs" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."pilot_waitlist" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."player_badges" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."player_progress" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."player_reward_claims" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."player_wallets" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."program_goals" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."push_subscriptions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."question_attempts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."student_family_links" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."student_gallery_items" ENABLE ROW LEVEL SECURITY;

-- Production policies and broad anon/authenticated grants are intentionally excluded.
-- Apply supabase/schema/staging_legacy_rls.sql after this schema baseline.
-- Service-role access is explicit so server-only staging flows can be verified safely.

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."adventure_months"
  TO "service_role";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."adventures"
  TO "service_role";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."assessment_results"
  TO "service_role";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."assessment_results_v2"
  TO "service_role";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."camp_achievement_screenshots"
  TO "service_role";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."commerce_products"
  TO "service_role";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."family_child_goals"
  TO "service_role";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."integration_logs"
  TO "service_role";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."kid_play_sessions"
  TO "service_role";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."module_results"
  TO "service_role";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."participant_ui_state"
  TO "service_role";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."participants"
  TO "service_role";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."pilot_programs"
  TO "service_role";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."pilot_waitlist"
  TO "service_role";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."player_badges"
  TO "service_role";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."player_progress"
  TO "service_role";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."player_reward_claims"
  TO "service_role";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."player_wallets"
  TO "service_role";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."program_goals"
  TO "service_role";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."push_subscriptions"
  TO "service_role";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."question_attempts"
  TO "service_role";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."student_family_links"
  TO "service_role";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."student_gallery_items"
  TO "service_role";

-- Function execution is service-role-only in staging.

GRANT EXECUTE ON FUNCTION "public"."rename_pilot_program_transaction"(old_program_code_input text, new_program_code_input text)
  TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."set_commerce_products_updated_at"()
  TO "service_role";

-- Storage bucket configuration is intentionally not inserted by this schema-only baseline.
-- Recreate the production bucket names/configuration using the staging provisioning guide, without files.
