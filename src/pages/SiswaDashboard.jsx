// src/pages/SiswaDashboard.jsx
import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useContext,
  useCallback,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  Clock,
  Calendar,
  ArrowRight,
  ArrowLeft,
  ClipboardCheck,
  RefreshCw,
  Timer,
  CheckCircle2,
  Lock,
  Award,
  Target,
  ShieldAlert,
  AlertTriangle,
  Info,
  Maximize,
  X,
  BookMarked,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { api, supabase } from "../api/api";
import Dashboard from "../components/layout/Dashboard";
import { Card, Badge } from "../components/ui/Ui";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import "katex/dist/katex.min.css";
import renderMathInElement from "katex/contrib/auto-render";

// ==========================================
// KOMPONEN RENDERER LATEX CUSTOM (REACT 19 SAFE)
// ==========================================
// Tambahan: Menggunakan React.memo agar performa lebih ringan
const Latex = React.memo(({ children }) => {
  const containerRef = useRef(null);

  // Perubahan Utama: useLayoutEffect
  useLayoutEffect(() => {
    if (containerRef.current) {
      renderMathInElement(containerRef.current, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
      });
    }
  }, [children]); // Hanya satu dependency untuk mount & update

  return (
    <span
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: children || "" }}
    />
  );
});

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

const getVal = (obj, keyName) => {
  if (!obj) return "";
  if (obj[keyName] !== undefined && obj[keyName] !== "") return obj[keyName];
  const lowerKey = keyName.toLowerCase();
  const foundKey = Object.keys(obj).find((k) => k.toLowerCase() === lowerKey);
  return foundKey ? obj[foundKey] : "";
};

