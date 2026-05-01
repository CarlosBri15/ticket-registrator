import { memo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

// ─── Constants ───────────────────────────────────────────────────────────────
// Warm-stone palette mirroring the kit (`--color-stone-*` in index.css).
// Recharts needs runtime hex literals, so the values are duplicated here
// rather than read from CSS vars.

const CHART_COLORS = [
  "#1C1917", // stone-900 (Grafito — brand)
  "#3D3935", // stone-800
  "#57534E", // stone-700
  "#78716C", // stone-600
  "#A8A29E", // stone-500
  "#D6D3CD", // stone-400
];

const TOOLTIP_BG = "#1C1917";       // stone-900
const AXIS_TICK_FILL = "#A8A29E";   // stone-500

const COMMON_TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: TOOLTIP_BG,
  border: "none",
  borderRadius: "8px",
  color: "#FFFFFF",
  fontSize: "12px",
  padding: "8px 12px",
  boxShadow: "0 4px 12px rgba(28, 25, 23, 0.15)",
};

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
  prefix?: string;
  suffix?: string;
}

const CustomTooltip = ({ active, payload, label, prefix = "", suffix = "" }: TooltipProps) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0];
    return (
      <div style={COMMON_TOOLTIP_STYLE} className="font-sans-medium">
        {label && <p className="text-[10px] text-white/50 mb-1">{label}</p>}
        <p className="flex items-center gap-2">
          <span className="text-white">{data.name}:</span>
          <span className="text-white font-sans-bold">
            {prefix}
            {Number(data.value).toLocaleString()}
            {suffix}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

// ─── Donut Chart ──────────────────────────────────────────────────────────────

interface DonutChartProps {
  data: { name: string; value: number }[];
  centerLabel?: string;
  centerValue?: string;
  height?: number;
}

export const DonutChart = memo(({ data, centerLabel, centerValue, height = 240 }: DonutChartProps) => {
  const coloredData = data.map((entry, index) => ({
    ...entry,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  return (
    <div className="relative w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={coloredData}
            innerRadius="70%"
            outerRadius="95%"
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          />
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label */}
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && (
            <span className="text-[20px] font-sans-bold text-dark leading-none tracking-tight">
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="text-[10px] font-sans-medium text-dark/40 uppercase tracking-wider mt-1">
              {centerLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

// ─── Area Trend Chart ─────────────────────────────────────────────────────────

interface AreaTrendChartProps {
  data: { date: string; value: number }[];
  height?: number;
  currency?: string;
}

export const AreaTrendChart = memo(({ data, height = 200, currency = "" }: AreaTrendChartProps) => (
  <div className="w-full" style={{ height }}>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={TOOLTIP_BG} stopOpacity={0.1} />
            <stop offset="95%" stopColor={TOOLTIP_BG} stopOpacity={0} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: AXIS_TICK_FILL }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: AXIS_TICK_FILL }}
        />

        <Tooltip content={<CustomTooltip suffix={` ${currency}`} />} />

        <Area
          type="monotone"
          dataKey="value"
          stroke={TOOLTIP_BG}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#gradientArea)"
          animationDuration={1000}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
));
