-- Removes unused Academy membership tables.
-- Stops if a paid subscription, recorded payment, or activated claim exists.

do $$
begin
  if to_regclass('public.academy_entitlements') is not null
     and exists (
       select 1 from public.academy_entitlements
       where stripe_subscription_id is not null or kind = 'subscription'
     ) then
    raise exception 'Academy subscriptions exist. Rollback stopped.';
  end if;

  if to_regclass('public.academy_payments') is not null
     and exists (select 1 from public.academy_payments) then
    raise exception 'Academy payments exist. Rollback stopped.';
  end if;

  if to_regclass('public.academy_bundle_claims') is not null
     and exists (select 1 from public.academy_bundle_claims where activated_at is not null) then
    raise exception 'Activated bundle claims exist. Rollback stopped.';
  end if;

  drop table if exists public.academy_bundle_claims;
  drop table if exists public.academy_payments;
  drop table if exists public.academy_webhook_events;
  drop table if exists public.academy_entitlements;
  drop table if exists public.academy_membership_plans;
end $$;
