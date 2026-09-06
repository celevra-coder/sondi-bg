-- ============================================================
-- SONDI.BG EXPERT - ADMIN EXCLUSION
-- Administrators never participate in EXPERT billing.
-- ============================================================

-- Remove any EXPERT billing records accidentally created
-- for existing administrators.
delete from public.expert_ledger
where user_id in (
  select user_id
  from public.admin_users
);

delete from public.expert_analyses
where user_id in (
  select user_id
  from public.admin_users
);

delete from public.expert_balance_lots
where user_id in (
  select user_id
  from public.admin_users
);

delete from public.expert_wallets
where user_id in (
  select user_id
  from public.admin_users
);


-- ============================================================
-- NEW AUTH USERS
-- Do not create an EXPERT wallet when the user is already admin.
-- ============================================================

create or replace function public.handle_new_sondi_expert_wallet()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.admin_users
    where user_id = new.id
  ) then
    return new;
  end if;

  insert into public.expert_wallets (
    user_id,
    free_analyses_remaining
  )
  values (
    new.id,
    2
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;


-- ============================================================
-- USER BECOMES ADMIN
-- Immediately remove the user from the EXPERT billing system.
-- ============================================================

create or replace function public.handle_sondi_expert_admin_added()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.expert_ledger
  where user_id = new.user_id;

  delete from public.expert_analyses
  where user_id = new.user_id;

  delete from public.expert_balance_lots
  where user_id = new.user_id;

  delete from public.expert_wallets
  where user_id = new.user_id;

  return new;
end;
$$;

drop trigger if exists on_sondi_admin_added_expert_exclusion
  on public.admin_users;

create trigger on_sondi_admin_added_expert_exclusion
after insert or update of user_id
on public.admin_users
for each row
execute function public.handle_sondi_expert_admin_added();


-- ============================================================
-- SAFETY BACKFILL
-- Only non-admin users may have wallets.
-- ============================================================

insert into public.expert_wallets (
  user_id,
  free_analyses_remaining
)
select
  u.id,
  2
from auth.users u
where not exists (
  select 1
  from public.admin_users a
  where a.user_id = u.id
)
on conflict (user_id) do nothing;