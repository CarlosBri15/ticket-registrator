import { memo } from "react";

interface TableHeaderProps {
  columns: {
    label: string | React.ReactNode;
    align?: "left" | "center" | "right";
  }[];
  /** El grid-template-columns a usar. Por defecto es el estandar de la app. */
  gridTemplate?: string;
  className?: string;
}

const DEFAULT_GRID = "32px 1fr 120px 148px 100px 16px";

const ALIGN_CLASSES = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

/**
 * TableHeader — Componente de cabecera de tabla minimalista.
 * Sigue la regla de diseño: sin mayúsculas sostenidas (vía props).
 */
export const TableHeader = memo(({ 
  columns, 
  gridTemplate = DEFAULT_GRID,
  className = "" 
}: TableHeaderProps) => {
  return (
    <div 
      className={`grid items-center gap-4 px-4 py-2.5 bg-white border-b border-[var(--color-border-main)] ${className}`}
      style={{ gridTemplateColumns: gridTemplate }}
    >
      {/* Primer espacio para el icono de la fila (coincide con el primer 32px del grid) */}
      <div />
      
      {columns.map((col, idx) => (
        <span 
          key={typeof col.label === "string" ? col.label : idx}
          className={`text-[11px] font-sans-semibold text-dark/80 ${ALIGN_CLASSES[col.align || "left"]}`}
        >
          {col.label}
        </span>
      ))}
      
      {/* Ultimo espacio para el chevron de la fila (coincide con el ultimo 16px del grid) */}
      <div />
    </div>
  );
});
