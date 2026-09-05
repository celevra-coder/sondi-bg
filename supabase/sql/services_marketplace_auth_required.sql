
-- ============================================================
-- SONDI.BG SERVICES - REGISTRATION REQUIRED
-- ============================================================

-- Link submissions to registered users.
alter table public.service_providers
  add column if not exists owner_id uuid
  references auth.users(id)
  on delete set null;

alter table public.service_requests
  add column if not exists owner_id uuid
  references auth.users(id)
  on delete set null;

alter table public.service_providers
  add column if not exists price_text text;

create index if not exists service_providers_owner_id_idx
  on public.service_providers(owner_id);

create index if not exists service_requests_owner_id_idx
  on public.service_requests(owner_id);


-- ============================================================
-- PROVIDER SUBMISSION
-- Anonymous submission is forbidden.
-- ============================================================

drop policy if exists "public can submit pending service providers"
  on public.service_providers;

drop policy if exists "authenticated can submit pending service providers"
  on public.service_providers;

create policy "authenticated can submit pending service providers"
  on public.service_providers
  for insert
  to authenticated
  with check (
    auth.uid() = owner_id
    and status = 'pending'
    and cardinality(services) > 0
    and (
      works_nationwide = true
      or cardinality(work_regions) > 0
    )
  );


-- ============================================================
-- CLIENT REQUEST SUBMISSION
-- Anonymous submission is forbidden.
-- ============================================================

drop policy if exists "public can submit pending service requests"
  on public.service_requests;

drop policy if exists "authenticated can submit pending service requests"
  on public.service_requests;

create policy "authenticated can submit pending service requests"
  on public.service_requests
  for insert
  to authenticated
  with check (
    auth.uid() = owner_id
    and status = 'pending'
  );


-- ============================================================
-- APPROVED PROVIDERS
-- Registered users may read full provider records including
-- contact details.
-- ============================================================

drop policy if exists "public can read approved service providers"
  on public.service_providers;

drop policy if exists "authenticated can read approved service providers"
  on public.service_providers;

create policy "authenticated can read approved service providers"
  on public.service_providers
  for select
  to authenticated
  using (status = 'approved');


-- ============================================================
-- APPROVED CLIENT REQUESTS
-- Registered users may see approved requests including contact.
-- ============================================================

drop policy if exists "authenticated can read approved service requests"
  on public.service_requests;

create policy "authenticated can read approved service requests"
  on public.service_requests
  for select
  to authenticated
  using (status = 'approved');


-- ============================================================
-- SAFE PUBLIC PROVIDER DATA
-- Visitors can browse provider information but not contacts.
-- ============================================================

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


-- ============================================================
-- SAFE PUBLIC REQUEST DATA
-- Visitors can browse approved requests but not contacts.
-- ============================================================

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
