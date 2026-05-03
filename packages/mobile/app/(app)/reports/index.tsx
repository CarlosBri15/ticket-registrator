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
  IconPlus, 
  IconSend, 
  IconSearch, 
  IconClock, 
  IconChevronDown, 
  IconChevronUp 
} from '@tabler/icons-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';

import {
  PixelCard,
  DARK,
  CARD_BG,
  SCREEN_BG,
  BORDER_WIDTH,
  colors,
} from '../../../src/components/ui/PixelCard';
import { HeroReportCard, PendingReportCard, HistoryRow } from '../../../src/components/features/ReportListItem';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { ReportsFilterPanel } from '../../../src/components/features/ReportsFilterPanel';

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
    }, [])
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
      <StatusBar barStyle="dark-content" backgroundColor={CARD_BG} />

      {/* Rellena el área del notch/status bar con el color del header */}
      <View style={{ height: insets.top, backgroundColor: CARD_BG }} />

      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>{t('trips.title')}</Text>
        <PixelCard
          bg={colors.brand}
          shadowOffset={3}
          radius={8}
          active={isCreating}
          onPress={() => { setIsCreating(true); router.push('/(app)/reports/create'); }}
        >
          <View style={s.headerBtn}>
            <IconPlus size={20} color="white" />
          </View>
        </PixelCard>
      </View>

      {/* ── Filtros — fuera del scroll, chrome fijo ── */}
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

        {/* ── Sin reportes en absoluto ── */}
        {!isLoading && !reports?.length && (
          <EmptyState
            icon={reportIcon}
            title={t('trips.noTickets')}
            description={t('trips.primerViajeDesc')}
            buttonLabel={t('home.createFirst')}
            onButtonPress={() => router.push('/(app)/reports/create')}
          />
        )}

        {/* ── Reporte activo ── */}
        {currentReport && (
          <View style={s.section}>
            <HeroReportCard
              report={currentReport}
              onPress={() => router.push(`/(app)/reports/${currentReport.id}`)}
              dateLocale={dateLocale}
            />
          </View>
        )}

        {/* ── Por enviar ── */}
        {(filteredPending.length > 0 ||
          (!isLoading && !currentReport && (reports?.length ?? 0) > 0)) && (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <IconSend size={11} color={DARK} />
                <Text style={s.sectionTitle}>Por enviar</Text>
                {filteredPending.length > 0 && (
                  <View style={s.countPill}>
                    <Text style={s.countPillText}>{filteredPending.length}</Text>
                  </View>
                )}
              </View>

              {(() => {
                if (filteredPending.length > 0) {
                  return filteredPending.map(r => (
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
                    <PixelCard bg={CARD_BG} shadowOffset={3}>
                      <View style={s.emptySmallInner}>
                        <IconSearch size={22} color={`${DARK}40`} />
                        <Text style={s.emptySmallText}>{t('trips.noResultsFilter')}</Text>
                        <TouchableOpacity onPress={clearFilters}>
                          <Text style={s.clearBtn}>{t('trips.filterClearAll')}</Text>
                        </TouchableOpacity>
                      </View>
                    </PixelCard>
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
          )}


        {/* ── Historial — últimos 5 ── */}
        {filteredCompleted.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <IconClock size={11} color={DARK} />
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
            {hiddenCount > 0 && !showAllHistory && (
              <TouchableOpacity
                onPress={() => setShowAllHistory(true)}
                style={s.seeAllBtn}
              >
                <Text style={s.seeAllText}>Ver todos</Text>
                <View style={s.seeAllBadge}>
                  <Text style={s.seeAllBadgeText}>+{hiddenCount}</Text>
                </View>
                <IconChevronDown size={13} color={DARK} />
              </TouchableOpacity>
            )}
            {showAllHistory && filteredCompleted.length > HISTORY_LIMIT && (
              <TouchableOpacity
                onPress={() => setShowAllHistory(false)}
                style={s.seeAllBtn}
              >
                <Text style={s.seeAllText}>Ver menos</Text>
                <IconChevronUp size={13} color={DARK} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SCREEN_BG },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: CARD_BG,
    borderBottomWidth: 4,
    borderBottomColor: DARK,
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 24,
    color: DARK,
    letterSpacing: 0.5,
  },
  headerBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: { padding: 20, paddingBottom: 120 },

  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: {
    flex: 1,
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    color: DARK,
    letterSpacing: 0.3,
  },
  countPill: {
    backgroundColor: CARD_BG,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: BORDER_WIDTH,
    borderColor: DARK,
    borderRadius: 6,
  },
  countPillText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    color: DARK,
  },

  emptySmallInner: { alignItems: 'center', paddingVertical: 26, paddingHorizontal: 20, gap: 10 },
  emptySmallText: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 12,
    color: `${DARK}70`,
    letterSpacing: 0.2,
  },
  clearBtn: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    color: colors.brand,
    letterSpacing: 0.2,
  },

  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderTopWidth: BORDER_WIDTH,
    borderTopColor: `${DARK}12`,
    marginTop: 4,
  },
  seeAllText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    color: DARK,
    letterSpacing: 0.3,
  },
  seeAllBadge: {
    backgroundColor: DARK,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  seeAllBadgeText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 9,
    color: CARD_BG,
  },
});
