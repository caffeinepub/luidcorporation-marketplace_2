import { useQuery } from "@tanstack/react-query";
import AdminLayout from "../../components/AdminLayout";
import { useActor } from "../../hooks/useActor";

export default function AdminFinancial() {
  const { actor } = useActor();

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["adminPurchases"],
    queryFn: () => actor!.adminGetAllPurchases(),
    enabled: !!actor,
  });

  const { data: scripts = [] } = useQuery({
    queryKey: ["scripts"],
    queryFn: () => actor!.getAllScripts(),
    enabled: !!actor,
  });

  const scriptMap = new Map(scripts.map((s) => [String(s.id), s]));
  const totalRevenue =
    purchases.reduce((sum, p) => {
      const s = scriptMap.get(String(p.scriptId));
      return sum + (s ? Number(s.price) : 0);
    }, 0) / 100;

  const formatDate = (ns: bigint) =>
    new Date(Number(ns / 1_000_000n)).toLocaleDateString("pt-BR");
  const truncate = (s: string) => `${s.slice(0, 8)}...${s.slice(-4)}`;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Financeiro</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total de Vendas"
          value={String(purchases.length)}
          icon="🛒"
        />
        <StatCard
          label="Receita Total"
          value={`R$ ${totalRevenue.toFixed(2).replace(".", ",")}`}
          icon="💰"
        />
        <StatCard
          label="Scripts no Catálogo"
          value={String(scripts.length)}
          icon="📦"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-[#39FF14]" />
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
          <div className="px-4 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Histórico de Compras</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-400">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Script</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">
                  Comprador
                </th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">
                  Data
                </th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => {
                const s = scriptMap.get(String(p.scriptId));
                return (
                  <tr key={String(p.id)} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-400">#{String(p.id)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {s?.title ?? `Script #${p.scriptId}`}
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell font-mono text-xs">
                      {truncate(p.buyerPrincipal.toString())}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {s ? `R$ ${(Number(s.price) / 100).toFixed(2)}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                      {formatDate(p.purchasedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {purchases.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Nenhuma compra registada ainda.
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

function StatCard({
  label,
  value,
  icon,
}: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-extrabold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
