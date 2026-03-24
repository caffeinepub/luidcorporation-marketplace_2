import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import CatalogPage from "./pages/CatalogPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import MyScriptsPage from "./pages/MyScriptsPage";
import RegisterPage from "./pages/RegisterPage";
import ScriptDetailPage from "./pages/ScriptDetailPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFinancial from "./pages/admin/AdminFinancial";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminUsers from "./pages/admin/AdminUsers";

function ProtectedRoute({
  children,
  adminOnly = false,
}: { children: ReactNode; adminOnly?: boolean }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor } = useActor();

  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["isAdmin", identity?.getPrincipal().toString()],
    queryFn: () => actor!.isCallerAdmin(),
    enabled: !!actor && !!identity,
  });

  if (isInitializing || checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-[#39FF14]" />
      </div>
    );
  }

  if (!identity) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/my-scripts" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/script/:id" element={<ScriptDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/my-scripts"
          element={
            <ProtectedRoute>
              <MyScriptsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute adminOnly>
              <AdminInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/financial"
          element={
            <ProtectedRoute adminOnly>
              <AdminFinancial />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
