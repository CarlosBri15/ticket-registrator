import { View, Text, StyleSheet } from 'react-native';
import { Calendar, FileText } from 'lucide-react-native';
import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { colors } from '../../constants/theme';

interface ReportLike {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  requested_amount?: number | null;
  approved_amount?: number | null;
  currency: string;
}

interface ReportItemProps {
  report: ReportLike;
  onPress: () => void;
  dateLocale?: Locale;
}

interface RowVariantProps extends ReportItemProps {
  /** Kept for API compatibility — no longer rendered as a ledger. */
  isLast?: boolean;
  /** Use approved amount when present; falls back to requested. Default: false. */
  preferApproved?: boolean;
  /** Use single end-date instead of full range. */
  dateMode?: 'range' | 'end';
}

const formatAmount = (amount: number | null | undefined) =>
  (amount ?? 0).toLocaleString();

/**
 * HeroReportCard — Saturated grafito tile for the active report (kit
 * `.stat--tone-brand`). Big amount, accent dot pill, single tap target.
 */
export const HeroReportCard = ({ report, onPress, dateLocale }: ReportItemProps) => {
  return (
    <Card variant="brand" onPress={onPress} style={styles.hero} accessibilityLabel={report.name}>
      <View style={styles.heroTopRow}>
        <Text style={styles.heroName} numberOfLines={3}>{report.name}</Text>
        <View style={styles.heroPill}>
          <View style={styles.heroPillDot} />
          <Text style={styles.heroPillText}>En curso</Text>
        </View>
      </View>

      <View style={styles.heroFooter}>
        <View style={styles.heroDateRow}>
          <Calendar size={12} color={colors.fgOnSidebarTertiary} strokeWidth={2} />
          <Text style={styles.heroDateText}>
            {format(new Date(report.start_date), 'dd MMM', { locale: dateLocale })}
            {'  →  '}
            {format(new Date(report.end_date), 'dd MMM yyyy', { locale: dateLocale })}
          </Text>
        </View>
        <View style={styles.heroAmountBlock}>
          <Text style={styles.heroAmount}>
            {formatAmount(report.requested_amount)}
            <Text style={styles.heroAmountCurrency}> {report.currency}</Text>
          </Text>
        </View>
      </View>
    </Card>
  );
};

/**
 * ReportRowCard — Compact white card row used in stacked report lists.
 * Kit-aligned: subtle stone border, radius 14, vertical margin between rows,
 * no hard shadow.
 */
export const ReportRowCard = ({
  report,
  onPress,
  dateLocale,
  preferApproved = false,
  dateMode = 'range',
}: RowVariantProps) => {
  const amount = preferApproved
    ? (report.approved_amount ?? report.requested_amount)
    : report.requested_amount;

  return (
    <Card onPress={onPress} style={styles.row} accessibilityLabel={report.name}>
      <View style={styles.rowInner}>
        <View style={styles.rowIconBox}>
          <FileText size={18} color={colors.dark} strokeWidth={2} />
        </View>

        <View style={styles.rowMid}>
          <Text style={styles.rowName} numberOfLines={1}>{report.name}</Text>
          <View style={styles.rowMeta}>
            <Calendar size={11} color={colors.fgTertiary} strokeWidth={2} />
            <Text style={styles.rowMetaText} numberOfLines={1}>
              {dateMode === 'range'
                ? `${format(new Date(report.start_date), 'dd MMM', { locale: dateLocale })} – ${format(new Date(report.end_date), 'dd MMM yyyy', { locale: dateLocale })}`
                : format(new Date(report.end_date), 'dd MMM yyyy', { locale: dateLocale })}
            </Text>
          </View>
        </View>

        <View style={styles.rowRight}>
          <Text style={styles.rowAmount}>
            {formatAmount(amount)}
            <Text style={styles.rowCurrency}> {report.currency}</Text>
          </Text>
          <StatusBadge status={report.status} />
        </View>
      </View>
    </Card>
  );
};

/**
 * PendingReportCard — Card for pending reports (shows the full date range
 * and the requested amount).
 */
export const PendingReportCard = ({ report, onPress, dateLocale }: ReportItemProps) => (
  <ReportRowCard
    report={report}
    onPress={onPress}
    dateLocale={dateLocale}
    dateMode="range"
  />
);

/**
 * HistoryRow — Card for completed reports (shows the end date and the
 * approved amount when present).
 */
export const HistoryRow = ({ report, onPress, dateLocale }: ReportItemProps) => (
  <ReportRowCard
    report={report}
    onPress={onPress}
    dateLocale={dateLocale}
    preferApproved
    dateMode="end"
  />
);

const styles = StyleSheet.create({
  // ── Hero (grafito tone tile)
  hero: {
    marginBottom: 12,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 20,
    paddingHorizontal: 22,
    marginBottom: 22,
  },
  heroName: {
    flex: 1,
    fontFamily: 'Manrope-Bold',
    fontSize: 24,
    color: colors.fgOnBrand,
    lineHeight: 28,
    letterSpacing: -0.6,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
  },
  heroPillDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
    backgroundColor: colors.fgOnAccent,
  },
  heroPillText: {
    color: colors.fgOnAccent,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 22,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.overlaySidebar,
    paddingTop: 16,
  },
  heroDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroDateText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 12,
    color: colors.fgOnSidebarSecondary,
  },
  heroAmountBlock: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  heroAmount: {
    fontFamily: 'Manrope-Bold',
    fontSize: 30,
    color: colors.fgOnBrand,
    letterSpacing: -1,
    lineHeight: 32,
  },
  heroAmountCurrency: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 14,
    color: colors.fgOnSidebarTertiary,
    letterSpacing: 0,
  },

  // ── Stacked row card
  row: {
    marginBottom: 10,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowIconBox: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowMid: {
    flex: 1,
    minWidth: 0,
  },
  rowName: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 14,
    color: colors.dark,
    marginBottom: 4,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
  },
  rowMetaText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 12,
    color: colors.fgSecondary,
    flexShrink: 1,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  rowAmount: {
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
    color: colors.dark,
    letterSpacing: -0.2,
  },
  rowCurrency: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
    color: colors.fgSecondary,
  },
});
