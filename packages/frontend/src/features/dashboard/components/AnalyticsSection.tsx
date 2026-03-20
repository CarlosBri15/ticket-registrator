import { useTranslation } from "react-i18next";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Legend,
} from "recharts";
import { BarChart2 } from "lucide-react";
import { getMonthlyExpenses, getExpensesByType } from "../../../utils/reportAnalytics";
import type { IReport } from "@ticket-registrator/shared";

export const CHART_COLORS = ["#6366F1", "#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE", "#EDE9FE"];

export const LegendFormatter = (value: string) => (
  <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280" }}>
    {value.length > 18 ? value.substring(0, 16) + "…" : value}
  </span>
);

export const AnalyticsSection = ({ reports }: { reports: IReport[] }) => {
  const { t } = useTranslation();
  const monthly = getMonthlyExpenses(reports, 6);
  const byType = getExpensesByType(reports).map((item, i) => ({
    ...item,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));
  const hasMonthly = monthly.length > 0;
  const hasType = byType.length > 0;
  if (!hasMonthly && !hasType) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-black text-dark flex items-center gap-3 tracking-tight">
        <div className="w-7 h-7 bg-brand/10 rounded-xl flex items-center justify-center">
          <BarChart2 className="w-4 h-4 text-brand" />
        </div>
        {t("analytics.title")}
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {t("analytics.monthlyExpenses")}
          </p>
          {hasMonthly ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthly} barSize={28} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: "#D1D5DB" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "1rem", border: "1px solid #F3F4F6", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", fontSize: 12, fontWeight: 700 }}
                  formatter={(value: any) => [`${Number(value).toFixed(2)}`, t("analytics.totalAmount")]}
                  cursor={{ fill: "#F9FAFB" }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center">
              <p className="text-sm text-gray-400 font-medium text-center max-w-[180px] leading-relaxed">{t("analytics.noData")}</p>
            </div>
          )}
        </div>
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {t("analytics.expensesByType")}
          </p>
          {hasType ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={byType} dataKey="amount" nameKey="type" cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} isAnimationActive={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "1rem", border: "1px solid #F3F4F6", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", fontSize: 12, fontWeight: 700 }}
                  formatter={(value: any) => [`${Number(value).toFixed(2)}`, t("analytics.totalAmount")]}
                />
                <Legend iconType="circle" iconSize={8} formatter={LegendFormatter} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center">
              <p className="text-sm text-gray-400 font-medium text-center max-w-[180px] leading-relaxed">{t("analytics.noData")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
