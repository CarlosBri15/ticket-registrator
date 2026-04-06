/**
 * ReportEmptyState — Zero-state card for the reports list.
 * Shows an icon, title, description, optional CTA, and optional "clear filters" link.
 */
import { Plus, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { tokens } from "../../../styles/theme";

interface ReportEmptyStateProps {
  title: string;
  description: string;
  onAction?: () => void;
  actionLabel?: string;
  filtered?: boolean;
  onClear?: () => void;
}

export const ReportEmptyState = ({
  title,
  description,
  onAction,
  actionLabel,
  filtered,
  onClear,
}: ReportEmptyStateProps) => {
  const { t } = useTranslation();
  return (
    <div className={tokens.emptyState}>
      <div className={`${tokens.emptyStateIcon} mb-4`}>
        <FileText className="w-5 h-5 text-dark/35" />
      </div>
      <p className="font-sans-semibold text-dark text-[14px]">{title}</p>
      <p className={`${tokens.emptyStateText} mt-1`}>{description}</p>
      {filtered && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="font-sans-medium text-[12px] text-dark/50 underline underline-offset-2 mt-2 hover:text-dark transition-colors"
        >
          {t("trips.filterClearAll")}
        </button>
      )}
      {onAction && actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-brand hover:bg-brand-hover text-dark rounded-md font-sans-medium text-[13px] transition-colors border border-brand/20"
        >
          <Plus className="w-3.5 h-3.5" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
