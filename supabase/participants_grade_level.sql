-- Canonical grade_level values: kindergarten, 1, 2, 3, 4, 5, 6, 7, 8
-- grade_band is derived for adaptive content (K-1, 2-3, 4-5, 6-8)
alter table public.participants
  add column if not exists grade_level text,
  add column if not exists grade_band text,
  add column if not exists allow_stretch_level boolean not null default false;

comment on column public.participants.grade_level is 'Exact grade: kindergarten, 1–8 (source of truth for display)';
comment on column public.participants.grade_band is 'Adaptive content band derived from grade_level: K-1, 2-3, 4-5, or 6-8';
comment on column public.participants.allow_stretch_level is 'Allow occasional activities 1–2 grade bands higher';
