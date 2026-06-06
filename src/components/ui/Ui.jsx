// src/components/ui/Ui.jsx
import React from "react";

export const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-3x1 border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 ${className}`}
  >
    {children}
  </div>
);

export const Badge = ({ type }) => {
  const safeType = type || "guest"; // Perlindungan jika prop type kosong

  // Mapping warna disesuaikan dengan tema Emerald - Emas - Silver
  const map = {
    // Role Pengguna
    admin:
      "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border-amber-200 shadow-sm", // Emas Premium
    guru: "bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200 shadow-sm", // Hijau Zamrud
    siswa: "bg-slate-100 text-slate-600 border-slate-200", // Perak/Abu Elegan

    // Status Ujian
    Aktif: "bg-emerald-50 text-emerald-600 border-emerald-200 animate-pulse",
    Selesai: "bg-slate-50 text-slate-400 border-slate-100",
    Draft: "bg-amber-50 text-amber-600 border-amber-200",

    // Default
    guest: "bg-slate-50 text-slate-400 border-slate-100",
  };

  return (
    <span
      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border flex items-center justify-center w-max ${map[safeType] || map.guest}`}
    >
      {safeType}
    </span>
  );
};
