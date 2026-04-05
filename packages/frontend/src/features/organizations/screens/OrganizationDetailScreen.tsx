import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Building, CalendarDays, ChevronLeft, Trash2 } from "lucide-react";
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

// ─── Tab definition ───────────────────────────────────────────────────────────

type TabId = "overview" | "departments" | "users" | "roles";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview",    label: "Resumen" },
  { id: "departments", label: "Departamentos" },
  { id: "users",       label: "Usuarios" },
  { id: "roles",       label: "Roles" },
];

// ─── Delete confirmation modal ────────────────────────────────────────────────

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
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Esta acción eliminará permanentemente{" "}
        <span className="font-bold">{orgName}</span> y todos sus datos. No se
        puede deshacer.
      </p>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button type="button" variant="danger" onClick={onConfirm} className="flex-1">
          Eliminar
        </Button>
      </div>
    </div>
  </Modal>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const OrganizationDetailScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { activeCompanyId, setActiveCompanyId } = useScopeContext();

  const { data: org,         isLoading: loadingOrg   } = useOrganizationQuery(id);
  const { data: departments, isLoading: loadingDepts } = useDepartmentsQuery(id);
  const { data: allUsers,    isLoading: loadingUsers } = useUsersQuery();
  const { data: roles,       isLoading: loadingRoles } = useRolesQuery(id);

  const deleteMutation     = useDeleteOrganizationMutation({ onSuccess: () => navigate("/organizations") });
  const deleteDeptMutation = useDeleteDepartmentMutation(id ?? "");

  const users = allUsers?.filter((u) => u.companyId === id) ?? [];

  // ── Local UI state ──────────────────────────────────────────────────────────
  const [activeTab,              setActiveTab]              = useState<TabId>("overview");
  const [deptSearch,             setDeptSearch]             = useState("");
  const [userSearch,             setUserSearch]             = useState("");
  const [roleSearch,             setRoleSearch]             = useState("");
  const [isDeptModalOpen,        setIsDeptModalOpen]        = useState(false);
  const [editingDept,            setEditingDept]            = useState<IDepartment | undefined>();
  const [isCreateUserOpen,       setIsCreateUserOpen]       = useState(false);
  const [isCreateRoleOpen,       setIsCreateRoleOpen]       = useState(false);
  const [assignPermissionsRoleId, setAssignPermissionsRoleId] = useState<string | undefined>();
  const [isDeleteConfirmOpen,    setIsDeleteConfirmOpen]    = useState(false);

  // ── Derived data ────────────────────────────────────────────────────────────
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
    overview:    undefined,
    departments: departments?.length,
    users:       users.length,
    roles:       roles?.length,
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loadingOrg) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Not found ───────────────────────────────────────────────────────────────
  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Building className="w-16 h-16 text-gray-200 mb-4" />
        <h2 className="text-2xl font-black text-dark mb-2">Organización no encontrada</h2>
        <p className="text-gray-400 mb-6">La organización que buscas no existe o fue eliminada.</p>
        <Link to="/organizations" className="text-sm font-bold text-brand hover:underline flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Volver a Organizaciones
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-20 space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          to="/organizations"
          className="flex items-center gap-1 text-gray-400 hover:text-brand font-semibold transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Organizaciones
        </Link>
        <span className="text-gray-200">/</span>
        <span className="font-bold text-dark truncate">{org.name}</span>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20 shrink-0">
              <Building className="w-7 h-7 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-black text-dark truncate">{org.name}</h1>
              <p className="font-mono text-xs text-gray-400 mt-0.5 break-all">{org.id}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  Creada {format(new Date(org.createdAt), "dd/MM/yyyy", { locale: es })}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  Actualizada {format(new Date(org.updatedAt), "dd/MM/yyyy", { locale: es })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveCompanyId(isActiveScope ? null : (id ?? null))}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                isActiveScope ? "bg-brand text-white" : "bg-brand/10 text-brand hover:bg-brand/20"
              }`}
            >
              {isActiveScope ? "Scope activo" : "Activar scope"}
            </button>
            {can("delete_company") && (
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Eliminar organización"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab bar + content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 gap-6 px-6">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count    = tabCounts[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 pt-4 text-sm font-bold transition-colors flex items-center gap-2 ${
                  isActive
                    ? "border-b-2 border-brand text-brand -mb-px"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
                {count !== undefined && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-brand/10 text-brand" : "bg-gray-100 text-gray-400"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <OverviewTab org={org} />
          )}

          {activeTab === "departments" && (
            <DepartmentsTab
              loading={loadingDepts}
              filtered={filteredDepts}
              search={deptSearch}
              onSearch={setDeptSearch}
              onCreate={() => { setEditingDept(undefined); setIsDeptModalOpen(true); }}
              onEdit={(dept) => { setEditingDept(dept); setIsDeptModalOpen(true); }}
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

      {/* Modals */}
      {id && isDeptModalOpen && (
        <DepartmentModal
          isOpen={isDeptModalOpen}
          onClose={() => { setIsDeptModalOpen(false); setEditingDept(undefined); }}
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
