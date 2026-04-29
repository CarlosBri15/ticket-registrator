/**
 * ReportsFilterPanel — chrome fijo entre el header y el scroll.
 *
 * Fila 1: búsqueda por nombre
 * Fila 2: pills de fecha inicio · fin · estado
 */
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Modal, FlatList, TouchableWithoutFeedback,
  StyleSheet, Dimensions,
} from 'react-native';
import { 
  IconSearch, 
  IconX, 
  IconCalendar, 
  IconChevronDown, 
  IconCheck 
} from '@tabler/icons-react-native';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { PixelCard, DARK, CARD_BG, BORDER_WIDTH, RADIUS, colors } from '../ui/PixelCard';
import { DatePickerModal } from './DatePickerModal';

const { width: SCREEN_W, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHADOW = 3;
// Ancho del slot: (pantalla - padding 40 - 2 gaps de 6) / 3 pills
const PILL_W = Math.floor((SCREEN_W - 40 - 12) / 3);
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

      {/* ── Fila 1: búsqueda ── */}
      <View style={s.searchRow}>
        <IconSearch size={16} color={DARK} />
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={onSearch}
          placeholder={t('trips.filterSearch')}
          placeholderTextColor={`${DARK}45`}
          returnKeyType="search"
        />
        <TouchableOpacity
          onPress={onClear}
          disabled={!hasFilters}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ opacity: hasFilters ? 1 : 0 }}
        >
          <IconX size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>

      {/* ── Fila 2: pills de filtro ── */}
      <View style={s.pillsRow}>

        {/* Fecha inicio */}
        <PixelCard
          bg={startDate ? colors.brand : CARD_BG}
          shadowOffset={SHADOW}
          radius={6}
          active={!!startDate || picking === 'start'}
          onPress={() => setPicking('start')}
          style={{ width: PILL_W }}
        >
          <View style={s.pillContent}>
            <IconCalendar size={12} color={startDate ? '#fff' : DARK} />
            <Text style={[s.pillText, startDate && s.pillTextActive]} numberOfLines={1}>
              {fmt(startDate) ?? t('trips.startLabel')}
            </Text>
          </View>
        </PixelCard>

        {/* Fecha fin */}
        <PixelCard
          bg={endDate ? colors.brand : CARD_BG}
          shadowOffset={SHADOW}
          radius={6}
          active={!!endDate || picking === 'end'}
          onPress={() => setPicking('end')}
          style={{ width: PILL_W }}
        >
          <View style={s.pillContent}>
            <IconCalendar size={12} color={endDate ? '#fff' : DARK} />
            <Text style={[s.pillText, endDate && s.pillTextActive]} numberOfLines={1}>
              {fmt(endDate) ?? t('trips.endLabel')}
            </Text>
          </View>
        </PixelCard>

        {/* Estado */}
        <PixelCard
          bg={statusActive ? colors.brand : CARD_BG}
          shadowOffset={SHADOW}
          radius={6}
          active={statusActive || statusOpen}
          onPress={() => setStatusOpen(true)}
          style={{ width: PILL_W }}
        >
          <View style={s.pillContent}>
            <Text style={[s.pillText, statusActive && s.pillTextActive]} numberOfLines={1}>
              {statusLabel}
            </Text>
            <IconChevronDown size={12} color={statusActive ? '#fff' : DARK} />
          </View>
        </PixelCard>

      </View>

      {/* Cierre zona chrome */}
      <View style={s.bottomBorder} />

      {/* ── Date picker ── */}
      <DatePickerModal
        visible={picking !== null}
        onClose={() => setPicking(null)}
        value={picking === 'start' ? (startDate ?? undefined) : (endDate ?? undefined)}
        onSelect={handleDateSelect}
        title={picking === 'start' ? t('trips.startLabel') : t('trips.endLabel')}
      />

      {/* ── Status bottom sheet ── */}
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
            <PixelCard bg={colors.danger} shadowOffset={3} radius={8} onPress={() => setStatusOpen(false)}>
              <View style={s.sheetCloseBtnInner}>
                <IconX size={15} color="white" />
              </View>
            </PixelCard>
          </View>
          <FlatList
            data={STATUS_OPTIONS}
            keyExtractor={item => item}
            contentContainerStyle={s.listContent}
            renderItem={({ item, index }) => {
              const active = statusFilter === item;
              const label = item === 'ALL' ? t('trips.filterAll') : t(`status.${item}`);
              return (
                <TouchableOpacity
                  onPress={() => { onStatus(item); setStatusOpen(false); }}
                  activeOpacity={0.75}
                  style={[
                    s.option,
                    index < STATUS_OPTIONS.length - 1 && s.optionBorder,
                  ]}
                >
                  <Text style={[s.optionText, active && s.optionTextSelected]}>{label}</Text>
                  {active && (
                    <View style={s.checkBox}>
                      <IconCheck size={13} color="white" />
                    </View>
                  )}
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
    backgroundColor: CARD_BG,
  },

  // ── Fila 1: búsqueda
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 14,
    color: DARK,
  },

  // ── Fila 2: pills
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 6,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  pillText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    color: DARK,
    letterSpacing: 0.2,
  },
  pillTextActive: {
    color: '#fff',
  },

  bottomBorder: {
    height: 4,
    backgroundColor: DARK,
  },

  // ── Bottom sheet
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    maxHeight: SCREEN_HEIGHT * 0.5,
    paddingBottom: 32,
  },
  sheetHandle: {
    width: 48,
    height: 6,
    backgroundColor: DARK,
    alignSelf: 'center',
    marginTop: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 4,
    borderBottomColor: DARK,
  },
  sheetTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 20,
    color: DARK,
    letterSpacing: 0.3,
  },
  sheetCloseBtnInner: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  optionBorder: {
    borderBottomWidth: BORDER_WIDTH,
    borderBottomColor: `${DARK}10`,
  },
  optionText: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 15,
    color: DARK,
  },
  optionTextSelected: {
    fontFamily: 'SpaceGrotesk-Bold',
    color: colors.brand,
  },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: RADIUS - 4,
    backgroundColor: colors.brand,
    borderWidth: BORDER_WIDTH,
    borderColor: DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
