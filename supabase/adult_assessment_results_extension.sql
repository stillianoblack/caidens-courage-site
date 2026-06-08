-- Optional extension for adult baseline/growth checks in assessment_results.
-- Safe to run multiple times; existing student baseline rows are unchanged.

alter table if exists public.assessment_results
  add column if not exists first_name text,
  add column if not exists email text,
  add column if not exists role text,
  add column if not exists child_age_range text,
  add column if not exists organization text,
  add column if not exists email_opt_in boolean default true,
  add column if not exists understanding_score int,
  add column if not exists support_score int,
  add column if not exists total_score int,
  add column if not exists total_questions int default 12,
  add column if not exists adult_assessment_phase text;

-- assessment_type already exists; adult rows use adult_baseline or adult_growth.
