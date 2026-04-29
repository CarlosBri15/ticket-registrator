import { User, Plus } from "lucide-react";
import { type IUser } from "@ticket-registrator/shared";
import { Button } from "../../../components/ui/Button";
import { SearchInput } from "../../../components/ui/SearchInput";
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
        <div className="w-4 h-4 border-2 border-dark/20 border-t-dark/60 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <SearchInput
            value={search}
            onChange={onSearch}
            placeholder={t("users.searchPlaceholder")}
          />
        </div>
        {canCreate && (
          <Button onClick={onCreate} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            {t("users.new")}
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-14 gap-2 text-center rounded-lg border border-dashed border-[var(--color-border-main)] bg-[var(--color-surface-card)]">
          <User className="w-4 h-4 text-dark/25" aria-hidden={true} />
          <p className="font-sans-medium text-[13px] text-dark/55">
            {search ? t("common.noResults") : t("users.empty")}
          </p>
          <p className="font-sans-normal text-[12px] text-dark/40 max-w-sm">
            {search ? t("common.tryAnotherSearch") : t("users.emptyDesc")}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)] overflow-hidden">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="group flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border-main)] last:border-b-0 hover:bg-[var(--color-secondary)] transition-colors duration-100"
            >
              <div className="w-8 h-8 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-dark/40 group-hover:bg-white shrink-0">
                <User className="w-3.5 h-3.5" aria-hidden={true} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans-semibold text-dark text-[14px] truncate leading-snug">
                  {user.name} {user.surname}
                </p>
                <p className="font-sans-medium text-dark/50 text-[12px] mt-0.5 truncate leading-none">
                  {user.email} · @{user.username}
                </p>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--color-secondary)] text-dark/70 text-[11px] font-sans-semibold shrink-0 group-hover:bg-white">
                {getRoleName(user.roleId)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
