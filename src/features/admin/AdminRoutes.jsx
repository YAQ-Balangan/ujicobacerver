import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PageSkeleton } from "../../components/ui/Ui";

const AdminDashboard = React.lazy(() => import("./AdminDashboard"));
const AdminUsers = React.lazy(() => import("./pages/Users"));
const AdminJadwal = React.lazy(() => import("./pages/Jadwal"));
const AdminMapel = React.lazy(() => import("./pages/Mapel"));

export default function AdminRoutes() {
  return (
    <React.Suspense fallback={<PageSkeleton label="Menyiapkan halaman admin" />}>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/jadwal" element={<AdminJadwal />} />
        <Route path="/mapel" element={<AdminMapel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
}
