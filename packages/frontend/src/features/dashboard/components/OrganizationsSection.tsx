import { Globe, Users, ChevronRight } from "lucide-react";
import { format, type Locale } from "date-fns";
import { Button } from "../../../components/ui/Button";
import { SearchInput } from "../../../components/ui/SearchInput";

interface OrganizationsSectionProps {
  filteredOrgs: { id: string; name: string; createdAt: string }[] | undefined;
  usersPerOrg: Record<string, number>;
  dateLocale: Locale;
  setActiveCompanyId: (id: string | null) => void;
  navigate: (path: string) => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
  totalOrgs: number;
  search: string;
  setSearch: (v: string) => void;
}

/**
 * Searchable organizations list block surfaced on the SuperAdmin dashboard.
 * Includes a per-row "view as company" action that switches scope context.
 */
export const OrganizationsSection = ({
  filteredOrgs,
  usersPerOrg,
  dateLocale,
  setActiveCompanyId,
  navigate,
  t,
  totalOrgs,
  search,
  setSearch,
}: OrganizationsSectionProps) => {
  const hasResults = (filteredOrgs?.length ?? 0) > 0;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-dark/50" aria-hidden={true} />
          <h2 className="text-[15px] font-sans-bold text-dark tracking-tight">
            {t("layout.organizations")}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => navigate("/organizations")}
          className="text-[12px] font-sans-medium text-dark/50 hover:text-dark underline underline-offset-2 transition-colors"
        >
          {t("common.viewAll")}
        </button>
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder={t("dashboard.orgSearchPlaceholder")}
      />

      {hasResults ? (
        <div className="rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)] overflow-hidden">
          {filteredOrgs?.map((org) => {
            const userCount = usersPerOrg[org.id] ?? 0;
            return (
              <div
                key={org.id}
                className="group flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border-main)] last:border-b-0 hover:bg-[var(--color-secondary)] transition-colors"
              >
                <div className="w-8 h-8 rounded-md bg-dark text-white flex items-center justify-center shrink-0 font-sans-bold text-[12px]">
                  {org.name.charAt(0).toUpperCase()}
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/organizations/${org.id}`)}
                  className="flex-1 min-w-0 text-left"
                >
                  <p className="font-sans-semibold text-dark text-[14px] truncate leading-snug">
                    {org.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] font-sans-medium">
                    <span
                      className={`flex items-center gap-1 ${
                        userCount === 0 ? "text-amber-700" : "text-dark/55"
                      }`}
                    >
                      <Users className="w-3 h-3" aria-hidden={true} />
                      {t("dashboard.userCount", { count: userCount })}
                    </span>
                    <span className="text-dark/20">·</span>
                    <span className="text-dark/40">
                      {format(new Date(org.createdAt), "dd MMM yyyy", { locale: dateLocale })}
                    </span>
                  </div>
                </button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setActiveCompanyId(org.id)}
                >
                  {t("common.view")}
                </Button>
                <button
                  type="button"
                  onClick={() => navigate(`/organizations/${org.id}`)}
                  className="text-dark/30 hover:text-dark transition-colors p-1 opacity-0 group-hover:opacity-100"
                  title={t("dashboard.orgFullDetail")}
                >
                  <ChevronRight className="w-4 h-4" aria-hidden={true} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center py-14 gap-2 text-center rounded-lg border border-dashed border-[var(--color-border-main)] bg-[var(--color-surface-card)]">
          <Globe className="w-4 h-4 text-dark/25" aria-hidden={true} />
          <p className="text-[13px] font-sans-medium text-dark/55">
            {search ? t("dashboard.orgNoResults") : t("dashboard.orgNone")}
          </p>
        </div>
      )}

      {totalOrgs > 0 && (
        <p className="text-[12px] font-sans-medium text-dark/45 text-center">
          {t("dashboard.orgCounter", { filtered: filteredOrgs?.length ?? 0, total: totalOrgs })}
        </p>
      )}
    </section>
  );
};
