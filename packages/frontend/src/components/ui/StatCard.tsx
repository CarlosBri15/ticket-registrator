import type { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { tokens, radius, shadow } from "../../styles/design-tokens";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  variant?: "primary" | "default";
  subtitle?: string;
}

export const StatCard = ({ title, value, icon, trend, trendUp, variant = "default", subtitle }: StatCardProps) => {
  if (variant === "primary") {
    return (
      <div className={`relative bg-brand ${radius.card} p-5 overflow-hidden ${shadow.md} border border-brand-light/20`}>
        {/* Subtle bg accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 flex flex-col h-full gap-3">
          <div className="flex items-start justify-between">
            <p className={tokens.statCardLabel + " !text-brand-light/70"}>{title}</p>
            <div className={`w-8 h-8 bg-white/10 ${radius.base} flex items-center justify-center text-white/80 border border-white/10`}>
              {icon}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight leading-none">{value}</h3>
            {subtitle && <p className="text-xs text-brand-light/60 font-medium mt-1">{subtitle}</p>}
          </div>
          {trend && (
            <div className="flex items-center gap-1.5 mt-auto">
              <div className={`flex items-center gap-1 px-2 py-0.5 ${radius.sm} text-[10px] font-semibold ${trendUp ? "bg-white/10 text-green-300" : "bg-white/10 text-red-300"}`}>
                {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trend}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // default variant
  return (
    <div className={tokens.statCard}>
      <div className="flex items-start justify-between">
        <p className={tokens.statCardLabel}>{title}</p>
        <div className={`w-8 h-8 bg-brand/5 ${radius.base} flex items-center justify-center text-brand`}>
          {icon}
        </div>
      </div>
      <div>
        <h3 className={tokens.statCardValue}>{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 font-medium mt-1">{subtitle}</p>}
      </div>
      {trend && (
        <p className={`text-xs font-semibold flex items-center gap-1 ${trendUp ? "text-success" : "text-danger"}`}>
          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </p>
      )}
    </div>
  );
};
