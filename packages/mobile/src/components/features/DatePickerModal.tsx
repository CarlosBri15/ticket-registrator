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
  Dimensions,
} from 'react-native';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react-native';
import { colors } from '../../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
}: Readonly<DatePickerModalProps>) {
  const today = startOfDay(new Date());

  const [viewYear, setViewYear] = useState(() => {
    const base = rangeMode ? startDate : value;
    return base ? base.getFullYear() : today.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const base = rangeMode ? startDate : value;
    return base ? base.getMonth() : today.getMonth();
  });

  const [pickingEnd, setPickingEnd] = useState(false);

  const cells = buildGrid(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const handleDayPress = (date: Date) => {
    if (!rangeMode) {
      onSelect?.(date);
      onClose();
      return;
    }
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

  let displayTitle = title;
  if (!displayTitle) {
    if (rangeMode) {
      displayTitle = pickingEnd ? 'Seleccionar fin' : 'Seleccionar inicio';
    } else {
      displayTitle = 'Seleccionar fecha';
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{displayTitle}</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="close"
            onPress={onClose}
            style={styles.closeBtn}
            activeOpacity={0.7}
          >
            <X size={16} color={colors.fgSecondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {rangeMode ? (
          <View style={styles.stepRow}>
            <TouchableOpacity
              style={[styles.stepBtn, !pickingEnd && styles.stepBtnActive]}
              onPress={() => setPickingEnd(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.stepText, !pickingEnd && styles.stepTextActive]}>
                Inicio
              </Text>
            </TouchableOpacity>
            <View style={styles.stepLine} />
            <TouchableOpacity
              style={[styles.stepBtn, pickingEnd && styles.stepBtnActive]}
              onPress={() => setPickingEnd(true)}
              activeOpacity={0.8}
              disabled={!startDate}
            >
              <Text style={[styles.stepText, pickingEnd && styles.stepTextActive]}>
                Fin
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.monthNav}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="previous month"
            onPress={prevMonth}
            style={styles.monthNavBtn}
            activeOpacity={0.7}
          >
            <ChevronLeft size={18} color={colors.dark} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="next month"
            onPress={nextMonth}
            style={styles.monthNavBtn}
            activeOpacity={0.7}
          >
            <ChevronRight size={18} color={colors.dark} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekRow}>
          {DAYS_SHORT.map((d) => (
            <Text key={d} style={styles.weekDay}>{d}</Text>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map(({ date, otherMonth }) => {
            const { isStart, isEnd, inRange, isToday } = getDayStyle(date);
            const isSelected = isStart || isEnd;

            return (
              <View key={date.toISOString()} style={styles.cellWrap}>
                {inRange ? <View style={styles.rangeStrip} /> : null}
                {isStart && endDate ? <View style={styles.rangeCapRight} /> : null}
                {isEnd && startDate ? <View style={styles.rangeCapLeft} /> : null}

                <TouchableOpacity
                  onPress={() => !otherMonth && handleDayPress(date)}
                  activeOpacity={otherMonth ? 1 : 0.7}
                  style={[
                    styles.cell,
                    isSelected && styles.cellSelected,
                    isToday && !isSelected && styles.cellToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      otherMonth && styles.cellTextOther,
                      isSelected && styles.cellTextSelected,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.todayWrap}>
          <TouchableOpacity
            onPress={() => handleDayPress(today)}
            activeOpacity={0.8}
            style={styles.todayBtn}
          >
            <Calendar size={14} color={colors.dark} strokeWidth={2} />
            <Text style={styles.todayText}>Ir a hoy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const CELL_SIZE = 44;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlayStrong,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: SCREEN_HEIGHT * 0.88,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.overlayMedium,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 2,
    borderRadius: 9999,
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
    color: colors.dark,
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  stepBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 9999,
    backgroundColor: colors.surfaceSunken,
  },
  stepBtnActive: {
    backgroundColor: colors.brand,
  },
  stepText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
    color: colors.fgSecondary,
  },
  stepTextActive: {
    color: colors.fgOnBrand,
  },
  stepLine: {
    width: 12,
    height: 1,
    backgroundColor: colors.border,
  },

  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  monthNavBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  monthLabel: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 14,
    color: colors.dark,
    letterSpacing: -0.1,
  },

  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
    color: colors.fgTertiary,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
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
    top: (CELL_SIZE - 32) / 2,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: colors.overlayLight,
  },
  rangeCapRight: {
    position: 'absolute',
    right: 0,
    width: '50%',
    height: 32,
    top: (CELL_SIZE - 32) / 2,
    backgroundColor: colors.overlayLight,
  },
  rangeCapLeft: {
    position: 'absolute',
    left: 0,
    width: '50%',
    height: 32,
    top: (CELL_SIZE - 32) / 2,
    backgroundColor: colors.overlayLight,
  },
  cell: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  cellSelected: {
    backgroundColor: colors.brand,
  },
  cellToday: {
    borderWidth: 1,
    borderColor: colors.brand,
  },
  cellText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
    color: colors.dark,
  },
  cellTextOther: {
    color: colors.overlayMedium,
    fontFamily: 'Manrope-Medium',
  },
  cellTextSelected: {
    color: colors.fgOnBrand,
  },

  todayWrap: {
    alignSelf: 'center',
    marginTop: 12,
  },
  todayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceCard,
  },
  todayText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
    color: colors.dark,
  },
});
