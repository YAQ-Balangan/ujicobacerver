// src/pages/UjianDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MonitorSmartphone,
  ShieldAlert,
  DoorOpen,
  Laptop,
  RefreshCw,
  Map,
  Settings as SettingsIcon,
  Plus,
  UserPlus,
  Trash2,
  X,
  Search,
  Check,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Skull,
  ZoomIn,
  ZoomOut,
  Maximize,
  Info,
  ArrowLeft,
  Users, // <-- Icon baru untuk Auto-Assign
} from "lucide-react";
import Dashboard from "../components/layout/Dashboard";
import { api, supabase } from "../api/api";

// ==========================================
// 1. KOMPONEN AVATAR CSS CUSTOM
// ==========================================
const CustomAvatar = ({ gender, isDisqualified }) => {
  const isBoy = !String(gender || "")
    .toUpperCase()
    .startsWith("P");

  const renderEyes = () => {
    const eyeTop = isBoy ? "top-[55px]" : "top-[40px]";
    const deadEyeTop = isBoy ? "top-[47px]" : "top-[37px]";

    if (isDisqualified) {
      return (
        <>
          <div
            className={`absolute ${deadEyeTop} left-[13px] text-red-600 font-black text-[13px] leading-none drop-shadow-md z-20`}
          >
            X
          </div>
          <div
            className={`absolute ${deadEyeTop} right-[13px] text-red-600 font-black text-[13px] leading-none drop-shadow-md z-20`}
          >
            X
          </div>
        </>
      );
    }
    return (
      <>
        <div
          className={`absolute w-[8px] h-[8px] bg-[#333] rounded-full ${eyeTop} left-[15px] z-20`}
        ></div>
        <div
          className={`absolute w-[8px] h-[8px] bg-[#333] rounded-full ${eyeTop} right-[15px] z-20`}
        ></div>
      </>
    );
  };

  return (
    <div
      className="relative w-[180px] h-[240px] origin-bottom"
      style={{ transform: "scale(0.28)", marginBottom: "-15px" }}
    >
      {isBoy ? (
        <div className="w-full h-full relative flex flex-col items-center">
          <div
            className={`w-[90px] h-[105px] ${isDisqualified ? "bg-[#ffc2c2]" : "bg-[#ffdbac]"} relative z-10 transition-colors`}
            style={{ borderRadius: "45px 45px 50px 50px" }}
          >
            <div
              className="w-full h-[45px] bg-[#2d3436]"
              style={{ borderRadius: "45px 45px 10px 10px" }}
            ></div>
            {renderEyes()}
          </div>
          <div className="w-[180px] h-[150px] relative z-0 -mt-[5px]">
            <div
              className="w-full h-full bg-white border-2 border-slate-200 relative overflow-hidden flex flex-col items-center"
              style={{ borderRadius: "40px 40px 0 0" }}
            >
              <div
                className="w-[50px] h-[20px] bg-[#f0f0f0]"
                style={{ clipPath: "polygon(0 0, 100% 0, 85% 100%, 15% 100%)" }}
              ></div>
              <div
                className="w-[22px] h-[110px] bg-[#1e272e] -mt-[5px]"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)",
                }}
              ></div>
              <div className="w-[35px] h-[40px] border-2 border-slate-100 absolute top-[40px] right-[30px] rounded-sm"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full relative flex flex-col items-center">
          <div
            className="w-[110px] h-[140px] bg-white relative z-10 shadow-sm border border-slate-100"
            style={{ borderRadius: "55px 55px 40px 40px" }}
          >
            <div
              className={`w-[70px] h-[90px] ${isDisqualified ? "bg-[#ffc2c2]" : "bg-[#ffdbac]"} absolute top-[25px] left-[20px] transition-colors`}
              style={{ borderRadius: "35px" }}
            >
              {renderEyes()}
            </div>
          </div>
          <div className="w-[180px] h-[150px] relative z-0 -mt-[25px]">
            <div
              className="w-full h-full bg-white border-2 border-slate-200 relative overflow-hidden"
              style={{ borderRadius: "40px 40px 0 0" }}
            >
              <div
                className="w-full h-[80px] bg-white shadow-[0_5px_15px_rgba(0,0,0,0.1)]"
                style={{ borderRadius: "0 0 80px 80px" }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// HELPER: Menghitung total soal AKURAT
const getExactTotalSoal = (mapelJadwal, userKelasRaw, allSoal) => {
  const mapelUpper = String(mapelJadwal).toUpperCase();
  const userKelasFull = String(userKelasRaw || "")
    .toUpperCase()
    .trim();
  const userParts = userKelasFull.split(" ");
  const userTingkat = userParts[0] || "";
  const userJurusan = userParts[1] || "";
  const userTingkatJurusan = `${userTingkat} ${userJurusan}`.trim();

  return allSoal.filter((s) => {
    const soalMapel = String(s.mapel || s.Mapel || "").toUpperCase();
    if (soalMapel !== mapelUpper) return false;

    const soalKelasRaw = String(s.kelas || s.Kelas || "").toUpperCase();
    if (soalKelasRaw === "" || soalKelasRaw.includes("SEMUA")) return true;

    const targetArray = soalKelasRaw.split(",").map((t) => t.trim());
    return targetArray.some(
      (target) =>
        target === userKelasFull ||
        target === userTingkatJurusan ||
        target === userJurusan ||
        target === userTingkat,
    );
  }).length;
};

// ==========================================
// KOMPONEN UTAMA DASHBOARD
// ==========================================
const UjianDashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("live");
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("IDLE");

  // STATE LAYOUT & AUTO-SCALE
  const containerRef = useRef(null);
  const hasInitializedScale = useRef(false);
  const [boardScale, setBoardScale] = useState(1.15);
  const [autoScale, setAutoScale] = useState(1);
  const [isDesktop, setIsDesktop] = useState(true);

  // STATE CUSTOM ALERT PREMIUM
  const [customAlert, setCustomAlert] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    inputValue: "",
    onConfirm: null,
  });

  const [studentsData, setStudentsData] = useState([]);
  const [dbUsers, setDbUsers] = useState([]);

  // REF: Mengamankan Data Statis (Anti Jebol Server)
  const baseDataRef = useRef({ users: [], soal: [], jadwalMap: {} });

  const [layoutConfig, setLayoutConfig] = useState({});
  const [configId, setConfigId] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeRoom, setActiveRoom] = useState("");

  const [selectedDesk, setSelectedDesk] = useState(null);
  const [isModalSiswaOpen, setIsModalSiswaOpen] = useState(false);
  const [searchSiswa, setSearchSiswa] = useState("");

  const normalizeText = (text) => {
    if (!text) return "";
    return String(text).trim().toLowerCase().replace(/\s+/g, " ");
  };

  const showAlert = (
    type,
    title,
    message,
    onConfirm = null,
    defaultValue = "",
  ) => {
    setCustomAlert({
      isOpen: true,
      type,
      title,
      message,
      inputValue: defaultValue,
      onConfirm,
    });
  };
  const closeAlert = () => setCustomAlert({ ...customAlert, isOpen: false });

  // HANDLER ZOOM (Desktop)
  const handleZoomIn = () =>
    setBoardScale((prev) => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () =>
    setBoardScale((prev) => Math.max(prev - 0.15, 0.3));
  const handleResetZoom = () => setBoardScale(autoScale);

  const activeRoomConf = layoutConfig[activeRoom] || {
    cols: 5,
    rows: 5,
    door: "Kiri",
    assignments: {},
  };
  const cols = Math.max(1, parseInt(activeRoomConf.cols) || 5);
  const rows = Math.max(1, parseInt(activeRoomConf.rows) || 5);
  const boardWidth = cols * 130 + (cols - 1) * 24;
  const boardHeight = rows * 140 + (rows - 1) * 24 + 160;

  // =================================================================================
  // FASE 1: FETCH DATA STATIS (Hanya 1 Kali)
  // =================================================================================
  const fetchBaseData = async () => {
    try {
      const [resSettings, resUsers, resJadwal, resSoal] = await Promise.all([
        api.read("Settings").catch(() => []),
        api.read("Users").catch(() => []),
        api.read("Jadwal").catch(() => []),
        api.read("Soal").catch(() => []),
      ]);

      const safeUsers = (resUsers || []).map((u) => ({
        nama: String(
          u.nama || u.Nama || u.username || u.Username || "Tanpa Nama",
        ),
        username: String(u.username || u.Username || ""),
        kelas: String(u.kelas || u.Kelas || ""),
        gender: String(
          u.gender || u.Gender || u.jenis_kelamin || u.Jenis_Kelamin || "",
        )
          .toUpperCase()
          .startsWith("P")
          ? "P"
          : "L",
        role: String(u.role || u.Role || "").toLowerCase(),
      }));

      let siswaOnly = safeUsers.filter(
        (u) => u.role === "siswa" || u.role === "murid",
      );
      if (siswaOnly.length === 0 && safeUsers.length > 0) siswaOnly = safeUsers;
      setDbUsers(siswaOnly);

      const jadwalMap = {};
      if (resJadwal) {
        resJadwal.forEach((jadwal) => {
          jadwalMap[String(jadwal.id)] = String(
            jadwal.mapel || jadwal.Mapel || "Ujian",
          );
        });
      }

      baseDataRef.current = {
        users: siswaOnly,
        soal: resSoal || [],
        jadwalMap,
      };

      const denahSetting = (resSettings || []).find(
        (s) => String(s.kunci || "").toLowerCase() === "denah_kelas",
      );
      if (denahSetting && denahSetting.nilai) {
        setConfigId(denahSetting.id);
        try {
          const parsed = JSON.parse(denahSetting.nilai);
          setLayoutConfig(parsed);
          setActiveRoom((currentRoom) => {
            if (!currentRoom && Object.keys(parsed).length > 0)
              return Object.keys(parsed)[0];
            return currentRoom;
          });
        } catch (e) {}
      }
    } catch (error) {
      console.error("Gagal menarik Base Data", error);
    } finally {
      setIsInitialLoad(false);
    }
  };

  // =================================================================================
  // FASE 2: FETCH LIVE DATA (Ringan, Realtime CCTV)
  // =================================================================================
  const fetchLiveStatus = async () => {
    setIsSyncing(true);
    try {
      const fetchSesi = supabase
        .from("sesi_ujian")
        .select(
          "id_sesi, id_ujian, username_siswa, jawaban_sementara, status, updated_at",
        )
        .gte(
          "updated_at",
          new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        )
        .then(({ data }) => data || [])
        .catch(() => []);

      const fetchNilai = supabase
        .from("Nilai")
        .select(
          "id, id_ujian, username, nama_siswa, mapel, total_soal, status, created_at",
        )
        .gte(
          "created_at",
          new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        )
        .then(({ data }) => data || [])
        .catch(() => []);

      const [resNilai, resSesiUjian] = await Promise.all([
        fetchNilai,
        fetchSesi,
      ]);
      const {
        users: siswaOnly,
        soal: resSoal,
        jadwalMap,
      } = baseDataRef.current;
      const allEvents = [];
      const currentTime = Date.now();

      const safeGetTime = (dateVal) => {
        if (!dateVal) return 0;
        let cleanDate = String(dateVal).replace(" ", "T");
        if (
          !cleanDate.includes("Z") &&
          !cleanDate.includes("+") &&
          !cleanDate.includes("-")
        ) {
          cleanDate += "Z";
        }
        const time = new Date(cleanDate).getTime();
        return isNaN(time) ? 0 : time;
      };

      const finishedExamsSet = new Set();

      (resNilai || []).forEach((nilai) => {
        const nNama = String(nilai.nama_siswa || nilai.Nama_Siswa || "")
          .toLowerCase()
          .trim();
        const nUsername = String(nilai.username || nilai.Username || nNama)
          .toLowerCase()
          .trim();

        const userObj = siswaOnly.find(
          (u) =>
            normalizeText(u.username) === nUsername ||
            normalizeText(u.nama) === nNama,
        );
        const userKey = userObj ? normalizeText(userObj.username) : nUsername;
        const idUjian = String(nilai.id_ujian || "");

        finishedExamsSet.add(`${userKey}_${idUjian}`);

        const statusVal = String(
          nilai.status || nilai.Status || "",
        ).toUpperCase();
        const isDisqualified =
          statusVal.includes("DISKUALIFIKASI") || statusVal.includes("DIS");

        const rawTime =
          nilai.created_at ||
          nilai.Created_at ||
          nilai.Created_At ||
          nilai.updated_at ||
          nilai.waktu ||
          null;
        const dbTime = safeGetTime(rawTime);

        let totalSoal = nilai.total_soal || nilai.Total_Soal;
        if (!totalSoal || totalSoal === "-") {
          const mapel =
            nilai.mapel || nilai.Mapel || jadwalMap[idUjian] || "Ujian";
          totalSoal = getExactTotalSoal(mapel, userObj?.kelas, resSoal || []);
        }

        allEvents.push({
          userKey: userKey,
          type: "DONE",
          timestamp: dbTime,
          sortId: parseInt(nilai.id) || 0,
          data: {
            id: `done-${nilai.id}`,
            username: userObj
              ? userObj.username
              : nilai.username || nilai.nama_siswa,
            id_ujian: idUjian,
            mapel: nilai.mapel || nilai.Mapel || "Ujian",
            nama: userObj ? userObj.nama : nilai.nama_siswa || nilai.Nama_Siswa,
            gender: userObj ? userObj.gender : "L",
            dijawab: totalSoal,
            totalSoal: totalSoal,
            progress: 100,
            status: isDisqualified ? "DISKUALIFIKASI" : "SELESAI",
          },
        });
      });

      (resSesiUjian || []).forEach((sesi) => {
        const usernameSesiNormal = normalizeText(sesi.username_siswa);
        const idUjian = String(sesi.id_ujian);

        if (finishedExamsSet.has(`${usernameSesiNormal}_${idUjian}`)) return;

        const userObj = siswaOnly.find(
          (u) => normalizeText(u.username) === usernameSesiNormal,
        );

        let jawaban = {};
        try {
          if (typeof sesi.jawaban_sementara === "string")
            jawaban = JSON.parse(sesi.jawaban_sementara);
          else if (sesi.jawaban_sementara) jawaban = sesi.jawaban_sementara;
        } catch (e) {}

        const dijawab = Object.keys(jawaban).length;
        const mapel = jadwalMap[idUjian] || "Ujian";
        const totalSoal = getExactTotalSoal(
          mapel,
          userObj?.kelas,
          resSoal || [],
        );

        let percentage =
          totalSoal > 0
            ? Math.min(100, Math.round((dijawab / totalSoal) * 100))
            : 0;
        const parsedTime = safeGetTime(sesi.updated_at || sesi.created_at);
        const eventTime = parsedTime > 0 ? parsedTime : currentTime;

        allEvents.push({
          userKey: usernameSesiNormal,
          type: "LIVE",
          timestamp: eventTime,
          sortId: parseInt(sesi.id_sesi || sesi.id) || 0,
          data: {
            id: `live-${sesi.id_sesi}`,
            username: sesi.username_siswa,
            id_ujian: idUjian,
            mapel: mapel,
            nama: userObj ? userObj.nama : sesi.username_siswa,
            gender: userObj ? userObj.gender : "L",
            dijawab: dijawab,
            totalSoal: totalSoal,
            progress: percentage,
            status: sesi.status === "LOCKED" ? "LOCKED" : "WORKING",
          },
        });
      });

      allEvents.sort((a, b) => {
        if (a.timestamp > 0 && b.timestamp > 0 && a.timestamp !== b.timestamp)
          return b.timestamp - a.timestamp;
        if (a.type !== b.type) return a.type === "LIVE" ? -1 : 1;
        return b.sortId - a.sortId;
      });

      const DONE_TIMEOUT_MS = 15 * 60 * 1000;
      const LIVE_TIMEOUT_MS = 2 * 60 * 60 * 1000;
      const latestEventsMap = {};

      allEvents.forEach((evt) => {
        if (!latestEventsMap[evt.userKey]) {
          const age = Math.abs(currentTime - evt.timestamp);
          const isExpiredDone =
            evt.type === "DONE" && evt.timestamp > 0 && age > DONE_TIMEOUT_MS;
          const isExpiredLive =
            evt.type === "LIVE" && evt.timestamp > 0 && age > LIVE_TIMEOUT_MS;

          if (!isExpiredDone && !isExpiredLive) {
            latestEventsMap[evt.userKey] = evt.data;
          } else {
            latestEventsMap[evt.userKey] = "EXPIRED";
          }
        }
      });

      const liveStudentsList = Object.values(latestEventsMap).filter(
        (data) => data !== "EXPIRED",
      );
      setStudentsData(liveStudentsList);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  useEffect(() => {
    fetchBaseData();
  }, []);

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    const loopFetch = async () => {
      if (activeTab === "live" && isMounted && !isInitialLoad) {
        await fetchLiveStatus();
      }
      if (isMounted) {
        // Diubah menjadi 60 detik (1 menit) untuk meringankan query riwayat ujian
        timeoutId = setTimeout(loopFetch, 60000);
      }
    };
    loopFetch();
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [activeTab, isInitialLoad]);

  // =================================================================================
  // AUTO-SAVE BACKGROUND & FULL SCALE
  // =================================================================================
  useEffect(() => {
    if (isInitialLoad || Object.keys(layoutConfig).length === 0) return;

    setAutoSaveStatus("SAVING");
    const timeoutId = setTimeout(async () => {
      try {
        const payloadString = JSON.stringify(layoutConfig);
        let currentConfigId = configId;

        if (!currentConfigId) {
          const resSettings = await api.read("Settings").catch(() => []);
          const existing = resSettings.find(
            (s) => String(s.kunci).toLowerCase() === "denah_kelas",
          );
          if (existing) {
            currentConfigId = existing.id;
            setConfigId(existing.id);
          } else {
            const maxId =
              resSettings.length > 0
                ? Math.max(...resSettings.map((s) => parseInt(s.id) || 0))
                : 0;
            const newSetting = await api.create("Settings", {
              id: maxId + 1,
              kunci: "Denah_Kelas",
              nilai: payloadString,
            });
            if (newSetting && !newSetting.error) {
              currentConfigId = maxId + 1;
              setConfigId(maxId + 1);
            }
          }
        }

        if (currentConfigId) {
          await api.update("Settings", currentConfigId, {
            kunci: "Denah_Kelas",
            nilai: payloadString,
          });
        }
        setAutoSaveStatus("SAVED");
        setTimeout(() => setAutoSaveStatus("IDLE"), 2000);
      } catch (e) {
        setAutoSaveStatus("IDLE");
      }
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, [layoutConfig, isInitialLoad, configId]);

  useEffect(() => {
    const calculateScale = () => {
      const desktopMode = window.innerWidth > 768;
      setIsDesktop(desktopMode);

      if (containerRef.current) {
        const containerW = containerRef.current.clientWidth;
        const containerH = containerRef.current.clientHeight;
        if (containerW === 0 || containerH === 0) return;

        const contentW = boardWidth + 60;
        const contentH = boardHeight + 120;

        const scaleW = containerW / contentW;
        const scaleH = containerH / contentH;

        if (desktopMode) {
          const fitScale = Math.min(scaleW, scaleH);
          setAutoScale(fitScale);

          if (!hasInitializedScale.current) {
            setBoardScale(1.15);
            hasInitializedScale.current = true;
          }
        } else {
          const fitScale = Math.min(scaleW, 1);
          setAutoScale(fitScale);
          setBoardScale(fitScale);
          hasInitializedScale.current = false;
        }
      }
    };
    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, [boardWidth, boardHeight, activeRoom]);

  // =================================================================================
  // HANDLER APLIKASI
  // =================================================================================
  const handleAddRoom = () => {
    showAlert(
      "prompt",
      "Tambah Lokal Baru",
      "Ketikkan nama ruangan/lokal baru untuk denah ini (Misal: Lokal 1):",
      (val) => {
        const roomName = val.trim();
        if (!roomName) return;
        if (layoutConfig[roomName]) {
          showAlert("danger", "Gagal", `Nama lokal "${roomName}" sudah ada!`);
          return;
        }
        setLayoutConfig((prev) => ({
          ...prev,
          [roomName]: { door: "Kiri", cols: 5, rows: 5, assignments: {} },
        }));
        setActiveRoom(roomName);
        closeAlert();
      },
    );
  };

  const handleDeleteRoom = (roomName) => {
    showAlert(
      "confirm",
      "Hapus Denah?",
      `Apakah Anda yakin ingin menghapus desain denah "${roomName}" secara permanen?`,
      () => {
        const newConf = { ...layoutConfig };
        delete newConf[roomName];
        setLayoutConfig(newConf);
        setActiveRoom(Object.keys(newConf)[0] || "");
        closeAlert();
      },
    );
  };

  const updateGridSize = (type, action) => {
    setLayoutConfig((prev) => {
      const current = prev[activeRoom];
      let newVal = parseInt(current[type]) || 1;
      if (action === "PLUS") newVal += 1;
      if (action === "MINUS" && newVal > 1) newVal -= 1;
      return { ...prev, [activeRoom]: { ...current, [type]: newVal } };
    });
  };

  const handleUpdateDoor = (pos) => {
    setLayoutConfig((prev) => ({
      ...prev,
      [activeRoom]: { ...prev[activeRoom], door: pos },
    }));
  };

  const handleAssignStudent = (siswa) => {
    if (!activeRoom || selectedDesk === null) return;

    setLayoutConfig((prev) => {
      const newConfig = JSON.parse(JSON.stringify(prev));

      // Hapus siswa ini dari kursi lain (mencegah duplikasi)
      Object.keys(newConfig).forEach((roomKey) => {
        const assignments = newConfig[roomKey].assignments;
        Object.keys(assignments).forEach((deskKey) => {
          if (assignments[deskKey].username === siswa.username) {
            delete assignments[deskKey];
          }
        });
      });

      if (!newConfig[activeRoom].assignments)
        newConfig[activeRoom].assignments = {};
      newConfig[activeRoom].assignments[selectedDesk] = {
        nama: siswa.nama,
        username: siswa.username,
        gender: siswa.gender || "L",
      };

      return newConfig;
    });

    setIsModalSiswaOpen(false);
  };

  // FITUR BARU: AUTO ASSIGN BY CLASS
  const handleAutoAssignByClass = (targetKelas) => {
    if (!targetKelas || !activeRoom) return;

    const kelasNormalized = targetKelas.trim().toLowerCase();

    // Cari semua siswa yang memiliki kata kunci kelas tersebut
    const targetStudents = dbUsers.filter((u) =>
      String(u.kelas || "")
        .toLowerCase()
        .includes(kelasNormalized),
    );

    if (targetStudents.length === 0) {
      showAlert(
        "warning",
        "Tidak Ditemukan",
        `Sistem tidak menemukan satupun siswa di kelas "${targetKelas}". Pastikan penulisan sudah benar.`,
      );
      return;
    }

    setLayoutConfig((prev) => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      const roomConf = newConfig[activeRoom];
      if (!roomConf.assignments) roomConf.assignments = {};

      const currentCols = parseInt(roomConf.cols) || 5;
      const currentRows = parseInt(roomConf.rows) || 5;
      const totalDesks = currentCols * currentRows;

      let currentDesk = 1;
      let assignedCount = 0;

      targetStudents.forEach((siswa) => {
        // Hapus siswa ini dari ruangan manapun untuk dipindah ke sini
        Object.keys(newConfig).forEach((rKey) => {
          const assignMap = newConfig[rKey].assignments;
          Object.keys(assignMap).forEach((dKey) => {
            if (assignMap[dKey].username === siswa.username) {
              delete assignMap[dKey];
            }
          });
        });

        // Cari bangku kosong di ruangan aktif
        while (currentDesk <= totalDesks && roomConf.assignments[currentDesk]) {
          currentDesk++;
        }

        // Jika bangku kosong tersedia, duduk-kan siswa
        if (currentDesk <= totalDesks) {
          roomConf.assignments[currentDesk] = {
            nama: siswa.nama,
            username: siswa.username,
            gender: siswa.gender || "L",
          };
          assignedCount++;
        }
      });

      // Tampilkan notifikasi hasil menggunakan trik setTimeout agar tidak bentrok dengan state
      setTimeout(() => {
        if (assignedCount < targetStudents.length) {
          showAlert(
            "warning",
            "Meja Tidak Cukup",
            `Berhasil memasukkan ${assignedCount} siswa, tapi ${targetStudents.length - assignedCount} siswa tidak kebagian bangku. Silakan tambah baris/kolom pada denah ini atau buat lokal baru.`,
          );
        } else {
          showAlert(
            "success",
            "Berhasil Tersusun!",
            `Sebanyak ${assignedCount} siswa kelas ${targetKelas} berhasil dimasukkan otomatis ke denah ini.`,
          );
        }
      }, 300);

      return newConfig;
    });

    closeAlert();
  };

  const handleRemoveStudent = (deskIndex) => {
    setLayoutConfig((prev) => {
      const newAssignments = { ...prev[activeRoom].assignments };
      delete newAssignments[deskIndex];
      return {
        ...prev,
        [activeRoom]: { ...prev[activeRoom], assignments: newAssignments },
      };
    });
  };

  const handleUnlockStudent = async (username, examId) => {
    try {
      await api.updateSesiStatus(username, examId, "ACTIVE", 1);
      setStudentsData((prev) =>
        prev.map((s) =>
          s.username === username ? { ...s, status: "WORKING" } : s,
        ),
      );
      showAlert(
        "success",
        "Kunci Terbuka",
        `Akses ujian untuk siswa bersangkutan berhasil dipulihkan.`,
      );
    } catch (err) {
      showAlert(
        "danger",
        "Gagal Membuka Kunci",
        "Pastikan koneksi internet Anda stabil.",
      );
    }
  };

  const lockedStudents = studentsData.filter((s) => s.status === "LOCKED");

  // =================================================================================
  // RENDER UI DENAH / KELAS
  // =================================================================================
  const renderClassroom = () => {
    if (!activeRoom || !layoutConfig[activeRoom]) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 font-bold gap-4 bg-slate-100 rounded-[2rem] border-4 border-slate-200">
          <Map size={64} className="opacity-30" />
          <p>Belum ada denah ruangan yang dibuat.</p>
        </div>
      );
    }

    const doorPos = activeRoomConf.door || "Kiri";
    const assignments = activeRoomConf.assignments || {};
    const totalDesks = cols * rows;

    const doorX = doorPos === "Kiri" ? 50 : boardWidth - 50;
    const doorY = 80;
    const teacherX = boardWidth / 2;
    const teacherY = 80;

    return (
      <div className="flex-1 relative rounded-[2rem] overflow-hidden border-4 border-slate-200 bg-slate-100 shadow-inner min-h-0">
        {isDesktop && (
          <div className="absolute top-6 right-6 z-[200] flex flex-col gap-2 bg-white/90 backdrop-blur-md p-2 rounded-[1.2rem] shadow-xl border border-slate-200">
            <button
              onClick={handleZoomIn}
              className="p-3 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-xl transition-all shadow-sm"
              title="Perbesar (Zoom In)"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-3 bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 rounded-xl transition-all shadow-sm"
              title="Fit Layar (Tampilkan Semua Meja Tanpa Scroll)"
            >
              <Maximize size={20} />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-3 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition-all shadow-sm"
              title="Perkecil (Zoom Out)"
            >
              <ZoomOut size={20} />
            </button>
          </div>
        )}

        <div
          ref={containerRef}
          className="w-full h-full flex bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] overflow-auto custom-scrollbar items-start justify-center relative"
        >
          <div
            className="flex justify-center transition-all duration-300 mt-6 md:mt-10 mb-20"
            style={{
              width: `${boardWidth * boardScale}px`,
              height: isDesktop ? `${boardHeight * boardScale}px` : "auto",
            }}
          >
            <div
              className={`flex flex-col relative transition-transform duration-300 origin-top`}
              style={{
                width: `${boardWidth}px`,
                height: `${boardHeight}px`,
                transform: `scale(${boardScale})`,
              }}
            >
              <div
                className={`w-full flex items-start mb-12 relative z-10 ${doorPos === "Kanan" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`w-24 h-28 bg-white/80 rounded-2xl border-4 border-slate-300 flex flex-col items-center justify-center p-2 z-10 shadow-sm absolute top-0 ${doorPos === "Kanan" ? "right-0" : "left-0"}`}
                >
                  <DoorOpen size={36} className="text-slate-400 mb-1" />
                  <span className="text-[10px] font-black text-slate-500 uppercase text-center">
                    Pintu Masuk
                  </span>
                </div>
                <div className="relative w-72 h-24 bg-slate-800 rounded-b-2xl rounded-t-lg shadow-2xl flex flex-col items-center justify-center border-b-8 border-slate-900 z-20 mx-auto">
                  <Laptop size={28} className="text-slate-400 mb-2" />
                  <span className="text-xs font-black text-white uppercase tracking-widest">
                    Meja Pengawas
                  </span>
                </div>
              </div>

              <div
                className="relative z-10 grid gap-6 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${cols}, 130px)`,
                  gridTemplateRows: `repeat(${rows}, 140px)`,
                }}
              >
                {Array.from({ length: totalDesks }, (_, i) => i + 1).map(
                  (deskNo) => {
                    const assignedData = assignments[deskNo];
                    const isSitting = !!assignedData;
                    let liveStudent = null;

                    const colIndex = (deskNo - 1) % cols;
                    const rowIndex = Math.floor((deskNo - 1) / cols);
                    const deskCenterX = colIndex * 154 + 65;
                    const deskCenterY = rowIndex * 164 + 70 + 144;

                    const offsetDoorX = doorX - deskCenterX;
                    const offsetDoorY = doorY - deskCenterY;
                    const offsetTeacherX = teacherX - deskCenterX;
                    const offsetTeacherY = teacherY - deskCenterY;

                    if (activeTab === "live" && isSitting) {
                      const assignedUsernameNormal = normalizeText(
                        assignedData.username,
                      );
                      const assignedNamaNormal = normalizeText(
                        assignedData.nama,
                      );
                      liveStudent = studentsData.find((s) => {
                        if (assignedData.username)
                          return (
                            normalizeText(s.username) === assignedUsernameNormal
                          );
                        return normalizeText(s.nama) === assignedNamaNormal;
                      });
                    }

                    let deskClass = "bg-amber-100 border-amber-300 shadow-sm";
                    let deskStatus = "KOSONG";
                    let progressText = "";
                    let progressPercent = 0;
                    let mapelText = "";

                    const isFinished = liveStudent?.status === "SELESAI";
                    const isDisqualified =
                      liveStudent?.status === "DISKUALIFIKASI";
                    const isOffline = activeTab === "live" && !liveStudent;

                    if (activeTab === "builder" && isSitting) {
                      deskClass = "bg-[#8b5a2b] border-[#5c3a21] shadow-lg";
                      deskStatus = "TERISI";
                    } else if (activeTab === "live" && isSitting) {
                      if (liveStudent) {
                        progressPercent = liveStudent.progress;
                        mapelText = liveStudent.mapel;

                        if (isDisqualified) {
                          deskClass =
                            "bg-red-900 border-black shadow-[0_0_20px_rgba(220,38,38,0.9)] animate-pulse z-20";
                          deskStatus = "ELIMINASI";
                          progressText = "Melanggar Aturan";
                          progressPercent = 100;
                        } else if (liveStudent.status === "LOCKED") {
                          deskClass =
                            "bg-orange-800 border-orange-950 shadow-[0_0_15px_rgba(249,115,22,0.8)] animate-pulse z-20";
                          deskStatus = "TERKUNCI";
                          progressText = `${liveStudent.dijawab}/${liveStudent.totalSoal} Soal`;
                        } else if (isFinished) {
                          deskClass =
                            "bg-emerald-700 border-emerald-900 shadow-md";
                          deskStatus = "SELESAI";
                          progressText = `100% Tuntas`;
                          progressPercent = 100;
                        } else {
                          deskClass = "bg-[#8b5a2b] border-[#5c3a21] shadow-xl";
                          deskStatus = `${progressPercent}%`;
                          progressText = `${liveStudent.dijawab}/${liveStudent.totalSoal} Soal`;
                        }
                      } else {
                        deskClass =
                          "bg-[#8b5a2b] border-[#5c3a21] opacity-70 grayscale";
                        deskStatus = "OFFLINE";
                        progressText = "Belum Mulai";
                        progressPercent = 0;
                      }
                    }

                    const avatarVariants = {
                      hidden: {
                        x: offsetDoorX,
                        y: offsetDoorY,
                        scale: 0.2,
                        opacity: 0,
                      },
                      working: {
                        x: 0,
                        y: 0,
                        scale: 1,
                        opacity: 1,
                        transition: { duration: 2, ease: "easeOut" },
                      },
                      finished: {
                        x: [0, offsetTeacherX, offsetTeacherX, offsetDoorX],
                        y: [0, offsetTeacherY, offsetTeacherY, offsetDoorY],
                        scale: [1, 0.8, 0.8, 0.2],
                        opacity: [1, 1, 1, 0],
                        transition: {
                          duration: 6,
                          times: [0, 0.3333, 0.6666, 1],
                          ease: "easeInOut",
                        },
                      },
                    };

                    return (
                      <div
                        key={deskNo}
                        className="relative w-[130px] h-[140px] group"
                      >
                        <AnimatePresence>
                          {isSitting && activeTab === "live" && liveStudent && (
                            <motion.div
                              variants={avatarVariants}
                              initial="hidden"
                              animate={isFinished ? "finished" : "working"}
                              className="absolute top-0 w-full h-[85px] flex items-end justify-center pt-2 z-[100] pointer-events-none"
                            >
                              <CustomAvatar
                                gender={assignedData.gender}
                                isDisqualified={isDisqualified}
                              />
                            </motion.div>
                          )}
                          {isSitting &&
                            (!liveStudent || activeTab === "builder") && (
                              <div
                                className={`absolute top-0 w-full h-[85px] flex items-end justify-center pt-2 z-[100] pointer-events-none ${isOffline ? "grayscale opacity-60 brightness-75" : ""}`}
                              >
                                <CustomAvatar
                                  gender={assignedData.gender}
                                  isDisqualified={false}
                                />
                              </div>
                            )}
                        </AnimatePresence>

                        <div
                          onClick={() => {
                            if (activeTab === "builder") {
                              setSelectedDesk(deskNo);
                              setIsModalSiswaOpen(true);
                            }
                          }}
                          className={`absolute inset-0 rounded-2xl border-4 transition-all ${deskClass} ${activeTab === "builder" && !assignedData ? "hover:border-[#8b5a2b] hover:bg-amber-100 border-dashed cursor-pointer" : "cursor-pointer"}`}
                        ></div>

                        <div className="absolute bottom-[4px] left-[4px] right-[4px] px-2 z-[110] flex flex-col items-center bg-white pt-1 pb-1.5 border-t-2 border-black/20 rounded-b-[10px] pointer-events-none">
                          {isSitting ? (
                            <>
                              <p className="text-[10px] font-black text-slate-800 truncate w-full text-center leading-tight uppercase">
                                {assignedData.nama}
                              </p>
                              {activeTab === "live" ? (
                                <div className="w-full mt-0.5 flex flex-col gap-1">
                                  {liveStudent && deskStatus !== "OFFLINE" && (
                                    <div className="text-[7.5px] font-black text-indigo-500 truncate w-full text-center bg-indigo-50 rounded-full px-1 py-0.5 border border-indigo-200 leading-none">
                                      {mapelText}
                                    </div>
                                  )}
                                  <div className="flex justify-between items-center text-[8.5px] font-black px-0.5 leading-none mt-0.5">
                                    <span
                                      className={
                                        deskStatus === "TERKUNCI"
                                          ? "text-orange-600"
                                          : deskStatus === "ELIMINASI"
                                            ? "text-red-600"
                                            : deskStatus === "SELESAI"
                                              ? "text-emerald-600"
                                              : deskStatus === "OFFLINE"
                                                ? "text-slate-400"
                                                : "text-indigo-600"
                                      }
                                    >
                                      {deskStatus}
                                    </span>
                                    <span className="text-slate-500 font-bold">
                                      {progressText}
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden shadow-inner">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${deskStatus === "TERKUNCI" ? "bg-orange-500" : deskStatus === "ELIMINASI" ? "bg-red-600" : deskStatus === "SELESAI" ? "bg-emerald-500" : deskStatus === "OFFLINE" ? "bg-transparent" : "bg-indigo-500"}`}
                                      style={{ width: `${progressPercent}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[9px] font-black mt-0.5 tracking-widest text-indigo-600">
                                  TERISI
                                </p>
                              )}
                            </>
                          ) : (
                            <div className="py-1 flex items-center justify-center">
                              <span
                                className={`text-[10px] font-black ${activeTab === "builder" ? "text-amber-700" : "text-slate-400"}`}
                              >
                                MEJA {deskNo}
                              </span>
                            </div>
                          )}
                        </div>

                        {activeTab === "builder" && isSitting && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveStudent(deskNo);
                            }}
                            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-[120] hover:bg-red-600 shadow-lg"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}

                        {activeTab === "live" &&
                          isSitting &&
                          deskStatus === "TERKUNCI" && (
                            <div className="absolute -top-4 -right-4 bg-orange-500 text-white p-1.5 rounded-full shadow-lg z-[120] animate-bounce">
                              <ShieldAlert size={18} />
                            </div>
                          )}
                        {activeTab === "live" &&
                          isSitting &&
                          deskStatus === "ELIMINASI" && (
                            <div className="absolute -top-4 -right-4 bg-red-600 text-white p-1.5 rounded-full shadow-lg z-[120] animate-bounce">
                              <Skull size={18} />
                            </div>
                          )}
                        {activeTab === "live" &&
                          isSitting &&
                          deskStatus === "SELESAI" && (
                            <div className="absolute -top-3 -right-3 bg-emerald-500 text-white p-1 rounded-full shadow-md z-[120]">
                              <CheckCircle2 size={16} />
                            </div>
                          )}
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const menuItems = [
    { id: "live", label: "Kelas Virtual", icon: MonitorSmartphone },
    { id: "builder", label: "Atur Denah", icon: SettingsIcon },
  ];

  return (
    <Dashboard menu={menuItems} active={activeTab} setActive={setActiveTab}>
      <div className="flex flex-col h-[calc(115vh)] max-w-[90rem] mx-auto p-2 md:p-4 font-sans select-none overflow-hidden gap-4 relative">
        <div className="bg-white p-4 md:p-5 rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between shrink-0 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all shadow-sm shrink-0"
              title="Kembali ke halaman sebelumnya"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
                {activeTab === "live" ? (
                  <>
                    <MonitorSmartphone className="text-indigo-600" /> Pemantauan
                    Kelas Virtual
                  </>
                ) : (
                  <>
                    <SettingsIcon className="text-indigo-500" /> Atur Denah
                    Ujian
                  </>
                )}
              </h2>
              <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
                {activeTab === "live"
                  ? "Lihat simulasi ruang kelas dan aktivitas siswa dari sudut pandang pengawas."
                  : "Desain baris, kolom, dan atur posisi duduk siswa."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeTab === "live" && (
              <div
                className="p-2.5 rounded-xl text-slate-400 bg-white border border-slate-200 shadow-sm"
                title="Auto-Sync Berjalan"
              >
                <RefreshCw
                  size={18}
                  className={isSyncing ? "animate-spin text-indigo-500" : ""}
                />
              </div>
            )}
            {activeTab === "builder" && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                {autoSaveStatus === "SAVING" ? (
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                    <RefreshCw size={14} className="animate-spin" />{" "}
                    Menyimpan...
                  </span>
                ) : autoSaveStatus === "SAVED" ? (
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                    <Check size={14} /> Tersimpan
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-400">
                    Auto-Save Aktif
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex overflow-x-auto gap-2 custom-scrollbar shrink-0 pb-1">
          {Object.keys(layoutConfig).map((room) => (
            <button
              key={room}
              onClick={() => setActiveRoom(room)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 border shadow-sm ${activeRoom === room ? "bg-slate-800 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
            >
              <Map size={14} /> {room}
            </button>
          ))}
          {activeTab === "builder" && (
            <button
              onClick={handleAddRoom}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-white text-indigo-600 border-2 border-dashed border-indigo-300 hover:bg-indigo-50 flex items-center gap-2"
            >
              <Plus size={14} /> Tambah Lokal
            </button>
          )}
        </div>

        <AnimatePresence>
          {activeTab === "builder" &&
            activeRoom &&
            layoutConfig[activeRoom] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden shrink-0"
              >
                <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 flex flex-wrap items-end gap-4 shadow-sm">
                  <div className="flex flex-col flex-1 min-w-[120px]">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      Kolom Meja
                    </label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden h-10">
                      <button
                        onClick={() => updateGridSize("cols", "MINUS")}
                        className="px-4 h-full text-slate-500 hover:bg-slate-200 border-r border-slate-200"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="text"
                        readOnly
                        value={layoutConfig[activeRoom].cols}
                        className="w-full h-full text-center font-black text-slate-700 text-sm outline-none bg-transparent"
                      />
                      <button
                        onClick={() => updateGridSize("cols", "PLUS")}
                        className="px-4 h-full text-slate-500 hover:bg-slate-200 border-l border-slate-200"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 min-w-[120px]">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      Baris Meja
                    </label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden h-10">
                      <button
                        onClick={() => updateGridSize("rows", "MINUS")}
                        className="px-4 h-full text-slate-500 hover:bg-slate-200 border-r border-slate-200"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="text"
                        readOnly
                        value={layoutConfig[activeRoom].rows}
                        className="w-full h-full text-center font-black text-slate-700 text-sm outline-none bg-transparent"
                      />
                      <button
                        onClick={() => updateGridSize("rows", "PLUS")}
                        className="px-4 h-full text-slate-500 hover:bg-slate-200 border-l border-slate-200"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 min-w-[140px]">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      Posisi Pintu
                    </label>
                    <select
                      value={layoutConfig[activeRoom].door}
                      onChange={(e) => handleUpdateDoor(e.target.value)}
                      className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 font-bold text-slate-700 text-xs outline-none focus:border-indigo-500"
                    >
                      <option value="Kiri">Depan Kiri</option>
                      <option value="Kanan">Depan Kanan</option>
                    </select>
                  </div>

                  {/* TOMBOL BARU: AUTO ISI KELAS */}
                  <button
                    onClick={() => {
                      showAlert(
                        "prompt",
                        "Auto Isi Siswa Berdasarkan Kelas",
                        "Ketikkan nama kelas (contoh: X IPA atau 12 Agama). Sistem akan mencari siswa dan otomatis memasukkannya ke denah ini.",
                        (val) => handleAutoAssignByClass(val),
                      );
                    }}
                    className="h-10 px-5 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 rounded-xl font-bold text-xs whitespace-nowrap transition-colors"
                  >
                    <Users size={16} />{" "}
                    <span className="hidden sm:inline">Auto Isi Kelas</span>
                  </button>

                  <button
                    onClick={() => handleDeleteRoom(activeRoom)}
                    className="h-10 px-5 flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-xl font-bold text-xs whitespace-nowrap transition-colors"
                  >
                    <Trash2 size={16} />{" "}
                    <span className="hidden sm:inline">Hapus Denah Ini</span>
                  </button>
                </div>
              </motion.div>
            )}
        </AnimatePresence>

        {renderClassroom()}

        <AnimatePresence>
          {activeTab === "live" && lockedStudents.length > 0 && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="absolute right-4 bottom-4 md:right-8 md:bottom-8 z-50 w-80 bg-white rounded-2xl shadow-[0_10px_40px_rgba(249,115,22,0.3)] border-2 border-orange-500 flex flex-col overflow-hidden"
            >
              <div className="bg-orange-500 text-white p-3 flex justify-between items-center">
                <div className="flex items-center gap-2 font-black text-sm">
                  <AlertTriangle size={18} className="animate-pulse" />{" "}
                  PELANGGARAN UJIAN
                </div>
                <span className="bg-white text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold">
                  {lockedStudents.length} Terkunci
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto p-2 bg-orange-50 custom-scrollbar">
                {lockedStudents.map((siswa) => (
                  <div
                    key={siswa.username}
                    className="bg-white p-3 rounded-xl shadow-sm mb-2 last:mb-0 border border-orange-100"
                  >
                    <p className="font-bold text-sm text-slate-800">
                      {siswa.nama}
                    </p>
                    <button
                      onClick={() =>
                        handleUnlockStudent(siswa.username, siswa.id_ujian)
                      }
                      className="mt-2 w-full py-1.5 bg-orange-100 hover:bg-orange-500 hover:text-white text-orange-600 text-xs font-bold rounded-lg transition-colors border border-orange-200 hover:border-orange-500"
                    >
                      Buka Kunci Sekarang
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODAL PILIH SISWA UNTUK KURSI (Manual) */}
      <AnimatePresence>
        {isModalSiswaOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="p-5 border-b flex justify-between items-center bg-indigo-600 text-white shrink-0">
                <div>
                  <h3 className="font-black text-lg">Pilih Siswa</h3>
                  <p className="text-[11px] text-indigo-200 font-bold mt-0.5 uppercase tracking-widest">
                    UNTUK BANGKU NOMOR {selectedDesk}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalSiswaOpen(false)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 shrink-0 bg-slate-50 border-b border-slate-200">
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Ketik nama/username siswa..."
                    className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-sm font-semibold outline-none focus:border-indigo-500"
                    value={searchSiswa}
                    onChange={(e) => setSearchSiswa(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <div className="overflow-y-auto flex-1 p-2 custom-scrollbar bg-white">
                {dbUsers
                  .filter((u) => {
                    const searchName = String(
                      u.nama || u.username || "",
                    ).toLowerCase();
                    return searchName.includes(searchSiswa.toLowerCase());
                  })
                  .map((u, i) => {
                    const namaTampil = u.nama || u.username || "Siswa";
                    const usernameTampil = u.username || namaTampil;
                    const genderSet = String(u.gender)
                      .toUpperCase()
                      .startsWith("P")
                      ? "P"
                      : "L";
                    return (
                      <button
                        key={i}
                        onClick={() =>
                          handleAssignStudent({
                            nama: namaTampil,
                            username: usernameTampil,
                            gender: genderSet,
                          })
                        }
                        className="w-full flex items-center justify-between p-4 hover:bg-indigo-50 border-b border-slate-50 last:border-0 transition-colors text-left group rounded-xl"
                      >
                        <div>
                          <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-700">
                            {namaTampil}{" "}
                            <span className="text-xs font-medium text-slate-400">
                              ({usernameTampil})
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                            Kelas: {u.kelas || "-"} |{" "}
                            {genderSet === "P" ? "Perempuan" : "Laki-laki"}
                          </p>
                        </div>
                        <div className="bg-slate-100 p-2 rounded-lg text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                          <UserPlus size={18} />
                        </div>
                      </button>
                    );
                  })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {customAlert.isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl flex flex-col items-center p-6 md:p-8 text-center"
            >
              <div
                className={`p-4 md:p-5 rounded-[1.5rem] mb-4 md:mb-5 ${customAlert.type === "danger" || customAlert.type === "confirm" ? "bg-red-50 text-red-500 shadow-inner" : customAlert.type === "warning" ? "bg-amber-50 text-amber-500 shadow-inner" : customAlert.type === "prompt" ? "bg-indigo-50 text-indigo-500 shadow-inner" : "bg-emerald-50 text-emerald-500 shadow-inner"}`}
              >
                {customAlert.type === "danger" ||
                customAlert.type === "confirm" ? (
                  <AlertTriangle size={36} className="md:w-10 md:h-10" />
                ) : customAlert.type === "success" ? (
                  <CheckCircle2 size={36} className="md:w-10 md:h-10" />
                ) : customAlert.type === "prompt" ? (
                  <Plus size={36} className="md:w-10 md:h-10" />
                ) : (
                  <Info size={36} className="md:w-10 md:h-10" />
                )}
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2 leading-tight">
                {customAlert.title}
              </h3>
              <p className="text-sm text-slate-500 mb-6 font-medium px-2 leading-relaxed">
                {customAlert.message}
              </p>
              {customAlert.type === "prompt" && (
                <input
                  type="text"
                  autoFocus
                  className="w-full mb-6 p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-center outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Ketik di sini..."
                  value={customAlert.inputValue}
                  onChange={(e) =>
                    setCustomAlert({
                      ...customAlert,
                      inputValue: e.target.value,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      customAlert.onConfirm
                        ? customAlert.onConfirm(customAlert.inputValue)
                        : closeAlert();
                    }
                  }}
                />
              )}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                {customAlert.type === "confirm" ||
                customAlert.type === "prompt" ? (
                  <>
                    <button
                      onClick={closeAlert}
                      className="w-full py-3.5 px-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors text-sm order-2 sm:order-1"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() =>
                        customAlert.onConfirm
                          ? customAlert.onConfirm(customAlert.inputValue)
                          : closeAlert()
                      }
                      className={`w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-lg transition-all text-sm order-1 sm:order-2 ${customAlert.type === "confirm" ? "bg-red-500 hover:bg-red-600 shadow-red-500/30" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30"}`}
                    >
                      {customAlert.type === "prompt" ? "Simpan" : "Ya, Hapus"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={closeAlert}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-lg transition-all text-sm ${customAlert.type === "danger" ? "bg-red-500 hover:bg-red-600 shadow-red-500/30" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30"}`}
                  >
                    Mengerti
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Dashboard>
  );
};

export default UjianDashboard;
