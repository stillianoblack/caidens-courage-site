-- Align production participants with pilot_tracking_setup.sql optional tracking columns.
-- Safe to run multiple times.

alter table public.participants add column if not exists program_name text;
alter table public.participants add column if not exists organization text;
alter table public.participants add column if not exists child_age_range text;
alter table public.participants add column if not exists email_opt_in boolean default false;

comment on column public.participants.program_name is 'Display name of the pilot program at signup';
comment on column public.participants.organization is 'Optional organization label';
comment on column public.participants.child_age_range is 'Parent-entered age or grade hint from family portal';
comment on column public.participants.email_opt_in is 'Marketing opt-in captured at signup';
