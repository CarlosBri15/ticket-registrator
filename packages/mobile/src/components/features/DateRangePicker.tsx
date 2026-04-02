/**
 * DateRangePicker — trigger + DatePickerModal for range selection.
 */
import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconCalendar, IconArrowRight } from '@tabler/icons-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  PixelCard,
  DARK,
  CARD_BG,
} from '../ui/PixelCard';
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
      <PixelCard
        bg={error ? '#fff8f8' : CARD_BG}
        shadowOffset={3}
        active={open}
        onPress={() => setOpen(true)}
      >
        <View style={styles.triggerContent}>
          {/* Inicio */}
          <View style={styles.dateSlot}>
            <View style={styles.slotValueRow}>
              <IconCalendar size={14} color={startDate ? DARK : `${DARK}30`} />
              <Text style={[styles.slotValue, !startDate && styles.slotPlaceholder]}>
                {fmt(startDate) ?? PLACEHOLDER}
              </Text>
            </View>
          </View>

          <IconArrowRight size={14} color={`${DARK}40`} />

          {/* Fin */}
          <View style={styles.dateSlot}>
            <View style={styles.slotValueRow}>
              <IconCalendar size={14} color={endDate ? DARK : `${DARK}30`} />
              <Text style={[styles.slotValue, !endDate && styles.slotPlaceholder]}>
                {fmt(endDate) ?? PLACEHOLDER}
              </Text>
            </View>
          </View>
        </View>
      </PixelCard>

      {!!error && <Text style={styles.errorText}>{error}</Text>}

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
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 13,
    color: DARK,
  },
  slotPlaceholder: {
    fontFamily: 'SpaceGrotesk-Medium',
    color: `${DARK}30`,
  },
  errorText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    color: '#ef4444',
    marginTop: 10,
    marginLeft: 6,
    textTransform: 'uppercase',
  },
});
