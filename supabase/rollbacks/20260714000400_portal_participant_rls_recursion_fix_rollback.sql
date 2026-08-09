drop policy if exists portal_ownership_select on public.participants;
create policy portal_ownership_select on public.participants for select to authenticated
  using (private.portal_can_access_participant(id));
revoke all on function private.portal_can_access_participant(uuid,text)
  from public, anon, authenticated, service_role;
drop function if exists private.portal_can_access_participant(uuid,text);
