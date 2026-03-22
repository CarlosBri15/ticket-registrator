import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Building,
  Layers,
  UserCircle,
  Shield,
  Pencil,
  Trash2,
  Search,
  Plus,
  ChevronLeft,
  CalendarDays,
} from "lucide-react";
import {
  useOrganizationQuery,
  useDeleteOrganizationMutation,
  useUpdateOrganizationMutation,
  useDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useUsersQuery,
  useRolesQuery,
  usePermissions,
  useScopeContext,
  type IDepartment,
} from "@ticket-registrator/shared";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CreateUserModal } from "../../users/components/CreateUserModal";
import { CreateRoleModal } from "../../roles/components/CreateRoleModal";
import { AssignPermissionsModal } from "../../users/components/AssignPermissionsModal";

// ─── Hierarchy helpers ────────────────────────────────────────────────────────

const getHierarchyLabel = (h: number) => {
  if (h >= 100) return "SuperAdmin";
  if (h >= 99) return "Admin";
  if (h >= 50) return "Manager";
  if (h >= 40) return "Controller";
  return "Empleado";
};

const getHierarchyColor = (h: number) => {
  if (h >= 100) return "bg-purple-100 text-purple-700";
  if (h >= 99) return "bg-brand/10 text-brand";
  if (h >= 50) return "bg-amber-100 text-amber-700";
  if (h >= 40) return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-600";
};

// ─── Sub-components for Tabs ──────────────────────────────────────────────────

