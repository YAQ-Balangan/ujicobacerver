// src/pages/AdminDashboard.jsx
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  BookMarked,
  Settings,
  RefreshCw,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Check,
  AlertTriangle,
  Info,
  Lock,
  Unlock,
  ListChecks,
  MonitorSmartphone,
  Copy, // <-- Tambahan
  Printer, // <-- Tambahan
  Files, // <-- Tambahan
  Share2, // <-- Tambahan
  Timer,
} from "lucide-react";
import { api, supabase } from "../api/api";
import Dashboard from "../components/layout/Dashboard";
import FiltersToolbar from "../features/admin/components/FiltersToolbar";
// === KITA IMPOR KOMPONEN UI DARI Ui.jsx ===
import {
  Card,
  Badge,
  PremiumSelect,
  PremiumMultiSelect,
  PageSkeleton,
} from "../components/ui/Ui";
const TabSiswa = React.lazy(() => import("../features/admin/tabs/SiswaTab"));
const TabJadwal = React.lazy(() => import("../features/admin/tabs/JadwalTab"));
const TabMapel = React.lazy(() => import("../features/admin/tabs/MapelTab"));
const TabSettings = React.lazy(() => import("../features/admin/tabs/SettingsTab"));

const SettingToggle = ({ label, description, checked, onClick, icon: Icon }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onClick}
    className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md"
  >
    <span className="flex min-w-0 items-center gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${checked ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
        <Icon size={18} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-black text-slate-800">{label}</span>
        <span className="mt-0.5 block text-xs font-medium text-slate-500">{description}</span>
      </span>
    </span>
    <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-emerald-500" : "bg-slate-300"}`}>
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`} />
    </span>
  </button>
);

const CompactSettingToggle = ({ label, checked, onClick, icon: Icon }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={`${label}: ${checked ? "aktif" : "nonaktif"}`}
    onClick={onClick}
    className={`flex min-w-0 flex-1 items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition ${
      checked
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-slate-200 bg-white text-slate-500"
    }`}
  >
    <span className="flex min-w-0 items-center gap-2">
      <Icon size={15} className="shrink-0" />
      <span className="truncate text-[10px] font-black uppercase tracking-wide">{label}</span>
    </span>
    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${checked ? "bg-emerald-500" : "bg-slate-300"}`} />
  </button>
);

// ==========================================
// HELPER: FORMAT TANGGAL
// ==========================================
const formatTanggal = (isoString) => {
  if (!isoString) return "-";
  if (
    typeof isoString === "string" &&
    isoString.includes("T") &&
    isoString.includes("Z")
  ) {
    try {
      const d = new Date(isoString);
      return d
        .toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(/\./g, ":");
    } catch {
      return isoString;
    }
  }
  return isoString;
};

// ==========================================
// GENERATOR OPSI KELAS TERPUSAT (SINKRONISASI SMP & SMA)
// ==========================================
const TINGKAT_SMP = ["VII", "VIII", "IX"];
const TINGKAT_SMA = ["X", "XI", "XII"];
const JURUSAN_SMA = ["MIPA", "IPS"];
const MAKSIMAL_ROMBEL = 2; // Rombel 1 dan 2

const OPSI_KELAS_LENGKAP = [];

// --- 1. BAGIAN SMP (Tanpa Jurusan) ---
OPSI_KELAS_LENGKAP.push({ label: "TINGKAT SMP", isLabel: true });
TINGKAT_SMP.forEach((t) => {
  OPSI_KELAS_LENGKAP.push({ label: `${t}`, value: t });
});

// --- 2. BAGIAN SMA (Tingkat Umum) ---
OPSI_KELAS_LENGKAP.push({
  label: "TINGKAT SMA (GABUNGAN JURUSAN)",
  isLabel: true,
});
TINGKAT_SMA.forEach((t) => {
  OPSI_KELAS_LENGKAP.push({ label: `${t}`, value: t });
});

// --- 3. BAGIAN SMA (Jurusan Global) ---
OPSI_KELAS_LENGKAP.push({ label: "JURUSAN SMA GLOBAL", isLabel: true });
JURUSAN_SMA.forEach((j) => {
  OPSI_KELAS_LENGKAP.push({ label: `Semua ${j}`, value: j });
});

// --- 4. BAGIAN SMA (Tingkat & Jurusan) ---
OPSI_KELAS_LENGKAP.push({ label: "TINGKAT & JURUSAN SMA", isLabel: true });
TINGKAT_SMA.forEach((t) => {
  JURUSAN_SMA.forEach((j) => {
    OPSI_KELAS_LENGKAP.push({ label: `${t} ${j}`, value: `${t} ${j}` });
  });
});

// --- 5. BAGIAN SMA (Rombel Spesifik 1 & 2) ---
OPSI_KELAS_LENGKAP.push({
  label: "KELAS SPESIFIK (ROMBEL SMA)",
  isLabel: true,
});
TINGKAT_SMA.forEach((t) => {
  JURUSAN_SMA.forEach((j) => {
    for (let i = 1; i <= MAKSIMAL_ROMBEL; i++) {
      OPSI_KELAS_LENGKAP.push({
        label: `${t} ${j} ${i}`,
        value: `${t} ${j} ${i}`,
      });
    }
  });
});

const FLAT_OPSI_KELAS = OPSI_KELAS_LENGKAP.filter((opt) => !opt.isLabel).map(
  (opt) => opt.value,
);

