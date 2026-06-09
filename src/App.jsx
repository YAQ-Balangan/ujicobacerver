// src/App.jsx
import React, { useContext, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { api, supabase } from "./api/api";

// Import halaman-halaman yang sudah kita pisahkan
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import GuruDashboard from "./pages/GuruDashboard";
import SiswaDashboard from "./pages/SiswaDashboard";
import UjianDashboard from "./pages/UjianDashboard";

// --- KOMPONEN PELINDUNG RUTE (PROTECTED ROUTE) ---
// Memastikan hanya role tertentu yang bisa masuk ke sebuah halaman
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  // 1. Jika belum login (user tidak ada), tendang ke halaman login
  if (!user) return <Navigate to="/" replace />;

  // 2. Jika role tidak diizinkan masuk ke halaman ini, tendang ke dashboard utama
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  // 3. Jika aman, persilakan masuk
  return children;
};

// --- ROUTER UTAMA ---
const AppRouter = () => {
  const { user } = useContext(AuthContext);

  // =================================================================================
  // MESIN OTOMATIS: GLOBAL BACKGROUND SYNC (ANTI-CRASH & AUTOMATIC CLEANUP)
  // =================================================================================
  useEffect(() => {
    const runBackgroundSync = async () => {
      // Jika tidak ada internet atau belum login, tunda dulu
      if (!navigator.onLine || !user) return;

      try {
        const offlineData = localStorage.getItem("tadbira_offline_nilai");
        if (!offlineData) return;

        const dataNilai = JSON.parse(offlineData);
        
        // Pastikan data yang tersimpan valid dan punya identitas
        if (dataNilai && dataNilai.username && dataNilai.id_ujian) {
          console.log("Menemukan data offline TADBIRA, mencoba sinkronisasi...");

          // 1. Masukkan nilai siswa ke tabel 'nilai'
          const { error: errorNilai } = await supabase
            .from("nilai")
            .insert([dataNilai]);

          // Jika berhasil masuk, atau ternyata data sudah terlanjur masuk (error duplicate 23505)
          if (!errorNilai || errorNilai.code === "23505") {
            
            // 2. BERSIHKAN RUMAH: Hapus sesi ujian agar di GuruDashboard statusnya berubah jadi SELESAI
            await supabase
              .from("sesi_ujian")
              .delete()
              .eq("id_sesi", `${dataNilai.username}_${dataNilai.id_ujian}`);

            // 3. Hapus antrean di HP siswa agar tidak dikirim berulang
            localStorage.removeItem("tadbira_offline_nilai");
            console.log("Sinkronisasi sukses! Data offline berhasil dibersihkan.");
          } else {
            console.error("Supabase menolak data offline:", errorNilai.message);
            // Jika ditolak karena error data fatal, hapus antrean agar tidak bikin macet selamanya
            if (errorNilai.code.startsWith("22") || errorNilai.code.startsWith("23")) {
              localStorage.removeItem("tadbira_offline_nilai");
            }
          }
        } else {
          localStorage.removeItem("tadbira_offline_nilai");
        }
      } catch (err) {
        console.error("Mesin sync offline mengalami crash internal:", err);
        localStorage.removeItem("tadbira_offline_nilai");
      }
    };

    // Jalankan otomatis pemeriksaan setiap 5 detik
    const syncInterval = setInterval(runBackgroundSync, 5000);
    window.addEventListener("online", runBackgroundSync);
    window.addEventListener("force-sync", runBackgroundSync);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener("online", runBackgroundSync);
      window.removeEventListener("force-sync", runBackgroundSync);
    };
  }, [user]);

  // Jika belum login, kunci semua akses HANYA ke halaman Login
  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // Jika sudah login, atur jalur halaman menggunakan sistem React Router
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Utama (Dashboard Default) berdasarkan role */}
        <Route
          path="/"
          element={
            user.role === "admin" ? (
              <AdminDashboard />
            ) : user.role === "guru" ? (
              <GuruDashboard />
            ) : (
              <SiswaDashboard />
            )
          }
        />

        {/* PINTU RAHASIA: Rute Khusus UjianDashboard */}
        {/* Dilindungi oleh ProtectedRoute, hanya Admin & Guru yang bisa lewat */}
        <Route
          path="/ujian-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "guru"]}>
              <UjianDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback: Jika user iseng mengetik URL ngawur, kembalikan ke dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />

      {/* Global Styles & Font */}
      <style>{`
        /* 1. IMPORT NOTO SANS DARI GOOGLE FONTS (Khusus Teks Latin/Standar) */
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
        
        /* 2. DAFTARKAN FONT ISEP MISBAH LOKAL */
        @font-face {
          font-family: 'IsepMisbah';
          src: url('/fonts/IsepMisbah.ttf') format('truetype');
          unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
          font-display: swap;
          
          /* SESUAIKAN UKURAN ARAB: 115% biasanya paling pas saat bersanding dengan Noto Sans */
          size-adjust: 120%; 
        }

        /* 3. PAKSA SEMUA ELEMEN TUNDUK PADA ATURAN FONT INI (Prioritaskan Arab, lalu Latin) */
        * { 
          font-family: 'IsepMisbah', 'Noto Sans', sans-serif !important; 
        }

        /* 4. PENGATURAN DASAR UNTUK SELURUH TEKS (Teks Standar) */
        body {
          color: #333333; 
          line-height: 1.6;
          font-size: 16px;
        }

        .teks-standar {
          font-size: 16px;
        }

        /* 5. PENGATURAN KHUSUS UNTUK TEKS ARAB MANUAL (BLOK BESAR) */
        .teks-arab {
          font-size: 24px !important;
          line-height: 2.0 !important;
          direction: rtl;
          text-align: right;
          display: block; /* Agar RTL (Right-to-Left) bekerja sempurna */
        }
        
        @keyframes shake { 
          0%, 100% { transform: translateX(0); } 
          25% { transform: translateX(-5px); } 
          75% { transform: translateX(5px); } 
        }
        
        .animate-shake { 
          animation: shake 0.3s ease-in-out; 
        }
      `}</style>
    </AuthProvider>
  );
}
