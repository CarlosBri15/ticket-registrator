import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Building, Trash2, AlertTriangle } from "lucide-react";
import {
  useOrganizationQuery,
  useDeleteOrganizationMutation,
  useDepartmentsQuery,
  useDeleteDepartmentMutation,
  useUsersQuery,
  useRolesQuery,
  usePermissions,
  useScopeContext,
  type IDepartment,
} from "@ticket-registrator/shared";
import { Button } from "../../../components/ui/Button";
import { PageHeader } from "../../../components/ui/PageHeader";
import { SectionCard } from "../../../components/ui/SectionCard";
import { EmptyState } from "../../../components/ui/EmptyState";
import { ConfirmDialog } from "../../reports/components/ConfirmDialog";
import { CreateUserModal } from "../../users/components/CreateUserModal";
import { CreateRoleModal } from "../../roles/components/CreateRoleModal";
import { AssignPermissionsModal } from "../../users/components/AssignPermissionsModal";
import { DepartmentModal } from "../../departments/components/DepartmentModal";
import { OverviewTab } from "../tabs/OverviewTab";
import { DepartmentsTab } from "../tabs/DepartmentsTab";
import { UsersTab } from "../tabs/UsersTab";
import { RolesTab } from "../tabs/RolesTab";

type TabId = "overview" | "departments" | "users" | "roles";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Resumen" },
  { id: "departments", label: "Departamentos" },
  { id: "users", label: "Usuarios" },
  { id: "roles", label: "Roles" },
];

