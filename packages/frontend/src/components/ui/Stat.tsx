import type { ReactNode } from "react";

interface StatDelta {
  value: ReactNode;
  direction?: "up" | "down";
}

interface StatProps {
  label: ReactNode;
  value: ReactNode;
  /** Optional currency suffix shown next to the value (e.g. "EUR"). */
  currency?: ReactNode;
  /** Optional delta line below the value (e.g. "+12.5%"). */
  delta?: StatDelta;
  /** Optional icon shown to the left of the label. */
  icon?: ReactNode;
  className?: string;
}

/**
 * 4-up KPI tile. Wraps the kit `.stat` primitive with a typed React API so
 * callers do not have to remember class names. Numeric values automatically
 * pick up `tabular-nums` from `.stat-value`.
 */
export const Stat = ({ label, value, currency, delta, icon, className }: StatProps) => (
  <div className={`stat ${className ?? ""}`.trim()}>
    <div className="stat-label">
      {icon}
      <span>{label}</span>
    </div>
    <div className="flex items-baseline">
      <span className="stat-value">{value}</span>
      {currency ? <span className="stat-currency">{currency}</span> : null}
    </div>
    {delta ? (
      <span className={`stat-delta${delta.direction === "down" ? " down" : ""}`}>
        {delta.value}
      </span>
    ) : null}
  </div>
);
