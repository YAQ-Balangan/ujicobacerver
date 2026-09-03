import React from "react";
import { TableSkeleton } from "../../../components/ui/Ui";
import { RefreshCw, Trash2 } from "lucide-react";
import EditableCell from "../../../components/ui/EditableCell";

export default function MobileListAdmin({
  processedData,
  loading,
  data,
  currentConfig,
  allData,
  tab,
  handleSaveCell,
  confirmDelete,
  getFilterOptions,
}) {
  return (
    <div className="md:hidden flex flex-col flex-1 min-h-0 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm overflow-hidden mx-2 mb-2">
      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
        {loading && data.length === 0 ? (
          <div className="py-16 text-center">
            <RefreshCw className="animate-spin mx-auto text-emerald-500 mb-3" size={28} />
            <TableSkeleton rows={4} columns={1} />
          </div>
        ) : processedData.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-medium text-sm">Belum ada data.</div>
        ) : (
          processedData.map((item) => (
            <div
              key={item.id}
              className={`p-4 transition-colors flex flex-col gap-2 ${item.isNew ? "bg-amber-50" : "hover:bg-slate-50"}`}
            >
              <div className="flex justify-between items-start gap-3 border-b border-slate-100 pb-3 mb-1">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest shrink-0">ID:</span>
                    <EditableCell item={item} column={currentConfig.columns[0]} onSave={handleSaveCell} />
                  </div>
                  <div className="font-black text-slate-800 text-sm mt-1">
                    <EditableCell item={item} column={currentConfig.columns[1]} onSave={handleSaveCell} />
                  </div>
                </div>
                <button
                  onClick={() => confirmDelete(item.id)}
                  className="p-2.5 text-red-500 bg-red-50 rounded-xl border border-red-100 hover:bg-red-500 hover:text-white transition-colors shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-2.5 text-xs">
                {currentConfig.columns.slice(2).map((col) => (
                  <div key={col.key} className="flex flex-col gap-1 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{col.label}</span>
                    <div className="font-semibold text-slate-700">
                      <EditableCell
                        item={item}
                        column={
                          col.key === "mapel" && tab === "jadwal"
                            ? {
                                ...col,
                                options: [
                                  ...new Set(allData.mapel.map((m) => m.nama_mapel).filter(Boolean)),
                                ],
                              }
                            : col.isCombobox
                              ? {
                                  ...col,
                                  options: [
                                    ...new Set([...(col.options || []), ...getFilterOptions(col.key)]),
                                  ],
                                }
                              : col
                        }
                        onSave={handleSaveCell}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
