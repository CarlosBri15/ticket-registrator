import { UserCircle, Plus } from "lucide-react";
import { type IUser } from "@ticket-registrator/shared";
import { Button } from "../../../components/ui/Button";
import { SearchInput } from "../../../components/ui/SearchInput";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { EmptyState } from "../../../components/ui/EmptyState";
import { useTranslation } from "react-i18next";

interface UsersTabProps {
  loading: boolean;
  filtered: IUser[];
  search: string;
  onSearch: (v: string) => void;
  onCreate: () => void;
  canCreate: boolean;
  getRoleName: (roleId: string) => string;
}

export const UsersTab = ({
  loading,
  filtered,
  search,
  onSearch,
  onCreate,
  canCreate,
  getRoleName,
}: UsersTabProps) => {
  const { t } = useTranslation();

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
          placeholder={t("users.searchPlaceholder")}
          className="flex-1"
        />
        {canCreate && (
          <Button onClick={onCreate} className="shrink-0" leftIcon={<Plus className="w-4 h-4" />}>
            {t("users.new")}
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<UserCircle className="w-7 h-7 text-white" />}
          title={search ? t("common.noResults") : t("users.empty")}
          description={search ? t("common.tryAnotherSearch") : t("users.emptyDesc")}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-4 bg-[var(--color-surface-card)] border-2 border-border-main rounded-xl"
            >
              <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center shrink-0">
                <UserCircle className="w-4 h-4 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-space-bold text-dark text-sm truncate">
                  {user.name} {user.surname}
                </p>
                <p className="text-xs font-space text-dark/40 truncate">
                  {user.email} · @{user.username}
                </p>
              </div>
              <span className="text-xs bg-brand/10 text-brand px-2.5 py-1 rounded-full font-space-bold shrink-0">
                {getRoleName(user.roleId)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
