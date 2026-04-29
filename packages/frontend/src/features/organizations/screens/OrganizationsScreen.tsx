import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Building, ChevronRight } from "lucide-react";
import {
  useOrganizationsQuery,
  useOnboardOrganizationMutation,
  usePermissions,
  type IOrganization,
} from "@ticket-registrator/shared";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { SearchInput } from "../../../components/ui/SearchInput";
import { TableHeader } from "../../../components/ui/TableHeader";
import { AlertError, getApiErrorMessage } from "../../../components/ui/Alert";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ORG_GRID = "32px 1fr 140px 16px";

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
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans-semibold text-dark/50 uppercase tracking-wide">
              Administradores iniciales *
            </span>
            {admins.length < 3 && (
              <button
                type="button"
                onClick={addAdmin}
                className="text-[12px] font-sans-medium text-dark/60 hover:text-dark flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Añadir
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {admins.map((admin, i) => (
              <div
                key={admin.id}
                className="rounded-lg border border-[var(--color-border-main)] bg-[var(--color-secondary)] p-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-sans-semibold text-dark/55 uppercase tracking-wide">
                    Admin {i + 1}
                  </p>
                  {admins.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAdmin(admin.id)}
                      className="text-[12px] font-sans-medium text-danger hover:opacity-80"
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

          <p className="text-[12px] font-sans-normal text-dark/45">
            Se generarán contraseñas temporales para cada administrador.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" isLoading={mutation.isPending} disabled={!isValid} className="flex-1">
            Crear Organización
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Org Row ──────────────────────────────────────────────────────────────────

const OrgRow = ({ org, onClick }: { org: IOrganization; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="group w-full text-left border-b border-[var(--color-border-main)] last:border-b-0 hover:bg-[var(--color-secondary)] transition-colors duration-100"
  >
    <div
      className="grid items-center gap-4 px-4 py-3.5"
      style={{ gridTemplateColumns: ORG_GRID }}
    >
      <div className="w-8 h-8 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-dark/40 group-hover:bg-white">
        <Building className="w-3.5 h-3.5" aria-hidden={true} />
      </div>
      <p className="font-sans-semibold text-dark text-[14px] truncate leading-snug">
        {org.name}
      </p>
      <p className="text-right font-sans-medium text-[12px] text-dark/55 whitespace-nowrap">
        {format(new Date(org.createdAt), "dd MMM yyyy", { locale: es })}
      </p>
      <ChevronRight className="w-4 h-4 text-dark/30 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
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

  const totalOrgs = organizations?.length ?? 0;
  const hasAny = totalOrgs > 0;
  const hasFilteredResults = (filtered?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Organizaciones"
        subtitle="Gestión global de todas las organizaciones."
        stats={hasAny ? [{ label: "Total", value: totalOrgs }] : undefined}
        actions={
          can("create_company") && (
            <Button
              variant="primary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsOnboardOpen(true)}
            >
              Nueva Organización
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar organización..."
        />

        <div className="w-full">
          <TableHeader
            gridTemplate={ORG_GRID}
            columns={[
              { label: "Nombre" },
              { label: "Creada", align: "right" },
            ]}
          />

          {(() => {
            if (isLoading) {
              return (
                <div className="flex flex-col items-center justify-center py-14 gap-2">
                  <div className="w-4 h-4 border-2 border-dark/20 border-t-dark/60 rounded-full animate-spin" />
                </div>
              );
            }

            if (!hasAny) {
              return (
                <div className="flex flex-col items-center py-14 gap-2 text-center border-b border-[var(--color-border-main)]">
                  <p className="font-sans-medium text-[13px] text-dark/55">
                    No hay organizaciones
                  </p>
                  <p className="font-sans-normal text-[12px] text-dark/40 max-w-sm">
                    Crea la primera organización usando el botón superior.
                  </p>
                </div>
              );
            }

            if (!hasFilteredResults) {
              return (
                <div className="flex flex-col items-center py-14 gap-2 text-center border-b border-[var(--color-border-main)]">
                  <p className="font-sans-medium text-[13px] text-dark/55">Sin resultados</p>
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="font-sans-medium text-dark/50 text-[12px] underline underline-offset-2 hover:text-dark transition-colors mt-1"
                  >
                    Limpiar búsqueda
                  </button>
                </div>
              );
            }

            return filtered!.map((org) => (
              <OrgRow
                key={org.id}
                org={org}
                onClick={() => navigate(`/organizations/${org.id}`)}
              />
            ));
          })()}
        </div>

        {hasFilteredResults && (
          <p className="text-[12px] font-sans-medium text-dark/45 text-center mt-2">
            {filtered!.length} de {totalOrgs} organizaciones
          </p>
        )}
      </div>

      <OnboardModal isOpen={isOnboardOpen} onClose={() => setIsOnboardOpen(false)} />
    </div>
  );
};
