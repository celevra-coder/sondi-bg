-- ============================================================
-- SERVICES MARKETPLACE - DIRECT PUBLISH
-- Current production model:
-- - anonymous users register through server API routes
-- - authenticated users publish their own marketplace records
-- - no manual approval stage
-- ============================================================

-- ============================================================
-- SERVICE PROVIDERS
-- ============================================================

drop policy if exists
  "public can submit pending service providers"
on public.service_providers;

drop policy if exists
  "authenticated can submit pending service providers"
on public.service_providers;

drop policy if exists
  "authenticated can submit approved service providers"
on public.service_providers;

create policy
  "authenticated can submit approved service providers"
on public.service_providers
for insert
to authenticated
with check (
  auth.uid() = owner_id
  and status = 'approved'
  and cardinality(services) > 0
  and (
    works_nationwide = true
    or cardinality(work_regions) > 0
  )
);


-- ============================================================
-- SERVICE REQUESTS
-- ============================================================

drop policy if exists
  "public can submit pending service requests"
on public.service_requests;

drop policy if exists
  "authenticated can submit pending service requests"
on public.service_requests;

drop policy if exists
  "authenticated can submit approved service requests"
on public.service_requests;

create policy
  "authenticated can submit approved service requests"
on public.service_requests
for insert
to authenticated
with check (
  auth.uid() = owner_id
  and status = 'approved'
);


-- ============================================================
-- PROVIDER PROFILE EDITING
-- ============================================================

drop policy if exists
  "users can update own service provider profile"
on public.service_providers;

create policy
  "users can update own service provider profile"
on public.service_providers
for update
to authenticated
using (
  owner_id = auth.uid()
)
with check (
  owner_id = auth.uid()
  and status = 'approved'
);
