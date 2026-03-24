import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function Navbar({ dark = false }: { dark?: boolean }) {
  const { identity, clear } = useInternetIdentity();
  const { actor } = useActor();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin", identity?.getPrincipal().toString()],
    queryFn: () => actor!.isCallerAdmin(),
    enabled: !!actor && !!identity,
  });

  const handleLogout = () => {
    clear();
    navigate("/");
  };

  const bg = dark ? "bg-[#0a0a0a]" : "bg-white border-b border-gray-100";
  const textClass = dark ? "text-gray-200" : "text-gray-700";
  const logoAccent = "text-[#39FF14]";

  return (
    <nav className={`sticky top-0 z-50 ${bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-1 font-bold text-xl">
            <span className={dark ? "text-white" : "text-gray-900"}>Luid</span>
            <span className={logoAccent}>Corp</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/catalog"
              className={`text-sm font-medium ${textClass} hover:text-[#39FF14] transition-colors`}
            >
              Catálogo
            </Link>
            {identity && (
              <Link
                to={isAdmin ? "/admin" : "/my-scripts"}
                className={`text-sm font-medium ${textClass} hover:text-[#39FF14] transition-colors`}
              >
                {isAdmin ? "Admin" : "Meus Scripts"}
              </Link>
            )}
            {identity ? (
              <button
                type="button"
                onClick={handleLogout}
                className="neon-outline px-4 py-1.5 rounded-md text-sm font-medium"
              >
                Sair
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-sm font-medium ${textClass} hover:text-[#39FF14] transition-colors`}
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="neon-btn px-4 py-1.5 rounded-md text-sm"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            type="button"
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div
              className={`w-5 h-0.5 mb-1 ${dark ? "bg-white" : "bg-gray-800"} transition-all`}
            />
            <div
              className={`w-5 h-0.5 mb-1 ${dark ? "bg-white" : "bg-gray-800"}`}
            />
            <div className={`w-5 h-0.5 ${dark ? "bg-white" : "bg-gray-800"}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={`md:hidden px-4 pb-4 flex flex-col gap-3 ${bg}`}>
          <Link
            to="/catalog"
            className={`text-sm font-medium ${textClass}`}
            onClick={() => setMenuOpen(false)}
          >
            Catálogo
          </Link>
          {identity && (
            <Link
              to={isAdmin ? "/admin" : "/my-scripts"}
              className={`text-sm font-medium ${textClass}`}
              onClick={() => setMenuOpen(false)}
            >
              {isAdmin ? "Admin" : "Meus Scripts"}
            </Link>
          )}
          {identity ? (
            <button
              type="button"
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="neon-outline px-4 py-2 rounded-md text-sm w-fit"
            >
              Sair
            </button>
          ) : (
            <div className="flex gap-3">
              <Link
                to="/login"
                className={`text-sm font-medium ${textClass}`}
                onClick={() => setMenuOpen(false)}
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className="neon-btn px-4 py-2 rounded-md text-sm"
                onClick={() => setMenuOpen(false)}
              >
                Cadastrar
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
