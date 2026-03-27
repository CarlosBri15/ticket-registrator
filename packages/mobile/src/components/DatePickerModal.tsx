/**
 * DatePickerModal — bottom-sheet calendar used by DatePicker & DateRangePicker.
 * Handles single date or range (start/end) selection internally.
 */
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../styles/theme';

// ── Helpers ───────────────────────────────────────────────────────────────────

const DAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isBetween(day: Date, start: Date, end: Date) {
  const d = startOfDay(day).getTime();
  return d > startOfDay(start).getTime() && d < startOfDay(end).getTime();
}

/** Returns an array of { date, otherMonth } for every cell in a 6×7 grid */
function buildGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  // Monday-based: Sunday = 6, Monday = 0
  const startOffset = (firstDay.getDay() + 6) % 7;
  const cells: { date: Date; otherMonth: boolean }[] = [];

  const start = new Date(year, month, 1 - startOffset);
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({ date: d, otherMonth: d.getMonth() !== month });
  }
  return cells;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  /** Single date mode */
  value?: Date | null;
  onSelect?: (date: Date) => void;
  /** Range mode */
  rangeMode?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  onRangeSelect?: (start: Date, end: Date | null) => void;
  title?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DatePickerModal({
  visible,
  onClose,
  value,
  onSelect,
  rangeMode = false,
  startDate,
  endDate,
  onRangeSelect,
  title,
}: DatePickerModalProps) {
  const today = startOfDay(new Date());

  const [viewYear, setViewYear] = useState(() => {
    const base = rangeMode ? startDate : value;
    return base ? base.getFullYear() : today.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const base = rangeMode ? startDate : value;
    return base ? base.getMonth() : today.getMonth();
  });

  // In range mode, track if next tap is start or end
  const [pickingEnd, setPickingEnd] = useState(false);

  const cells = buildGrid(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleDayPress = (date: Date) => {
    if (!rangeMode) {
      onSelect?.(date);
      onClose();
      return;
    }
    // Range mode
    if (!pickingEnd || !startDate) {
      onRangeSelect?.(date, null);
      setPickingEnd(true);
    } else {
      if (date < startDate) {
        onRangeSelect?.(date, startDate);
      } else {
        onRangeSelect?.(startDate, date);
      }
      setPickingEnd(false);
      onClose();
    }
  };

  const getDayStyle = (date: Date) => {
    const isStart = rangeMode ? (startDate && isSameDay(date, startDate)) : (value && isSameDay(date, value));
    const isEnd = rangeMode && endDate && isSameDay(date, endDate);
    const inRange = rangeMode && startDate && endDate && isBetween(date, startDate, endDate);
    const isToday = isSameDay(date, today);
    return { isStart, isEnd, inRange, isToday };
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>
            {title ?? (rangeMode
              ? (pickingEnd ? 'Fecha fin' : 'Fecha inicio')
              : 'Seleccionar fecha')}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={16} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Range step indicator */}
        {rangeMode && (
          <View style={styles.stepRow}>
            <View style={[styles.step, !pickingEnd && styles.stepActive]}>
              <Text style={[styles.stepText, !pickingEnd && styles.stepTextActive]}>
                Inicio
              </Text>
            </View>
            <View style={styles.stepLine} />
            <View style={[styles.step, pickingEnd && styles.stepActive]}>
              <Text style={[styles.stepText, pickingEnd && styles.stepTextActive]}>
                Fin
              </Text>
            </View>
          </View>
        )}

        {/* Month nav */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.monthNavBtn}>
            <Feather name="chevron-left" size={20} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.monthNavBtn}>
            <Feather name="chevron-right" size={20} color="#1e293b" />
          </TouchableOpacity>
        </View>

        {/* Day headers */}
        <View style={styles.weekRow}>
          {DAYS_SHORT.map(d => (
            <Text key={d} style={styles.weekDay}>{d}</Text>
          ))}
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {cells.map(({ date, otherMonth }, i) => {
            const { isStart, isEnd, inRange, isToday } = getDayStyle(date);
            const isSelected = isStart || isEnd;

            return (
              <View key={i} style={styles.cellWrap}>
                {/* Range strip */}
                {inRange && <View style={styles.rangeStrip} />}
                {/* Start cap */}
                {isStart && endDate && <View style={styles.rangeCapRight} />}
                {/* End cap */}
                {isEnd && startDate && <View style={styles.rangeCapLeft} />}

                <TouchableOpacity
                  onPress={() => !otherMonth && handleDayPress(date)}
                  activeOpacity={otherMonth ? 1 : 0.75}
                  style={[styles.cell, isSelected && styles.cellSelected]}
                >
                  <Text style={[
                    styles.cellText,
                    otherMonth && styles.cellTextOther,
                    isToday && !isSelected && styles.cellTextToday,
                    isSelected && styles.cellTextSelected,
                  ]}>
                    {date.getDate()}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Today shortcut */}
        <TouchableOpacity
          style={styles.todayBtn}
          onPress={() => handleDayPress(today)}
          activeOpacity={0.8}
        >
          <Text style={styles.todayText}>Hoy</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const CELL_SIZE = 40;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },

  // Header
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Step indicator (range mode)
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  step: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: '#f1f5f9',
  },
  stepActive: {
    backgroundColor: colors.brand,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  stepTextActive: {
    color: '#ffffff',
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
    maxWidth: 40,
  },

  // Month nav
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.2,
  },

  // Day headers
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  cellWrap: {
    width: `${100 / 7}%`,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  rangeStrip: {
    position: 'absolute',
    top: (CELL_SIZE - 28) / 2,
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: 'rgba(91,143,203,0.1)',
  },
  rangeCapRight: {
    position: 'absolute',
    top: (CELL_SIZE - 28) / 2,
    right: 0,
    width: '50%',
    height: 28,
    backgroundColor: 'rgba(91,143,203,0.1)',
  },
  rangeCapLeft: {
    position: 'absolute',
    top: (CELL_SIZE - 28) / 2,
    left: 0,
    width: '50%',
    height: 28,
    backgroundColor: 'rgba(91,143,203,0.1)',
  },
  cell: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    backgroundColor: colors.brand,
  },
  cellText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  cellTextOther: {
    color: '#cbd5e1',
  },
  cellTextToday: {
    color: colors.brand,
    fontWeight: '800',
  },
  cellTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },

  // Today shortcut
  todayBtn: {
    alignSelf: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  todayText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand,
  },
});
