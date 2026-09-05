# Arsitektur dan Flow CBT TADBIRA

Dokumen ringkas untuk memahami struktur aplikasi di masa depan.

## 1. Gambaran besar

- **Frontend:** React 19 + Vite + Tailwind CSS.
- **Backend/data server:** Supabase (PostgreSQL, REST API, dan Realtime).
- **Router:** React Router.
- **Penyimpanan sesi login:** `sessionStorage`.
- **Cache dan antrean offline:** `localStorage`.
- **Tidak ada server Node/Express terpisah** pada versi sekarang.
- Semua operasi database melewati `src/api/api.js`.

Alur umum:

```text
Browser
  -> React Pages/Components
  -> AuthContext atau api.js
  -> Supabase REST/Realtime
  -> PostgreSQL
```

## 2. Struktur frontend

```text
src/
├─ App.jsx                  # Router, protected route, background sync
├─ main.jsx                 # Entry point React
├─ api/api.js               # Satu pintu komunikasi ke Supabase
├─ context/AuthContext.jsx  # Login, logout, user aktif
├─ pages/
│  ├─ LoginPage.jsx
│  ├─ AdminDashboard.jsx    # Legacy/kompatibilitas
│  ├─ GuruDashboard.jsx
│  ├─ SiswaDashboard.jsx
│  └─ UjianDashboard.jsx    # Live monitoring
├─ features/admin/          # Modul admin yang sudah dipisah
│  ├─ AdminRoutes.jsx
│  ├─ AdminDashboard.jsx
│  ├─ pages/                # Users, Jadwal, Mapel
│  ├─ tabs/                 # Tab data admin
│  └─ components/           # Tabel desktop/mobile dan filter
├─ components/
│  ├─ layout/Dashboard.jsx  # Shell/sidebar/header semua role
│  ├─ layout/*Wrapper.jsx   # Lazy wrapper dashboard
│  ├─ modals/                # Form manual, import, template, snap
│  └─ ui/                    # Card, Badge, tabel, select, skeleton, LaTeX
└─ utils/
   ├─ offlineQueue.js        # Antrean nilai offline dan deduplikasi
   └─ settings.js            # Pembacaan toggle konfigurasi
```

## 3. Modul dan fungsi setiap role

### Admin

- Mengelola pengguna: admin, guru, dan siswa.
- Mengelola mata pelajaran.
- Mengelola jadwal ujian.
- Mengatur konfigurasi sistem:
  - mode ujian,
  - mode aplikasi,
  - acak soal,
  - timer ujian,
  - izin hapus soal dan pengaturan terkait.
- Memantau data dasar dan akses menuju live room.

### Guru

- Mengelola bank soal.
- Membuat soal manual.
- Mengedit, menggandakan, dan menghapus soal.
- Import soal massal dari teks hasil copy-paste.
- Membantu merapikan rumus dengan AI, lalu tetap melakukan preview manual.
- Snap soal dari PDF/gambar dengan zoom dan crop.
- Melihat nilai dan rekap siswa.
- Melihat detail jawaban.
- Memantau pelanggaran.
- Membuka kunci sesi siswa.
- Membuka kembali hasil diskualifikasi sesuai alur yang tersedia.
- Memantau live ujian melalui `UjianDashboard`.

### Siswa

- Masuk ke dashboard siswa sebelum ujian.
- Melihat ujian yang tersedia sesuai jadwal dan konfigurasi.
- Memulai atau melanjutkan ujian.
- Menjawab soal dan melihat timer.
- Menyimpan jawaban secara berkala.
- Tetap melanjutkan ujian saat koneksi terputus.
- Mengirim hasil secara online atau memasukkannya ke antrean offline.
- Melihat nilai yang sudah tersimpan.
- Menerima status `ACTIVE`, `LOCKED`, atau `DISQUALIFIED`.

## 4. Integrasi frontend internal

### Login dan proteksi role

1. `LoginPage` memanggil `AuthContext.login`.
2. `AuthContext` memanggil `api.login`.
3. User disimpan di `sessionStorage`.
4. `App.jsx` membaca role user.
5. `ProtectedRoute` hanya mengizinkan role yang sesuai.
6. Dashboard dimuat secara lazy agar initial load lebih ringan.

### Komponen bersama