const OverviewTab = ({ org }: { org: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(org.name);
  const updateMutation = useUpdateOrganizationMutation({ onSuccess: () => setIsEditing(false) });

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (name.trim().length >= 2) {
      updateMutation.mutate({ id: org.id, data: { name } });
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setName(org.name);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">Nombre</p>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
              <Input
                label="Nombre de la organización"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder="Nombre de la organización"
                required
                autoFocus
              />
              <Button
                type="submit"
                isLoading={updateMutation.isPending}
                disabled={name.trim().length < 2}
                className="shrink-0"
              >
                Guardar
              </Button>
              <Button type="button" variant="ghost" onClick={cancelEdit} className="shrink-0">
                Cancelar
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-bold text-dark">{org.name}</p>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-300 hover:text-brand hover:bg-brand/10 rounded-lg transition-all"
                title="Editar nombre"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">ID</p>
          <p className="font-mono text-xs text-gray-500 break-all">{org.id}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">Creada</p>
          <p className="font-bold text-dark">
            {format(new Date(org.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">Actualizada</p>
          <p className="font-bold text-dark">
            {format(new Date(org.updatedAt), "dd/MM/yyyy HH:mm", { locale: es })}
          </p>
        </div>
      </div>
    </div>
  );
};

const DepartmentsTab = ({
  loading,
  filtered,
  search,
  setSearch,
  onCreate,
  onEdit,
  onDelete,
  canCreate,
  canEdit,
  canDelete,
}: {
  loading: boolean;
  filtered: IDepartment[] | undefined;
  search: string;
  setSearch: (v: string) => void;
  onCreate: () => void;
  onEdit: (d: IDepartment) => void;
  onDelete: (id: string) => void;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            placeholder="Buscar departamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-dark placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
          />
        </div>
        {canCreate && (
          <Button onClick={onCreate} className="shrink-0">
            <Plus className="w-4 h-4 mr-1.5" />
            Nuevo
          </Button>
        )}
      </div>

      {!filtered || filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Layers className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-400">Sin departamentos</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((dept) => (
            <div
              key={dept.id}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"
            >
              <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-dark text-sm truncate">{dept.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {format(new Date(dept.createdAt), "dd MMM yyyy", { locale: es })}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(dept)}
                    className="p-2 text-gray-300 hover:text-brand hover:bg-brand/10 rounded-xl transition-all"
                    title="Editar departamento"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(dept.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Eliminar departamento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const UsersTab = ({
  loading,
  filtered,
  search,
  setSearch,
  onCreate,
  canCreate,
  getRoleName,
}: {
  loading: boolean;
  filtered: any[];
  search: string;
  setSearch: (v: string) => void;
  onCreate: () => void;
  canCreate: boolean;
  getRoleName: (roleId: string) => string;
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-dark placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
          />
        </div>
        {canCreate && (
          <Button onClick={onCreate} className="shrink-0">
            <Plus className="w-4 h-4 mr-1.5" />
            Nuevo
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <UserCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-400">Sin usuarios</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"
            >
              <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center shrink-0">
                <UserCircle className="w-4 h-4 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-dark text-sm truncate">
                  {user.name} {user.surname}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user.email} · @{user.username}
                </p>
              </div>
              <span className="text-xs bg-brand/10 text-brand px-2.5 py-1 rounded-full font-bold shrink-0">
                {getRoleName(user.roleId)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RolesTab = ({
  loading,
  roles,
  search,
  setSearch,
  onCreate,
  canCreate,
  onAssignPermissions,
  canManagePermissions,
}: {
  loading: boolean;
  roles: any[] | undefined;
  search: string;
  setSearch: (v: string) => void;
  onCreate: () => void;
  canCreate: boolean;
  onAssignPermissions: (roleId: string) => void;
  canManagePermissions: boolean;
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = roles?.filter((r) =>
    !search || r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            placeholder="Buscar rol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-dark placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
          />
        </div>
        {canCreate && (
          <Button onClick={onCreate} className="shrink-0">
            <Plus className="w-4 h-4 mr-1.5" />
            Nuevo
          </Button>
        )}
      </div>

      {!filtered || filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Shield className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-400">
            {search ? "Sin resultados" : "Sin roles"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((role) => (
            <div
              key={role.id}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"
            >
              <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-dark text-sm truncate">{role.name}</p>
                {role.description && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">{role.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {canManagePermissions && (
                  <button
                    type="button"
                    onClick={() => onAssignPermissions(role.id)}
                    className="text-xs font-bold px-2.5 py-1 text-brand bg-brand/10 hover:bg-brand/20 rounded-lg transition-all"
                    title="Gestionar permisos"
                  >
                    Permisos
                  </button>
                )}
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold ${getHierarchyColor(
                    role.hierarchy
                  )}`}
                >
                  {getHierarchyLabel(role.hierarchy)} · {role.hierarchy}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Department Modal ─────────────────────────────────────────────────────────

const DepartmentModal = ({
  isOpen,
  onClose,
  companyId,
  department,
}: {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  department?: IDepartment;
}) => {
  const [name, setName] = useState(department?.name ?? "");
  const isEditing = !!department;

  const createMutation = useCreateDepartmentMutation(companyId, { onSuccess: onClose });
  const updateMutation = useUpdateDepartmentMutation(companyId, { onSuccess: onClose });

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (isEditing) {
      updateMutation.mutate({ id: department.id, data: { name } });
    } else {
      createMutation.mutate({ name });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Departamento" : "Nuevo Departamento"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del departamento *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Recursos Humanos"
          autoFocus
          required
        />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isPending} disabled={!name.trim()} className="flex-1">
            {isEditing ? "Guardar cambios" : "Crear Departamento"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

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
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 bg-red-500 text-white font-bold text-sm py-2.5 px-4 rounded-xl hover:bg-red-600 transition-all"
        >
          Eliminar
        </button>
      </div>
    </div>
  </Modal>
);

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

type TabId = "overview" | "departments" | "users" | "roles";

const tabs: { id: TabId; label: string }[] = [
  { id: "overview", label: "Resumen" },
  { id: "departments", label: "Departamentos" },
  { id: "users", label: "Usuarios" },
  { id: "roles", label: "Roles" },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────

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
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<IDepartment | undefined>();
  const [roleSearch, setRoleSearch] = useState("");
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [assignPermissionsRoleId, setAssignPermissionsRoleId] = useState<string | undefined>();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const openCreateDept = () => { setEditingDept(undefined); setIsDeptModalOpen(true); };
  const openEditDept = (dept: IDepartment) => { setEditingDept(dept); setIsDeptModalOpen(true); };
  const closeDeptModal = () => { setIsDeptModalOpen(false); setEditingDept(undefined); };

  const filteredDepts = departments?.filter((d) =>
    !deptSearch || d.name.toLowerCase().includes(deptSearch.toLowerCase()),
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

  // Tab counts
  const tabCounts: Record<TabId, number | undefined> = {
    overview: undefined,
    departments: departments?.length,
    users: users.length,
    roles: roles?.length,
  };

  // ─── Loading state ───────────────────────────────────────────────────────────

  if (loadingOrg) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─── Not found state ─────────────────────────────────────────────────────────

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
          {/* Left: info */}
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

          {/* Right: actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveCompanyId(isActiveScope ? null : (id ?? null))}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                isActiveScope
                  ? "bg-brand text-white"
                  : "bg-brand/10 text-brand hover:bg-brand/20"
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
        {/* Tab bar */}
        <div className="flex border-b border-gray-100 gap-6 px-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = tabCounts[tab.id];
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
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-brand/10 text-brand" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === "overview" && <OverviewTab org={org} />}

          {activeTab === "departments" && (
            <DepartmentsTab
              loading={loadingDepts}
              filtered={filteredDepts}
              search={deptSearch}
              setSearch={setDeptSearch}
              onCreate={openCreateDept}
              onEdit={openEditDept}
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
              setSearch={setUserSearch}
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
              setSearch={setRoleSearch}
              onCreate={() => setIsCreateRoleOpen(true)}
              canCreate={can("create_roles")}
              onAssignPermissions={(roleId: any) => setAssignPermissionsRoleId(roleId)}
              canManagePermissions={can("manage_permissions")}
            />
          )}
        </div>
      </div>

      {/* Department modal */}
      {id && isDeptModalOpen && (
        <DepartmentModal
          isOpen={isDeptModalOpen}
          onClose={closeDeptModal}
          companyId={id}
          department={editingDept}
        />
      )}

      {/* Create user modal */}
      {id && isCreateUserOpen && (
        <CreateUserModal
          isOpen={isCreateUserOpen}
          onClose={() => setIsCreateUserOpen(false)}
          companyId={id}
        />
      )}

      {/* Create role modal */}
      {id && isCreateRoleOpen && (
        <CreateRoleModal
          isOpen={isCreateRoleOpen}
          onClose={() => setIsCreateRoleOpen(false)}
          companyId={id}
          onRoleCreated={(roleId: any) => setAssignPermissionsRoleId(roleId)}
        />
      )}

      {/* Assign permissions modal */}
      {id && assignPermissionsRoleId && (
        <AssignPermissionsModal
          isOpen={!!assignPermissionsRoleId}
          onClose={() => setAssignPermissionsRoleId(undefined)}
          companyId={id}
          roleId={assignPermissionsRoleId}
          roleName={roles?.find((r) => r.id === assignPermissionsRoleId)?.name}
        />
      )}

      {/* Delete confirmation modal */}
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
