// src/pages/LoginPage.jsx
import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
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
    // Overflow hidden ditambahkan untuk mencegah scroll pada halaman login
    <div className="bg-slate-50 flex items-center justify-center p-6 font-sans relative overflow-hidden origin-top-left w-full h-screen md:w-[133.333vw] md:h-[133.333vh] md:[zoom:0.75]">
      {/* Latar Belakang Animasi */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 45, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[20rem] md:w-[35rem] h-[20rem] md:h-[35rem] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, -45, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[20rem] md:w-[35rem] h-[20rem] md:h-[35rem] bg-amber-400/10 rounded-full blur-3xl pointer-events-none"
      />

      {/* FORM CARD - Lebar disesuaikan agar lebih slim & menyisakan ruang v-space */}
      {/* (Hanya ditambahkan 'overflow-hidden' pada class bawaan di bawah ini) */}
      <div className="w-full max-w-[360px] sm:max-w-[380px] bg-white/90 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 relative z-10 border border-white/50 overflow-hidden">
        {/* === MULAI TAMBAHAN ANIMASI STROKE MENGKILAP === */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_75%,#10b981_100%)] pointer-events-none -z-20"
        />
        {/* Layer solid di dalam untuk menutupi bagian tengah agar warna hijau hanya terlihat sebagai stroke/border */}
        <div className="absolute inset-[2px] bg-white/95 backdrop-blur-2xl rounded-[2.5rem] pointer-events-none -z-10" />
        {/* === AKHIR TAMBAHAN === */}

        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-5 relative overflow-hidden rounded-2xl group">
            <img
              src={logoTADBIRA}
              alt="Logo TADBIRA"
              className="w-full h-full object-contain drop-shadow-xl relative z-10"
            />
            <motion.div
              className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-20deg] z-20 pointer-events-none"
              animate={{ left: ["-100%", "200%"] }}
              transition={{ duration: 8, repeat: Infinity, repeatDelay: 3 }}
            />
          </div>

          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            TADBIRA
          </h1>
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-2">
            "Tata Kelola Digital Berbasis Akurasi"
          </p>
          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">
            Online Based Test 2026
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-center justify-center gap-2">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-wider">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <User size={18} />
              </div>
              <input
                type="text"
                required
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-sm text-slate-800 outline-none focus:bg-white focus:border-emerald-500 transition-all placeholder:text-slate-300"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-sm text-slate-800 outline-none focus:bg-white focus:border-emerald-500 transition-all placeholder:text-slate-300"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-white font-black py-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 active:scale-95 transition-all uppercase tracking-[0.2em] disabled:opacity-70"
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

        <p className="text-center mt-10 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
          &copy; 2026 Ahmad Maulana
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