- `Dashboard.jsx` menyediakan sidebar, header, drawer mobile, logout, dan area konten.
- `Ui.jsx` menyediakan komponen visual bersama.
- Modal menerima state dan handler dari dashboard, sehingga logika data tetap berada di halaman pemiliknya.
- `settings.js` dipakai siswa dan dashboard lain agar membaca key konfigurasi yang sama.

### Guru ke live monitoring

1. Guru membuka `UjianDashboard`.
2. Dashboard membaca data siswa, jadwal, dan sesi dari Supabase.
3. Realtime Supabase dipakai ketika tersedia.
4. Polling/fetch ulang menjadi fallback jika perubahan realtime terlambat atau koneksi berubah.
5. Status sesi guru dan status siswa memakai record `sesi_ujian` yang sama.

## 5. Integrasi frontend ke backend/Supabase

Semua request utama dipusatkan di [api.js](../src/api/api.js):

- `read`, `create`, `createBulk`, `update`, `delete`, `deleteBulk`.
- `login`.
- `getSoalUjian`, `getNilaiSiswa`, `getTotalSoal`.
- `saveSesi`, `getSesi`, `deleteSesi`.
- `updateSesiStatus`, `getSesiTerkunci`.
- `submitNilai`, `cleanupStaleSesi`.

Tabel utama yang dipakai:

- `users`: akun dan role.
- `soal`: bank soal.
- `nilai`: hasil ujian dan detail jawaban.
- `sesi_ujian`: progres, jawaban sementara, timer, pelanggaran, dan status sesi.
- `settings`: konfigurasi aplikasi.
- `jadwal`: jadwal ujian.
- `mapel`: mata pelajaran.

## 6. Flow ujian online

1. Siswa login.
2. Siswa membaca jadwal, soal, dan setting dari Supabase.
3. Siswa memulai ujian.
4. Jawaban ditaruh di state React dan cache lokal.
5. Jawaban/sisa waktu disimpan ke `sesi_ujian` secara berkala dan saat berpindah soal.
6. Anti-cheat mendeteksi visibility, blur, fullscreen, resize, shortcut, klik kanan, dan kejadian terkait lainnya.
7. Pelanggaran pertama dapat mengubah sesi menjadi `LOCKED`.
8. Guru melihat sesi terkunci di live monitoring.
9. Guru melakukan unlock; status sesi kembali aktif dan penghitung pelanggaran dapat direset.
10. Siswa melanjutkan ujian.
11. Jika batas pelanggaran tercapai, sesi menjadi `DISQUALIFIED`.
12. Saat submit, nilai dan detail jawaban dikirim ke tabel `nilai`.
13. Jika berhasil, sesi ujian dibersihkan.
14. Guru membaca tabel `nilai` dan status live berubah sesuai hasil akhir.

## 7. Flow ujian offline-online

### Saat offline

1. Data soal, jawaban, timer, dan status aktif tetap tersedia dari state/cache lokal.
2. Autosave server yang gagal tidak menghapus jawaban lokal.
3. Saat submit, payload nilai disimpan ke antrean:
   `tadbira_offline_nilai_<username>`.
4. Siswa tetap dapat melihat hasil lokal dan status belum tersinkron.

### Saat online kembali

1. `App.jsx` mendeteksi event `online`, event `force-sync`, dan interval sekitar 5 detik.
2. Antrean dibaca berdasarkan username.
3. Payload dikirim ulang ke tabel `nilai`.
4. `submission_id` membuat retry idempoten.
5. Duplikasi database dengan kode `23505` dianggap sebagai submission yang sudah tersimpan.
6. Sesi dihapus hanya setelah nilai berhasil diproses.
7. Antrean dihapus setelah sinkronisasi berhasil.
8. Jika gagal, item tetap berada di antrean untuk percobaan berikutnya.

## 8. Integrasi status unlock dan diskualifikasi

- Siswa menulis status/pelanggaran ke `sesi_ujian`.
- Guru membaca sesi berstatus `LOCKED`.
- Guru memanggil `updateSesiStatus`.
- Siswa melakukan polling/fetch ulang sebagai fallback realtime.
- Jika status berubah menjadi `ACTIVE`, layar ujian terbuka kembali.
- Jika status `DISQUALIFIED`, submit tetap dapat menyimpan nilai dengan status tersebut.
- Nilai diskualifikasi tetap masuk tabel `nilai` dan tetap terlihat guru.

