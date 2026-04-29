import { Plus, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

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
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 gap-2">
      <div className="w-10 h-10 rounded-lg bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-dark/40 mb-1">
        <FileText className="w-4 h-4" aria-hidden={true} />
      </div>
      <p className="font-sans-semibold text-dark text-[14px]">{title}</p>
      <p className="text-[13px] font-sans-normal text-dark/55 max-w-sm leading-relaxed">
        {description}
      </p>
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
          className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-full font-sans-medium text-[13px] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden={true} />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
