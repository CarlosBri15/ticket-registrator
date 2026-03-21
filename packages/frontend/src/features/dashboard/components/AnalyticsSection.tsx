import { useTranslation } from "react-i18next";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Legend,
} from "recharts";
import { BarChart2 } from "lucide-react";
import { getMonthlyExpenses, getExpensesByType } from "../../../utils/reportAnalytics";
import type { IReport } from "@ticket-registrator/shared";
import { tokens, radius } from "../../../styles/design-tokens";

export const CHART_COLORS = ["#336b87", "#90afc5", "#4a8cae", "#059669", "#d97706", "#0284c7"];

export const LegendFormatter = (value: string) => (
  <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>
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

  const tooltipStyle = {
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    fontSize: 12,
    fontWeight: 600,
  };

  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-dark flex items-center gap-2.5">
        <div className={`w-6 h-6 bg-brand/10 ${radius.base} flex items-center justify-center`}>
          <BarChart2 className="w-3.5 h-3.5 text-brand" />
        </div>
        {t("analytics.title")}
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className={`${tokens.card} space-y-4`}>
          <p className={tokens.statCardLabel}>{t("analytics.monthlyExpenses")}</p>
          {hasMonthly ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthly} barSize={24} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: "#cbd5e1" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: any) => [`${Number(value).toFixed(2)}`, t("analytics.totalAmount")]}
                  cursor={{ fill: "#f8fafc" }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]} fill="#336b87" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center">
              <p className="text-sm text-slate-400 font-medium text-center max-w-[180px] leading-relaxed">{t("analytics.noData")}</p>
            </div>
          )}
        </div>
        <div className={`${tokens.card} space-y-4`}>
          <p className={tokens.statCardLabel}>{t("analytics.expensesByType")}</p>
          {hasType ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={byType} dataKey="amount" nameKey="type" cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={3} isAnimationActive={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: any) => [`${Number(value).toFixed(2)}`, t("analytics.totalAmount")]}
                />
                <Legend iconType="circle" iconSize={8} formatter={LegendFormatter} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center">
              <p className="text-sm text-slate-400 font-medium text-center max-w-[180px] leading-relaxed">{t("analytics.noData")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
