-- Removes unused bundle fulfillment tables. Aborts if any shipping row or claim token exists.
-- Does not delete bookstore orders, historical payment links, or family access.

do $$
begin
  if exists (select 1 from public.bookstore_order_fulfillment) then
    raise exception 'bookstore_order_fulfillment has rows; rollback aborted';
  end if;
  if exists (select 1 from public.academy_claim_tokens) then
    raise exception 'academy_claim_tokens has rows; rollback aborted';
  end if;
end $$;

drop table if exists public.academy_claim_tokens;
drop table if exists public.bookstore_order_fulfillment;

alter table public.academy_bundle_claims drop column if exists invitation_sent_at;
