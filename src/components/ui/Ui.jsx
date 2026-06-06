// src/components/ui/Ui.jsx
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Check,
  CheckSquare,
  Square,
  ImagePlus,
} from "lucide-react";
import "katex/dist/katex.min.css";
import renderMathInElement from "katex/contrib/auto-render";

// ==========================================
// CARD (KARTU UTAMA 3D TIMBUL)
// ==========================================
export const Card = ({ children, className = "" }) => (
  <div
    className={`bg-slate-100 rounded-[1.5rem] md:rounded-[2rem] shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);

// ==========================================
// BADGE (GELEMBUNG 3D KECIL)
// ==========================================
export const Badge = ({ type }) => {
  const safeType = type || "guest";

  // Desain gelembung 3D untuk badge
  const map = {
    admin: "text-amber-600 shadow-[3px_3px_6px_#cbd5e1,-3px_-3px_6px_#ffffff]",
    guru: "text-emerald-600 shadow-[3px_3px_6px_#cbd5e1,-3px_-3px_6px_#ffffff]",
    siswa: "text-slate-500 shadow-[3px_3px_6px_#cbd5e1,-3px_-3px_6px_#ffffff]",
    Aktif:
      "bg-emerald-500 text-white shadow-[3px_3px_6px_#cbd5e1,-3px_-3px_6px_#ffffff] animate-pulse",
    Selesai:
      "text-slate-400 shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff]", // Efek selesai (melesak ke dalam)
    Draft: "text-amber-500 shadow-[3px_3px_6px_#cbd5e1,-3px_-3px_6px_#ffffff]",
    guest: "text-slate-400 shadow-[3px_3px_6px_#cbd5e1,-3px_-3px_6px_#ffffff]",
  };

  return (
    <span
      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center w-max bg-slate-100 ${map[safeType] || map.guest}`}
    >
      {safeType}
    </span>
  );
};

