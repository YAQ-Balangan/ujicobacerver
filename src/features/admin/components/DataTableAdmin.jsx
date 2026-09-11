import React from "react";
import { ChevronUp, ChevronDown, ArrowUpDown, Trash2, Files, Share2 } from "lucide-react";
import { Card, TableSkeleton } from "../../../components/ui/Ui";
import EditableCell from "../../../components/ui/EditableCell";
import UserProfileAvatar from "../../../components/ui/UserProfileAvatar";

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
const isScheduleTable = tab === "jadwal";
const scheduleColumnWidths = {
  id: "64px",
  nama_ujian: "150px",
  mapel: "130px",
  kelas: "150px",
  tanggal: "105px",
  durasi_menit: "90px",
  token: "75px",
  acak_soal: "105px",
  status: "90px",
};

const getColumnStyle = (key) =>
  isScheduleTable && scheduleColumnWidths[key]
    ? { width: scheduleColumnWidths[key], maxWidth: scheduleColumnWidths[key] }
    : undefined;

return (
    <Card className="hidden md:flex flex-col w-full h-[clamp(320px,calc(100dvh-22rem),620px)] min-h-[320px] max-h-[620px] border border-slate-200 shadow-xl shadow-slate-200/40 bg-white rounded-2xl overflow-hidden relative">
      <div className="flex-1 overflow-auto w-full relative custom-scrollbar">
        <table className={`w-full text-left text-sm border-collapse ${isScheduleTable ? "table-fixed" : "whitespace-nowrap min-w-max"}`}>
          <thead className="sticky top-0 z-20 shadow-sm">
            <tr>
              {currentConfig.columns.map((col, index) => {
                const isID = index === 0;
                const isName = index === 1;
                const stickyStyle = isID
                  ? { position: "sticky", left: 0, zIndex: 30 }
                  : isName
                    ? { position: "sticky", left: "64px", zIndex: 30 }
                    : {};
                return (
                  <th
                    key={col.key}
                    style={{ ...stickyStyle, ...getColumnStyle(col.key) }}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`px-3 py-2.5 bg-slate-50 border-b-2 border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider ${isScheduleTable ? "whitespace-normal break-words" : ""} ${col.sortable ? "cursor-pointer hover:bg-slate-100" : ""} ${isID ? "border-r w-[64px]" : ""} ${isName ? "border-r shadow-[4px_0_10px_-4px_rgba(0,0,0,0.1)] w-[220px]" : ""}`}
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
              <th className="px-4 py-2.5 text-center bg-slate-50 border-b-2 border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider w-[120px]">
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
                        ? { position: "sticky", left: "64px", zIndex: 10 }
                        : {};
                    return (
                      <td
                        key={col.key}
                        style={{ ...stickyStyle, ...getColumnStyle(col.key) }}
                        className={`px-2 py-2 font-semibold text-sm text-slate-700 ${isScheduleTable ? "whitespace-normal break-words align-top" : ""} ${isID ? "border-r border-slate-100 bg-inherit" : ""} ${isName ? "border-r border-slate-100 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.03)] bg-inherit" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          {tab === "siswa" && isName && (
                            <UserProfileAvatar
                              src={item.foto_profil}
                              position={item.foto_posisi}
                              name={item.nama}
                              gender={item.jenis_kelamin || item.gender}
                            />
                          )}
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
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center whitespace-nowrap bg-inherit">
                    <div className="flex justify-center items-center gap-2">
                      {tab === "jadwal" && !item.isNew && (
                        <button
                          onClick={() => handleCopyBroadcast(item)}
                          className="p-1.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                          title="Salin Broadcast WA (Jadwal & Token)"
                        >
                          <Share2 size={16} />
                        </button>
                      )}
                      {!item.isNew && tab !== "settings" && (
                        <button
                          onClick={() => handleDuplicateRow(item)}
                          className="p-1.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                          title="Duplikat Data Ini (Clone)"
                        >
                          <Files size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => confirmDelete(item.id)}
                        className="p-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
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
