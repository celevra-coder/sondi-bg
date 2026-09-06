-- ============================================================
-- SONDI.BG EXPERT + DRILLER PDF ARCHIVE
-- One purchased analysis may store two permanent PDF snapshots.
-- ============================================================

alter table public.expert_analyses
  add column if not exists driller_pdf_storage_path text;

alter table public.expert_analyses
  add column if not exists driller_pdf_generated_at timestamptz;

create index if not exists expert_analyses_driller_pdf_idx
  on public.expert_analyses(
    user_id,
    driller_pdf_generated_at desc
  )
  where driller_pdf_storage_path is not null;