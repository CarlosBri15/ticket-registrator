import { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  isWithinInterval,
  isToday,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
export interface DateRange {
  start: Date | null;
  end: Date | null;
}
interface CalendarProps {
  mode?: 'single' | 'range';
  value?: Date | DateRange | null;
  onChange?: (date: Date | DateRange) => void;
  className?: string;
}

export const Calendar = ({ 
  mode = 'single', 
  value, 
  onChange,
  className 
}: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const isDateRange = (v: unknown): v is DateRange => v !== null && typeof v === 'object' && 'start' in v && 'end' in v;
    let dateValue: Date;
    if (mode === 'single') {
      dateValue = value instanceof Date ? value : new Date();
    } else {
      dateValue = isDateRange(value) && value.start ? new Date(value.start) : new Date();
    }
    return Number.isNaN(dateValue.getTime()) ? new Date() : dateValue;
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const onDateClick = (day: Date) => {
    if (mode === 'single') {
      onChange?.(day);
    } else {
      const range = value as DateRange || { start: null, end: null };
      if (!range.start || (range.start && range.end)) {
        onChange?.({ start: day, end: null });
      } else if (day < range.start) {
        onChange?.({ start: day, end: range.start });
      } else {
        onChange?.({ start: range.start, end: day });
      }
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-2 mb-4">
        <button
          onClick={prevMonth}
          className={`btn btn-ghost p-2 rounded-xl !shadow-none`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-space-bold text-dark uppercase tracking-widest">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </span>
        <button
          onClick={nextMonth}
          className={`btn btn-ghost p-2 rounded-xl !shadow-none`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day) => (
          <div key={day} className="text-center text-[10px] font-space-bold text-dark/40 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const rows: React.ReactNode[] = [];
    let days: React.ReactNode[] = [];

    calendarDays.forEach((day, i) => {
      const dateValue = mode === 'single' && value instanceof Date ? value : null;

      let isSelected: boolean;
      if (mode === 'single') {
        isSelected = dateValue ? isSameDay(day, dateValue) : false;
      } else {
        const rangeValue = value as DateRange;
        isSelected = !!(
          (rangeValue?.start && isSameDay(day, rangeValue.start)) ||
          (rangeValue?.end && isSameDay(day, rangeValue.end))
        );
      }

      let isInRange = false;
      if (mode === 'range') {
        const rangeValue = value as DateRange;
        if (rangeValue?.start && rangeValue?.end) {
          isInRange = isWithinInterval(day, { start: rangeValue.start, end: rangeValue.end });
        }
      }

      const isCurrentMonth = isSameMonth(day, monthStart);
      const isTodayDate = isToday(day);

      const rangeValue = value as DateRange;
      days.push(
        <button
          key={day.toISOString()}
          type="button"
          onClick={() => onDateClick(day)}
          className={`
            relative h-10 w-10 flex items-center justify-center text-xs font-space-bold transition-all duration-100
            ${!isCurrentMonth ? 'text-dark/20' : 'text-dark'}
            hover:bg-brand/10 rounded-lg
            ${isSelected ? 'bg-brand text-white border-2 border-border-main !rounded-lg shadow-hard-sm z-10 scale-105' : ''}
            ${isInRange && !isSelected ? 'bg-brand/10 text-brand' : ''}
            ${isTodayDate && !isSelected ? 'after:content-[""] after:absolute after:bottom-1.5 after:w-1 after:h-1 after:bg-brand after:rounded-full' : ''}
          `}
        >
          <span className="relative z-10">{format(day, 'd')}</span>

          {/* Range selection background connector */}
          {isInRange && rangeValue?.start && rangeValue?.end && (
            <div className={`
              absolute inset-0 bg-brand/10 -z-0
              ${isSameDay(day, rangeValue.start) ? 'rounded-l-lg' : ''}
              ${isSameDay(day, rangeValue.end) ? 'rounded-r-lg' : ''}
            `} />
          )}
        </button>
      );

      if ((i + 1) % 7 === 0) {
        rows.push(
          <div className="grid grid-cols-7" key={day.toString()}>
            {days}
          </div>
        );
        days = [];
      }
    });

    return <div className="flex flex-col gap-1">{rows}</div>;
  };

  return (
    <div className={`p-4 bg-white border-2 border-border-main rounded-2xl shadow-hard ${className ?? ''}`}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};
