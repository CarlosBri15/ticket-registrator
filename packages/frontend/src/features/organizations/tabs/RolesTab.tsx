import { Shield, Plus } from "lucide-react";
import { getHierarchyLabel, getHierarchyColor, type IRole } from "@ticket-registrator/shared";
import { Button } from "../../../components/ui/Button";
import { SearchInput } from "../../../components/ui/SearchInput";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { EmptyState } from "../../../components/ui/EmptyState";
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
        <LoadingSpinner />
      </div>
    );
  }

  const filtered = roles?.filter(
    (r) => !search || r.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <SearchInput
          value={search}
          onChange={onSearch}
          placeholder={t("roles.searchPlaceholder")}
          className="flex-1"
        />
        {canCreate && (
          <Button onClick={onCreate} className="shrink-0" leftIcon={<Plus className="w-4 h-4" />}>
            {t("roles.new")}
          </Button>
        )}
      </div>

      {!filtered || filtered.length === 0 ? (
        <EmptyState
          icon={<Shield className="w-7 h-7 text-white" />}
          title={search ? t("common.noResults") : t("roles.empty")}
          description={search ? t("common.tryAnotherSearch") : t("roles.emptyDesc")}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((role) => (
            <div
              key={role.id}
              className="flex items-center gap-3 p-4 bg-[var(--color-surface-card)] border-2 border-border-main rounded-xl"
            >
              <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-space-bold text-dark text-sm truncate">{role.name}</p>
                {role.description && (
                  <p className="text-xs font-space text-dark/40 truncate mt-0.5">{role.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {canManagePermissions && (
                  <button
                    type="button"
                    onClick={() => onAssignPermissions(role.id)}
                    className="text-xs font-space-bold px-2.5 py-1 text-brand bg-brand/10 hover:bg-brand/20 rounded-lg transition-all"
                    title={t("roles.managePermissions")}
                  >
                    {t("roles.permissions")}
                  </button>
                )}
                <span className={`text-xs px-2.5 py-1 rounded-full font-space-bold ${getHierarchyColor(role.hierarchy)}`}>
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
