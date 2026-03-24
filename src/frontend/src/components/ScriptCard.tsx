import { Link } from "react-router-dom";
import type { Script } from "../backend";

const CATEGORY_LABELS: Record<string, string> = {
  BotsVendas: "Bots de Vendas",
  AutomacoesWeb: "Automações Web",
  Utilitarios: "Utilitários",
  Outros: "Outros",
};

const LANG_COLORS: Record<string, string> = {
  Python: "bg-blue-100 text-blue-700",
  JavaScript: "bg-yellow-100 text-yellow-700",
  TypeScript: "bg-sky-100 text-sky-700",
  Bash: "bg-gray-100 text-gray-700",
  Go: "bg-teal-100 text-teal-700",
};

export default function ScriptCard({ script }: { script: Script }) {
  const price = Number(script.price) / 100;
  const langColor = LANG_COLORS[script.language] ?? "bg-gray-100 text-gray-700";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 card-hover flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span
          className={
            "neon-badge text-xs font-semibold px-2.5 py-1 rounded-full"
          }
        >
          {CATEGORY_LABELS[script.category] ?? script.category}
        </span>
        <span className="text-xs text-gray-400">v{script.version}</span>
      </div>

      <div>
        <h3 className="font-bold text-gray-900 text-base leading-snug">
          {script.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {script.description}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-md ${langColor}`}
        >
          {script.language}
        </span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="font-bold text-gray-900 text-lg">
          {price === 0 ? "Grátis" : `R$ ${price.toFixed(2).replace(".", ",")}`}
        </span>
        <Link
          to={`/script/${script.id}`}
          className="neon-btn px-4 py-1.5 rounded-lg text-sm"
        >
          Ver Mais
        </Link>
      </div>
    </div>
  );
}
