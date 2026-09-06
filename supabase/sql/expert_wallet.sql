-- ============================================================
-- SONDI.BG EXPERT WALLET, BALANCE LOTS, LEDGER AND SAVED ANALYSES
-- ============================================================

create table if not exists public.expert_wallets (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,

  free_analyses_remaining integer not null default 2
    check (free_analyses_remaining >= 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expert_balance_lots (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  currency text not null default 'eur'
    check (currency = 'eur'),

  deposited_cents integer not null
    check (deposited_cents > 0),

  remaining_cents integer not null
    check (remaining_cents >= 0),

  analysis_price_cents integer not null
    check (analysis_price_cents > 0),

  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,

  created_at timestamptz not null default now()
);

create index if not exists expert_balance_lots_user_created_idx
  on public.expert_balance_lots(user_id, created_at);

create table if not exists public.expert_analyses (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  analysis_key text not null,

  latitude double precision not null,
  longitude double precision not null,

  primary_gwb text,
  groundwater_bodies text[] not null default '{}',

  query_params jsonb not null default '{}'::jsonb,

  payment_type text not null
    check (payment_type in ('free', 'balance', 'admin', 'unlimited')),

  charged_cents integer not null default 0
    check (charged_cents >= 0),

  balance_lot_id uuid
    references public.expert_balance_lots(id)
    on delete set null,

  created_at timestamptz not null default now(),

  unique (user_id, analysis_key)
);

create index if not exists expert_analyses_user_created_idx
  on public.expert_analyses(user_id, created_at desc);

create table if not exists public.expert_ledger (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  entry_type text not null
    check (
      entry_type in (
        'deposit',
        'analysis',
        'bonus',
        'refund',
        'adjustment'
      )
    ),

  amount_cents integer not null,

  balance_lot_id uuid
    references public.expert_balance_lots(id)
    on delete set null,

  analysis_id uuid
    references public.expert_analyses(id)
    on delete set null,

  stripe_checkout_session_id text,

  description text,

  created_at timestamptz not null default now()
);

create index if not exists expert_ledger_user_created_idx
  on public.expert_ledger(user_id, created_at desc);


-- ============================================================
-- RLS
-- Users may read their own financial data.
-- Client-side writes are intentionally not allowed.
-- ============================================================

alter table public.expert_wallets enable row level security;
alter table public.expert_balance_lots enable row level security;
alter table public.expert_analyses enable row level security;
alter table public.expert_ledger enable row level security;


drop policy if exists "users can read own expert wallet"
  on public.expert_wallets;

create policy "users can read own expert wallet"
  on public.expert_wallets
  for select
  to authenticated
  using (auth.uid() = user_id);


drop policy if exists "users can read own expert balance lots"
  on public.expert_balance_lots;

create policy "users can read own expert balance lots"
  on public.expert_balance_lots
  for select
  to authenticated
  using (auth.uid() = user_id);


drop policy if exists "users can read own expert analyses"
  on public.expert_analyses;

create policy "users can read own expert analyses"
  on public.expert_analyses
  for select
  to authenticated
  using (auth.uid() = user_id);


drop policy if exists "users can read own expert ledger"
  on public.expert_ledger;

create policy "users can read own expert ledger"
  on public.expert_ledger
  for select
  to authenticated
  using (auth.uid() = user_id);


-- ============================================================
-- AUTOMATIC WALLET CREATION
-- New users start with two free EXPERT analyses.
-- ============================================================

create or replace function public.handle_new_sondi_expert_wallet()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
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

drop trigger if exists on_auth_user_created_sondi_expert_wallet
  on auth.users;

create trigger on_auth_user_created_sondi_expert_wallet
after insert on auth.users
for each row
execute function public.handle_new_sondi_expert_wallet();


-- Existing registered users also receive the initial two free analyses.
insert into public.expert_wallets (
  user_id,
  free_analyses_remaining
)
select
  id,
  2
from auth.users
on conflict (user_id) do nothing;