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
import { Folder, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import { Card } from '../../../src/components/ui/Card';
import { TicketDetailModal } from '../../../src/components/features/TicketDetailModal';
import { TicketsFilterPanel } from '../../../src/components/features/TicketsFilterPanel';
import { colors } from '../../../src/constants/theme';
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
          <Text style={s.emptyTitle}>Sin tickets</Text>
          <Text style={s.emptyText}>
            {hasFilters
              ? 'No hay resultados para los filtros aplicados.'
              : 'Sube tickets desde tus reportes para verlos aquí.'}
          </Text>
        </View>
      );
    }

    return tickets.map((ticket) => (
      <Card
        key={ticket.id}
        style={s.ticketCard}
        onPress={() => handleTicketPress(ticket)}
        accessibilityLabel={ticket.location_name ?? t('reportDetail.noTicketName')}
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
                <Folder size={10} color={colors.fgSecondary} strokeWidth={2} />
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

          <ChevronRight size={16} color={colors.fgQuaternary} strokeWidth={2} style={{ marginLeft: 4 }} />
        </View>
      </Card>
    ));
  };

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surfaceCard} />
      <View style={{ height: insets.top, backgroundColor: colors.surfaceCard }} />

      <View style={s.pageHead}>
        <View style={s.pageHeadText}>
          <Text style={s.pageTitle}>{t('layout.allTickets')}</Text>
          <Text style={s.pageSubtitle}>
            {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
          </Text>
        </View>
      </View>

      <TicketsFilterPanel
        search={search} onSearch={setSearch}
        ticketDate={ticketDate} onTicketDate={(start, end) => setTicketDate({ start, end })}
        uploadDate={uploadDate} onUploadDate={(start, end) => setUploadDate({ start, end })}
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

      {selectedTicket ? (
        <TicketDetailModal
          visible={isDetailOpen}
          onClose={() => { setIsDetailOpen(false); setSelectedTicket(null); }}
          ticket={selectedTicket}
          reportId={selectedReportId}
          reportName={selectedTicket.reportName}
          isEditable={false}
        />
      ) : null}
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
    backgroundColor: colors.surface,
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

  scroll: { padding: 20, paddingBottom: 60 },

  // ── Ticket card
  ticketCard: { marginBottom: 10 },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  ticketIcon: { width: 40, height: 40, flexShrink: 0 },
  ticketName: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 14,
    color: colors.dark,
    marginBottom: 4,
  },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  expensePill: {
    backgroundColor: colors.overlayLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  expenseText: { fontFamily: 'Manrope-SemiBold', fontSize: 10, color: colors.dark },
  reportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.overlayFaint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    maxWidth: 140,
  },
  reportPillText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 10,
    color: colors.fgSecondary,
  },
  ticketRight: { alignItems: 'flex-end', flexShrink: 0 },
  ticketAmount: { fontFamily: 'Manrope-Bold', fontSize: 14, color: colors.dark },
  ticketCurrency: { fontFamily: 'Manrope-SemiBold', fontSize: 10, color: colors.fgSecondary },
  ticketDate: {
    fontFamily: 'Manrope-Medium',
    fontSize: 11,
    color: colors.fgTertiary,
    marginTop: 2,
  },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyIcon: { width: 56, height: 56, marginBottom: 12, opacity: 0.7 },
  emptyTitle: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 15,
    color: colors.dark,
    letterSpacing: -0.1,
    marginBottom: 6,
  },
  emptyText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 12,
    color: colors.fgSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 240,
  },
});
