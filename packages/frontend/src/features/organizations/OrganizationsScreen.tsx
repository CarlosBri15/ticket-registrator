import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Globe,
  Plus,
  Building,
  Search,
  ChevronRight,
} from "lucide-react";
import {
  useOrganizationsQuery,
  useOnboardOrganizationMutation,
  usePermissions,
  type IOrganization,
} from "@ticket-registrator/shared";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { AlertError, getApiErrorMessage } from "../../components/ui/Alert";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// ─── Onboard Modal ────────────────────────────────────────────────────────────

type AdminEntry = { id: string; name: string; surname: string; email: string };

const OnboardModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const mutation = useOnboardOrganizationMutation({ onSuccess: onClose });
  const [companyName, setCompanyName] = useState("");
  const [admins, setAdmins] = useState<AdminEntry[]>([
    { id: crypto.randomUUID(), name: "", surname: "", email: "" },
  ]);

  const updateAdmin = (id: string, field: keyof AdminEntry, value: string) =>
    setAdmins((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));

  const addAdmin = () =>
    setAdmins((prev) => [...prev, { id: crypto.randomUUID(), name: "", surname: "", email: "" }]);

  const removeAdmin = (id: string) =>
    setAdmins((prev) => prev.filter((a) => a.id !== id));

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    mutation.mutate({
      company: { name: companyName },
      admins: admins.map(({ name, surname, email }) => ({ name, surname, email })),
    });
  };

  const isValid =
    companyName.trim().length >= 2 &&
    admins.every((a) => a.name.trim() && a.surname.trim() && a.email.trim());

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Organización" subtitle="Onboarding de empresa">
      <form onSubmit={handleSubmit} className="space-y-6">
        {mutation.error && (
          <AlertError message={getApiErrorMessage(mutation.error)} onDismiss={() => mutation.reset()} />
        )}
        <Input
          label="Nombre de la empresa *"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Acme Corporation"
          required
        />

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Administradores iniciales *
            </span>
            {admins.length < 3 && (
              <button
                type="button"
                onClick={addAdmin}
                className="text-xs font-bold text-brand hover:text-brand flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Añadir
              </button>
            )}
          </div>
          <div className="space-y-4">
            {admins.map((admin, i) => (
              <div key={admin.id} className="p-4 bg-gray-50 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Admin {i + 1}</p>
                  {admins.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAdmin(admin.id)}
                      className="text-xs text-red-400 hover:text-red-600 font-bold"
                    >
                      Quitar
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Nombre *" value={admin.name} onChange={(e) => updateAdmin(admin.id, "name", e.target.value)} placeholder="Carlos" required />
                  <Input label="Apellido *" value={admin.surname} onChange={(e) => updateAdmin(admin.id, "surname", e.target.value)} placeholder="García" required />
                </div>
                <Input label="Email *" type="email" value={admin.email} onChange={(e) => updateAdmin(admin.id, "email", e.target.value)} placeholder="carlos@acme.com" required />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Se generarán contraseñas temporales para cada administrador.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" isLoading={mutation.isPending} disabled={!isValid} className="flex-1">
            Crear Organización
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Org Card ─────────────────────────────────────────────────────────────────

const OrgCard = ({ org, onClick }: { org: IOrganization; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full text-left bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-brand/20 transition-all group flex items-center gap-4"
  >
    <div className="w-11 h-11 bg-brand/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-brand/20 transition-colors">
      <Building className="w-5 h-5 text-brand" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-dark text-sm truncate">{org.name}</p>
      <p className="text-xs text-gray-400 mt-0.5">
        {format(new Date(org.createdAt), "dd MMM yyyy", { locale: es })}
      </p>
    </div>
    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand transition-colors shrink-0" />
  </button>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const OrganizationsScreen = () => {
  const navigate = useNavigate();
  const { can } = usePermissions();

  const { data: organizations, isLoading } = useOrganizationsQuery();

  const [search, setSearch] = useState("");
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);

  const filtered = organizations?.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()),
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-32">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (!filtered || filtered.length === 0) {
      return (
        <div className="text-center py-32 bg-white rounded-[2rem] border border-dashed border-gray-200">
          <Globe className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-black text-gray-300 mb-2">
            {search ? "Sin resultados" : "No hay organizaciones"}
          </h3>
          <p className="text-sm text-gray-300">
            {search ? "Prueba con otra búsqueda." : "Crea la primera organización usando el botón superior."}
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((org) => (
            <OrgCard
              key={org.id}
              org={org}
              onClick={() => navigate(`/organizations/${org.id}`)}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">
          {filtered.length} de {organizations?.length ?? 0} organizaciones
        </p>
      </>
    );
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
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

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
        <input
          type="text"
          placeholder="Buscar organización..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-dark placeholder-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
        />
      </div>

      {/* Content */}
      {renderContent()}

      <OnboardModal isOpen={isOnboardOpen} onClose={() => setIsOnboardOpen(false)} />
    </div>
  );
};
