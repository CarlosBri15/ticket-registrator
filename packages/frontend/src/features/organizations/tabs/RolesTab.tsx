import { Shield, Plus, Key } from "lucide-react";
import { getHierarchyLabel, type IRole } from "@ticket-registrator/shared";
import { Button } from "../../../components/ui/Button";
import { SearchInput } from "../../../components/ui/SearchInput";
import { useTranslation } from "react-i18next";

interface RolesTabProps {
  loading: boolean;
  roles: IRole[] | undefined;
  search: string;
  onSearch: (v: string) => void;
  onCreate: () => void;
  canCreate: boolean;
  onAssignPermissions: (roleId: string) => void;
  canManagePermissions: boolean;
}

export const RolesTab = ({
  loading,
  roles,
  search,
  onSearch,
  onCreate,
  canCreate,
  onAssignPermissions,
  canManagePermissions,
}: RolesTabProps) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-4 h-4 border-2 border-dark/20 border-t-dark/60 rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = roles?.filter(
    (r) => !search || r.name.toLowerCase().includes(search.toLowerCase()),
  );

  const isEmpty = !filtered || filtered.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <SearchInput
            value={search}
            onChange={onSearch}
            placeholder={t("roles.searchPlaceholder")}
          />
        </div>
        {canCreate && (
          <Button onClick={onCreate} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            {t("roles.new")}
          </Button>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center py-14 gap-2 text-center rounded-lg border border-dashed border-[var(--color-border-main)] bg-[var(--color-surface-card)]">
          <Shield className="w-4 h-4 text-dark/25" aria-hidden={true} />
          <p className="font-sans-medium text-[13px] text-dark/55">
            {search ? t("common.noResults") : t("roles.empty")}
          </p>
          <p className="font-sans-normal text-[12px] text-dark/40 max-w-sm">
            {search ? t("common.tryAnotherSearch") : t("roles.emptyDesc")}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)] overflow-hidden">
          {filtered.map((role) => (
            <div
              key={role.id}
              className="group flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border-main)] last:border-b-0 hover:bg-[var(--color-secondary)] transition-colors duration-100"
            >
              <div className="w-8 h-8 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-dark/40 group-hover:bg-white shrink-0">
                <Shield className="w-3.5 h-3.5" aria-hidden={true} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans-semibold text-dark text-[14px] truncate leading-snug">
                  {role.name}
                </p>
                {role.description && (
                  <p className="font-sans-medium text-dark/50 text-[12px] mt-0.5 truncate leading-none">
                    {role.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {canManagePermissions && (
                  <button
                    type="button"
                    onClick={() => onAssignPermissions(role.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-sans-semibold px-2 py-1 rounded-md text-dark/60 hover:text-dark hover:bg-white border border-[var(--color-border-main)] transition-colors"
                    title={t("roles.managePermissions")}
                  >
                    <Key className="w-3 h-3" aria-hidden={true} />
                    {t("roles.permissions")}
                  </button>
                )}
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--color-secondary)] text-dark/70 text-[11px] font-sans-semibold whitespace-nowrap group-hover:bg-white">
                  {getHierarchyLabel(role.hierarchy)} · {role.hierarchy}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
