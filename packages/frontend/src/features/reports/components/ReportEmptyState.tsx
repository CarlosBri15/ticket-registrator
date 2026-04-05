/**
 * ReportEmptyState — Zero-state card for the reports list.
 * Shows an icon, title, description, optional CTA, and optional "clear filters" link.
 */
import { Plus, FileText } from "lucide-react";
import { fonts, nbTokens } from "@ticket-registrator/shared";
import { PixelCard } from "../../../components/ui/PixelCard";
import { SHADOW } from "../constants";
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
  <PixelCard className="w-full">
    <div className="flex flex-col items-center text-center py-10 px-6 gap-3">
      <div
        style={{
          width: 52,
          height: 52,
          backgroundColor: "#3B82F6",
          border: "2px solid #2563EB",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `3px 3px 0px ${SHADOW}`,
        }}
      >
        <FileText className="w-5 h-5 text-white" />
      </div>
      <p className="font-space-bold text-dark" style={{ fontSize: 14 }}>{title}</p>
      <p className="font-space text-dark/40 max-w-xs leading-relaxed" style={{ fontSize: 12 }}>
        {description}
      </p>
      {filtered && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="font-space-bold text-brand underline underline-offset-2"
          style={{ fontSize: 12 }}
        >
          {t("trips.filterClearAll")}
        </button>
      )}
      {onAction && actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="neo-press inline-flex items-center gap-1.5 mt-1"
          style={{
            backgroundColor: "#3B82F6",
            border: "2px solid #2563EB",
            borderRadius: 99,
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 10,
            paddingBottom: 10,
            fontFamily: `'${fonts.family}', sans-serif`,
            fontWeight: 700,
            fontSize: 12,
            color: "#fff",
            boxShadow: `${nbTokens.shadowBadge}px ${nbTokens.shadowBadge}px 0px ${SHADOW}`,
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          {actionLabel}
        </button>
      )}
    </div>
  </PixelCard>
  );
};
