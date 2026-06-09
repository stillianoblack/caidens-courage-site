-- Parent–child access isolation: links camp students to family portal programs.
-- Safe to run multiple times.

create table if not exists public.student_family_links (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.participants (id) on delete cascade,
  camp_program_code text not null,
  family_program_code text not null,
  parent_email text,
  parent_last_name text,
  relationship text,
  created_at timestamptz not null default now()
);

create index if not exists student_family_links_family_program_idx
  on public.student_family_links (family_program_code);

create index if not exists student_family_links_camp_program_idx
  on public.student_family_links (camp_program_code);

create index if not exists student_family_links_student_id_idx
  on public.student_family_links (student_id);

create unique index if not exists student_family_links_student_family_unique
  on public.student_family_links (student_id, family_program_code);

comment on table public.student_family_links is
  'Maps camp participant rows to family portal programs. Family portal visibility is scoped to linked student_id values — not shared camp access codes.';

comment on column public.student_family_links.parent_last_name is
  'Optional verification hint only. Never used as an authorization source.';

alter table public.student_family_links enable row level security;

drop policy if exists "student_family_links_anon_select" on public.student_family_links;
create policy "student_family_links_anon_select"
  on public.student_family_links for select
  to anon, authenticated
  using (true);

drop policy if exists "student_family_links_anon_insert" on public.student_family_links;
create policy "student_family_links_anon_insert"
  on public.student_family_links for insert
  to anon, authenticated
  with check (true);

drop policy if exists "student_family_links_anon_update" on public.student_family_links;
create policy "student_family_links_anon_update"
  on public.student_family_links for update
  to anon, authenticated
  using (true)
  with check (true);
