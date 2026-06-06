// src/components/modals/ModalTemplateDummy.jsx
import React from "react";
import { X, Check, RefreshCw, Layers } from "lucide-react";
import { PremiumSelect, PremiumMultiSelect } from "../ui/Ui";

const ModalTemplateDummy = ({
  isOpen,
  onClose,
  isSaving,
  dummyConfig,
  setDummyConfig,
  mapelOptions,
  kelasOptions,
  handleGenerateDummy,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-slate-900/80">
      <div className="w-full max-w-md bg-white rounded-[1.5rem] p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Layers className="text-blue-500" /> Buat Template Soal (Kosong)
          </h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleGenerateDummy} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Pilih Mapel</label>
            <PremiumSelect
              value={dummyConfig.mapel}
              onChange={(val) => setDummyConfig({ ...dummyConfig, mapel: val })}
              options={mapelOptions.map((opt) => ({ label: opt, value: opt }))}
              placeholder="Mata Pelajaran..."
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Sasaran Kelas</label>
            <PremiumMultiSelect
              value={dummyConfig.kelas}
              onChange={(val) => setDummyConfig({ ...dummyConfig, kelas: val })}
              options={kelasOptions}
              placeholder="Pilih Kelas..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Mode Jumlah Soal</label>
              <select
                className="w-full p-3 border border-slate-200 rounded-xl font-bold bg-slate-50 outline-none"
                value={dummyConfig.jumlah}
                onChange={(e) => setDummyConfig({ ...dummyConfig, jumlah: Number(e.target.value) })}
              >
                <option value={10}>10 Soal (Test)</option>
                <option value={40}>40 Soal</option>
                <option value={50}>50 Soal</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Poin per Soal</label>
              <input
                type="number"
                step="any"
                required
                className="w-full p-3 border border-slate-200 rounded-xl font-bold bg-slate-50 outline-none"
                value={dummyConfig.poin}
                onChange={(e) => setDummyConfig({ ...dummyConfig, poin: e.target.value })}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Check size={18} />} Generate Soal Sekarang
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalTemplateDummy;