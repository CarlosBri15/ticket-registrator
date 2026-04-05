import { Layers, Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { type IDepartment } from "@ticket-registrator/shared";
import { Button } from "../../../components/ui/Button";
import { SearchInput } from "../../../components/ui/SearchInput";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { EmptyState } from "../../../components/ui/EmptyState";
import { useTranslation } from "react-i18next";
import { useDateLocale } from "../../../hooks/useDateLocale";

interface DepartmentsTabProps {
  loading: boolean;
  filtered: IDepartment[] | undefined;
  search: string;
  onSearch: (v: string) => void;
  onCreate: () => void;
  onEdit: (dept: IDepartment) => void;
  onDelete: (id: string) => void;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export const DepartmentsTab = ({
  loading,
  filtered,
  search,
  onSearch,
  onCreate,
  onEdit,
  onDelete,
  canCreate,
  canEdit,
  canDelete,
}: DepartmentsTabProps) => {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <SearchInput
          value={search}
          onChange={onSearch}
          placeholder={t("departments.searchPlaceholder")}
          className="flex-1"
        />
        {canCreate && (
          <Button onClick={onCreate} className="shrink-0" leftIcon={<Plus className="w-4 h-4" />}>
            {t("departments.new")}
          </Button>
        )}
      </div>

      {!filtered || filtered.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-7 h-7 text-white" />}
          title={search ? t("common.noResults") : t("departments.empty")}
          description={search ? t("common.tryAnotherSearch") : t("departments.emptyDesc")}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((dept) => (
            <div
              key={dept.id}
              className="flex items-center gap-3 p-4 bg-[var(--color-surface-card)] border-2 border-border-main rounded-xl"
            >
              <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-space-bold text-dark text-sm truncate">{dept.name}</p>
                <p className="text-xs font-space text-dark/40 mt-0.5">
                  {format(new Date(dept.createdAt), "dd MMM yyyy", { locale: dateLocale })}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(dept)}
                    className="p-2 text-dark/20 hover:text-brand hover:bg-brand/10 rounded-xl transition-all"
                    title={t("common.edit")}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(dept.id)}
                    className="p-2 text-dark/20 hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                    title={t("common.delete")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
