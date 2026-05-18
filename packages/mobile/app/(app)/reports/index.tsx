import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Plus,
  Send,
  Search,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card } from '../../../src/components/ui/Card';
import { HeroReportCard, PendingReportCard, HistoryRow } from '../../../src/components/features/ReportListItem';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { ReportsFilterPanel } from '../../../src/components/features/ReportsFilterPanel';
import { colors } from '../../../src/constants/theme';

import { useReportsScreen } from '../../../src/hooks/useReportsScreen';
import { getDateLocale } from '../../../src/utils/date';
import { reportIcon } from '@ticket-registrator/shared/assets';
import { HISTORY_LIMIT } from '@ticket-registrator/shared';

export default function ReportsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsCreating(false);
    }, []),
  );

  const {
    reports,
    currentReport,
    filteredPending,
    filteredCompleted,
    isLoading,
    refreshing,
    search, setSearch,
    statusFilter, setStatusFilter,
    startDate, setStartDate,
    endDate, setEndDate,
    hasActiveFilters,
    clearFilters,
    onRefresh,
    language,
  } = useReportsScreen();

  const dateLocale = getDateLocale(language);
  const insets = useSafeAreaInsets();

  const visibleCompleted = showAllHistory
    ? filteredCompleted
    : filteredCompleted.slice(0, HISTORY_LIMIT);
  const hiddenCount = filteredCompleted.length - HISTORY_LIMIT;

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surfaceCard} />
      <View style={{ height: insets.top, backgroundColor: colors.surfaceCard }} />

      {/* ── Page header (kit `.page-head`) ── */}
      <View style={s.pageHead}>
        <View style={s.pageHeadText}>
          <Text style={s.pageTitle}>{t('trips.title')}</Text>
          <Text style={s.pageSubtitle}>
            {reports?.length ?? 0} reportes · {filteredPending.length} por enviar
          </Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="create report"
          onPress={() => { setIsCreating(true); router.push('/(app)/reports/create'); }}
          activeOpacity={0.85}
          disabled={isCreating}
          style={[s.pageHeadBtn, isCreating && { opacity: 0.6 }]}
        >
          <Plus size={16} color={colors.fgOnBrand} strokeWidth={2} />
          <Text style={s.pageHeadBtnText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      <ReportsFilterPanel
        search={search} onSearch={setSearch}
        startDate={startDate} onStartDate={setStartDate}
        endDate={endDate} onEndDate={setEndDate}
        statusFilter={statusFilter} onStatus={setStatusFilter}
        hasFilters={hasActiveFilters}
        onClear={clearFilters}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />
        }
      >
        {!isLoading && !reports?.length ? (
          <EmptyState
            icon={reportIcon}
            title={t('trips.noTickets')}
            description={t('trips.primerViajeDesc')}
            buttonLabel={t('home.createFirst')}
            onButtonPress={() => router.push('/(app)/reports/create')}
          />
        ) : null}

        {currentReport ? (
          <View style={s.section}>
            <HeroReportCard
              report={currentReport}
              onPress={() => router.push(`/(app)/reports/${currentReport.id}`)}
              dateLocale={dateLocale}
            />
          </View>
        ) : null}

        {(filteredPending.length > 0
          || (!isLoading && !currentReport && (reports?.length ?? 0) > 0)) ? (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Send size={12} color={colors.fgSecondary} strokeWidth={2} />
              <Text style={s.sectionTitle}>Por enviar</Text>
              {filteredPending.length > 0 ? (
                <View style={s.countPill}>
                  <Text style={s.countPillText}>{filteredPending.length}</Text>
                </View>
              ) : null}
            </View>

            {(() => {
              if (filteredPending.length > 0) {
                return filteredPending.map((r) => (
                  <PendingReportCard
                    key={r.id}
                    report={r}
                    onPress={() => router.push(`/(app)/reports/${r.id}`)}
                    dateLocale={dateLocale}
                  />
                ));
              }
              if (hasActiveFilters) {
                return (
                  <Card>
                    <View style={s.emptySmallInner}>
                      <Search size={22} color={colors.fgQuaternary} strokeWidth={2} />
                      <Text style={s.emptySmallText}>{t('trips.noResultsFilter')}</Text>
                      <TouchableOpacity onPress={clearFilters}>
                        <Text style={s.clearBtn}>{t('trips.filterClearAll')}</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                );
              }
              return (
                <EmptyState
                  icon={reportIcon}
                  title={t('trips.noActiveTrips')}
                  description={t('trips.primerViajeDesc')}
                  buttonLabel={t('home.createFirst')}
                  onButtonPress={() => router.push('/(app)/reports/create')}
                />
              );
            })()}
          </View>
        ) : null}

        {filteredCompleted.length > 0 ? (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Clock size={12} color={colors.fgSecondary} strokeWidth={2} />
              <Text style={s.sectionTitle}>{t('trips.history')}</Text>
              <View style={s.countPill}>
                <Text style={s.countPillText}>{filteredCompleted.length}</Text>
              </View>
            </View>
            {visibleCompleted.map((r, idx) => (
              <HistoryRow
                key={r.id ?? `completed-${idx}`}
                report={r}
                onPress={() => router.push(`/(app)/reports/${r.id}`)}
                dateLocale={dateLocale}
              />
            ))}
            {hiddenCount > 0 && !showAllHistory ? (
              <TouchableOpacity
                onPress={() => setShowAllHistory(true)}
                style={s.seeAllBtn}
                activeOpacity={0.85}
              >
                <Text style={s.seeAllText}>Ver todos</Text>
                <View style={s.seeAllBadge}>
                  <Text style={s.seeAllBadgeText}>+{hiddenCount}</Text>
                </View>
                <ChevronDown size={14} color={colors.dark} strokeWidth={2} />
              </TouchableOpacity>
            ) : null}
            {showAllHistory && filteredCompleted.length > HISTORY_LIMIT ? (
              <TouchableOpacity
                onPress={() => setShowAllHistory(false)}
                style={s.seeAllBtn}
                activeOpacity={0.85}
              >
                <Text style={s.seeAllText}>Ver menos</Text>
                <ChevronUp size={14} color={colors.dark} strokeWidth={2} />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  pageHead: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 18,
    gap: 12,
  },
  pageHeadText: { flex: 1, minWidth: 0 },
  pageTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 34,
    color: colors.dark,
    letterSpacing: -1,
    lineHeight: 36,
  },
  pageSubtitle: {
    fontFamily: 'Manrope-Medium',
    fontSize: 13,
    color: colors.fgSecondary,
    marginTop: 6,
  },
  pageHeadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: colors.brand,
    borderRadius: 9999,
  },
  pageHeadBtnText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
    color: colors.fgOnBrand,
  },

  scroll: { padding: 20, paddingBottom: 120 },

  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: {
    flex: 1,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
    color: colors.dark,
    letterSpacing: -0.1,
  },
  countPill: {
    backgroundColor: colors.surfaceSunken,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  countPillText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
    color: colors.dark,
  },

  emptySmallInner: {
    alignItems: 'center',
    paddingVertical: 26,
    paddingHorizontal: 20,
    gap: 10,
  },
  emptySmallText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 13,
    color: colors.fgSecondary,
  },
  clearBtn: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
    color: colors.brand,
  },

  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 4,
  },
  seeAllText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
    color: colors.dark,
  },
  seeAllBadge: {
    backgroundColor: colors.brand,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  seeAllBadgeText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
    color: colors.fgOnBrand,
  },
});
