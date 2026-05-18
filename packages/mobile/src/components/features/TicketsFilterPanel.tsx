/**
 * TicketsFilterPanel — chrome bar (search + 3 chip filters) above the tickets list.
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
  FileText,
  Upload,
  Folder,
  ChevronDown,
  Check,
} from 'lucide-react-native';
import { format } from 'date-fns';
import { colors } from '../../constants/theme';
import { DatePickerModal } from './DatePickerModal';

const { height: SCREEN_H } = Dimensions.get('window');

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
    {children}
  </TouchableOpacity>
);

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

  const activeReport = reports.find((r) => r.id === reportFilter);

  const ticketActive = !!(ticketDate.start || ticketDate.end);
  const uploadActive = !!(uploadDate.start || uploadDate.end);
  const reportActive = !!reportFilter;

  return (
    <View style={s.wrapper}>
      <View style={s.searchRow}>
        <Search size={16} color={colors.fgSecondary} strokeWidth={2} />
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={onSearch}
          placeholder="Buscar tickets..."
          placeholderTextColor={colors.fgQuaternary}
          returnKeyType="search"
        />
        {hasFilters ? (
          <TouchableOpacity
            accessibilityLabel="clear filters"
            onPress={onClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={18} color={colors.fgSecondary} strokeWidth={2} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={s.chipsRow}>
        <Chip active={ticketActive} onPress={() => setPicking('ticket')}>
          <FileText size={11} color={ticketActive ? colors.fgOnBrand : colors.dark} strokeWidth={2} />
          <Text style={[s.chipText, ticketActive && s.chipTextActive]} numberOfLines={1}>
            {fmtRange(ticketDate) ?? 'Ticket'}
          </Text>
        </Chip>

        <Chip active={uploadActive} onPress={() => setPicking('upload')}>
          <Upload size={11} color={uploadActive ? colors.fgOnBrand : colors.dark} strokeWidth={2} />
          <Text style={[s.chipText, uploadActive && s.chipTextActive]} numberOfLines={1}>
            {fmtRange(uploadDate) ?? 'Subida'}
          </Text>
        </Chip>

        <Chip active={reportActive} onPress={() => setReportOpen(true)}>
          <Folder size={11} color={reportActive ? colors.fgOnBrand : colors.dark} strokeWidth={2} />
          <Text style={[s.chipText, reportActive && s.chipTextActive]} numberOfLines={1}>
            {activeReport ? activeReport.name : 'Reporte'}
          </Text>
          <ChevronDown size={11} color={reportActive ? colors.fgOnBrand : colors.dark} strokeWidth={2} />
        </Chip>
      </View>

      <View style={s.bottomBorder} />

      <DatePickerModal
        visible={picking === 'ticket'}
        onClose={() => setPicking(null)}
        rangeMode
        startDate={ticketDate.start}
        endDate={ticketDate.end}
        onRangeSelect={(start, end) => { onTicketDate(start, end); setPicking(null); }}
        title="Fecha del ticket"
      />

      <DatePickerModal
        visible={picking === 'upload'}
        onClose={() => setPicking(null)}
        rangeMode
        startDate={uploadDate.start}
        endDate={uploadDate.end}
        onRangeSelect={(start, end) => { onUploadDate(start, end); setPicking(null); }}
        title="Fecha de subida"
      />

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
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="close"
              onPress={() => setReportOpen(false)}
              style={s.sheetCloseBtn}
              activeOpacity={0.7}
            >
              <X size={16} color={colors.fgSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={[{ id: '', name: 'Todos' }, ...reports]}
            keyExtractor={(item) => item.id}
            contentContainerStyle={s.listContent}
            renderItem={({ item, index }) => {
              const active = (reportFilter ?? '') === item.id;
              return (
                <TouchableOpacity
                  onPress={() => { onReportFilter(item.id || null); setReportOpen(false); }}
                  activeOpacity={0.7}
                  style={[s.option, index < reports.length && s.optionBorder]}
                >
                  <Text style={[s.optionText, active && s.optionTextActive]}>{item.name}</Text>
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
  wrapper: { backgroundColor: colors.surface },

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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceCard,
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
  chipTextActive: { color: colors.fgOnBrand },

  bottomBorder: { height: 1, backgroundColor: colors.border },

  overlay: { flex: 1, backgroundColor: colors.overlayStrong },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_H * 0.6,
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
  sheetTitle: { fontFamily: 'Manrope-Bold', fontSize: 18, color: colors.dark, letterSpacing: -0.2 },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  listContent: { paddingHorizontal: 12, paddingTop: 6 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  optionBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  optionText: { fontFamily: 'Manrope-Medium', fontSize: 14, color: colors.dark },
  optionTextActive: { fontFamily: 'Manrope-SemiBold', color: colors.brand },
});
