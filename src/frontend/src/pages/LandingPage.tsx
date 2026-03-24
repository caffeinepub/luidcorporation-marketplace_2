import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import ScriptCard from "../components/ScriptCard";
import { useActor } from "../hooks/useActor";

const MOCK_FEATURES = [
  {
    icon: "🤖",
    title: "Bots de Vendas",
    desc: "Automatize prospecção, follow-ups e fechamentos.",
  },
  {
    icon: "🌐",
    title: "Automações Web",
    desc: "Scrapers, integrations e workflows inteligentes.",
  },
  {
    icon: "🔧",
    title: "Utilitários",
    desc: "Ferramentas para produtividade e DevOps.",
  },
  {
    icon: "✨",
    title: "Outros",
    desc: "Scripts especializados para casos únicos.",
  },
];

export default function LandingPage() {
  const { actor } = useActor();
  const { data: scripts = [] } = useQuery({
    queryKey: ["scripts"],
    queryFn: () => actor!.getAllScripts(),
    enabled: !!actor,
  });

  const featured = scripts.slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      <Navbar dark />

      {/* Hero */}
      <section className="dark-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 neon-badge px-3 py-1 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-[#39FF14] inline-block" />
              Marketplace Especializado
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight mb-6">
              O Marketplace de
              <br />
              <span className="text-[#39FF14]">Scripts, Bots</span>
              <br />e Automações
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl mb-8 max-w-xl">
              Encontre ferramentas prontas para escalar seus negócios.
              Desenvolvidas por especialistas, entregues instantaneamente.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/catalog"
                className="neon-btn px-8 py-3 rounded-lg text-base font-bold"
              >
                Explorar Catálogo
              </Link>
              <Link
                to="/register"
                className="neon-outline px-8 py-3 rounded-lg text-base font-bold"
              >
                Criar Conta Grátis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Categorias</h2>
          <p className="text-gray-500 mb-10">
            Soluções para cada necessidade do seu negócio
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MOCK_FEATURES.map((f) => (
              <Link
                to={`/catalog?category=${f.title.replace(/ /g, "")}`}
                key={f.title}
                className="bg-white border border-gray-200 rounded-xl p-6 card-hover cursor-pointer group"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-[#1a8a00] transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Scripts */}
      {featured.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">
                  Scripts em Destaque
                </h2>
                <p className="text-gray-500">Os mais populares do catálogo</p>
              </div>
              <Link
                to="/catalog"
                className="neon-outline px-5 py-2 rounded-lg text-sm font-semibold"
              >
                Ver Todos
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((s) => (
                <ScriptCard key={String(s.id)} script={s} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="dark-section py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Pronto para automatizar?
            <br />
            <span className="text-[#39FF14]">Comece hoje mesmo.</span>
          </h2>
          <p className="text-gray-400 mb-8">
            Acesse centenas de scripts, bots e automações prontos para uso.
          </p>
          <Link
            to="/register"
            className="neon-btn px-10 py-3 rounded-lg text-base font-bold inline-block"
          >
            Criar Conta Gratuita
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-white text-xl">
              Luid<span className="text-[#39FF14]">Corp</span>
            </span>
            <p className="text-gray-500 text-sm mt-1">
              Marketplace de Scripts, Bots e Automações
            </p>
          </div>
          <p className="text-gray-600 text-sm">
            © 2026 LuidCorporation. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
