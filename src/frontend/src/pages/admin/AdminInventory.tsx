import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Script } from "../../backend";
import AdminLayout from "../../components/AdminLayout";
import { useActor } from "../../hooks/useActor";

const EMPTY_FORM = {
  title: "",
  description: "",
  version: "1.0.0",
  price: "0",
  language: "Python",
  category: "Utilitarios",
  requirements: "",
  changelog: "",
  fileKey: "",
  accessKey: "",
  imageKey: "",
  isActive: true,
};

const CATEGORIES = ["BotsVendas", "AutomacoesWeb", "Utilitarios", "Outros"];
const LANGUAGES = ["Python", "JavaScript", "TypeScript", "Bash", "Go", "Outro"];

type FormData = typeof EMPTY_FORM;

function Field({
  label,
  children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div>
      {label && (
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

export default function AdminInventory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editScript, setEditScript] = useState<Script | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [msg, setMsg] = useState("");

  const { data: scripts = [], isLoading } = useQuery({
    queryKey: ["scripts"],
    queryFn: () => actor!.getAllScripts(),
    enabled: !!actor,
  });

  const createMut = useMutation({
    mutationFn: (fd: FormData) =>
      actor!.adminCreateScript(
        fd.title,
        fd.description,
        fd.version,
        BigInt(Math.round(Number(fd.price) * 100)),
        fd.language,
        fd.category,
        fd.requirements,
        fd.changelog,
        fd.fileKey,
        fd.accessKey,
        fd.imageKey,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scripts"] });
      setShowModal(false);
      setMsg("Script criado!");
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, fd }: { id: bigint; fd: FormData }) =>
      actor!.adminUpdateScript(
        id,
        fd.title,
        fd.description,
        fd.version,
        BigInt(Math.round(Number(fd.price) * 100)),
        fd.language,
        fd.category,
        fd.requirements,
        fd.changelog,
        fd.fileKey,
        fd.accessKey,
        fd.imageKey,
        fd.isActive,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scripts"] });
      setShowModal(false);
      setMsg("Script atualizado!");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: bigint) => actor!.adminDeleteScript(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scripts"] });
      setMsg("Script removido.");
    },
  });

  const openCreate = () => {
    setEditScript(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };
  const openEdit = (s: Script) => {
    setEditScript(s);
    setForm({
      title: s.title,
      description: s.description,
      version: s.version,
      price: String(Number(s.price) / 100),
      language: s.language,
      category: s.category,
      requirements: s.requirements,
      changelog: s.changelog,
      fileKey: s.fileKey,
      accessKey: s.accessKey ?? "",
      imageKey: s.imageKey,
      isActive: s.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (editScript) updateMut.mutate({ id: editScript.id, fd: form });
    else createMut.mutate(form);
  };

  const setField = (k: keyof FormData, v: string | boolean) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const isSaving = createMut.isPending || updateMut.isPending;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Inventário</h1>
        <button
          type="button"
          onClick={openCreate}
          className="neon-btn px-5 py-2 rounded-lg text-sm font-bold"
        >
          + Adicionar Script
        </button>
      </div>

      {msg && <p className="text-sm text-green-600 mb-4">{msg}</p>}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-[#39FF14]" />
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-400">
                <th className="px-4 py-3 font-medium">Título</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">
                  Categoria
                </th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">
                  Linguagem
                </th>
                <th className="px-4 py-3 font-medium">Preço</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">
                  Status
                </th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {scripts.map((s) => (
                <tr key={String(s.id)} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {s.title}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                    {s.category}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {s.language}
                  </td>
                  <td className="px-4 py-3">
                    R$ {(Number(s.price) / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.isActive ? "neon-badge" : "bg-gray-100 text-gray-500"}`}
                    >
                      {s.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(s)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMut.mutate(s.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {scripts.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Nenhum script cadastrado ainda.
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">
                  {editScript ? "Editar Script" : "Novo Script"}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-3">
                <Field label="Título">
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#39FF14]"
                    value={form.title}
                    onChange={(e) => setField("title", e.target.value)}
                  />
                </Field>
                <Field label="Descrição">
                  <textarea
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#39FF14] min-h-[80px]"
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Versão">
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#39FF14]"
                      value={form.version}
                      onChange={(e) => setField("version", e.target.value)}
                    />
                  </Field>
                  <Field label="Preço (R$)">
                    <input
                      type="number"
                      step="0.01"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#39FF14]"
                      value={form.price}
                      onChange={(e) => setField("price", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Linguagem">
                    <select
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#39FF14]"
                      value={form.language}
                      onChange={(e) => setField("language", e.target.value)}
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Categoria">
                    <select
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#39FF14]"
                      value={form.category}
                      onChange={(e) => setField("category", e.target.value)}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Requisitos">
                  <textarea
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#39FF14]"
                    value={form.requirements}
                    onChange={(e) => setField("requirements", e.target.value)}
                  />
                </Field>
                <Field label="Changelog">
                  <textarea
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#39FF14]"
                    value={form.changelog}
                    onChange={(e) => setField("changelog", e.target.value)}
                  />
                </Field>
                <Field label="File Key">
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#39FF14]"
                    value={form.fileKey}
                    onChange={(e) => setField("fileKey", e.target.value)}
                  />
                </Field>
                <Field label="Access Key (opcional)">
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#39FF14]"
                    value={form.accessKey}
                    onChange={(e) => setField("accessKey", e.target.value)}
                  />
                </Field>
                {editScript && (
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setField("isActive", e.target.checked)}
                      className="accent-[#39FF14]"
                    />
                    Script ativo
                  </label>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="flex-1 neon-btn rounded-lg py-2.5 text-sm font-bold disabled:opacity-60"
                >
                  {isSaving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
