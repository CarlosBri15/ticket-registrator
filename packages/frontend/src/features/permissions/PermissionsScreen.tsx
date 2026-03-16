import { useState } from "react";
import { Lock, Building2, Shield, Check, Loader2 } from "lucide-react";
import {
  useRolesQuery,
  useSystemRolesQuery,
  useAllPermissionsQuery,
  useRolePermissionsQuery,
  useAssignPermissionMutation,
  useUnassignPermissionMutation,
  usePermissions,
  useScope,
  type IRole,
  type IPermission,
} from "@ticket-registrator/shared";
import { useScopeContext } from "@ticket-registrator/shared";

// ─── Permission categories & labels ─────────────────────────────────────────

type Category = { label: string; names: string[] };

const CATEGORIES: Category[] = [
  { label: "Usuarios",      names: ["view_users", "create_users", "edit_users", "delete_users"] },
  { label: "Reportes",      names: ["view_reports", "create_reports", "edit_reports", "delete_reports", "submit_reports", "approve_reports"] },
  { label: "Tickets",       names: ["view_tickets", "create_tickets", "edit_tickets", "delete_tickets", "approve_tickets"] },
  { label: "Items",         names: ["approve_items"] },
  { label: "Departamentos", names: ["view_departments", "create_departments", "edit_departments", "delete_departments"] },
  { label: "Roles",         names: ["view_roles", "create_roles", "edit_roles", "delete_roles"] },
  { label: "Permisos",      names: ["view_permissions", "manage_permissions"] },
  { label: "Empresa",       names: ["view_company", "create_company", "edit_company", "delete_company"] },
];

const PERM_LABELS: Record<string, string> = {
  view_users: "Ver usuarios",          create_users: "Crear usuarios",
  edit_users: "Editar usuarios",       delete_users: "Eliminar usuarios",
  view_reports: "Ver reportes",        create_reports: "Crear reportes",
  edit_reports: "Editar reportes",     delete_reports: "Eliminar reportes",
  submit_reports: "Enviar reportes",   approve_reports: "Aprobar reportes",
  view_tickets: "Ver tickets",         create_tickets: "Crear tickets",
  edit_tickets: "Editar tickets",      delete_tickets: "Eliminar tickets",
  approve_tickets: "Aprobar tickets",  approve_items: "Aprobar ítems",
  view_departments: "Ver departamentos",   create_departments: "Crear departamentos",
  edit_departments: "Editar departamentos", delete_departments: "Eliminar departamentos",
  view_roles: "Ver roles",             create_roles: "Crear roles",
  edit_roles: "Editar roles",          delete_roles: "Eliminar roles",
  view_permissions: "Ver permisos",    manage_permissions: "Gestionar permisos",
  view_company: "Ver empresa",         create_company: "Crear empresa",
  edit_company: "Editar empresa",      delete_company: "Eliminar empresa",
};

// ─── Permission Toggle ───────────────────────────────────────────────────────

const PermissionToggle = ({
  permission,
  isOn,
  isLoading,
  canManage,
  onToggle,
}: {
  permission: IPermission;
  isOn: boolean;
  isLoading: boolean;
  canManage: boolean;
  onToggle: (permission: IPermission, newValue: boolean) => void;
}) => (
  <button
    onClick={() => canManage && !isLoading && onToggle(permission, !isOn)}
    disabled={!canManage || isLoading}
    className={`
      flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all
      ${isOn
        ? "bg-brand/5 border-brand/20 hover:border-brand/40"
        : "bg-white border-gray-100 hover:border-gray-200"
      }
      ${(!canManage || isLoading) ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
    `}
  >
    <span className={`text-sm font-medium ${isOn ? "text-brand-hover" : "text-gray-600"}`}>
      {PERM_LABELS[permission.name] ?? permission.name}
    </span>

    <div className="shrink-0 ml-3">
      {isLoading ? (
        <Loader2 className="w-4 h-4 text-brand animate-spin" />
      ) : (
        <div className={`
          w-9 h-5 rounded-full transition-colors relative
          ${isOn ? "bg-brand" : "bg-gray-200"}
        `}>
          <div className={`
            absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all
            ${isOn ? "left-4" : "left-0.5"}
          `} />
        </div>
      )}
    </div>
  </button>
);

// ─── Role selector ───────────────────────────────────────────────────────────

