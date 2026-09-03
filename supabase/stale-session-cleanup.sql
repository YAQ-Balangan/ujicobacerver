-- Jalankan sekali di Supabase SQL Editor.
-- Membersihkan sesi yang tidak berubah selama satu jam dan nilainya sudah tersimpan,
-- termasuk saat seluruh browser sedang ditutup.

create or replace function public.cleanup_stale_exam_sessions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.sesi_ujian
  where updated_at < now() - interval '1 hour'
    and exists (
      select 1
      from public.nilai n
      where n.username = sesi_ujian.username_siswa
        and n.id_ujian = sesi_ujian.id_ujian
    );

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

-- Scheduler pg_cron tidak tersedia di semua project Supabase.
-- Jika extension pg_cron sudah diaktifkan, jalankan perintah berikut
-- secara terpisah. Jangan jalankan pada project tanpa pg_cron.
--
-- select cron.schedule(
--   'cleanup-stale-exam-sessions',
--   '*/5 * * * *',
--   $$select public.cleanup_stale_exam_sessions();$$
-- );
