import type { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  variant?: "primary" | "default" | "ghost";
  subtitle?: string;
}

export const StatCard = ({ title, value, icon, trend, trendUp, variant = "default", subtitle }: StatCardProps) => {
  if (variant === "primary") {
    return (
      <div className="relative bg-brand rounded-[2rem] p-6 overflow-hidden shadow-xl shadow-brand/25 border border-brand-light/20">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col h-full gap-4">
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-black text-brand-light/80 uppercase tracking-[0.2em]">{title}</p>
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-white/80 border border-white/10">
              {icon}
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white tracking-tighter leading-none">{value}</h3>
            {subtitle && <p className="text-xs text-brand-light/60 font-medium mt-1">{subtitle}</p>}
          </div>
          {trend && (
            <div className="flex items-center gap-1.5 mt-auto">
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${trendUp ? "bg-white/10 text-green-300" : "bg-white/10 text-red-300"}`}>
                {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trend}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "ghost") {
    return (
      <div className="relative bg-dark rounded-[2rem] p-6 overflow-hidden shadow-xl shadow-dark/20">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</p>
            <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 border border-white/5">
              {icon}
            </div>
          </div>
          <h3 className="text-3xl font-black text-white tracking-tighter leading-none">{value}</h3>
          {trend && (
            <p className={`text-xs font-bold flex items-center gap-1 ${trendUp ? "text-green-400" : "text-red-400"}`}>
              {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend}
            </p>
          )}
        </div>
      </div>
    );
  }

  // default variant
  return (
    <div className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-brand/5 hover:border-brand/10 transition-all duration-300 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</p>
        <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center text-brand group-hover:bg-brand/10 transition-colors">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-black text-dark tracking-tighter leading-none">{value}</h3>
        {subtitle && <p className="text-xs text-gray-400 font-medium mt-1">{subtitle}</p>}
      </div>
      {trend && (
        <p className={`text-xs font-bold flex items-center gap-1 ${trendUp ? "text-green-600" : "text-accent"}`}>
          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </p>
      )}
    </div>
  );
};
