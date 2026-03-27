/**
 * DateRangePicker — trigger + DatePickerModal para selección de rango start/end.
 * Usado en el formulario de creación de reporte.
 */
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { colors } from '../styles/theme';
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

export function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  startLabel = 'Fecha inicio',
  endLabel = 'Fecha fin',
  error,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const formatDate = (d: Date | null) =>
    d ? format(d, 'dd MMM yyyy', { locale: es }) : null;

  const handleRangeSelect = (start: Date, end: Date | null) => {
    onStartChange(start);
    onEndChange(end);
  };

  const hasRange = startDate && endDate;

  return (
    <View>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
        style={[styles.trigger, error ? styles.triggerError : null]}
      >
        {/* Start */}
        <View style={styles.dateSlot}>
          <Text style={styles.slotLabel}>{startLabel}</Text>
          <View style={styles.slotValueRow}>
            <Feather name="calendar" size={13} color={startDate ? colors.brand : '#94a3b8'} />
            <Text style={[styles.slotValue, !startDate && styles.slotPlaceholder]}>
              {formatDate(startDate) ?? 'DD MMM AAAA'}
            </Text>
          </View>
        </View>

        {/* Separator */}
        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Feather name="arrow-right" size={13} color="#cbd5e1" />
          <View style={styles.separatorLine} />
        </View>

        {/* End */}
        <View style={styles.dateSlot}>
          <Text style={styles.slotLabel}>{endLabel}</Text>
          <View style={styles.slotValueRow}>
            <Feather name="calendar" size={13} color={endDate ? colors.brand : '#94a3b8'} />
            <Text style={[styles.slotValue, !endDate && styles.slotPlaceholder]}>
              {formatDate(endDate) ?? 'DD MMM AAAA'}
            </Text>
          </View>
        </View>

        {/* Edit icon */}
        <View style={[styles.editIcon, hasRange && styles.editIconActive]}>
          <Feather name="edit-2" size={13} color={hasRange ? colors.brand : '#94a3b8'} />
        </View>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

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
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  triggerError: {
    borderColor: '#fca5a5',
    backgroundColor: '#fff8f8',
  },
  dateSlot: {
    flex: 1,
    gap: 4,
  },
  slotLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  slotValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  slotValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  slotPlaceholder: {
    color: '#cbd5e1',
    fontWeight: '400',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  separatorLine: {
    width: 8,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  editIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIconActive: {
    backgroundColor: '#f0f6fd',
    borderColor: '#dbeafe',
  },
  errorText: {
    fontSize: 11,
    color: '#ef4444',
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
});
