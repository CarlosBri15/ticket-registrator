import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LargestOrgCardProps {
  largestOrg: { name: string } | null;
  userCount?: number;
}

/**
 * KPI card surfaced on the SuperAdmin dashboard. Shows the organization with
 * the most users so the SuperAdmin sees at a glance which tenant carries the
 * platform's headcount.
 */
export const LargestOrgCard = ({ largestOrg, userCount = 0 }: LargestOrgCardProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 p-5 rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-sans-semibold uppercase tracking-wide text-dark/50">
          {t("dashboard.orgLargest")}
        </p>
        <div className="w-7 h-7 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-dark/45 shrink-0">
          <TrendingUp className="w-4 h-4" aria-hidden={true} />
        </div>
      </div>

      <h3
        className="text-[18px] font-sans-bold tracking-tight text-dark truncate"
        data-testid="largest-org-name"
      >
        {largestOrg?.name ?? "—"}
      </h3>

      <p className="text-[12px] font-sans-medium text-dark/45">
        {largestOrg ? t("dashboard.userCount", { count: userCount }) : t("dashboard.orgNoData")}
      </p>
    </div>
  );
};
