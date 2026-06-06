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
    // Background dasar diganti menjadi bg-slate-100 untuk menonjolkan shadow 3D
    <div
      className={`bg-slate-100 flex overflow-hidden font-sans relative origin-top-left ${zoomOut ? "w-full h-screen md:w-[133.333vw] md:h-[133.333vh] md:[zoom:0.75]" : "w-full h-screen"}`}
    >
      {/* OVERLAY UNTUK MOBILE */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR (Tanpa border, diganti dengan shadow jatuh ke kanan) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-slate-100 transition-transform duration-500 lg:translate-x-0 lg:static flex flex-col h-full shadow-[6px_0_15px_#cbd5e1] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* LOGO AREA - Logo Card 3D */}
        <div className="p-8 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 flex items-center justify-center shrink-0 rounded-2xl shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff] bg-slate-100 p-2">
              <img
                src={logoMasda}
                alt="Logo TADBIRA"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-700 tracking-tight">
                TADBIRA
              </h2>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none mt-1.5">
                Version 1.0
              </p>
            </div>
          </div>
        </div>

        {/* MENU TENGAH - Efek Pop-It */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide pt-2">
          <nav className="space-y-4">
            {menu.map((item) => {
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActive(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 text-sm outline-none ${
                    isActive
                      ? // Menu Aktif: Melesak ke dalam (Cekung)
                        "shadow-[inset_5px_5px_10px_#cbd5e1,inset_-5px_-5px_10px_#ffffff] text-emerald-600 font-black translate-y-[1px]"
                      : // Menu Tidak Aktif: Timbul ke luar (Cembung)
                        "shadow-[5px_5px_10px_#cbd5e1,-5px_-5px_10px_#ffffff] text-slate-500 hover:text-emerald-500 hover:shadow-[inset_2px_2px_5px_#cbd5e1,inset_-2px_-2px_5px_#ffffff] font-bold hover:translate-y-[1px]"
                  }`}
                >
                  {item.icon && (
                    <item.icon
                      size={20}
                      className={
                        isActive ? "text-emerald-500" : "text-slate-400"
                      }
                    />
                  )}
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* PROFIL & LOGOUT BAWAH */}
        <div className="p-6 space-y-6 bg-slate-100 shrink-0">
          {/* Kotak Profil: Cekung */}
          <div className="flex items-center gap-4 p-4 bg-slate-100 rounded-[1.5rem] shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]">
            <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center font-black text-emerald-600 shadow-[3px_3px_6px_#cbd5e1,-3px_-3px_6px_#ffffff]">
              {user?.nama?.[0] || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black text-slate-700 truncate">
                {user?.nama || "User"}
              </p>
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">
                {user?.role || "GUEST"}
              </p>
            </div>
          </div>
          {/* Tombol Logout: Timbul dan Empuk saat ditekan */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl text-red-500 font-black text-sm shadow-[5px_5px_10px_#cbd5e1,-5px_-5px_10px_#ffffff] hover:text-red-600 active:shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] active:translate-y-[2px] transition-all outline-none"
          >
            <LogOut size={18} /> Keluar Sistem
          </button>
        </div>
      </aside>

      {/* KONTEN KANAN */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* HEADER ATAS - Shadow jatuh ke bawah */}
        <header className="h-20 shrink-0 bg-slate-100 flex items-center justify-between px-6 md:px-8 sticky top-0 z-40 shadow-[0_5px_15px_#cbd5e1]">
          <div className="flex items-center gap-4">
            {/* Tombol Menu Hamburger Mobile (Timbul 3D) */}
            <button
              className="lg:hidden p-2.5 text-slate-500 rounded-xl shadow-[3px_3px_6px_#cbd5e1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] active:translate-y-[1px] transition-all outline-none"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h2 className="font-black text-slate-700 text-lg md:text-xl tracking-tight">
              {menu.find((m) => m.id === active)?.label || "Dashboard"}
            </h2>
          </div>
          <div className="hidden md:block">
            {/* Badge dari Ui.jsx sudah terintegrasi Neumorphism */}
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
