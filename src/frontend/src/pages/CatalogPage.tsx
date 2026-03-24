import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ScriptCard from "../components/ScriptCard";
import { useActor } from "../hooks/useActor";

const CATEGORIES = [
  { value: "", label: "Todos" },
  { value: "BotsVendas", label: "Bots de Vendas" },
  { value: "AutomacoesWeb", label: "Automações Web" },
  { value: "Utilitarios", label: "Utilitários" },
  { value: "Outros", label: "Outros" },
];

export default function CatalogPage() {
  const { actor } = useActor();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");

  const { data: scripts = [], isLoading } = useQuery({
    queryKey: ["scripts"],
    queryFn: () => actor!.getAllScripts(),
    enabled: !!actor,
  });

  const filtered = scripts.filter((s) => {
    const matchCat = !category || s.category === category;
    const matchSearch =
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Catálogo</h1>
        <p className="text-gray-500 mb-8">
          Explore scripts, bots e automações prontas para uso
        </p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Pesquisar scripts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] flex-1 max-w-sm"
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  category === c.value
                    ? "bg-[#39FF14] text-[#0a0a0a] font-bold shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-[#39FF14]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-400 text-lg">Nenhum script encontrado</p>
            <p className="text-gray-300 text-sm mt-1">
              Tente outro filtro ou termo de busca
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s) => (
              <ScriptCard key={String(s.id)} script={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
