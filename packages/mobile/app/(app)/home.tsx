import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet, Briefcase, AlertCircle, FileText, ChevronRight, Plus, Receipt } from 'lucide-react-native';
import {
  useUserQuery,
  useReportsQuery,
  useTicketsQuery,
  ReportStatus,
  type IReport,
} from '@ticket-registrator/shared';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { StatusBadge } from '../../src/components/StatusBadge';
import { mt, colors } from '../../src/styles/theme';

// ── Active Trip Card — matches web's ActiveTripCard ───────────────────────────

const ActiveTripCard = ({
  report,
  onPress,
  t,
  dateLocale,
}: {
  report: IReport;
  onPress: () => void;
  t: (key: string, opts?: any) => string;
  dateLocale: any;
}) => {
  const { data: tickets } = useTicketsQuery(report.id);
  const ticketCount = tickets?.length ?? 0;
  const totalAmount = tickets?.reduce((acc: number, tk: any) => acc + (tk.amount || 0), 0) ?? 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`${mt.card} p-5 border-brand/20`}
    >
      {/* Status + ID */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <StatusBadge status={report.status} />
          <Text className="text-[10px] font-mono text-gray-300 uppercase tracking-wider">
            #{report.id.substring(0, 8)}
          </Text>
        </View>
        <View className={`${mt.iconBoxSm} bg-brand/5`}>
          <ChevronRight size={16} color={colors.brand} />
        </View>
      </View>

      {/* Name */}
      <Text className="text-xl font-bold text-dark mb-2 leading-tight" numberOfLines={2}>
        {report.name}
      </Text>

      {/* Dates */}
      <View className="flex-row items-center gap-1.5 mb-4">
        <FileText size={12} color="#94a3b8" />
        <Text className="text-xs text-gray-400 font-medium">
          {format(new Date(report.start_date), 'dd MMM', { locale: dateLocale })}
          {' — '}
          {format(new Date(report.end_date), 'dd MMM yyyy', { locale: dateLocale })}
        </Text>
      </View>

      {/* Footer: tickets + amount */}
      <View className="flex-row items-end justify-between pt-4 border-t border-gray-50">
        <View className="flex-row items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
          <Receipt size={13} color={colors.brand} />
          <Text className="font-bold text-dark text-sm">{ticketCount}</Text>
          <Text className="text-xs text-gray-400">{t('home.processedTickets')}</Text>
        </View>
        <View className="items-end">
          <Text className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">
            {t('home.currentExpense')}
          </Text>
          <Text className="text-2xl font-black text-brand leading-none">
            {(totalAmount > 0 ? totalAmount : (report.requested_amount ?? 0)).toFixed(2)}
            <Text className="text-sm font-medium text-brand/50"> {report.currency}</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Home Screen ───────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { data: user } = useUserQuery();
  const { data: reports, isLoading, refetch } = useReportsQuery();

  const dateLocale = i18n.language.startsWith('es') ? es : enUS;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const stats = useMemo(() => ({
    pendingAmount: reports
      ?.filter(r => ['CREATED', 'SUBMITTED', 'PENDING'].includes(r.status.toUpperCase()))
      ?.reduce((acc, r) => acc + (r.requested_amount ?? 0), 0) ?? 0,
    activeCount: reports?.filter(r =>
      r.status === ReportStatus.CREATED || r.status === ReportStatus.SUBMITTED,
    ).length ?? 0,
    rejectedCount: reports?.filter(r => r.status === ReportStatus.DECLINED).length ?? 0,
  }), [reports]);

  const activeReport = useMemo(
    () => reports?.find(r => r.status === ReportStatus.CREATED) ?? null,
    [reports],
  );

  const recentCompleted = useMemo(
    () => reports
      ?.filter(r => ['APPROVED', 'PAID', 'DECLINED'].includes(r.status.toUpperCase()))
      .slice(0, 5) ?? [],
    [reports],
  );

  const userInitials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
    : '';

  const hour = new Date().getHours();
  const greetingKey = hour >= 5 && hour < 12
    ? 'home.greetingMorning'
    : hour >= 12 && hour < 20
      ? 'home.greetingAfternoon'
      : 'home.greetingEvening';

  const formattedDate = new Date().toLocaleDateString(i18n.language, {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <SafeAreaView className={mt.screen} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />
        }
      >
        {/* ── Header ── */}
        <View className="flex-row justify-between items-end mb-8">
          <View className="flex-1">
            <Text className="text-brand font-bold uppercase tracking-widest text-[10px] mb-1">
              {formattedDate}
            </Text>
            <Text className="text-3xl font-black text-dark tracking-tighter">
              {user?.name?.split(' ')[0] ?? 'Dashboard'}
            </Text>
            <Text className="text-sm text-gray-400 mt-0.5">{t(greetingKey, { name: user?.name?.split(' ')[0] ?? '' })}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(app)/profile')}
            activeOpacity={0.8}
            className={mt.avatarBtn}
          >
            <View className={mt.avatarInner}>
              <Text className="text-brand font-black text-base tracking-tighter">{userInitials}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── KPI Stats — horizontal scroll ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row mb-8 -mx-6 px-6"
          contentContainerStyle={{ gap: 12 }}
        >
          <View className={`${mt.statCardPrimary} w-56`}>
            <View className="flex-row justify-between items-start mb-4">
              <View className="p-2 bg-white/20 rounded-xl">
                <Wallet size={20} color="white" />
              </View>
              <View className="bg-white/20 px-2 py-0.5 rounded-full">
                <Text className="text-white text-[9px] font-bold uppercase">
                  {stats.pendingAmount > 0 ? t('home.inProcess') : t('home.upToDate')}
                </Text>
              </View>
            </View>
            <Text className="text-white/70 text-sm font-medium">{t('home.pendingReimbursement')}</Text>
            <Text className="text-white text-3xl font-bold mt-1">{stats.pendingAmount.toFixed(2)} €</Text>
          </View>

          <View className={`${mt.statCard} w-56`}>
            <View className="flex-row justify-between items-start mb-4">
              <View className="p-2 bg-secondary/20 rounded-xl">
                <Briefcase size={20} color={colors.brand} />
              </View>
            </View>
            <Text className="text-gray-500 text-sm font-medium">{t('home.activeTrips')}</Text>
            <Text className="text-dark text-3xl font-bold mt-1">{stats.activeCount}</Text>
          </View>

          <View className={`${mt.statCardDanger} w-56`}>
            <View className="flex-row justify-between items-start mb-4">
              <View className={`${mt.iconBox} bg-white`}>
                <AlertCircle size={20} color="#763626" />
              </View>
            </View>
            <Text className="text-accent/70 text-sm font-medium">{t('home.rejectedItems')}</Text>
            <Text className="text-accent text-3xl font-bold mt-1">{stats.rejectedCount}</Text>
          </View>
        </ScrollView>

        {/* ── Active Trip (matches web's ActiveTripCard) ── */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-4">
            <View className="w-2 h-2 bg-brand rounded-full" />
            <Text className={mt.sectionTitle}>{t('home.activeTrip')}</Text>
          </View>

          {activeReport ? (
            <ActiveTripCard
              report={activeReport}
              onPress={() => router.push(`/(app)/reports/${activeReport.id}`)}
              t={t}
              dateLocale={dateLocale}
            />
          ) : !isLoading && (
            <View className={`${mt.emptyStateSm} py-10`}>
              <View className={mt.emptyStateIcon}>
                <FileText size={24} color="#cbd5e1" />
              </View>
              <Text className="text-gray-400 text-sm text-center mb-4">{t('trips.noActiveTrips')}</Text>
              <TouchableOpacity
                onPress={() => router.push('/(app)/reports')}
                className={`${mt.btnPrimary} px-5`}
              >
                <Plus size={16} color="white" />
                <Text className={`${mt.btnTextPrimary} ml-1.5`}>{t('home.createFirst')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Recent Activity (matches web's RecentActivitySection) ── */}
        {recentCompleted.length > 0 && (
          <View>
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-2">
                <FileText size={16} color="#94a3b8" />
                <Text className={mt.sectionTitle}>{t('home.recentActivity')}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(app)/reports')}>
                <Text className="text-xs font-bold text-brand">{t('common.viewAll')}</Text>
              </TouchableOpacity>
            </View>

            <View className={`${mt.listSection} shadow-sm`}>
              {recentCompleted.map((report, idx) => (
                <TouchableOpacity
                  key={report.id ?? `report-${idx}`}
                  onPress={() => router.push(`/(app)/reports/${report.id}`)}
                  className={`px-4 py-3.5 flex-row items-center gap-3 ${idx < recentCompleted.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <View className={`${mt.iconBoxSm} bg-gray-100`}>
                    <FileText size={14} color="#94a3b8" />
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
                  <ChevronRight size={14} color="#cbd5e1" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
