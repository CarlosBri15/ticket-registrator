import { useNavigate } from "react-router-dom";
import { Layers, Plus, Trash2, Pencil, Building2 } from "lucide-react";
import {
  useDepartmentsQuery,
  useDeleteDepartmentMutation,
  usePermissions,
  type IDepartment,
} from "@ticket-registrator/shared";
import { Button } from "../../../components/ui/Button";
import { Pagination } from "../../../components/ui/Pagination";
import { SearchInput } from "../../../components/ui/SearchInput";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { EmptyState } from "../../../components/ui/EmptyState";
import { DepartmentModal } from "../components/DepartmentModal";
import { useCompanyScope, useListState, useModalState } from "@ticket-registrator/shared";
import { useTranslation } from "react-i18next";
import { tokens } from "../../../styles/theme";

export const DepartmentsScreen = () => {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const { companyId } = useCompanyScope();
  const navigate = useNavigate();

  const { data: departments, isLoading } = useDepartmentsQuery(companyId ?? undefined);
  const deleteMutation = useDeleteDepartmentMutation(companyId ?? "");

  const { search, setSearch, page, setPage, paginate } = useListState();
  const { isOpen: isModalOpen, item: editing, open: openModal, close: closeModal } = useModalState<IDepartment>();

  const filtered = departments?.filter((d) =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()),
  );
  const { paginated, totalPages } = paginate(filtered ?? []);

  if (!companyId) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <EmptyState
          icon={<Building2 className="w-7 h-7 text-white" />}
          title={t("departments.selectOrg")}
          description={t("departments.selectOrgDesc")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className={tokens.headerPage}>
        <h1 className="font-space-bold text-dark" style={{ fontSize: 24, letterSpacing: "0.5px" }}>
          {t("departments.title")}
        </h1>
        {can("create_departments") && (
          <Button
            variant="primary"
            onClick={() => openModal()}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            {t("departments.new")}
          </Button>
        )}
      </div>

      <div className="px-10 md:px-16 space-y-6 pt-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t("departments.searchPlaceholder")}
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-space-semibold text-dark/40">{t("departments.loading")}</p>
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <EmptyState
            icon={<Layers className="w-7 h-7 text-white" />}
            title={search ? t("common.noResults") : t("departments.empty")}
            description={search ? t("common.tryAnotherSearch") : t("departments.emptyDesc")}
          />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginated.map((dept) => (
                <div key={dept.id} className={`${tokens.card} shadow-hard p-5`}>
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      className="flex items-center gap-3 min-w-0 text-left flex-1"
                      onClick={() => navigate(`/departments/${dept.id}`)}
                    >
                      <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4 text-brand" />
                      </div>
                      <p className="font-space-bold text-dark truncate text-sm">{dept.name}</p>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      {can("edit_departments") && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); openModal(dept); }}
                          className="p-2 text-dark/20 hover:text-brand hover:bg-brand/10 rounded-xl transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {can("delete_departments") && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(dept.id); }}
                          className="p-2 text-dark/20 hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={10}
              onPageChange={setPage}
            />
          </div>
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
