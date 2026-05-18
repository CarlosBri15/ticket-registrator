import { useState } from "react";
import { Lock, Shield, Loader2 } from "lucide-react";
import {
  useRolesQuery,
  useSystemRolesQuery,
  useAllPermissionsQuery,
  useRolePermissionsQuery,
  useAssignPermissionMutation,
  useUnassignPermissionMutation,
  usePermissions,
  useScope,
  useScopeContext,
  type IRole,
  type IPermission,
} from "@ticket-registrator/shared";
import { PageHeader } from "../../../components/ui/PageHeader";
import { SectionCard } from "../../../components/ui/SectionCard";
import { Alert } from "../../../components/ui/Alert";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Toggle } from "../../../components/ui/Toggle";

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

// ─── Role selector item ──────────────────────────────────────────────────────

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
    type="button"
    onClick={onSelect}
    className={`w-full text-left px-3 py-2.5 rounded-md flex items-center gap-3 transition-colors ${
      isSelected
        ? "bg-dark text-white"
        : "border border-[var(--color-border-main)] bg-[var(--color-surface-card)] hover:bg-[var(--color-secondary)]"
    }`}
  >
    <div
      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
        isSelected ? "bg-white/15" : "bg-[var(--color-secondary)] border border-[var(--color-border-main)]"
      }`}
    >
      <Shield
        className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-dark/40"}`}
        aria-hidden={true}
      />
    </div>
    <div className="min-w-0">
      <p className={`font-sans-semibold text-[13px] truncate ${isSelected ? "text-white" : "text-dark"}`}>
        {role.name}
      </p>
      <p
        className={`text-[10px] font-sans-medium ${
          isSelected ? "text-white/55" : "text-dark/45"
        }`}
      >
        {role.companyId ? "Rol de empresa" : "Rol del sistema"}
      </p>
    </div>
  </button>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────

export const PermissionsScreen = () => {
  const { can } = usePermissions();
  const { scope, isGlobal } = useScope();
  const { activeCompanyId } = useScopeContext();

  let companyId: string | undefined;
  if (isGlobal) {
    companyId = activeCompanyId ?? undefined;
  } else if (scope && typeof scope === "object" && "companyId" in scope) {
    companyId = (scope as { companyId?: string | null }).companyId ?? undefined;
  } else {
    companyId = undefined;
  }

  const canManage = can("manage_permissions");

  const { data: companyRoles, isLoading: loadingCompanyRoles } = useRolesQuery(companyId ?? undefined);
  const { data: systemRoles, isLoading: loadingSystemRoles } = useSystemRolesQuery();

  const roles = companyId ? companyRoles : systemRoles;
  const loadingRoles = companyId ? loadingCompanyRoles : loadingSystemRoles;

  const { data: allPermissions, isLoading: loadingPerms } = useAllPermissionsQuery();

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const selectedRole = roles?.find((r) => r.id === selectedRoleId);

  const { data: rolePerms, isLoading: loadingRolePerms } = useRolePermissionsQuery(
    companyId ?? undefined,
    selectedRoleId ?? undefined,
  );

  const assignedIds = new Set(rolePerms?.map((p) => p.id) ?? []);

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
          companyId: companyId ?? undefined,
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

  const permByName = new Map<string, IPermission>(
    allPermissions?.map((p) => [p.name, p]) ?? [],
  );

  if (!companyId && !isGlobal) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader title="Gestión de Permisos" />
        <EmptyState
          icon={<Lock className="w-4 h-4" aria-hidden={true} />}
          title="Selecciona una organización"
          description="Para gestionar permisos, selecciona primero una organización desde el panel de Organizaciones."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Gestión de Permisos" />

      {!canManage && (
        <Alert
          variant="warning"
          message="Solo puedes ver los permisos. Necesitas el permiso manage_permissions para modificarlos."
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        {/* Roles list */}
        <SectionCard title="Roles">
          <RolesList
            isLoading={loadingRoles}
            roles={roles}
            selectedRoleId={selectedRoleId}
            onSelect={setSelectedRoleId}
          />
        </SectionCard>

        {/* Permission grid */}
        <div>
          {selectedRole ? (
            <div className="flex flex-col gap-4">
              {/* Selected role header */}
              <SectionCard>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-dark flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-white" aria-hidden={true} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans-bold text-dark text-[15px] truncate">
                      {selectedRole.name}
                    </p>
                    <p className="text-[12px] font-sans-medium text-dark/50 mt-0.5">
                      {assignedIds.size} permisos asignados
                      {!selectedRole.companyId && " · Rol del sistema"}
                    </p>
                  </div>
                  {loadingRolePerms && (
                    <Loader2 className="w-4 h-4 text-dark/40 animate-spin" />
                  )}
                </div>
              </SectionCard>

              {/* Permission categories */}
              {loadingPerms || loadingRolePerms ? (
                <div className="flex justify-center py-16">
                  <div className="w-5 h-5 border-2 border-dark/20 border-t-dark/60 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {CATEGORIES.map((cat) => {
                    const catPerms = cat.names
                      .map((name) => permByName.get(name))
                      .filter((p): p is IPermission => !!p);

                    if (catPerms.length === 0) return null;

                    return (
                      <SectionCard key={cat.label} title={cat.label} padded={false}>
                        <div className="flex flex-col gap-1 px-3 pb-3">
                          {catPerms.map((perm) => (
                            <Toggle
                              key={perm.id}
                              label={PERM_LABELS[perm.name] ?? perm.name}
                              isOn={assignedIds.has(perm.id)}
                              isLoading={pendingPermId === perm.id}
                              disabled={!canManage}
                              onChange={(next) => handleToggle(perm, next)}
                            />
                          ))}
                        </div>
                      </SectionCard>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={<Shield className="w-4 h-4" aria-hidden={true} />}
              title="Selecciona un rol"
              description="Elige un rol de la lista para ver y gestionar sus permisos."
              className="border border-dashed border-[var(--color-border-main)] rounded-lg bg-[var(--color-surface-card)]"
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const RolesList = ({
  isLoading,
  roles,
  selectedRoleId,
  onSelect,
}: {
  isLoading: boolean;
  roles: IRole[] | undefined;
  selectedRoleId: string | null;
  onSelect: (id: string) => void;
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <div className="w-4 h-4 border-2 border-dark/20 border-t-dark/60 rounded-full animate-spin" />
      </div>
    );
  }
  if (!roles || roles.length === 0) {
    return (
      <p className="text-[13px] font-sans-medium text-dark/55 text-center py-6">
        No hay roles disponibles.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {roles.map((role) => (
        <RoleItem
          key={role.id}
          role={role}
          isSelected={selectedRoleId === role.id}
          onSelect={() => onSelect(role.id)}
        />
      ))}
    </div>
  );
};
