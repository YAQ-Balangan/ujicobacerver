-- Run in Supabase SQL Editor before the exam.
-- These indexes match the filters used by the student and monitoring screens.

create index if not exists idx_nilai_nama_siswa
  on public.nilai (nama_siswa);

create index if not exists idx_nilai_mapel
  on public.nilai (mapel);

create index if not exists idx_sesi_ujian_status_updated_at
  on public.sesi_ujian (status, updated_at desc);

create index if not exists idx_sesi_ujian_username_exam
  on public.sesi_ujian (username_siswa, id_ujian);

-- Verify the constraints that make retries safe.
select
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in ('nilai', 'sesi_ujian')
order by tablename, indexname;
