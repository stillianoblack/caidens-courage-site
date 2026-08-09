-- Correct a verified participant RLS recursion/privilege error without changing the ownership model.

create or replace function private.portal_can_access_participant(target_participant_id uuid)
returns boolean language plpgsql stable security definer
set search_path = pg_catalog, public, private
set row_security = off
as $$
begin
  if exists (
    select 1 from public.portal_participant_access participant_access
    join public.portal_program_memberships membership
      on membership.id = participant_access.membership_id
    where participant_access.auth_user_id = auth.uid()
      and participant_access.participant_id = target_participant_id
      and participant_access.status = 'active'
      and membership.status = 'active'
      and (participant_access.valid_until is null or participant_access.valid_until > now())
      and (membership.valid_until is null or membership.valid_until > now())
  ) then
    return true;
  end if;

  return exists (
    select 1
    from public.portal_program_memberships membership
    join public.pilot_programs program on program.id = membership.program_id
    join public.participants participant on participant.id = target_participant_id
    where membership.auth_user_id = auth.uid()
      and membership.portal_role = 'facilitator'
      and membership.status = 'active'
      and (membership.valid_until is null or membership.valid_until > now())
      and (
        participant.program_code = program.program_code
        or exists (
          select 1 from public.student_family_links link
          where link.student_id = participant.id
            and link.camp_program_code = program.program_code
        )
      )
  );
end
$$;

revoke all on function private.portal_can_access_participant(uuid) from public, anon;
grant execute on function private.portal_can_access_participant(uuid) to authenticated, service_role;
