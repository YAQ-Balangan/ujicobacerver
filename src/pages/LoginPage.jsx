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
    // Background menggunakan warna solid (slate-100) yang membaur sempurna dengan bayangan
    <div className="bg-slate-100 flex items-center justify-center p-6 font-sans w-full min-h-screen">
      {/* FORM CARD - Menggunakan efek Neumorphism (bayangan ganda terang dan gelap) */}
      <div className="w-full max-w-[360px] sm:max-w-[380px] bg-slate-100 p-8 sm:p-10 rounded-[2.5rem] shadow-[12px_12px_24px_#cbd5e1,-12px_-12px_24px_#ffffff] relative z-10 transition-all duration-300">
        <div className="flex flex-col items-center mb-8 text-center">
          {/* Logo container dibuat agak menonjol juga */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-5 rounded-2xl shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] bg-slate-100 p-3">
            <img
              src={logoTADBIRA}
              alt="Logo TADBIRA"
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="text-2xl font-black text-slate-700 tracking-tight">
            TADBIRA
          </h1>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-2">
            "Tata Kelola Digital Berbasis Akurasi"
          </p>
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1">
            Online Based Test 2026
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl shadow-[inset_4px_4px_8px_#fca5a5,inset_-4px_-4px_8px_#fef2f2] flex items-center justify-center gap-2">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-2 tracking-wider">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <User size={18} />
              </div>
              {/* Efek INSET shadow pada input agar terlihat seperti cekungan ke dalam */}
              <input
                type="text"
                required
                className="w-full pl-12 pr-4 py-3.5 bg-slate-100 rounded-2xl font-semibold text-sm text-slate-700 outline-none shadow-[inset_5px_5px_10px_#cbd5e1,inset_-5px_-5px_10px_#ffffff] focus:shadow-[inset_2px_2px_5px_#cbd5e1,inset_-2px_-2px_5px_#ffffff] transition-all duration-300 placeholder:text-slate-400"
                placeholder="Masukkan Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-2 tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              {/* Efek INSET yang sama untuk form password */}
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-12 pr-12 py-3.5 bg-slate-100 rounded-2xl font-semibold text-sm text-slate-700 outline-none shadow-[inset_5px_5px_10px_#cbd5e1,inset_-5px_-5px_10px_#ffffff] focus:shadow-[inset_2px_2px_5px_#cbd5e1,inset_-2px_-2px_5px_#ffffff] transition-all duration-300 placeholder:text-slate-400"
                placeholder="Masukkan Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-6">
            {/* Tombol yang memiliki efek 3D timbul, lalu ketika di klik (active) efeknya berbalik ke dalam seakan ditekan */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-white font-black py-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] hover:bg-emerald-400 active:shadow-[inset_4px_4px_8px_#047857,inset_-4px_-4px_8px_#34d399] active:translate-y-[2px] transition-all duration-200 uppercase tracking-[0.2em] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Masuk <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-center mt-10 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          &copy; 2026 Ahmad Maulana
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
