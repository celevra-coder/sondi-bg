
-- ============================================================
-- SONDI.BG SERVICES MARKETPLACE - PHASE 2
-- Registered-user contacts + public safe listings + price
-- ============================================================

-- ------------------------------------------------------------
-- 1. OPTIONAL PROVIDER PRICE
-- ------------------------------------------------------------

alter table public.service_providers
  add column if not exists price_text text;


-- ------------------------------------------------------------
-- 2. PROVIDERS
-- Anonymous visitors must NOT have direct access to the base
-- table because it contains phone/email/contact information.
-- ------------------------------------------------------------

drop policy if exists "public can read approved service providers"
  on public.service_providers;

drop policy if exists "authenticated can read approved service providers"
  on public.service_providers;

create policy "authenticated can read approved service providers"
  on public.service_providers
  for select
  to authenticated
  using (status = 'approved');


-- ------------------------------------------------------------
-- 3. CLIENT REQUESTS
-- Registered users may see approved requests, including contact.
-- Administrators still have their separate all-records policy.
-- ------------------------------------------------------------

drop policy if exists "authenticated can read approved service requests"
  on public.service_requests;

create policy "authenticated can read approved service requests"
  on public.service_requests
  for select
  to authenticated
  using (status = 'approved');


-- ------------------------------------------------------------
-- 4. SAFE PUBLIC PROVIDER LIST
-- No phone, email or website/contact data.
-- ------------------------------------------------------------

create or replace function public.get_public_service_providers()
returns table (
  id uuid,
  company_name text,
  services text[],
  work_regions text[],
  works_nationwide boolean,
  max_depth text,
  diameters text,
  drilling_method text,
  equipment text,
  presentation text,
  price_text text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.company_name,
    p.services,
    p.work_regions,
    p.works_nationwide,
    p.max_depth,
    p.diameters,
    p.drilling_method,
    p.equipment,
    p.presentation,
    p.price_text,
    p.created_at
  from public.service_providers p
  where p.status = 'approved'
  order by p.created_at desc;
$$;

revoke all on function public.get_public_service_providers()
  from public;

grant execute on function public.get_public_service_providers()
  to anon, authenticated;


-- ------------------------------------------------------------
-- 5. SAFE PUBLIC CLIENT REQUEST LIST
-- No phone or email.
-- ------------------------------------------------------------

create or replace function public.get_public_service_requests()
returns table (
  id uuid,
  service text,
  region text,
  locality text,
  desired_period text,
  estimated_depth text,
  machine_access text,
  description text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id,
    r.service,
    r.region,
    r.locality,
    r.desired_period,
    r.estimated_depth,
    r.machine_access,
    r.description,
    r.created_at
  from public.service_requests r
  where r.status = 'approved'
  order by r.created_at desc;
$$;

revoke all on function public.get_public_service_requests()
  from public;

grant execute on function public.get_public_service_requests()
  to anon, authenticated;
