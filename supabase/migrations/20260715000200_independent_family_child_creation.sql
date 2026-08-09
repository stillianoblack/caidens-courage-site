-- Server-authoritative, idempotent child creation for independent-family compatibility sessions.

alter table public.participants
  add column if not exists family_child_idempotency_key text;

create unique index if not exists participants_family_child_idempotency_key_unique
  on public.participants (family_child_idempotency_key)
  where family_child_idempotency_key is not null;

create or replace function public.create_independent_family_child(
  program_code_input text,
  first_name_input text,
  nickname_input text,
  age_grade_input text,
  grade_level_input text,
  idempotency_key_input text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  family_program public.pilot_programs%rowtype;
  created_participant public.participants%rowtype;
  created_link public.student_family_links%rowtype;
  first_name_value text := btrim(first_name_input);
  nickname_value text := nullif(btrim(nickname_input), '');
  age_grade_value text := nullif(btrim(age_grade_input), '');
  grade_level_value text := nullif(btrim(grade_level_input), '');
  request_key text := btrim(idempotency_key_input);
  was_reused boolean := false;
begin
  if first_name_value = '' or request_key = '' then
    raise exception 'Required child identity fields are missing.';
  end if;

  select * into family_program
  from public.pilot_programs
  where program_code = btrim(program_code_input)
    and program_type = 'independent_family'
    and pilot_status <> 'archived'
  for update;

  if not found then raise exception 'Independent family program does not exist.'; end if;

  select * into created_participant
  from public.participants
  where family_child_idempotency_key = request_key
  limit 1;

  if found then
    if created_participant.program_code <> family_program.program_code then
      raise exception 'Idempotency key belongs to another family.';
    end if;
    was_reused := true;
  else
    insert into public.participants (
      nickname, first_name, role, program_code, program_name, group_name,
      child_age_range, grade_level, family_child_idempotency_key
    ) values (
      coalesce(nickname_value, first_name_value), first_name_value, 'student',
      family_program.program_code, family_program.program_name, family_program.group_name,
      age_grade_value, grade_level_value, request_key
    ) returning * into created_participant;
  end if;

  insert into public.student_family_links (
    student_id, camp_program_code, family_program_code, parent_email,
    parent_first_name, relationship, parent_claimed, claimed_at
  ) values (
    created_participant.id, family_program.program_code, family_program.program_code,
    lower(btrim(family_program.admin_email)), family_program.admin_first_name,
    'guardian', true, now()
  )
  on conflict (student_id, camp_program_code) do update set
    family_program_code = excluded.family_program_code,
    parent_email = excluded.parent_email,
    parent_first_name = excluded.parent_first_name,
    parent_claimed = true,
    claimed_at = coalesce(public.student_family_links.claimed_at, excluded.claimed_at)
  returning * into created_link;

  if not was_reused then
    insert into public.admin_audit_events (
      actor_role, action, target_type, target_id, request_correlation_id,
      reason, metadata
    ) values (
      'family_compatibility_session', 'family_child_created', 'participant',
      created_participant.id, request_key,
      'Independent-family Add Child created through validated server session.',
      jsonb_build_object('program_id', family_program.id, 'family_link_id', created_link.id)
    );
  end if;

  return jsonb_build_object(
    'participant', to_jsonb(created_participant),
    'family_link', to_jsonb(created_link),
    'reused', was_reused
  );
end
$$;

revoke all on function public.create_independent_family_child(text,text,text,text,text,text)
  from public, anon, authenticated;
grant execute on function public.create_independent_family_child(text,text,text,text,text,text)
  to service_role;

comment on function public.create_independent_family_child(text,text,text,text,text,text) is
  'Creates one participant and family link for a server-validated independent-family session.';
