create table if not exists public.academy_reporting_overrides (
  participant_id uuid primary key references public.participants(id) on delete cascade,
  reporting_override text not null default 'automatic'
    check (reporting_override in ('automatic', 'include', 'exclude')),
  reporting_override_reason text,
  updated_by text not null,
  updated_at timestamptz not null default now()
);

alter table public.academy_reporting_overrides enable row level security;

comment on table public.academy_reporting_overrides is
  'Server-mediated Academy reporting inclusion decisions. Does not alter participant activity.';

create index if not exists academy_reporting_overrides_updated_at_idx
  on public.academy_reporting_overrides(updated_at desc);
