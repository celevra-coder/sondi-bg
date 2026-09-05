-- ============================================================
-- SONDI.BG PROVIDER MEDIA STORAGE
-- Private Storage bucket + owner/media RLS
-- ============================================================

-- ------------------------------------------------------------
-- 1. PRIVATE STORAGE BUCKET
-- ------------------------------------------------------------

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'provider-media',
  'provider-media',
  false,
  104857600,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- ------------------------------------------------------------
-- 2. OWNER ACCESS TO MEDIA METADATA
-- ------------------------------------------------------------

drop policy if exists "owners can read own provider media"
  on public.service_provider_media;

create policy "owners can read own provider media"
  on public.service_provider_media
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.service_providers p
      where
        p.id = provider_id
        and p.owner_id = auth.uid()
    )
  );


drop policy if exists "owners can insert own provider media"
  on public.service_provider_media;

create policy "owners can insert own provider media"
  on public.service_provider_media
  for insert
  to authenticated
  with check (
    status = 'pending'
    and exists (
      select 1
      from public.service_providers p
      where
        p.id = provider_id
        and p.owner_id = auth.uid()
    )
  );


drop policy if exists "owners can update own provider media"
  on public.service_provider_media;

create policy "owners can update own provider media"
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
    status = 'pending'
    and exists (
      select 1
      from public.service_providers p
      where
        p.id = provider_id
        and p.owner_id = auth.uid()
    )
  );


drop policy if exists "owners can delete own provider media"
  on public.service_provider_media;

create policy "owners can delete own provider media"
  on public.service_provider_media
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.service_providers p
      where
        p.id = provider_id
        and p.owner_id = auth.uid()
    )
  );


-- ------------------------------------------------------------
-- 3. OWNER ACCESS TO STORAGE OBJECTS
--
-- Path format:
-- <auth-user-id>/<provider-id>/<filename>
-- ------------------------------------------------------------

drop policy if exists "owners can read own provider media objects"
  on storage.objects;

create policy "owners can read own provider media objects"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'provider-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


drop policy if exists "owners can upload own provider media objects"
  on storage.objects;

create policy "owners can upload own provider media objects"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'provider-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


drop policy if exists "owners can delete own provider media objects"
  on storage.objects;

create policy "owners can delete own provider media objects"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'provider-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ------------------------------------------------------------
-- 4. PUBLIC READ OF APPROVED MEDIA OBJECTS
--
-- Bucket remains PRIVATE.
-- The object is readable only when:
-- media status = approved
-- provider status = approved
-- ------------------------------------------------------------

drop policy if exists "public can read approved provider media objects"
  on storage.objects;

create policy "public can read approved provider media objects"
  on storage.objects
  for select
  to anon, authenticated
  using (
    bucket_id = 'provider-media'
    and exists (
      select 1
      from public.service_provider_media m
      join public.service_providers p
        on p.id = m.provider_id
      where
        m.storage_path = name
        and m.status = 'approved'
        and p.status = 'approved'
    )
  );
