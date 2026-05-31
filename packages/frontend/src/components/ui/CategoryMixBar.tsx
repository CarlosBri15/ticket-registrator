import { useTranslation } from "react-i18next";
import type { IReportCategoryMix } from "@ticket-registrator/shared";
import { CategoryIcon } from "./CategoryIcon";

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
    <div className={`flex flex-col gap-1.5 ${className}`.trim()}>
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

      <div className="flex items-center gap-2 flex-wrap text-[11px] font-sans-medium text-dark/55 min-w-0">
        {visible.map((s, idx) => (
          <span
            key={s.categoryId ?? `__legend__${s.categoryName}`}
            className="inline-flex items-center gap-1 min-w-0"
          >
            {idx > 0 && <span aria-hidden="true" className="text-dark/25">·</span>}
            <CategoryIcon
              iconName={s.categoryIcon}
              color={s.categoryColor}
              className="w-3 h-3 shrink-0"
            />
            <span className="truncate" style={{ color: s.categoryColor ?? undefined }}>
              {s.categoryName}
            </span>
            <span className="text-dark/45 tabular-nums">{s.percentage}%</span>
          </span>
        ))}
        {overflow > 0 && (
          <span className="text-dark/45">+{overflow}</span>
        )}
      </div>
    </div>
  );
};
