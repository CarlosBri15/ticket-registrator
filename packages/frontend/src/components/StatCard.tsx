import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean; // true = positivo (verde/azul), false = negativo (rojo/óxido)
}

export const StatCard = ({ title, value, icon, trend, trendUp }: StatCardProps) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-dark">{value}</h3>
        {trend && (
          <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${trendUp ? 'text-green-600' : 'text-accent'}`}>
            {trendUp ? '↗' : '↘'} {trend}
          </p>
        )}
      </div>
      <div className="p-3 bg-secondary/10 rounded-xl text-brand">
        {icon}
      </div>
    </div>
  );
};