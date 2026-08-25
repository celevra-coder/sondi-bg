
create table if not exists public.aidu_shared_analyses (
  id uuid primary key default gen_random_uuid(),
  share_code text not null unique,
  owner_id uuid not null references auth.users(id) on delete cascade,

  location_label text,
  latitude double precision,
  longitude double precision,

  groundwater_bodies jsonb not null default '[]'::jsonb,
  analysis jsonb not null,
  client_text text,
  aidu_files jsonb not null default '[]'::jsonb,

  is_public boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists aidu_shared_analyses_share_code_idx
  on public.aidu_shared_analyses (share_code);

create index if not exists aidu_shared_analyses_owner_id_idx
  on public.aidu_shared_analyses (owner_id);

alter table public.aidu_shared_analyses
  enable row level security;

drop policy if exists "aidu share owner insert"
  on public.aidu_shared_analyses;

create policy "aidu share owner insert"
  on public.aidu_shared_analyses
  for insert
  to authenticated
  with check (auth.uid() = owner_id);

drop policy if exists "aidu share owner update"
  on public.aidu_shared_analyses;

create policy "aidu share owner update"
  on public.aidu_shared_analyses
  for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "aidu share owner delete"
  on public.aidu_shared_analyses;

create policy "aidu share owner delete"
  on public.aidu_shared_analyses
  for delete
  to authenticated
  using (auth.uid() = owner_id);

drop policy if exists "public can read shared aidu analyses"
  on public.aidu_shared_analyses;

create policy "public can read shared aidu analyses"
  on public.aidu_shared_analyses
  for select
  to anon, authenticated
  using (is_public = true);
