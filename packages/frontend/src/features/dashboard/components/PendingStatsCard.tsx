import { useTranslation } from "react-i18next";
import { AlertCircle, CheckCircle } from "lucide-react";
import { radius } from "../../../styles/theme";

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
      className={`relative overflow-hidden ${radius.card} p-5 flex flex-col gap-3 border shadow-sm transition-all duration-200 ${hasPending ? "bg-warning/5 border-warning/20" : "bg-white border-slate-200"}`}
      data-testid="pending-approvals-card"
    >
      <div className="flex items-start justify-between">
        <p className={`text-xs font-medium uppercase tracking-wide ${hasPending ? "text-warning" : "text-slate-400"}`}>
          {label || (hasPending ? t("home.requiresReview") : t("home.allCaughtUp"))}
        </p>
        <div className={`w-8 h-8 ${radius.base} flex items-center justify-center ${hasPending ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
          {hasPending ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
        </div>
      </div>
      <h3 className={`text-2xl font-bold tracking-tight leading-none ${hasPending ? "text-warning" : "text-dark"}`} data-testid={dataTestId}>
        {count}
      </h3>
      <p className={`text-xs font-medium ${hasPending ? "text-warning/70" : "text-slate-400"}`}>
        {hasPending ? t("home.pendingApprovals") : t("home.noPendingApprovals")}
      </p>
    </div>
  );
};
