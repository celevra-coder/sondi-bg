-- ============================================================
-- SONDI.BG EXPERT - SAVED ANALYSIS HISTORY
-- Every new run is stored permanently as a separate record.
-- analysis_version is used only to detect platform updates.
-- ============================================================

alter table public.expert_analyses
  add column if not exists analysis_version integer not null default 1
  check (analysis_version > 0);

-- The same point may be analysed more than once.
alter table public.expert_analyses
  drop constraint if exists expert_analyses_user_id_analysis_key_key;

drop index if exists expert_analyses_user_analysis_version_uidx;

create index if not exists expert_analyses_user_key_created_idx
  on public.expert_analyses(
    user_id,
    analysis_key,
    created_at desc
  );