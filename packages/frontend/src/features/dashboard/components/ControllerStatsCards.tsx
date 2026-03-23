import React from "react";

interface WeeklyStatsCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  colorClass: "green" | "red";
  subtitle: string;
}

export const WeeklyStatsCard = ({ title, count, icon, colorClass, subtitle }: WeeklyStatsCardProps) => {
  const getColors = () => {
    if (colorClass === "green") return "bg-green-50 text-green-500";
    if (count > 0) return "bg-red-100 text-red-600";
    return "bg-gray-50 text-gray-300";
  };

  const getContainerClass = () => {
    if (colorClass === "red" && count > 0) return "bg-red-50 border-red-200";
    return "bg-white border-gray-100";
  };

  return (
    <div className={`relative overflow-hidden rounded-[2rem] p-6 flex flex-col gap-4 border shadow-sm transition-all duration-300 ${getContainerClass()}`}>
      <div className="relative z-10 flex items-start justify-between">
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${colorClass === "red" && count > 0 ? "text-red-600" : "text-gray-400"}`}>
          {title}
        </p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${getColors()}`}>
          {icon}
        </div>
      </div>
      <h3 className={`relative z-10 text-3xl font-black tracking-tighter ${colorClass === "red" && count > 0 ? "text-red-700" : "text-dark"}`} data-testid="stat-value">
        {count}
      </h3>
      <p className={`relative z-10 text-xs font-bold ${colorClass === "red" && count > 0 ? "text-red-600/70" : "text-gray-400"}`}>
        {subtitle}
      </p>
    </div>
  );
};

export const PendingAmountCard = ({ amount }: { amount: number }) => (
  <div className="relative overflow-hidden rounded-[2rem] p-6 flex flex-col gap-4 border shadow-sm bg-white border-gray-100">
    <div className="relative z-10 flex items-start justify-between">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
        Importe pendiente
      </p>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 text-gray-400">
        <span className="font-bold text-xl">€</span>
      </div>
    </div>
    <h3 className="relative z-10 text-3xl font-black tracking-tighter text-dark">
      <span data-testid="stat-value">{amount.toFixed(2)}</span>
      <span className="text-[10px] font-bold text-gray-400 ml-1">€</span>
    </h3>
    <p className="relative z-10 text-xs font-bold text-gray-400">
      Total por revisar
    </p>
  </div>
);
