import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconFolder, IconChevronRight } from '@tabler/icons-react-native';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import {
  PixelCard,
  DARK,
  CARD_BG,
  SCREEN_BG,
  colors,
} from '../../../src/components/ui/PixelCard';
import { TicketDetailModal } from '../../../src/components/features/TicketDetailModal';
import { TicketsFilterPanel } from '../../../src/components/features/TicketsFilterPanel';
import { useTicketsScreen } from '../../../src/hooks/useTicketsScreen';
import { ticketIcon } from '@ticket-registrator/shared/assets';

export default function AllTicketsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const {
    tickets,
    isLoading,
    search, setSearch,
    ticketDate, setTicketDate,
    uploadDate, setUploadDate,
    reportFilter, setReportFilter,
    reportOptions,
    hasFilters,
    clearFilters,
    isDetailOpen, setIsDetailOpen,
    selectedTicket, setSelectedTicket,
    selectedReportId,
    handleTicketPress,
  } = useTicketsScreen();

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      );
    }

    if (tickets.length === 0) {
      return (
        <View style={s.centered}>
          <Image source={ticketIcon} style={s.emptyIcon} contentFit="contain" />
          <Text style={s.emptyTitle}>SIN TICKETS</Text>
          <Text style={s.emptyText}>
            {hasFilters
              ? 'No hay resultados para los filtros aplicados.'
              : 'Sube tickets desde tus reportes para verlos aquí.'}
          </Text>
        </View>
      );
    }

    return tickets.map(ticket => (
      <PixelCard
        key={ticket.id}
        bg={CARD_BG}
        shadowOffset={3}
        style={s.ticketCard}
        onPress={() => handleTicketPress(ticket)}
      >
        <View style={s.ticketRow}>
          <Image source={ticketIcon} style={s.ticketIcon} contentFit="contain" />

          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.ticketName} numberOfLines={1}>
              {ticket.location_name ?? t('reportDetail.noTicketName')}
            </Text>
            <View style={s.pillRow}>
              {ticket.expense_type ? (
                <View style={s.expensePill}>
                  <Text style={s.expenseText}>{ticket.expense_type}</Text>
                </View>
              ) : null}
              <View style={s.reportPill}>
                <IconFolder size={8} color={`${DARK}50`} />
                <Text style={s.reportPillText} numberOfLines={1}>{ticket.reportName}</Text>
              </View>
            </View>
          </View>

          <View style={s.ticketRight}>
            <Text style={s.ticketAmount}>
              {ticket.amount == null ? '—' : ticket.amount.toLocaleString()}
              {ticket.currency
                ? <Text style={s.ticketCurrency}> {ticket.currency}</Text>
                : null}
            </Text>
            <Text style={s.ticketDate}>
              {format(new Date(ticket.createdAt), 'dd/MM/yy')}
            </Text>
          </View>

          <IconChevronRight size={16} color={`${DARK}30`} style={{ marginLeft: 4 }} />
        </View>
      </PixelCard>
    ));
  };

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={CARD_BG} />
      <View style={{ height: insets.top, backgroundColor: CARD_BG }} />

      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>{t('layout.allTickets')}</Text>
        {tickets.length > 0 && (
          <View style={s.countPill}>
            <Text style={s.countPillText}>{tickets.length}</Text>
          </View>
        )}
      </View>

      {/* ── Filters ── */}
      <TicketsFilterPanel
        search={search} onSearch={setSearch}
        ticketDate={ticketDate} onTicketDate={(s, e) => setTicketDate({ start: s, end: e })}
        uploadDate={uploadDate} onUploadDate={(s, e) => setUploadDate({ start: s, end: e })}
        reportFilter={reportFilter} onReportFilter={setReportFilter}
        reports={reportOptions}
        hasFilters={hasFilters}
        onClear={clearFilters}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderContent()}
      </ScrollView>


      {selectedTicket && (
        <TicketDetailModal
          visible={isDetailOpen}
          onClose={() => { setIsDetailOpen(false); setSelectedTicket(null); }}
          ticket={selectedTicket}
          reportId={selectedReportId}
          reportName={selectedTicket.reportName}
          isEditable={false}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SCREEN_BG },

  // ── Header
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
  countPill: {
    backgroundColor: DARK,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  countPillText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    color: CARD_BG,
  },

  scroll: { padding: 20, paddingBottom: 60 },

  // ── Ticket cards
  ticketCard: { marginBottom: 10 },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 10,
  },
  ticketIcon: { width: 44, height: 44, flexShrink: 0 },
  ticketName: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 13,
    color: DARK,
    marginBottom: 4,
  },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  expensePill: {
    backgroundColor: `${colors.brand}18`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: colors.brand,
    borderRadius: 4,
  },
  expenseText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 8, color: colors.brand },
  reportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${DARK}08`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: 120,
  },
  reportPillText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 8,
    color: `${DARK}50`,
  },
  ticketRight: { alignItems: 'flex-end', flexShrink: 0 },
  ticketAmount: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: DARK },
  ticketCurrency: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 9, color: `${DARK}55` },
  ticketDate: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 9,
    color: `${DARK}40`,
    marginTop: 2,
  },

  // ── Empty / loading
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyIcon: { width: 64, height: 64, marginBottom: 12 },
  emptyTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 13,
    color: DARK,
    letterSpacing: 1,
    marginBottom: 6,
  },
  emptyText: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 11,
    color: `${DARK}50`,
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 220,
  },

});
