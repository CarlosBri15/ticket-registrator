import { Layers, Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { type IDepartment } from "@ticket-registrator/shared";
import { Button } from "../../../components/ui/Button";
import { SearchInput } from "../../../components/ui/SearchInput";
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
        <div className="w-4 h-4 border-2 border-dark/20 border-t-dark/60 rounded-full animate-spin" />
      </div>
    );
  }

  const isEmpty = !filtered || filtered.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <SearchInput
            value={search}
            onChange={onSearch}
            placeholder={t("departments.searchPlaceholder")}
          />
        </div>
        {canCreate && (
          <Button onClick={onCreate} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            {t("departments.new")}
          </Button>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center py-14 gap-2 text-center rounded-lg border border-dashed border-[var(--color-border-main)] bg-[var(--color-surface-card)]">
          <Layers className="w-4 h-4 text-dark/25" aria-hidden={true} />
          <p className="font-sans-medium text-[13px] text-dark/55">
            {search ? t("common.noResults") : t("departments.empty")}
          </p>
          <p className="font-sans-normal text-[12px] text-dark/40 max-w-sm">
            {search ? t("common.tryAnotherSearch") : t("departments.emptyDesc")}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)] overflow-hidden">
          {filtered.map((dept) => (
            <div
              key={dept.id}
              className="group flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border-main)] last:border-b-0 hover:bg-[var(--color-secondary)] transition-colors duration-100"
            >
              <div className="w-8 h-8 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-dark/40 group-hover:bg-white shrink-0">
                <Layers className="w-3.5 h-3.5" aria-hidden={true} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans-semibold text-dark text-[14px] truncate leading-snug">
                  {dept.name}
                </p>
                <p className="font-sans-medium text-dark/50 text-[12px] mt-0.5 leading-none">
                  {format(new Date(dept.createdAt), "dd MMM yyyy", { locale: dateLocale })}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(dept)}
                    className="text-dark/40 hover:text-dark transition-colors p-1.5"
                    title={t("common.edit")}
                  >
                    <Pencil className="w-3.5 h-3.5" aria-hidden={true} />
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(dept.id)}
                    className="text-dark/40 hover:text-danger transition-colors p-1.5"
                    title={t("common.delete")}
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden={true} />
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
