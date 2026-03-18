import { useState } from "react";
import { Layers, Search, Plus, Trash2, Pencil, Building2 } from "lucide-react";
import {
  useDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  usePermissions,
  useScope,
  type IDepartment,
} from "@ticket-registrator/shared";
import { useScopeContext } from "@ticket-registrator/shared";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";

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

  const createMutation = useCreateDepartmentMutation(companyId, { onSuccess: onClose });
  const updateMutation = useUpdateDepartmentMutation(companyId, { onSuccess: onClose });

  const isEditing = !!department;

  const handleSubmit = (e: React.BaseSyntheticEvent) => {
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

export const DepartmentsScreen = () => {
  const { can } = usePermissions();
  const { scope, isGlobal } = useScope();
  const { activeCompanyId } = useScopeContext();

  const getCompanyId = () => {
    if (isGlobal) return activeCompanyId;
    return (scope as any)?.companyId ?? null;
  };

  const companyId = getCompanyId();

  const { data: departments, isLoading } = useDepartmentsQuery(companyId ?? undefined);
  const deleteMutation = useDeleteDepartmentMutation(companyId ?? "");

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<IDepartment | undefined>();

  const openCreate = () => { setEditing(undefined); setIsModalOpen(true); };
  const openEdit = (dept: IDepartment) => { setEditing(dept); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditing(undefined); };

  const filtered = departments?.filter((d) =>
    !search || d.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!companyId) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Building2 className="w-16 h-16 text-gray-200 mb-4" />
        <h3 className="text-2xl font-black text-dark mb-2">Selecciona una organización</h3>
        <p className="text-gray-400 max-w-sm">
          Para ver los departamentos, selecciona primero una organización desde el panel de Organizaciones.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-dark tracking-tight mb-2 flex items-center gap-3">
            <Layers className="w-8 h-8 text-brand" />
            Departamentos
          </h1>
          <p className="text-gray-500 font-medium">Estructura departamental de tu organización.</p>
        </div>
        {can("create_departments") && (
          <Button onClick={openCreate} className="shadow-xl shadow-brand/20">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Departamento
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
        <input
          type="text"
          placeholder="Buscar departamento..."
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
              <p className="text-gray-500 font-medium">Cargando departamentos...</p>
            </div>
          );
        }

        if (!filtered || filtered.length === 0) {
          return (
            <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Layers className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-black text-dark mb-3">
                {search ? "Sin resultados" : "No hay departamentos"}
              </h3>
              <p className="text-gray-400 max-w-sm mx-auto">
                {search ? "Prueba con otra búsqueda." : "Crea el primer departamento de tu organización."}
              </p>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((dept) => (
              <div
                key={dept.id}
                className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-brand/10 rounded-2xl flex items-center justify-center shrink-0">
                      <Layers className="w-5 h-5 text-brand" />
                    </div>
                    <p className="font-bold text-dark truncate">{dept.name}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {can("edit_departments") && (
                      <button
                        type="button"
                        onClick={() => openEdit(dept)}
                        className="p-2 text-gray-300 hover:text-brand hover:bg-brand/10 rounded-xl transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    {can("delete_departments") && (
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(dept.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {companyId && (
        <DepartmentModal
          isOpen={isModalOpen}
          onClose={closeModal}
          companyId={companyId}
          department={editing}
        />
      )}
    </div>
  );
};
