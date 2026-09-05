/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { PremiumMultiSelect, Badge } from "./Ui";

const EditableCell = ({ item, column, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(item[column.key] || "");

  useEffect(() => {
    setVal(item[column.key] || "");
  }, [item[column.key]]);

  const triggerSave = () => {
    setIsEditing(false);
    if (String(val).trim() !== String(item[column.key] || "").trim()) {
      onSave(item.id, column.key, val);
    }
  };

  if (isEditing) {
    if (column.isMultiSelect) {
      return (
        <div className="flex flex-col gap-1.5 min-w-[200px]">
          <PremiumMultiSelect
            value={val}
            onChange={(newVal) => setVal(newVal)}
            options={column.options}
            placeholder="Pilih Kelas..."
          />
          <div className="flex gap-1 mt-1">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                triggerSave();
              }}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black tracking-widest uppercase py-1.5 rounded shadow-sm transition-colors"
            >
              Simpan
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                setIsEditing(false);
                setVal(item[column.key] || "");
              }}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-600 text-[10px] font-black tracking-widest uppercase py-1.5 rounded transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      );
    }
    if (column.isSelect) {
      return (
        <select
          autoFocus
          className="w-full p-1.5 border-2 border-emerald-500 rounded outline-none text-sm text-emerald-900 bg-emerald-50 font-bold shadow-sm"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={triggerSave}
          onKeyDown={(e) => e.key === "Enter" && triggerSave()}
        >
          <option value="">Pilih...</option>
          {column.options.map((opt, i) => {
            if (typeof opt === "object" && opt !== null) {
              if (opt.isLabel) {
                return (
                  <option
                    key={`label-${i}`}
                    disabled
                    className="font-black bg-slate-200 text-slate-500"
                  >
                    --- {opt.label} ---
                  </option>
                );
              }
              return (
                <option key={`opt-${i}`} value={opt.value}>
                  {opt.label}
                </option>
              );
            }
            return (
              <option key={`str-${i}`} value={opt}>
                {opt}
              </option>
            );
          })}
        </select>
      );
    }

    if (column.isDate) {
      return (
        <input
          autoFocus
          type="date"
          className="w-full p-1.5 border-2 border-emerald-500 rounded outline-none text-sm text-emerald-900 bg-emerald-50 font-bold shadow-sm"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={triggerSave}
          onKeyDown={(e) => e.key === "Enter" && triggerSave()}
        />
      );
    }

    if (column.isCombobox) {
      const listId = `list-${column.key}-${item.id}`;
      return (
        <>
          <input
            autoFocus
            list={listId}
            type="text"
            className="w-full p-1.5 border-2 border-emerald-500 rounded outline-none text-sm text-emerald-900 bg-emerald-50 font-bold shadow-sm"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={triggerSave}
            onKeyDown={(e) => e.key === "Enter" && triggerSave()}
            placeholder="Ketik atau pilih..."
          />
          <datalist id={listId}>
            {column.options.map((opt) => (
              <option key={opt} value={opt} />
            ))}
          </datalist>
        </>
      );
    }

    return (
      <input
        autoFocus
        type={column.isNumber ? "number" : "text"}
        className="w-full p-1.5 border-2 border-emerald-500 rounded outline-none text-sm text-emerald-900 bg-emerald-50 font-bold shadow-sm"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={triggerSave}
        onKeyDown={(e) => e.key === "Enter" && triggerSave()}
        placeholder="Ketik lalu Enter..."
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`w-full min-h-[28px] min-w-0 cursor-text hover:bg-emerald-50 hover:ring-1 hover:ring-emerald-200 rounded px-1.5 flex items-center transition-colors ${column.key === "id" ? "font-mono text-xs text-slate-500 bg-slate-100 border border-slate-200 hover:border-emerald-300 w-max" : "text-slate-700 break-words whitespace-normal overflow-hidden"}`}
      title="Klik untuk mengubah"
    >
      {column.key === "role" || column.key === "status" ? (
        <Badge type={val || "Kosong"} />
      ) : column.key === "id" ? (
        `#${val}`
      ) : (
        val || <span className="text-slate-300 italic text-xs">Kosong...</span>
      )}
    </div>
  );
};

export default EditableCell;
