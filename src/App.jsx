// src/App.jsx
import React, { useContext, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { api } from "./api/api";
import { PageSkeleton } from "./components/ui/Ui";
import {
  readOfflineQueue,
  writeOfflineQueue,
  readOfflineSessionQueue,
  writeOfflineSessionQueue,
  removeLegacyOfflineQueue,
} from "./utils/offlineQueue";

class AppErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Aplikasi mengalami error rendering:", error);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl border border-slate-200">
          <h1 className="text-xl font-black text-slate-800">Halaman mengalami kendala</h1>
          <p className="mt-2 text-sm text-slate-500">
            Muat ulang tampilan untuk melanjutkan. Data ujian yang tersimpan lokal tetap aman.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }
}

// Import halaman-halaman yang sudah kita pisahkan
import LoginPage from "./pages/LoginPage";
const AdminRoutes = React.lazy(() => import("./features/admin/AdminRoutes"));
const GuruDashboard = React.lazy(() => import("./components/layout/GuruDashboardWrapper"));
const SiswaDashboard = React.lazy(() => import("./components/layout/SiswaDashboardWrapper"));
const UjianDashboard = React.lazy(() => import("./pages/UjianDashboard"));

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
    let syncInProgress = false;
    let lastStaleSessionCleanup = 0;

    const runBackgroundSync = async () => {
      // Jika tidak ada internet atau belum login, tunda dulu
      if (!navigator.onLine || !user || syncInProgress) return;
      syncInProgress = true;

      try {
        if (Date.now() - lastStaleSessionCleanup >= 5 * 60 * 1000) {
          try {
            await api.cleanupStaleSesi();
          } catch (cleanupError) {
            console.warn("Pembersihan sesi lama ditunda:", cleanupError.message);
          }
          lastStaleSessionCleanup = Date.now();
        }
        const sessionQueue = readOfflineSessionQueue();
        const remainingSessions = [];
        for (let index = 0; index < sessionQueue.length; index += 1) {
          const session = sessionQueue[index];
          try {
            const syncResult = await api.saveSesi(
              session.username_siswa,
              session.id_ujian,
              session.jawaban_sementara,
              session.sisa_waktu,
              Number(session.pelanggaran || 0),
              session.status || "ACTIVE",
              session.updated_at || null,
            );
            if (syncResult?.queued) {
              remainingSessions.push(session, ...sessionQueue.slice(index + 1));
              break;
            }
          } catch (errorSesi) {
            console.error("Supabase menolak sesi offline:", errorSesi.message);
            remainingSessions.push(session, ...sessionQueue.slice(index + 1));
            break;
          }
        }
        writeOfflineSessionQueue(remainingSessions);

        const username = user.Username || user.username;
        const queueData = readOfflineQueue(username);
        if (queueData.length === 0) return;
        const remainingData = [];

        for (let index = 0; index < queueData.length; index += 1) {
        const dataNilai = queueData[index];
        if (!dataNilai || !(dataNilai.username || dataNilai.nama_siswa)) {
          remainingData.push(dataNilai);
          continue;
        }

        const serverPayload = {
          id: Number(dataNilai.id) || Date.now(),
          submission_id: dataNilai.submission_id || undefined,
          username: dataNilai.username || "",
          id_ujian: dataNilai.id_ujian || "",
          nama_siswa: dataNilai.nama_siswa || "",
          kelas: dataNilai.kelas || "",
          mapel: dataNilai.mapel || "",
          skor: Number(dataNilai.skor ?? 0),
          benar: Number(dataNilai.benar ?? 0),
          salah: Number(dataNilai.salah ?? 0),
          total_soal: Number(dataNilai.total_soal ?? 0),
          status: dataNilai.status || "Selesai",
          detail_jawaban:
            typeof dataNilai.detail_jawaban === "string"
              ? dataNilai.detail_jawaban
              : JSON.stringify(dataNilai.detail_jawaban || []),
        };

        console.log("Menemukan data offline TADBIRA, mencoba sinkronisasi...");

        let nilaiTersimpan = false;
        try {
          await api.submitNilai(serverPayload);
          nilaiTersimpan = true;
        } catch (errorNilai) {
          console.error("Supabase menolak data offline:", errorNilai.message);
        }

        if (nilaiTersimpan) {
          if (dataNilai.username && dataNilai.id_ujian) {
            await api.deleteSesi(dataNilai.username, dataNilai.id_ujian);
          }
        } else {
          remainingData.push(dataNilai, ...queueData.slice(index + 1));
          break;
        }
        }

        if (remainingData.length > 0) {
        writeOfflineQueue(username, remainingData);
        } else {
        writeOfflineQueue(username, []);
        removeLegacyOfflineQueue(username);
        localStorage.removeItem(`tadbira_siswa_nilai_${username}`);
        window.dispatchEvent(new Event("offline-sync-complete"));
        console.log("Sinkronisasi sukses! Data offline berhasil dibersihkan.");
        }
      } catch (err) {
        console.error("Mesin sync offline mengalami crash internal:", err);
      } finally {
        syncInProgress = false;
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

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <React.Suspense fallback={<PageSkeleton label="Menyiapkan halaman" />}>
      <Routes>
        <Route
          path="/*"
          element={
            user.role === "admin" ? (
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminRoutes />
              </ProtectedRoute>
            ) : user.role === "guru" ? (
              <GuruDashboard />
            ) : user.role === "siswa" ? (
              <SiswaDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/ujian-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "guru"]}>
              <UjianDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppErrorBoundary>
          <AppRouter />
        </AppErrorBoundary>
      </BrowserRouter>

      {/* Global Styles & Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

        :root {
          --app-bg: #edf5ff;
          --panel: #ffffff;
          --panel-soft: #f8fbff;
          --panel-muted: #f3f7ff;
          --border: #dfeafc;
          --text-strong: #0f172a;
          --text: #1e293b;
          --text-soft: #475569;
          --primary: #0f766e;
          --primary-soft: #dff6eb;
          --secondary: #2563eb;
          --secondary-soft: #dbeafe;
          --warning: #b45309;
          --danger: #b91c1c;
          --success: #047857;
        }

        @font-face {
          font-family: 'IsepMisbah';
          src: url('/fonts/IsepMisbah.ttf') format('truetype');
          unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
          font-display: swap;
          size-adjust: 120%;
        }

        * {
          font-family: 'IsepMisbah', 'Noto Sans', sans-serif !important;
        }

        html {
          background: var(--app-bg);
        }

        body {
          margin: 0;
          background: linear-gradient(180deg, #edf5ff 0%, #f5f9ff 100%);
          color: var(--text);
          line-height: 1.6;
          font-size: 16px;
        }

        #root {
          background: var(--app-bg);
          height: 100dvh;
          min-height: 100dvh;
          overflow: hidden;
        }

        .tadbira-shell {
          background:
            radial-gradient(circle at 12% 8%, rgba(16, 185, 129, 0.08), transparent 26rem),
            radial-gradient(circle at 90% 92%, rgba(37, 99, 235, 0.08), transparent 30rem),
            #edf5ff;
        }

        .tadbira-sidebar {
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(239, 250, 249, 0.96) 72%, rgba(232, 243, 255, 0.96)),
            #f8fbff;
        }

        .tadbira-header {
          background: linear-gradient(90deg, rgba(248, 251, 255, 0.98), rgba(239, 250, 249, 0.94) 68%, rgba(239, 246, 255, 0.96));
          backdrop-filter: blur(16px);
        }

        .tadbira-main {
          background:
            radial-gradient(circle at 100% 0%, rgba(99, 102, 241, 0.075), transparent 26rem),
            radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.06), transparent 28rem),
            linear-gradient(135deg, #f1f6ff 0%, #f9fbff 48%, #edf9f7 100%);
        }

        @media (max-width: 1023px) {
          .tadbira-sidebar {
            box-shadow: 18px 0 40px rgba(15, 23, 42, 0.16);
          }
        }

        .teks-standar {
          font-size: 16px;
        }

        .teks-arab {
          font-size: 24px !important;
          line-height: 2.0 !important;
          direction: rtl;
          text-align: right;
          display: block;
        }

        ::selection {
          background: rgba(37, 99, 235, 0.18);
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
