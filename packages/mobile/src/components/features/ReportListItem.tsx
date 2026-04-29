import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { IconCalendar } from '@tabler/icons-react-native';
import { format } from 'date-fns';
import { DARK, CARD_BG, BORDER_WIDTH, PixelCard } from '../ui/PixelCard';
import { StatusBadge } from '../ui/StatusBadge';
import { colors } from '../../constants/theme';

import { reportIcon } from '@ticket-registrator/shared/assets';

interface ReportItemProps {
  report: any;
  onPress: () => void;
  dateLocale?: any;
}

/**
 * HeroReportCard — The large featured card for the current active report.
 */
export const HeroReportCard = ({ report, onPress, dateLocale }: ReportItemProps) => {
  return (
    <PixelCard bg={CARD_BG} shadowOffset={6} onPress={onPress} style={{ marginBottom: 8 }}>

      {/* ── Top: nombre + badge ── */}
      <View style={styles.heroTopRow}>
        <Text style={styles.heroName} numberOfLines={3}>{report.name}</Text>
        <View style={styles.heroPill}>
          <View style={styles.heroPillDot} />
          <Text style={styles.heroPillText}>En curso</Text>
        </View>
      </View>

      {/* ── Footer: icono · fechas · importe ── */}
      <View style={styles.heroFooter}>
        <Image
          source={reportIcon}
          style={styles.heroIcon}
          contentFit="contain"
          transition={200}
        />
        <View style={styles.heroDateBlock}>
          <View style={styles.heroDateRow}>
            <IconCalendar size={10} color={DARK} />
            <Text style={styles.heroDateText}>
              {format(new Date(report.start_date), 'dd MMM', { locale: dateLocale })}
              {' – '}
              {format(new Date(report.end_date), 'dd MMM yyyy', { locale: dateLocale })}
            </Text>
          </View>
        </View>
        <View style={styles.heroAmountBlock}>
          <Text style={styles.heroAmount}>
            {(report.requested_amount ?? 0).toLocaleString()}
            {' '}
            <Text style={styles.heroAmountCurrency}>{report.currency}</Text>
          </Text>
        </View>
      </View>

    </PixelCard>
  );
};

/**
 * PendingReportCard — Compact card for drafts and pending reports.
 */
export const PendingReportCard = ({ report, onPress, dateLocale }: ReportItemProps) => {
  return (
    <PixelCard bg={CARD_BG} shadowOffset={3} onPress={onPress} style={{ marginBottom: 10 }}>
      <View style={styles.rowInner}>
        <Image source={reportIcon} style={styles.rowIcon} contentFit="contain" transition={150} />
        <View style={styles.rowMid}>
          <Text style={styles.rowName} numberOfLines={1}>{report.name}</Text>
          <View style={styles.rowDateRow}>
            <IconCalendar size={9} color={`${DARK}80`} />
            <Text style={styles.rowDate}>
              {format(new Date(report.start_date), 'dd MMM', { locale: dateLocale })}
              {' – '}
              {format(new Date(report.end_date), 'dd MMM yyyy', { locale: dateLocale })}
            </Text>
          </View>
        </View>
        <View style={styles.rowRight}>
          <Text style={styles.rowAmount}>
            {(report.requested_amount ?? 0).toLocaleString()}
            <Text style={styles.rowCurrency}> {report.currency}</Text>
          </Text>
          <StatusBadge status={report.status} />
        </View>
      </View>
    </PixelCard>
  );
};

/**
 * HistoryRow — List item for completed reports.
 */
export const HistoryRow = ({ report, onPress, dateLocale }: ReportItemProps) => {
  return (
    <PixelCard bg={CARD_BG} shadowOffset={3} onPress={onPress} style={{ marginBottom: 10 }}>
      <View style={styles.rowInner}>
        <Image source={reportIcon} style={styles.rowIcon} contentFit="contain" transition={150} />
        <View style={styles.rowMid}>
          <Text style={styles.rowName} numberOfLines={1}>{report.name}</Text>
          <View style={styles.rowDateRow}>
            <IconCalendar size={9} color={`${DARK}80`} />
            <Text style={styles.rowDate}>
              {format(new Date(report.end_date), 'dd MMM yyyy', { locale: dateLocale })}
            </Text>
          </View>
        </View>
        <View style={styles.rowRight}>
          <Text style={styles.rowAmount}>
            {(report.approved_amount ?? report.requested_amount ?? 0).toLocaleString()}
            <Text style={styles.rowCurrency}> {report.currency}</Text>
          </Text>
          <StatusBadge status={report.status} />
        </View>
      </View>
    </PixelCard>
  );
};

const styles = StyleSheet.create({
  // Hero
  heroTopRow: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    gap: 12, paddingTop: 16, paddingHorizontal: 16, marginBottom: 20,
  },
  heroName: {
    flex: 1,
    fontFamily: 'SpaceGrotesk-Bold', fontSize: 22, color: DARK,
    lineHeight: 26, letterSpacing: -0.4,
  },
  heroPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.brand,
    borderWidth: BORDER_WIDTH, borderColor: DARK,
    borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    shadowColor: DARK,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    flexShrink: 0,
  },
  heroPillDot: { width: 5, height: 5, backgroundColor: CARD_BG },
  heroPillText: {
    color: CARD_BG, fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 9, letterSpacing: 0.2,
  },
  heroFooter: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingHorizontal: 16, paddingBottom: 16,
    borderTopWidth: 2, borderTopColor: `${DARK}12`,
    paddingTop: 14,
  },
  heroIcon: { width: 56, height: 56, flexShrink: 0, opacity: 0.85 },
  heroDateBlock: { flex: 1 },
  heroDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroDateText: {
    fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 10,
    color: DARK, letterSpacing: 0.2,
  },
  heroAmountBlock: { alignItems: 'flex-end', flexShrink: 0 },
  heroAmountLabel: {  // kept to avoid TS errors if referenced elsewhere
    fontFamily: 'SpaceGrotesk-Bold', fontSize: 7,
    color: `${DARK}50`, textTransform: 'uppercase', letterSpacing: 2,
  },
  heroAmount: {
    fontFamily: 'SpaceGrotesk-Bold', fontSize: 24,
    color: DARK, letterSpacing: -0.8, lineHeight: 28, textAlign: 'right',
  },
  heroAmountCurrency: {
    fontFamily: 'SpaceGrotesk-Bold', fontSize: 13,
    color: `${DARK}55`,
  },

  // Shared row (PendingReportCard + HistoryRow)
  rowInner: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
  rowIcon: { width: 44, height: 44, flexShrink: 0 },
  rowMid: { flex: 1, minWidth: 0 },
  rowName: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, color: DARK, marginBottom: 3 },
  rowDateRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rowDate: { fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 8, color: `${DARK}70` },
  rowRight: { alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  rowAmount: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: DARK },
  rowCurrency: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 8, color: `${DARK}60` },
});
