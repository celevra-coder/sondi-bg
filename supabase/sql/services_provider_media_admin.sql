-- ============================================================
-- SONDI.BG - ADMIN ACCESS TO PROVIDER MEDIA STORAGE
-- ============================================================

drop policy if exists "admins can read provider media objects"
  on storage.objects;

create policy "admins can read provider media objects"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'provider-media'
    and exists (
      select 1
      from public.admin_users a
      where a.user_id = auth.uid()
    )
  );
