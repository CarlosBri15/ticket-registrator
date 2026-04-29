import { useNavigate } from "react-router-dom";
import { Layers, Plus, Trash2, Pencil, ChevronRight } from "lucide-react";
import {
  useDepartmentsQuery,
  useDeleteDepartmentMutation,
  usePermissions,
  useCompanyScope,
  useListState,
  useModalState,
  type IDepartment,
} from "@ticket-registrator/shared";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Button } from "../../../components/ui/Button";
import { Pagination } from "../../../components/ui/Pagination";
import { SearchInput } from "../../../components/ui/SearchInput";
import { TableHeader } from "../../../components/ui/TableHeader";
import { EmptyState } from "../../../components/ui/EmptyState";
import { DepartmentModal } from "../components/DepartmentModal";

const DEPT_GRID = "32px 1fr 80px 16px";

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

  const filtered = departments?.filter(
    (d) => !search || d.name.toLowerCase().includes(search.toLowerCase()),
  );
  const { paginated, totalPages } = paginate(filtered ?? []);

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
  const hasFilteredResults = (filtered?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t("departments.title")}
        stats={
          hasAny
            ? [{ label: t("departments.total", "Total"), value: totalDepartments }]
            : undefined
        }
        actions={
          can("create_departments") && (
            <Button
              variant="primary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => openModal()}
            >
              {t("departments.new")}
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-3">
        {hasAny && (
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t("departments.searchPlaceholder")}
          />
        )}

        <div className="w-full">
          <TableHeader
            gridTemplate={DEPT_GRID}
            columns={[{ label: t("departments.tableName", "Nombre") }, { label: "", align: "right" }]}
          />

          {(() => {
            if (isLoading) {
              return (
                <div className="flex flex-col items-center justify-center py-14 gap-2">
                  <div className="w-4 h-4 border-2 border-dark/20 border-t-dark/60 rounded-full animate-spin" />
                  <p className="font-sans-medium text-[13px] text-dark/55">
                    {t("departments.loading")}
                  </p>
                </div>
              );
            }

            if (!hasAny) {
              return (
                <div className="flex flex-col items-center py-14 gap-2 text-center border-b border-[var(--color-border-main)]">
                  <p className="font-sans-medium text-[13px] text-dark/55">
                    {t("departments.empty")}
                  </p>
                  <p className="font-sans-normal text-[12px] text-dark/40 max-w-sm">
                    {t("departments.emptyDesc")}
                  </p>
                </div>
              );
            }

            if (!hasFilteredResults) {
              return (
                <div className="flex flex-col items-center py-14 gap-2 text-center border-b border-[var(--color-border-main)]">
                  <p className="font-sans-medium text-[13px] text-dark/55">
                    {t("common.noResults")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="font-sans-medium text-dark/50 text-[12px] underline underline-offset-2 hover:text-dark transition-colors mt-1"
                  >
                    {t("trips.filterClearAll")}
                  </button>
                </div>
              );
            }

            return paginated.map((dept) => (
              <DepartmentRow
                key={dept.id}
                dept={dept}
                onClick={() => navigate(`/departments/${dept.id}`)}
                canEdit={can("edit_departments")}
                canDelete={can("delete_departments")}
                onEdit={() => openModal(dept)}
                onDelete={() => deleteMutation.mutate(dept.id)}
                editLabel={t("common.edit", "Editar")}
                deleteLabel={t("common.delete", "Eliminar")}
              />
            ));
          })()}
        </div>

        {hasFilteredResults && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered?.length ?? 0}
            pageSize={10}
            onPageChange={setPage}
          />
        )}
      </div>

      <DepartmentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        companyId={companyId}
        department={editing}
      />
    </div>
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
  <div className="group relative border-b border-[var(--color-border-main)] last:border-b-0 hover:bg-[var(--color-secondary)] transition-colors duration-100">
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left grid items-center gap-4 px-4 py-3.5 cursor-pointer"
      style={{ gridTemplateColumns: DEPT_GRID }}
    >
      <div className="w-8 h-8 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-dark/40 group-hover:bg-white">
        <Layers className="w-3.5 h-3.5" aria-hidden={true} />
      </div>
      <p className="font-sans-semibold text-dark text-[14px] truncate leading-snug">
        {dept.name}
      </p>
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
        <ChevronRight className="w-4 h-4 text-dark/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  </div>
);
