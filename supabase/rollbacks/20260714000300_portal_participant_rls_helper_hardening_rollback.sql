-- Restores the initial SQL helper. Use only together with a full ownership rollback.
create or replace function private.portal_can_access_participant(target_participant_id uuid)
returns boolean language sql stable security definer
set search_path = pg_catalog, public, private
as $$
  select exists (
    select 1 from public.portal_participant_access access
    join public.portal_program_memberships membership on membership.id = access.membership_id
    where access.auth_user_id = auth.uid()
      and access.participant_id = target_participant_id
      and access.status = 'active'
      and membership.status = 'active'
      and (access.valid_until is null or access.valid_until > now())
      and (membership.valid_until is null or membership.valid_until > now())
  ) or exists (
    select 1 from public.portal_program_memberships membership
    join public.pilot_programs program on program.id = membership.program_id
    join public.participants participant on participant.id = target_participant_id
    where membership.auth_user_id = auth.uid()
      and membership.portal_role = 'facilitator'
      and membership.status = 'active'
      and (membership.valid_until is null or membership.valid_until > now())
      and (participant.program_code = program.program_code or exists (
        select 1 from public.student_family_links link
        where link.student_id = participant.id and link.camp_program_code = program.program_code
      ))
  )
$$;
