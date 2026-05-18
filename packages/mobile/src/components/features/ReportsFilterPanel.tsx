/**
 * ReportsFilterPanel — chrome bar (search + chip filters) above the reports list.
 * Kit-aligned: pill chips, sunken search, sentence case, no hard shadows.
 */
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Modal, FlatList, TouchableWithoutFeedback,
  StyleSheet, Dimensions,
} from 'react-native';
import {
  Search,
  X,
  Calendar,
  ChevronDown,
  Check,
} from 'lucide-react-native';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { colors } from '../../constants/theme';
import { DatePickerModal } from './DatePickerModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const STATUS_OPTIONS = ['ALL', 'CREATED', 'SUBMITTED', 'APPROVED', 'DECLINED'] as const;
type Picking = 'start' | 'end' | null;

interface Props {
  search: string;
  onSearch: (v: string) => void;
  startDate: Date | null;
  endDate: Date | null;
  onStartDate: (d: Date | null) => void;
  onEndDate: (d: Date | null) => void;
  statusFilter: string;
  onStatus: (s: string) => void;
  hasFilters: boolean;
  onClear: () => void;
}

interface ChipProps {
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
}

const Chip = ({ active, onPress, children }: ChipProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={[s.chip, active && s.chipActive]}
  >
    <View style={s.chipInner}>{children}</View>
  </TouchableOpacity>
);

export function ReportsFilterPanel({
  search, onSearch,
  startDate, endDate, onStartDate, onEndDate,
  statusFilter, onStatus,
  hasFilters, onClear,
}: Readonly<Props>) {
  const { t } = useTranslation();
  const [picking, setPicking] = useState<Picking>(null);
  const [statusOpen, setStatusOpen] = useState(false);

  const fmt = (d: Date | null) => d ? format(d, 'dd MMM') : null;

  const handleDateSelect = (date: Date) => {
    if (picking === 'start') onStartDate(date);
    else if (picking === 'end') onEndDate(date);
    setPicking(null);
  };

  const statusLabel = statusFilter === 'ALL'
    ? t('trips.filterAll')
    : t(`status.${statusFilter}`);

  const statusActive = statusFilter !== 'ALL';

  return (
    <View style={s.wrapper}>
      {/* ── Row 1: search ── */}
      <View style={s.searchRow}>
        <Search size={16} color={colors.fgSecondary} strokeWidth={2} />
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={onSearch}
          placeholder={t('trips.filterSearch')}
          placeholderTextColor={colors.fgQuaternary}
          returnKeyType="search"
        />
        {hasFilters ? (
          <TouchableOpacity
            onPress={onClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="clear filters"
          >
            <X size={18} color={colors.fgSecondary} strokeWidth={2} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* ── Row 2: chip filters ── */}
      <View style={s.chipsRow}>
        <Chip active={!!startDate} onPress={() => setPicking('start')}>
          <Calendar size={12} color={startDate ? colors.fgOnBrand : colors.dark} strokeWidth={2} />
          <Text style={[s.chipText, startDate && s.chipTextActive]} numberOfLines={1}>
            {fmt(startDate) ?? t('trips.startLabel')}
          </Text>
        </Chip>

        <Chip active={!!endDate} onPress={() => setPicking('end')}>
          <Calendar size={12} color={endDate ? colors.fgOnBrand : colors.dark} strokeWidth={2} />
          <Text style={[s.chipText, endDate && s.chipTextActive]} numberOfLines={1}>
            {fmt(endDate) ?? t('trips.endLabel')}
          </Text>
        </Chip>

        <Chip active={statusActive} onPress={() => setStatusOpen(true)}>
          <Text style={[s.chipText, statusActive && s.chipTextActive]} numberOfLines={1}>
            {statusLabel}
          </Text>
          <ChevronDown size={12} color={statusActive ? colors.fgOnBrand : colors.dark} strokeWidth={2} />
        </Chip>
      </View>

      <View style={s.bottomBorder} />

      <DatePickerModal
        visible={picking !== null}
        onClose={() => setPicking(null)}
        value={picking === 'start' ? (startDate ?? undefined) : (endDate ?? undefined)}
        onSelect={handleDateSelect}
        title={picking === 'start' ? t('trips.startLabel') : t('trips.endLabel')}
      />

      <Modal
        visible={statusOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setStatusOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setStatusOpen(false)}>
          <View style={s.overlay} />
        </TouchableWithoutFeedback>

        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          <View style={s.sheetHeader}>
            <Text style={s.sheetTitle}>Estado</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="close"
              onPress={() => setStatusOpen(false)}
              style={s.sheetCloseBtn}
              activeOpacity={0.7}
            >
              <X size={16} color={colors.fgSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={STATUS_OPTIONS}
            keyExtractor={(item) => item}
            contentContainerStyle={s.listContent}
            renderItem={({ item, index }) => {
              const active = statusFilter === item;
              const label = item === 'ALL' ? t('trips.filterAll') : t(`status.${item}`);
              return (
                <TouchableOpacity
                  onPress={() => { onStatus(item); setStatusOpen(false); }}
                  activeOpacity={0.7}
                  style={[
                    s.option,
                    index < STATUS_OPTIONS.length - 1 && s.optionBorder,
                  ]}
                >
                  <Text style={[s.optionText, active && s.optionTextSelected]}>{label}</Text>
                  {active ? <Check size={16} color={colors.brand} strokeWidth={2} /> : null}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: colors.surfaceSunken,
    borderRadius: 6,
    marginHorizontal: 20,
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Manrope-Medium',
    fontSize: 14,
    color: colors.dark,
  },

  chipsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 8,
  },
  chip: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceCard,
  },
  chipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  chipActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  chipText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 12,
    color: colors.fgSecondary,
    flexShrink: 1,
  },
  chipTextActive: {
    color: colors.fgOnBrand,
  },

  bottomBorder: {
    height: 1,
    backgroundColor: colors.border,
  },

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
    maxHeight: SCREEN_HEIGHT * 0.55,
    paddingBottom: 24,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.overlayMedium,
    alignSelf: 'center',
    marginTop: 10,
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
  sheetCloseBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 14,
    color: colors.dark,
  },
  optionTextSelected: {
    fontFamily: 'Manrope-SemiBold',
    color: colors.brand,
  },
});
