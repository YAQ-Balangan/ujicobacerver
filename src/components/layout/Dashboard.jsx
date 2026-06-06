// src/components/layout/Dashboard.jsx
import React, { useState, useContext } from "react";
import { LogOut, Menu } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { Badge } from "../ui/Ui";
import logoMasda from "../../assets/logo.svg";

const Dashboard = ({
  children,
  menu = [],
  active,
  setActive,
  zoomOut = true,
}) => {
  const { user, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    // PERBAIKAN DI SINI: Kompensasi ukuran 133.333% agar saat di-zoom 0.75 hasilnya pas 100% layar
    <div
      className={`bg-slate-50/50 flex overflow-hidden font-sans relative origin-top-left ${zoomOut ? "w-full h-screen md:w-[133.333vw] md:h-[133.333vh] md:[zoom:0.75]" : "w-full h-screen"}`}
    >
      {/* OVERLAY UNTUK MOBILE DENGAN EFEK BLUR */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-slate-200 transition-transform duration-500 lg:translate-x-0 lg:static flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* LOGO AREA */}
        <div className="p-8 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 flex items-center justify-center shrink-0">
              <img
                src={logoMasda}
                alt="Logo TADBIRA"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                TADBIRA
              </h2>
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-none mt-1.5">
                Version 1.0
              </p>
            </div>
          </div>
        </div>

        {/* MENU TENGAH */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
          <nav className="space-y-2">
            {menu.map((item) => {
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActive(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 text-sm ${
                    isActive
                      ? "bg-linear-to-r from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-500/20 font-bold"
                      : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 font-medium"
                  }`}
                >
                  {item.icon && (
                    <item.icon
                      size={20}
                      className={isActive ? "text-white" : "text-slate-400"}
                    />
                  )}
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* PROFIL & LOGOUT BAWAH */}
        <div className="p-6 border-t border-slate-100 space-y-4 bg-white shrink-0">
          <div className="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
            <div className="w-10 h-10 bg-white border border-emerald-100 rounded-xl flex items-center justify-center font-bold text-emerald-600 uppercase shadow-sm">
              {user?.nama?.[0] || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">
                {user?.nama || "User"}
              </p>
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-0.5">
                {user?.role || "GUEST"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl text-red-500 font-semibold text-sm hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all"
          >
            <LogOut size={18} /> Keluar Sistem
          </button>
        </div>
      </aside>

      {/* KONTEN KANAN */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* HEADER ATAS */}
        <header className="h-20 shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="font-bold text-slate-800 text-lg md:text-xl tracking-tight">
              {menu.find((m) => m.id === active)?.label || "Dashboard"}
            </h2>
          </div>
          <div className="hidden md:block">
            <Badge type={user?.role || "guest"} />
          </div>
        </header>

        {/* AREA SCROLL KONTEN UTAMA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
