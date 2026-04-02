/**
 * TicketsFilterPanel — chrome fijo entre el header y el scroll de tickets.
 *
 * Fila 1: búsqueda por texto
 * Fila 2: pills → fecha ticket (rango) · fecha subida (rango) · reporte
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
  IconFileDescription, 
  IconUpload, 
  IconFolder, 
  IconChevronDown, 
  IconCheck 
} from '@tabler/icons-react-native';
import { format } from 'date-fns';
import { PixelCard, DARK, CARD_BG, BORDER_WIDTH, RADIUS, colors } from '../ui/PixelCard';
import { DatePickerModal } from './DatePickerModal';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const PILL_W = Math.floor((SCREEN_W - 40 - 12) / 3);
const SHADOW = 3;

type DateRange = { start: Date | null; end: Date | null };
type Picking = 'ticket' | 'upload' | null;

interface ReportOption { id: string; name: string }

interface Props {
  search: string;
  onSearch: (v: string) => void;
  ticketDate: DateRange;
  onTicketDate: (start: Date | null, end: Date | null) => void;
  uploadDate: DateRange;
  onUploadDate: (start: Date | null, end: Date | null) => void;
  reportFilter: string | null;
  onReportFilter: (id: string | null) => void;
  reports: ReportOption[];
  hasFilters: boolean;
  onClear: () => void;
}

const fmtRange = (r: DateRange) => {
  if (r.start && r.end) return `${format(r.start, 'dd/MM')} – ${format(r.end, 'dd/MM')}`;
  if (r.start) return `desde ${format(r.start, 'dd/MM')}`;
  return null;
};

export function TicketsFilterPanel({
  search, onSearch,
  ticketDate, onTicketDate,
  uploadDate, onUploadDate,
  reportFilter, onReportFilter,
  reports,
  hasFilters, onClear,
}: Readonly<Props>) {
  const [picking, setPicking] = useState<Picking>(null);
  const [reportOpen, setReportOpen] = useState(false);

  const activeReport = reports.find(r => r.id === reportFilter);

  const ticketActive  = !!(ticketDate.start || ticketDate.end);
  const uploadActive  = !!(uploadDate.start || uploadDate.end);
  const reportActive  = !!reportFilter;

  return (
    <View style={s.wrapper}>

      {/* ── Fila 1: búsqueda ── */}
      <View style={s.searchRow}>
        <IconSearch size={16} color={DARK} />
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={onSearch}
          placeholder="Buscar tickets..."
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

      {/* ── Fila 2: pills ── */}
      <View style={s.pillsRow}>

        {/* Fecha del ticket */}
        <PixelCard
          bg={ticketActive ? colors.brand : CARD_BG}
          shadowOffset={SHADOW}
          radius={6}
          active={ticketActive || picking === 'ticket'}
          onPress={() => setPicking('ticket')}
          style={{ width: PILL_W }}
        >
          <View style={s.pillContent}>
            <IconFileDescription size={11} color={ticketActive ? '#fff' : DARK} />
            <Text style={[s.pillText, ticketActive && s.pillTextActive]} numberOfLines={1}>
              {fmtRange(ticketDate) ?? 'Ticket'}
            </Text>
          </View>
        </PixelCard>

        {/* Fecha de subida */}
        <PixelCard
          bg={uploadActive ? colors.brand : CARD_BG}
          shadowOffset={SHADOW}
          radius={6}
          active={uploadActive || picking === 'upload'}
          onPress={() => setPicking('upload')}
          style={{ width: PILL_W }}
        >
          <View style={s.pillContent}>
            <IconUpload size={11} color={uploadActive ? '#fff' : DARK} />
            <Text style={[s.pillText, uploadActive && s.pillTextActive]} numberOfLines={1}>
              {fmtRange(uploadDate) ?? 'Subida'}
            </Text>
          </View>
        </PixelCard>

        {/* Reporte */}
        <PixelCard
          bg={reportActive ? colors.brand : CARD_BG}
          shadowOffset={SHADOW}
          radius={6}
          active={reportActive || reportOpen}
          onPress={() => setReportOpen(true)}
          style={{ width: PILL_W }}
        >
          <View style={s.pillContent}>
            <IconFolder size={11} color={reportActive ? '#fff' : DARK} />
            <Text style={[s.pillText, reportActive && s.pillTextActive]} numberOfLines={1}>
              {activeReport ? activeReport.name : 'Reporte'}
            </Text>
            <IconChevronDown size={11} color={reportActive ? '#fff' : DARK} />
          </View>
        </PixelCard>

      </View>

      <View style={s.bottomBorder} />

      {/* ── Date picker: fecha del ticket ── */}
      <DatePickerModal
        visible={picking === 'ticket'}
        onClose={() => setPicking(null)}
        rangeMode
        startDate={ticketDate.start}
        endDate={ticketDate.end}
        onRangeSelect={(start, end) => { onTicketDate(start, end); setPicking(null); }}
        title="Fecha del ticket"
      />

      {/* ── Date picker: fecha de subida ── */}
      <DatePickerModal
        visible={picking === 'upload'}
        onClose={() => setPicking(null)}
        rangeMode
        startDate={uploadDate.start}
        endDate={uploadDate.end}
        onRangeSelect={(start, end) => { onUploadDate(start, end); setPicking(null); }}
        title="Fecha de subida"
      />

      {/* ── Bottom sheet: reporte ── */}
      <Modal
        visible={reportOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setReportOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setReportOpen(false)}>
          <View style={s.overlay} />
        </TouchableWithoutFeedback>

        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          <View style={s.sheetHeader}>
            <Text style={s.sheetTitle}>Reporte</Text>
            <PixelCard bg={colors.danger} shadowOffset={3} radius={8} onPress={() => setReportOpen(false)}>
              <View style={s.sheetCloseBtnInner}>
                <IconX size={15} color="white" />
              </View>
            </PixelCard>
          </View>
          <FlatList
            data={[{ id: '', name: 'Todos' }, ...reports]}
            keyExtractor={item => item.id}
            contentContainerStyle={s.listContent}
            renderItem={({ item, index }) => {
              const active = (reportFilter ?? '') === item.id;
              return (
                <TouchableOpacity
                  onPress={() => { onReportFilter(item.id || null); setReportOpen(false); }}
                  activeOpacity={0.75}
                  style={[s.option, index < reports.length && s.optionBorder]}
                >
                  <Text style={[s.optionText, active && s.optionTextActive]}>{item.name}</Text>
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
  wrapper: { backgroundColor: CARD_BG },

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
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  pillText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    color: DARK,
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  pillTextActive: { color: '#fff' },

  bottomBorder: { height: 4, backgroundColor: DARK },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    maxHeight: SCREEN_H * 0.6,
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
  sheetTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: DARK, letterSpacing: 0.3 },
  sheetCloseBtnInner: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 20, paddingTop: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  optionBorder: { borderBottomWidth: BORDER_WIDTH, borderBottomColor: `${DARK}10` },
  optionText: { fontFamily: 'SpaceGrotesk-Medium', fontSize: 15, color: DARK },
  optionTextActive: { fontFamily: 'SpaceGrotesk-Bold', color: colors.brand },
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
