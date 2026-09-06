-- ============================================================
-- SONDI.BG EXPERT - PDF ARCHIVE
-- Each completed analysis can keep a permanent PDF snapshot.
-- ============================================================

alter table public.expert_analyses
  add column if not exists location_label text;

alter table public.expert_analyses
  add column if not exists pdf_storage_path text;

alter table public.expert_analyses
  add column if not exists pdf_generated_at timestamptz;

create index if not exists expert_analyses_pdf_idx
  on public.expert_analyses(
    user_id,
    pdf_generated_at desc
  )
  where pdf_storage_path is not null;