// ==========================================
// DAFTAR KELAS DENGAN PEMBATAS KATEGORI
// ==========================================
const OPSI_KELAS_SISWA = [
  { label: "TINGKAT SMP / MTS", isLabel: true },
  ...TINGKAT_SMP.map((t) => ({ label: t, value: t })),
  { label: "SMA / MA / SMK", isLabel: true },
];

TINGKAT_SMA.forEach((t) => {
  JURUSAN_SMA.forEach((j) => {
    for (let i = 1; i <= MAKSIMAL_ROMBEL; i++) {
      OPSI_KELAS_SISWA.push({
        label: `${t} ${j} ${i}`,
        value: `${t} ${j} ${i}`,
      });
    }
  });
});

// ==========================================
// 2. KONFIGURASI DINAMIS (SCHEMA)
// ==========================================
const TAB_CONFIG = {
  siswa: {
    sheet: "Users",
    title: "Database User",
    subtitle: "Manajemen Akses Lengkap Siswa & Guru",
    columns: [
      { key: "id", label: "ID", isNumber: true, sortable: true },
      { key: "nama", label: "Nama Lengkap", sortable: true },
      { key: "username", label: "Username", sortable: true },
      { key: "password", label: "Password" },
      {
        key: "role",
        label: "Role",
        isSelect: true,
        options: ["siswa", "guru", "admin"],
        sortable: true,
        filterable: true,
      },
      {
        key: "kelas",
        label: "Kelas",
        isSelect: true,
        options: OPSI_KELAS_SISWA,
        sortable: true,
        filterable: true,
      },
      {
        key: "jenis_kelamin",
        label: "Jenis Kelamin",
        isSelect: true,
        options: ["Laki-Laki", "Perempuan"],
        sortable: true,
        filterable: true,
      },
    ],
  },
  jadwal: {
    sheet: "Jadwal",
    title: "Jadwal Ujian",
    subtitle: "Manajemen Sesi Ujian CBT",
    columns: [
      { key: "id", label: "ID", isNumber: true, sortable: true },
      { key: "nama_ujian", label: "Nama Ujian", sortable: true },
      {
        key: "mapel",
        label: "Mata Pelajaran",
        isCombobox: true,
        options: [],
        sortable: true,
        filterable: true,
      },
      {
        key: "kelas",
        label: "Target Kelas",
        isMultiSelect: true,
        options: OPSI_KELAS_LENGKAP,
        sortable: true,
        filterable: true,
      },
      { key: "tanggal", label: "Tanggal", isDate: true, sortable: true },
      { key: "durasi_menit", label: "Durasi (Menit)", isNumber: true },
      { key: "token", label: "Token", sortable: true },
      {
        key: "acak_soal",
        label: "Mode Soal",
        isSelect: true,
        options: ["ACAK", "BERURUTAN"],
        sortable: true,
        filterable: true,
      },
      {
        key: "status",
        label: "Status",
        isSelect: true,
        options: ["Draft", "Aktif", "Selesai"],
        sortable: true,
        filterable: true,
      },
    ],
  },
  mapel: {
    sheet: "Mapel",
    title: "Mata Pelajaran",
    subtitle: "Daftar Mata Pelajaran Aktif",
    columns: [
      { key: "id", label: "ID", isNumber: true, sortable: true },
      { key: "nama_mapel", label: "Nama Mapel", sortable: true },
      {
        key: "kelas",
        label: "Kelas",
        isMultiSelect: true,
        options: OPSI_KELAS_LENGKAP,
        sortable: true,
        filterable: true,
      },
      { key: "guru_pengampu", label: "Guru", sortable: true, filterable: true },
    ],
  },
  settings: {
    sheet: "Settings",
    title: "Konfigurasi Sistem",
    subtitle: "Pengaturan Global Aplikasi CBT",
    columns: [
      { key: "id", label: "ID", isNumber: true, sortable: true },
      { key: "kunci", label: "Pengaturan", sortable: true, filterable: true },
      { key: "nilai", label: "Isi / Keterangan", sortable: true },
    ],
  },
};

const MENU_ITEMS = [
  { id: "siswa", label: "Manajemen User", icon: ShieldCheck },
  { id: "jadwal", label: "Jadwal Ujian", icon: Calendar },
  { id: "mapel", label: "Mata Pelajaran", icon: BookMarked },
  { id: "settings", label: "Konfigurasi", icon: Settings },
];

// ==========================================
// KOMPONEN INLINE EDIT (GOOGLE SHEETS STYLE)
// ==========================================
import EditableCell from "../components/ui/EditableCell";
import { findSetting, isSettingEnabled } from "../utils/settings";

