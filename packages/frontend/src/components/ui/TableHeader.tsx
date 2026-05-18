import { memo } from "react";
import { REPORT_GRID } from "../../constants/gridLayouts";

interface TableHeaderProps {
  columns: {
    label: string | React.ReactNode;
    align?: "left" | "center" | "right";
  }[];
  /** El grid-template-columns a usar. Por defecto es el estandar de la app. */
  gridTemplate?: string;
  className?: string;
  /** Render an empty slot before the columns (matches the row icon column). Default true. */
  withLeadingSlot?: boolean;
  /** Render an empty slot after the columns (matches the row chevron column). Default true. */
  withTrailingSlot?: boolean;
}

const ALIGN_CLASSES = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

/**
 * TableHeader — Componente de cabecera de tabla minimalista.
 * Sigue la regla de diseño: sin mayúsculas sostenidas (vía props).
 *
 * The leading/trailing slots default to true because most lists in the app
 * use a 32px icon column on the left and a 16px chevron column on the right.
 * Disable them when the row grid doesn't include those columns (e.g. the
 * tickets table inside report detail, which dropped the icon column).
 */
export const TableHeader = memo(({
  columns,
  gridTemplate = REPORT_GRID,
  className = "",
  withLeadingSlot = true,
  withTrailingSlot = true,
}: TableHeaderProps) => {
  return (
    <div
      className={`list-head gap-4 ${className}`}
      style={{ gridTemplateColumns: gridTemplate }}
    >
      {withLeadingSlot && <div />}

      {columns.map((col, idx) => (
        <span
          key={typeof col.label === "string" ? col.label : idx}
          className={`text-[11px] font-sans-semibold text-dark/80 ${ALIGN_CLASSES[col.align || "left"]}`}
        >
          {col.label}
        </span>
      ))}

      {withTrailingSlot && <div />}
    </div>
  );
});
