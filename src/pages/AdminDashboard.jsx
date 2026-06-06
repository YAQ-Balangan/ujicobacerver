// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Square,
  CheckSquare,
  Lock,
  Unlock,
  ListChecks,
  MonitorSmartphone,
} from "lucide-react";
import { api } from "../api/api";
import Dashboard from "../components/layout/Dashboard";
import { Card, Badge } from "../components/ui/Ui";

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
    } catch (e) {
      return isoString;
    }
  }
  return isoString;
};

// ==========================================
// 1. KOMPONEN PREMIUM CUSTOM DROPDOWN (SINGLE)
// ==========================================
const PremiumSelect = ({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value),
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-2.5 md:p-3 text-sm bg-white border transition-all rounded-lg md:rounded-xl outline-none shadow-sm min-h-[40px] md:min-h-[46px]
          ${disabled ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" : "border-slate-200 text-slate-700 focus:border-emerald-500 hover:border-emerald-400 cursor-pointer"}
        `}
      >
        <span
          className={`flex items-center gap-2 line-clamp-2 text-left break-words ${!selectedOption ? "text-slate-400" : "font-semibold"}`}
        >
          {icon && <span className="text-emerald-600 shrink-0">{icon}</span>}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 shrink-0 ml-2 transition-transform duration-300 ${isOpen ? "rotate-180 text-emerald-600" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-52 md:max-h-60 overflow-y-auto py-1"
          >
            {options.map((opt, index) => {
              // LOGIKA PEMBATAS (DIVIDER)
              if (opt.isLabel) {
                return (
                  <div
                    key={index}
                    className="px-4 pt-3 pb-1 text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-slate-50/50 sticky top-0 z-10"
                  >
                    {opt.label}
                  </div>
                );
              }

              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 text-sm transition-colors text-left
        ${isSelected ? "bg-emerald-50 text-emerald-800 font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-emerald-700 font-medium"}
      `}
                >
                  <span className="whitespace-normal break-words pr-2">
                    {opt.label}
                  </span>
                  {isSelected && (
                    <Check
                      size={16}
                      className="text-emerald-600 shrink-0 ml-2"
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 1.B KOMPONEN PREMIUM MULTI-SELECT CHECKBOX
// ==========================================
const PremiumMultiSelect = ({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedArray = value
    ? String(value)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const toggleOption = (optValue) => {
    let newArr = [...selectedArray];
    if (newArr.includes(optValue)) {
      newArr = newArr.filter((i) => i !== optValue);
    } else {
      newArr.push(optValue);
    }
    onChange(newArr.join(", "));
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-2.5 md:p-3 text-sm bg-white border transition-all rounded-lg md:rounded-xl outline-none shadow-sm min-h-[40px] md:min-h-[46px]
          ${disabled ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" : "border-slate-200 text-slate-700 focus:border-emerald-500 hover:border-emerald-400 cursor-pointer"}
        `}
      >
        <span
          className={`line-clamp-2 text-left break-words pr-2 ${selectedArray.length === 0 ? "text-slate-400" : "font-semibold"}`}
        >
          {selectedArray.length === 0
            ? placeholder
            : selectedArray.length > 2
              ? `${selectedArray.length} Kategori Dipilih`
              : selectedArray.join(", ")}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-emerald-600" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full md:w-80 mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl flex flex-col max-h-64 md:max-h-72 overflow-hidden max-w-[90vw]"
          >
            <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0 flex justify-between items-center z-10">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">
                Pilih Sasaran Kelas
              </span>
              {selectedArray.length > 0 && (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="text-[10px] font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="overflow-y-auto p-2 scrollbar-hide flex flex-col gap-1">
              {options.map((opt, index) => {
                if (opt.isLabel) {
                  return (
                    <div
                      key={index}
                      className="px-3 pt-3 pb-1 text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-white sticky top-0 z-10"
                    >
                      {opt.label}
                    </div>
                  );
                }
                const isSelected = selectedArray.includes(opt.value);
                return (
                  <div
                    key={index}
                    onClick={() => toggleOption(opt.value)}
                    className={`flex items-center gap-3 p-2 md:p-2.5 rounded-lg cursor-pointer transition-all ${isSelected ? "bg-emerald-50 text-emerald-700 font-bold" : "hover:bg-slate-50 text-slate-600 font-medium"}`}
                  >
                    {isSelected ? (
                      <CheckSquare
                        size={16}
                        className="text-emerald-500 shrink-0"
                      />
                    ) : (
                      <Square size={16} className="text-slate-300 shrink-0" />
                    )}
                    <span className="text-xs md:text-sm whitespace-normal break-words leading-tight">
                      {opt.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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

// Array datar untuk Combobox Autocomplete
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

// Looping untuk memasukkan kelas spesifik SMA
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
      {
        key: "guru_pengampu",
        label: "Guru",
        sortable: true,
        filterable: true,
      },
    ],
  },
  settings: {
    sheet: "Settings",
    title: "Konfigurasi Sistem",
    subtitle: "Pengaturan Global Aplikasi CBT",
    columns: [
      { key: "id", label: "ID", isNumber: true, sortable: true },
      {
        key: "kunci",
        label: "Pengaturan",
        sortable: true,
        filterable: true,
      },
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
// Mendukung Teks, Angka, Dropdown, Kalender, dan Autocomplete!
// ==========================================
const EditableCell = ({ item, column, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(item[column.key] || "");

  useEffect(() => {
    setVal(item[column.key] || "");
  }, [item[column.key]]);

  const triggerSave = () => {
    setIsEditing(false);
    if (String(val).trim() !== String(item[column.key] || "").trim()) {
      onSave(item.id, column.key, val);
    }
  };

  if (isEditing) {
    if (column.isMultiSelect) {
      return (
        <div className="flex flex-col gap-1.5 min-w-[200px]">
          <PremiumMultiSelect
            value={val}
            onChange={(newVal) => setVal(newVal)}
            options={column.options}
            placeholder="Pilih Kelas..."
          />
          <div className="flex gap-1 mt-1">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                triggerSave();
              }}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black tracking-widest uppercase py-1.5 rounded shadow-sm transition-colors"
            >
              Simpan
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                setIsEditing(false);
                setVal(item[column.key] || "");
              }}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-600 text-[10px] font-black tracking-widest uppercase py-1.5 rounded transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      );
    }
    if (column.isSelect) {
      return (
        <select
          autoFocus
          className="w-full p-1.5 border-2 border-emerald-500 rounded outline-none text-sm text-emerald-900 bg-emerald-50 font-bold shadow-sm"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={triggerSave}
          onKeyDown={(e) => e.key === "Enter" && triggerSave()}
        >
          <option value="">Pilih...</option>
          {column.options.map((opt, i) => {
            // Jika opsi berupa Objek (Seperti daftar Kelas yang memiliki pembatas)
            if (typeof opt === "object" && opt !== null) {
              if (opt.isLabel) {
                return (
                  <option
                    key={`label-${i}`}
                    disabled
                    className="font-black bg-slate-200 text-slate-500"
                  >
                    --- {opt.label} ---
                  </option>
                );
              }
              return (
                <option key={`opt-${i}`} value={opt.value}>
                  {opt.label}
                </option>
              );
            }

            // Jika opsi berupa teks biasa (Seperti Role, Status, DAN MODE SOAL)
            return (
              <option key={`str-${i}`} value={opt}>
                {opt}
              </option>
            );
          })}
        </select>
      );
    }

    if (column.isDate) {
      return (
        <input
          autoFocus
          type="date"
          className="w-full p-1.5 border-2 border-emerald-500 rounded outline-none text-sm text-emerald-900 bg-emerald-50 font-bold shadow-sm"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={triggerSave}
          onKeyDown={(e) => e.key === "Enter" && triggerSave()}
        />
      );
    }

    if (column.isCombobox) {
      const listId = `list-${column.key}-${item.id}`;
      return (
        <>
          <input
            autoFocus
            list={listId}
            type="text"
            className="w-full p-1.5 border-2 border-emerald-500 rounded outline-none text-sm text-emerald-900 bg-emerald-50 font-bold shadow-sm"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={triggerSave}
            onKeyDown={(e) => e.key === "Enter" && triggerSave()}
            placeholder="Ketik atau pilih..."
          />
          <datalist id={listId}>
            {column.options.map((opt) => (
              <option key={opt} value={opt} />
            ))}
          </datalist>
        </>
      );
    }

    return (
      <input
        autoFocus
        type={column.isNumber ? "number" : "text"}
        className="w-full p-1.5 border-2 border-emerald-500 rounded outline-none text-sm text-emerald-900 bg-emerald-50 font-bold shadow-sm"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={triggerSave}
        onKeyDown={(e) => e.key === "Enter" && triggerSave()}
        placeholder="Ketik lalu Enter..."
      />
    );
  }

  // Tampilan Default
  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`w-full min-h-[28px] cursor-text hover:bg-emerald-50 hover:ring-1 hover:ring-emerald-200 rounded px-1.5 flex items-center transition-colors ${column.key === "id" ? "font-mono text-xs text-slate-500 bg-slate-100 border border-slate-200 hover:border-emerald-300 w-max" : "text-slate-700"}`}
      title="Klik untuk mengubah"
    >
      {column.key === "role" || column.key === "status" ? (
        <Badge type={val || "Kosong"} />
      ) : column.key === "id" ? (
        `#${val}`
      ) : (
        val || <span className="text-slate-300 italic text-xs">Kosong...</span>
      )}
    </div>
  );
};

// ==========================================
// KOMPONEN UTAMA
// ==========================================
const AdminDashboard = () => {
  const [tab, setTab] = useState("siswa");

  // STATE CACHE GLOBAL
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

  // --- FETCH DATA DI AWAL (BACKGROUND) ---
  const fetchAllData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    if (isBackground) setIsSyncing(true);

    try {
      const [resSiswa, resJadwal, resMapel, resSettings] = await Promise.all([
        api.read(TAB_CONFIG.siswa.sheet),
        api.read(TAB_CONFIG.jadwal.sheet),
        api.read(TAB_CONFIG.mapel.sheet),
        api.read(TAB_CONFIG.settings.sheet),
      ]);

      setAllData((prev) => {
        const newData = {
          siswa: resSiswa || [],
          jadwal: resJadwal || [],
          mapel: resMapel || [],
          settings: resSettings || [],
        };
        return JSON.stringify(prev) !== JSON.stringify(newData)
          ? newData
          : prev;
      });
    } catch (error) {
      console.error("Gagal menarik semua data:", error);
    } finally {
      setLoading(false);
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
    } catch (error) {
      console.error(`Gagal merefresh data ${tab}:`, error);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchAllData(false);
  }, []);

  useEffect(() => {
    setSearch("");
    setFilters({});
    setSortConfig({ key: "id", direction: "asc" });
  }, [tab]);

  const handleAddNewRow = () => {
    const maxId =
      data.length > 0 ? Math.max(...data.map((d) => parseInt(d.id) || 0)) : 0;

    // Inisialisasi baris baru dengan cerdas berdasarkan tipe kolom
    const newRow = { id: maxId + 1, isNew: true };

    currentConfig.columns.forEach((col) => {
      if (col.key !== "id") {
        // Jika kolom adalah angka, isi dengan 0, jika tidak string kosong
        newRow[col.key] = col.isNumber ? 0 : "";
      }
    });

    if (tab === "siswa") newRow.role = "siswa";
    if (tab === "jadwal") {
      newRow.status = "Draft";
      newRow.acak_soal = "ACAK"; // Bawaan otomatis tersetting acak saat baris baru dibuat
      newRow.durasi_menit = 90; // Default durasi agar tidak kosong
      newRow.tanggal = new Date().toISOString().split("T")[0]; // Default tanggal hari ini
    }

    setAllData((prev) => ({
      ...prev,
      [tab]: [...prev[tab], newRow],
    }));
  };

  const handleSaveCell = async (originalId, key, newValue) => {
    const item = data.find((d) => d.id === originalId);
    if (!item) return;

    let parsedValue = newValue;
    const column = currentConfig.columns.find((c) => c.key === key);

    // 1. Parsing Angka secara ketat (Mencegah string kosong masuk ke kolom angka)
    if (column?.isNumber || key === "id") {
      parsedValue =
        key === "id" ? parseInt(newValue) || 0 : parseFloat(newValue) || 0;
    }

    // 2. Validasi Duplikat ID
    if (key === "id" && parsedValue !== originalId) {
      const isDuplicate = data.some((d) => d.id === parsedValue);
      if (isDuplicate) {
        return showAlert(
          "warning",
          "ID Duplikat",
          `ID #${parsedValue} sudah digunakan.`,
        );
      }
    }

    const updatedItem = { ...item, [key]: parsedValue };

    // 3. Update State Lokal (Optimistic UI)
    setAllData((prev) => ({
      ...prev,
      [tab]: prev[tab].map((d) => (d.id === originalId ? updatedItem : d)),
    }));

    setIsSyncing(true);
    try {
      // 4. Bersihkan payload dari properti internal (isNew)
      const payload = { ...updatedItem };
      delete payload.isNew;

      // Pastikan kolom angka lainnya di payload tidak berupa string kosong
      currentConfig.columns.forEach((col) => {
        if (col.isNumber && typeof payload[col.key] === "string") {
          payload[col.key] = parseFloat(payload[col.key]) || 0;
        }
      });

      if (item.isNew) {
        await api.create(currentConfig.sheet, payload);
        // Setelah sukses create, hilangkan tanda isNew
        setAllData((prev) => ({
          ...prev,
          [tab]: prev[tab].map((d) =>
            d.id === updatedItem.id ? { ...payload } : d,
          ),
        }));
      } else {
        // Gunakan originalId untuk mencari data, kirim payload untuk update
        await api.update(currentConfig.sheet, originalId, payload);
      }
    } catch (error) {
      console.error("Autosave Error:", error);
      refreshCurrentTab(true); // Rollback data dari server jika gagal
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

  const antiCheatSetting = allData.settings.find(
    (item) => item.kunci === "Mode_Ujian",
  );
  const isAntiCheatOn = antiCheatSetting
    ? antiCheatSetting.nilai !== "OFF"
    : true;
  const handleToggleAntiCheat = async () => {
    showAlert(
      "confirm",
      "Ubah Mode Ujian?",
      `Yakin ingin ${isAntiCheatOn ? "MEMATIKAN" : "MENGHIDUPKAN"} fitur Mode Ujian?`,
      async () => {
        closeAlert();
        setIsSyncing(true);
        try {
          if (antiCheatSetting)
            await api.update("Settings", antiCheatSetting.id, {
              ...antiCheatSetting,
              nilai: isAntiCheatOn ? "OFF" : "ON",
            });
          else
            await api.create("Settings", {
              id: (Math.max(...allData.settings.map((s) => s.id)) || 0) + 1,
              kunci: "Mode_Ujian",
              nilai: "OFF",
            });
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

  const appOnlySetting = allData.settings.find(
    (item) => item.kunci === "Mode_Aplikasi",
  );
  const isAppOnlyOn = appOnlySetting ? appOnlySetting.nilai === "ON" : false;
  const handleToggleAppOnly = async () => {
    showAlert(
      "confirm",
      "Ubah Mode Akses?",
      `Yakin ingin ${isAppOnlyOn ? "MEMATIKAN" : "MENGHIDUPKAN"} fitur Akses Khusus Aplikasi?`,
      async () => {
        closeAlert();
        setIsSyncing(true);
        try {
          if (appOnlySetting)
            await api.update("Settings", appOnlySetting.id, {
              ...appOnlySetting,
              nilai: isAppOnlyOn ? "OFF" : "ON",
            });
          else
            await api.create("Settings", {
              id: (Math.max(...allData.settings.map((s) => s.id)) || 0) + 1,
              kunci: "Mode_Aplikasi",
              nilai: "ON",
            });
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
  // FITUR: Toggle Hapus Semua Soal
  const deleteAllSetting = allData.settings.find(
    (item) => item.kunci === "Hapus_Semua_Soal",
  );
  const isDeleteAllOn = deleteAllSetting
    ? deleteAllSetting.nilai !== "OFF"
    : true;
  const handleToggleDeleteAll = async () => {
    showAlert(
      "confirm",
      "Ubah Izin Hapus Soal?",
      `Yakin ingin ${isDeleteAllOn ? "MEMATIKAN" : "MENGHIDUPKAN"} izin guru untuk menghapus semua soal sekaligus?`,
      async () => {
        closeAlert();
        setIsSyncing(true);
        try {
          if (deleteAllSetting)
            await api.update("Settings", deleteAllSetting.id, {
              ...deleteAllSetting,
              nilai: isDeleteAllOn ? "OFF" : "ON",
            });
          else
            await api.create("Settings", {
              id: (Math.max(...allData.settings.map((s) => s.id)) || 0) + 1,
              kunci: "Hapus_Semua_Soal",
              nilai: "OFF",
            });
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

  return (
    <Dashboard menu={MENU_ITEMS} active={tab} setActive={setTab}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
      {/* BISA SCROLL */}
      <div className="space-y-6 max-w-7xl mx-auto pb-24 relative">
        {/* BAGIAN ATAS MOBILE */}
        <div className="md:hidden flex flex-col gap-4 px-2 pt-2">
          {/* Header Mobile */}
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

          {/* Menus Mobile */}
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

          {/* Aksi Mobile */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => (window.location.href = "/ujian-dashboard")}
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
              <div className="flex gap-2">
                <button
                  onClick={handleToggleAntiCheat}
                  className={`flex-1 py-3 px-2 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all text-[10px] border ${isAntiCheatOn ? "bg-red-50 text-red-600 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}
                >
                  <ShieldCheck size={16} />{" "}
                  <span className="text-center leading-tight">
                    {isAntiCheatOn
                      ? "Matikan Mode Ujian"
                      : "Hidupkan Mode Ujian"}
                  </span>
                </button>
                <button
                  onClick={handleToggleAppOnly}
                  className={`flex-1 py-3 px-2 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all text-[10px] border ${isAppOnlyOn ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}
                >
                  {isAppOnlyOn ? <Unlock size={16} /> : <Lock size={16} />}{" "}
                  <span className="text-center leading-tight">
                    {isAppOnlyOn ? "Buka Akses Web" : "Kunci APK Saja"}
                  </span>
                </button>
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

        {/* ============================================================== */}
        {/* LIST DATA MOBILE (FLEX-1, SCROLLABLE) */}
        {/* ============================================================== */}
        <div className="md:hidden flex flex-col flex-1 min-h-0 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm overflow-hidden mx-2 mb-2">
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
            {loading && data.length === 0 ? (
              <div className="py-16 text-center">
                <RefreshCw
                  className="animate-spin mx-auto text-emerald-500 mb-3"
                  size={28}
                />
                <span className="font-bold text-slate-400 text-xs">
                  Memuat Data...
                </span>
              </div>
            ) : processedData.length === 0 ? (
              <div className="py-16 text-center text-slate-400 font-medium text-sm">
                Belum ada data.
              </div>
            ) : (
              processedData.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 transition-colors flex flex-col gap-2 ${item.isNew ? "bg-amber-50" : "hover:bg-slate-50"}`}
                >
                  <div className="flex justify-between items-start gap-3 border-b border-slate-100 pb-3 mb-1">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                          ID:
                        </span>
                        <EditableCell
                          item={item}
                          column={currentConfig.columns[0]}
                          onSave={handleSaveCell}
                        />
                      </div>
                      <div className="font-black text-slate-800 text-sm mt-1">
                        <EditableCell
                          item={item}
                          column={currentConfig.columns[1]}
                          onSave={handleSaveCell}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => confirmDelete(item.id)}
                      className="p-2.5 text-red-500 bg-red-50 rounded-xl border border-red-100 hover:bg-red-500 hover:text-white transition-colors shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-2.5 text-xs">
                    {currentConfig.columns.slice(2).map((col) => (
                      <div
                        key={col.key}
                        className="flex flex-col gap-1 bg-slate-50/50 p-2 rounded-lg border border-slate-100"
                      >
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          {col.label}
                        </span>
                        <div className="font-semibold text-slate-700">
                          <EditableCell
                            item={item}
                            column={
                              // Logika integrasi: Jika sedang di tab jadwal dan kolomnya mapel, tarik data dari allData.mapel
                              col.key === "mapel" && tab === "jadwal"
                                ? {
                                    ...col,
                                    options: [
                                      ...new Set(
                                        allData.mapel
                                          .map((m) => m.nama_mapel)
                                          .filter(Boolean),
                                      ),
                                    ],
                                  }
                                : col.isCombobox
                                  ? {
                                      ...col,
                                      options: [
                                        ...new Set([
                                          ...col.options,
                                          ...getFilterOptions(col.key),
                                        ]),
                                      ],
                                    }
                                  : col
                            }
                            onSave={handleSaveCell}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* BAGIAN ATAS DESKTOP (SHRINK-0) */}
        {/* ============================================================== */}
        <header className="hidden md:flex shrink-0 relative flex-col md:flex-row justify-between items-start md:items-center p-6 md:p-8 rounded-[2rem] shadow-sm border border-emerald-100/50 gap-4 overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-100 z-0">
          <div className="absolute -top-20 -left-10 w-72 h-72 bg-white/40 rounded-full -z-10 blur-xl"></div>
          <div className="absolute -bottom-20 right-10 w-80 h-80 bg-emerald-200/30 rounded-full -z-10 blur-xl"></div>

          <div className="flex items-center gap-4 z-10">
            <div className="p-4 bg-white/80 text-emerald-600 rounded-2xl shadow-sm border border-white/60">
              <Settings size={28} className={isSyncing ? "animate-spin" : ""} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight drop-shadow-sm">
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
          <div className="w-full md:w-auto flex flex-col md:flex-row gap-3 z-10">
            {tab === "settings" && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 w-full">
                <button
                  onClick={handleToggleAntiCheat}
                  className={`w-full px-4 py-3 rounded-2xl font-bold shadow-md flex items-center justify-center gap-2 transition-all text-sm border ${isAntiCheatOn ? "bg-red-50 text-red-600 border-red-200" : "bg-blue-600 text-white border-blue-400"}`}
                >
                  <ShieldCheck size={18} />{" "}
                  {isAntiCheatOn ? "Matikan Anti-Cheat" : "Hidupkan Anti-Cheat"}
                </button>
                <button
                  onClick={handleToggleAppOnly}
                  className={`w-full px-4 py-3 rounded-2xl font-bold shadow-md flex items-center justify-center gap-2 transition-all text-sm border ${isAppOnlyOn ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-slate-800 text-white border-slate-700"}`}
                >
                  {isAppOnlyOn ? <Unlock size={18} /> : <Lock size={18} />}{" "}
                  {isAppOnlyOn ? "Buka Akses Browser" : "Kunci Aplikasi"}
                </button>
                <button
                  onClick={handleToggleDeleteAll}
                  className={`w-full px-4 py-3 rounded-2xl font-bold shadow-md flex items-center justify-center gap-2 transition-all text-sm border ${!isDeleteAllOn ? "bg-slate-100 text-slate-500 border-slate-300" : "bg-rose-50 text-rose-600 border-rose-200"}`}
                >
                  <Trash2 size={18} />{" "}
                  {isDeleteAllOn ? "Kunci Tombol Hapus" : "Buka Tombol Hapus"}
                </button>
              </div>
            )}
            {/* TOMBOL PINTU MASUK KELAS VIRTUAL ADMIN */}
            <button
              onClick={() => (window.location.href = "/ujian-dashboard")}
              className="w-full md:w-auto bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all text-sm border border-indigo-400 z-10"
            >
              <MonitorSmartphone size={20} className="animate-pulse" /> Live
              Ujian
            </button>
            <button
              onClick={handleAddNewRow}
              className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all text-sm border border-emerald-400 z-10"
            >
              <Plus size={20} /> Tambah Data Baru
            </button>
          </div>
        </header>

        {/* Toolbar & Stats Desktop (Shrink-0) */}
        <div className="hidden md:flex shrink-0 flex-col xl:flex-row gap-4">
          <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-xl min-w-[200px] shrink-0 rounded-[2rem] relative overflow-hidden flex flex-col justify-center">
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

          <Card className="flex-1 p-3 bg-white border border-slate-200 shadow-sm w-full rounded-[2rem] box-border flex flex-col justify-center">
            <div className="flex flex-col md:flex-row items-center gap-3 w-full px-2">
              <div className="flex items-center gap-2 w-full md:flex-1 md:border-r border-slate-200 pr-4">
                <Search className="text-slate-400 shrink-0" size={20} />
                <input
                  className="w-full bg-transparent border-none outline-none font-medium text-base text-slate-700 py-2"
                  placeholder="Ketik pencarian..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap items-center gap-3 w-full md:w-auto min-w-0">
                  {currentConfig.columns
                    .filter((c) => c.filterable)
                    .map((col) => (
                      <div key={col.key} className="w-full md:w-40">
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

              <button
                onClick={() => refreshCurrentTab(false)}
                className="flex justify-center items-center gap-2 p-3.5 text-slate-500 bg-slate-50 border border-slate-200 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 rounded-xl transition-all shadow-sm"
              >
                <RefreshCw
                  size={18}
                  className={loading || isSyncing ? "animate-spin" : ""}
                />
              </button>
            </div>
          </Card>
        </div>

        {/* ========================================================= */}
        {/* TAMPILAN TABEL INLINE EDIT (DESKTOP - FLEX 1 SCROLLABLE) */}
        {/* ========================================================= */}
        <Card className="hidden md:flex flex-col flex-1 min-h-0 border border-slate-200 shadow-xl shadow-slate-200/40 bg-white rounded-[2rem] overflow-hidden relative">
          <div className="flex-1 overflow-auto w-full relative custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap border-collapse min-w-max">
              <thead className="sticky top-0 z-20 shadow-sm">
                <tr>
                  {currentConfig.columns.map((col, index) => {
                    const isID = index === 0;
                    const isName = index === 1;
                    const stickyStyle = isID
                      ? { position: "sticky", left: 0, zIndex: 30 }
                      : isName
                        ? { position: "sticky", left: "80px", zIndex: 30 }
                        : {};

                    return (
                      <th
                        key={col.key}
                        style={stickyStyle}
                        onClick={() => col.sortable && handleSort(col.key)}
                        className={`px-6 py-5 bg-slate-50 border-b-2 border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider ${col.sortable ? "cursor-pointer hover:bg-slate-100" : ""} ${isID ? "border-r w-[80px]" : ""} ${isName ? "border-r shadow-[4px_0_10px_-4px_rgba(0,0,0,0.1)] w-[240px]" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              sortConfig.key === col.key
                                ? "text-emerald-700 font-black"
                                : ""
                            }
                          >
                            {col.label}
                          </span>
                          {col.sortable && (
                            <div className="flex items-center">
                              {sortConfig.key === col.key ? (
                                sortConfig.direction === "asc" ? (
                                  <ChevronUp
                                    size={14}
                                    className="text-emerald-600 font-black"
                                  />
                                ) : (
                                  <ChevronDown
                                    size={14}
                                    className="text-emerald-600 font-black"
                                  />
                                )
                              ) : (
                                <ArrowUpDown
                                  size={12}
                                  className="text-slate-400"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </th>
                    );
                  })}
                  <th className="px-6 py-5 text-center bg-slate-50 border-b-2 border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider w-[80px]">
                    Hapus
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={currentConfig.columns.length + 1}
                      className="py-20 text-center text-slate-400 font-bold text-sm bg-white"
                    >
                      <RefreshCw
                        className="animate-spin mx-auto text-emerald-500 mb-4"
                        size={32}
                      />
                      Memuat Data...
                    </td>
                  </tr>
                ) : processedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={currentConfig.columns.length + 1}
                      className="py-20 text-center text-slate-400 font-semibold text-base bg-white"
                    >
                      Belum ada data. Klik "Tambah Data Baru".
                    </td>
                  </tr>
                ) : (
                  processedData.map((item) => (
                    <tr
                      key={item.id}
                      className={`transition-colors group ${item.isNew ? "bg-amber-50 hover:bg-amber-100" : "bg-white hover:bg-slate-50"}`}
                    >
                      {currentConfig.columns.map((col, index) => {
                        const isID = index === 0;
                        const isName = index === 1;
                        const stickyStyle = isID
                          ? { position: "sticky", left: 0, zIndex: 10 }
                          : isName
                            ? { position: "sticky", left: "80px", zIndex: 10 }
                            : {};

                        return (
                          <td
                            key={col.key}
                            style={stickyStyle}
                            className={`px-4 py-3 font-semibold text-slate-700 ${isID ? "border-r border-slate-100 bg-inherit" : ""} ${isName ? "border-r border-slate-100 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.03)] bg-inherit" : ""}`}
                          >
                            <EditableCell
                              item={item}
                              column={
                                // Logika integrasi: Jika sedang di tab jadwal dan kolomnya mapel, tarik data dari allData.mapel
                                col.key === "mapel" && tab === "jadwal"
                                  ? {
                                      ...col,
                                      options: [
                                        ...new Set(
                                          allData.mapel
                                            .map((m) => m.nama_mapel)
                                            .filter(Boolean),
                                        ),
                                      ],
                                    }
                                  : col.isCombobox
                                    ? {
                                        ...col,
                                        options: [
                                          ...new Set([
                                            ...col.options,
                                            ...getFilterOptions(col.key),
                                          ]),
                                        ],
                                      }
                                    : col
                              }
                              onSave={handleSaveCell}
                            />
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center whitespace-nowrap bg-inherit">
                        <button
                          onClick={() => confirmDelete(item.id)}
                          className="p-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                          title="Hapus Baris"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* MODAL CUSTOM ALERT & CONFIRM */}
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

        {/* LACI FILTER & SORT MOBILE */}
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
                  {/* Bagian Urutkan (Sort) */}
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

                  {/* Bagian Filter */}
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
