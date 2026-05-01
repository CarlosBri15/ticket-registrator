import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Legend,
} from "recharts";
import { BarChart2 } from "lucide-react";
import { getMonthlyExpenses, getExpensesByType } from "@ticket-registrator/shared";
import type { IReport } from "@ticket-registrator/shared";
import { SectionCard } from "../../../components/ui/SectionCard";

const CHART_COLORS = ["#1C1917", "#6B6560", "#A09A95", "#1A6A40", "#8A5C0A", "#4A47A0"];

const renderLegendLabel = (value: string) => (
  <span className="text-[11px] font-semibold text-stone-600">
    {value.length > 18 ? value.substring(0, 16) + "…" : value}
  </span>
);

const tooltipStyle = {
  borderRadius: "8px",
  border: "1px solid #E5E4E0",
  boxShadow: "0px 8px 24px rgba(28,25,23,0.08)",
  fontSize: 12,
  fontWeight: 600,
};

export const AnalyticsSection = memo(({ reports }: { reports: IReport[] }) => {
  const { t } = useTranslation();
  const monthly = useMemo(() => getMonthlyExpenses(reports, 6), [reports]);
  const byType = useMemo(
    () =>
      getExpensesByType(reports).map((item, i) => ({
        ...item,
        fill: CHART_COLORS[i % CHART_COLORS.length],
      })),
    [reports],
  );
  const hasMonthly = monthly.length > 0;
  const hasType = byType.length > 0;
  if (!hasMonthly && !hasType) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-dark/50" aria-hidden={true} />
        <h2 className="text-[15px] font-sans-bold text-dark tracking-tight">
          {t("analytics.title")}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title={t("analytics.monthlyExpenses")}>
          {hasMonthly ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthly} barSize={24} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fontWeight: 600, fill: "#6B6560" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fontWeight: 500, fill: "#A09A95" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`${Number(value ?? 0).toFixed(2)}`, t("analytics.totalAmount")]}
                  cursor={{ fill: "#F5F4F0" }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]} fill="#1C1917" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center">
              <p className="text-[13px] font-sans-medium text-dark/45 text-center max-w-[180px] leading-relaxed">
                {t("analytics.noData")}
              </p>
            </div>
          )}
        </SectionCard>

        <SectionCard title={t("analytics.expensesByType")}>
          {hasType ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={byType}
                  dataKey="amount"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={68}
                  paddingAngle={3}
                  isAnimationActive={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`${Number(value ?? 0).toFixed(2)}`, t("analytics.totalAmount")]}
                />
                <Legend iconType="circle" iconSize={8} formatter={renderLegendLabel} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center">
              <p className="text-[13px] font-sans-medium text-dark/45 text-center max-w-[180px] leading-relaxed">
                {t("analytics.noData")}
              </p>
            </div>
          )}
        </SectionCard>
      </div>
    </section>
  );
});