// ==========================================
// KOMPONEN PREMIUM CUSTOM DROPDOWN (CEKUNG)
// ==========================================
export const PremiumSelect = ({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );
  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value),
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* TOMBOL SELECT - Efek Cekung (Inset) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-2.5 md:p-3 text-sm bg-slate-100 transition-all rounded-lg md:rounded-xl outline-none min-h-[40px] md:min-h-[44px] ${
          disabled
            ? "shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] text-slate-400 cursor-not-allowed opacity-70"
            : "shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] text-slate-700 focus:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] cursor-pointer"
        }`}
      >
        <span
          className={`flex items-center gap-2 line-clamp-2 text-left break-words ${!selectedOption ? "text-slate-400 font-medium" : "font-bold"}`}
        >
          {icon && <span className="text-emerald-600 shrink-0">{icon}</span>}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 shrink-0 ml-2 transition-transform duration-300 ${isOpen ? "rotate-180 text-emerald-500" : ""}`}
        />
      </button>

      {/* DROPDOWN PANEL - Efek Timbul 3D */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-3 bg-slate-100 rounded-xl shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] max-h-60 overflow-hidden flex flex-col"
          >
            <div className="p-3 pb-1">
              <input
                type="text"
                autoFocus
                placeholder="Cari..."
                className="w-full px-4 py-2 text-sm bg-slate-100 rounded-lg outline-none shadow-[inset_3px_3px_6px_#cbd5e1,inset_-3px_-3px_6px_#ffffff] text-slate-700 placeholder:text-slate-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="overflow-y-auto max-h-48 py-2 px-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, index) => {
                  if (opt.isLabel) {
                    return (
                      <div
                        key={index}
                        className="px-4 pt-3 pb-1 text-[9px] font-black text-emerald-600 uppercase tracking-widest sticky top-0 bg-slate-100/90 backdrop-blur-sm z-10"
                      >
                        {opt.label}
                      </div>
                    );
                  }
                  const isSelected = String(opt.value) === String(value);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 my-1 text-sm transition-all text-left rounded-lg ${
                        isSelected
                          ? "shadow-[inset_3px_3px_6px_#cbd5e1,inset_-3px_-3px_6px_#ffffff] text-emerald-700 font-bold"
                          : "text-slate-600 hover:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] font-medium"
                      }`}
                    >
                      <span className="whitespace-normal break-words pr-2">
                        {opt.label}
                      </span>
                      {isSelected && (
                        <Check
                          size={16}
                          className="text-emerald-500 shrink-0 ml-2"
                        />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-3 text-sm text-slate-400 italic text-center">
                  Opsi tidak ditemukan
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// KOMPONEN PREMIUM MULTI-SELECT CHECKBOX (CEKUNG)
// ==========================================
export const PremiumMultiSelect = ({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );
  const selectedArray = value
    ? String(value)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const toggleOption = (optValue) => {
    let newArr = [...selectedArray];
    if (newArr.includes(optValue))
      newArr = newArr.filter((i) => i !== optValue);
    else newArr.push(optValue);
    onChange(newArr.join(", "));
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-2.5 md:p-3 text-sm bg-slate-100 transition-all rounded-lg md:rounded-xl outline-none min-h-[40px] md:min-h-[44px] ${
          disabled
            ? "shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] text-slate-400 cursor-not-allowed opacity-70"
            : "shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] text-slate-700 focus:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] cursor-pointer"
        }`}
      >
        <span
          className={`line-clamp-2 text-left break-words pr-2 ${selectedArray.length === 0 ? "text-slate-400 font-medium" : "font-bold"}`}
        >
          {selectedArray.length === 0
            ? placeholder
            : selectedArray.length > 2
              ? `${selectedArray.length} Kelas Dipilih`
              : selectedArray.join(", ")}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-emerald-500" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full md:w-80 mt-3 bg-slate-100 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] rounded-xl flex flex-col max-h-72 overflow-hidden max-w-[90vw]"
          >
            <div className="p-3 pb-1 sticky top-0 flex flex-col gap-2 z-10 bg-slate-100">
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  Pilih Sasaran
                </span>
                {selectedArray.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onChange("")}
                    className="text-[9px] font-bold text-red-500 hover:shadow-[inset_2px_2px_4px_#fca5a5,inset_-2px_-2px_4px_#fef2f2] px-2 py-1 rounded-lg transition-all"
                  >
                    Reset
                  </button>
                )}
              </div>
              <input
                type="text"
                autoFocus
                placeholder="Cari kelas..."
                className="w-full px-4 py-2 text-xs bg-slate-100 rounded-lg outline-none shadow-[inset_3px_3px_6px_#cbd5e1,inset_-3px_-3px_6px_#ffffff] text-slate-700 placeholder:text-slate-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="overflow-y-auto p-2 scrollbar-thin flex flex-col gap-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, index) => {
                  if (opt.isLabel)
                    return (
                      <div
                        key={index}
                        className="px-3 pt-3 pb-1 text-[9px] font-black text-emerald-600 uppercase tracking-widest sticky top-0 bg-slate-100/90 backdrop-blur-sm"
                      >
                        {opt.label}
                      </div>
                    );
                  const isSelected = selectedArray.includes(opt.value);
                  return (
                    <div
                      key={index}
                      onClick={() => toggleOption(opt.value)}
                      className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? "shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] text-emerald-700 font-bold"
                          : "hover:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] text-slate-600 font-medium"
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare
                          size={16}
                          className="text-emerald-500 shrink-0"
                        />
                      ) : (
                        <Square size={16} className="text-slate-400 shrink-0" />
                      )}
                      <span className="text-xs md:text-sm whitespace-normal break-words leading-tight">
                        {opt.label}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-xs text-slate-400 italic text-center">
                  Kelas tidak ditemukan
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// KOMPONEN EDITOR GOOGLE FORM STYLE (POP-IT 3D)
// ==========================================
export const GoogleFormEditor = ({
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
      className={`bg-slate-100 rounded-xl md:rounded-[1.5rem] overflow-hidden shadow-[inset_6px_6px_12px_#cbd5e1,inset_-6px_-6px_12px_#ffffff] transition-all duration-300 ${disabled ? "opacity-60 cursor-not-allowed" : "focus-within:shadow-[inset_3px_3px_6px_#cbd5e1,inset_-3px_-3px_6px_#ffffff]"}`}
    >
      {/* TOOLBAR EDITOR - Pop It Buttons */}
      <div className="flex flex-wrap gap-2 p-3 pb-2 border-b border-slate-200/40">
        <button
          type="button"
          onMouseDown={(e) => execCmd("bold", e)}
          className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-slate-600 font-bold shadow-[3px_3px_6px_#cbd5e1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] active:translate-y-[1px] transition-all outline-none"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(e) => execCmd("italic", e)}
          className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-slate-600 italic font-serif shadow-[3px_3px_6px_#cbd5e1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] active:translate-y-[1px] transition-all outline-none"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={(e) => execCmd("underline", e)}
          className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-slate-600 underline shadow-[3px_3px_6px_#cbd5e1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] active:translate-y-[1px] transition-all outline-none"
          title="Underline"
        >
          U
        </button>

        <div className="w-px bg-slate-300/50 mx-1 rounded-full"></div>

        {onImageUpload && (
          <label className="cursor-pointer px-3 md:px-4 h-8 md:h-9 flex items-center justify-center gap-2 rounded-lg text-emerald-600 text-xs font-bold shadow-[3px_3px_6px_#cbd5e1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] active:translate-y-[1px] transition-all outline-none">
            <ImagePlus size={14} /> Sisipkan Foto
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

      {/* TEXT AREA INTI */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onBlur={handleInput}
        className="p-4 md:p-5 min-h-[120px] text-sm md:text-base text-slate-700 outline-none whitespace-pre-wrap empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 cursor-text"
        data-placeholder={placeholder}
      />
    </div>
  );
};

// ==========================================
// KOMPONEN LATEX (Matematika)
// ==========================================
export const Latex = React.memo(({ children }) => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      renderMathInElement(containerRef.current, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
      });
    }
  }, [children]);

  return (
    <span
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: children || "" }}
    />
  );
});
