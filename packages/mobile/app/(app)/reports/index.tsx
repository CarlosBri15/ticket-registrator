import { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReportsQuery, type IReport } from '@ticket-registrator/shared';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { mt, colors } from '../../../src/styles/theme';

const ACTIVE_STATUSES = ['CREATED', 'DRAFT', 'PENDING', 'SUBMITTED'];
const COMPLETED_STATUSES = ['APPROVED', 'PAID', 'REJECTED', 'DECLINED'];
const STATUS_CHIPS = ['ALL', 'CREATED', 'SUBMITTED', 'APPROVED', 'DECLINED'] as const;

// ── Report Card — mirrors web's report list item ──────────────────────────────

const ReportCard = ({
  report,
  onPress,
  dateLocale,
  t,
  featured,
}: {
  report: IReport;
  onPress: () => void;
  dateLocale: any;
  t: (key: string) => string;
  featured?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    className={`${mt.card} p-5 mb-3 ${featured ? 'border-brand/20' : ''}`}
  >
    {/* Status + ID */}
    <View className="flex-row items-center justify-between mb-3">
      <View className="flex-row items-center gap-2">
        <StatusBadge status={report.status} />
        <Text className="text-[10px] font-mono text-gray-300 uppercase">
          #{(report.id ?? '').substring(0, 8)}
        </Text>
      </View>
      <View className={`${mt.iconBoxSm} bg-brand/5`}>
        <Feather name="arrow-up-right" size={14} color={colors.brand} />
      </View>
    </View>

    {/* Name */}
    <Text
      className={`${featured ? 'text-xl' : 'text-base'} font-bold text-dark mb-2 leading-tight`}
      numberOfLines={2}
    >
      {report.name}
    </Text>

    {/* Date range */}
    <View className="flex-row items-center gap-1.5 mb-4">
      <Feather name="calendar" size={12} color="#94a3b8" />
      <Text className="text-xs text-gray-400 font-medium">
        {format(new Date(report.start_date), 'dd MMM', { locale: dateLocale })}
        {' — '}
        {format(new Date(report.end_date), 'dd MMM yyyy', { locale: dateLocale })}
      </Text>
    </View>

    {/* Footer: amount + CTA */}
    <View className="flex-row items-end justify-between pt-4 border-t border-gray-50">
      <View>
        <Text className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">
          {t('reportDetail.totalRequested')}
        </Text>
        <Text className="text-2xl font-bold text-dark">
          {(report.requested_amount ?? 0).toLocaleString()}
          <Text className="text-xs text-gray-400 font-medium"> {report.currency}</Text>
        </Text>
      </View>
      <View className={`${mt.btnPrimary} px-3.5 py-2.5`}>
        <Feather name="camera" size={15} color="white" />
        <Text className="text-white font-bold text-xs ml-1.5">{t('home.scanTicket')}</Text>
      </View>
    </View>
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

  const summaryStats = useMemo(() => ({
    count: completedReports.length,
    total: completedReports.reduce((acc, r) => acc + (r.approved_amount ?? 0), 0),
    currency: completedReports[0]?.currency ?? 'EUR',
  }), [completedReports]);

  const hasFilters = search.trim() !== '' || statusFilter !== 'ALL';
  const currentReport = activeReports[0] ?? null;

  return (
    <SafeAreaView className={mt.screen} edges={['top']}>
      {/* Header */}
      <View className={`${mt.pageHeader} flex-row justify-between items-center`}>
        <Text className={mt.pageHeaderTitle}>{t('trips.title')}</Text>
        {!currentReport && (
          <TouchableOpacity
            onPress={() => router.push('/(app)/reports/create')}
            className={`${mt.iconBox} bg-brand shadow-lg shadow-brand/20`}
          >
            <Feather name="plus" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />
        }
      >
        {/* Search bar */}
        <View className={`${mt.searchBar} mb-4`}>
          <Feather name="search" size={16} color="#94a3b8" />
          <TextInput
            className={mt.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder={t('trips.filterSearch')}
            placeholderTextColor="#94a3b8"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Status filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
          contentContainerStyle={{ gap: 8 }}
        >
          {STATUS_CHIPS.map(chip => (
            <TouchableOpacity
              key={chip}
              onPress={() => setStatusFilter(chip)}
              className={`px-3.5 py-1.5 rounded-full border ${
                statusFilter === chip
                  ? 'bg-brand border-brand'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text className={`text-xs font-bold ${statusFilter === chip ? 'text-white' : 'text-gray-500'}`}>
                {chip === 'ALL' ? t('trips.filterAll') : t(`status.${chip}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Empty state: zero reports */}
        {!isLoading && !reports?.length && (
          <View className={`${mt.emptyStateSm} py-14 mb-4`}>
            <View className={mt.emptyStateIcon}>
              <Feather name="file-text" size={28} color="#cbd5e1" />
            </View>
            <Text className={mt.emptyStateTitle}>{t('trips.noTickets')}</Text>
            <Text className={`${mt.emptyStateText} mb-5`}>{t('trips.primerViajeDesc')}</Text>
            <TouchableOpacity
              onPress={() => router.push('/(app)/reports/create')}
              className={`${mt.btnPrimary} px-6`}
            >
              <Text className={mt.btnTextPrimary}>{t('home.createFirst')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Active trips section ── */}
        {(isLoading || (reports?.length ?? 0) > 0) && (
          <View className="mb-8">
            <View className="flex-row items-center gap-2 mb-4">
              <View className="w-2 h-2 bg-brand rounded-full" />
              <Text className={mt.sectionTitle}>{t('home.activeTrip')}</Text>
              {!isLoading && filteredActive.length > 0 && (
                <View className="bg-brand/10 px-2 py-0.5 rounded-full">
                  <Text className="text-[10px] font-bold text-brand">{filteredActive.length}</Text>
                </View>
              )}
            </View>

            {filteredActive.length > 0 ? (
              filteredActive.map((report, idx) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onPress={() => router.push(`/(app)/reports/${report.id}`)}
                  dateLocale={dateLocale}
                  t={t}
                  featured={idx === 0}
                />
              ))
            ) : hasFilters ? (
              <View className={`${mt.emptyStateSm} py-8`}>
                <Feather name="search" size={24} color="#cbd5e1" />
                <Text className="text-gray-400 text-sm mt-3 text-center">
                  {t('trips.noResultsFilter')}
                </Text>
                <TouchableOpacity
                  onPress={() => { setSearch(''); setStatusFilter('ALL'); }}
                  className="mt-3"
                >
                  <Text className="text-xs font-bold text-brand uppercase tracking-wide">
                    {t('trips.filterClearAll')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className={`${mt.emptyStateSm} py-10`}>
                <View className={mt.emptyStateIcon}>
                  <Feather name="briefcase" size={24} color="#cbd5e1" />
                </View>
                <Text className="text-gray-400 text-sm mb-4 text-center">{t('trips.noActiveTrips')}</Text>
                <TouchableOpacity
                  onPress={() => router.push('/(app)/reports/create')}
                  className={`${mt.btnPrimary} px-5`}
                >
                  <Feather name="plus" size={16} color="white" />
                  <Text className={`${mt.btnTextPrimary} ml-1.5`}>{t('home.createFirst')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ── Summary stats — mirrors web sidebar ── */}
        {summaryStats.count > 0 && (
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 flex-row items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl">
              <View className="w-9 h-9 bg-white rounded-xl items-center justify-center shadow-sm border border-green-100">
                <Feather name="check-circle" size={18} color="#16a34a" />
              </View>
              <View>
                <Text className="text-[10px] font-bold text-green-700 uppercase mb-0.5">
                  {t('trips.completedTrips')}
                </Text>
                <Text className="text-xl font-bold text-green-700">{summaryStats.count}</Text>
              </View>
            </View>

            <View className="flex-1 flex-row items-center gap-3 p-4 bg-brand/5 border border-brand/10 rounded-2xl">
              <View className={`${mt.iconBoxSm} bg-white shadow-sm border border-brand/10`}>
                <Feather name="dollar-sign" size={16} color={colors.brand} />
              </View>
              <View>
                <Text className="text-[10px] font-bold text-brand uppercase mb-0.5">
                  {t('reportDetail.approved')}
                </Text>
                <Text className="text-lg font-bold text-dark">
                  {summaryStats.total.toLocaleString()}
                  <Text className="text-xs text-gray-400 font-medium"> {summaryStats.currency}</Text>
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ── History ── */}
        {filteredCompleted.length > 0 && (
          <View>
            <View className="flex-row items-center gap-2 mb-4">
              <Feather name="clock" size={16} color="#94a3b8" />
              <Text className={mt.sectionTitle}>{t('trips.history')}</Text>
            </View>

            <View className={`${mt.listSection} shadow-sm`}>
              {filteredCompleted.map((report, idx) => (
                <TouchableOpacity
                  key={report.id ?? `completed-${idx}`}
                  onPress={() => router.push(`/(app)/reports/${report.id}`)}
                  className={`px-4 py-3.5 flex-row items-center gap-3 ${
                    idx < filteredCompleted.length - 1 ? 'border-b border-gray-50' : ''
                  }`}
                >
                  <View className={`${mt.iconBoxSm} bg-gray-100`}>
                    <Feather name="file-text" size={14} color="#94a3b8" />
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="font-bold text-dark text-sm" numberOfLines={1}>
                      {report.name}
                    </Text>
                    <Text className="text-[10px] text-gray-400 mt-0.5">
                      {format(new Date(report.end_date), 'dd MMM yyyy', { locale: dateLocale })}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-bold text-dark text-sm">
                      {(report.approved_amount ?? report.requested_amount ?? 0).toLocaleString()}
                      <Text className="text-[10px] text-gray-400"> {report.currency}</Text>
                    </Text>
                    <StatusBadge status={report.status} />
                  </View>
                  <Feather name="chevron-right" size={14} color="#cbd5e1" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