// ==========================================
// KOMPONEN UTAMA
// ==========================================
const AdminDashboard = ({ initialTab = "siswa" }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(initialTab || "siswa");

  const [allData, setAllData] = useState({
    siswa: [],
    jadwal: [],
    mapel: [],
    settings: [],
  });

  const currentConfig = TAB_CONFIG[tab];
  const data = allData[tab] || [];

  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [customAlert, setCustomAlert] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
  });
  const showAlert = (type, title, message, onConfirm = null) =>
    setCustomAlert({ isOpen: true, type, title, message, onConfirm });
  const closeAlert = () => setCustomAlert({ ...customAlert, isOpen: false });

  const fetchAllData = async (isBackground = false) => {
    // =======================================================
    // 1. FASE OFFLINE CACHE (TAMPIL INSTAN 0 DETIK)
    // =======================================================
    if (!isBackground) {
      setLoading(true);
      const cachedSiswa = localStorage.getItem("tadbira_admin_siswa");
      const cachedJadwal = localStorage.getItem("tadbira_admin_jadwal");
      const cachedMapel = localStorage.getItem("tadbira_admin_mapel");
      const cachedSettings = localStorage.getItem("tadbira_admin_settings");

      if (cachedSiswa || cachedJadwal || cachedMapel || cachedSettings) {
        setAllData((prev) => ({
          ...prev,
          siswa: cachedSiswa ? JSON.parse(cachedSiswa) : [],
          jadwal: cachedJadwal ? JSON.parse(cachedJadwal) : [],
          mapel: cachedMapel ? JSON.parse(cachedMapel) : [],
          settings: cachedSettings ? JSON.parse(cachedSettings) : [],
        }));
      }
      setLoading(false); // Matikan loading karena data lokal sudah tampil!
    } else {
      setIsSyncing(true);
    }

    // =======================================================
    // 2. FASE ONLINE (SINKRONISASI DATA SERVER)
    // =======================================================
    try {
      const [resSiswa, resJadwal, resMapel, resSettings] = await Promise.all([
        api.read(TAB_CONFIG.siswa.sheet),
        api.read(TAB_CONFIG.jadwal.sheet),
        api.read(TAB_CONFIG.mapel.sheet),
        api.read(TAB_CONFIG.settings.sheet),
      ]);

      const newData = {
        siswa: resSiswa || [],
        jadwal: resJadwal || [],
        mapel: resMapel || [],
        settings: resSettings || [],
      };

      setAllData((prev) =>
        JSON.stringify(prev) !== JSON.stringify(newData) ? newData : prev,
      );

      // SIMPAN KE BRANKAS LOKAL
      localStorage.setItem(
        "tadbira_admin_siswa",
        JSON.stringify(newData.siswa),
      );
      localStorage.setItem(
        "tadbira_admin_jadwal",
        JSON.stringify(newData.jadwal),
      );
      localStorage.setItem(
        "tadbira_admin_mapel",
        JSON.stringify(newData.mapel),
      );
      localStorage.setItem(
        "tadbira_admin_settings",
        JSON.stringify(newData.settings),
      );
    } catch (error) {
      console.warn(
        "Gagal menarik data terbaru, menggunakan mode offline:",
        error,
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const refreshCurrentTab = async (isBackground = false) => {
    if (!currentConfig) return;
    if (!isBackground) setLoading(true);
    if (isBackground) setIsSyncing(true);
    try {
      const result = await api.read(currentConfig.sheet);
      setAllData((prev) => ({ ...prev, [tab]: result || [] }));
      localStorage.setItem(`tadbira_admin_${tab}`, JSON.stringify(result || []));
    } catch (error) {
      console.warn(`Gagal merefresh data ${tab}:`, error);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchAllData(false);

    // MESIN REALTIME SEJATI: Suntik data langsung tanpa fetch ulang, berjalan di semua tab secara diam-diam!
    const handleRealtimePayload = (payload, stateKey) => {
      setAllData((prev) => {
        const currentData = prev[stateKey] || [];
        if (payload.eventType === "INSERT") {
          return { ...prev, [stateKey]: [...currentData, payload.new] };
        } else if (payload.eventType === "UPDATE") {
          return {
            ...prev,
            [stateKey]: currentData.map((item) =>
              item.id === payload.new.id ? payload.new : item,
            ),
          };
        } else if (payload.eventType === "DELETE") {
          return {
            ...prev,
            [stateKey]: currentData.filter(
              (item) => item.id !== payload.old.id,
            ),
          };
        }
        return prev;
      });
    };

    const channel = supabase
      .channel("admin-dashboard-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" }, // <-- Sudah huruf kecil
        (payload) => handleRealtimePayload(payload, "siswa"),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jadwal" }, // <-- Sudah huruf kecil
        (payload) => handleRealtimePayload(payload, "jadwal"),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mapel" }, // <-- Sudah huruf kecil
        (payload) => handleRealtimePayload(payload, "mapel"),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "settings" }, // <-- Sudah huruf kecil
        (payload) => handleRealtimePayload(payload, "settings"),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // Hapus dependensi [tab] agar realtime tetap jalan walau beda tab
  useEffect(() => {
    setSearch("");
    setFilters({});
    setSortConfig({ key: "id", direction: "asc" });
  }, [tab]);

  const handleAddNewRow = () => {
    const maxId =
      data.length > 0 ? Math.max(...data.map((d) => parseInt(d.id) || 0)) : 0;
    const newRow = { id: maxId + 1, isNew: true };
    currentConfig.columns.forEach((col) => {
      if (col.key !== "id") newRow[col.key] = col.isNumber ? 0 : "";
    });
    if (tab === "siswa") newRow.role = "siswa";
    if (tab === "jadwal") {
      newRow.status = "Draft";
      newRow.acak_soal = "ACAK";
      newRow.durasi_menit = 90;
      newRow.tanggal = new Date().toISOString().split("T")[0];
    }
    setAllData((prev) => ({ ...prev, [tab]: [...prev[tab], newRow] }));
  };

  const handleSaveCell = async (originalId, key, newValue) => {
    const item = data.find((d) => d.id === originalId);
    if (!item) return;

    let parsedValue = newValue;
    const column = currentConfig.columns.find((c) => c.key === key);

    if (column?.isNumber || key === "id") {
      parsedValue =
        key === "id" ? parseInt(newValue) || 0 : parseFloat(newValue) || 0;
    }

    if (key === "id" && parsedValue !== originalId) {
      const isDuplicate = data.some((d) => d.id === parsedValue);
      if (isDuplicate)
        return showAlert(
          "warning",
          "ID Duplikat",
          `ID #${parsedValue} sudah digunakan.`,
        );
    }

    const updatedItem = { ...item, [key]: parsedValue };
    setAllData((prev) => ({
      ...prev,
      [tab]: prev[tab].map((d) => (d.id === originalId ? updatedItem : d)),
    }));

    setIsSyncing(true);
    try {
      const payload = { ...updatedItem };
      delete payload.isNew;
      currentConfig.columns.forEach((col) => {
        if (col.isNumber && typeof payload[col.key] === "string") {
          payload[col.key] = parseFloat(payload[col.key]) || 0;
        }
      });

      if (item.isNew) {
        await api.create(currentConfig.sheet, payload);
        setAllData((prev) => ({
          ...prev,
          [tab]: prev[tab].map((d) =>
            d.id === updatedItem.id ? { ...payload } : d,
          ),
        }));
      } else {
        await api.update(currentConfig.sheet, originalId, payload);
      }
    } catch (error) {
      refreshCurrentTab(true);
      showAlert("danger", "Gagal Menyimpan", error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const confirmDelete = (id) => {
    const item = data.find((d) => d.id === id);
    if (item && item.isNew) {
      setAllData((prev) => ({
        ...prev,
        [tab]: prev[tab].filter((d) => d.id !== id),
      }));
      return;
    }
    showAlert(
      "confirm",
      "Hapus Data?",
      `Yakin ingin menghapus data dengan ID: #${id}? Tindakan ini permanen.`,
      async () => {
        closeAlert();
        setLoading(true);
        try {
          await api.delete(currentConfig.sheet, id);
          await refreshCurrentTab(false);
        } catch (error) {
          showAlert("danger", "Gagal Menghapus", error.message);
        } finally {
          setLoading(false);
        }
      },
    );
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    else if (sortConfig.key === key && sortConfig.direction === "desc")
      return setSortConfig({ key: null, direction: "asc" });
    setSortConfig({ key, direction });
  };

  const processedData = useMemo(() => {
    let result = [...data];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(s),
        ),
      );
    }
    Object.keys(filters).forEach((filterKey) => {
      if (filters[filterKey]) {
        if (filterKey === "jurusan") {
          result = result.filter((item) =>
            String(item.kelas || "")
              .toUpperCase()
              .includes(filters[filterKey].toUpperCase()),
          );
        } else {
          result = result.filter(
            (item) =>
              String(item[filterKey] || "").toLowerCase() ===
              String(filters[filterKey]).toLowerCase(),
          );
        }
      }
    });
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = String(a[sortConfig.key] || "").toLowerCase();
        const bVal = String(b[sortConfig.key] || "").toLowerCase();
        const aNum = Number(aVal);
        const bNum = Number(bVal);
        if (!isNaN(aNum) && !isNaN(bNum))
          return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [data, search, filters, sortConfig]);

  const getFilterOptions = (key) => {
    const uniqueVals = [...new Set(data.map((item) => item[key]))];
    return uniqueVals
      .filter(
        (val) => val !== "" && val !== null && val !== undefined && val !== "-",
      )
      .sort();
  };

  const antiCheatSetting = findSetting(allData.settings, "MODE_UJIAN");
  const isAntiCheatOn = isSettingEnabled(antiCheatSetting?.nilai, true);
  const handleToggleAntiCheat = async () => {
    showAlert(
      "confirm",
      "Ubah Mode Ujian?",
      `Yakin ingin ${isAntiCheatOn ? "MEMATIKAN" : "MENGHIDUPKAN"} fitur Mode Ujian?`,
      async () => {
        closeAlert();
        setIsSyncing(true);
        try {
          const nextValue = isAntiCheatOn ? "OFF" : "ON";
          if (antiCheatSetting)
            await api.update("Settings", antiCheatSetting.id, {
              ...antiCheatSetting,
              nilai: nextValue,
            });
          else
            await api.create("Settings", {
              id: (Math.max(...allData.settings.map((s) => s.id)) || 0) + 1,
              kunci: "Mode_Ujian",
              nilai: nextValue,
            });
          setAllData((previous) => ({
            ...previous,
            settings: antiCheatSetting
              ? previous.settings.map((setting) =>
                  setting.id === antiCheatSetting.id
                    ? { ...setting, nilai: nextValue }
                    : setting,
                )
              : [...previous.settings, { id: Date.now(), kunci: "Mode_Ujian", nilai: nextValue }],
          }));
          await refreshCurrentTab(false);
          showAlert(
            "success",
            "Berhasil!",
            `Mode Ujian ${isAntiCheatOn ? "NONAKTIF" : "AKTIF"}.`,
          );
        } catch (e) {
          showAlert("danger", "Gagal", e.message);
        } finally {
          setIsSyncing(false);
        }
      },
    );
  };

  const appOnlySetting = findSetting(allData.settings, "MODE_APLIKASI");
  const isAppOnlyOn = isSettingEnabled(appOnlySetting?.nilai, false);
  const handleToggleAppOnly = async () => {
    showAlert(
      "confirm",
      "Ubah Mode Akses?",
      `Yakin ingin ${isAppOnlyOn ? "MEMATIKAN" : "MENGHIDUPKAN"} fitur Akses Khusus Aplikasi?`,
      async () => {
        closeAlert();
        setIsSyncing(true);
        try {
          const nextValue = isAppOnlyOn ? "OFF" : "ON";
          if (appOnlySetting)
            await api.update("Settings", appOnlySetting.id, {
              ...appOnlySetting,
              nilai: nextValue,
            });
          else
            await api.create("Settings", {
              id: (Math.max(...allData.settings.map((s) => s.id)) || 0) + 1,
              kunci: "Mode_Aplikasi",
              nilai: nextValue,
            });
          setAllData((previous) => ({
            ...previous,
            settings: appOnlySetting
              ? previous.settings.map((setting) =>
                  setting.id === appOnlySetting.id
                    ? { ...setting, nilai: nextValue }
                    : setting,
                )
              : [...previous.settings, { id: Date.now(), kunci: "Mode_Aplikasi", nilai: nextValue }],
          }));
          await refreshCurrentTab(false);
          showAlert(
            "success",
            "Berhasil!",
            `Akses Khusus Aplikasi ${isAppOnlyOn ? "NONAKTIF" : "AKTIF"}.`,
          );
        } catch (e) {
          showAlert("danger", "Gagal", e.message);
        } finally {
          setIsSyncing(false);
        }
      },
    );
  };

  const deleteAllSetting = findSetting(allData.settings, "HAPUS_SEMUA_SOAL");
  const isDeleteAllOn = isSettingEnabled(deleteAllSetting?.nilai, true);
  const timerSetting = findSetting(allData.settings, "TIMER_UJIAN");
  const isTimerOn = isSettingEnabled(timerSetting?.nilai, true);
  const handleToggleTimer = async () => {
    showAlert(
      "confirm",
      "Ubah Timer Ujian?",
      `Yakin ingin ${isTimerOn ? "MEMATIKAN" : "MENGAKTIFKAN"} batas waktu ujian?`,
      async () => {
        closeAlert();
        setIsSyncing(true);
        try {
          const nextValue = isTimerOn ? "OFF" : "ON";
          if (timerSetting) {
            await api.update("Settings", timerSetting.id, {
              ...timerSetting,
              nilai: nextValue,
            });
          } else {
            await api.create("Settings", {
              id: (Math.max(...allData.settings.map((s) => s.id)) || 0) + 1,
              kunci: "TIMER_UJIAN",
              nilai: nextValue,
            });
          }
          setAllData((previous) => ({
            ...previous,
            settings: timerSetting
              ? previous.settings.map((setting) =>
                  setting.id === timerSetting.id
                    ? { ...setting, nilai: nextValue }
                    : setting,
                )
              : [
                  ...previous.settings,
                  { id: Date.now(), kunci: "TIMER_UJIAN", nilai: nextValue },
                ],
          }));
          await refreshCurrentTab(false);
          showAlert(
            "success",
            "Berhasil!",
            `Timer ujian ${isTimerOn ? "NONAKTIF" : "AKTIF"}.`,
          );
        } catch (error) {
          showAlert("danger", "Gagal", error.message);
        } finally {
          setIsSyncing(false);
        }
      },
    );
  };
  const handleToggleDeleteAll = async () => {
    showAlert(
      "confirm",
      "Ubah Izin Hapus Soal?",
      `Yakin ingin ${isDeleteAllOn ? "MEMATIKAN" : "MENGHIDUPKAN"} izin guru untuk menghapus semua soal sekaligus?`,
      async () => {
        closeAlert();
        setIsSyncing(true);
        try {
          const nextValue = isDeleteAllOn ? "OFF" : "ON";
          if (deleteAllSetting)
            await api.update("Settings", deleteAllSetting.id, {
              ...deleteAllSetting,
              nilai: nextValue,
            });
          else
            await api.create("Settings", {
              id: (Math.max(...allData.settings.map((s) => s.id)) || 0) + 1,
              kunci: "Hapus_Semua_Soal",
              nilai: nextValue,
            });
          setAllData((previous) => ({
            ...previous,
            settings: deleteAllSetting
              ? previous.settings.map((setting) =>
                  setting.id === deleteAllSetting.id
                    ? { ...setting, nilai: nextValue }
                    : setting,
                )
              : [...previous.settings, { id: Date.now(), kunci: "Hapus_Semua_Soal", nilai: nextValue }],
          }));
          await refreshCurrentTab(false);
          showAlert(
            "success",
            "Berhasil!",
            `Fitur Hapus Semua Soal ${isDeleteAllOn ? "NONAKTIF" : "AKTIF"}.`,
          );
        } catch (e) {
          showAlert("danger", "Gagal", e.message);
        } finally {
          setIsSyncing(false);
        }
      },
    );
  };

  // =================================================================
  // FITUR BARU 1: DUPLIKAT DATA (Jadwal / Mapel / Siswa) Biar Sat Set
  // =================================================================
  const handleDuplicateRow = async (item) => {
    setLoading(true);
    try {
      const maxId =
        data.length > 0 ? Math.max(...data.map((d) => parseInt(d.id) || 0)) : 0;
      const newItem = { ...item, id: maxId + 1 };
      delete newItem.isNew;

      // Beri tanda (Copy) agar tidak bingung
      if (tab === "jadwal") newItem.nama_ujian = `${newItem.nama_ujian} (Copy)`;
      if (tab === "mapel") newItem.nama_mapel = `${newItem.nama_mapel} (Copy)`;
      if (tab === "siswa") newItem.username = `${newItem.username}_copy`;

      await api.create(currentConfig.sheet, newItem);
      await refreshCurrentTab(false);
      showAlert(
        "success",
        "Berhasil Duplikat",
        "Data berhasil digandakan tanpa harus mengetik dari awal!",
      );
    } catch (e) {
      showAlert("danger", "Gagal Duplikat", e.message);
    } finally {
      setLoading(false);
    }
  };

  // =================================================================
  // FITUR BARU 2: CETAK KARTU LOGIN (Otomatis Layout Kertas)
  // =================================================================
  const handleCetakKartu = () => {
    if (processedData.length === 0)
      return showAlert(
        "warning",
        "Kosong",
        "Tidak ada data siswa untuk dicetak.",
      );

    let html = `<!DOCTYPE html><html><head><title>Kartu Ujian TADBIRA</title><style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; }
      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
      .card { border: 2px dashed #000; padding: 20px; border-radius: 15px; position: relative; }
      .title { text-align: center; font-weight: 900; font-size: 18px; margin: 0 0 15px 0; border-bottom: 3px solid #10b981; padding-bottom: 10px; }
      .row { margin-bottom: 8px; font-size: 14px; color: #333; }
      .bold { font-weight: 900; color: #000; }
      .print-btn { display: block; margin: 0 auto 30px auto; padding: 15px 30px; background: #10b981; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: bold; cursor: pointer; }
      @media print { body { padding: 0; } .print-btn { display: none; } .card { page-break-inside: avoid; } }
    </style></head><body>
    <button class="print-btn" onclick="window.print()">🖨️ Cetak / Simpan PDF Sekarang</button>
    <div class="grid">`;

    processedData.forEach((s) => {
      if (s.role === "siswa" || s.role === "murid") {
        html += `<div class="card">
          <h3 class="title">KARTU LOGIN UJIAN</h3>
          <!-- Menggunakan tabel agar titik dua sejajar rapi -->
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #333;">
            <tr>
              <td style="padding: 4px 0; width: 100px;">Nama</td>
              <td style="padding: 4px 0; width: 10px;">:</td>
              <td style="padding: 4px 0;" class="bold">${s.nama || "-"}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;">Kelas</td>
              <td style="padding: 4px 0;">:</td>
              <td style="padding: 4px 0;" class="bold">${s.kelas || "-"}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; padding-top: 15px;">Username</td>
              <td style="padding: 4px 0; padding-top: 15px;">:</td>
              <td style="padding: 4px 0; padding-top: 15px;" class="bold" style="font-size:18px;">${s.username || "-"}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;">Password</td>
              <td style="padding: 4px 0;">:</td>
              <td style="padding: 4px 0;" class="bold" style="font-size:18px;">${s.password || "-"}</td>
            </tr>
          </table>
        </div>`;
      }
    });

    html += `</div></body></html>`;
    const printWin = window.open("", "", "width=900,height=700");
    printWin.document.write(html);
    printWin.document.close();
  };

  // =================================================================
  // FITUR BARU 3: AUTO COPY BROADCAST KE WHATSAPP
  // =================================================================
  const handleCopyBroadcast = (jadwal) => {
    const msg = `*📢 INFORMASI UJIAN TADBIRA*\n\nMapel : ${jadwal.mapel}\nUjian : ${jadwal.nama_ujian}\nKelas : ${jadwal.kelas}\nTanggal : ${formatTanggal(jadwal.tanggal)}\nDurasi : ${jadwal.durasi_menit} Menit\n\n🔑 *TOKEN UJIAN : ${jadwal.token}*\n\nSilakan login menggunakan Username dan Password masing-masing tepat pada waktunya. Semoga sukses!`;
    navigator.clipboard.writeText(msg);
    showAlert(
      "success",
      "Tersalin ke Clipboard!",
      "Pesan WA beserta Token berhasil disalin. Silakan Paste di Grup WA Siswa.",
    );
  };

  const tabProps = {
    processedData,
    loading,
    data,
    currentConfig,
    allData,
    tab,
    handleSaveCell,
    confirmDelete,
    handleDuplicateRow,
    handleCopyBroadcast,
    getFilterOptions,
    search,
    setSearch,
    filters,
    setFilters,
    refreshCurrentTab,
    sortConfig,
    handleSort,
    isSyncing,
  };

  return (
    <Dashboard menu={MENU_ITEMS} active={tab} setActive={setTab}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      <div className="space-y-6 max-w-7xl mx-auto pb-24 relative">
        <div className="md:hidden flex flex-col gap-4 px-2 pt-2">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <div className="flex justify-between items-center relative z-10">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-0.5">
                  TADBIRA
                </p>
                <h2 className="text-xl font-black leading-tight">
                  Administrator
                </h2>
              </div>
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                <ShieldCheck size={20} className="text-emerald-400" />
              </div>
            </div>
            <div className="mt-6 flex items-end justify-between relative z-10">
              <div>
                <p className="text-3xl font-black leading-none mb-1">
                  {processedData.length}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                  Data {currentConfig.title}
                </p>
              </div>
              <button
                onClick={() => refreshCurrentTab(false)}
                className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <RefreshCw
                  size={16}
                  className={
                    loading || isSyncing
                      ? "animate-spin text-emerald-400"
                      : "text-slate-300"
                  }
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {MENU_ITEMS.map((menu) => {
              const Icon = menu.icon;
              return (
                <button
                  key={menu.id}
                  onClick={() => setTab(menu.id)}
                  className={`py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all border ${tab === menu.id ? "bg-emerald-500 border-emerald-500 text-white shadow-md" : "bg-white border-slate-200 text-slate-500"}`}
                >
                  <Icon size={18} />
                  <span className="text-[9px] font-bold">
                    {menu.label.split(" ")[1] || menu.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate("/ujian-dashboard")}
              className="w-full py-2 bg-indigo-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-md shadow-indigo-500/30 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <MonitorSmartphone size={16} /> Live Ujian
            </button>
            <button
              onClick={handleAddNewRow}
              className="w-full py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-100 active:scale-95 transition-all"
            >
              <Plus size={16} /> Tambah Baris Kosong
            </button>

            {tab === "settings" && (
              <div className="grid grid-cols-1 gap-2">
                <CompactSettingToggle label="Anti-cheat" checked={isAntiCheatOn} onClick={handleToggleAntiCheat} icon={ShieldCheck} />
                <CompactSettingToggle label="Akses aplikasi" checked={isAppOnlyOn} onClick={handleToggleAppOnly} icon={isAppOnlyOn ? Lock : Unlock} />
                <CompactSettingToggle label="Hapus massal" checked={isDeleteAllOn} onClick={handleToggleDeleteAll} icon={Trash2} />
                <CompactSettingToggle label="Timer ujian" checked={isTimerOn} onClick={handleToggleTimer} icon={Timer} />
              </div>
            )}

            <div className="flex gap-2">
              <div className="bg-white rounded-xl p-2.5 shadow-sm border border-slate-200 flex-1 flex items-center gap-2">
                <Search className="text-slate-400 ml-2 shrink-0" size={16} />
                <input
                  className="w-full bg-transparent border-none outline-none font-semibold text-sm text-slate-700 py-1 placeholder:text-slate-400"
                  placeholder="Cari data..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="bg-white text-slate-600 p-3 rounded-xl shadow-sm border border-slate-200 flex items-center justify-center relative hover:bg-slate-50 transition-colors shrink-0"
              >
                <ListChecks size={20} />
                {(Object.values(filters).some(Boolean) ||
                  sortConfig.key !== "id") && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>
            </div>
          </div>
        </div>

        <header className="hidden md:flex shrink-0 relative flex-col items-stretch p-5 lg:p-6 rounded-[1.5rem] shadow-sm border border-emerald-100/50 gap-5 overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-100 z-0">
          <div className="absolute -top-20 -left-10 w-72 h-72 bg-white/40 rounded-full -z-10 blur-xl"></div>
          <div className="absolute -bottom-20 right-10 w-80 h-80 bg-emerald-200/30 rounded-full -z-10 blur-xl"></div>

          <div className="flex items-center gap-3 z-10">
            <div className="p-3 bg-white/80 text-emerald-600 rounded-xl shadow-sm border border-white/60">
              <Settings size={24} className={isSyncing ? "animate-spin" : ""} />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight drop-shadow-sm">
                {currentConfig.title}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-slate-600 font-medium text-sm">
                  {currentConfig.subtitle}
                </p>
                {isSyncing && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md text-[10px] font-bold uppercase animate-pulse border border-amber-200">
                    <RefreshCw size={10} className="animate-spin" /> Syncing...
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col gap-4 z-10">
            {tab === "settings" && (
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SettingToggle label="Mode ujian" description="Anti-cheat aktif" checked={isAntiCheatOn} onClick={handleToggleAntiCheat} icon={ShieldCheck} />
                <SettingToggle label="Akses aplikasi" description="Batasi ke aplikasi ujian" checked={isAppOnlyOn} onClick={handleToggleAppOnly} icon={isAppOnlyOn ? Lock : Unlock} />
                <SettingToggle label="Hapus semua soal" description="Izinkan guru menghapus massal" checked={isDeleteAllOn} onClick={handleToggleDeleteAll} icon={Trash2} />
                <SettingToggle label="Timer ujian" description="Batasi durasi sesuai jadwal" checked={isTimerOn} onClick={handleToggleTimer} icon={Timer} />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigate("/ujian-dashboard")}
                className="flex-1 min-w-[9rem] bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-indigo-500/30 flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all text-sm border border-indigo-400 z-10"
              >
                <MonitorSmartphone size={18} className="animate-pulse" /> Live Ujian
              </button>
              {tab === "siswa" && (
                <button
                  onClick={handleCetakKartu}
                  className="flex-1 min-w-[9rem] bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-blue-500/30 flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all text-sm border border-blue-400 z-10"
                >
                  <Printer size={18} /> Cetak Kartu Login
                </button>
              )}
              <button
                onClick={handleAddNewRow}
                className="flex-1 min-w-[9rem] bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-emerald-500/30 flex items-center justify-center gap-2 hover:from-emerald-700 hover:to-emerald-600 active:scale-95 transition-all text-sm border border-emerald-400 z-10"
              >
                <Plus size={18} /> Tambah Data Baru
              </button>
            </div>
          </div>
        </header>

        <div className="hidden md:flex shrink-0 items-stretch gap-4">
          <Card className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-xl w-[200px] shrink-0 rounded-[2rem] relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldCheck size={56} className="text-emerald-400" />
            </div>
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest relative z-10">
              Total Data
            </p>
            <div className="flex items-baseline gap-2 mt-3 relative z-10">
              <p className="text-4xl font-black text-white">
                {processedData.length}
              </p>
            </div>
          </Card>
          <FiltersToolbar
            search={search}
            setSearch={setSearch}
            filters={filters}
            setFilters={setFilters}
            currentConfig={currentConfig}
            getFilterOptions={getFilterOptions}
            refreshCurrentTab={refreshCurrentTab}
            loading={loading}
            isSyncing={isSyncing}
          />
        </div>

        <React.Suspense fallback={<PageSkeleton label="Menyiapkan data admin" />}>
          {tab === "siswa" && <TabSiswa {...tabProps} />}
          {tab === "jadwal" && <TabJadwal {...tabProps} />}
          {tab === "mapel" && <TabMapel {...tabProps} />}
          {tab === "settings" && <TabSettings {...tabProps} />}
        </React.Suspense>

        <AnimatePresence>
          {customAlert.isOpen && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/80">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="w-full max-w-sm p-6 md:p-8 shadow-2xl border-0 rounded-[1.5rem] md:rounded-[2rem] bg-white text-center flex flex-col items-center">
                  <div
                    className={`p-4 md:p-5 rounded-[1.5rem] mb-4 md:mb-5 ${customAlert.type === "danger" || customAlert.type === "confirm" ? "bg-red-50 text-red-500 shadow-inner" : customAlert.type === "warning" ? "bg-amber-50 text-amber-500 shadow-inner" : "bg-emerald-50 text-emerald-500 shadow-inner"}`}
                  >
                    {customAlert.type === "danger" ||
                    customAlert.type === "confirm" ? (
                      <AlertTriangle size={36} />
                    ) : (
                      <Info size={36} />
                    )}
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2">
                    {customAlert.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 mb-6 md:mb-8 font-semibold px-2 leading-relaxed">
                    {customAlert.message}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    {customAlert.type === "confirm" && (
                      <button
                        onClick={closeAlert}
                        className="w-full py-3 px-4 bg-slate-100 text-slate-600 rounded-lg md:rounded-xl font-bold hover:bg-slate-200 transition-colors text-sm order-2 sm:order-1"
                      >
                        Batal
                      </button>
                    )}
                    <button
                      onClick={
                        customAlert.onConfirm
                          ? customAlert.onConfirm
                          : closeAlert
                      }
                      className={`w-full py-3 px-4 rounded-lg md:rounded-xl font-bold text-white shadow-lg transition-all text-sm order-1 sm:order-2 ${customAlert.type === "danger" || customAlert.type === "confirm" ? "bg-red-500 hover:bg-red-600 shadow-red-500/30" : customAlert.type === "warning" ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30"}`}
                    >
                      {customAlert.type === "confirm" ? "Ya" : "Mengerti"}
                    </button>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-[95] flex items-end justify-center bg-slate-900/80 md:hidden">
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full bg-white rounded-t-[2rem] p-6 shadow-2xl max-h-[85vh] flex flex-col"
              >
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <div>
                    <h3 className="text-xl font-black text-slate-800">
                      Filter & Urutkan
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                      Sesuaikan tampilan data.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="overflow-y-auto flex-1 scrollbar-hide pb-6 space-y-6">
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 border-b border-emerald-100 pb-2 flex block">
                      Urutkan Berdasarkan
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {currentConfig.columns
                        .filter((c) => c.sortable)
                        .map((col) => (
                          <button
                            key={`sort-${col.key}`}
                            onClick={() => handleSort(col.key)}
                            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors ${sortConfig.key === col.key ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                          >
                            <span className="truncate pr-1">{col.label}</span>
                            {sortConfig.key === col.key &&
                              (sortConfig.direction === "asc" ? (
                                <ChevronUp size={14} className="shrink-0" />
                              ) : (
                                <ChevronDown size={14} className="shrink-0" />
                              ))}
                          </button>
                        ))}
                    </div>
                  </div>

                  {currentConfig.columns.some(
                    (c) => c.filterable || c.key === "kelas",
                  ) && (
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 border-b border-indigo-100 pb-2 flex block">
                        Saring Data
                      </label>
                      <div className="space-y-3">
                        {currentConfig.columns
                          .filter((c) => c.filterable)
                          .map((col) => (
                            <div
                              key={`filter-${col.key}`}
                              className="space-y-1.5"
                            >
                              <span className="text-[10px] font-bold text-slate-500 ml-1">
                                {col.label}
                              </span>
                              <PremiumSelect
                                value={filters[col.key] || ""}
                                onChange={(val) =>
                                  setFilters({ ...filters, [col.key]: val })
                                }
                                options={[
                                  { label: `Semua ${col.label}`, value: "" },
                                  ...getFilterOptions(col.key).map((opt) => ({
                                    label: opt,
                                    value: opt,
                                  })),
                                ]}
                                placeholder={`Filter ${col.label}`}
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-5 border-t border-slate-100 flex gap-3 shrink-0 mt-2">
                  <button
                    onClick={() => {
                      setFilters({});
                      setSortConfig({ key: "id", direction: "asc" });
                      setIsMobileFilterOpen(false);
                    }}
                    className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="flex-1 py-3.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-sm shadow-md shadow-emerald-500/30 hover:bg-emerald-100 transition-colors"
                  >
                    Terapkan
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Dashboard>
  );
};

export default AdminDashboard;
