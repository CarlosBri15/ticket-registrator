import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Building, ChevronRight } from "lucide-react";
import {
  useOrganizationsQuery,
  usePermissions,
  type IOrganization,
} from "@ticket-registrator/shared";
import { Button } from "../../../components/ui/Button";
import { SearchInput } from "../../../components/ui/SearchInput";
import { ResourceListScreen } from "../../../components/ui/ResourceListScreen";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ORG_GRID } from "../../../constants/gridLayouts";
import { OnboardOrganizationModal } from "../components/OnboardOrganizationModal";

// ─── Org Row ──────────────────────────────────────────────────────────────────

const OrgRow = ({ org, onClick }: { org: IOrganization; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="list-row group w-full text-left gap-4"
    style={{ gridTemplateColumns: ORG_GRID }}
  >
    <div className="w-8 h-8 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-dark/40 group-hover:bg-white">
      <Building className="w-3.5 h-3.5" aria-hidden={true} />
    </div>
    <p className="row-name truncate">{org.name}</p>
    <p className="row-meta text-right whitespace-nowrap">
      {format(new Date(org.createdAt), "dd MMM yyyy", { locale: es })}
    </p>
    <ChevronRight className="row-chev w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden={true} />
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
  ) ?? [];

  const totalOrgs = organizations?.length ?? 0;
  const hasAny = totalOrgs > 0;

  return (
    <>
      <ResourceListScreen<IOrganization>
        title="Organizaciones"
        stats={
          hasAny
            ? [{
                label: "Total",
                value: totalOrgs,
                icon: <Building className="w-4 h-4" aria-hidden={true} />,
              }]
            : undefined
        }
        headerActions={
          can("create_company") ? (
            <Button
              variant="primary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsOnboardOpen(true)}
            >
              Nueva Organización
            </Button>
          ) : null
        }
        toolbar={
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar organización..."
          />
        }
        gridTemplate={ORG_GRID}
        columns={[
          { label: "Nombre" },
          { label: "Creada", align: "right" },
        ]}
        items={filtered}
        total={totalOrgs}
        filteredTotal={filtered.length}
        isLoading={isLoading}
        keyOf={(org) => org.id}
        renderRow={(org) => (
          <OrgRow org={org} onClick={() => navigate(`/organizations/${org.id}`)} />
        )}
        messages={{
          emptyTitle: "No hay organizaciones",
          emptyDescription: "Crea la primera organización usando el botón superior.",
          noResults: "Sin resultados",
          clearFilters: "Limpiar búsqueda",
        }}
        onClearFilters={() => setSearch("")}
        footer={
          filtered.length > 0 ? (
            <p className="text-[12px] font-sans-medium text-dark/45 text-center mt-2">
              {filtered.length} de {totalOrgs} organizaciones
            </p>
          ) : null
        }
      />

      <OnboardOrganizationModal isOpen={isOnboardOpen} onClose={() => setIsOnboardOpen(false)} />
    </>
  );
};
