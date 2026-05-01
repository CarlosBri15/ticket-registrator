import { useNavigate } from "react-router-dom";
import { Layers, Plus, Trash2, Pencil, ChevronRight } from "lucide-react";
import {
  useDepartmentsQuery,
  useDeleteDepartmentMutation,
  usePermissions,
  useCompanyScope,
  useListState,
  useModalState,
  PAGE_SIZE,
  type IDepartment,
} from "@ticket-registrator/shared";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Button } from "../../../components/ui/Button";
import { Pagination } from "../../../components/ui/Pagination";
import { SearchInput } from "../../../components/ui/SearchInput";
import { EmptyState } from "../../../components/ui/EmptyState";
import { ResourceListScreen } from "../../../components/ui/ResourceListScreen";
import { DepartmentModal } from "../components/DepartmentModal";
import { DEPT_GRID } from "../../../constants/gridLayouts";

export const DepartmentsScreen = () => {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const { companyId } = useCompanyScope();
  const navigate = useNavigate();

  const { data: departments, isLoading } = useDepartmentsQuery(companyId ?? undefined);
  const deleteMutation = useDeleteDepartmentMutation(companyId ?? "");

  const { search, setSearch, page, setPage, paginate } = useListState();
  const { isOpen: isModalOpen, item: editing, open: openModal, close: closeModal } =
    useModalState<IDepartment>();

  // ── Pre-list guard: SuperAdmin without an active company can't manage depts ──
  if (!companyId) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader title={t("departments.title")} />
        <EmptyState
          icon={<Layers className="w-4 h-4" aria-hidden={true} />}
          title={t("departments.selectOrg")}
          description={t("departments.selectOrgDesc")}
        />
      </div>
    );
  }

  const totalDepartments = departments?.length ?? 0;
  const hasAny = totalDepartments > 0;

  const filtered = departments?.filter(
    (d) => !search || d.name.toLowerCase().includes(search.toLowerCase()),
  ) ?? [];
  const { paginated, totalPages } = paginate(filtered);

  return (
    <>
      <ResourceListScreen<IDepartment>
        title={t("departments.title")}
        stats={hasAny ? [{ label: t("departments.total", "Total"), value: totalDepartments }] : undefined}
        headerActions={
          can("create_departments") ? (
            <Button
              variant="primary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => openModal()}
            >
              {t("departments.new")}
            </Button>
          ) : null
        }
        toolbar={
          hasAny ? (
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={t("departments.searchPlaceholder")}
            />
          ) : null
        }
        gridTemplate={DEPT_GRID}
        columns={[{ label: t("departments.tableName", "Nombre") }, { label: "", align: "right" }]}
        items={paginated}
        total={totalDepartments}
        filteredTotal={filtered.length}
        isLoading={isLoading}
        keyOf={(d) => d.id}
        renderRow={(dept) => (
          <DepartmentRow
            dept={dept}
            onClick={() => navigate(`/departments/${dept.id}`)}
            canEdit={can("edit_departments")}
            canDelete={can("delete_departments")}
            onEdit={() => openModal(dept)}
            onDelete={() => deleteMutation.mutate(dept.id)}
            editLabel={t("common.edit", "Editar")}
            deleteLabel={t("common.delete", "Eliminar")}
          />
        )}
        messages={{
          emptyTitle: t("departments.empty"),
          emptyDescription: t("departments.emptyDesc"),
          noResults: t("common.noResults"),
          clearFilters: t("trips.filterClearAll"),
          loading: t("departments.loading"),
        }}
        onClearFilters={() => setSearch("")}
        footer={
          filtered.length > 0 ? (
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          ) : null
        }
      />

      <DepartmentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        companyId={companyId}
        department={editing}
      />
    </>
  );
};

// ─── Row ──────────────────────────────────────────────────────────────────────

interface DepartmentRowProps {
  dept: IDepartment;
  onClick: () => void;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  editLabel: string;
  deleteLabel: string;
}

const DepartmentRow = ({
  dept,
  onClick,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
}: DepartmentRowProps) => (
  <div className="relative">
    <button
      type="button"
      onClick={onClick}
      className="list-row group w-full text-left gap-4"
      style={{ gridTemplateColumns: DEPT_GRID }}
    >
      <div className="w-8 h-8 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-dark/40 group-hover:bg-white">
        <Layers className="w-3.5 h-3.5" aria-hidden={true} />
      </div>
      <p className="row-name truncate">{dept.name}</p>
      <div aria-hidden={true} />
      <div aria-hidden={true} />
    </button>

    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center gap-1">
      <div className="pointer-events-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
        {canEdit && (
          <button
            type="button"
            title={editLabel}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-dark/40 hover:text-dark transition-colors p-1"
          >
            <Pencil className="w-3.5 h-3.5" aria-hidden={true} />
          </button>
        )}
        {canDelete && (
          <button
            type="button"
            title={deleteLabel}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-dark/40 hover:text-danger transition-colors p-1"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden={true} />
          </button>
        )}
      </div>
      {!canEdit && !canDelete && (
        <ChevronRight className="row-chev w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden={true} />
      )}
    </div>
  </div>
);
