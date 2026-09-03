import React from "react";
import { ChevronUp, ChevronDown, ArrowUpDown, Trash2, Files, Share2 } from "lucide-react";
import { Card, TableSkeleton } from "../../../components/ui/Ui";
import EditableCell from "../../../components/ui/EditableCell";

export default function DataTableAdmin({
  currentConfig,
  processedData,
  loading,
  data,
  tab,
  allData,
  sortConfig,
  handleSort,
  handleSaveCell,
  confirmDelete,
  handleDuplicateRow,
  handleCopyBroadcast,
  getFilterOptions,
}) {
  return (
    <Card className="hidden md:flex flex-col w-full h-[clamp(360px,calc(100dvh-27rem),620px)] min-h-[360px] max-h-[620px] border border-slate-200 shadow-xl shadow-slate-200/40 bg-white rounded-[2rem] overflow-hidden relative">
      <div className="flex-1 overflow-auto w-full relative custom-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap border-collapse min-w-max">
          <thead className="sticky top-0 z-20 shadow-sm">
            <tr>
              {currentConfig.columns.map((col, index) => {
                const isID = index === 0;
                const isName = index === 1;
                const stickyStyle = isID
                  ? { position: "sticky", left: 0, zIndex: 30 }
                  : isName
                    ? { position: "sticky", left: "80px", zIndex: 30 }
                    : {};
                return (
                  <th
                    key={col.key}
                    style={stickyStyle}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`px-6 py-5 bg-slate-50 border-b-2 border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider ${col.sortable ? "cursor-pointer hover:bg-slate-100" : ""} ${isID ? "border-r w-[80px]" : ""} ${isName ? "border-r shadow-[4px_0_10px_-4px_rgba(0,0,0,0.1)] w-[240px]" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          sortConfig.key === col.key
                            ? "text-emerald-700 font-black"
                            : ""
                        }
                      >
                        {col.label}
                      </span>
                      {col.sortable && (
                        <div className="flex items-center">
                          {sortConfig.key === col.key ? (
                            sortConfig.direction === "asc" ? (
                              <ChevronUp
                                size={14}
                                className="text-emerald-600 font-black"
                              />
                            ) : (
                              <ChevronDown
                                size={14}
                                className="text-emerald-600 font-black"
                              />
                            )
                          ) : (
                            <ArrowUpDown
                              size={12}
                              className="text-slate-400"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
              <th className="px-6 py-5 text-center bg-slate-50 border-b-2 border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider w-[140px]">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && data.length === 0 ? (
              <tr>
                <td
                  colSpan={currentConfig.columns.length + 1}
                  className="py-20 text-center text-slate-400 font-bold text-sm bg-white"
                >
                  <TableSkeleton rows={5} columns={Math.min(currentConfig.columns.length, 5)} />
                </td>
              </tr>
            ) : processedData.length === 0 ? (
              <tr>
                <td
                  colSpan={currentConfig.columns.length + 1}
                  className="py-20 text-center text-slate-400 font-semibold text-base bg-white"
                >
                  Belum ada data. Klik "Tambah Data Baru".
                </td>
              </tr>
            ) : (
              processedData.map((item) => (
                <tr
                  key={item.id}
                  className={`transition-colors group ${item.isNew ? "bg-amber-50 hover:bg-amber-100" : "bg-white hover:bg-slate-50"}`}
                >
                  {currentConfig.columns.map((col, index) => {
                    const isID = index === 0;
                    const isName = index === 1;
                    const stickyStyle = isID
                      ? { position: "sticky", left: 0, zIndex: 10 }
                      : isName
                        ? { position: "sticky", left: "80px", zIndex: 10 }
                        : {};
                    return (
                      <td
                        key={col.key}
                        style={stickyStyle}
                        className={`px-4 py-3 font-semibold text-slate-700 ${isID ? "border-r border-slate-100 bg-inherit" : ""} ${isName ? "border-r border-slate-100 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.03)] bg-inherit" : ""}`}
                      >
                        <EditableCell
                          item={item}
                          column={
                            col.key === "mapel" && tab === "jadwal"
                              ? {
                                  ...col,
                                  options: [
                                    ...new Set(
                                      allData.mapel
                                        .map((m) => m.nama_mapel)
                                        .filter(Boolean),
                                    ),
                                  ],
                                }
                              : col.isCombobox
                                ? {
                                    ...col,
                                    options: [
                                      ...new Set([
                                        ...col.options,
                                        ...getFilterOptions(col.key),
                                      ]),
                                    ],
                                  }
                                : col
                          }
                          onSave={handleSaveCell}
                        />
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center whitespace-nowrap bg-inherit">
                    <div className="flex justify-center items-center gap-2">
                      {tab === "jadwal" && !item.isNew && (
                        <button
                          onClick={() => handleCopyBroadcast(item)}
                          className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                          title="Salin Broadcast WA (Jadwal & Token)"
                        >
                          <Share2 size={16} />
                        </button>
                      )}
                      {!item.isNew && tab !== "settings" && (
                        <button
                          onClick={() => handleDuplicateRow(item)}
                          className="p-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                          title="Duplikat Data Ini (Clone)"
                        >
                          <Files size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => confirmDelete(item.id)}
                        className="p-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        title="Hapus Baris"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
