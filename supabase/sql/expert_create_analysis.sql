-- ============================================================
-- SONDI.BG EXPERT - CREATE A NEW ANALYSIS
-- Every confirmed run creates a new permanent history record.
-- Free allowance is used first, then the active paid balance.
-- ============================================================

create or replace function public.create_sondi_expert_analysis(
  p_user_id uuid,
  p_analysis_key text,
  p_latitude double precision,
  p_longitude double precision,
  p_primary_gwb text,
  p_groundwater_bodies text[],
  p_query_params jsonb,
  p_analysis_version integer
)
returns table (
  analysis_id uuid,
  access_type text,
  charged_cents integer,
  free_analyses_remaining integer,
  paid_balance_remaining_cents integer,
  analysis_price_cents integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wallet public.expert_wallets%rowtype;
  v_lot public.expert_balance_lots%rowtype;
  v_analysis_id uuid;
  v_free_remaining integer := 0;
  v_paid_remaining integer := 0;
  v_analysis_price integer := 0;
begin
  if p_user_id is null then
    raise exception 'Missing user id';
  end if;

  if coalesce(trim(p_analysis_key), '') = '' then
    raise exception 'Missing analysis key';
  end if;

  if p_analysis_version is null or p_analysis_version <= 0 then
    raise exception 'Invalid analysis version';
  end if;

  if exists (
    select 1
    from public.admin_users
    where user_id = p_user_id
  ) then
    raise exception 'Administrator accounts do not use EXPERT billing';
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

  select *
  into v_wallet
  from public.expert_wallets
  where user_id = p_user_id
  for update;

  -- ==========================================================
  -- FREE ANALYSIS
  -- ==========================================================

  if v_wallet.free_analyses_remaining > 0 then
    update public.expert_wallets as ew
    set
      free_analyses_remaining =
        ew.free_analyses_remaining - 1,
      updated_at = now()
    where ew.user_id = p_user_id
    returning ew.free_analyses_remaining
    into v_free_remaining;

    insert into public.expert_analyses (
      user_id,
      analysis_key,
      latitude,
      longitude,
      primary_gwb,
      groundwater_bodies,
      query_params,
      payment_type,
      charged_cents,
      analysis_version
    )
    values (
      p_user_id,
      p_analysis_key,
      p_latitude,
      p_longitude,
      nullif(trim(coalesce(p_primary_gwb, '')), ''),
      coalesce(p_groundwater_bodies, '{}'::text[]),
      coalesce(p_query_params, '{}'::jsonb),
      'free',
      0,
      p_analysis_version
    )
    returning id into v_analysis_id;

    insert into public.expert_ledger (
      user_id,
      entry_type,
      amount_cents,
      analysis_id,
      description
    )
    values (
      p_user_id,
      'analysis',
      0,
      v_analysis_id,
      'Free SONDI EXPERT analysis'
    );

    select coalesce(sum(remaining_cents), 0)
    into v_paid_remaining
    from public.expert_balance_lots
    where user_id = p_user_id
      and remaining_cents > 0;

    select coalesce(
      (
        select ebl.analysis_price_cents
        from public.expert_balance_lots as ebl
        where ebl.user_id = p_user_id
          and ebl.remaining_cents > 0
        order by ebl.created_at asc
        limit 1
      ),
      0
    )
    into v_analysis_price;

    return query
    select
      v_analysis_id,
      'free'::text,
      0,
      coalesce(v_free_remaining, 0),
      coalesce(v_paid_remaining, 0),
      coalesce(v_analysis_price, 0);

    return;
  end if;

  -- ==========================================================
  -- PAID ANALYSIS
  -- Only one funded balance lot should normally exist because
  -- new top-ups are blocked until the current balance is zero.
  -- ==========================================================

  select *
  into v_lot
  from public.expert_balance_lots
  where user_id = p_user_id
    and remaining_cents > 0
  order by created_at asc
  limit 1
  for update;

  if not found then
    raise exception 'NO_EXPERT_ACCESS';
  end if;

  if v_lot.remaining_cents < v_lot.analysis_price_cents then
    raise exception 'INSUFFICIENT_EXPERT_BALANCE';
  end if;

  v_analysis_price :=
    v_lot.analysis_price_cents;

  update public.expert_balance_lots
  set remaining_cents =
    remaining_cents - v_analysis_price
  where id = v_lot.id
  returning remaining_cents
  into v_paid_remaining;

  insert into public.expert_analyses (
    user_id,
    analysis_key,
    latitude,
    longitude,
    primary_gwb,
    groundwater_bodies,
    query_params,
    payment_type,
    charged_cents,
    balance_lot_id,
    analysis_version
  )
  values (
    p_user_id,
    p_analysis_key,
    p_latitude,
    p_longitude,
    nullif(trim(coalesce(p_primary_gwb, '')), ''),
    coalesce(p_groundwater_bodies, '{}'::text[]),
    coalesce(p_query_params, '{}'::jsonb),
    'balance',
    v_analysis_price,
    v_lot.id,
    p_analysis_version
  )
  returning id into v_analysis_id;

  insert into public.expert_ledger (
    user_id,
    entry_type,
    amount_cents,
    balance_lot_id,
    analysis_id,
    description
  )
  values (
    p_user_id,
    'analysis',
    -v_analysis_price,
    v_lot.id,
    v_analysis_id,
    'SONDI EXPERT analysis'
  );

  select coalesce(ew.free_analyses_remaining, 0)
  into v_free_remaining
  from public.expert_wallets as ew
  where ew.user_id = p_user_id;

  return query
  select
    v_analysis_id,
    'balance'::text,
    v_analysis_price,
    coalesce(v_free_remaining, 0),
    coalesce(v_paid_remaining, 0),
    v_analysis_price;
end;
$$;

revoke all on function public.create_sondi_expert_analysis(
  uuid,
  text,
  double precision,
  double precision,
  text,
  text[],
  jsonb,
  integer
) from public;

revoke all on function public.create_sondi_expert_analysis(
  uuid,
  text,
  double precision,
  double precision,
  text,
  text[],
  jsonb,
  integer
) from anon, authenticated;

grant execute on function public.create_sondi_expert_analysis(
  uuid,
  text,
  double precision,
  double precision,
  text,
  text[],
  jsonb,
  integer
) to service_role;