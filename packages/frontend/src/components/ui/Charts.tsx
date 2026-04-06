import { memo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

// ─── Constants ───────────────────────────────────────────────────────────────

const CHART_COLORS = [
  '#111111', // Black
  '#444444', // Dark Gray
  '#777777', // Medium Gray
  '#AAAAAA', // Light Gray
  '#CCCCCC', // Very Light Gray
  '#DDDDDD', // Surface Light
];

const COMMON_TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: '#111111',
  border: 'none',
  borderRadius: '8px',
  color: '#FFFFFF',
  fontSize: '12px',
  padding: '8px 12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
};

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

const CustomTooltip = (props: any) => {
  const { active, payload, label, prefix = '', suffix = '' } = props;
  if (active && payload && payload.length > 0) {
    const data = payload[0];
    return (
      <div style={COMMON_TOOLTIP_STYLE} className="font-sans-medium">
        {label && <p className="text-[10px] text-white/50 mb-1">{label}</p>}
        <p className="flex items-center gap-2">
          <span className="text-white">{data.name}:</span>
          <span className="text-white font-sans-bold">
            {prefix}{Number(data.value).toLocaleString()}{suffix}
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
    fill: CHART_COLORS[index % CHART_COLORS.length]
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

export const AreaTrendChart = memo(({ data, height = 200, currency = '' }: AreaTrendChartProps) => {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#111111" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#111111" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#888888' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#888888' }}
          />
          
          <Tooltip content={<CustomTooltip suffix={` ${currency}`} />} />
          
          <Area
            type="monotone"
            dataKey="value"
            stroke="#111111"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#gradientArea)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});
