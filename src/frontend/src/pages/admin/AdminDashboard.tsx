import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { useActor } from "../../hooks/useActor";

function parseStats(raw: string) {
  try {
    const totalUsers = raw.match(/totalUsers[":,\s]+(\d+)/)?.[1] ?? "0";
    const totalSales = raw.match(/totalSales[":,\s]+(\d+)/)?.[1] ?? "0";
    const revenue = raw.match(/revenue[":,\s]+(\d+)/)?.[1] ?? "0";
    return {
      totalUsers: Number(totalUsers),
      totalSales: Number(totalSales),
      revenue: Number(revenue) / 100,
    };
  } catch {
    return { totalUsers: 0, totalSales: 0, revenue: 0 };
  }
}

export default function AdminDashboard() {
  const { actor } = useActor();
  const { data: statsRaw = "" } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => actor!.adminGetStats(),
    enabled: !!actor,
  });

  const { data: scripts = [] } = useQuery({
    queryKey: ["scripts"],
    queryFn: () => actor!.getAllScripts(),
    enabled: !!actor,
  });

  const stats = parseStats(statsRaw);

  const cards = [
    {
      label: "Utilizadores",
      value: stats.totalUsers,
      icon: "👥",
      href: "/admin/users",
    },
    {
      label: "Total de Vendas",
      value: stats.totalSales,
      icon: "🛒",
      href: "/admin/financial",
    },
    {
      label: "Receita Total",
      value: `R$ ${stats.revenue.toFixed(2).replace(".", ",")}`,
      icon: "💰",
      href: "/admin/financial",
    },
    {
      label: "Scripts Ativos",
      value: scripts.filter((s) => s.isActive).length,
      icon: "📦",
      href: "/admin/inventory",
    },
  ];

  return (
    <AdminLayout>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-8">
        Visão Geral
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.href}
            className="bg-white border border-gray-200 rounded-xl p-6 card-hover block"
          >
            <div className="text-3xl mb-2">{c.icon}</div>
            <div className="text-2xl font-extrabold text-gray-900">
              {c.value}
            </div>
            <div className="text-sm text-gray-500 mt-0.5">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-bold text-gray-900 mb-4">Scripts Recentes</h2>
        {scripts.length === 0 ? (
          <p className="text-gray-400 text-sm">
            Nenhum script cadastrado ainda.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-medium">Título</th>
                <th className="pb-3 font-medium">Categoria</th>
                <th className="pb-3 font-medium">Preço</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {scripts.slice(0, 5).map((s) => (
                <tr
                  key={String(s.id)}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td className="py-3 font-medium text-gray-900">{s.title}</td>
                  <td className="py-3 text-gray-500">{s.category}</td>
                  <td className="py-3 text-gray-700">
                    R$ {(Number(s.price) / 100).toFixed(2)}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        s.isActive ? "neon-badge" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {s.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