const RoleItem = ({
  role,
  isSelected,
  onSelect,
}: {
  role: IRole;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <button
    onClick={onSelect}
    className={`
      w-full text-left px-4 py-3 rounded-2xl transition-all flex items-center gap-3
      ${isSelected
        ? "bg-brand text-white shadow-lg shadow-brand/20"
        : "bg-white border border-gray-100 text-dark hover:border-brand/20 hover:shadow-sm"
      }
    `}
  >
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-white/20" : "bg-brand/10"}`}>
      <Shield className={`w-4 h-4 ${isSelected ? "text-white" : "text-brand"}`} />
    </div>
    <div className="min-w-0">
      <p className={`font-bold text-sm truncate ${isSelected ? "text-white" : "text-dark"}`}>
        {role.name}
      </p>
      <p className={`text-[10px] font-medium ${isSelected ? "text-white/60" : "text-gray-400"}`}>
        {role.companyId ? "Rol de empresa" : "Rol del sistema"}
      </p>
    </div>
    {isSelected && <Check className="w-4 h-4 text-white ml-auto shrink-0" />}
  </button>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────

export const PermissionsScreen = () => {
  const { can } = usePermissions();
  const { scope, isGlobal } = useScope();
  const { activeCompanyId } = useScopeContext();

  const companyId = isGlobal
    ? activeCompanyId
    : (scope as any).companyId ?? null;

  const canManage = can("manage_permissions");

  // Roles
  const { data: companyRoles, isLoading: loadingCompanyRoles } = useRolesQuery(companyId ?? undefined);
  const { data: systemRoles, isLoading: loadingSystemRoles } = useSystemRolesQuery();

  const roles = companyId ? companyRoles : systemRoles;
  const loadingRoles = companyId ? loadingCompanyRoles : loadingSystemRoles;

  // All permissions catalog
  const { data: allPermissions, isLoading: loadingPerms } = useAllPermissionsQuery();

  // Selected role
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const selectedRole = roles?.find((r) => r.id === selectedRoleId);

  // Role's current permissions
  const { data: rolePerms, isLoading: loadingRolePerms } = useRolePermissionsQuery(
    companyId ?? undefined,
    selectedRoleId ?? undefined,
  );

  const assignedIds = new Set(rolePerms?.map((p) => p.id) ?? []);

  // Mutations
  const assignMutation = useAssignPermissionMutation();
  const unassignMutation = useUnassignPermissionMutation();
  const [pendingPermId, setPendingPermId] = useState<string | null>(null);

  const handleToggle = (permission: IPermission, newValue: boolean) => {
    if (!selectedRoleId) return;
    setPendingPermId(permission.id);

    if (newValue) {
      assignMutation.mutate(
        {
          roleId: selectedRoleId,
          permissionId: permission.id,
          companyId: companyId ?? null,
          _companyId: companyId ?? undefined,
        },
        { onSettled: () => setPendingPermId(null) },
      );
    } else {
      unassignMutation.mutate(
        { roleId: selectedRoleId, permissionId: permission.id, companyId },
        { onSettled: () => setPendingPermId(null) },
      );
    }
  };

  // Build lookup: permissionName → IPermission
  const permByName = new Map<string, IPermission>(
    allPermissions?.map((p) => [p.name, p]) ?? [],
  );

  if (!companyId && !isGlobal) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Building2 className="w-16 h-16 text-gray-200 mb-4" />
        <h3 className="text-2xl font-black text-dark mb-2">Selecciona una organización</h3>
        <p className="text-gray-400 max-w-sm">
          Para gestionar permisos, selecciona primero una organización desde el panel de Organizaciones.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-dark tracking-tight mb-2 flex items-center gap-3">
          <Lock className="w-8 h-8 text-brand" />
          Gestión de Permisos
        </h1>
        <p className="text-gray-500 font-medium">
          Configura qué puede hacer cada rol en tu organización.
        </p>
      </div>

      {!canManage && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 flex items-center gap-3">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-sm font-medium text-amber-800">
            Solo puedes ver los permisos. Necesitas el permiso <strong>manage_permissions</strong> para modificarlos.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">

        {/* ── Left: Role list ── */}
        <div className="space-y-3">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Roles</p>
          {(() => {
            if (loadingRoles) {
              return (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                </div>
              );
            }
            if (!roles || roles.length === 0) {
              return <p className="text-sm text-gray-400 text-center py-8">No hay roles disponibles.</p>;
            }
            return (
              <div className="space-y-2">
                {roles.map((role) => (
                  <RoleItem
                    key={role.id}
                    role={role}
                    isSelected={selectedRoleId === role.id}
                    onSelect={() => setSelectedRoleId(role.id)}
                  />
                ))}
              </div>
            );
          })()}
        </div>

        {/* ── Right: Permission grid ── */}
        <div>
          {selectedRole ? (
            <div className="space-y-6">
              {/* Role header */}
              <div className="flex items-center gap-3 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-dark">{selectedRole.name}</p>
                  <p className="text-xs text-gray-400 font-medium">
                    {assignedIds.size} permisos asignados
                    {!selectedRole.companyId && " · Rol del sistema"}
                  </p>
                </div>
                {loadingRolePerms && (
                  <Loader2 className="w-4 h-4 text-brand animate-spin ml-auto" />
                )}
              </div>

              {/* Permission categories */}
              {loadingPerms || loadingRolePerms ? (
                <div className="flex justify-center py-16">
                  <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-5">
                  {CATEGORIES.map((cat) => {
                    const catPerms = cat.names
                      .map((name) => permByName.get(name))
                      .filter((p): p is IPermission => !!p);

                    if (catPerms.length === 0) return null;

                    return (
                      <div key={cat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
                          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                            {cat.label}
                          </p>
                        </div>
                        <div className="p-3 space-y-1.5">
                          {catPerms.map((perm) => (
                            <PermissionToggle
                              key={perm.id}
                              permission={perm}
                              isOn={assignedIds.has(perm.id)}
                              isLoading={pendingPermId === perm.id}
                              canManage={canManage}
                              onToggle={handleToggle}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border border-dashed border-gray-200 text-center">
              <Shield className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium">Selecciona un rol para ver sus permisos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
