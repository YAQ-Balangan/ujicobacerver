// src/components/layout/Dashboard.jsx
import React, { useState, useContext, useEffect } from "react";
import { LogOut, Menu } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { Badge } from "../ui/Ui";
import logoMasda from "../../assets/logo.svg";

const Dashboard = ({
  children,
  menu = [],
  active,
  setActive,
}) => {
  const { user, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  return (
    <div className="tadbira-shell bg-[#edf5ff] flex h-screen max-h-screen min-h-0 w-full overflow-hidden font-sans relative">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`tadbira-sidebar fixed inset-y-0 left-0 z-50 w-[min(18rem,88vw)] bg-[#f8fbff] transition-transform duration-300 lg:translate-x-0 lg:static lg:sticky lg:top-0 flex flex-col h-screen border-r border-sky-100 shadow-[6px_0_18px_rgba(14,116,144,0.10)] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center shrink-0 rounded-2xl border border-sky-100 bg-white p-2 shadow-[0_8px_18px_rgba(14,116,144,0.12)]">
              <img
                src={logoMasda}
                alt="Logo TADBIRA"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                TADBIRA
              </h2>
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest leading-none mt-1.5">
                Version 1.0
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 scrollbar-hide pt-2">
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm outline-none border ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-100 via-emerald-50 to-cyan-50 border-emerald-200 text-emerald-800 font-black shadow-[inset_0_2px_0_rgba(255,255,255,0.85),0_4px_12px_rgba(16,185,129,0.12)]"
                      : "bg-white/80 border-slate-200/80 text-slate-700 hover:text-sky-700 hover:border-sky-200 hover:bg-sky-50 font-bold shadow-[0_4px_12px_rgba(15,23,42,0.035)]"
                  }`}
                >
                  {item.icon && (
                    <item.icon
                      size={20}
                      className={isActive ? "text-emerald-600" : "text-slate-500"}
                    />
                  )}
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 sm:p-6 space-y-3 bg-[#f8fbff] shrink-0 border-t border-sky-100">
          <div className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-[0_6px_16px_rgba(15,23,42,0.05)]">
            <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center font-black text-emerald-700 border border-emerald-200">
              {user?.nama?.[0] || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black text-slate-800 truncate">
                {user?.nama || "User"}
              </p>
              <p className="text-[10px] font-bold text-sky-700 uppercase tracking-widest mt-1">
                {user?.role || "GUEST"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl text-red-600 font-black text-sm bg-white border border-red-200 shadow-[0_8px_18px_rgba(220,38,38,0.08)] hover:bg-red-50 active:translate-y-[1px] transition-all outline-none"
          >
            <LogOut size={18} /> Keluar Sistem
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-0 relative">
        <header className="tadbira-header min-h-16 md:h-[4.5rem] shrink-0 bg-[#f8fbff] flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3 sticky top-0 z-40 border-b border-sky-100 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-4">
            <button
              aria-label="Buka menu navigasi"
              aria-expanded={mobileOpen}
              className="lg:hidden p-2.5 text-slate-700 rounded-xl bg-white border border-slate-200 shadow-[0_4px_10px_rgba(15,23,42,0.06)] active:translate-y-[1px] transition-all outline-none"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h2 className="font-black text-slate-800 text-lg md:text-xl tracking-tight">
              {menu.find((m) => m.id === active)?.label || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <Badge type={user?.role || "guest"} />
            </div>
            <button
              type="button"
              onClick={logout}
              aria-label="Keluar Sistem"
              className="lg:hidden flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-black text-red-600 shadow-sm active:translate-y-px"
            >
              <LogOut size={16} />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        <main className="tadbira-main flex-1 min-w-0 overflow-y-auto overscroll-contain p-3 sm:p-5 md:p-7 lg:p-10 relative scrollbar-thin bg-[#f3f7ff]">
          <div className="mx-auto w-full max-w-[1500px]">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
