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
  IconX, 
  IconChevronLeft, 
  IconChevronRight, 
  IconCalendar 
} from '@tabler/icons-react-native';
import {
  PixelCard,
  DARK,
  CARD_BG,
  colors,
} from '../ui/PixelCard';

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
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{displayTitle}</Text>
          <PixelCard bg={colors.danger} shadowOffset={3} radius={8} onPress={onClose}>
            <View style={styles.closeBtnInner}>
              <IconX size={15} color="white" />
            </View>
          </PixelCard>
        </View>

        {/* Range step indicator */}
        {rangeMode && (
          <View style={styles.stepRow}>
            <PixelCard
              bg={pickingEnd ? CARD_BG : colors.brand}
              shadowOffset={3}
              active={!pickingEnd}
              style={styles.stepCard}
            >
              <View style={styles.stepInner}>
                <Text style={[styles.stepText, !pickingEnd && styles.stepTextActive]}>
                  Inicio
                </Text>
              </View>
            </PixelCard>
            <View style={styles.stepLine} />
            <PixelCard
              bg={pickingEnd ? colors.brand : CARD_BG}
              shadowOffset={3}
              active={pickingEnd}
              style={styles.stepCard}
            >
              <View style={styles.stepInner}>
                <Text style={[styles.stepText, pickingEnd && styles.stepTextActive]}>
                  Fin
                </Text>
              </View>
            </PixelCard>
          </View>
        )}

        {/* Month nav */}
        <View style={styles.monthNav}>
          <PixelCard shadowOffset={3} radius={8} onPress={prevMonth}>
            <View style={styles.monthNavBtnInner}>
              <IconChevronLeft size={20} color={DARK} />
            </View>
          </PixelCard>
          <Text style={styles.monthLabel}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </Text>
          <PixelCard shadowOffset={3} radius={8} onPress={nextMonth}>
            <View style={styles.monthNavBtnInner}>
              <IconChevronRight size={20} color={DARK} />
            </View>
          </PixelCard>
        </View>

        {/* Day headers */}
        <View style={styles.weekRow}>
          {DAYS_SHORT.map(d => (
            <Text key={d} style={styles.weekDay}>{d}</Text>
          ))}
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {cells.map(({ date, otherMonth }) => {
            const { isStart, isEnd, inRange, isToday } = getDayStyle(date);
            const isSelected = isStart || isEnd;

            return (
              <View key={date.toISOString()} style={styles.cellWrap}>
                {/* Range strip */}
                {inRange && <View style={styles.rangeStrip} />}
                {/* Caps for range */}
                {isStart && endDate && <View style={styles.rangeCapRight} />}
                {isEnd && startDate && <View style={styles.rangeCapLeft} />}

                <TouchableOpacity
                  onPress={() => !otherMonth && handleDayPress(date)}
                  activeOpacity={otherMonth ? 1 : 0.75}
                  style={[
                    styles.cell,
                    isSelected && styles.cellSelected,
                    isToday && !isSelected && styles.cellToday,
                  ]}
                >
                  <Text style={[
                    styles.cellText,
                    otherMonth && styles.cellTextOther,
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
        <View style={styles.todayWrap}>
          <PixelCard bg={CARD_BG} shadowOffset={3} onPress={() => handleDayPress(today)}>
            <View style={styles.todayInner}>
              <IconCalendar size={14} color={DARK} />
              <Text style={styles.todayText}>Ir a hoy</Text>
            </View>
          </PixelCard>
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
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  handle: {
    width: 48,
    height: 6,
    backgroundColor: DARK,
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 0,
  },

  // Header
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 4,
    borderBottomColor: DARK,
  },
  sheetTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 20,
    color: DARK,
    letterSpacing: 0.3,
  },
  closeBtnInner: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Step indicator (range mode)
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 0,
  },
  stepCard: {
    flex: 1,
  },
  stepInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  stepText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    color: DARK,
    letterSpacing: 0.2,
  },
  stepTextActive: {
    color: 'white',
  },
  stepLine: {
    width: 20,
    height: 4,
    backgroundColor: DARK,
  },

  // Month nav
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  monthNavBtnInner: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 14,
    color: DARK,
    letterSpacing: 0.5,
  },

  // Day headers
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    color: `${DARK}40`,
  },

  // Grid
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
    backgroundColor: `${colors.brand}15`,
  },
  rangeCapRight: {
    position: 'absolute',
    right: 0,
    width: '50%',
    height: 32,
    top: (CELL_SIZE - 32) / 2,
    backgroundColor: `${colors.brand}15`,
  },
  rangeCapLeft: {
    position: 'absolute',
    left: 0,
    width: '50%',
    height: 32,
    top: (CELL_SIZE - 32) / 2,
    backgroundColor: `${colors.brand}15`,
  },
  cell: {
    width: 34,
    height: 34,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  cellSelected: {
    backgroundColor: colors.brand,
    borderWidth: 2,
    borderColor: DARK,
  },
  cellToday: {
    borderWidth: 2,
    borderColor: colors.brand,
  },
  cellText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 14,
    color: DARK,
  },
  cellTextOther: {
    color: `${DARK}15`,
    fontFamily: 'SpaceGrotesk-Medium',
  },
  cellTextSelected: {
    color: 'white',
  },

  // Today shortcut
  todayWrap: {
    alignSelf: 'center',
    marginTop: 12,
  },
  todayInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  todayText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    color: DARK,
    letterSpacing: 0.2,
  },
});
