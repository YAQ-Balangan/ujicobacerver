import React from "react";
import { Search, RefreshCw } from "lucide-react";
import { Card, PremiumSelect } from "../../../components/ui/Ui";

export default function FiltersToolbar({
  search,
  setSearch,
  filters,
  setFilters,
  currentConfig,
  getFilterOptions,
  refreshCurrentTab,
  loading,
  isSyncing,
}) {
  return (
    <Card className="flex-1 p-3 bg-white border border-slate-200 shadow-sm w-full rounded-[2rem] box-border flex flex-col justify-center">
      <div className="flex flex-col md:flex-row items-center gap-3 w-full px-2">
        <div className="flex items-center gap-2 w-full md:flex-1 md:border-r border-slate-200 pr-4">
          <Search className="text-slate-400 shrink-0" size={20} />
          <input
            className="w-full bg-transparent border-none outline-none font-medium text-base text-slate-700 py-2"
            placeholder="Ketik pencarian..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap items-center gap-3 w-full md:w-auto min-w-0">
            {currentConfig.columns
              .filter((c) => c.filterable)
              .map((col) => (
                <div key={col.key} className="w-full md:w-40">
                  <PremiumSelect
                    value={filters[col.key] || ""}
                    onChange={(val) => setFilters({ ...filters, [col.key]: val })}
                    options={[
                      { label: `Semua ${col.label}`, value: "" },
                      ...getFilterOptions(col.key).map((opt) => ({ label: opt, value: opt })),
                    ]}
                    placeholder={`Filter ${col.label}`}
                  />
                </div>
              ))}
          </div>
        </div>

        <button
          type="button"
          aria-label="Muat ulang data"
          title="Muat ulang data"
          onClick={() => refreshCurrentTab(false)}
          className="flex justify-center items-center gap-2 p-3.5 text-slate-500 bg-slate-50 border border-slate-200 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 rounded-xl transition-all shadow-sm"
        >
          <RefreshCw size={18} className={loading || isSyncing ? "animate-spin" : ""} />
        </button>
      </div>
    </Card>
  );
}
