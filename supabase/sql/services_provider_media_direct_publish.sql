-- ============================================================
-- PROVIDER MEDIA - DIRECT PUBLISH
-- Current production model:
-- - provider media is published immediately
-- - no manual approval stage
-- ============================================================

drop policy if exists
  "owners can insert own provider media"
on public.service_provider_media;

create policy
  "owners can insert own provider media"
on public.service_provider_media
for insert
to authenticated
with check (
  status = 'approved'
  and exists (
    select 1
    from public.service_providers p
    where
      p.id = provider_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists
  "owners can update own provider media"
on public.service_provider_media;

create policy
  "owners can update own provider media"
on public.service_provider_media
for update
to authenticated
using (
  exists (
    select 1
    from public.service_providers p
    where
      p.id = provider_id
      and p.owner_id = auth.uid()
  )
)
with check (
  status = 'approved'
  and exists (
    select 1
    from public.service_providers p
    where
      p.id = provider_id
      and p.owner_id = auth.uid()
  )
);
