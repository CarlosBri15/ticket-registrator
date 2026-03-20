import { useTranslation } from "react-i18next";
import { AlertCircle, CheckCircle } from "lucide-react";

interface PendingStatsCardProps {
  count: number;
  label?: string;
  dataTestId?: string;
}

export const PendingStatsCard = ({ count, label, dataTestId }: PendingStatsCardProps) => {
  const { t } = useTranslation();
  const hasPending = count > 0;
  
  const containerClasses = [
    "relative",
    "overflow-hidden",
    "rounded-[2rem]",
    "p-6",
    "flex",
    "flex-col",
    "gap-4",
    "border",
    "shadow-sm",
    "transition-all",
    "duration-300",
    hasPending ? "bg-amber-50 border-amber-200" : "bg-white border-gray-100"
  ].join(" ");

  const labelClasses = [
    "text-[10px]",
    "font-black",
    "uppercase",
    "tracking-[0.2em]",
    hasPending ? "text-amber-600" : "text-gray-400"
  ].join(" ");

  const iconContainerClasses = [
    "w-9",
    "h-9",
    "rounded-xl",
    "flex",
    "items-center",
    "justify-center",
    hasPending ? "bg-amber-100 text-amber-600" : "bg-green-50 text-green-500"
  ].join(" ");

  const titleClasses = [
    "relative",
    "z-10",
    "text-3xl",
    "font-black",
    "tracking-tighter",
    hasPending ? "text-amber-700" : "text-dark"
  ].join(" ");

  const subtitleClasses = [
    "relative",
    "z-10",
    "text-xs",
    "font-bold",
    hasPending ? "text-amber-600/70" : "text-gray-400"
  ].join(" ");

  return (
    <div className={containerClasses} data-testid="pending-approvals-card">
      <div className="relative z-10 flex items-start justify-between">
        <p className={labelClasses}>
          {label || (hasPending ? t("home.requiresReview") : t("home.allCaughtUp"))}
        </p>
        <div className={iconContainerClasses}>
          {hasPending ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
        </div>
      </div>
      <h3 className={titleClasses} data-testid={dataTestId}>
        {count}
      </h3>
      <p className={subtitleClasses}>
        {hasPending ? t("home.pendingApprovals") : t("home.noPendingApprovals")}
      </p>
    </div>
  );
};
