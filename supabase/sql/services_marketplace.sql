
-- ============================================================
-- SONDI.BG SERVICES MARKETPLACE
-- Water drilling + wells
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- 1. SERVICE PROVIDERS
-- ============================================================

create table if not exists public.service_providers (
  id uuid primary key default gen_random_uuid(),

  company_name text not null,
  phone text not null,
  email text,
  website_or_facebook text,

  services text[] not null default '{}',
  work_regions text[] not null default '{}',
  works_nationwide boolean not null default false,

  max_depth text,
  diameters text,
  drilling_method text,
  equipment text,
  presentation text,

  status text not null default 'pending'
    check (status in ('pending', 'approved', 'hidden', 'rejected')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint service_providers_regions_check
    check (
      works_nationwide = true
      or cardinality(work_regions) > 0
    ),

  constraint service_providers_services_check
    check (cardinality(services) > 0),

  constraint service_providers_company_name_check
    check (char_length(trim(company_name)) between 2 and 160),

  constraint service_providers_phone_check
    check (char_length(trim(phone)) between 5 and 40)
);

create index if not exists service_providers_status_idx
  on public.service_providers (status);

create index if not exists service_providers_created_at_idx
  on public.service_providers (created_at desc);

create index if not exists service_providers_work_regions_gin_idx
  on public.service_providers using gin (work_regions);

create index if not exists service_providers_services_gin_idx
  on public.service_providers using gin (services);

alter table public.service_providers
  enable row level security;

drop policy if exists "public can read approved service providers"
  on public.service_providers;

create policy "public can read approved service providers"
  on public.service_providers
  for select
  to anon, authenticated
  using (status = 'approved');

drop policy if exists "public can submit pending service providers"
  on public.service_providers;

create policy "public can submit pending service providers"
  on public.service_providers
  for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and (
      works_nationwide = true
      or cardinality(work_regions) > 0
    )
    and cardinality(services) > 0
  );


-- ============================================================
-- 2. CLIENT SERVICE REQUESTS
-- ============================================================

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),

  service text not null,
  region text not null,
  locality text,

  desired_period text,
  estimated_depth text,
  machine_access text
    check (
      machine_access is null
      or machine_access in ('yes', 'limited', 'unknown')
    ),

  description text not null,

  contact_phone text,
  contact_email text,

  status text not null default 'pending'
    check (status in ('pending', 'approved', 'hidden', 'rejected')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint service_requests_service_check
    check (char_length(trim(service)) between 2 and 160),

  constraint service_requests_region_check
    check (char_length(trim(region)) between 2 and 80),

  constraint service_requests_description_check
    check (char_length(trim(description)) between 10 and 3000),

  constraint service_requests_contact_check
    check (
      nullif(trim(contact_phone), '') is not null
      or nullif(trim(contact_email), '') is not null
    )
);

create index if not exists service_requests_status_idx
  on public.service_requests (status);

create index if not exists service_requests_region_idx
  on public.service_requests (region);

create index if not exists service_requests_service_idx
  on public.service_requests (service);

create index if not exists service_requests_created_at_idx
  on public.service_requests (created_at desc);

alter table public.service_requests
  enable row level security;

-- Important:
-- We deliberately DO NOT give anon/authenticated direct SELECT
-- access to service_requests because the table contains phone/email.
-- Public request cards will later use a safe endpoint that returns
-- only approved public fields.

drop policy if exists "public can submit pending service requests"
  on public.service_requests;

create policy "public can submit pending service requests"
  on public.service_requests
  for insert
  to anon, authenticated
  with check (status = 'pending');


-- ============================================================
-- 3. PROVIDER MEDIA METADATA
-- Actual files will later live in Supabase Storage.
-- ============================================================

create table if not exists public.service_provider_media (
  id uuid primary key default gen_random_uuid(),

  provider_id uuid not null
    references public.service_providers(id)
    on delete cascade,

  media_type text not null
    check (media_type in ('image', 'video')),

  storage_path text not null,
  caption text,

  sort_order integer not null default 0,

  status text not null default 'pending'
    check (status in ('pending', 'approved', 'hidden', 'rejected')),

  created_at timestamptz not null default now()
);

create index if not exists service_provider_media_provider_idx
  on public.service_provider_media (provider_id);

create index if not exists service_provider_media_status_idx
  on public.service_provider_media (status);

alter table public.service_provider_media
  enable row level security;

drop policy if exists "public can read approved provider media"
  on public.service_provider_media;

create policy "public can read approved provider media"
  on public.service_provider_media
  for select
  to anon, authenticated
  using (
    status = 'approved'
    and exists (
      select 1
      from public.service_providers p
      where
        p.id = provider_id
        and p.status = 'approved'
    )
  );

-- INSERT policy for media will be added together with
-- the Storage bucket so that file and metadata rules match.


-- ============================================================
-- 4. UPDATED_AT TRIGGER
-- ============================================================

create or replace function public.set_services_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists service_providers_set_updated_at
  on public.service_providers;

create trigger service_providers_set_updated_at
before update on public.service_providers
for each row
execute function public.set_services_updated_at();

drop trigger if exists service_requests_set_updated_at
  on public.service_requests;

create trigger service_requests_set_updated_at
before update on public.service_requests
for each row
execute function public.set_services_updated_at();


-- ============================================================
-- ADMIN ACCESS
-- ============================================================

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users
  enable row level security;

drop policy if exists "admins can read own admin membership"
  on public.admin_users;

create policy "admins can read own admin membership"
  on public.admin_users
  for select
  to authenticated
  using (auth.uid() = user_id);


-- ============================================================
-- ADMIN POLICIES: SERVICE PROVIDERS
-- ============================================================

drop policy if exists "admins can read all service providers"
  on public.service_providers;

create policy "admins can read all service providers"
  on public.service_providers
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = auth.uid()
    )
  );

drop policy if exists "admins can update service providers"
  on public.service_providers;

create policy "admins can update service providers"
  on public.service_providers
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = auth.uid()
    )
  );


-- ============================================================
-- ADMIN POLICIES: CLIENT REQUESTS
-- Includes private phone/email.
-- ============================================================

drop policy if exists "admins can read all service requests"
  on public.service_requests;

create policy "admins can read all service requests"
  on public.service_requests
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = auth.uid()
    )
  );

drop policy if exists "admins can update service requests"
  on public.service_requests;

create policy "admins can update service requests"
  on public.service_requests
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = auth.uid()
    )
  );


-- ============================================================
-- ADMIN POLICIES: PROVIDER MEDIA
-- ============================================================

drop policy if exists "admins can read all provider media"
  on public.service_provider_media;

create policy "admins can read all provider media"
  on public.service_provider_media
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = auth.uid()
    )
  );

drop policy if exists "admins can update provider media"
  on public.service_provider_media;

create policy "admins can update provider media"
  on public.service_provider_media
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = auth.uid()
    )
  );
