import { format, isToday, isYesterday } from "date-fns";
import type { Locale } from "date-fns/locale";
import { Calendar } from "lucide-react";

interface DateGroupHeaderProps {
  date: Date;
  count: number;
  dateLocale: Locale;
  today: string;
  yesterday: string;
}

/**
 * Inline date separator used between row groups inside a single table card.
 * Renders as a full-width banded row (warm cream bg from the kit, calendar
 * glyph, prominent date label, tabular count on the right) so each group is
 * unambiguously separated from the rows around it without breaking the
 * single-table-card layout.
 */
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
    <div className="flex items-center justify-between px-4 py-3.5 bg-secondary border-t border-b border-[var(--color-border-main)]">
      <span className="inline-flex items-center gap-2 leading-none">
        <Calendar className="w-3.5 h-3.5 text-dark/45" aria-hidden="true" />
        <span className="text-[14.5px] font-sans-bold text-dark/85">
          {label}
        </span>
      </span>
      <span className="text-[12.5px] font-sans-semibold text-dark/50 tabular-nums leading-none">
        {count}
      </span>
    </div>
  );
};
