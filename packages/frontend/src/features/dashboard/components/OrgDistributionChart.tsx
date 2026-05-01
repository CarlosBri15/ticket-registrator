import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";
import { SectionCard } from "../../../components/ui/SectionCard";

interface OrgDistributionChartProps {
  data: { name: string; usuarios: number }[];
}

const TOOLTIP_STYLE = {
  borderRadius: "0.5rem",
  border: "1px solid #E5E4E0",
  boxShadow: "0px 8px 24px rgba(28,25,23,0.08)",
  fontSize: 12,
  fontWeight: 600,
} as const;

/**
 * Horizontal bar chart showing user counts per organization. Surfaced on the
 * SuperAdmin dashboard so the SuperAdmin sees the headcount distribution
 * across tenants.
 */
export const OrgDistributionChart = ({ data }: OrgDistributionChartProps) => {
  const { t } = useTranslation();
  const hasNoData = data.every((d) => d.usuarios === 0);

  return (
    <SectionCard title={t("dashboard.orgDistributionChart")}>
      {hasNoData ? (
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-[13px] font-sans-medium text-dark/45 text-center max-w-[180px]">
            {t("dashboard.orgNoUsersYet")}
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} layout="vertical" barSize={14} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 10, fontWeight: 500, fill: "#A09A95" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fontSize: 11, fontWeight: 600, fill: "#6B6560" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value) => [value as number, t("layout.users")]}
              cursor={{ fill: "#F5F4F0" }}
            />
            <Bar dataKey="usuarios" radius={[0, 4, 4, 0]} fill="#1C1917" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </SectionCard>
  );
};
