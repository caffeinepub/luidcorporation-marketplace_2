import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../../components/AdminLayout";
import { useActor } from "../../hooks/useActor";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

export default function AdminUsers() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => actor!.adminGetAllUsers(),
    enabled: !!actor,
  });

  const suspendMut = useMutation({
    mutationFn: (p: Principal) => actor!.suspendUser(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminUsers"] }),
  });

  const activateMut = useMutation({
    mutationFn: (p: Principal) => actor!.toggleUserStatus(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminUsers"] }),
  });

  const promoteMut = useMutation({
    mutationFn: (p: Principal) => actor!.promoteToAdmin(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminUsers"] }),
  });

  const demoteMut = useMutation({
    mutationFn: (p: Principal) => actor!.demoteFromAdmin(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminUsers"] }),
  });

  const callerPrincipal = identity?.getPrincipal().toString();

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
              {users.map((u, idx) => {
                const isSelf = u.userPrincipal.toString() === callerPrincipal;
                return (
                  <tr
                    key={u.userPrincipal.toString()}
                    data-ocid={`users.item.${idx + 1}`}
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
                        {u.isActive ? "Ativo" : "Suspenso"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {u.isActive ? (
                          !isSelf && (
                            <button
                              type="button"
                              data-ocid={`users.delete_button.${idx + 1}`}
                              onClick={() => suspendMut.mutate(u.userPrincipal)}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Suspender
                            </button>
                          )
                        ) : (
                          <button
                            type="button"
                            data-ocid={`users.edit_button.${idx + 1}`}
                            onClick={() => activateMut.mutate(u.userPrincipal)}
                            className="text-xs text-green-600 hover:underline"
                          >
                            Ativar
                          </button>
                        )}
                        {!u.isAdmin && (
                          <button
                            type="button"
                            data-ocid={`users.secondary_button.${idx + 1}`}
                            onClick={() => promoteMut.mutate(u.userPrincipal)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Promover
                          </button>
                        )}
                        {u.isAdmin && !isSelf && (
                          <button
                            type="button"
                            data-ocid={`users.toggle.${idx + 1}`}
                            onClick={() => demoteMut.mutate(u.userPrincipal)}
                            className="text-xs text-purple-600 hover:underline"
                          >
                            Remover Admin
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {users.length === 0 && (
            <div
              data-ocid="users.empty_state"
              className="text-center py-12 text-gray-400"
            >
              Nenhum utilizador registado ainda.
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
