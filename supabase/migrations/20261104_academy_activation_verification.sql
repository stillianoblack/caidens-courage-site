-- Activation-only email verification for one Academy bundle claim.
-- Does not change Family signup, portal sign-in, access codes, or bookstore tables.
-- Do not apply until a separate staging approval. Do not apply to production.

create table if not exists public.academy_activation_verifications (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.academy_bundle_claims (id),
  family_program_id uuid not null references public.pilot_programs (id),
  code_hash text not null,
  expires_at timestamptz not null,
  attempt_count integer not null default 0 check (attempt_count >= 0 and attempt_count <= 5),
  code_consumed_at timestamptz,
  authorization_hash text unique,
  authorization_expires_at timestamptz,
  authorization_consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists academy_activation_verifications_claim_created_idx
  on public.academy_activation_verifications (claim_id, created_at desc);

alter table public.academy_activation_verifications enable row level security;

revoke all on table public.academy_activation_verifications from public, anon, authenticated;
grant select, insert, update on table public.academy_activation_verifications to service_role;

create or replace function public.issue_academy_activation_code(
  p_claim_id uuid,
  p_family_program_id uuid,
  p_code_hash text,
  p_now timestamptz default now()
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count integer;
  latest_created timestamptz;
begin
  if p_claim_id is null or p_family_program_id is null or length(coalesce(p_code_hash, '')) < 32 then
    return 'unavailable';
  end if;

  perform 1
  from public.academy_bundle_claims
  where id = p_claim_id
  for update;
  if not found then
    return 'unavailable';
  end if;

  select count(*)
  into recent_count
  from public.academy_activation_verifications
  where claim_id = p_claim_id
    and created_at > p_now - interval '1 hour';
  if recent_count >= 3 then
    return 'resend_limited';
  end if;

  select max(created_at)
  into latest_created
  from public.academy_activation_verifications
  where claim_id = p_claim_id;
  if latest_created is not null and latest_created > p_now - interval '60 seconds' then
    return 'resend_limited';
  end if;

  update public.academy_activation_verifications
  set code_consumed_at = p_now
  where claim_id = p_claim_id
    and code_consumed_at is null;

  insert into public.academy_activation_verifications (
    claim_id,
    family_program_id,
    code_hash,
    expires_at
  ) values (
    p_claim_id,
    p_family_program_id,
    p_code_hash,
    p_now + interval '10 minutes'
  );

  return 'issued';
end;
$$;

create or replace function public.consume_academy_activation_code(
  p_claim_id uuid,
  p_code_hash text,
  p_authorization_hash text,
  p_now timestamptz default now()
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  verification public.academy_activation_verifications%rowtype;
  updated_id uuid;
begin
  if p_claim_id is null or length(coalesce(p_code_hash, '')) < 32 or length(coalesce(p_authorization_hash, '')) < 32 then
    return jsonb_build_object('outcome', 'unavailable');
  end if;

  select *
  into verification
  from public.academy_activation_verifications
  where claim_id = p_claim_id
    and code_consumed_at is null
  order by created_at desc
  limit 1
  for update;

  if not found then
    if exists (
      select 1
      from public.academy_activation_verifications
      where claim_id = p_claim_id
        and code_hash = p_code_hash
        and code_consumed_at is not null
    ) then
      return jsonb_build_object('outcome', 'reused');
    end if;
    return jsonb_build_object('outcome', 'expired');
  end if;

  if verification.expires_at <= p_now or verification.attempt_count >= 5 then
    update public.academy_activation_verifications
    set code_consumed_at = p_now
    where id = verification.id
      and code_consumed_at is null;
    return jsonb_build_object(
      'outcome',
      case when verification.attempt_count >= 5 then 'attempts_exhausted' else 'expired' end
    );
  end if;

  if verification.code_hash is distinct from p_code_hash then
    update public.academy_activation_verifications
    set attempt_count = attempt_count + 1,
        code_consumed_at = case when attempt_count + 1 >= 5 then p_now else code_consumed_at end
    where id = verification.id
      and code_consumed_at is null;
    return jsonb_build_object('outcome', 'incorrect');
  end if;

  update public.academy_activation_verifications
  set code_consumed_at = p_now,
      authorization_hash = p_authorization_hash,
      authorization_expires_at = p_now + interval '10 minutes'
  where id = verification.id
    and code_consumed_at is null
    and code_hash = p_code_hash
  returning id into updated_id;

  if updated_id is null then
    return jsonb_build_object('outcome', 'unavailable');
  end if;

  return jsonb_build_object(
    'outcome', 'verified',
    'familyProgramId', verification.family_program_id
  );
end;
$$;

create or replace function public.consume_academy_activation_authorization(
  p_claim_id uuid,
  p_authorization_hash text,
  p_now timestamptz default now()
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  program_id uuid;
begin
  update public.academy_activation_verifications
  set authorization_consumed_at = p_now
  where claim_id = p_claim_id
    and authorization_hash = p_authorization_hash
    and code_consumed_at is not null
    and authorization_consumed_at is null
    and authorization_expires_at > p_now
  returning family_program_id into program_id;

  return program_id;
end;
$$;

create or replace function public.revoke_academy_activation_code(
  p_claim_id uuid,
  p_code_hash text,
  p_now timestamptz default now()
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_id uuid;
begin
  update public.academy_activation_verifications
  set code_consumed_at = p_now
  where claim_id = p_claim_id
    and code_hash = p_code_hash
    and code_consumed_at is null
  returning id into updated_id;

  return updated_id is not null;
end;
$$;

revoke all on function public.issue_academy_activation_code(uuid, uuid, text, timestamptz) from public, anon, authenticated;
revoke all on function public.consume_academy_activation_code(uuid, text, text, timestamptz) from public, anon, authenticated;
revoke all on function public.consume_academy_activation_authorization(uuid, text, timestamptz) from public, anon, authenticated;
revoke all on function public.revoke_academy_activation_code(uuid, text, timestamptz) from public, anon, authenticated;

grant execute on function public.issue_academy_activation_code(uuid, uuid, text, timestamptz) to service_role;
grant execute on function public.consume_academy_activation_code(uuid, text, text, timestamptz) to service_role;
grant execute on function public.consume_academy_activation_authorization(uuid, text, timestamptz) to service_role;
grant execute on function public.revoke_academy_activation_code(uuid, text, timestamptz) to service_role;
