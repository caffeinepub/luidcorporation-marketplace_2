import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const tabs = [
  { label: "Dashboard", path: "/admin" },
  { label: "Inventário", path: "/admin/inventory" },
  { label: "Utilizadores", path: "/admin/users" },
  { label: "Financeiro", path: "/admin/financial" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { clear } = useInternetIdentity();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Top Bar */}
      <div className="bg-[#0a0a0a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="font-bold text-lg">
              <span className="text-white">Luid</span>
              <span className="text-[#39FF14]">Corp</span>
              <span className="text-gray-400 text-sm font-normal ml-2">
                Admin
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/catalog"
                className="text-sm text-gray-400 hover:text-[#39FF14] transition-colors"
              >
                Ver Site
              </Link>
              <button
                type="button"
                onClick={() => {
                  clear();
                  navigate("/");
                }}
                className="text-sm text-gray-400 hover:text-red-400 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const active = location.pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    active
                      ? "border-[#39FF14] text-[#1a8a00]"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