const formatTanggalLokal = (dateString) => {
  if (!dateString) return "Hari ini";
  try {
    if (String(dateString).includes("T") && String(dateString).includes("Z")) {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
    return dateString;
  } catch (error) {
    return dateString;
  }
};

const fontClasses = {
  wacana: [
    "text-[13px] md:text-[15px]",
    "text-[15px] md:text-[17px]",
    "text-[17px] md:text-[19px]",
  ],
  soal: ["text-sm md:text-lg", "text-base md:text-xl", "text-lg md:text-2xl"],
  opsi: [
    "text-[13px] md:text-base",
    "text-[15px] md:text-lg",
    "text-base md:text-xl",
  ],
};

/// ==========================================
// KOMPONEN TIMER INDEPENDEN (ANTI-BUG LOADING)
// ==========================================
const ExamTimer = React.memo(({ initialTime, onTick, onTimeUp, timeRef }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const hasStarted = useRef(false); // Otak timer agar tahu kapan mulai

  // Sinkronisasi dengan waktu dari server
  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  // LOGIKA COUNTDOWN MURNI
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  // LOGIKA PENYIMPANAN SESI & WAKTU HABIS
  useEffect(() => {
    if (timeRef) timeRef.current = timeLeft;

    // Tandai bahwa waktu ujian yang sebenarnya (> 0) sudah diterima timer
    if (timeLeft > 0) {
      hasStarted.current = true;
    }

    // Timer HANYA boleh bereaksi JIKA sudah pernah berjalan normal
    if (hasStarted.current) {
      // Auto-save waktu ke server setiap 60 detik (menghemat 75% request)
      if (timeLeft > 0 && timeLeft % 60 === 0 && timeLeft !== initialTime) {
        onTick(timeLeft);
      }

      // Jika waktu benar-benar habis dari hitungan mundur normal
      if (timeLeft <= 0) {
        hasStarted.current = false; // Kunci agar timer berhenti
        const randomDelay = Math.floor(Math.random() * 7000);

        setTimeout(() => {
          onTimeUp();
        }, randomDelay);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, initialTime]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0)
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl border shadow-sm transition-colors ${timeLeft < 300 ? "bg-red-50 text-red-600 border-red-200" : "bg-slate-800 text-white border-slate-700"}`}
    >
      <Timer size={18} />
      <div className="flex flex-col">
        <span className="text-[8px] font-black uppercase tracking-widest leading-none mb-[2px] opacity-80">
          Sisa Waktu
        </span>
        <span className="font-black text-sm md:text-base leading-none tracking-wider">
          {formatTime(timeLeft)}
        </span>
      </div>
    </div>
  );
});

const SiswaDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("home");
  const [loading, setLoading] = useState(true);
  const [isAppBlocked, setIsAppBlocked] = useState(false);

  const isWebView = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    return (
      userAgent.includes("wv") ||
      (userAgent.includes("android") && userAgent.includes("version/"))
    );
  };

  const [errorMsg, setErrorMsg] = useState("");

  const [exams, setExams] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [tokens, setTokens] = useState({});
  const [activeExam, setActiveExam] = useState(null);

  const [soalData, setSoalData] = useState([]);
  const [loadingSoal, setLoadingSoal] = useState(false);
  const [currentSoalIndex, setCurrentSoalIndex] = useState(0);

  const [answers, setAnswers] = useState({});
  const [raguRagu, setRaguRagu] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [appSettings, setAppSettings] = useState({
    title: "TADBIRA",
    desc: "Online Based Test 2026",
  });

  const [isAcakSoalActive, setIsAcakSoalActive] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [pelanggaran, setPelanggaran] = useState(0);
  const [isAntiCheatActive, setIsAntiCheatActive] = useState(true);
  const isAntiCheatActiveRef = useRef(true);

  useEffect(() => {
    isAntiCheatActiveRef.current = isAntiCheatActive;
  }, [isAntiCheatActive]);

  const [fontLevel, setFontLevel] = useState(0);
  const [pageZoom, setPageZoom] = useState(1);
  const [zoomedImg, setZoomedImg] = useState(null);
  const zoomedImgRef = useRef(zoomedImg);
  useEffect(() => {
    zoomedImgRef.current = zoomedImg;
  }, [zoomedImg]);
  useEffect(() => {
    const handleZoomKeyboard = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          setPageZoom((prev) => Math.min(2.0, prev + 0.1));
        } else if (e.key === "-") {
          e.preventDefault();
          setPageZoom((prev) => Math.max(0.5, prev - 0.1));
        } else if (e.key === "0") {
          e.preventDefault();
          setPageZoom(1);
        }
      }
    };

    window.addEventListener("keydown", handleZoomKeyboard, { passive: false });
    return () => window.removeEventListener("keydown", handleZoomKeyboard);
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${pageZoom * 100}%`;
    return () => {
      document.documentElement.style.fontSize = "100%";
    };
  }, [pageZoom]);

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [customAlert, setCustomAlert] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
  });

  const showAlert = useCallback((type, title, message, onConfirm = null) => {
    setCustomAlert({ isOpen: true, type, title, message, onConfirm });
  }, []);
  const closeAlert = useCallback(
    () => setCustomAlert((prev) => ({ ...prev, isOpen: false })),
    [],
  );

  const activeExamRef = useRef(activeExam);
  const answersRef = useRef(answers);
  const soalDataRef = useRef(soalData);
  const isSubmittingRef = useRef(isSubmitting);
  const isLockedRef = useRef(isLocked);
  const pelanggaranRef = useRef(pelanggaran);
  const timeLeftRef = useRef(timeLeft);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    activeExamRef.current = activeExam;
  }, [activeExam]);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    soalDataRef.current = soalData;
  }, [soalData]);
  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);
  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);
  useEffect(() => {
    pelanggaranRef.current = pelanggaran;
  }, [pelanggaran]);
  useEffect(() => {
    if (timeLeft > 0) timeLeftRef.current = timeLeft;
  }, [timeLeft]);
  useEffect(() => {
    if (soalData && soalData.length > 0) {
      soalData.forEach((soal) => {
        const urlGambar = getVal(soal, "Link_Gambar");
        if (urlGambar) {
          const img = new Image();
          img.src = urlGambar;
        }
      });
    }
  }, [soalData]);
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const userKelasFull = String(getVal(user, "Kelas") || "")
    .toUpperCase()
    .trim();
  const userParts = userKelasFull.split(" ");
  const userTingkat = userParts[0] || "";
  const userJurusan = userParts[1] || "";
  const userTingkatJurusan = `${userTingkat} ${userJurusan}`.trim();

  // 1. SISTEM REALTIME DATA JADWAL, NILAI, & SETTINGS ANTI-CHEAT (MIGRASI REALTIME)
  useEffect(() => {
    const fetchData = async (isBackground = false) => {
      // =======================================================
      // 1. FASE OFFLINE / CACHE LOKAL (TAMPIL INSTAN 0 DETIK)
      // =======================================================
      if (!isBackground) {
        // Bongkar brankas memori HP siswa berdasarkan username mereka
        const cachedJadwal = localStorage.getItem("tadbira_siswa_jadwal");
        const cachedNilai = localStorage.getItem(
          `tadbira_siswa_nilai_${getVal(user, "Username")}`,
        );

        if (cachedJadwal) setExams(JSON.parse(cachedJadwal));
        if (cachedNilai) setMyResults(JSON.parse(cachedNilai));

        // Langsung matikan loading agar jadwal dan nilai instan muncul di HP!
        setLoading(false);
      }

      // =======================================================
      // 2. FASE ONLINE (SINKRONISASI DIAM-DIAM DARI SERVER)
      // =======================================================
      try {
        try {
          const settingsRes = await api.read("Settings");
          if (settingsRes && Array.isArray(settingsRes)) {
            const acSetting = settingsRes.find(
              (s) => String(s.kunci).toUpperCase() === "MODE_UJIAN",
            );
            setIsAntiCheatActive(
              acSetting
                ? String(acSetting.nilai).toUpperCase() !== "OFF"
                : true,
            );

            const appOnlySetting = settingsRes.find(
              (s) => String(s.kunci).toUpperCase() === "MODE_APLIKASI",
            );
            if (
              appOnlySetting &&
              String(appOnlySetting.nilai).toUpperCase() === "ON"
            ) {
              if (!isWebView()) setIsAppBlocked(true);
              else setIsAppBlocked(false);
            } else {
              setIsAppBlocked(false);
            }

            const titleConf = settingsRes.find((s) => s.kunci === "APP_TITLE");
            const descConf = settingsRes.find((s) => s.kunci === "APP_DESC");
            if (titleConf || descConf) {
              setAppSettings({
                title: titleConf ? titleConf.nilai : "TADBIRA",
                desc: descConf ? descConf.nilai : "Online Based Test 2026",
              });
            }

            const acakSetting = settingsRes.find(
              (s) => String(s.kunci).toUpperCase() === "ACAK_SOAL",
            );
            setIsAcakSoalActive(
              acakSetting
                ? String(acakSetting.nilai).toUpperCase() !== "OFF"
                : true,
            );
          }
        } catch (setErr) {
          console.warn("Gagal menarik konfigurasi pengaturan admin:", setErr);
        }

        if (activeExamRef.current) return; // Abaikan tarik jadwal kalau siswa sedang mengerjakan soal

        const jadwalRes = await api.read("Jadwal");
        const userName = String(getVal(user, "Nama") || "");
        const finalNilai = await api.getNilaiSiswa(userName);

        let finalJadwal = [];
        if (jadwalRes && jadwalRes.length > 0) {
          finalJadwal = jadwalRes.filter((j) => {
            const jadwalKelasRaw = String(
              getVal(j, "Kelas") || "",
            ).toUpperCase();
            if (jadwalKelasRaw === "" || jadwalKelasRaw.includes("SEMUA"))
              return true;
            const targetArray = jadwalKelasRaw.split(",").map((t) => t.trim());
            return targetArray.some(
              (target) =>
                target === userKelasFull ||
                target === userTingkatJurusan ||
                target === userJurusan ||
                target === userTingkat,
            );
          });
        }

        // Perbarui layar hanya jika ada data jadwal/nilai baru dari server
        setExams((prev) =>
          JSON.stringify(prev) !== JSON.stringify(finalJadwal)
            ? finalJadwal
            : prev,
        );
        setMyResults((prev) =>
          JSON.stringify(prev) !== JSON.stringify(finalNilai)
            ? finalNilai
            : prev,
        );

        // SIMPAN KE BRANKAS LOKAL UNTUK BUKA APLIKASI BESOK / NANTI
        localStorage.setItem(
          "tadbira_siswa_jadwal",
          JSON.stringify(finalJadwal),
        );
        localStorage.setItem(
          `tadbira_siswa_nilai_${getVal(user, "Username")}`,
          JSON.stringify(finalNilai),
        );
      } catch (err) {
        // Jangan tampilkan pesan error merah jika siswa sudah punya data offline di HP-nya
        if (!isBackground && !localStorage.getItem("tadbira_siswa_jadwal")) {
          setErrorMsg(
            "Gagal terhubung ke database ujian dan tidak ada data offline.",
          );
        }
      } finally {
        if (!isBackground) setLoading(false);
      }
    };

    // Ambil data pertama kali saat aplikasi dibuka
    fetchData(false);

    // Buka Saluran Realtime Supabase (Hanya terima data jika di server ada perubahan)
    const channel = supabase
      .channel("tadbira-realtime-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Settings" },
        () => {
          fetchData(true);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Jadwal" },
        () => {
          fetchData(true);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sesi_ujian",
          filter: `username_siswa=eq.${getVal(user, "Username")}`,
        },
        (payload) => {
          // Ini menggantikan fungsi Polling Buka Kunci dari Guru secara instan!
          const sesiBaru = payload.new;
          if (sesiBaru && sesiBaru.status === "ACTIVE") {
            setIsLocked(false);
            isLockedRef.current = false;
            setTimeLeft(timeLeftRef.current);

            // Otomatis paksa fullscreen kembali setelah dibuka kunci
            try {
              const docElm = document.documentElement;
              if (docElm.requestFullscreen)
                docElm.requestFullscreen().catch(() => {});
            } catch (e) {}

            showAlert(
              "success",
              "Kunci Dibuka",
              "Pengawas telah memaafkan dan membuka kunci ujian Anda. DILARANG KELUAR APLIKASI LAGI!",
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userKelasFull, userTingkat, userJurusan, userTingkatJurusan]);

  // ==============================================================
  // 2. LOGIKA ANTI-CHEAT SUPER KETAT (Keluar, ESC, Overlay & Refresh)
  // ==============================================================
  useEffect(() => {
    let isProcessing = false; // <-- ANTI DOUBLE-TRIGGER (Kunci Ganda)

    const triggerLock = async (jenisPelanggaran) => {
      if (!isAntiCheatActiveRef.current) return;
      if (
        !activeExamRef.current ||
        isSubmittingRef.current ||
        isLockedRef.current ||
        isProcessing
      )
        return;

      isProcessing = true;
      console.warn("TERDETEKSI KECURANGAN:", jenisPelanggaran);

      let currentPelanggaran = pelanggaranRef.current;
      const username = getVal(user, "Username");
      const examId = getVal(activeExamRef.current, "ID");

      // --- KODE BARU: FUNGSI SIMPAN KE BRANKAS HP OFFLINE ---
      const simpanStatusOffline = (pelanggaranBaru, statusKunci) => {
        localStorage.setItem(
          `status_ujian_${username}_${examId}`,
          JSON.stringify({
            pelanggaran: pelanggaranBaru,
            isLocked: statusKunci,
          }),
        );
      };
      // ------------------------------------------------------

      if (currentPelanggaran === 0) {
        // TAHAP 1: PERINGATAN SAJA (Toleransi 1x)
        pelanggaranRef.current = 1;
        setPelanggaran(1);
        simpanStatusOffline(1, false); // Amankan ke HP

        showAlert(
          "warning",
          "Peringatan",
          `Sistem mendeteksi aktivitas di luar ujian. Ini adalah PERINGATAN PERTAMA. Jika terulang, layar ujian akan dikunci!`,
        );

        await api.saveSesi(
          username,
          examId,
          answersRef.current,
          timeLeftRef.current,
          1,
          "ACTIVE",
        );
        setTimeout(() => {
          isProcessing = false;
        }, 3000);
      } else if (currentPelanggaran === 1) {
        // TAHAP 2: TERKUNCI (Harus dibuka oleh Guru)
        pelanggaranRef.current = 2;
        isLockedRef.current = true;
        setPelanggaran(2);
        setTimeLeft(timeLeftRef.current);
        setIsLocked(true);
        simpanStatusOffline(2, true); // Amankan ke HP (Layar Terkunci)

        await api.saveSesi(
          username,
          examId,
          answersRef.current,
          timeLeftRef.current,
          2,
          "LOCKED",
        );
        setTimeout(() => {
          isProcessing = false;
        }, 2000);
      } else if (currentPelanggaran >= 2) {
        // TAHAP 3: DISKUALIFIKASI
        pelanggaranRef.current = 3;
        isLockedRef.current = true;
        setPelanggaran(3);
        simpanStatusOffline(3, true); // Amankan ke HP (Diskualifikasi)

        await api.saveSesi(
          username,
          examId,
          answersRef.current,
          timeLeftRef.current,
          3,
          "DISQUALIFIED",
        );
        executeEndExam(true, "Diskualifikasi");
      }
    };

    // KODE BARU: Pelacak Zoom & Resize Layar
    let resizeTimeout;
    let isZoomingOrResizing = false;

    const handleResize = () => {
      isZoomingOrResizing = true;
      clearTimeout(resizeTimeout);
      // Berikan masa toleransi 1 detik saat sedang nge-zoom agar tidak kena kunci
      resizeTimeout = setTimeout(() => {
        isZoomingOrResizing = false;
      }, 1000);
    };

    const handleVisibilityChange = () => {
      if (zoomedImgRef.current) return;
      if (document.hidden) triggerLock("Tab Disembunyikan / Pindah Tab");
    };

    const handleBlur = () => {
      if (zoomedImgRef.current) return;
      if (isZoomingOrResizing) return; // KODE BARU: Abaikan hilang fokus jika sedang nge-zoom
      triggerLock("Layar Hilang Fokus / Klik Overlay Luar");
    };

    const handleFullscreenChange = () => {
      if (
        !document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.msFullscreenElement
      ) {
        console.log("Siswa keluar dari mode Fullscreen");
      }
    };

    const handleBeforeUnload = (e) => {
      if (activeExamRef.current && !isSubmittingRef.current) {
        e.preventDefault();
        e.returnValue = "Yakin ingin keluar? Ujian akan bermasalah!";
      }
    };

    // FUNGSI BARU: Menangkap Swipe/Back HP
    const handlePopState = (e) => {
      if (activeExamRef.current && !isSubmittingRef.current) {
        // 1. Jebak browser agar tetap di halaman ujian (tidak benar-benar back)
        window.history.pushState({ page: "ujian" }, "", window.location.href);

        // 2. Ubah fungsi swipe/tombol back menjadi mundur ke soal sebelumnya
        setCurrentSoalIndex((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState); // <-- Listener Swipe Aktif

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange,
      );
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState); // <-- Listener Swipe Dimatikan
    };
  }, [user]);

  // 3. POLLING BUKA KUNCI DARI GURU (NON-AKTIF: SUDAH DIGANTI REALTIME SUPABASE DI LANGKAH 2)
  useEffect(() => {
    // Sengaja dikosongkan agar menghemat kuota egress data server & HP siswa
  }, []);

  // Pasang pemantau sinyal internet HP secara otomatis (Sudah dibersihkan dari fungsi sync)
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 4. MEMULAI UJIAN
  const handleStartExam = async (exam) => {
    const examId = getVal(exam, "ID");
    const examToken = getVal(exam, "Token");
    const examMapel = getVal(exam, "Mapel");
    const examDurasi = parseInt(getVal(exam, "Durasi_Menit")) || 90;

    const inputToken = tokens[examId]?.toUpperCase() || "";
    const realToken = String(examToken || "").toUpperCase();

    if (realToken && !inputToken)
      return showAlert(
        "warning",
        "Token Diperlukan",
        "Silakan masukkan TOKEN ujian terlebih dahulu!",
      );
    if (realToken && inputToken !== realToken)
      return showAlert(
        "danger",
        "TOKEN SALAH!",
        "Akses DITOLAK. Silakan periksa kembali token ujian Anda.",
      );

    const sudahMengerjakan = myResults.some(
      (res) =>
        String(getVal(res, "Mapel")).toUpperCase() ===
        String(examMapel).toUpperCase(),
    );
    if (sudahMengerjakan)
      return showAlert(
        "danger",
        "Akses Dibatasi",
        "Anda sudah menyelesaikan ujian ini. Nilai Anda sudah terekam di sistem.",
      );

    setActiveExam(exam);
    setLoadingSoal(true);
    setIsMobileDrawerOpen(false);
    setRaguRagu({});

    // === MENGAKTIFKAN JEBAKAN HISTORY AGAR SWIPE HP BERFUNGSI ===
    window.history.pushState({ page: "ujian" }, "", window.location.href);
    // ==============================================================

    try {
      const docElm = document.documentElement;
      if (docElm.requestFullscreen) {
        docElm.requestFullscreen().catch((err) => console.log(err));
      } else if (docElm.webkitRequestFullscreen) {
        docElm.webkitRequestFullscreen();
      } else if (docElm.msRequestFullscreen) {
        docElm.msRequestFullscreen();
      }
    } catch (error) {
      console.warn("Fullscreen tidak didukung.");
    }

    try {
      const allSoal = await api.getSoalUjian(examMapel);
      const examMapelUpper = String(examMapel).toUpperCase();
      const filterSoal = allSoal.filter((s) => {
        const soalMapel = String(getVal(s, "Mapel")).toUpperCase();
        const soalKelasRaw = String(getVal(s, "Kelas")).toUpperCase();
        if (soalMapel !== examMapelUpper) return false;
        if (soalKelasRaw === "" || soalKelasRaw.includes("SEMUA")) return true;
        const targetArray = soalKelasRaw.split(",").map((t) => t.trim());
        return targetArray.some(
          (target) =>
            target === userKelasFull ||
            target === userTingkatJurusan ||
            target === userJurusan ||
            target === userTingkat,
        );
      });
      // Logika Susunan Soal Berdasarkan Jadwal Ujian yang Dipilih
      let finalSoal = [...filterSoal];
      const modeSoalTerpilih = String(
        getVal(exam, "acak_soal") || "",
      ).toUpperCase();

      if (modeSoalTerpilih === "BERURUTAN") {
        // Jika Admin/Guru menyetting "BERURUTAN", urutkan berdasarkan ID asli soal
        finalSoal.sort(
          (a, b) =>
            (parseInt(getVal(a, "id")) || 0) - (parseInt(getVal(b, "id")) || 0),
        );
      } else {
        // Default / Jika memilih "ACAK", jalankan Fisher-Yates Shuffle murni
        for (let i = finalSoal.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [finalSoal[i], finalSoal[j]] = [finalSoal[j], finalSoal[i]];
        }
      }

      setSoalData(finalSoal);

      const usernameSiswa = getVal(user, "Username");
      let serverSession = null;
      try {
        serverSession = await api.getSesi(usernameSiswa, examId);
      } catch (e) {}

      // ...
      let finalAnswers = {};
      let finalTimeLeft = examDurasi * 60;

      // AMBIL HISTORY JAWABAN DARI MEMORI INTERNAL HP TERLEBIH DAHULU (OFFLINE-FIRST SAFETY)
      const localSavedAnswersStr = localStorage.getItem(
        `jawaban_${getVal(user, "Username")}_${examId}`,
      );
      let localSavedAnswers = null;
      if (localSavedAnswersStr) {
        try {
          localSavedAnswers = JSON.parse(localSavedAnswersStr);
        } catch (e) {}
      }

      if (serverSession) {
        let parsedJawaban = {};
        try {
          parsedJawaban =
            typeof serverSession.jawaban_sementara === "string"
              ? JSON.parse(serverSession.jawaban_sementara)
              : serverSession.jawaban_sementara || {};
        } catch (e) {
          console.warn("Gagal membaca history jawaban", e);
        }

        if (
          localSavedAnswers &&
          Object.keys(localSavedAnswers).length >=
            Object.keys(parsedJawaban).length
        ) {
          finalAnswers = localSavedAnswers;
        } else {
          finalAnswers = parsedJawaban;
        }

        finalTimeLeft = serverSession.sisa_waktu || examDurasi * 60;
        setPelanggaran(serverSession.pelanggaran || 0);
        setIsLocked(serverSession.status === "LOCKED");
      } else {
        // =============================================================
        // KODE BARU: JIKA OFFLINE, BACA STATUS KUNCI DARI BRANKAS HP
        // =============================================================
        finalAnswers = localSavedAnswers || {};

        const usernameSiswa = getVal(user, "Username");
        const statusOffline = localStorage.getItem(
          `status_ujian_${usernameSiswa}_${examId}`,
        );

        if (statusOffline) {
          const parsedStatus = JSON.parse(statusOffline);
          setPelanggaran(parsedStatus.pelanggaran || 0);
          setIsLocked(parsedStatus.isLocked || false);

          // Sinkronkan Ref agar mesin Anti-Cheat tidak bingung
          pelanggaranRef.current = parsedStatus.pelanggaran || 0;
          isLockedRef.current = parsedStatus.isLocked || false;
        } else {
          setPelanggaran(0);
          setIsLocked(false);
          pelanggaranRef.current = 0;
          isLockedRef.current = false;
        }
        // =============================================================
      }
      try {
        await api.saveSesi(
          getVal(user, "Username"),
          examId,
          finalAnswers,
          finalTimeLeft,
          serverSession ? serverSession.pelanggaran : 0,
          serverSession ? serverSession.status : "ACTIVE",
        );
      } catch (e) {
        console.error("Gagal sinkron awal sesi ujian:", e);
      }

      setAnswers(finalAnswers); // Sekarang jawaban lama murid sukses dimuat kembali ke layar!
      setTimeLeft(finalTimeLeft);
      setCurrentSoalIndex(0);
    } catch (error) {
      showAlert(
        "danger",
        "Kesalahan Server",
        "Gagal memuat soal: " + error.message,
      );
      setActiveExam(null);
    } finally {
      setLoadingSoal(false);
    }
  };

  // 5. KALKULASI SKOR & SUBMIT (OFFLINE-FIRST)
  const executeEndExam = async (isForced, forcedStatus = "Selesai") => {
    setIsSubmitting(true);

    // Hapus timer save yang masih nyangkut di background agar tidak membocorkan memori
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    let skorSiswa = 0;
    let benarCount = 0;
    let detailJawabanArray = [];

    const currentAnswers = answersRef.current;
    const originalSoalData = [...soalDataRef.current].sort(
      (a, b) => parseInt(getVal(a, "id")) - parseInt(getVal(b, "id")),
    );
    const totalSoal = originalSoalData.length;

    originalSoalData.forEach((soal) => {
      const poin = parseFloat(getVal(soal, "Poin")) || 2;
      const idSoal = String(getVal(soal, "id")).trim();
      const jawabanSiswa = currentAnswers[idSoal] || "";
      const jawabanBenar = String(getVal(soal, "Jawaban_Benar"))
        .toUpperCase()
        .trim();

      if (
        jawabanSiswa &&
        String(jawabanSiswa).toUpperCase().trim() === jawabanBenar
      ) {
        skorSiswa += poin;
        benarCount++;
      }

      detailJawabanArray.push({
        tanya: getVal(soal, "Pertanyaan"),
        jawab_siswa: jawabanSiswa,
        kunci: jawabanBenar,
      });
    });

    let finalScore = Number(skorSiswa.toFixed(2));
    let salahCount = totalSoal - benarCount;

    try {
      // Bikin ID unik untuk baris database Supabase
      const amanId = Number(
        Date.now().toString() +
          Math.floor(Math.random() * 100)
            .toString()
            .padStart(2, "0"),
      );

      const dataNilai = {
        id: amanId,
        nama_siswa: getVal(user, "Nama"),
        kelas: getVal(user, "Kelas"),
        mapel: getVal(activeExamRef.current, "Mapel"),
        skor: finalScore,
        benar: benarCount,
        salah: salahCount,
        total_soal: totalSoal,
        status: forcedStatus,
        detail_jawaban: JSON.stringify(detailJawabanArray),
      };

      // 1. OPTIMISTIC UI: LANGSUNG MASUKKAN NILAI KE LAYAR HP SISWA (Tanpa nunggu server!)
      setMyResults((prev) => [dataNilai, ...prev]);

      // 2. BERSIHKAN JAWABAN DARI MEMORI INTERNAL HP SISWA
      const idUjian = getVal(activeExamRef.current, "ID");
      localStorage.removeItem(`jawaban_${getVal(user, "Username")}_${idUjian}`);

      // 3. MASUKKAN KE ANTREAN SINKRONISASI LOKAL HP SISWA
      const queueStr = localStorage.getItem("tadbira_sync_queue") || "[]";
      let syncQueue = JSON.parse(queueStr);
      syncQueue.push({
        username: getVal(user, "Username"),
        idUjian: idUjian,
        nilaiData: dataNilai,
      });
      localStorage.setItem("tadbira_sync_queue", JSON.stringify(syncQueue));

      // 4. RESET STATE INTERFACE UJIAN & PINDAH KE TAB NILAI
      setIsSubmitting(false);
      setActiveExam(null);
      setAnswers({});
      setRaguRagu({});
      setCurrentSoalIndex(0);
      setIsMobileDrawerOpen(false);
      setActiveTab("nilai");

      // 5. PICU SINKRONISASI KE SERVER CLOUD
      triggerBackgroundSync();

      // 6. KELUAR FULLSCREEN & MUNCULKAN NOTIF
      try {
        if (
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement
        ) {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          }
        }
      } catch (error) {
        console.warn("Gagal keluar dari fullscreen.");
      }

      if (forcedStatus === "Diskualifikasi") {
        showAlert(
          "danger",
          "Diskualifikasi!",
          "Ujian Anda dihentikan paksa. Nilai Anda sedang diproses di latar belakang.",
        );
      } else if (isForced) {
        showAlert(
          "info",
          "Waktu Habis!",
          "Waktu ujian habis. Nilai Anda aman terekam di HP dan sedang disinkronkan ke server.",
        );
      } else {
        showAlert(
          "success",
          "Ujian Selesai",
          "Berhasil dikumpulkan! Nilai Anda aman terekam di HP dan sedang disinkronkan ke server.",
        );
      }
    } catch (err) {
      showAlert(
        "danger",
        "Gagal Memproses",
        "Sistem error lokal: " +
          (err.message || "Pastikan memori HP tidak penuh."),
      );
      setIsSubmitting(false);
    }
  };

  const handleEndExamClick = (isForced = false) => {
    if (isSubmittingRef.current) return;
    if (!isForced) {
      showAlert(
        "confirm",
        "Selesai Mengerjakan?",
        "Yakin ingin mengakhiri ujian? Jawaban yang dikirim tidak dapat diubah.",
        () => {
          closeAlert();
          executeEndExam(false);
        },
      );
    } else {
      executeEndExam(isForced);
    }
  };

  const toggleRaguRagu = () => {
    const currentSoal = soalData[currentSoalIndex];
    if (!currentSoal) return;
    const currentSoalId = String(getVal(currentSoal, "id")).trim();
    setRaguRagu((prev) => ({
      ...prev,
      [currentSoalId]: !prev[currentSoalId],
    }));
  };

  // ==============================================================
  // TAMPILAN BLOKIR EKSKLUSIF APLIKASI
  // ==============================================================
  if (isAppBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white flex-col p-6 z-[99999] fixed inset-0 select-none">
        <Lock size={80} className="text-red-500 mb-6 animate-pulse" />
        <h1 className="text-3xl md:text-5xl font-black mb-3 text-center tracking-tight">
          AKSES DIBLOKIR
        </h1>
        <p className="text-center text-slate-300 max-w-lg text-sm md:text-base leading-relaxed mb-8">
          Admin baru saja mengaktifkan <strong>Mode Eksklusif Aplikasi</strong>.
          Anda tidak dapat melanjutkan ujian menggunakan Browser apapun.
          <br />
          <br />
          Silakan tutup browser ini dan buka melalui{" "}
          <strong>Aplikasi Resmi TADBIRA</strong> yang ada di HP Anda.
        </p>
      </div>
    );
  }

  // ==============================================================
  // TAMPILAN LOCK SCREEN (PELANGGARAN PERTAMA) + FITUR PIN OFFLINE
  // ==============================================================
  if (isLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white flex-col p-6 z-[9999] fixed inset-0 select-none overflow-y-auto">
        <div className="hidden">
          <ExamTimer
            initialTime={timeLeft}
            timeRef={timeLeftRef}
            onTick={(newTime) => {
              if (activeExamRef.current && navigator.onLine) {
                api.saveSesi(
                  getVal(user, "Username"),
                  getVal(activeExamRef.current, "ID"),
                  answersRef.current,
                  newTime,
                  pelanggaranRef.current,
                  "LOCKED",
                );
              }
            }}
            onTimeUp={() => handleEndExamClick(true)}
          />
        </div>

        <Lock size={80} className="text-red-500 mb-6 animate-pulse mt-10" />
        <h1 className="text-3xl md:text-5xl font-black mb-3 text-center tracking-tight">
          UJIAN TERKUNCI
        </h1>
        <p className="text-center text-slate-300 max-w-lg text-sm md:text-base leading-relaxed mb-8">
          Sistem mendeteksi Anda{" "}
          <strong>keluar dari aplikasi / berpindah layar</strong>. Ini adalah
          pelanggaran pertama. Silakan panggil pengawas untuk membuka kunci agar
          Anda bisa melanjutkan ujian.
          <br />
          <br />
          <strong className="text-amber-400 font-black tracking-widest text-xs uppercase animate-pulse block mb-4">
            — WAKTU UJIAN ANDA TERUS BERJALAN —
          </strong>
        </p>

        {/* Indikator Menunggu Sinyal Server */}
        <div className="flex gap-3 text-slate-400 font-bold text-xs uppercase tracking-widest items-center bg-slate-800 border border-slate-700 px-6 py-3.5 rounded-2xl shadow-lg mb-8">
          <RefreshCw className="animate-spin text-amber-500" size={18} />{" "}
          Menunggu Persetujuan Online...
        </div>

        {/* FITUR BARU: PIN BUKA KUNCI DARURAT (OFFLINE) UNTUK GURU */}
        <div className="w-full max-w-xs mt-4 pt-6 border-t border-slate-800/50 flex flex-col items-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 text-center">
            Mode Darurat Gangguan Server
            <br />
            (Hanya Diisi Oleh Pengawas)
          </p>
          <input
            type="password"
            placeholder="PIN PENGAWAS"
            maxLength={6}
            className="w-full text-center bg-slate-800 border border-slate-600 text-white font-black tracking-[0.5em] p-3 rounded-xl focus:outline-none focus:border-emerald-500 placeholder:tracking-normal placeholder:font-medium placeholder:text-slate-600"
            onChange={(e) => {
              if (e.target.value === "123456") {
                // Hanya membuka kuncinya saja, JANGAN me-reset angka pelanggarannya.
                // Angka pelanggaran tetap utuh sesuai yang ada di sistem saat ini (misal: tetap 2).
                setIsLocked(false);
                isLockedRef.current = false;

                // --- KODE BARU: UPDATE BRANKAS HP AGAR TIDAK TERKUNCI LAGI SAAT REFRESH ---
                const usernameSiswa = getVal(user, "Username");
                const examId = getVal(activeExamRef.current, "ID");
                localStorage.setItem(
                  `status_ujian_${usernameSiswa}_${examId}`,
                  JSON.stringify({
                    pelanggaran: pelanggaranRef.current, // Pelanggaran tetap, tidak jadi 0
                    isLocked: false, // Layar resmi dibuka
                  }),
                );
                // --------------------------------------------------------------------------

                try {
                  const docElm = document.documentElement;
                  if (docElm.requestFullscreen)
                    docElm.requestFullscreen().catch(() => {});
                } catch (err) {}

                showAlert(
                  "success",
                  "Kunci Dibuka Darurat",
                  "Pengawas telah membuka kunci ujian secara manual. Lanjutkan ujian Anda!",
                );
              }
            }}
          />
        </div>
      </div>
    );
  }

  // ==============================================================
  // TAMPILAN KETIKA SEDANG UJIAN (ANBK STYLE)
  // ==============================================================
  if (activeExam) {
    const examMapel = getVal(activeExam, "Mapel");
    const currentSoal = soalData[currentSoalIndex];

    if (!currentSoal) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col">
          <ShieldAlert size={64} className="text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800">
            Soal Belum Tersedia!
          </h2>
          <p className="text-slate-500 mt-2 mb-6 text-center max-w-md">
            Guru belum mengunggah soal untuk ujian ini atau salah memberikan tag
            kelas. Harap lapor ke Pengawas.
          </p>
          <button
            onClick={() => setActiveExam(null)}
            className="px-6 py-3 bg-slate-800 text-white rounded-lg font-bold"
          >
            Kembali ke Beranda
          </button>
        </div>
      );
    }

    const currentSoalId = String(getVal(currentSoal, "id")).trim();
    const answeredCount = Object.keys(answers).length;
    const progressPercent =
      soalData.length > 0 ? (answeredCount / soalData.length) * 100 : 0;
    const isCurrentRagu = !!raguRagu[currentSoalId];

    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none relative overflow-hidden transition-all duration-300">
        <div className="absolute inset-0 bg-slate-50 z-0 pointer-events-none"></div>

        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm px-4 py-3 flex justify-between items-center relative">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-sm hidden md:block">
              <ClipboardCheck size={20} />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black text-slate-800 uppercase tracking-tighter leading-tight truncate max-w-[120px] sm:max-w-xs">
                {examMapel}
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1 truncate max-w-[120px] sm:max-w-xs">
                {getVal(user, "Nama")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setFontLevel((prev) => (prev + 1) % 3)}
              className="flex items-center justify-center p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200 relative"
              title="Perbesar Ukuran Teks"
            >
              <span className="font-black text-xs md:text-sm">A</span>
              <span className="font-black text-[10px] md:text-xs">A</span>
              {fontLevel > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              )}
            </button>

            {/* Tombol Kontrol Zoom Tampilan */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full">
              <button
                onClick={() => setPageZoom((prev) => Math.max(0.5, prev - 0.1))}
                className="px-4 py-2 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors font-black text-base"
                title="Perkecil Tampilan (Ctrl -)"
              >
                -
              </button>

              {pageZoom !== 1 ? (
                <button
                  onClick={() => setPageZoom(1)}
                  className="px-3 py-2 min-w-[54px] flex items-center justify-center text-[11px] font-black text-emerald-600 hover:text-emerald-700 bg-slate-200/50"
                  title="Reset Zoom (Ctrl 0)"
                >
                  {Math.round(pageZoom * 100)}%
                </button>
              ) : (
                <div className="px-4 w-px h-4 bg-slate-300 flex items-center justify-center mx-2"></div>
              )}

              <button
                onClick={() => setPageZoom((prev) => Math.min(2.0, prev + 0.1))}
                className="px-4 py-2 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors font-black text-base"
                title="Perbesar Tampilan (Ctrl +)"
              >
                +
              </button>
            </div>

            {/* === KODE BARU: TOMBOL FULLSCREEN MANUAL === */}
            <button
              onClick={() => {
                try {
                  const docElm = document.documentElement;
                  if (
                    !document.fullscreenElement &&
                    !document.webkitFullscreenElement
                  ) {
                    if (docElm.requestFullscreen)
                      docElm.requestFullscreen().catch(() => {});
                    else if (docElm.webkitRequestFullscreen)
                      docElm.webkitRequestFullscreen();
                    else if (docElm.msRequestFullscreen)
                      docElm.msRequestFullscreen();
                  } else {
                    if (document.exitFullscreen)
                      document.exitFullscreen().catch(() => {});
                    else if (document.webkitExitFullscreen)
                      document.webkitExitFullscreen();
                  }
                } catch (e) {}
              }}
              className="flex items-center justify-center p-2 md:p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200 active:scale-95"
              title="Mode Layar Penuh"
            >
              <Maximize size={16} className="md:w-[18px] md:h-[18px]" />
            </button>
            {/* =========================================== */}

            {!isAntiCheatActive && (
              <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 md:px-3 py-2 rounded-xl border border-amber-200 text-[9px] font-black uppercase tracking-widest animate-pulse shadow-sm">
                <ShieldAlert size={14} />{" "}
                <span className="hidden sm:inline">Mode Uji Coba</span>
                <span className="sm:hidden">DEV</span>
              </div>
            )}

            <ExamTimer
              initialTime={timeLeft}
              timeRef={timeLeftRef}
              onTick={(newTime) => {
                // TAMBAHAN: Cek !isSubmittingRef.current agar timer berhenti nge-save saat dikumpulkan
                if (activeExamRef.current && !isSubmittingRef.current) {
                  api.saveSesi(
                    getVal(user, "Username"),
                    getVal(activeExamRef.current, "ID"),
                    answersRef.current,
                    newTime,
                    pelanggaranRef.current,
                    isLockedRef.current ? "LOCKED" : "ACTIVE",
                  );
                }
              }}
              onTimeUp={() => handleEndExamClick(true)}
            />
          </div>
        </header>

        <AnimatePresence>
          {isOffline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-500 text-white text-xs md:text-sm font-bold text-center py-2 px-4 shadow-md z-40 flex items-center justify-center gap-2"
            >
              <ShieldAlert size={16} className="animate-pulse" />
              <br />
              KONEKSI TERPUTUS!
              <br />
              Jangan tutup aplikasi. Jangan panik!, Jawaban tetap tersimpan.
              <br />
              Anda TETAP BISA melanjutkan ujian sambil menunggu internet stabil
              kembali!.
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 w-full max-w-7xl mx-auto p-2 md:p-5 flex flex-col justify-center z-10 relative pb-24 lg:pb-5">
          {loadingSoal ? (
            <div className="flex flex-col items-center justify-center h-full m-auto">
              <RefreshCw
                className="animate-spin text-emerald-500 mb-4"
                size={48}
              />
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
                Menyiapkan Naskah Soal...
              </h2>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full h-[calc(100vh-140px)] lg:h-[calc(100vh-120px)] min-h-[500px]">
              <div className="flex-1 flex flex-col h-full bg-[#F4F4F0] border border-slate-200 rounded-[1.5rem] lg:rounded-[2rem] shadow-sm overflow-hidden relative">
                <div className="px-5 lg:px-6 py-3 lg:py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <span className="bg-slate-800 text-white font-black px-3 py-1.5 lg:px-4 rounded-lg text-xs lg:text-sm shadow-sm">
                      SOAL NO. {currentSoalIndex + 1}
                    </span>
                    {getVal(currentSoal, "Poin") && (
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-1.5 lg:px-3 rounded-lg text-[10px] lg:text-xs border border-emerald-200">
                        {getVal(currentSoal, "Poin")} POIN
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8">
                  <div className="max-w-4xl mx-auto pb-6">
                    {getVal(currentSoal, "Wacana") && (
                      <div className="p-5 md:p-6 bg-amber-50/50 border border-amber-200 rounded-[1.5rem] relative shadow-sm mb-6 mt-2">
                        <div className="absolute -top-3 left-6 bg-amber-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                          <BookMarked size={14} /> Bacaan / Wacana
                        </div>
                        <div
                          className={`font-medium text-slate-700 leading-relaxed mt-1 transition-all ${fontClasses.wacana[fontLevel]}`}
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          <Latex>{getVal(currentSoal, "Wacana") || ""}</Latex>
                        </div>
                      </div>
                    )}

                    {getVal(currentSoal, "Link_Gambar") && (
                      <div className="mb-8 w-full flex justify-start">
                        <div
                          onClick={() =>
                            setZoomedImg(getVal(currentSoal, "Link_Gambar"))
                          }
                          className="relative group cursor-pointer rounded-2xl border-2 border-slate-200 shadow-sm bg-slate-50 p-2 inline-block w-fit max-w-full hover:border-emerald-400 transition-colors"
                          title="Klik untuk memperbesar gambar"
                        >
                          <img
                            src={getVal(currentSoal, "Link_Gambar")}
                            key={getVal(currentSoal, "id")}
                            alt="Gambar Pendukung"
                            loading="lazy"
                            decoding="async"
                            className="max-w-full h-auto max-h-[35vh] lg:max-h-[45vh] object-contain rounded-xl"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                            <span className="text-white font-bold bg-slate-900/90 px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl text-sm">
                              <Maximize size={18} /> Perbesar Gambar
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div
                      className={`font-regular text-slate-800 leading-relaxed mb-6 md:mb-8 transition-all ${fontClasses.soal[fontLevel]}`}
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      <Latex>{getVal(currentSoal, "Pertanyaan") || ""}</Latex>
                    </div>

                    <div className="flex flex-col gap-3 md:gap-4">
                      {["A", "B", "C", "D", "E"].map((opt) => {
                        const optText = getVal(currentSoal, `Opsi_${opt}`);
                        if (!optText) return null;
                        const isSelected = answers[currentSoalId] === opt;

                        return (
                          <button
                            key={opt}
                            onClick={() => {
                              // 1. Catat jawaban di memori layar (UI) agar respon instan 0 detik
                              const newAnswers = {
                                ...answers,
                                [currentSoalId]: opt,
                              };
                              setAnswers(newAnswers);

                              // 2. AMANKAN DI PENYIMPANAN INTERNAL HP (Siswa Bebas Drama Gagal Simpan!)
                              const idUjian = getVal(activeExam, "ID");
                              localStorage.setItem(
                                `jawaban_${getVal(user, "Username")}_${idUjian}`,
                                JSON.stringify(newAnswers),
                              );

                              // 3. Jeda hitung mundur pengiriman cadangan ke cloud server
                              if (saveTimeoutRef.current) {
                                clearTimeout(saveTimeoutRef.current);
                              }

                              saveTimeoutRef.current = setTimeout(() => {
                                if (isSubmittingRef.current) return;

                                // Cadangan ke server HANYA dikirim jika HP mendapati koneksi internet stabil
                                if (navigator.onLine) {
                                  api.saveSesi(
                                    getVal(user, "Username"),
                                    idUjian,
                                    newAnswers,
                                    timeLeftRef.current,
                                    pelanggaranRef.current,
                                    isLockedRef.current ? "LOCKED" : "ACTIVE",
                                  );
                                }
                              }, 5000);
                            }}
                            className={`w-full text-left px-5 py-4 md:px-6 md:py-5 rounded-[1.5rem] border-2 transition-all flex items-start gap-4 md:gap-5 group relative overflow-hidden outline-none ${
                              isSelected
                                ? "border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/10 scale-[1.01]"
                                : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50 hover:shadow-sm"
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle2
                                size={120}
                                className="absolute -right-6 -bottom-6 text-emerald-100 opacity-50 z-0 pointer-events-none"
                              />
                            )}

                            <span
                              className={`font-black text-sm md:text-base w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full shrink-0 transition-all z-10 ${
                                isSelected
                                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                                  : "bg-slate-100 text-slate-500 border border-slate-200 group-hover:bg-emerald-100 group-hover:text-emerald-700 group-hover:border-emerald-200"
                              }`}
                            >
                              {opt}
                            </span>

                            <div
                              className={`font-medium pt-1 md:pt-2 leading-relaxed transition-all z-10 w-full ${fontClasses.opsi[fontLevel]} ${isSelected ? "text-emerald-900 font-bold" : "text-slate-700"}`}
                              style={{ whiteSpace: "pre-wrap" }}
                            >
                              <Latex>{optText || ""}</Latex>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex px-6 py-4 border-t border-slate-100 bg-slate-50/50 justify-between items-center shrink-0 gap-4">
                  <button
                    onClick={() =>
                      setCurrentSoalIndex((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentSoalIndex === 0}
                    className="px-5 py-3.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-100 disabled:opacity-40 flex items-center gap-2 shadow-sm transition-colors"
                  >
                    <ArrowLeft size={16} /> SOAL SEBELUMNYA
                  </button>

                  <button
                    onClick={toggleRaguRagu}
                    className={`px-6 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2.5 transition-colors border shadow-sm ${
                      isCurrentRagu
                        ? "bg-amber-400 text-amber-900 border-amber-500 hover:bg-amber-500"
                        : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isCurrentRagu}
                      readOnly
                      className="w-4 h-4 accent-amber-600 cursor-pointer pointer-events-none"
                    />
                    RAGU-RAGU
                  </button>

                  <button
                    onClick={() =>
                      setCurrentSoalIndex((prev) =>
                        Math.min(soalData.length - 1, prev + 1),
                      )
                    }
                    disabled={currentSoalIndex === soalData.length - 1}
                    className="px-5 py-3.5 bg-emerald-500 border border-emerald-600 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-sm uppercase tracking-widest text-xs flex items-center gap-2 disabled:opacity-40 transition-colors"
                  >
                    SOAL SELANJUTNYA <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              <div className="hidden lg:flex w-[320px] xl:w-[380px] flex-col h-full bg-[#F4F4F0] border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden shrink-0 relative z-20">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-black uppercase text-slate-500 tracking-widest">
                      Progress
                    </span>
                    <span className="text-sm font-black text-emerald-600">
                      {Math.round(progressPercent)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 mt-2 text-center uppercase tracking-widest">
                    Terjawab {answeredCount} dari {soalData.length} Soal
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 content-start">
                  <div className="grid grid-cols-5 gap-2.5">
                    {soalData.map((s, idx) => {
                      const isCurrent = idx === currentSoalIndex;
                      const sId = String(getVal(s, "id")).trim();
                      const hasAnswered = !!answers[sId];
                      const isRagu = !!raguRagu[sId];

                      let btnClass = isCurrent
                        ? "border-slate-800 shadow-md z-10 "
                        : "border-slate-200 shadow-sm "; // <-- Tambah border jelas & shadow

                      if (hasAnswered) {
                        btnClass += isRagu
                          ? "bg-amber-400 text-amber-900 border-amber-500"
                          : "bg-emerald-500 text-white border-emerald-600";
                      } else {
                        btnClass += isRagu
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : isCurrent
                            ? "bg-slate-800 text-white"
                            : "bg-white text-slate-500 hover:border-emerald-300 hover:text-emerald-600"; // <-- Background putih bersih agar kontras dengan #F4F4F0
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentSoalIndex(idx)}
                          className={`aspect-square flex items-center justify-center rounded-xl font-bold text-sm transition-colors border-2 ${btnClass}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-5 border-t border-slate-100 bg-slate-50/50 shrink-0">
                  <button
                    onClick={() => handleEndExamClick(false)}
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl shadow-sm active:scale-95 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <RefreshCw size={20} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={20} />
                    )}{" "}
                    Kumpulkan Ujian
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {!loadingSoal && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#F4F4F0] border-t border-slate-200 z-40 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.1)] pb-6 sm:pb-4 flex flex-col">
            {/* 1. Bar Progress Tipis Memanjang di Atas Navigasi */}
            <div className="w-full h-1.5 bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* 2. Teks Indikator (Terjawab X dari Y) */}
            <div className="flex justify-between items-center px-4 pt-2.5 pb-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Terjawab{" "}
                <span className="text-emerald-600">{answeredCount}</span> dari{" "}
                {soalData.length} Soal
              </span>
              <span className="text-[10px] font-black text-emerald-600">
                {Math.round(progressPercent)}%
              </span>
            </div>

            {/* 3. Barisan Tombol Bawah */}
            <div className="px-3 pt-1.5 flex justify-between items-center gap-2">
              <button
                onClick={() =>
                  setCurrentSoalIndex((prev) => Math.max(0, prev - 1))
                }
                disabled={currentSoalIndex === 0}
                className="p-3.5 bg-white text-slate-600 rounded-xl disabled:opacity-30 active:scale-95 transition-colors border border-slate-200 shadow-sm hover:text-emerald-600"
              >
                <ArrowLeft size={20} />
              </button>

              <button
                onClick={toggleRaguRagu}
                className={`flex-1 flex items-center justify-center gap-2 p-3.5 rounded-xl font-bold text-xs border transition-colors shadow-sm ${
                  isCurrentRagu
                    ? "bg-amber-400 text-amber-900 border-amber-500"
                    : "bg-white text-amber-700 border-amber-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isCurrentRagu}
                  readOnly
                  className="w-4 h-4 accent-amber-600 pointer-events-none"
                />
                <span className="hidden sm:inline">RAGU-RAGU</span>
                <span className="sm:hidden">RAGU</span>
              </button>

              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className="p-3.5 bg-white text-emerald-600 rounded-xl border border-emerald-200 active:scale-95 transition-transform flex items-center justify-center relative shadow-sm"
              >
                <LayoutDashboard size={20} />
                <span className="absolute -top-1.5 -right-1.5 text-[9px] font-black bg-emerald-500 text-white min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow-sm border border-white">
                  {answeredCount}
                </span>
              </button>

              <button
                onClick={() =>
                  setCurrentSoalIndex((prev) =>
                    Math.min(soalData.length - 1, prev + 1),
                  )
                }
                disabled={currentSoalIndex === soalData.length - 1}
                className="p-3.5 bg-emerald-500 text-white rounded-xl shadow-sm disabled:opacity-30 active:scale-95 transition-colors"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {isMobileDrawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileDrawerOpen(false)}
                className="lg:hidden fixed inset-0 bg-slate-900/60 z-[100]"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#F4F4F0] rounded-t-[2rem] z-[101] flex flex-col max-h-[85vh] shadow-2xl"
              >
                <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
                  <div>
                    <h3 className="font-black text-slate-800 text-lg tracking-tight">
                      Navigasi Soal
                    </h3>
                    <p className="text-[11px] font-bold text-emerald-600 mt-0.5 uppercase tracking-widest">
                      Progress: {Math.round(progressPercent)}%
                    </p>
                  </div>
                  <button
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="p-2 bg-slate-100 text-slate-500 hover:text-red-500 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
                  <div className="grid grid-cols-5 sm:grid-cols-7 gap-3">
                    {soalData.map((s, idx) => {
                      const isCurrent = idx === currentSoalIndex;
                      const sId = String(getVal(s, "id")).trim();
                      const hasAnswered = !!answers[sId];
                      const isRagu = !!raguRagu[sId];

                      let btnClass = isCurrent
                        ? "border-emerald-500 shadow-md z-10 "
                        : "border-slate-200 shadow-sm "; // <-- Tambah border abu halus & bayangan

                      if (hasAnswered) {
                        btnClass += isRagu
                          ? "bg-amber-400 text-amber-900 shadow-md border-amber-500"
                          : "bg-emerald-500 text-white shadow-md border-emerald-600";
                      } else {
                        btnClass += isRagu
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : isCurrent
                            ? "bg-slate-800 text-white shadow-md border-slate-800"
                            : "bg-white text-slate-500 hover:border-emerald-300"; // <-- Tetap bg-white agar timbul dari laci krem
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentSoalIndex(idx);
                            setIsMobileDrawerOpen(false);
                          }}
                          className={`aspect-square flex items-center justify-center rounded-[1rem] font-bold text-sm transition-colors border-2 ${btnClass}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-t-3xl shrink-0 pb-6 sm:pb-4 shadow-[0_-5px_15px_-10px_rgba(0,0,0,0.05)]">
                  <button
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      handleEndExamClick(false);
                    }}
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-sm active:scale-95 transition-colors uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <RefreshCw size={20} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={20} />
                    )}{" "}
                    Kumpulkan Ujian Sekarang
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {zoomedImg && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999999] bg-slate-900/95 flex flex-col items-center justify-center p-0"
            >
              <button
                onClick={() => setZoomedImg(null)}
                className="absolute top-4 right-4 md:top-8 md:right-8 z-[1000] p-3 bg-white/10 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-all shadow-lg"
              >
                <X size={24} />
              </button>

              {/* Fitur Cubit, Geser, dan Zoom */}
              <TransformWrapper
                initialScale={1}
                minScale={0.8}
                maxScale={8}
                centerOnInit={true}
                wheel={{ step: 0.1 }}
              >
                <TransformComponent
                  wrapperStyle={{ width: "100vw", height: "100vh" }}
                >
                  <img
                    src={zoomedImg}
                    alt="Zoomed"
                    className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing"
                    onDragStart={(e) => e.preventDefault()}
                  />
                </TransformComponent>
              </TransformWrapper>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {customAlert.isOpen && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="w-full max-w-md p-8 shadow-2xl border-0 rounded-[2rem] bg-white text-center flex flex-col items-center">
                  <div
                    className={`p-4 rounded-2xl mb-5 ${customAlert.type === "danger" || customAlert.type === "confirm" ? "bg-red-50 text-red-500" : customAlert.type === "warning" ? "bg-amber-50 text-amber-500" : customAlert.type === "success" ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500"}`}
                  >
                    {customAlert.type === "success" ? (
                      <CheckCircle2 size={48} />
                    ) : customAlert.type === "info" ? (
                      <Info size={48} />
                    ) : (
                      <AlertTriangle size={48} />
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-3 leading-tight">
                    {customAlert.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-8 font-medium px-2 leading-relaxed whitespace-pre-wrap">
                    {customAlert.message}
                  </p>
                  <div className="flex gap-3 w-full">
                    {customAlert.type === "confirm" ? (
                      <>
                        <button
                          onClick={closeAlert}
                          className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors text-sm uppercase tracking-widest"
                        >
                          Batal
                        </button>
                        <button
                          onClick={
                            customAlert.onConfirm
                              ? customAlert.onConfirm
                              : closeAlert
                          }
                          className="flex-1 py-3.5 rounded-xl font-bold text-white shadow-sm transition-colors text-sm uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600"
                        >
                          Ya, Kumpulkan
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={closeAlert}
                        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-sm text-sm uppercase tracking-widest transition-colors ${customAlert.type === "danger" ? "bg-red-500 hover:bg-red-600" : "bg-emerald-600 hover:bg-emerald-700"}`}
                      >
                        Mengerti
                      </button>
                    )}
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ==============================================================
  // TAMPILAN BERANDA (Pilih Jadwal)
  // ==============================================================
  return (
    <Dashboard
      menu={[
        { id: "home", label: "Portal Ujian", icon: LayoutDashboard },
        { id: "nilai", label: "Hasil Ujian", icon: BarChart3 },
      ]}
      active={activeTab}
      setActive={setActiveTab}
    >
      <div className="fixed inset-0 bg-slate-50 z-0 pointer-events-none"></div>

      {activeTab === "home" && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto space-y-6 pb-24 relative z-10"
        >
          {/* DIGITAL ID CARD HEADER */}
          <motion.header
            variants={fadeUp}
            className="relative p-6 md:p-8 rounded-[2rem] shadow-lg bg-gradient-to-br from-emerald-600 to-emerald-800 border border-emerald-500 overflow-hidden text-white"
          >
            <div className="absolute -top-12 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col gap-4 md:gap-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-emerald-200 mb-1">
                    {appSettings.desc}
                  </p>
                  <h2 className="text-2xl md:text-4xl font-black tracking-tight drop-shadow-md">
                    {appSettings.title}
                  </h2>
                </div>
                <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <Award size={24} className="text-amber-300" />
                </div>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-black text-xl border-2 border-white shadow-sm shrink-0">
                  {getVal(user, "Nama")?.charAt(0)?.toUpperCase() || "S"}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm md:text-base leading-tight truncate">
                    {getVal(user, "Nama") || "Siswa"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-md uppercase tracking-wider border border-white/10">
                      KELAS: {userKelasFull || "-"}
                    </span>
                    <span className="text-[10px] font-bold bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-md uppercase tracking-wider border border-amber-400/20">
                      {getVal(user, "Username")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.header>

          <motion.div variants={fadeUp} className="space-y-4">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2.5 px-2 uppercase tracking-tight">
              <ClipboardCheck className="text-emerald-600" size={20} /> Daftar
              Ujian Tersedia
            </h3>
            {loading ? (
              <div className="py-16 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                <RefreshCw
                  className="animate-spin mx-auto text-emerald-500 mb-3"
                  size={28}
                />
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Mencari Jadwal...
                </p>
              </div>
            ) : errorMsg ? (
              <div className="p-6 text-center bg-red-50 rounded-[2rem] border border-red-100 text-red-600 font-bold shadow-sm text-sm">
                {errorMsg}
              </div>
            ) : exams.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center">
                <Calendar size={40} className="text-slate-200 mb-3" />
                <p className="text-slate-500 font-bold text-base">
                  Belum ada jadwal ujian untuk kelasmu saat ini.
                </p>
              </div>
            ) : (
              exams.map((ex) => {
                const examId = getVal(ex, "ID");
                const examMapel = getVal(ex, "Mapel") || "Ujian";
                const examStatusRaw = getVal(ex, "Status") || "TUTUP";
                const isAktif = String(examStatusRaw).toUpperCase() === "AKTIF";

                return (
                  <Card
                    key={examId || examMapel}
                    className={`p-5 flex flex-col md:flex-row items-center justify-between gap-5 border-l-[8px] rounded-[1.5rem] transition-colors ${isAktif ? "border-l-emerald-500 bg-white" : "border-l-slate-200 bg-slate-50/50"}`}
                  >
                    <div className="flex-1 text-center md:text-left w-full">
                      <Badge type={isAktif ? "Aktif" : examStatusRaw} />
                      <h4 className="text-xl font-black text-slate-900 mt-2 uppercase tracking-tight">
                        {examMapel}
                      </h4>
                      <div className="flex justify-center md:justify-start gap-3 mt-3 text-[11px] font-bold text-slate-500">
                        <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                          <Clock size={12} className="text-emerald-500" />{" "}
                          {getVal(ex, "Durasi_Menit") || "90"} Menit
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                          <Calendar size={12} className="text-amber-500" />{" "}
                          {formatTanggalLokal(getVal(ex, "Tanggal"))}
                        </span>
                      </div>
                    </div>
                    {isAktif ? (
                      <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                        <input
                          type="text"
                          value={tokens[examId] || ""}
                          onChange={(e) =>
                            setTokens({ ...tokens, [examId]: e.target.value })
                          }
                          className="w-full md:w-36 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-black tracking-widest uppercase outline-none focus:border-emerald-500 focus:bg-white transition-colors text-slate-800 text-sm"
                          placeholder="TOKEN"
                        />
                        <button
                          onClick={() => handleStartExam(ex)}
                          className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-black px-6 py-3.5 rounded-xl shadow-sm active:scale-95 transition-all uppercase tracking-widest text-sm"
                        >
                          MULAI
                        </button>
                      </div>
                    ) : (
                      <div className="w-full md:w-auto bg-slate-200/50 text-slate-400 font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest text-[11px]">
                        <Lock size={14} /> {examStatusRaw}
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </motion.div>
        </motion.div>
      )}

      {activeTab === "nilai" && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto space-y-6 pb-24 relative z-10"
        >
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-between px-2 mb-2"
          >
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                  <Award size={20} />
                </div>{" "}
                Riwayat Nilai
              </h2>
              <p className="text-xs font-bold text-slate-400 mt-1">
                Evaluasi pencapaian hasil belajarmu di sini.
              </p>
            </div>
          </motion.div>

          {loading ? (
            <motion.div
              variants={fadeUp}
              className="py-16 text-center bg-white rounded-[2rem] shadow-sm border border-slate-100"
            >
              <RefreshCw
                className="animate-spin mx-auto text-emerald-500 mb-3"
                size={28}
              />
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Menarik Data Nilai...
              </p>
            </motion.div>
          ) : myResults.length === 0 ? (
            <motion.div
              variants={fadeUp}
              className="p-12 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center"
            >
              <Target size={40} className="text-slate-200 mb-3" />
              <h3 className="text-base font-black text-slate-700">
                Belum Ada Riwayat Ujian
              </h3>
              <p className="text-slate-500 font-medium text-sm mt-1">
                Nilai kamu akan muncul di sini setelah menyelesaikan ujian.
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {myResults.map((res, idx) => {
                const mapel = getVal(res, "Mapel") || "Ujian";
                const skor = parseFloat(getVal(res, "Skor")) || 0;
                const status = getVal(res, "Status") || "Selesai";
                const benarCount = getVal(res, "Benar");
                const salahCount = getVal(res, "Salah");
                const totalCount = getVal(res, "Total_Soal");

                return (
                  <Card
                    key={idx}
                    className="p-5 flex flex-col rounded-[1.5rem] relative overflow-hidden border border-slate-100 bg-white"
                  >
                    <div className="flex justify-between items-start mb-5 relative z-10">
                      <div className="bg-slate-50 px-2.5 py-1 rounded-md text-[10px] font-black uppercase text-slate-500 tracking-widest border border-slate-200">
                        {mapel}
                      </div>
                      <Badge type={status} />
                    </div>
                    <div className="mt-auto relative z-10 flex flex-col">
                      <div className="flex items-end gap-2 mb-4">
                        <span className="text-5xl font-black tracking-tighter leading-none text-emerald-500">
                          {skor}
                        </span>
                        <span className="text-xs font-bold text-slate-400 pb-1.5 uppercase tracking-widest">
                          Poin
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2 pt-4 border-t border-slate-100">
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                            Total Soal
                          </p>
                          <p className="text-lg font-black text-slate-700">
                            {totalCount !== "" ? totalCount : "-"}
                          </p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-emerald-600/80 tracking-widest">
                            Benar
                          </p>
                          <p className="text-lg font-black text-emerald-600">
                            {benarCount !== "" ? benarCount : "-"}
                          </p>
                        </div>
                        <div className="bg-red-50 border border-red-100 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-red-500/80 tracking-widest">
                            Salah
                          </p>
                          <p className="text-lg font-black text-red-500">
                            {salahCount !== "" ? salahCount : "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* MODAL CUSTOM ALERT */}
      <AnimatePresence>
        {customAlert.isOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="w-full max-w-md p-8 shadow-2xl border-0 rounded-[2rem] bg-white text-center flex flex-col items-center">
                <div
                  className={`p-4 rounded-2xl mb-5 ${customAlert.type === "danger" || customAlert.type === "confirm" ? "bg-red-50 text-red-500" : customAlert.type === "warning" ? "bg-amber-50 text-amber-500" : customAlert.type === "success" ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500"}`}
                >
                  {customAlert.type === "success" ? (
                    <CheckCircle2 size={48} />
                  ) : customAlert.type === "info" ? (
                    <Info size={48} />
                  ) : (
                    <AlertTriangle size={48} />
                  )}
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-3 leading-tight">
                  {customAlert.title}
                </h3>
                <p className="text-sm text-slate-600 mb-8 font-medium px-2 leading-relaxed whitespace-pre-wrap">
                  {customAlert.message}
                </p>
                <div className="flex gap-3 w-full">
                  {customAlert.type === "confirm" ? (
                    <>
                      <button
                        onClick={closeAlert}
                        className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors text-sm uppercase tracking-widest"
                      >
                        Batal
                      </button>
                      <button
                        onClick={
                          customAlert.onConfirm
                            ? customAlert.onConfirm
                            : closeAlert
                        }
                        className="flex-1 py-3.5 rounded-xl font-bold text-white shadow-sm transition-colors text-sm uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600"
                      >
                        Ya, Kumpulkan
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={closeAlert}
                      className={`w-full py-3.5 rounded-xl font-bold text-white shadow-sm text-sm uppercase tracking-widest transition-colors ${customAlert.type === "danger" ? "bg-red-500 hover:bg-red-600" : "bg-emerald-600 hover:bg-emerald-700"}`}
                    >
                      Mengerti
                    </button>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Dashboard>
  );
};

export default SiswaDashboard;
