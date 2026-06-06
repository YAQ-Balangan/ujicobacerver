// src/components/modals/ModalImportMassal.jsx
import React from "react";
import { X, UploadCloud, Target, RefreshCw, Bot, Save } from "lucide-react";
import { Card, PremiumSelect, PremiumMultiSelect } from "../ui/Ui";

const ModalImportMassal = ({
  isOpen,
  onClose,
  isSaving,
  mapelOptions,
  kelasOptions,
  bulkMapel,
  setBulkMapel,
  bulkKelas,
  setBulkKelas,
  bulkPoin,
  setBulkPoin,
  bulkText,
  setBulkText,
  isProcessingAI,
  handleRapikanDenganAI,
  parsedBulkData,
  handleParseBulkText,
  handleSaveBulk,
  LatexComponent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 overflow-y-auto">
      <div className="w-full max-w-5xl my-auto py-4 md:py-8">
        <Card className="p-4 md:p-8 shadow-2xl border-0 rounded-[1.5rem] md:rounded-[2rem] bg-white">
          <div className="flex justify-between items-start md:items-center mb-4 md:mb-6 pb-3 md:pb-5 border-b border-slate-100">
            <div>
              <h3 className="text-lg md:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2 md:gap-3">
                <UploadCloud className="text-emerald-500" size={24} /> Import
                Soal Massal
              </h3>
              <p className="text-slate-500 font-medium text-[10px] md:text-xs mt-1 md:mt-1.5 leading-relaxed">
                Sistem AI otomatis memisahkan Wacana dan Pertanyaan. <br />
                <strong className="text-amber-600">Tips Gambar:</strong> Untuk
                menyisipkan gambar pada soal, silakan simpan proses import ini
                terlebih dahulu, lalu klik tombol <b>Ikon Gambar</b> pada
                masing-masing soal.
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-3 md:mb-4">
            <div className="w-full">
              <PremiumSelect
                value={bulkMapel}
                onChange={(val) => setBulkMapel(val)}
                options={
                  mapelOptions.length > 0
                    ? mapelOptions.map((opt) => ({ label: opt, value: opt }))
                    : [{ label: "Memuat Data...", value: "" }]
                }
                placeholder="Pilih Mata Pelajaran..."
                disabled={isSaving || mapelOptions.length === 0}
              />
            </div>
            <div className="w-full">
              <PremiumMultiSelect
                value={bulkKelas}
                onChange={(val) => setBulkKelas(val)}
                options={kelasOptions}
                placeholder="Pilih Kelas Sasaran..."
                disabled={isSaving}
              />
            </div>
            <div className="relative flex items-center shadow-sm rounded-lg md:rounded-xl">
              <Target className="absolute left-3 text-amber-500" size={16} />
              <input
                type="number"
                step="any"
                className="w-full p-2.5 md:p-3.5 pl-9 md:pl-10 text-xs md:text-sm bg-amber-50 border border-amber-200 rounded-lg md:rounded-xl font-bold text-amber-700 outline-none focus:border-amber-400"
                placeholder="Poin per Soal"
                value={bulkPoin}
                onChange={(e) => setBulkPoin(e.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>
          <div className="flex justify-between items-end mb-2 mt-2">
            <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
              Teks Soal Asli
            </label>
            <button
              type="button"
              onClick={handleRapikanDenganAI}
              disabled={isProcessingAI || isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-[10px] md:text-xs font-bold hover:bg-purple-100 transition-colors shadow-sm"
            >
              {isProcessingAI ? (
                <RefreshCw className="animate-spin" size={14} />
              ) : (
                <Bot size={14} />
              )}{" "}
              {isProcessingAI
                ? "AI Sedang Bekerja..."
                : "Bantu Perbaiki Rumus (AI)"}
            </button>
          </div>
          <textarea
            className="w-full p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-xl md:rounded-[1.5rem] font-mono text-[11px] md:text-[13px] outline-none focus:bg-white focus:border-emerald-500 transition-all resize-y h-48 md:h-64 text-slate-700 shadow-inner leading-relaxed"
            placeholder="Paste soal dari Ms.Word ke sini..."
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            disabled={isSaving}
          />
          <div className="flex justify-end mt-4 md:mt-5">
            <button
              onClick={handleParseBulkText}
              disabled={!bulkText || !bulkMapel || !bulkKelas || isSaving}
              className="w-full md:w-auto bg-slate-800 text-white font-bold text-sm px-6 py-3.5 rounded-lg md:rounded-xl shadow-md hover:bg-slate-900 active:scale-95 transition-all disabled:opacity-50"
            >
              Pratinjau (Preview) AI
            </button>
          </div>
          {parsedBulkData.length > 0 && (
            <div className="mt-6 md:mt-8 border-t border-slate-100 pt-5 md:pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mb-4">
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-200">
                  {parsedBulkData.length} Soal Terdeteksi
                </span>
                <span className="text-[10px] md:text-xs text-slate-500 font-medium">
                  Silakan periksa hasil bacaan sistem di bawah ini.
                </span>
              </div>
              <div className="max-h-[400px] md:max-h-[500px] overflow-y-auto bg-slate-50 rounded-xl md:rounded-[1.5rem] border border-slate-200 p-3 md:p-4 space-y-3 md:space-y-4 mb-5 md:mb-6 scrollbar-thin">
                {parsedBulkData.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-slate-100 relative"
                  >
                    <div className="absolute top-3 right-3 md:top-4 md:right-4 text-[9px] md:text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                      #{idx + 1}
                    </div>
                    {item.wacana && (
                      <div className="mb-3 p-2.5 md:p-3 bg-amber-50/50 border border-amber-100 text-[10px] md:text-xs text-slate-700 rounded-lg leading-relaxed">
                        <strong className="text-amber-600 block mb-1">
                          Teks Wacana Terikat:
                        </strong>
                        <div className="whitespace-pre-wrap leading-relaxed">
                          <LatexComponent>{item.wacana || ""}</LatexComponent>
                        </div>
                      </div>
                    )}
                    <div className="text-xs md:text-sm font-semibold text-slate-800 whitespace-pre-wrap mb-3 md:mb-4 pr-8 md:pr-10 leading-relaxed">
                      <LatexComponent>{item.pertanyaan || ""}</LatexComponent>
                    </div>
                    <div className="flex flex-col gap-1 md:gap-1.5 text-[10px] md:text-xs text-slate-600 font-medium">
                      {item.opsi_a && (
                        <div
                          className={`p-2 md:p-2.5 rounded-lg whitespace-pre-wrap ${item.jawaban_benar === "A" ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-100" : "bg-slate-50 border border-transparent"}`}
                        >
                          <strong>A.</strong>{" "}
                          <LatexComponent>{item.opsi_a || ""}</LatexComponent>
                        </div>
                      )}
                      {item.opsi_b && (
                        <div
                          className={`p-2 md:p-2.5 rounded-lg whitespace-pre-wrap ${item.jawaban_benar === "B" ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-100" : "bg-slate-50 border border-transparent"}`}
                        >
                          <strong>B.</strong>{" "}
                          <LatexComponent>{item.opsi_b || ""}</LatexComponent>
                        </div>
                      )}
                      {item.opsi_c && (
                        <div
                          className={`p-2 md:p-2.5 rounded-lg whitespace-pre-wrap ${item.jawaban_benar === "C" ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-100" : "bg-slate-50 border border-transparent"}`}
                        >
                          <strong>C.</strong>{" "}
                          <LatexComponent>{item.opsi_c || ""}</LatexComponent>
                        </div>
                      )}
                      {item.opsi_d && (
                        <div
                          className={`p-2 md:p-2.5 rounded-lg whitespace-pre-wrap ${item.jawaban_benar === "D" ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-100" : "bg-slate-50 border border-transparent"}`}
                        >
                          <strong>D.</strong>{" "}
                          <LatexComponent>{item.opsi_d || ""}</LatexComponent>
                        </div>
                      )}
                      {item.opsi_e && (
                        <div
                          className={`p-2 md:p-2.5 rounded-lg whitespace-pre-wrap ${item.jawaban_benar === "E" ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-100" : "bg-slate-50 border border-transparent"}`}
                        >
                          <strong>E.</strong>{" "}
                          <LatexComponent>{item.opsi_e || ""}</LatexComponent>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleSaveBulk}
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-sm md:text-sm py-3 md:py-4 rounded-lg md:rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:scale-[1.01] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-70 border border-emerald-400"
              >
                {isSaving ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}{" "}
                Simpan {parsedBulkData.length} Soal ke Database
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ModalImportMassal;
