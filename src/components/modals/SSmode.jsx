// src/components/modals/SSmode.jsx
import React, { useState, useRef, useMemo, useEffect } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  X,
  UploadCloud,
  CheckCircle,
  Loader2,
  ShieldAlert,
  ChevronDown,
  Square,
  CheckSquare,
  Target,
  ChevronLeft,
  ChevronRight,
  ClipboardPaste,
  RefreshCcw,
  BookOpen,
  KeyRound,
} from "lucide-react";

import { api } from "../../api/api";

// Setup Worker PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const IMGBB_API_KEY = "db28c000ce57b260d7d09cb4c18790e0";

const ModalSelect = ({ value, onChange, options, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );
  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value),
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3.5 text-sm font-semibold bg-slate-800 border transition-all rounded-2xl outline-none ${disabled ? "opacity-50 cursor-not-allowed border-slate-700" : "border-slate-600 hover:border-emerald-500 active:scale-[0.98]"}`}
      >
        <span
          className={`truncate ${!selectedOption ? "text-slate-400" : "text-emerald-400 font-bold"}`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="absolute z-[1001] w-full mt-2 bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl max-h-60 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-slate-700">
            <input
              type="text"
              autoFocus
              placeholder="Cari..."
              className="w-full px-3 py-2 text-sm bg-slate-900 text-white rounded-xl border border-slate-700 outline-none focus:border-emerald-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className="w-full px-5 py-4 text-sm text-left hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-400 border-b border-slate-700/50 last:border-0"
                >
                  {opt.label}
                </button>
              ))
            ) : (
              <div className="px-5 py-4 text-sm text-slate-500 italic">
                Tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ModalMultiSelect = ({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );
  const selectedArray = value
    ? String(value)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const toggleOption = (optValue) => {
    let newArr = selectedArray.includes(optValue)
      ? selectedArray.filter((i) => i !== optValue)
      : [...selectedArray, optValue];
    onChange(newArr.join(", "));
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3.5 text-sm font-semibold bg-slate-800 border transition-all rounded-2xl outline-none ${disabled ? "opacity-50 cursor-not-allowed border-slate-700" : "border-slate-600 hover:border-emerald-500 active:scale-[0.98]"}`}
      >
        <span
          className={`truncate ${selectedArray.length === 0 ? "text-slate-400" : "text-emerald-400 font-bold"}`}
        >
          {selectedArray.length === 0
            ? placeholder
            : selectedArray.length > 2
              ? `${selectedArray.length} Kelas Dipilih`
              : selectedArray.join(", ")}
        </span>
        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="absolute z-[1001] w-full mt-2 bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl max-h-72 flex flex-col overflow-hidden p-2">
          <div className="p-2 border-b border-slate-700 mb-2">
            <input
              type="text"
              autoFocus
              placeholder="Cari..."
              className="w-full px-3 py-2 text-sm bg-slate-900 text-white rounded-xl border border-slate-700 outline-none focus:border-emerald-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, i) => {
                if (opt.isLabel)
                  return (
                    <div
                      key={i}
                      className="px-3 py-2 text-xs font-black text-slate-500 uppercase tracking-widest"
                    >
                      {opt.label}
                    </div>
                  );
                const isSelected = selectedArray.includes(opt.value);
                return (
                  <div
                    key={i}
                    onClick={() => toggleOption(opt.value)}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/10 transition-all text-slate-200"
                  >
                    {isSelected ? (
                      <CheckSquare size={20} className="text-emerald-500" />
                    ) : (
                      <Square size={20} className="text-slate-500" />
                    )}
                    <span className="text-sm font-semibold">{opt.label}</span>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-sm text-slate-500 italic">
                Tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- KOMPONEN UTAMA ---
const SSmode = ({
  isOpen,
  onClose,
  onUploadSuccess,
  currentDbSoal,
  mapelOptions,
  kelasOptions,
  initialMapel,
  initialKelas,
  namaGuru,
}) => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [crop, setCrop] = useState({
    unit: "%",
    width: 80,
    height: 20,
    x: 8,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentQNumber, setCurrentQNumber] = useState(1);
  const [answerKeyText, setAnswerKeyText] = useState("");
  const [parsedKeys, setParsedKeys] = useState({});
  const [manualKunci, setManualKunci] = useState("");
  const [poin, setPoin] = useState(2.5);
  const [mapel, setMapel] = useState("");
  const [kelas, setKelas] = useState("");
  const [toastMsg, setToastMsg] = useState(false); // <--- STATE NOTIF DITAMBAHKAN DI SINI

  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Ukuran PDF Responsif
  const [pdfWidth, setPdfWidth] = useState(800);
  useEffect(() => {
    const updateWidth = () =>
      setPdfWidth(window.innerWidth < 768 ? window.innerWidth - 32 : 800);
    window.addEventListener("resize", updateWidth);
    updateWidth();
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMapel(initialMapel || "");
      setKelas(initialKelas || "");
    }
  }, [isOpen, initialMapel, initialKelas]);

  const handleGantiPDFClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setNumPages(null);
      setPageNumber(1);
      setCrop({ unit: "%", width: 80, height: 20, x: 8, y: 5 });
    }
  };

  const changePage = (offset) => {
    setPageNumber((prev) => prev + offset);
    setCrop({ unit: "%", width: 80, height: 20, x: 8, y: 5 });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cegah navigasi jika modal tertutup atau user sedang mengetik di form (input/textarea)
      if (
        !isOpen ||
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA"
      )
        return;

      if (e.key === "ArrowRight") {
        // Klik lanjut jika belum di halaman terakhir
        if (pageNumber < numPages && !isUploading) {
          changePage(1);
        }
      } else if (e.key === "ArrowLeft") {
        // Klik sebelumnya jika bukan di halaman pertama
        if (pageNumber > 1 && !isUploading) {
          changePage(-1);
        }
      }
    };

    // Pasang listener saat komponen muncul
    window.addEventListener("keydown", handleKeyDown);

    // Bersihkan listener saat komponen hilang agar tidak membebani memori
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, pageNumber, numPages, isUploading]);

  const handlePasteKunci = (text) => {
    setAnswerKeyText(text);
    const parsed = {};
    const regex = /(\d+)[\.\-\)]?\s*([A-Ea-e])/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const num = parseInt(match[1], 10);
      const ans = match[2].toUpperCase();
      parsed[num] = ans;
    }
    setParsedKeys(parsed);
    if (parsed[currentQNumber]) setManualKunci("");
  };

  const activeKunci = manualKunci || parsedKeys[currentQNumber] || "";

  const existingStats = useMemo(() => {
    if (!mapel || !kelas) return { found: false, count: 0 };
    const selClass = String(kelas)
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    let count = 0;
    currentDbSoal?.forEach((s) => {
      if (String(s.mapel).toLowerCase() === String(mapel).toLowerCase()) {
        const dbClass = String(s.kelas)
          .split(",")
          .map((k) => k.trim().toLowerCase());
        if (selClass.some((c) => dbClass.includes(c))) count++;
      }
    });
    return { found: count > 0, count };
  }, [mapel, kelas, currentDbSoal]);

  const handleSnapAndUpload = async () => {
    if (!completedCrop || !activeKunci || !mapel || !kelas)
      return alert("Lengkapi data!");
    setIsUploading(true);
    try {
      const container = containerRef.current;
      const pageCanvas = container?.querySelector(".react-pdf__Page canvas");
      if (!pageCanvas) throw new Error("Gagal membaca PDF.");

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const sX = (completedCrop.x * pageCanvas.width) / 100;
      const sY = (completedCrop.y * pageCanvas.height) / 100;
      const sWidth = (completedCrop.width * pageCanvas.width) / 100;
      const sHeight = (completedCrop.height * pageCanvas.height) / 100;

      canvas.width = sWidth;
      canvas.height = sHeight;
      ctx.drawImage(pageCanvas, sX, sY, sWidth, sHeight, 0, 0, sWidth, sHeight);

      const base64Image = canvas.toDataURL("image/webp", 0.9).split(",")[1];
      const formData = new FormData();
      formData.append("image", base64Image);

      const imgbbRes = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        { method: "POST", body: formData },
      );
      const imgData = await imgbbRes.json();
      if (!imgData.success) throw new Error("Gagal upload.");

      const finalUrl = `https://wsrv.nl/?url=${imgData.data.url}&output=webp&q=90`;
      const maxId = currentDbSoal?.length
        ? Math.max(...currentDbSoal.map((i) => parseInt(i.id) || 0))
        : 0;

      await api.create("Soal", {
        id: maxId + 1,
        pertanyaan: "",
        link_gambar: finalUrl,
        jawaban_benar: activeKunci,
        mapel,
        kelas,
        poin: parseFloat(poin),
        guru_pembuat: namaGuru || "Guru",
        opsi_a: "Pilihan A",
        opsi_b: "Pilihan B",
        opsi_c: "Pilihan C",
        opsi_d: "Pilihan D",
        opsi_e: "Pilihan E",
      });

      onUploadSuccess();

      // <--- KODE NOTIF DIPANGGIL DI SINI --->
      setToastMsg(true);
      setTimeout(() => setToastMsg(false), 2500); // Otomatis hilang dalam 2.5 detik

      setCrop((prev) => ({
        ...prev,
        y: Math.min(prev.y + prev.height + 2, 75),
      }));
      setCurrentQNumber((prev) => prev + 1);
      setManualKunci("");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950 md:backdrop-blur-md md:p-[10mm] lg:p-[20mm] font-sans text-slate-200">
      {/* <--- UI NOTIFIKASI MELAYANG (TOAST) ---> */}
      {toastMsg && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[1005] bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl shadow-emerald-900/50 flex items-center gap-2 animate-bounce border border-emerald-400">
          <CheckCircle size={20} />
          <span className="font-black text-sm tracking-widest uppercase">
            Snap Tersimpan!
          </span>
        </div>
      )}

      <div className="bg-slate-900 w-full h-full md:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl border-slate-700 md:border">
        {/* HEADER (Gaya App Bar M-Banking) */}
        <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/95 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-500 shadow-inner">
              <UploadCloud size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white leading-none">
                Snap PDF Import
              </h2>
              <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">
                Tadbira Pro
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            {file && (
              <button
                onClick={handleGantiPDFClick}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-xl transition-all text-[10px] font-black uppercase border border-amber-500/30 shadow-lg shadow-amber-900/10"
              >
                <RefreshCcw size={14} /> Ganti PDF
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-full transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* AREA PDF (Centered & Scrollable) */}
          <div className="flex-1 bg-slate-950 flex flex-col relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
            {!file ? (
              <div className="flex-1 m-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-[2rem] bg-slate-900/50">
                <button
                  onClick={handleGantiPDFClick}
                  className="flex flex-col items-center group outline-none p-6 text-center"
                >
                  <div className="bg-emerald-500/10 p-7 rounded-full mb-5 group-hover:scale-110 transition-transform shadow-xl shadow-emerald-500/10">
                    <UploadCloud size={48} className="text-emerald-500" />
                  </div>
                  <span className="font-black text-slate-300 uppercase tracking-widest text-sm">
                    Upload PDF Bank Soal
                  </span>
                  <span className="text-slate-500 text-xs mt-3 font-medium">
                    Klik untuk mencari file
                  </span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 md:p-8 text-center scrollbar-thin scroll-smooth">
                  <ReactCrop
                    crop={crop}
                    onChange={(_, p) => setCrop(p)}
                    onComplete={(_, p) => setCompletedCrop(p)}
                    className="inline-block max-w-full"
                  >
                    <div
                      ref={containerRef}
                      className="bg-white shadow-2xl inline-block rounded-lg overflow-hidden border-8 border-white"
                    >
                      <Document
                        file={file}
                        onLoadSuccess={({ numPages }) => {
                          setNumPages(numPages);
                          setPageNumber(1);
                        }}
                      >
                        <Page
                          pageNumber={pageNumber}
                          width={pdfWidth}
                          scale={2}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </Document>
                    </div>
                  </ReactCrop>
                </div>

                <div className="h-14 md:h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-5 md:px-10 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
                  <button
                    disabled={pageNumber <= 1 || isUploading}
                    onClick={() => changePage(-1)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-2xl text-xs font-black transition-all"
                  >
                    <ChevronLeft size={16} />{" "}
                    <span className="hidden md:inline">Kembali</span>
                  </button>
                  <div className="font-mono font-black text-emerald-400 tracking-tighter bg-emerald-500/5 px-5 py-2 rounded-2xl border border-emerald-500/20 text-xs md:text-sm">
                    HAL {pageNumber} / {numPages || "-"}
                  </div>
                  <button
                    disabled={pageNumber >= numPages || isUploading}
                    onClick={() => changePage(1)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-2xl text-xs font-black transition-all"
                  >
                    <span className="hidden md:inline">Lanjut</span>{" "}
                    <ChevronRight size={16} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* PANEL KONTROL (Gaya Kartu M-Banking) */}
          <div className="h-[45vh] md:h-full w-full md:w-[480px] lg:w-[580px] bg-slate-900 flex flex-col shrink-0 overflow-hidden relative shadow-[-10px_0_30px_rgba(0,0,0,0.2)]">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-none bg-slate-900/50">
              {/* CARD 1: STATUS & NOMOR (Atribut Utama) */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-4 shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-2xl ${existingStats.found ? "bg-amber-500/20 text-amber-500" : "bg-emerald-500/20 text-emerald-500"}`}
                  >
                    {existingStats.found ? (
                      <ShieldAlert size={20} />
                    ) : (
                      <CheckCircle size={20} />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-[10px] font-black uppercase tracking-widest ${existingStats.found ? "text-amber-400" : "text-emerald-400"}`}
                    >
                      {existingStats.found ? "Data Ditemukan" : "Slot Tersedia"}
                    </p>
                    <p className="text-xs text-slate-300 font-bold">
                      {existingStats.found
                        ? `${existingStats.count} Soal di Database`
                        : "Belum ada soal"}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-700 text-center shadow-inner">
                  <p className="text-[8px] font-black text-slate-500 uppercase leading-none mb-1">
                    No. Soal
                  </p>
                  <input
                    type="number"
                    value={currentQNumber}
                    onChange={(e) => {
                      setCurrentQNumber(Number(e.target.value));
                      setManualKunci("");
                    }}
                    className="w-10 bg-transparent text-emerald-500 text-center font-black outline-none text-base"
                    min="1"
                  />
                </div>
              </div>

              {/* AREA FORM: GRID 2 KOLOM (LAPTOP) / 1 KOLOM (HP) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CARD 2: IDENTITAS SOAL */}
                <div className="bg-slate-800/40 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1.5 ml-1">
                      <BookOpen size={12} /> Mata Pelajaran
                    </label>
                    <ModalSelect
                      value={mapel}
                      onChange={setMapel}
                      options={mapelOptions.map((m) => ({
                        label: m,
                        value: m,
                      }))}
                      placeholder="Pilih Mapel"
                      disabled={isUploading}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1.5 ml-1">
                      <Target size={12} /> Sasaran Kelas
                    </label>
                    <ModalMultiSelect
                      value={kelas}
                      onChange={setKelas}
                      options={kelasOptions}
                      placeholder="Pilih Kelas"
                      disabled={isUploading}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1.5 ml-1">
                      <Target size={12} /> Poin (Per Soal)
                    </label>
                    <div className="relative">
                      <Target
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500"
                      />
                      <input
                        type="number"
                        step="0.1"
                        value={poin}
                        onChange={(e) => setPoin(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 p-3.5 pl-12 rounded-2xl text-sm font-black text-amber-400 outline-none shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                {/* CARD 3: KUNCI JAWABAN */}
                <div className="bg-slate-800/40 border border-slate-800 rounded-3xl p-5 flex flex-col shadow-sm">
                  <div className="space-y-1.5 mb-5">
                    <label className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-1.5 ml-1">
                      <ClipboardPaste size={14} /> Kunci Jawaban (Auto)
                    </label>
                    <textarea
                      placeholder="Contoh: 1A, 2B..."
                      value={answerKeyText}
                      onChange={(e) => handlePasteKunci(e.target.value)}
                      className="w-full h-20 md:flex-1 bg-slate-900 border border-slate-700 p-3.5 rounded-2xl text-xs font-semibold outline-none resize-none focus:border-emerald-500 text-slate-200 shadow-inner"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1.5">
                        <KeyRound size={12} /> Opsi Jawaban
                      </label>
                      {parsedKeys[currentQNumber] && !manualKunci && (
                        <span className="text-[9px] font-black text-emerald-900 uppercase bg-emerald-400 px-2 py-0.5 rounded-lg shadow-sm">
                          Auto
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {["A", "B", "C", "D", "E"].map((k) => {
                        const isActive =
                          manualKunci === k ||
                          (!manualKunci && parsedKeys[currentQNumber] === k);
                        return (
                          <button
                            key={k}
                            disabled={isUploading}
                            onClick={() => setManualKunci(k)}
                            className={`h-11 md:h-12 rounded-2xl font-black text-sm transition-all shadow-md ${isActive ? "bg-emerald-500 text-white scale-105 shadow-emerald-900/40 border-none ring-2 ring-emerald-400/20" : "bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700 active:scale-95"}`}
                          >
                            {k}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BUTTON SIMPAN (Gaya Tombol Utama M-Banking) */}
            <div className="p-5 md:p-8 bg-slate-900 border-t border-slate-800 shrink-0 shadow-[0_-20px_40px_rgba(0,0,0,0.4)]">
              <button
                disabled={isUploading || !file || !activeKunci}
                onClick={handleSnapAndUpload}
                className={`w-full py-4 md:py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-2xl text-sm ${!file || !activeKunci ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700" : "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-emerald-900/50 active:scale-95 border border-emerald-400"}`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle size={22} /> Simpan Soal
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SSmode;
