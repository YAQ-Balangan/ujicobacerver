-- CBT TADBIRA: migration for reliable online/offline submissions.
-- Run this script once in the Supabase SQL Editor.
-- Existing nilai rows are preserved; new metadata columns are nullable so the
-- migration can be applied without rewriting historical results.

begin;

alter table public.nilai
  add column if not exists username text,
  add column if not exists id_ujian text,
  add column if not exists submission_id text,
  add column if not exists created_at timestamptz not null default now();

-- A retry of the same offline submission must be idempotent. PostgreSQL
-- permits multiple NULL values, so historical rows remain unaffected.
create unique index if not exists uq_nilai_submission_id
  on public.nilai (submission_id)
  where submission_id is not null;

create index if not exists idx_nilai_username_exam
  on public.nilai (username, id_ujian);

create index if not exists idx_nilai_student_subject
  on public.nilai (nama_siswa, mapel);

create index if not exists idx_nilai_created_at
  on public.nilai (created_at desc);

-- Keep the stale-session cleanup aligned with the submission metadata.
create or replace function public.cleanup_stale_exam_sessions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.sesi_ujian s
  where s.updated_at < now() - interval '1 hour'
    and exists (
      select 1
      from public.nilai n
      where n.username = s.username_siswa
        and n.id_ujian = s.id_ujian::text
    );

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

commit;

-- Verification: these columns and indexes should be returned after migration.
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'nilai'
  and column_name in (
    'username', 'id_ujian', 'submission_id', 'created_at'
  )
order by ordinal_position;

select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = 'nilai'
  and indexname in (
    'uq_nilai_submission_id',
    'idx_nilai_username_exam',
    'idx_nilai_student_subject',
    'idx_nilai_created_at'
  )
order by indexname;
