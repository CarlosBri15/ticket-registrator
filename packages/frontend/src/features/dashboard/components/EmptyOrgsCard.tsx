import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface EmptyOrgsCardProps {
  /** Number of organizations that currently have zero users assigned. */
  count: number;
}

/**
 * KPI card surfaced on the SuperAdmin dashboard. Highlights orgs that have
 * been created but have no members yet — typically because admin onboarding
 * was abandoned or hasn't started.
 */
export const EmptyOrgsCard = ({ count }: EmptyOrgsCardProps) => {
  const { t } = useTranslation();
  const hasIssues = count > 0;

  return (
    <div
      className={`flex flex-col gap-3 p-5 rounded-lg border ${
        hasIssues
          ? "bg-amber-50 border-amber-100"
          : "bg-[var(--color-surface-card)] border-[var(--color-border-main)]"
      }`}
      data-testid="empty-orgs-card"
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={`text-[11px] font-sans-semibold uppercase tracking-wide ${
            hasIssues ? "text-amber-700" : "text-dark/50"
          }`}
        >
          {t("dashboard.orgsWithoutUsers")}
        </p>
        <div
          className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
            hasIssues
              ? "bg-amber-100 text-amber-700"
              : "bg-[var(--color-secondary)] border border-[var(--color-border-main)] text-dark/30"
          }`}
        >
          <AlertCircle className="w-4 h-4" aria-hidden={true} />
        </div>
      </div>

      <h3
        className={`text-[26px] font-sans-bold leading-none tracking-tight ${
          hasIssues ? "text-amber-700" : "text-dark"
        }`}
      >
        {count}
      </h3>

      <p
        className={`text-[12px] font-sans-medium ${
          hasIssues ? "text-amber-700/70" : "text-dark/45"
        }`}
      >
        {hasIssues ? t("dashboard.orgsRequireAttention") : t("dashboard.orgsAllHaveUsers")}
      </p>
    </div>
  );
};
