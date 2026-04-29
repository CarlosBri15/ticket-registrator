import type { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  variant?: "primary" | "default";
  subtitle?: string;
}

export const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendUp,
  variant = "default",
  subtitle,
}: StatCardProps) => {
  const isPrimary = variant === "primary";

  return (
    <div
      className={`flex flex-col gap-3 p-5 rounded-lg border ${
        isPrimary
          ? "bg-dark border-dark text-white"
          : "bg-[var(--color-surface-card)] border-[var(--color-border-main)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={`text-[11px] font-sans-semibold uppercase tracking-wide ${
            isPrimary ? "text-white/55" : "text-dark/50"
          }`}
        >
          {title}
        </p>
        <div
          className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
            isPrimary
              ? "bg-white/10 text-white/80"
              : "bg-[var(--color-secondary)] border border-[var(--color-border-main)] text-dark/45"
          }`}
        >
          {icon}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3
          className={`text-[26px] font-sans-bold leading-none tracking-tight ${
            isPrimary ? "text-white" : "text-dark"
          }`}
        >
          {value}
        </h3>
        {subtitle && (
          <p
            className={`text-[12px] font-sans-medium ${
              isPrimary ? "text-white/55" : "text-dark/45"
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>

      {trend && (
        <div
          className={`inline-flex items-center gap-1 text-[11px] font-sans-semibold w-fit ${
            trendUp
              ? isPrimary
                ? "text-green-300"
                : "text-success"
              : isPrimary
              ? "text-red-300"
              : "text-danger"
          }`}
        >
          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </div>
      )}
    </div>
  );
};
