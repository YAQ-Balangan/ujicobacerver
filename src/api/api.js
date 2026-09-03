// src/api/api.js
import { createClient } from '@supabase/supabase-js';

export const APP_NAME = "CBT-MASDA-2026";

const envErrorMessage =
  "Supabase belum dikonfigurasi. Salin file .env.example menjadi .env lalu isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY dengan kredensial valid Anda.";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();
const isSupabaseConfigured = Boolean(supabaseUrl) && Boolean(supabaseKey);
const sessionWriteQueues = new Map();

const enqueueSessionWrite = (idSesi, operation) => {
    const previous = sessionWriteQueues.get(idSesi) || Promise.resolve();
    const next = previous.catch(() => {}).then(operation);
    sessionWriteQueues.set(idSesi, next.finally(() => {
        if (sessionWriteQueues.get(idSesi) === next) sessionWriteQueues.delete(idSesi);
    }));
    return next;
};

const createSupabaseFallback = () => {
  const throwConfigError = () => {
    throw new Error(envErrorMessage);
  };

  const queryBuilder = () => ({
    select: () => { throwConfigError(); },
    insert: () => { throwConfigError(); },
    update: () => { throwConfigError(); },
    delete: () => { throwConfigError(); },
    upsert: () => { throwConfigError(); },
    order: () => queryBuilder(),
    limit: () => queryBuilder(),
    eq: () => queryBuilder(),
    ilike: () => queryBuilder(),
    in: () => queryBuilder(),
    lt: () => queryBuilder(),
    range: () => queryBuilder(),
    on: () => ({ subscribe: () => Promise.resolve() }),
    subscribe: () => Promise.resolve(),
  });

  return {
    from: () => queryBuilder(),
    channel: () => ({
      on: () => ({ subscribe: () => Promise.resolve() }),
      subscribe: () => Promise.resolve(),
    }),
  };
};

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : createSupabaseFallback();
export const isSupabaseReady = isSupabaseConfigured;

