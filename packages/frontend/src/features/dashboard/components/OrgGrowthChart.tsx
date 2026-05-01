import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";
import { SectionCard } from "../../../components/ui/SectionCard";

interface OrgGrowthChartProps {
  data: { month: string; count: number }[];
}

const TOOLTIP_STYLE = {
  borderRadius: "0.5rem",
  border: "1px solid #E5E4E0",
  boxShadow: "0px 8px 24px rgba(28,25,23,0.08)",
  fontSize: 12,
  fontWeight: 600,
} as const;

/**
 * Vertical bar chart showing the number of organizations created per month
 * for the last N months. Surfaced on the SuperAdmin dashboard.
 */
export const OrgGrowthChart = ({ data }: OrgGrowthChartProps) => {
  const { t } = useTranslation();

  return (
    <SectionCard title={t("dashboard.orgGrowthChart")}>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={24} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fontWeight: 600, fill: "#6B6560" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fontWeight: 500, fill: "#A09A95" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value) => [value as number, t("dashboard.newOrgsTooltip")]}
            cursor={{ fill: "#F5F4F0" }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#1C1917" />
        </BarChart>
      </ResponsiveContainer>
    </SectionCard>
  );
};
