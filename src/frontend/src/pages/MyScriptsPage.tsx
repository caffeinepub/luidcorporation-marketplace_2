import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function MyScriptsPage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["purchases", identity?.getPrincipal().toString()],
    queryFn: () => actor!.getMyPurchases(),
    enabled: !!actor && !!identity,
  });

  const { data: scripts = [] } = useQuery({
    queryKey: ["scripts"],
    queryFn: () => actor!.getAllScripts(),
    enabled: !!actor,
  });

  const scriptMap = new Map(scripts.map((s) => [String(s.id), s]));

  const formatDate = (ns: bigint) => {
    return new Date(Number(ns / 1_000_000n)).toLocaleDateString("pt-BR");
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
          Meus Scripts
        </h1>
        <p className="text-gray-500 mb-8">
          Todos os scripts adquiridos na sua conta
        </p>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-[#39FF14]" />
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-400 text-lg font-medium">
              Nenhum script adquirido ainda
            </p>
            <p className="text-gray-300 text-sm mt-1 mb-6">
              Explore o catálogo e encontre ferramentas para o seu negócio
            </p>
            <Link
              to="/catalog"
              className="neon-btn px-8 py-3 rounded-xl font-bold inline-block"
            >
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((p) => {
              const script = scriptMap.get(String(p.scriptId));
              return (
                <div
                  key={String(p.id)}
                  className="bg-white border border-gray-200 rounded-xl p-6 card-hover"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-base">
                        {script?.title ?? `Script #${p.scriptId}`}
                      </h3>
                      <p className="text-sm text-gray-400 mt-0.5">
                        Adquirido em {formatDate(p.purchasedAt)}
                      </p>
                      {p.accessKey && (
                        <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <p className="text-xs text-gray-400 mb-1 font-medium">
                            Chave de Acesso
                          </p>
                          <code className="text-sm font-mono text-gray-800 break-all">
                            {p.accessKey}
                          </code>
                        </div>
                      )}
                    </div>
                    <Link
                      to={`/script/${p.scriptId}`}
                      className="neon-outline px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap"
                    >
                      Ver Detalhes
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