export const api = {
    // 1. LOGIN
    login: async (username, password) => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password);

        if (error) throw new Error(error.message);
        if (data && data.length > 0) {
            const user = data[0];
            delete user.password;
            user.role = String(user.role || "").trim().toLowerCase();
            return user;
        }
        throw new Error("Gagal Login: Username atau Password Salah");
    },

    // 2. READ (Tarik Data - Smart Limiting & Full Fetch)
    read: async (sheet, fetchAll = false) => {
        const tableName = sheet.toLowerCase();
        const pageSize = 1000;
        const shouldPage = tableName === 'nilai' || fetchAll;
        const results = [];
        for (let page = 0; ; page += 1) {
            let query = supabase.from(tableName).select('*');
            query = tableName === 'sesi_ujian'
                ? query.order('updated_at', { ascending: false })
                : query.order('id', { ascending: tableName !== 'nilai' });
            if (shouldPage) {
                query = query.range(page * pageSize, (page + 1) * pageSize - 1);
            } else if (tableName === 'sesi_ujian') {
                query = query.limit(500);
            }
            const { data, error } = await query;
            if (error) throw new Error(error.message);
            results.push(...(data || []));
            if (!shouldPage || !data || data.length < pageSize) break;
        }
        return results;
    },

    // 3. CREATE (Buat Data Baru)
    create: async (sheet, payloadData) => {
        const tableName = sheet.toLowerCase();
        const { data, error } = await supabase
            .from(tableName)
            .insert([payloadData])
            .select();

        if (error) throw new Error(error.message);
        return data;
    },

    // 3.5 CREATE MASSAL (Import Ratusan Data dalam 1 Detik)
    createBulk: async (sheet, payloadArray) => {
        const tableName = sheet.toLowerCase();
        const { data, error } = await supabase
            .from(tableName)
            .insert(payloadArray)
            .select();

        if (error) throw new Error(error.message);
        return data;
    },

    submitNilai: async (payloadData) => {
        let payload = { ...payloadData };
        for (let attempt = 0; attempt < 6; attempt += 1) {
            const { error } = await supabase
                .from('nilai')
                .insert([payload]);

            if (!error || error.code === '23505') return;
            const missingColumn = error.code === '42703' || error.code === 'PGRST204';
            if (!missingColumn) throw new Error(error.message);

            const columnMatch = error.message.match(
                /(?:the ['"]|column ['"])([A-Za-z0-9_]+)['"] column/i,
            );
            const missingColumnName = columnMatch?.[1];
            if (
                !missingColumnName ||
                !Object.prototype.hasOwnProperty.call(payload, missingColumnName)
            ) {
                throw new Error(error.message);
            }
            delete payload[missingColumnName];
        }
        throw new Error("Kolom nilai tidak kompatibel setelah beberapa percobaan.");
    },

    // 4. UPDATE (Edit Data)
    update: async (sheet, numericId, payloadData) => {
        const tableName = sheet.toLowerCase();
        const { data, error } = await supabase
            .from(tableName)
            .update(payloadData)
            .eq('id', numericId)
            .select();

        if (error) throw new Error(error.message);
        return data;
    },

    // 5. DELETE (Hapus Data)
    delete: async (sheet, numericId) => {
        const tableName = sheet.toLowerCase();
        const { data, error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', numericId);

        if (error) throw new Error(error.message);
        return data;
    },

    // --- FUNGSI BARU: HAPUS MASSAL SUPER CEPAT (1 DETIK) ---
    deleteBulk: async (sheet, arrayIds) => {
        const tableName = sheet.toLowerCase();
        const { error } = await supabase
            .from(tableName)
            .delete()
            .in('id', arrayIds);

        if (error) throw new Error(error.message);
        return true;
    },

    // 6. HITUNG TOTAL SOAL (INDIKATOR SAJA)
    getTotalSoal: async () => {
        try {
            const { count, error } = await supabase
                .from('soal')
                .select('*', { count: 'exact', head: true });

            if (error) throw error;
            return count;
        } catch (error) {
            console.error("Gagal menghitung total soal:", error);
            return 0;
        }
    },
    // 7. GET SOAL SPESIFIK MAPEL (Backend Filtering Anti-Lag)
    getSoalUjian: async (mapel) => {
        const { data, error } = await supabase
            .from('soal')
            .select('*')
            .ilike('mapel', mapel); // ilike = mencari teks walau huruf besar/kecil beda

        if (error) throw new Error(error.message);
        return data || [];
    },

    // 8. GET NILAI SPESIFIK SISWA (Backend Filtering Anti-Lag)
    getNilaiSiswa: async (namaSiswa) => {
        const pageSize = 1000;
        const results = [];
        for (let page = 0; ; page += 1) {
            const { data, error } = await supabase
                .from('nilai')
                .select('*')
                .ilike('nama_siswa', namaSiswa)
                .range(page * pageSize, (page + 1) * pageSize - 1);
            if (error) throw new Error(error.message);
            results.push(...(data || []));
            if (!data || data.length < pageSize) break;
        }
        return results;
    },

    // ========================================================
    // FITUR AUTO-SAVE KE SERVER & ANTI-CHEAT
    // ========================================================

    // Auto-Save setiap 15 Detik & Saat Pindah Soal (Optimasi Jalur Kilat 300 Siswa)
    saveSesi: async (username, idUjian, jawaban, sisaWaktu, pelanggaran = 0, statusSesi = 'ACTIVE') => {
        const idSesi = `${username}_${idUjian}`;
        return enqueueSessionWrite(idSesi, async () => {
          try {
            const waktuSekarang = new Date().toISOString();
            const jawabanString = typeof jawaban === 'string' ? jawaban : JSON.stringify(jawaban);

            // GANTI LOGIKA LAMA MENJADI JALUR TUNGGAL (UPSERT)
            const payload = {
                id_sesi: idSesi,
                username_siswa: username,
                id_ujian: idUjian,
                jawaban_sementara: jawabanString,
                sisa_waktu: sisaWaktu,
                pelanggaran: pelanggaran,
                status: statusSesi,
                updated_at: waktuSekarang
            };

            const { error } = await supabase
                .from('sesi_ujian')
                .upsert(payload, { onConflict: 'id_sesi' });

            if (error) throw new Error(error.message);
          } catch (error) {
              console.error("Gagal save sesi ujian:", error);
          }
        });
    },

    // Tarik progres sebelumnya saat Siswa mulai/melanjutkan ujian
    getSesi: async (username, idUjian) => {
        const idSesi = `${username}_${idUjian}`;
        const { data, error } = await supabase
            .from('sesi_ujian')
            .select('*')
            .eq('id_sesi', idSesi)
            .single();

        // Abaikan error jika sesi memang belum ada (belum pernah ngerjain)
        if (error && error.code !== 'PGRST116') console.error("Gagal tarik sesi:", error.message);
        return data;
    },

    // GURU: Buka Kunci Siswa
    updateSesiStatus: async (username, idUjian, statusUpdate, pelanggaranReset = 0) => {
        const idSesi = `${username}_${idUjian}`;
        const { error } = await supabase
            .from('sesi_ujian')
            .update({
                status: statusUpdate,
                pelanggaran: pelanggaranReset,
                updated_at: new Date().toISOString()
            })
            .eq('id_sesi', idSesi);

        if (error) throw new Error(error.message);
    },

    // GURU: Menarik daftar Siswa yang ngeyel keluar / Terkunci
    getSesiTerkunci: async () => {
        const { data, error } = await supabase
            .from('sesi_ujian')
            .select('id_sesi, username_siswa, id_ujian, status, pelanggaran, updated_at')
            .eq('status', 'LOCKED');

        if (error) throw new Error(error.message);
        return data || [];
    },

    // SISWA: Menghapus sesi setelah ujian berhasil dikumpul agar reset
    deleteSesi: async (username, idUjian) => {
        const idSesi = `${username}_${idUjian}`;
        return enqueueSessionWrite(idSesi, async () => {
            const { error } = await supabase
                .from('sesi_ujian')
                .delete()
                .eq('id_sesi', idSesi);
            if (error) throw new Error(error.message);
        });
    },

    cleanupStaleSesi: async () => {
        const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { data, error } = await supabase
            .from('sesi_ujian')
            .select('id_sesi, username_siswa, id_ujian')
            .lt('updated_at', cutoff);

        if (error) throw new Error(error.message);
        if (!data || data.length === 0) return 0;

        let deletedCount = 0;
        for (const sesi of data) {
            const { data: nilai, error: nilaiError } = await supabase
                .from('nilai')
                .select('id')
                .eq('username', sesi.username_siswa)
                .eq('id_ujian', sesi.id_ujian)
                .limit(1);

            if (nilaiError) throw new Error(nilaiError.message);
            if (!nilai || nilai.length === 0) continue;

            const { error: deleteError } = await supabase
                .from('sesi_ujian')
                .delete()
                .eq('id_sesi', sesi.id_sesi);

            if (deleteError) throw new Error(deleteError.message);
            deletedCount += 1;
        }
        return deletedCount;
    }
};