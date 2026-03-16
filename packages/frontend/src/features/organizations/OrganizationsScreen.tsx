import { useState } from "react";
import { Globe, Plus, Trash2, ChevronRight, Building } from "lucide-react";
import {
  useOrganizationsQuery,
  useOnboardOrganizationMutation,
  useDeleteOrganizationMutation,
  usePermissions,
  type IOrganization,
} from "@ticket-registrator/shared";
import { useScopeContext } from "@ticket-registrator/shared";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type AdminEntry = { name: string; surname: string; email: string };

const OnboardModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const mutation = useOnboardOrganizationMutation({ onSuccess: onClose });
  const [companyName, setCompanyName] = useState("");
  const [admins, setAdmins] = useState<AdminEntry[]>([{ name: "", surname: "", email: "" }]);

  const updateAdmin = (index: number, field: keyof AdminEntry, value: string) => {
    setAdmins((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addAdmin = () => setAdmins((prev) => [...prev, { name: "", surname: "", email: "" }]);
  const removeAdmin = (index: number) => setAdmins((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      company: { name: companyName },
      admins,
    });
  };

  const isValid = companyName.trim().length >= 2 && admins.every(
    (a) => a.name.trim() && a.surname.trim() && a.email.trim()
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Organización" subtitle="Onboarding de empresa">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Nombre de la empresa *"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Acme Corporation"
          required
        />

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Administradores iniciales *
            </label>
            {admins.length < 3 && (
              <button
                type="button"
                onClick={addAdmin}
                className="text-xs font-bold text-brand hover:text-brand-hover flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Añadir
              </button>
            )}
          </div>
          <div className="space-y-4">
            {admins.map((admin, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Admin {i + 1}</p>
                  {admins.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAdmin(i)}
                      className="text-xs text-red-400 hover:text-red-600 font-bold"
                    >
                      Quitar
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Nombre *"
                    value={admin.name}
                    onChange={(e) => updateAdmin(i, "name", e.target.value)}
                    placeholder="Carlos"
                    required
                  />
                  <Input
                    label="Apellido *"
                    value={admin.surname}
                    onChange={(e) => updateAdmin(i, "surname", e.target.value)}
                    placeholder="García"
                    required
                  />
                </div>
                <Input
                  label="Email *"
                  type="email"
                  value={admin.email}
                  onChange={(e) => updateAdmin(i, "email", e.target.value)}
                  placeholder="carlos@acme.com"
                  required
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Se generarán contraseñas temporales para cada administrador.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={mutation.isPending} disabled={!isValid} className="flex-1">
            Crear Organización
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const OrgCard = ({
  org,
  isActive,
  canDelete,
  onSelect,
  onDelete,
}: {
  org: IOrganization;
  isActive: boolean;
  canDelete: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) => (
  <div
    className={`bg-white p-6 rounded-[2rem] border transition-all cursor-pointer group ${
      isActive ? "border-brand shadow-lg shadow-brand/10" : "border-gray-100 shadow-sm hover:shadow-md hover:border-brand/20"
    }`}
    onClick={() => onSelect(org.id)}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(org.id); }}
    role="button"
    tabIndex={0}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${isActive ? "bg-brand" : "bg-brand/10 group-hover:bg-brand/20"}`}>
          <Building className={`w-5 h-5 ${isActive ? "text-white" : "text-brand"}`} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-dark truncate">{org.name}</p>
            {isActive && (
              <span className="text-[10px] bg-brand text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                Activa
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Creada {format(new Date(org.createdAt), "dd MMM yyyy", { locale: es })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {canDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(org.id); }}
            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <ChevronRight className={`w-4 h-4 transition-colors ${isActive ? "text-brand" : "text-gray-200 group-hover:text-brand"}`} />
      </div>
    </div>
  </div>
);

export const OrganizationsScreen = () => {
  const { can } = usePermissions();
  const { activeCompanyId, setActiveCompanyId } = useScopeContext();

  const { data: organizations, isLoading } = useOrganizationsQuery();
  const deleteMutation = useDeleteOrganizationMutation();

  const [isOnboardOpen, setIsOnboardOpen] = useState(false);

  const handleSelect = (id: string) => {
    setActiveCompanyId(activeCompanyId === id ? null : id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-dark tracking-tight mb-2 flex items-center gap-3">
            <Globe className="w-8 h-8 text-brand" />
            Organizaciones
          </h1>
          <p className="text-gray-500 font-medium">Gestión global de todas las organizaciones.</p>
        </div>
        {can("create_company") && (
          <Button onClick={() => setIsOnboardOpen(true)} className="shadow-xl shadow-brand/20">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Organización
          </Button>
        )}
      </div>

      {activeCompanyId && (
        <div className="bg-brand/5 border border-brand/15 rounded-2xl px-5 py-3.5 flex items-center justify-between">
          <p className="text-sm font-semibold text-brand">
            Viendo datos de la organización seleccionada
          </p>
          <button
            onClick={() => setActiveCompanyId(null)}
            className="text-xs font-bold text-brand/60 hover:text-brand transition-colors"
          >
            Ver todas
          </button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Cargando organizaciones...</p>
        </div>
      ) : !organizations || organizations.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Globe className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-black text-dark mb-3">No hay organizaciones</h3>
          <p className="text-gray-400 max-w-sm mx-auto">Crea la primera organización del sistema.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {organizations.map((org) => (
            <OrgCard
              key={org.id}
              org={org}
              isActive={activeCompanyId === org.id}
              canDelete={can("delete_company")}
              onSelect={handleSelect}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      <OnboardModal isOpen={isOnboardOpen} onClose={() => setIsOnboardOpen(false)} />
    </div>
  );
};
