import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function RegisterPage() {
  const { login, identity, isLoggingIn } = useInternetIdentity();
  const { actor } = useActor();
  const navigate = useNavigate();
  const [step, setStep] = useState<"auth" | "profile">("auth");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (identity) setStep("profile");
  }, [identity]);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim()) {
      setError("Preencha todos os campos.");
      return;
    }
    if (!actor) return;
    setLoading(true);
    setError("");
    try {
      await actor.registerUser(username, email);
      navigate("/my-scripts", { replace: true });
    } catch (_e) {
      setError("Erro ao registrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="font-extrabold text-3xl">
            <span className="text-gray-900">Luid</span>
            <span className="text-[#39FF14]">Corp</span>
          </Link>
          <p className="text-gray-500 mt-2">Crie sua conta gratuita</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Criar Conta</h1>

          {step === "auth" ? (
            <>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600">
                  Primeiro, autentique-se com <strong>Internet Identity</strong>
                  . Em seguida, complete seu perfil.
                </p>
              </div>
              <button
                type="button"
                onClick={login}
                disabled={isLoggingIn}
                className="neon-btn w-full py-3 rounded-xl text-base font-bold disabled:opacity-60"
              >
                {isLoggingIn
                  ? "Conectando..."
                  : "Autenticar com Internet Identity"}
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="text-sm font-medium text-gray-700 block mb-1"
                >
                  Nome de utilizador
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="seu_username"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 block mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="button"
                onClick={handleRegister}
                disabled={loading}
                className="neon-btn w-full py-3 rounded-xl text-base font-bold disabled:opacity-60"
              >
                {loading ? "Registrando..." : "Completar Cadastro"}
              </button>
            </div>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem conta?{" "}
            <Link
              to="/login"
              className="text-[#1a8a00] font-semibold hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
