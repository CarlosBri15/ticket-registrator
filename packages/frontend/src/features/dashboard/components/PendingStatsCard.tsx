import { useTranslation } from "react-i18next";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface PendingStatsCardProps {
  count: number;
  label?: string;
  dataTestId?: string;
}

export const PendingStatsCard = ({ count, label, dataTestId }: PendingStatsCardProps) => {
  const { t } = useTranslation();
  const hasPending = count > 0;

  return (
    <div
      className={`flex flex-col gap-3 p-5 rounded-lg border ${
        hasPending
          ? "bg-amber-50 border-amber-100"
          : "bg-[var(--color-surface-card)] border-[var(--color-border-main)]"
      }`}
      data-testid="pending-approvals-card"
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={`text-[11px] font-sans-semibold uppercase tracking-wide ${
            hasPending ? "text-amber-700" : "text-dark/50"
          }`}
        >
          {label || (hasPending ? t("home.requiresReview") : t("home.allCaughtUp"))}
        </p>
        <div
          className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
            hasPending ? "bg-amber-100 text-amber-700" : "bg-green-50 text-success border border-green-100"
          }`}
        >
          {hasPending ? (
            <AlertCircle className="w-4 h-4" aria-hidden={true} />
          ) : (
            <CheckCircle2 className="w-4 h-4" aria-hidden={true} />
          )}
        </div>
      </div>

      <h3
        className={`text-[26px] font-sans-bold leading-none tracking-tight ${
          hasPending ? "text-amber-700" : "text-dark"
        }`}
        data-testid={dataTestId}
      >
        {count}
      </h3>

      <p
        className={`text-[12px] font-sans-medium ${
          hasPending ? "text-amber-700/70" : "text-dark/45"
        }`}
      >
        {hasPending ? t("home.pendingApprovals") : t("home.noPendingApprovals")}
      </p>
    </div>
  );
};
