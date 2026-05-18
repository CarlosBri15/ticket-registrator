/**
 * DateRangePicker — trigger + DatePickerModal for range selection.
 */
import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, ArrowRight } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card } from '../ui/Card';
import { colors } from '../../constants/theme';
import { DatePickerModal } from './DatePickerModal';

export interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartChange: (date: Date) => void;
  onEndChange: (date: Date | null) => void;
  startLabel?: string;
  endLabel?: string;
  error?: string;
}

const PLACEHOLDER = 'DD / MM / AAAA';

export function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  error,
}: Readonly<DateRangePickerProps>) {
  const [open, setOpen] = useState(false);

  const fmt = (d: Date | null) =>
    d ? format(d, 'dd / MM / yyyy', { locale: es }) : null;

  const handleRangeSelect = (start: Date, end: Date | null) => {
    onStartChange(start);
    onEndChange(end);
  };

  return (
    <View style={styles.container}>
      <Card
        radius={6}
        borderColor={error ? colors.danger : colors.border}
        onPress={() => setOpen(true)}
        accessibilityLabel="select date range"
      >
        <View style={styles.triggerContent}>
          <View style={styles.dateSlot}>
            <View style={styles.slotValueRow}>
              <Calendar size={14} color={startDate ? colors.dark : colors.fgQuaternary} strokeWidth={2} />
              <Text style={[styles.slotValue, !startDate && styles.slotPlaceholder]}>
                {fmt(startDate) ?? PLACEHOLDER}
              </Text>
            </View>
          </View>

          <ArrowRight size={14} color={colors.fgQuaternary} strokeWidth={2} />

          <View style={styles.dateSlot}>
            <View style={styles.slotValueRow}>
              <Calendar size={14} color={endDate ? colors.dark : colors.fgQuaternary} strokeWidth={2} />
              <Text style={[styles.slotValue, !endDate && styles.slotPlaceholder]}>
                {fmt(endDate) ?? PLACEHOLDER}
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <DatePickerModal
        visible={open}
        onClose={() => setOpen(false)}
        rangeMode
        startDate={startDate}
        endDate={endDate}
        onRangeSelect={handleRangeSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  dateSlot: {
    flex: 1,
  },
  slotValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slotValue: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 14,
    color: colors.dark,
  },
  slotPlaceholder: {
    fontFamily: 'Manrope-Medium',
    color: colors.fgQuaternary,
  },
  errorText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 11,
    color: colors.danger,
    marginTop: 6,
    marginLeft: 4,
  },
});