export const OrganizationDetailScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { activeCompanyId, setActiveCompanyId } = useScopeContext();

  const { data: org, isLoading: loadingOrg } = useOrganizationQuery(id);
  const { data: departments, isLoading: loadingDepts } = useDepartmentsQuery(id);
  const { data: allUsers, isLoading: loadingUsers } = useUsersQuery();
  const { data: roles, isLoading: loadingRoles } = useRolesQuery(id);

  const deleteMutation = useDeleteOrganizationMutation({
    onSuccess: () => navigate("/organizations"),
  });
  const deleteDeptMutation = useDeleteDepartmentMutation(id ?? "");

  const users = allUsers?.filter((u) => u.companyId === id) ?? [];

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [deptSearch, setDeptSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<IDepartment | undefined>();
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [assignPermissionsRoleId, setAssignPermissionsRoleId] = useState<string | undefined>();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const filteredDepts = departments?.filter(
    (d) => !deptSearch || d.name.toLowerCase().includes(deptSearch.toLowerCase()),
  );

  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.surname.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q)
    );
  });

  const getRoleName = (roleId: string) =>
    roles?.find((r) => r.id === roleId)?.name ?? "—";

  const isActiveScope = activeCompanyId === id;

  const tabCounts: Record<TabId, number | undefined> = {
    overview: undefined,
    departments: departments?.length,
    users: users.length,
    roles: roles?.length,
  };

  if (loadingOrg) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-4 h-4 border-2 border-dark/20 border-t-dark/60 rounded-full animate-spin" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Organizaciones"
          back={{ label: "Organizaciones", onClick: () => navigate("/organizations") }}
        />
        <EmptyState
          icon={<Building className="w-4 h-4" aria-hidden={true} />}
          title="Organización no encontrada"
          description="La organización que buscas no existe o fue eliminada."
          action={
            <Button variant="secondary" onClick={() => navigate("/organizations")}>
              Volver a Organizaciones
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={org.name}
        back={{ label: "Organizaciones", onClick: () => navigate("/organizations") }}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCompanyId(isActiveScope ? null : id ?? null)}
              className={`text-[12px] font-sans-semibold px-3 py-1.5 rounded-md transition-colors ${
                isActiveScope
                  ? "bg-brand text-white"
                  : "bg-[var(--color-secondary)] text-dark/70 hover:bg-dark/10"
              }`}
            >
              {isActiveScope ? "Scope activo" : "Activar scope"}
            </button>
            {can("delete_company") && (
              <Button
                variant="ghost-danger"
                size="icon"
                title="Eliminar organización"
                onClick={() => setIsDeleteConfirmOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        }
      />

      <div className="flex flex-col gap-5">
        <div className="tabs" role="tablist">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = tabCounts[tab.id];
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`tab${isActive ? " active" : ""} flex items-center gap-2`}
              >
                {tab.label}
                {count !== undefined && (
                  <span
                    className={`text-[10px] font-sans-bold px-1.5 py-0.5 rounded ${
                      isActive ? "bg-dark/10 text-dark" : "bg-dark/5 text-dark/45"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div role="tabpanel">
          {activeTab === "overview" && <OverviewTab org={org} />}

          {activeTab === "departments" && (
            <DepartmentsTab
              loading={loadingDepts}
              filtered={filteredDepts}
              search={deptSearch}
              onSearch={setDeptSearch}
              onCreate={() => {
                setEditingDept(undefined);
                setIsDeptModalOpen(true);
              }}
              onEdit={(dept) => {
                setEditingDept(dept);
                setIsDeptModalOpen(true);
              }}
              onDelete={(deptId) => deleteDeptMutation.mutate(deptId)}
              canCreate={can("create_departments")}
              canEdit={can("edit_departments")}
              canDelete={can("delete_departments")}
            />
          )}

          {activeTab === "users" && (
            <UsersTab
              loading={loadingUsers}
              filtered={filteredUsers}
              search={userSearch}
              onSearch={setUserSearch}
              onCreate={() => setIsCreateUserOpen(true)}
              canCreate={can("create_users")}
              getRoleName={getRoleName}
            />
          )}

          {activeTab === "roles" && (
            <RolesTab
              loading={loadingRoles}
              roles={roles}
              search={roleSearch}
              onSearch={setRoleSearch}
              onCreate={() => setIsCreateRoleOpen(true)}
              canCreate={can("create_roles")}
              onAssignPermissions={(roleId) => setAssignPermissionsRoleId(roleId)}
              canManagePermissions={can("manage_permissions")}
            />
          )}
        </div>
      </div>

      {/* Org id reference */}
      <SectionCard padded={false}>
        <div className="px-5 py-3 flex items-center gap-3">
          <span className="text-[11px] font-sans-semibold text-dark/45 uppercase tracking-wide shrink-0">
            ID
          </span>
          <code className="font-mono text-[11px] text-dark/55 break-all">{org.id}</code>
        </div>
      </SectionCard>

      {/* Modals */}
      {id && isDeptModalOpen && (
        <DepartmentModal
          isOpen={isDeptModalOpen}
          onClose={() => {
            setIsDeptModalOpen(false);
            setEditingDept(undefined);
          }}
          companyId={id}
          department={editingDept}
        />
      )}

      {id && isCreateUserOpen && (
        <CreateUserModal
          isOpen={isCreateUserOpen}
          onClose={() => setIsCreateUserOpen(false)}
          companyId={id}
        />
      )}

      {id && isCreateRoleOpen && (
        <CreateRoleModal
          isOpen={isCreateRoleOpen}
          onClose={() => setIsCreateRoleOpen(false)}
          companyId={id}
          onRoleCreated={(roleId: string) => setAssignPermissionsRoleId(roleId)}
        />
      )}

      {id && assignPermissionsRoleId && (
        <AssignPermissionsModal
          isOpen={!!assignPermissionsRoleId}
          onClose={() => setAssignPermissionsRoleId(undefined)}
          companyId={id}
          roleId={assignPermissionsRoleId}
          roleName={roles?.find((r) => r.id === assignPermissionsRoleId)?.name}
        />
      )}

      {isDeleteConfirmOpen && (
        <ConfirmDialog
          icon={<AlertTriangle />}
          title="¿Eliminar organización?"
          description={`Esta acción eliminará permanentemente "${org.name}" y todos sus datos. No se puede deshacer.`}
          onCancel={() => setIsDeleteConfirmOpen(false)}
          onConfirm={() => {
            deleteMutation.mutate(org.id);
            setIsDeleteConfirmOpen(false);
          }}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          confirmVariant="danger"
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};
