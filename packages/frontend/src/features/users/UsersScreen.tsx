import { useState } from "react";
import { Users, Search, Plus, Trash2, UserCircle, Mail, AtSign } from "lucide-react";
import {
  useUsersQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
  useRolesQuery,
  usePermissions,
  useScope,
  type IUser,
} from "@ticket-registrator/shared";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { useScopeContext } from "@ticket-registrator/shared";

const CreateUserModal = ({
  isOpen,
  onClose,
  companyId,
}: {
  isOpen: boolean;
  onClose: () => void;
  companyId: string | null;
}) => {
  const { data: roles } = useRolesQuery(companyId ?? undefined);
  const mutation = useCreateUserMutation({ onSuccess: onClose });

  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    roleId: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return;
    mutation.mutate({ ...form, departmentIds: [] });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Usuario">
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <div>
          <label
            htmlFor="user-role"
            className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5"
          >
            Rol *
          </label>
          <select
            id="user-role"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-dark focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30"
            value={form.roleId}
            onChange={set("roleId")}
            required
          >
            <option value="">Selecciona un rol</option>
            {roles?.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
          <p className="text-xs text-red-500 font-medium">Las contraseñas no coinciden</p>
        )}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={mutation.isPending}
            disabled={!form.name || !form.email || !form.roleId || form.password !== form.confirmPassword}
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
}: {
  user: IUser;
  roles?: { id: string; name: string }[];
  canDelete: boolean;
  onDelete: (id: string) => void;
}) => {
  const roleName = roles?.find((r) => r.id === user.roleId)?.name ?? "—";

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 bg-brand/10 rounded-2xl flex items-center justify-center shrink-0">
          <UserCircle className="w-5 h-5 text-brand" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-dark truncate">
            {user.name} {user.surname}
          </p>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
              <Mail className="w-3 h-3" />
              {user.email}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
              <AtSign className="w-3 h-3" />
              {user.username}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs bg-brand/10 text-brand px-2.5 py-1 rounded-full font-bold">
          {roleName}
        </span>
        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(user.id)}
            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-dark tracking-tight mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-brand" />
            Usuarios
          </h1>
          <p className="text-gray-500 font-medium">Gestión de usuarios de tu organización.</p>
        </div>
        {can("create_users") && (
          <Button onClick={() => setIsCreateOpen(true)} className="shadow-xl shadow-brand/20">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
        <input
          type="text"
          placeholder="Buscar por nombre, email o usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-dark placeholder-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
        />
      </div>

      {/* Content */}
      {(() => {
        if (isLoading) {
          return (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Cargando usuarios...</p>
            </div>
          );
        }

        if (!filtered || filtered.length === 0) {
          return (
            <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-black text-dark mb-3">
                {search ? "Sin resultados" : "No hay usuarios"}
              </h3>
              <p className="text-gray-400 max-w-sm mx-auto">
                {search ? "Prueba con otra búsqueda." : "Crea el primer usuario de tu organización."}
              </p>
            </div>
          );
        }

        return (
          <div className="space-y-3">
            {filtered.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                roles={roles}
                canDelete={can("delete_users")}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        );
      })()}

      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        companyId={companyId}
      />
    </div>
  );
};
