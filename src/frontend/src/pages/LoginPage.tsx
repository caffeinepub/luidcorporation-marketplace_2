import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, identity, isLoggingIn } = useInternetIdentity();
  const { actor } = useActor();
  const navigate = useNavigate();

  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin", identity?.getPrincipal().toString()],
    queryFn: () => actor!.isCallerAdmin(),
    enabled: !!actor && !!identity,
  });

  useEffect(() => {
    if (identity && isAdmin !== undefined) {
      navigate(isAdmin ? "/admin" : "/my-scripts", { replace: true });
    }
  }, [identity, isAdmin, navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="font-extrabold text-3xl">
            <span className="text-gray-900">Luid</span>
            <span className="text-[#39FF14]">Corp</span>
          </Link>
          <p className="text-gray-500 mt-2">Acesse sua conta</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Entrar</h1>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600">
              Esta plataforma usa <strong>Internet Identity</strong> para
              autenticação segura e descentralizada.
            </p>
          </div>

          <button
            type="button"
            onClick={login}
            disabled={isLoggingIn}
            className="neon-btn w-full py-3 rounded-xl text-base font-bold disabled:opacity-60"
          >
            {isLoggingIn ? "Conectando..." : "Entrar com Internet Identity"}
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Não tem conta?{" "}
            <Link
              to="/register"
              className="text-[#1a8a00] font-semibold hover:underline"
            >
              Cadastrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
