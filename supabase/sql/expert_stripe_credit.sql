-- ============================================================
-- SONDI.BG EXPERT - ATOMIC STRIPE BALANCE CREDIT
-- ============================================================

create or replace function public.credit_expert_balance_from_stripe(
  p_user_id uuid,
  p_checkout_session_id text,
  p_payment_intent_id text,
  p_deposited_cents integer,
  p_analysis_price_cents integer
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lot_id uuid;
begin
  if p_user_id is null then
    raise exception 'Missing user id';
  end if;

  if coalesce(trim(p_checkout_session_id), '') = '' then
    raise exception 'Missing checkout session id';
  end if;

  if p_deposited_cents <= 0 then
    raise exception 'Invalid deposited amount';
  end if;

  if p_analysis_price_cents <= 0 then
    raise exception 'Invalid analysis price';
  end if;

  if exists (
    select 1
    from public.admin_users
    where user_id = p_user_id
  ) then
    raise exception 'Administrator accounts are excluded from EXPERT billing';
  end if;

  select id
  into v_lot_id
  from public.expert_balance_lots
  where stripe_checkout_session_id = p_checkout_session_id
  limit 1;

  if v_lot_id is not null then
    return v_lot_id;
  end if;

  insert into public.expert_wallets (
    user_id,
    free_analyses_remaining
  )
  values (
    p_user_id,
    2
  )
  on conflict (user_id) do nothing;

  insert into public.expert_balance_lots (
    user_id,
    currency,
    deposited_cents,
    remaining_cents,
    analysis_price_cents,
    stripe_checkout_session_id,
    stripe_payment_intent_id
  )
  values (
    p_user_id,
    'eur',
    p_deposited_cents,
    p_deposited_cents,
    p_analysis_price_cents,
    p_checkout_session_id,
    nullif(trim(coalesce(p_payment_intent_id, '')), '')
  )
  returning id into v_lot_id;

  insert into public.expert_ledger (
    user_id,
    entry_type,
    amount_cents,
    balance_lot_id,
    stripe_checkout_session_id,
    description
  )
  values (
    p_user_id,
    'deposit',
    p_deposited_cents,
    v_lot_id,
    p_checkout_session_id,
    'Stripe EXPERT balance deposit'
  );

  return v_lot_id;
end;
$$;

revoke all on function public.credit_expert_balance_from_stripe(
  uuid,
  text,
  text,
  integer,
  integer
) from public;

revoke all on function public.credit_expert_balance_from_stripe(
  uuid,
  text,
  text,
  integer,
  integer
) from anon, authenticated;

grant execute on function public.credit_expert_balance_from_stripe(
  uuid,
  text,
  text,
  integer,
  integer
) to service_role;