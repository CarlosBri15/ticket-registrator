import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, Plus, Trash2, UserCircle, Mail, AtSign, Pencil } from "lucide-react";
import {
  useUsersQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
  useRolesQuery,
  usePermissions,
  useScope,
  AUTHORITY_LEVELS,
  type IUser,
  type IRole,
} from "@ticket-registrator/shared";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { AlertError, getApiErrorMessage } from "../../components/ui/Alert";
import { tokens, radius } from "../../styles/design-tokens";
import { RoleSelect, OrgSelect } from "../../components/ui/selects";
import { DepartmentMultiSelect } from "../../components/ui/multiSelects";
import { Modal } from "../../components/ui/Modal";
import { Pagination } from "../../components/ui/Pagination";
import { useScopeContext } from "@ticket-registrator/shared";
import { EditUserModal } from "./EditUserModal";

const PAGE_SIZE = 10;

const CreateUserModal = ({
  isOpen,
  onClose,
  companyId,
}: {
  isOpen: boolean;
  onClose: () => void;
  companyId: string | null;
}) => {
  const mutation = useCreateUserMutation({ onSuccess: onClose });

  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    roleId: "",
    orgId: "",          // only used when creator is SuperAdmin
    selectedRole: null as IRole | null,
    departmentIds: [] as string[],
  });

  // Creator is SuperAdmin when companyId is null — they must pick an org
  const isCreatorSuperAdmin = companyId === null;

  // Is the role being assigned a SuperAdmin role? → no org needed
  const isTargetSuperAdmin =
    form.selectedRole !== null &&
    form.selectedRole.hierarchy >= AUTHORITY_LEVELS.GLOBAL;

  // Which companyId to use for the RoleSelect
  const effectiveCompanyId = isCreatorSuperAdmin ? (form.orgId || null) : companyId;

  const reset = () => mutation.reset();

  const set = useCallback((k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    reset();
    setForm((p) => ({ ...p, [k]: e.target.value }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const passwordMismatch = Boolean(
    form.password && form.confirmPassword && form.password !== form.confirmPassword,
  );

  const orgMissing = isCreatorSuperAdmin && !!form.roleId && !isTargetSuperAdmin && !form.orgId;

  const handleSubmit = (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    if (passwordMismatch || orgMissing) return;

    const payload: any = {
      name: form.name,
      surname: form.surname,
      email: form.email,
      username: form.username,
      password: form.password,
      confirmPassword: form.confirmPassword,
      roleId: form.roleId,
      departmentIds: form.departmentIds,
    };
    if (isCreatorSuperAdmin && form.orgId) payload.companyId = form.orgId;

    mutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Usuario">
      <form onSubmit={handleSubmit} className="space-y-4">
        {mutation.error && (
          <AlertError
            message={getApiErrorMessage(mutation.error)}
            onDismiss={() => mutation.reset()}
          />
        )}
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombre *" value={form.name} onChange={set("name")} placeholder="Carlos" required />
          <Input label="Apellido *" value={form.surname} onChange={set("surname")} placeholder="García" required />
        </div>
        <Input label="Email *" type="email" value={form.email} onChange={set("email")} placeholder="carlos@empresa.com" required />
        <Input label="Usuario *" value={form.username} onChange={set("username")} placeholder="cgarcia" required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Contraseña *" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" required />
          <Input label="Confirmar *" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="••••••••" required />
        </div>

        <RoleSelect
          id="user-role"
          companyId={effectiveCompanyId}
          value={form.roleId}
          onChange={(v, role) => {
            reset();
            setForm((p) => ({
              ...p,
              roleId: v,
              selectedRole: role ?? null,
              // Clear org when switching to SuperAdmin role (no org needed)
              orgId: role && role.hierarchy >= AUTHORITY_LEVELS.GLOBAL ? "" : p.orgId,
            }));
          }}
          required
        />

        {/* Org selector — appears after role is chosen, only when role is not SuperAdmin */}
        {isCreatorSuperAdmin && form.roleId && !isTargetSuperAdmin && (
          <OrgSelect
            id="user-org"
            value={form.orgId}
            onChange={(v) => { reset(); setForm((p) => ({ ...p, orgId: v })); }}
            required
          />
        )}

        {/* Department multiselect — shown when role is not SuperAdmin and companyId is available */}
        {!isTargetSuperAdmin && (isCreatorSuperAdmin ? form.orgId : companyId) && (
          <DepartmentMultiSelect
            id="user-departments"
            companyId={isCreatorSuperAdmin ? form.orgId : companyId}
            value={form.departmentIds}
            onChange={(ids) => setForm((p) => ({ ...p, departmentIds: ids }))}
          />
        )}

        {passwordMismatch && (
          <AlertError message="Las contraseñas no coinciden" />
        )}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={mutation.isPending}
            disabled={!form.name || !form.email || !form.roleId || passwordMismatch || orgMissing}
            className="flex-1"
          >
            Crear Usuario
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const UserRow = ({
  user,
  roles,
  canDelete,
  onDelete,
  onEdit,
}: {
  user: IUser;
  roles?: { id: string; name: string }[];
  canDelete: boolean;
  onDelete: (id: string) => void;
  onEdit: (user: IUser) => void;
}) => {
  const navigate = useNavigate();
  const roleName = roles?.find((r) => r.id === user.roleId)?.name ?? "—";

  return (
    <div className={`bg-white p-4 ${radius.card} border border-slate-200 shadow-sm flex items-center justify-between gap-4`}>
      <button
        type="button"
        className="flex items-center gap-3 min-w-0 text-left flex-1"
        onClick={() => navigate(`/users/${user.id}`)}
      >
        <div className={`w-10 h-10 bg-brand/10 ${radius.base} flex items-center justify-center shrink-0`}>
          <UserCircle className="w-5 h-5 text-brand" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-dark truncate">
            {user.name} {user.surname}
          </p>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
              <Mail className="w-3 h-3" />
              {user.email}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
              <AtSign className="w-3 h-3" />
              {user.username}
            </span>
          </div>
        </div>
      </button>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`${tokens.badgeSm} ${tokens.badgeBrand}`}>
          {roleName}
        </span>
        <button
          type="button"
          onClick={() => onEdit(user)}
          className={`p-2 text-slate-300 hover:text-brand hover:bg-brand/10 ${radius.base} transition-all`}
          title="Editar usuario"
          aria-label="Editar usuario"
        >
          <Pencil className="w-4 h-4" />
        </button>
        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(user.id)}
            className={`p-2 text-slate-300 hover:text-danger hover:bg-danger/5 ${radius.base} transition-all`}
            title="Eliminar usuario"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export const UsersScreen = () => {
  const { can } = usePermissions();
  const { scope, isGlobal } = useScope();
  const { activeCompanyId } = useScopeContext();

  const getCompanyId = () => {
    if (isGlobal) return activeCompanyId;
    return (scope as any)?.companyId ?? null;
  };

  const companyId = getCompanyId();

  const { data: users, isLoading } = useUsersQuery();
  const { data: roles } = useRolesQuery(companyId ?? undefined);
  const deleteMutation = useDeleteUserMutation();

  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [search]);

  const filtered = users?.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.surname.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q)
    );
  });

  const paginated = filtered?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil((filtered?.length ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight mb-1 flex items-center gap-3">
            <Users className="w-6 h-6 text-brand" />
            Usuarios
          </h1>
          <p className="text-slate-500 text-sm">Gestión de usuarios de tu organización.</p>
        </div>
        {can("create_users") && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, email o usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={tokens.searchInput}
        />
      </div>

      {/* Content */}
      {(() => {
        if (isLoading) {
          return (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-500 font-medium text-sm">Cargando usuarios...</p>
            </div>
          );
        }

        if (!filtered || filtered.length === 0) {
          return (
            <div className={tokens.emptyState}>
              <div className={tokens.emptyStateIcon}>
                <Users className="w-7 h-7 text-slate-300" />
              </div>
              <h3 className="text-base font-semibold text-dark mb-1">
                {search ? "Sin resultados" : "No hay usuarios"}
              </h3>
              <p className={tokens.emptyStateText}>
                {search ? "Prueba con otra búsqueda." : "Crea el primer usuario de tu organización."}
              </p>
            </div>
          );
        }

        return (
          <div className="space-y-3">
            {paginated!.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                roles={roles}
                canDelete={can("delete_users")}
                onDelete={(id) => deleteMutation.mutate(id)}
                onEdit={(u) => { setEditingUser(u); setIsEditOpen(true); }}
              />
            ))}
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        );
      })()}

      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        companyId={companyId}
      />

      {isEditOpen && editingUser && (
        <EditUserModal
          isOpen={isEditOpen}
          onClose={() => { setIsEditOpen(false); setEditingUser(null); }}
          user={editingUser}
          companyId={companyId}
        />
      )}
    </div>
  );
};
