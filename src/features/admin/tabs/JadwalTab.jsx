import React from "react";
import DataTableAdmin from "../components/DataTableAdmin";
import MobileListAdmin from "../components/MobileListAdmin";

export default function JadwalTab(props) {
  const {
    processedData,
    loading,
    data,
    currentConfig,
    allData,
    tab,
    handleSaveCell,
    confirmDelete,
    handleDuplicateRow,
    handleCopyBroadcast,
    getFilterOptions,
    sortConfig,
    handleSort,
  } = props;

  return (
    <>
      <MobileListAdmin
        processedData={processedData}
        loading={loading}
        data={data}
        currentConfig={currentConfig}
        allData={allData}
        tab={tab}
        handleSaveCell={handleSaveCell}
        confirmDelete={confirmDelete}
        handleDuplicateRow={handleDuplicateRow}
        handleCopyBroadcast={handleCopyBroadcast}
        getFilterOptions={getFilterOptions}
      />

      <div className="hidden md:flex shrink-0 flex-col gap-4">
        <DataTableAdmin
          currentConfig={currentConfig}
          processedData={processedData}
          loading={loading}
          data={data}
          tab={tab}
          allData={allData}
          sortConfig={sortConfig}
          handleSort={handleSort}
          handleSaveCell={handleSaveCell}
          confirmDelete={confirmDelete}
          handleDuplicateRow={handleDuplicateRow}
          handleCopyBroadcast={handleCopyBroadcast}
          getFilterOptions={getFilterOptions}
        />
      </div>
    </>
  );
}
