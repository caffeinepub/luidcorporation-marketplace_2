import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../../components/AdminLayout";
import { useActor } from "../../hooks/useActor";

export default function AdminUsers() {
  const { actor } = useActor();
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => actor!.adminGetAllUsers(),
    enabled: !!actor,
  });

  const toggleMut = useMutation({
    mutationFn: (p: Principal) => actor!.toggleUserStatus(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminUsers"] }),
  });

  const promoteMut = useMutation({
    mutationFn: (p: Principal) => actor!.promoteToAdmin(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminUsers"] }),
  });

  const formatDate = (ns: bigint) =>
    new Date(Number(ns / 1_000_000n)).toLocaleDateString("pt-BR");
  const truncate = (s: string) =>
    s.length > 20 ? `${s.slice(0, 8)}...${s.slice(-6)}` : s;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">
        Utilizadores
      </h1>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-[#39FF14]" />
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-400">
                <th className="px-4 py-3 font-medium">Utilizador</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">
                  Email
                </th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">
                  Membro desde
                </th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.userPrincipal.toString()}
                  className="border-t border-gray-100"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {u.username}
                    </div>
                    <div className="text-xs text-gray-400">
                      {truncate(u.userPrincipal.toString())}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                    {u.email}
                  </td>
                  <td className="px-4 py-3">
                    {u.isAdmin ? (
                      <span className="neon-badge text-xs px-2 py-0.5 rounded-full font-semibold">
                        Admin
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full font-semibold">
                        Cliente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        u.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {u.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => toggleMut.mutate(u.userPrincipal)}
                        className="text-xs text-orange-500 hover:underline"
                      >
                        {u.isActive ? "Desativar" : "Ativar"}
                      </button>
                      {!u.isAdmin && (
                        <button
                          type="button"
                          onClick={() => promoteMut.mutate(u.userPrincipal)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Promover
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Nenhum utilizador registado ainda.
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
