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
import { tokens } from '../../styles/theme';
import type { DateRange } from '@ticket-registrator/shared';



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
    const dateValue = mode === 'single' 
      ? (value instanceof Date ? value : (value ? new Date(value as any) : new Date()))
      : ((value as DateRange)?.start ? new Date((value as DateRange).start!) : new Date());
    return isNaN(dateValue.getTime()) ? new Date() : dateValue;
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
          className={`${tokens.buttonGhost} p-2 rounded-xl !shadow-none hover:bg-zinc-100`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-space-bold text-dark uppercase tracking-widest">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </span>
        <button
          onClick={nextMonth}
          className={`${tokens.buttonGhost} p-2 rounded-xl !shadow-none hover:bg-zinc-100`}
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
        {days.map((day, i) => (
          <div key={i} className="text-center text-[10px] font-space-bold text-dark/40 uppercase tracking-widest">
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
      const dateValue = mode === 'single'
        ? (value instanceof Date ? value : (value ? new Date(value as any) : null))
        : null;

      const isSelected = mode === 'single'
        ? dateValue && isSameDay(day, dateValue)
        : (value as DateRange)?.start && (
            isSameDay(day, (value as DateRange).start!) || 
            ((value as DateRange).end && isSameDay(day, (value as DateRange).end!))
          );

      const isInRange = mode === 'range' && 
        (value as DateRange)?.start && 
        (value as DateRange)?.end && 
        isWithinInterval(day, { 
          start: (value as DateRange).start!, 
          end: (value as DateRange).end! 
        });

      const isCurrentMonth = isSameMonth(day, monthStart);
      const isTodayDate = isToday(day);

      days.push(
        <button
          key={day.toString()}
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
          {isInRange && (
            <div className={`
              absolute inset-0 bg-brand/10 -z-0
              ${isSameDay(day, (value as DateRange).start!) ? 'rounded-l-lg' : ''}
              ${isSameDay(day, (value as DateRange).end!) ? 'rounded-r-lg' : ''}
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
