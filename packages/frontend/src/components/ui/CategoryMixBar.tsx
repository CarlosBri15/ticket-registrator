import { useTranslation } from "react-i18next";
import type { IReportCategoryMix } from "@ticket-registrator/shared";

interface CategoryMixBarProps {
  segments: IReportCategoryMix[] | undefined;
  maxLegendItems?: number;
  className?: string;
}

const FALLBACK_COLOR = "var(--color-stone-400)";

export const CategoryMixBar = ({
  segments,
  maxLegendItems = 3,
  className = "",
}: CategoryMixBarProps) => {
  const { t } = useTranslation();
  if (!segments || segments.length === 0) return null;

  const visible = segments.slice(0, maxLegendItems);
  const overflow = segments.length - visible.length;

  return (
    <div className={`flex flex-col gap-1 ${className}`.trim()}>
      <div
        className="flex h-1 w-full overflow-hidden rounded-full"
        role="img"
        aria-label={t("reports.mixAria")}
      >
        {segments.map((s) => (
          <div
            key={s.categoryId ?? `__uncat__${s.categoryName}`}
            className="h-full"
            style={{
              width: `${s.percentage}%`,
              backgroundColor: s.categoryColor ?? FALLBACK_COLOR,
            }}
            title={`${s.categoryName} · ${s.percentage}%`}
          />
        ))}
      </div>

      <p className="text-[11px] font-sans-medium text-dark/55 truncate">
        {visible.map((s, idx) => (
          <span key={s.categoryId ?? `__legend__${s.categoryName}`}>
            {idx > 0 && <span className="text-dark/25"> · </span>}
            <span style={{ color: s.categoryColor ?? undefined }}>
              {s.categoryName}
            </span>
            <span className="text-dark/45"> {s.percentage}%</span>
          </span>
        ))}
        {overflow > 0 && (
          <span className="text-dark/45"> · +{overflow}</span>
        )}
      </p>
    </div>
  );
};
