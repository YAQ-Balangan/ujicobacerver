-- CBT TADBIRA: storage for student profile photos.
-- Run once in the Supabase SQL Editor.
-- The application stores only the compressed WebP URL, never the image binary.

begin;

alter table public.users
  add column if not exists foto_profil text;

alter table public.users
  add column if not exists foto_posisi text default '50% 50%';

comment on column public.users.foto_profil is
  'URL foto profil siswa yang sudah dikompres menjadi WebP.';

comment on column public.users.foto_posisi is
  'Posisi crop foto profil dalam format object-position CSS.';

create index if not exists idx_users_foto_profil
  on public.users (id)
  where foto_profil is not null;

commit;

-- Verification: this should return one row after the migration.
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'users'
  and column_name = 'foto_profil';
