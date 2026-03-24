import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const CATEGORY_LABELS: Record<string, string> = {
  BotsVendas: "Bots de Vendas",
  AutomacoesWeb: "Automações Web",
  Utilitarios: "Utilitários",
  Outros: "Outros",
};

export default function ScriptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [purchaseMsg, setPurchaseMsg] = useState("");

  const { data: script, isLoading } = useQuery({
    queryKey: ["script", id],
    queryFn: () => actor!.getScriptById(BigInt(id!)),
    enabled: !!actor && !!id,
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ["purchases", identity?.getPrincipal().toString()],
    queryFn: () => actor!.getMyPurchases(),
    enabled: !!actor && !!identity,
  });

  const alreadyPurchased = purchases.some((p) => String(p.scriptId) === id);
  const purchasedItem = purchases.find((p) => String(p.scriptId) === id);

  const purchaseMutation = useMutation({
    mutationFn: () => actor!.purchaseScript(BigInt(id!)),
    onSuccess: (msg) => {
      setPurchaseMsg(msg);
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
  });

  const handlePurchase = () => {
    if (!identity) {
      navigate("/login");
      return;
    }
    purchaseMutation.mutate();
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-[#39FF14]" />
        </div>
      </div>
    );

  if (!script)
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-400 text-lg">Script não encontrado.</p>
          <Link
            to="/catalog"
            className="neon-btn px-6 py-2 rounded-lg mt-4 inline-block"
          >
            Voltar ao Catálogo
          </Link>
        </div>
      </div>
    );

  const price = Number(script.price) / 100;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/catalog"
          className="text-sm text-gray-400 hover:text-[#39FF14] transition-colors mb-6 inline-block"
        >
          ← Voltar ao Catálogo
        </Link>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <span className="neon-badge text-xs font-semibold px-2.5 py-1 rounded-full">
                {CATEGORY_LABELS[script.category] ?? script.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">
                {script.title}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm text-gray-400">v{script.version}</span>
                <span className="text-sm bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                  {script.language}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-gray-900">
                {price === 0
                  ? "Grátis"
                  : `R$ ${price.toFixed(2).replace(".", ",")}`}
              </div>
              {alreadyPurchased ? (
                <div className="mt-3">
                  <div className="neon-badge px-4 py-2 rounded-lg text-sm font-semibold">
                    ✓ Adquirido
                  </div>
                  {purchasedItem?.accessKey && (
                    <div className="mt-2 bg-gray-50 border rounded-lg p-3 text-left">
                      <p className="text-xs text-gray-400 mb-1">
                        Chave de Acesso:
                      </p>
                      <code className="text-sm font-mono text-gray-800 break-all">
                        {purchasedItem.accessKey}
                      </code>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handlePurchase}
                  disabled={purchaseMutation.isPending}
                  className="neon-btn px-8 py-2.5 rounded-xl text-base font-bold mt-3 disabled:opacity-50"
                >
                  {purchaseMutation.isPending
                    ? "Processando..."
                    : "Comprar Agora"}
                </button>
              )}
              {purchaseMsg && (
                <p className="text-sm text-green-600 mt-2">{purchaseMsg}</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Section title="Descrição">
              <p className="text-gray-600 leading-relaxed">
                {script.description}
              </p>
            </Section>
            {script.requirements && (
              <Section title="Requisitos do Sistema">
                <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-lg">
                  {script.requirements}
                </pre>
              </Section>
            )}
            {script.changelog && (
              <Section title="Changelog">
                <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-lg">
                  {script.changelog}
                </pre>
              </Section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-[#39FF14] inline-block" />
        {title}
      </h2>
      {children}
    </div>
  );
}
