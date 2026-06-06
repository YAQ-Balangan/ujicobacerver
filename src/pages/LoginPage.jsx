// src/pages/LoginPage.jsx
// KODE SESUDAH
import React, { useState, useContext } from "react";
import {
  User,
  Lock,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import logoTADBIRA from "../assets/logo.svg";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(username, password);
    } catch (err) {
      setError("Username atau password tidak valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Padding luar diperkecil menjadi p-2 agar menyesuaikan margin
    <div className="bg-slate-100 flex items-center justify-center p-2 font-sans w-full min-h-screen">
      {/* FORM CARD - Diperkecil (max-w-[320px]), margin m-2 sekeliling, dan padding p-6 */}
      <div className="w-full max-w-[320px] m-2 bg-slate-100 p-6 rounded-[2rem] shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] relative z-10 transition-all duration-300">
        {/* LOGO & JUDUL - Diperkecil ukurannya */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-16 h-16 flex items-center justify-center mb-4 rounded-2xl shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff] bg-slate-100 p-2.5">
            <img
              src={logoTADBIRA}
              alt="Logo TADBIRA"
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="text-xl font-black text-slate-700 tracking-tight">
            TADBIRA
          </h1>
          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5">
            "Tata Kelola Digital Berbasis Akurasi"
          </p>
          <p className="text-[8px] font-bold text-amber-600 uppercase tracking-widest mt-1">
            Online Based Test 2026
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-[10px] font-bold rounded-xl shadow-[inset_3px_3px_6px_#fca5a5,inset_-3px_-3px_6px_#fef2f2] flex items-center justify-center gap-1.5">
            <AlertTriangle size={12} />
            {error}
          </div>
        )}

        {/* Jarak antar form dirapatkan menjadi space-y-4 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* INPUT USERNAME */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-slate-500 ml-2 tracking-wider">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={14} />
              </div>
              {/* Input diperkecil (py-2.5, text-xs, rounded-xl) bayangan disesuaikan */}
              <input
                type="text"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-slate-100 rounded-xl font-semibold text-xs text-slate-700 outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] focus:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] transition-all duration-300 placeholder:text-slate-400"
                placeholder="Masukkan Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* INPUT PASSWORD */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-slate-500 ml-2 tracking-wider">
              Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={14} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-9 pr-10 py-2.5 bg-slate-100 rounded-xl font-semibold text-xs text-slate-700 outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] focus:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] transition-all duration-300 placeholder:text-slate-400"
                placeholder="Masukkan Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* TOMBOL MATA POP IT - Diperkecil */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1.5 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-500 shadow-[2px_2px_4px_#cbd5e1,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] active:translate-y-[1px] transition-all duration-150 outline-none"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* TOMBOL MASUK POP IT - Diperkecil namun tetap empuk */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-white font-black py-3 rounded-xl text-[11px] flex items-center justify-center gap-1.5 shadow-[5px_5px_10px_#cbd5e1,-5px_-5px_10px_#ffffff] hover:bg-emerald-400 active:shadow-[inset_4px_4px_8px_#047857,inset_-4px_-4px_8px_#34d399] active:translate-y-[2px] transition-all duration-150 uppercase tracking-[0.2em] disabled:opacity-70 disabled:cursor-not-allowed outline-none"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Masuk <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-center mt-8 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
          &copy; 2026 Ahmad Maulana
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
