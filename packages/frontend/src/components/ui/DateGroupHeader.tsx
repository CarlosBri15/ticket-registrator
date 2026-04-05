import { format, isToday, isYesterday } from "date-fns";
import type { Locale } from "date-fns/locale";
import { DARK, SHADOW } from "../../features/reports/constants";

interface DateGroupHeaderProps {
  date: Date;
  count: number;
  dateLocale: Locale;
  today: string;
  yesterday: string;
}

export const DateGroupHeader = ({
  date,
  count,
  dateLocale,
  today,
  yesterday,
}: DateGroupHeaderProps) => {
  let label: string;
  if (isToday(date)) {
    label = today;
  } else if (isYesterday(date)) {
    label = yesterday;
  } else {
    const raw = format(date, "EEEE, d 'de' MMMM", { locale: dateLocale });
    label = raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  return (
    <div className="flex items-center gap-3 px-0.5 mb-2.5">
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 font-space-bold text-[11px] shrink-0"
        style={{
          borderColor: `${DARK}20`,
          color: DARK,
          background: "#fff",
          boxShadow: `2px 2px 0px ${SHADOW}`,
        }}
      >
        {label}
      </div>

      <div className="h-[1.5px] bg-dark/10 flex-1 rounded-full" />

      <span
        className="font-space-bold text-[9px] shrink-0"
        style={{
          background: "#fff",
          border: `2px solid ${SHADOW}`,
          borderRadius: 8,
          padding: "2px 8px",
          color: `${DARK}60`,
          boxShadow: `1.5px 1.5px 0px ${SHADOW}`,
        }}
      >
        {count}
      </span>
    </div>
  );
};
