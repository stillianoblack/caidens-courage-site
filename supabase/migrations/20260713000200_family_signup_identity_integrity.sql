-- Atomic independent-family signup and identity-integrity protections.
-- This migration intentionally fails before adding constraints if existing duplicate
-- independent-family accounts or participant identities require review.

do $$
begin
  if exists (
    select 1
    from public.pilot_programs
    where program_type = 'independent_family' and pilot_status <> 'archived'
    group by lower(btrim(admin_email))
    having count(*) > 1
  ) then
    raise exception 'Precheck failed: duplicate active independent-family admin emails require review.';
  end if;

end
$$;

alter table public.pilot_programs
  add column if not exists signup_idempotency_key text;

create unique index if not exists pilot_programs_signup_idempotency_key_unique
  on public.pilot_programs (signup_idempotency_key)
  where signup_idempotency_key is not null;

create unique index if not exists pilot_programs_independent_family_admin_unique
  on public.pilot_programs (lower(btrim(admin_email)))
  where program_type = 'independent_family' and pilot_status <> 'archived';

create or replace function public.create_independent_family_signup(
  signup_record jsonb,
  child_first_name_input text,
  idempotency_key_input text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_program public.pilot_programs%rowtype;
  created_program public.pilot_programs%rowtype;
  created_participant public.participants%rowtype;
  child_name text := btrim(child_first_name_input);
  normalized_email text := lower(btrim(signup_record->>'admin_email'));
begin
  if child_name = '' or normalized_email = '' or btrim(idempotency_key_input) = '' then
    raise exception 'Required family signup identity fields are missing.';
  end if;

  select * into existing_program
  from public.pilot_programs
  where signup_idempotency_key = idempotency_key_input
     or (
       program_type = 'independent_family'
       and pilot_status <> 'archived'
       and lower(btrim(admin_email)) = normalized_email
     )
  order by (signup_idempotency_key = idempotency_key_input) desc, created_at asc
  limit 1
  for update;

  if found then
    select * into created_participant
    from public.participants
    where program_code = existing_program.program_code
      and role = 'student'
      and lower(btrim(coalesce(nickname, first_name))) = lower(child_name)
    order by created_at asc
    limit 1;

    if not found then
      raise exception 'Existing family account does not contain the submitted child identity.';
    end if;

    insert into public.student_family_links (
      student_id, camp_program_code, family_program_code, parent_email,
      parent_first_name, relationship, parent_claimed, claimed_at
    ) values (
      created_participant.id, existing_program.program_code, existing_program.program_code,
      normalized_email, existing_program.admin_first_name, 'guardian', true, now()
    )
    on conflict (student_id, camp_program_code) do update set
      family_program_code = excluded.family_program_code,
      parent_email = excluded.parent_email,
      parent_first_name = excluded.parent_first_name,
      relationship = excluded.relationship,
      parent_claimed = true,
      claimed_at = coalesce(public.student_family_links.claimed_at, excluded.claimed_at);

    return jsonb_build_object(
      'program', to_jsonb(existing_program),
      'participant_id', created_participant.id,
      'reused', true
    );
  end if;

  insert into public.pilot_programs (
    program_name, program_code, program_type, admin_first_name, admin_email,
    estimated_students, estimated_student_count_range, account_context, portal_type,
    age_grade_band, age_grade_notes, feature_flags, age_range, group_name,
    family_access_code, facilitator_access_code, pricing_tier, payment_status,
    pilot_status, agreed_to_terms, agreed_at, signup_idempotency_key
  ) values (
    signup_record->>'program_name', signup_record->>'program_code', 'independent_family',
    signup_record->>'admin_first_name', normalized_email,
    coalesce((signup_record->>'estimated_students')::integer, 1),
    signup_record->>'estimated_student_count_range', signup_record->>'account_context',
    signup_record->>'portal_type', signup_record->>'age_grade_band',
    nullif(signup_record->>'age_grade_notes', ''), signup_record->'feature_flags',
    signup_record->>'age_range', signup_record->>'group_name',
    signup_record->>'family_access_code', null, signup_record->>'pricing_tier',
    coalesce(signup_record->>'payment_status', 'pending'),
    coalesce(signup_record->>'pilot_status', 'active'), true,
    coalesce((signup_record->>'agreed_at')::timestamptz, now()), idempotency_key_input
  ) returning * into created_program;

  insert into public.participants (
    nickname, first_name, role, program_code, program_name, group_name, child_age_range
  ) values (
    child_name, child_name, 'student', created_program.program_code,
    created_program.program_name, created_program.group_name,
    nullif(signup_record->>'age_grade_band', '')
  ) returning * into created_participant;

  insert into public.student_family_links (
    student_id, camp_program_code, family_program_code, parent_email,
    parent_first_name, relationship, parent_claimed, claimed_at
  ) values (
    created_participant.id, created_program.program_code, created_program.program_code,
    normalized_email, created_program.admin_first_name, 'guardian', true, now()
  );

  return jsonb_build_object(
    'program', to_jsonb(created_program),
    'participant_id', created_participant.id,
    'reused', false
  );
end
$$;

revoke all on function public.create_independent_family_signup(jsonb, text, text)
  from public, anon, authenticated;
grant execute on function public.create_independent_family_signup(jsonb, text, text) to service_role;

comment on function public.create_independent_family_signup(jsonb, text, text) is
  'Atomically creates or idempotently reuses one independent family and its one named student. Server/service-role only.';
