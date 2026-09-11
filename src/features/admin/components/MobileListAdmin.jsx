import React, { useState } from "react";
import { TableSkeleton } from "../../../components/ui/Ui";
import { RefreshCw, Trash2 } from "lucide-react";
import EditableCell from "../../../components/ui/EditableCell";
import UserProfileAvatar from "../../../components/ui/UserProfileAvatar";

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
            <MobileDataRow
              key={item.id}
              item={item}
              currentConfig={currentConfig}
              allData={allData}
              tab={tab}
              handleSaveCell={handleSaveCell}
              confirmDelete={confirmDelete}
              getFilterOptions={getFilterOptions}
            />
          ))
        )}
      </div>
    </div>
  );
}

function MobileDataRow({
  item,
  currentConfig,
  allData,
  tab,
  handleSaveCell,
  confirmDelete,
  getFilterOptions,
}) {
  const [expanded, setExpanded] = useState(Boolean(item.isNew));
  const columns = currentConfig.columns;
  const nameColumn = columns[1];
  const roleColumn = columns.find((column) => column.key === "role");
  const classColumn = columns.find((column) => column.key === "kelas");
  const editableColumn = (col) =>
    col.key === "mapel" && tab === "jadwal"
      ? {
          ...col,
          options: [...new Set(allData.mapel.map((m) => m.nama_mapel).filter(Boolean))],
        }
      : col.isCombobox
        ? {
            ...col,
            options: [...new Set([...(col.options || []), ...getFilterOptions(col.key)])],
          }
        : col;

  return (
    <div className={`px-3 py-2 transition-colors ${item.isNew ? "bg-amber-50" : "bg-white"}`}>
      <div className="flex min-h-[52px] items-center gap-2">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          aria-expanded={expanded}
        >
          <EditableCell item={item} column={columns[0]} onSave={handleSaveCell} />
          {tab === "siswa" && (
            <UserProfileAvatar
              src={item.foto_profil}
              position={item.foto_posisi}
              name={item.nama}
              gender={item.jenis_kelamin || item.gender}
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-black text-slate-800">
              <EditableCell item={item} column={nameColumn} onSave={handleSaveCell} />
            </div>
          </div>
          <div className="flex max-w-[38%] shrink-0 items-center gap-1 overflow-hidden">
            {roleColumn && (
              <span className="truncate rounded-md bg-emerald-100 px-1.5 py-1 text-[10px] font-black uppercase text-emerald-700">
                {item[roleColumn.key] || "-"}
              </span>
            )}
            {classColumn && (
              <span className="hidden truncate rounded-md bg-slate-100 px-1.5 py-1 text-[10px] font-bold text-slate-600 sm:inline">
                {item[classColumn.key] || "-"}
              </span>
            )}
          </div>
        </button>
        <button
          type="button"
          onClick={() => confirmDelete(item.id)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
          aria-label={`Hapus ${item[nameColumn.key] || "data"}`}
        >
          <Trash2 size={15} />
        </button>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 gap-2 border-t border-slate-100 pb-2 pt-2 text-xs sm:grid-cols-2">
          {columns.slice(2).map((col) => (
            <div key={col.key} className="min-w-0 rounded-lg border border-slate-100 bg-slate-50/70 px-2 py-1.5">
              <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {col.label}
              </span>
              <div className="min-w-0 font-semibold text-slate-700">
                <EditableCell item={item} column={editableColumn(col)} onSave={handleSaveCell} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
