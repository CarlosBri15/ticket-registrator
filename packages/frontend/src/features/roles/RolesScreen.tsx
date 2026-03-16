import { useState } from "react";
import { Shield, Plus, Trash2, Building2 } from "lucide-react";
import {
  useRolesQuery,
  useSystemRolesQuery,
  useCreateRoleMutation,
  useDeleteRoleMutation,
  usePermissions,
  useScope,
  type IRole,
} from "@ticket-registrator/shared";
import { useScopeContext } from "@ticket-registrator/shared";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";

const HIERARCHY_LABELS: Record<number, string> = {
  1: "Empleado",
  2: "Manager",
  3: "Controller",
  4: "Admin",
};

const HIERARCHY_COLORS: Record<number, string> = {
  1: "bg-gray-100 text-gray-600",
  2: "bg-blue-100 text-blue-700",
  3: "bg-amber-100 text-amber-700",
  4: "bg-brand/10 text-brand",
};

const CreateRoleModal = ({
  isOpen,
  onClose,
  companyId,
}: {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
}) => {
  const mutation = useCreateRoleMutation(companyId, { onSuccess: onClose });
  const [form, setForm] = useState({ name: "", hierarchy: 1, description: "" });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: k === "hierarchy" ? Number(e.target.value) : e.target.value }));

  const handleSubmit = (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    mutation.mutate({ name: form.name, hierarchy: form.hierarchy, description: form.description || undefined });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Rol">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del rol *"
          value={form.name}
          onChange={set("name")}
          placeholder="Ej: Supervisor de Ventas"
          required
        />
        <div>
          <label
            htmlFor="role-hierarchy"
            className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5"
          >
            Nivel de jerarquía *
          </label>
          <select
            id="role-hierarchy"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-dark focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30"
            value={form.hierarchy}
            onChange={set("hierarchy")}
          >
            {Object.entries(HIERARCHY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label} (nivel {val})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="role-description"
            className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5"
          >
            Descripción
          </label>
          <textarea
            id="role-description"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-dark placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 resize-none"
            value={form.description}
            onChange={set("description")}
            placeholder="Descripción opcional del rol..."
            rows={3}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={mutation.isPending} disabled={!form.name.trim()} className="flex-1">
            Crear Rol
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const RoleCard = ({
  role,
  canDelete,
  onDelete,
}: {
  role: IRole;
  canDelete: boolean;
  onDelete: (id: string) => void;
}) => {
  const level = Math.min(Math.max(role.hierarchy, 1), 4);
  const colorClass = HIERARCHY_COLORS[level] ?? "bg-gray-100 text-gray-600";
  const label = HIERARCHY_LABELS[level] ?? `Nivel ${role.hierarchy}`;

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-brand/10 rounded-2xl flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-brand" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-dark truncate">{role.name}</p>
            {role.description && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">{role.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${colorClass}`}>
            {label}
          </span>
          {canDelete && (
            <button
              onClick={() => onDelete(role.id)}
              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const RolesScreen = () => {
  const { can } = usePermissions();
  const { scope, isGlobal } = useScope();
  const { activeCompanyId } = useScopeContext();

  const companyId = isGlobal
    ? activeCompanyId
    : (scope as any).companyId ?? null;

  const { data: companyRoles, isLoading: loadingCompany } = useRolesQuery(companyId ?? undefined);
  const { data: systemRoles, isLoading: loadingSystem } = useSystemRolesQuery();
  const deleteMutation = useDeleteRoleMutation(companyId ?? "");

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const isLoading = loadingCompany || loadingSystem;
  const roles = companyId ? companyRoles : systemRoles;

  if (!companyId && !isGlobal) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Building2 className="w-16 h-16 text-gray-200 mb-4" />
        <h3 className="text-2xl font-black text-dark mb-2">Selecciona una organización</h3>
        <p className="text-gray-400 max-w-sm">
          Para ver los roles, selecciona primero una organización.
        </p>
      </div>
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Cargando roles...</p>
        </div>
      );
    }

    if (!roles || roles.length === 0) {
      return (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-black text-dark mb-3">No hay roles</h3>
          <p className="text-gray-400 max-w-sm mx-auto">Crea el primer rol personalizado.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            canDelete={can("delete_roles")}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-dark tracking-tight mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-brand" />
            Roles
          </h1>
          <p className="text-gray-500 font-medium">
            {companyId ? "Roles personalizados de tu organización." : "Roles de sistema."}
          </p>
        </div>
        {companyId && can("create_roles") && (
          <Button onClick={() => setIsCreateOpen(true)} className="shadow-xl shadow-brand/20">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Rol
          </Button>
        )}
      </div>

      {/* Content */}
      {renderContent()}

      {companyId && (
        <CreateRoleModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          companyId={companyId}
        />
      )}
    </div>
  );
};
