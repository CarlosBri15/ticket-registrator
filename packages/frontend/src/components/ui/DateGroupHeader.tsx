import { format, isToday, isYesterday } from "date-fns";
import type { Locale } from "date-fns/locale";

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
    <div className="flex items-center gap-3 px-1 mb-2">
      <span className="text-[11px] font-sans-semibold text-dark/45 leading-none shrink-0">
        {label}
      </span>
      <div className="h-px bg-[var(--color-border-main)] flex-1" />
      <span className="text-[10px] font-sans-bold text-dark/35 tabular-nums shrink-0">
        {count}
      </span>
    </div>
  );
};
