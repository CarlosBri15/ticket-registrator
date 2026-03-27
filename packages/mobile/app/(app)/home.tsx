import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Wallet,
  Briefcase,
  AlertCircle,
  FileText,
  ChevronRight,
  Plus,
  Receipt,
  Camera,
  ArrowUpRight,
} from 'lucide-react-native';
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

// ── Active Trip Card ──────────────────────────────────────────────────────────

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
  const totalAmount =
    tickets?.reduce((acc: number, tk: any) => acc + (tk.amount || 0), 0) ?? 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={styles.tripCard}>
      {/* Status + ID */}
      <View style={styles.tripCardRow}>
        <StatusBadge status={report.status} />
        <Text style={styles.tripId}>#{report.id.substring(0, 8)}</Text>
      </View>

      {/* Name */}
      <Text style={styles.tripName} numberOfLines={2}>
        {report.name}
      </Text>

      {/* Dates */}
      <View style={styles.tripDateRow}>
        <FileText size={20} color="#94a3b8" />
        <Text style={styles.tripDate}>
          {format(new Date(report.start_date), 'dd MMM', { locale: dateLocale })}
          {' — '}
          {format(new Date(report.end_date), 'dd MMM yyyy', { locale: dateLocale })}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.tripFooter}>
        <View style={styles.tripTicketPill}>
          <Receipt size={20} color={colors.brand} />
          <Text style={styles.tripTicketCount}>{ticketCount}</Text>
          <Text style={styles.tripTicketLabel}>{t('home.processedTickets')}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.tripAmountLabel}>{t('home.currentExpense')}</Text>
          <Text style={styles.tripAmount}>
            {(totalAmount > 0
              ? totalAmount
              : (report.requested_amount ?? 0)
            ).toFixed(2)}
            <Text style={styles.tripCurrency}> {report.currency}</Text>
          </Text>
        </View>
      </View>

      {/* Arrow */}
      <View style={styles.tripArrow}>
        <ChevronRight size={22} color={colors.brand} />
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

  const stats = useMemo(
    () => ({
      pendingAmount:
        reports
          ?.filter(r =>
            ['CREATED', 'SUBMITTED', 'PENDING'].includes(r.status.toUpperCase()),
          )
          ?.reduce((acc, r) => acc + (r.requested_amount ?? 0), 0) ?? 0,
      activeCount:
        reports?.filter(
          r =>
            r.status === ReportStatus.CREATED ||
            r.status === ReportStatus.SUBMITTED,
        ).length ?? 0,
      rejectedCount:
        reports?.filter(r => r.status === ReportStatus.DECLINED).length ?? 0,
    }),
    [reports],
  );

  const activeReport = useMemo(
    () => reports?.find(r => r.status === ReportStatus.CREATED) ?? null,
    [reports],
  );

  const recentCompleted = useMemo(
    () =>
      reports
        ?.filter(r =>
          ['APPROVED', 'PAID', 'DECLINED'].includes(r.status.toUpperCase()),
        )
        .slice(0, 5) ?? [],
    [reports],
  );

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : '?';

  const firstName = user?.name?.split(' ')[0] ?? '';

  const hour = new Date().getHours();
  const greetingKey =
    hour >= 5 && hour < 12
      ? 'home.greetingMorning'
      : hour >= 12 && hour < 20
        ? 'home.greetingAfternoon'
        : 'home.greetingEvening';

  const formattedDate = new Date().toLocaleDateString(i18n.language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand}
          />
        }
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dateLabel}>{formattedDate}</Text>
            <Text style={styles.greetingName}>{firstName}</Text>
            <Text style={styles.greetingSub}>
              {t(greetingKey, { name: '' })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(app)/profile')}
            activeOpacity={0.8}
            style={styles.avatarBtn}
          >
            <Text style={styles.avatarText}>{userInitials}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* ── Summary cards ── */}
          <View style={styles.summaryRow}>
            {/* Pending amount — primary card */}
            <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
              <View style={styles.summaryIconWrap}>
                <Wallet size={32} color={colors.brand} />
              </View>
              <Text style={styles.summaryLabel}>{t('home.pendingReimbursement')}</Text>
              <Text style={styles.summaryValuePrimary}>
                {stats.pendingAmount.toFixed(2)}
                <Text style={styles.summaryUnit}> €</Text>
              </Text>
            </View>

            <View style={styles.summaryCol}>
              {/* Active */}
              <View style={[styles.summaryCard, styles.summaryCardSm]}>
                <Briefcase size={28} color={colors.brand} />
                <Text style={styles.summaryValueSm}>{stats.activeCount}</Text>
                <Text style={styles.summaryLabelSm}>{t('home.activeTrips')}</Text>
              </View>
              {/* Rejected */}
              <View style={[styles.summaryCard, styles.summaryCardSm, styles.summaryCardDanger]}>
                <AlertCircle size={28} color="#dc2626" />
                <Text style={[styles.summaryValueSm, { color: '#dc2626' }]}>
                  {stats.rejectedCount}
                </Text>
                <Text style={[styles.summaryLabelSm, { color: '#dc2626' }]}>
                  {t('home.rejectedItems')}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Quick actions ── */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionPrimary}
              activeOpacity={0.82}
              onPress={() => router.push('/(app)/tickets')}
            >
              <Camera size={32} color="white" />
              <Text style={styles.actionPrimaryText}>{t('tickets.addTicket')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionSecondary}
              activeOpacity={0.82}
              onPress={() => router.push('/(app)/reports')}
            >
              <FileText size={32} color={colors.brand} />
              <Text style={styles.actionSecondaryText}>{t('trips.title')}</Text>
            </TouchableOpacity>
          </View>

          {/* ── Active Trip ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>{t('home.activeTrip')}</Text>
            </View>

            {activeReport ? (
              <ActiveTripCard
                report={activeReport}
                onPress={() => router.push(`/(app)/reports/${activeReport.id}`)}
                t={t}
                dateLocale={dateLocale}
              />
            ) : (
              !isLoading && (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconWrap}>
                    <FileText size={40} color="#cbd5e1" />
                  </View>
                  <Text style={styles.emptyText}>{t('trips.noActiveTrips')}</Text>
                  <TouchableOpacity
                    onPress={() => router.push('/(app)/reports')}
                    style={styles.emptyBtn}
                    activeOpacity={0.82}
                  >
                    <Plus size={24} color="white" />
                    <Text style={styles.emptyBtnText}>{t('home.createFirst')}</Text>
                  </TouchableOpacity>
                </View>
              )
            )}
          </View>

          {/* ── Recent Activity ── */}
          {recentCompleted.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('home.recentActivity')}</Text>
                <TouchableOpacity onPress={() => router.push('/(app)/reports')}>
                  <Text style={styles.viewAll}>{t('common.viewAll')}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.activityList}>
                {recentCompleted.map((report, idx) => (
                  <TouchableOpacity
                    key={report.id ?? `report-${idx}`}
                    onPress={() => router.push(`/(app)/reports/${report.id}`)}
                    activeOpacity={0.78}
                    style={[
                      styles.activityItem,
                      idx < recentCompleted.length - 1 && styles.activityItemBorder,
                    ]}
                  >
                    <View style={styles.activityIcon}>
                      <ArrowUpRight size={24} color="#94a3b8" />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.activityName} numberOfLines={1}>
                        {report.name}
                      </Text>
                      <Text style={styles.activityDate}>
                        {format(new Date(report.end_date), 'dd MMM yyyy', {
                          locale: dateLocale,
                        })}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={styles.activityAmount}>
                        {(
                          report.approved_amount ??
                          report.requested_amount ??
                          0
                        ).toLocaleString()}
                        <Text style={styles.activityCurrency}> {report.currency}</Text>
                      </Text>
                      <StatusBadge status={report.status} />
                    </View>
                    <ChevronRight size={24} color="#e2e8f0" style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
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
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.brand,
    marginBottom: 4,
  },
  greetingName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  greetingSub: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: 2,
  },
  avatarBtn: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#f0f6fd',
    borderWidth: 1.5,
    borderColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  avatarText: {
    color: colors.brand,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  // Content area
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Summary cards
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8f0fa',
    padding: 16,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryCardPrimary: {
    flex: 1.4,
    borderColor: '#dbeafe',
    backgroundColor: '#f8fbff',
  },
  summaryCol: {
    flex: 1,
    gap: 12,
  },
  summaryCardSm: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  summaryCardDanger: {
    borderColor: '#fee2e2',
    backgroundColor: '#fff8f8',
  },
  summaryIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#f0f6fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 4,
  },
  summaryValuePrimary: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  summaryUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
  },
  summaryValueSm: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 4,
    marginBottom: 2,
    letterSpacing: -0.4,
  },
  summaryLabelSm: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
  },

  // Quick actions
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  actionPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.brand,
    borderRadius: 14,
    paddingVertical: 13,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  actionPrimaryText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  actionSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  actionSecondaryText: {
    color: '#1e293b',
    fontWeight: '700',
    fontSize: 14,
  },

  // Section
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
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
  viewAll: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand,
  },

  // Trip card
  tripCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8f0fa',
    padding: 18,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    position: 'relative',
  },
  tripCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tripId: {
    fontSize: 9,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  tripName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.3,
    lineHeight: 22,
    marginBottom: 6,
  },
  tripDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 14,
  },
  tripDate: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  tripFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  tripTicketPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f0f6fd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  tripTicketCount: {
    fontWeight: '800',
    color: '#1e293b',
    fontSize: 12,
  },
  tripTicketLabel: {
    fontSize: 10,
    color: '#94a3b8',
  },
  tripAmountLabel: {
    fontSize: 9,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
    textAlign: 'right',
  },
  tripAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.brand,
    letterSpacing: -0.4,
  },
  tripCurrency: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
  },
  tripArrow: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f0f6fd',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0',
  },
  emptyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 14,
    fontWeight: '500',
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  emptyBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
  },

  // Activity list
  activityList: {
    backgroundColor: 'white',
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
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e8f0fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },
  activityAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  activityCurrency: {
    fontSize: 10,
    color: '#94a3b8',
  },
});
