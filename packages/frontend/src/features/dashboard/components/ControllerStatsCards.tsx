import React from "react";
import { radius } from "../../../styles/theme";

interface WeeklyStatsCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  colorClass: "green" | "red";
  subtitle: string;
}

export const WeeklyStatsCard = ({ title, count, icon, colorClass, subtitle }: WeeklyStatsCardProps) => {
  const isAlert = colorClass === "red" && count > 0;
  const isSuccess = colorClass === "green";

  const iconBg = isAlert ? "bg-red-100 text-red-500" : isSuccess ? "bg-success/10 text-success" : "bg-slate-100 text-slate-400";
  const valueCls = isAlert ? "text-red-600" : "text-dark";
  const subtitleCls = isAlert ? "text-red-500/70" : "text-slate-400";
  const labelCls = isAlert ? "text-red-500" : "text-slate-400";
  const containerCls = isAlert
    ? `bg-red-50 border-red-200`
    : `bg-white border-slate-200`;

  return (
    <div className={`${radius.card} p-5 flex flex-col gap-3 border shadow-sm ${containerCls}`}>
      <div className="flex items-start justify-between">
        <p className={`text-[10px] font-semibold uppercase tracking-widest ${labelCls}`}>{title}</p>
        <div className={`w-8 h-8 ${radius.sm} flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <h3 className={`text-3xl font-bold tracking-tight leading-none ${valueCls}`} data-testid="stat-value">
        {count}
      </h3>
      <p className={`text-xs font-medium ${subtitleCls}`}>{subtitle}</p>
    </div>
  );
};

export const PendingAmountCard = ({ amount }: { amount: number }) => (
  <div className={`${radius.card} p-5 flex flex-col gap-3 border border-slate-200 bg-white shadow-sm`}>
    <div className="flex items-start justify-between">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        Importe pendiente
      </p>
      <div className={`w-8 h-8 ${radius.sm} flex items-center justify-center bg-brand/8 text-brand font-bold text-base`}>
        €
      </div>
    </div>
    <h3 className="text-3xl font-bold tracking-tight leading-none text-dark">
      <span data-testid="stat-value">{amount.toFixed(0)}</span>
      <span className="text-sm font-medium text-slate-400 ml-1">EUR</span>
    </h3>
    <p className="text-xs font-medium text-slate-400">Total por revisar</p>
  </div>
);
