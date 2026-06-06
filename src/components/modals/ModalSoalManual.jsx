// src/components/modals/ModalSoalManual.jsx
import React, { useRef, useEffect } from "react";
import { X, Save, RefreshCw, AlertTriangle, ImagePlus } from "lucide-react";
import { Card, PremiumSelect, PremiumMultiSelect } from "../ui/Ui";

// Editor Khusus untuk Soal Manual
const GoogleFormEditor = ({
  value,
  onChange,
  placeholder,
  disabled,
  onImageUpload,
}) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };
  const execCmd = (cmd, e) => {
    e.preventDefault();
    document.execCommand(cmd, false, null);
    handleInput();
  };

  return (
    <div
      className={`border rounded-xl md:rounded-[1.5rem] bg-white overflow-hidden shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <div className="flex flex-wrap gap-1 md:gap-2 p-2 bg-slate-50 border-b border-slate-200">
        <button
          type="button"
          onMouseDown={(e) => execCmd("bold", e)}
          className="p-1.5 md:p-2 hover:bg-slate-200 rounded text-slate-700 font-bold"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(e) => execCmd("italic", e)}
          className="p-1.5 md:p-2 hover:bg-slate-200 rounded text-slate-700 italic font-serif"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={(e) => execCmd("underline", e)}
          className="p-1.5 md:p-2 hover:bg-slate-200 rounded text-slate-700 underline"
          title="Underline"
        >
          U
        </button>
        <div className="w-px bg-slate-300 mx-1"></div>
        {onImageUpload && (
          <label className="cursor-pointer p-1.5 md:p-2 hover:bg-slate-200 rounded text-emerald-600 flex items-center gap-2 text-xs font-bold transition-colors">
            <ImagePlus size={16} /> Sisipkan Foto
            <input
              type="file"
              className="hidden"
              accept="image/*"
              disabled={disabled}
              onChange={onImageUpload}
            />
          </label>
        )}
      </div>
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onBlur={handleInput}
        className="p-3 md:p-4 min-h-[100px] text-sm md:text-base text-slate-800 outline-none whitespace-pre-wrap empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 cursor-text"
        data-placeholder={placeholder}
      />
    </div>
  );
};

const ModalSoalManual = ({
  isOpen,
  onClose,
  isEdit,
  formData,
  setFormData,
  isSaving,
  handleSave,
  mapelOptions,
  kelasOptions,
  isUploadingFormImg,
  handleFormImageUpload,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 overflow-y-auto">
      <div className="w-full max-w-4xl my-auto py-4 md:py-8">
        <Card className="p-4 md:p-8 shadow-2xl border-0 rounded-[1.5rem] md:rounded-[2rem] bg-white">
          <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-5 border-b border-slate-100">
            <div>
              <h3 className="text-lg md:text-2xl font-bold text-slate-800 tracking-tight">
                {isEdit ? "Edit Soal" : "Buat Soal Baru"}
              </h3>
              <p className="text-emerald-600 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-0.5 md:mt-1">
                Sistem Database CBT
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="p-1.5 md:p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg md:rounded-xl transition-colors disabled:opacity-50 border border-transparent hover:border-red-100"
            >
              <X size={20} className="md:w-6 md:h-6" />
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 bg-slate-50 p-4 md:p-5 rounded-[1rem] md:rounded-[1.5rem] border border-slate-100">
              <div className="space-y-1.5">
                <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                  ID Sistem
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 md:p-3.5 text-xs md:text-sm rounded-lg md:rounded-xl font-bold outline-none transition-all shadow-sm bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                  value={isEdit ? formData.id : "Otomatis"}
                  disabled={true}
                />
              </div>
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                  Mapel
                </label>
                <PremiumSelect
                  value={formData.mapel || ""}
                  onChange={(val) => setFormData({ ...formData, mapel: val })}
                  options={
                    mapelOptions.length > 0
                      ? mapelOptions.map((opt) => ({ label: opt, value: opt }))
                      : [{ label: "Memuat Data...", value: "" }]
                  }
                  placeholder="Pilih Mapel..."
                  disabled={isSaving || mapelOptions.length === 0}
                />
              </div>
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                  Kelas
                </label>
                <PremiumMultiSelect
                  value={formData.kelas || ""}
                  onChange={(val) => setFormData({ ...formData, kelas: val })}
                  options={kelasOptions}
                  placeholder="Pilih Kelas..."
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-amber-600 ml-1">
                  Bobot Poin
                </label>
                <input
                  type="number"
                  step="any"
                  className="w-full p-2.5 md:p-3.5 text-xs md:text-sm bg-amber-50 border border-amber-200 rounded-lg md:rounded-xl font-bold text-amber-700 outline-none focus:border-amber-400"
                  value={formData.poin || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, poin: e.target.value })
                  }
                  disabled={isSaving}
                  required
                />
              </div>
            </div>
            <div className="space-y-1 md:space-y-1.5">
              <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                Wacana / Teks Cerita (Opsional)
              </label>
              <GoogleFormEditor
                value={formData.wacana || ""}
                onChange={(val) => setFormData({ ...formData, wacana: val })}
                placeholder="Tuliskan paragraf wacana di sini, block teks untuk Bold/Italic..."
                disabled={isSaving}
              />
              <p className="text-[9px] md:text-[10px] font-medium text-amber-600 ml-1 mt-1 flex items-start md:items-center gap-1">
                <AlertTriangle size={12} className="shrink-0 mt-0.5 md:mt-0" />{" "}
                Jangan gunakan kalimat "Untuk soal nomor 1-5" di dalam teks
                wacana, karena soal CBT akan diacak.
              </p>
            </div>
            <div className="space-y-1 md:space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Pertanyaan Inti (Bisa Format Teks & Gambar){" "}
                  <span className="text-red-500">*</span>
                </label>
                {isUploadingFormImg && (
                  <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                    <RefreshCw size={12} className="animate-spin" />{" "}
                    Uploading...
                  </span>
                )}
              </div>
              <GoogleFormEditor
                value={formData.pertanyaan || ""}
                onChange={(val) =>
                  setFormData({ ...formData, pertanyaan: val })
                }
                placeholder="Ketik pertanyaan di sini, block teks untuk Bold/Italic..."
                disabled={isSaving || isUploadingFormImg}
                onImageUpload={handleFormImageUpload}
              />
            </div>
            <div className="space-y-1 md:space-y-1.5">
              <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                URL Lampiran Gambar (Bila ada)
              </label>
              <input
                type="text"
                disabled={isSaving}
                placeholder="Paste link gambar (https://...) atau biarkan kosong."
                className="w-full p-2.5 md:p-3.5 text-xs md:text-sm bg-white border border-slate-200 rounded-lg md:rounded-xl font-medium text-slate-700 outline-none focus:border-emerald-500 transition-all shadow-sm"
                value={formData.link_gambar || ""}
                onChange={(e) =>
                  setFormData({ ...formData, link_gambar: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 pt-1 md:pt-2">
              {["A", "B", "C", "D", "E"].map((opt) => {
                const keyMap = `opsi_${opt.toLowerCase()}`;
                const isKunci = formData.jawaban_benar === opt;
                return (
                  <div key={opt} className="space-y-1 md:space-y-1.5 relative">
                    <label
                      className={`text-[10px] md:text-[11px] font-bold uppercase tracking-wider ml-1 ${isKunci ? "text-emerald-600" : "text-slate-500"}`}
                    >
                      Pilihan {opt} {isKunci && "(KUNCI)"}
                    </label>
                    <textarea
                      required={opt !== "E"}
                      disabled={isSaving}
                      placeholder={`Jawaban ${opt}...`}
                      className={`w-full p-2.5 md:p-3.5 text-xs md:text-sm border rounded-lg md:rounded-xl font-medium outline-none transition-all shadow-sm whitespace-pre-wrap resize-y ${isKunci ? "bg-emerald-50 border-emerald-300 text-emerald-900 focus:ring-2 focus:ring-emerald-500/20" : "bg-white border-slate-200 text-slate-700 focus:border-emerald-500"}`}
                      value={formData[keyMap] || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, [keyMap]: e.target.value })
                      }
                    />
                  </div>
                );
              })}
              <div className="space-y-1 md:space-y-1.5">
                <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-emerald-600 ml-1">
                  Tetapkan Kunci Jawaban
                </label>
                <select
                  required
                  disabled={isSaving}
                  className="w-full p-2.5 md:p-3.5 text-xs md:text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 border border-emerald-400 text-white rounded-lg md:rounded-xl font-bold outline-none shadow-md cursor-pointer"
                  value={formData.jawaban_benar || "A"}
                  onChange={(e) =>
                    setFormData({ ...formData, jawaban_benar: e.target.value })
                  }
                >
                  <option value="A">PILIHAN A</option>
                  <option value="B">PILIHAN B</option>
                  <option value="C">PILIHAN C</option>
                  <option value="D">PILIHAN D</option>
                  <option value="E">PILIHAN E</option>
                </select>
              </div>
            </div>
            <div className="pt-4 md:pt-6 mt-2 md:mt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-sm md:text-sm py-3 md:py-4 rounded-lg md:rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:scale-[1.01] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-70 disabled:cursor-not-allowed border border-emerald-400"
              >
                {isSaving ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}{" "}
                {isSaving ? "Menyimpan ke Server..." : "Simpan Soal"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ModalSoalManual;
