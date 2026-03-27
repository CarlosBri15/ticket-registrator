import { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useReportsQuery,
  type IReport,
} from '@ticket-registrator/shared';
// Metro necesita resolver los assets PNG directamente desde la fuente,
// no a través del dist compilado, para registrarlos en su pipeline de assets.
const reportIcon = require('../../../../shared/src/assets/report.png') as number;
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { colors } from '../../../src/styles/theme';

const ACTIVE_STATUSES = ['CREATED', 'DRAFT', 'PENDING', 'SUBMITTED'];
const COMPLETED_STATUSES = ['APPROVED', 'PAID', 'REJECTED', 'DECLINED'];
const STATUS_CHIPS = ['ALL', 'CREATED', 'SUBMITTED', 'APPROVED', 'DECLINED'] as const;

// ── Report Card ───────────────────────────────────────────────────────────────

const ReportCard = ({
  report,
  onPress,
  dateLocale,
  t,
}: {
  report: IReport;
  onPress: () => void;
  dateLocale: any;
  t: (key: string) => string;
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={styles.card}>
    {/* Top row: icon + name + arrow */}
    <View style={styles.cardTop}>
      <Image source={reportIcon} style={styles.reportIcon} resizeMode="contain" />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.cardName} numberOfLines={2}>
          {report.name}
        </Text>
        <View style={styles.cardDateRow}>
          <Feather name="calendar" size={20} color="#94a3b8" />
          <Text style={styles.cardDate}>
            {format(new Date(report.start_date), 'dd MMM', { locale: dateLocale })}
            {' — '}
            {format(new Date(report.end_date), 'dd MMM yyyy', { locale: dateLocale })}
          </Text>
        </View>
      </View>
      <View style={styles.cardArrow}>
        <Feather name="arrow-up-right" size={28} color={colors.brand} />
      </View>
    </View>

    {/* Divider */}
    <View style={styles.cardDivider} />

    {/* Bottom row: status + ID + amount */}
    <View style={styles.cardBottom}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <StatusBadge status={report.status} />
        <Text style={styles.cardId}>#{(report.id ?? '').substring(0, 8)}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.cardAmountLabel}>{t('reportDetail.totalRequested')}</Text>
        <Text style={styles.cardAmount}>
          {(report.requested_amount ?? 0).toLocaleString()}
          <Text style={styles.cardCurrency}> {report.currency}</Text>
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

// ── History Row ───────────────────────────────────────────────────────────────

const HistoryRow = ({
  report,
  onPress,
  dateLocale,
  isLast,
}: {
  report: IReport;
  onPress: () => void;
  dateLocale: any;
  isLast: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.78}
    style={[styles.historyRow, !isLast && styles.historyRowBorder]}
  >
    <Image source={reportIcon} style={styles.historyIcon} resizeMode="contain" />
    <View style={{ flex: 1, minWidth: 0 }}>
      <Text style={styles.historyName} numberOfLines={1}>
        {report.name}
      </Text>
      <Text style={styles.historyDate}>
        {format(new Date(report.end_date), 'dd MMM yyyy', { locale: dateLocale })}
      </Text>
    </View>
    <View style={{ alignItems: 'flex-end', gap: 4 }}>
      <Text style={styles.historyAmount}>
        {(report.approved_amount ?? report.requested_amount ?? 0).toLocaleString()}
        <Text style={styles.historyCurrency}> {report.currency}</Text>
      </Text>
      <StatusBadge status={report.status} />
    </View>
    <Feather name="chevron-right" size={24} color="#e2e8f0" style={{ marginLeft: 6 }} />
  </TouchableOpacity>
);

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ReportsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { data: reports, refetch, isLoading } = useReportsQuery();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const dateLocale = i18n.language.startsWith('es') ? es : enUS;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const activeReports = useMemo(
    () => reports?.filter(r => ACTIVE_STATUSES.includes(r.status.toUpperCase())) ?? [],
    [reports],
  );

  const completedReports = useMemo(
    () => reports?.filter(r => COMPLETED_STATUSES.includes(r.status.toUpperCase())) ?? [],
    [reports],
  );

  const filteredActive = useMemo(() => {
    let list = activeReports;
    if (search) list = list.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'ALL') list = list.filter(r => r.status.toUpperCase() === statusFilter);
    return list;
  }, [activeReports, search, statusFilter]);

  const filteredCompleted = useMemo(() => {
    let list = completedReports;
    if (search) list = list.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'ALL') list = list.filter(r => r.status.toUpperCase() === statusFilter);
    return list;
  }, [completedReports, search, statusFilter]);

  const summaryStats = useMemo(
    () => ({
      count: completedReports.length,
      total: completedReports.reduce((acc, r) => acc + (r.approved_amount ?? 0), 0),
      currency: completedReports[0]?.currency ?? 'EUR',
    }),
    [completedReports],
  );

  const hasFilters = search.trim() !== '' || statusFilter !== 'ALL';
  const currentReport = activeReports[0] ?? null;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('trips.title')}</Text>
        <TouchableOpacity
          onPress={() => router.push('/(app)/reports/create')}
          style={styles.headerBtn}
          activeOpacity={0.82}
        >
          <Feather name="plus" size={32} color="white" />
          <Text style={styles.headerBtnText}>{t('trips.newTrip') || 'Nuevo'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />
        }
      >
        {/* Search bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={28} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder={t('trips.filterSearch')}
            placeholderTextColor="#94a3b8"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={28} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Status filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 24 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {STATUS_CHIPS.map(chip => (
            <TouchableOpacity
              key={chip}
              onPress={() => setStatusFilter(chip)}
              style={[
                styles.chip,
                statusFilter === chip ? styles.chipActive : styles.chipInactive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  statusFilter === chip ? styles.chipTextActive : styles.chipTextInactive,
                ]}
              >
                {chip === 'ALL' ? t('trips.filterAll') : t(`status.${chip}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Empty state: zero reports */}
        {!isLoading && !reports?.length && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Image source={reportIcon} style={styles.emptyIcon} resizeMode="contain" />
            </View>
            <Text style={styles.emptyTitle}>{t('trips.noTickets')}</Text>
            <Text style={styles.emptyText}>{t('trips.primerViajeDesc')}</Text>
            <TouchableOpacity
              onPress={() => router.push('/(app)/reports/create')}
              style={styles.emptyBtn}
              activeOpacity={0.82}
            >
              <Text style={styles.emptyBtnText}>{t('home.createFirst')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Active section ── */}
        {(isLoading || (reports?.length ?? 0) > 0) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>{t('home.activeTrip')}</Text>
              {!isLoading && filteredActive.length > 0 && (
                <View style={styles.countPill}>
                  <Text style={styles.countPillText}>{filteredActive.length}</Text>
                </View>
              )}
            </View>

            {filteredActive.length > 0 ? (
              filteredActive.map(report => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onPress={() => router.push(`/(app)/reports/${report.id}`)}
                  dateLocale={dateLocale}
                  t={t}
                />
              ))
            ) : hasFilters ? (
              <View style={styles.emptyStateSmall}>
                <Feather name="search" size={36} color="#cbd5e1" />
                <Text style={styles.emptyStateSmallText}>{t('trips.noResultsFilter')}</Text>
                <TouchableOpacity onPress={() => { setSearch(''); setStatusFilter('ALL'); }}>
                  <Text style={styles.clearBtn}>{t('trips.filterClearAll')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyStateSmall}>
                <View style={styles.emptyIconWrapSm}>
                  <Feather name="briefcase" size={22} color="#cbd5e1" />
                </View>
                <Text style={styles.emptyStateSmallText}>{t('trips.noActiveTrips')}</Text>
                <TouchableOpacity
                  onPress={() => router.push('/(app)/reports/create')}
                  style={styles.emptyBtn}
                  activeOpacity={0.82}
                >
                  <Feather name="plus" size={24} color="white" />
                  <Text style={[styles.emptyBtnText, { marginLeft: 6 }]}>{t('home.createFirst')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ── Summary stats ── */}
        {summaryStats.count > 0 && (
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardGreen]}>
              <View style={styles.statIconWrap}>
                <Feather name="check-circle" size={28} color="#16a34a" />
              </View>
              <Text style={styles.statLabel}>{t('trips.completedTrips')}</Text>
              <Text style={[styles.statValue, { color: '#16a34a' }]}>{summaryStats.count}</Text>
            </View>
            <View style={[styles.statCard, styles.statCardBlue]}>
              <View style={[styles.statIconWrap, styles.statIconBlue]}>
                <Feather name="trending-up" size={28} color={colors.brand} />
              </View>
              <Text style={[styles.statLabel, { color: '#64748b' }]}>{t('reportDetail.approved')}</Text>
              <Text style={[styles.statValue, { color: '#1e293b' }]}>
                {summaryStats.total.toLocaleString()}
                <Text style={styles.statCurrency}> {summaryStats.currency}</Text>
              </Text>
            </View>
          </View>
        )}

        {/* ── History ── */}
        {filteredCompleted.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="clock" size={24} color="#94a3b8" />
              <Text style={styles.sectionTitle}>{t('trips.history')}</Text>
            </View>

            <View style={styles.historyList}>
              {filteredCompleted.map((report, idx) => (
                <HistoryRow
                  key={report.id ?? `completed-${idx}`}
                  report={report}
                  onPress={() => router.push(`/(app)/reports/${report.id}`)}
                  dateLocale={dateLocale}
                  isLast={idx === filteredCompleted.length - 1}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.4,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  headerBtnText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e8f0fa',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },

  // Chips
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  chipInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  chipTextInactive: {
    color: '#64748b',
  },

  // Section
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.2,
  },
  countPill: {
    backgroundColor: '#f0f6fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  countPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand,
  },

  // Report Card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8f0fa',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  reportIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f0f6fd',
    borderWidth: 1,
    borderColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  reportIcon: {
    width: 48,
    height: 48,
    alignSelf: 'center',
  },
  cardName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.2,
    lineHeight: 20,
    marginBottom: 4,
  },
  cardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardDate: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  cardArrow: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f0f6fd',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 14,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardId: {
    fontSize: 9,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  cardAmountLabel: {
    fontSize: 9,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 1,
    textAlign: 'right',
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.4,
  },
  cardCurrency: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94a3b8',
  },

  // History row
  historyList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8f0fa',
    overflow: 'hidden',
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  historyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  historyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e8f0fa',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  historyIcon: {
    width: 40,
    height: 40,
  },
  historyName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },
  historyAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  historyCurrency: {
    fontSize: 10,
    color: '#94a3b8',
  },

  // Summary stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statCardGreen: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  statCardBlue: {
    backgroundColor: '#f8fbff',
    borderColor: '#dbeafe',
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statIconBlue: {
    backgroundColor: '#f0f6fd',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16a34a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  statCurrency: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94a3b8',
  },

  // Empty states
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#f0f6fd',
    borderWidth: 1,
    borderColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyIcon: {
    width: 72,
    height: 72,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 20,
    fontWeight: '500',
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  emptyBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyStateSmall: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0',
    gap: 10,
  },
  emptyStateSmallText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyIconWrapSm: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtn: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
