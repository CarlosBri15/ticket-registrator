import type { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { StatTone } from "./Stat";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  /**
   * Chromatic v2 tone. Default `neutral` keeps the white card; the saturated
   * tones fill the tile with a categorical hue (used to differentiate KPIs at
   * a glance in 4-up grids).
   */
  tone?: StatTone;
  subtitle?: string;
}

interface ToneStyles {
  card: string;
  label: string;
  iconBox: string;
  value: string;
  subtitle: string;
  trendUp: string;
  trendDown: string;
}

const TONE_STYLES: Record<StatTone, ToneStyles> = {
  neutral: {
    card: "bg-[var(--color-surface-card)] border-[var(--color-border-main)]",
    label: "text-dark/50",
    iconBox: "bg-[var(--color-secondary)] border border-[var(--color-border-main)] text-dark/45",
    value: "text-dark",
    subtitle: "text-dark/45",
    trendUp: "text-success",
    trendDown: "text-danger",
  },
  brand: {
    card: "bg-dark border-dark text-white",
    label: "text-white/55",
    iconBox: "bg-white/10 text-white/80",
    value: "text-white",
    subtitle: "text-white/55",
    trendUp: "text-green-300",
    trendDown: "text-red-300",
  },
  accent: {
    card: "bg-accent border-accent text-dark",
    label: "text-dark/60",
    iconBox: "bg-dark/10 text-dark",
    value: "text-dark",
    subtitle: "text-dark/55",
    trendUp: "text-dark",
    trendDown: "text-dark",
  },
  clay: {
    card: "bg-clay border-clay text-white",
    label: "text-white/70",
    iconBox: "bg-white/15 text-white",
    value: "text-white",
    subtitle: "text-white/70",
    trendUp: "text-white",
    trendDown: "text-white/85",
  },
  sage: {
    card: "bg-sage border-sage text-white",
    label: "text-white/70",
    iconBox: "bg-white/15 text-white",
    value: "text-white",
    subtitle: "text-white/70",
    trendUp: "text-white",
    trendDown: "text-white/85",
  },
};

export const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendUp,
  tone = "neutral",
  subtitle,
}: StatCardProps) => {
  const s = TONE_STYLES[tone];

  return (
    <div className={`flex flex-col gap-3 p-5 rounded-[14px] border ${s.card}`}>
      <div className="flex items-start justify-between gap-3">
        <p className={`text-[11px] font-sans-semibold uppercase tracking-wide ${s.label}`}>
          {title}
        </p>
        <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${s.iconBox}`}>
          {icon}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className={`text-[26px] font-sans-bold leading-none tracking-tight ${s.value}`}>
          {value}
        </h3>
        {subtitle && (
          <p className={`text-[12px] font-sans-medium ${s.subtitle}`}>
            {subtitle}
          </p>
        )}
      </div>

      {trend && (
        <div
          className={`inline-flex items-center gap-1 text-[11px] font-sans-semibold w-fit ${
            trendUp ? s.trendUp : s.trendDown
          }`}
        >
          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </div>
      )}
    </div>
  );
};