## 9. File SQL dan tujuan

- `supabase/nilai-schema-migration.sql`
  - menambah metadata submission,
  - unique partial index `submission_id`,
  - index pencarian nilai,
  - fungsi cleanup sesi lama.
- `supabase/exam-readiness-indexes.sql`
  - index monitoring nilai dan sesi.
- `supabase/stale-session-cleanup.sql`
  - pembersihan sesi lama sesuai kebutuhan operasional.

## 10. Checklist fitur yang sudah divalidasi

- [x] Login tiga role berjalan.
- [x] Proteksi dashboard berdasarkan role.
- [x] Admin dapat mengatur konfigurasi sistem.
- [x] Toggle timer `ON/OFF` terbaca siswa.
- [x] Timer aktif dan mode tanpa batas.
- [x] Pengelolaan pengguna, mapel, dan jadwal admin.
- [x] Guru dapat membuat dan mengelola bank soal.
- [x] Import soal massal dengan preview sebelum simpan.
- [x] Parser pertanyaan, opsi A-E, dan kunci jawaban.
- [x] Dukungan wacana beberapa soal.
- [x] Preview rumus dengan LaTeX/KaTeX.
- [x] Snap soal PDF.
- [x] Snap soal gambar JPG/PNG.
- [x] Zoom, reset zoom, dan crop snap soal.
- [x] Autosave sesi ujian.
- [x] Resume ujian setelah refresh/putus koneksi.
- [x] Antrean nilai offline per username.
- [x] Sinkronisasi otomatis saat online kembali.
- [x] Retry submission tidak menggandakan nilai.
- [x] Cleanup sesi setelah nilai tersimpan.
- [x] Flow pelanggaran menjadi `LOCKED`.
- [x] Guru dapat melakukan unlock.
- [x] Siswa dapat melanjutkan ujian setelah unlock.
- [x] Flow diskualifikasi.
- [x] Nilai diskualifikasi tetap tersimpan.
- [x] Nilai tampil pada monitoring guru.
- [x] Fallback polling saat realtime tidak diterima.
- [x] Layout desktop, tablet, dan HP tanpa overflow horizontal pada pengujian viewport.
- [x] Error rendering memiliki layar pemulihan.
- [x] Build produksi berhasil.
- [x] Lint tidak memiliki error blocking.

## 11. Batasan yang perlu diingat

- Login saat ini masih custom menggunakan tabel `users`; ini bukan Supabase Auth.
- Password masih mengikuti skema lama aplikasi dan belum dimigrasikan ke hashing/Auth.
- RLS penuh belum dapat dianggap aman tanpa migrasi identitas ke Supabase Auth/claims.
- Anti-cheat browser tidak dapat menjamin pemblokiran perangkat kedua, screenshot OS, notifikasi sistem, atau kamera eksternal.
- Import AI bekerja dari teks yang ditempel; OCR otomatis dari foto/PDF belum menjadi pipeline teks.
- API key AI di frontend harus diperlakukan sebagai risiko dan idealnya dipindahkan ke server/edge function sebelum distribusi publik.
- Backup database, rate limit, dan load test 200 siswa tetap merupakan pekerjaan operasional terpisah.

## 12. Cara membaca kode saat memperbaiki bug

1. Bug login/role: mulai dari `AuthContext.jsx`, `App.jsx`, lalu `api.login`.
2. Bug data Supabase: mulai dari `api.js`, lalu nama tabel/kolom SQL.
3. Bug ujian siswa: mulai dari `SiswaDashboard.jsx`, `offlineQueue.js`, lalu `api.saveSesi`/`submitNilai`.
4. Bug live guru: mulai dari `UjianDashboard.jsx`, subscription realtime, lalu polling.
5. Bug import soal: mulai dari `GuruDashboard.jsx` fungsi parser dan `ModalImportMassal.jsx`.
6. Bug snap: mulai dari `SSmode.jsx`.
7. Bug ukuran/layout: mulai dari `Dashboard.jsx`, `index.css`, kemudian modal/page terkait.
8. Setelah perubahan: jalankan `npm run build`, `npm run lint`, dan `git diff --check`.
