import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Building, Trash2 } from "lucide-react";
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
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { PageHeader } from "../../../components/ui/PageHeader";
import { SectionCard } from "../../../components/ui/SectionCard";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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

const DeleteConfirmModal = ({
  isOpen,
  orgName,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  orgName: string;
  onClose: () => void;
  onConfirm: () => void;
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="¿Eliminar organización?">
    <div className="flex flex-col gap-4">
      <p className="text-[13px] font-sans-normal text-dark/70">
        Esta acción eliminará permanentemente{" "}
        <span className="font-sans-bold text-dark">{orgName}</span> y todos sus datos. No se puede
        deshacer.
      </p>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button type="button" variant="danger" onClick={onConfirm} className="flex-1">
          Eliminar
        </Button>
      </div>
    </div>
  </Modal>
);

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
        <div className="flex flex-col items-center py-14 gap-2 text-center">
          <Building className="w-4 h-4 text-dark/25" aria-hidden={true} />
          <p className="font-sans-medium text-[13px] text-dark/55">
            Organización no encontrada
          </p>
          <p className="font-sans-normal text-[12px] text-dark/40 max-w-sm">
            La organización que buscas no existe o fue eliminada.
          </p>
          <button
            type="button"
            onClick={() => navigate("/organizations")}
            className="font-sans-medium text-dark/50 text-[12px] underline underline-offset-2 hover:text-dark transition-colors mt-2"
          >
            Volver a Organizaciones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={org.name}
        subtitle={`Creada ${format(new Date(org.createdAt), "dd/MM/yyyy", { locale: es })} · Actualizada ${format(new Date(org.updatedAt), "dd/MM/yyyy", { locale: es })}`}
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

      <div className="rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)] overflow-hidden">
        <div className="flex border-b border-[var(--color-border-main)] gap-6 px-5">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = tabCounts[tab.id];
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 pt-3.5 text-[13px] font-sans-semibold transition-colors flex items-center gap-2 ${
                  isActive
                    ? "border-b-2 border-dark text-dark -mb-px"
                    : "text-dark/45 hover:text-dark/70"
                }`}
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

        <div className="p-5">
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
          onRoleCreated={(roleId: any) => setAssignPermissionsRoleId(roleId)}
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

      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        orgName={org.name}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => {
          deleteMutation.mutate(org.id);
          setIsDeleteConfirmOpen(false);
        }}
      />
    </div>
  );
};
