
-- ============================================================
-- SONDI.BG USER PROFILES + OWN CONTENT MANAGEMENT
-- ============================================================

create table if not exists public.user_profiles (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,

  account_type text not null default 'client'
    check (
      account_type in (
        'client',
        'provider',
        'both'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles
  enable row level security;


-- ============================================================
-- USER PROFILE OWNERSHIP
-- ============================================================

drop policy if exists "users can read own profile"
  on public.user_profiles;

create policy "users can read own profile"
  on public.user_profiles
  for select
  to authenticated
  using (auth.uid() = user_id);


drop policy if exists "users can insert own profile"
  on public.user_profiles;

create policy "users can insert own profile"
  on public.user_profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);


drop policy if exists "users can update own profile"
  on public.user_profiles;

create policy "users can update own profile"
  on public.user_profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ============================================================
-- AUTOMATIC PROFILE CREATION AFTER AUTH SIGNUP
-- account_type will come from signup metadata.
-- ============================================================

create or replace function public.handle_new_sondi_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_type text;
begin
  requested_type :=
    new.raw_user_meta_data ->> 'account_type';

  if requested_type not in (
    'client',
    'provider',
    'both'
  ) then
    requested_type := 'client';
  end if;

  insert into public.user_profiles (
    user_id,
    account_type
  )
  values (
    new.id,
    requested_type
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_sondi_profile
  on auth.users;

create trigger on_auth_user_created_sondi_profile
after insert on auth.users
for each row
execute function public.handle_new_sondi_user();


-- ============================================================
-- BACKFILL EXISTING AUTH USERS
-- Existing accounts get "both" so current admins are not limited.
-- ============================================================

insert into public.user_profiles (
  user_id,
  account_type
)
select
  id,
  'both'
from auth.users
on conflict (user_id) do nothing;


-- ============================================================
-- CLIENT: OWN REQUESTS
-- ============================================================

drop policy if exists "users can read own service requests"
  on public.service_requests;

create policy "users can read own service requests"
  on public.service_requests
  for select
  to authenticated
  using (owner_id = auth.uid());


drop policy if exists "users can delete own service requests"
  on public.service_requests;

create policy "users can delete own service requests"
  on public.service_requests
  for delete
  to authenticated
  using (owner_id = auth.uid());


-- ============================================================
-- PROVIDER: ONE PROFESSIONAL PROFILE PER USER
-- ============================================================

create unique index if not exists
  service_providers_one_profile_per_owner_idx
on public.service_providers(owner_id)
where owner_id is not null;


drop policy if exists "users can read own service provider profile"
  on public.service_providers;

create policy "users can read own service provider profile"
  on public.service_providers
  for select
  to authenticated
  using (owner_id = auth.uid());


drop policy if exists "users can update own service provider profile"
  on public.service_providers;

create policy "users can update own service provider profile"
  on public.service_providers
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (
    owner_id = auth.uid()
    and status = 'pending'
  );


drop policy if exists "users can delete own service provider profile"
  on public.service_providers;

create policy "users can delete own service provider profile"
  on public.service_providers
  for delete
  to authenticated
  using (owner_id = auth.uid());


-- ============================================================
-- UPDATED_AT
-- ============================================================

drop trigger if exists user_profiles_set_updated_at
  on public.user_profiles;

create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row
execute function public.set_services_updated_at();
