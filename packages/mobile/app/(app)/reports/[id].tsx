import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  IconClock,
  IconAlertCircle,
  IconArrowLeft,
  IconSend,
  IconCalendar,
  IconCamera,
  IconPhoto,
  IconFileDescription,
  IconChevronRight,
  IconX
} from '@tabler/icons-react-native';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import { TicketConfirmationForm } from '../../../src/components/features/TicketConfirmationForm';
import { TicketDetailModal } from '../../../src/components/features/TicketDetailModal';
import { ScanningOverlay } from '../../../src/components/features/ScanningOverlay';
import { colors } from '../../../src/constants/theme';
import {
  PixelCard,
  SCREEN_BG,
  DARK,
  CARD_BG,
  BORDER_WIDTH,
} from '../../../src/components/ui/PixelCard';

import { useReportDetailScreen } from '../../../src/hooks/useReportDetailScreen';
import { reportIcon, ticketIcon } from '@ticket-registrator/shared/assets';

// ── Financial Summary ──────────────────────────────────────────────────────────

type FinancialSummaryProps = {
  readonly status: string;
  readonly currency: string;
  readonly requestedAmount: number;
  readonly approvedAmount: number;
  readonly ticketsTotal: number;
};

const FinancialSummary = React.memo(({
  status, currency, requestedAmount, approvedAmount, ticketsTotal,
}: FinancialSummaryProps) => {
  const s = status.toUpperCase();

  if (s === 'CREATED' || s === 'DRAFT') {
    return (
      <View style={fs.wrap}>
        <Text style={fs.amountLabel}>Total</Text>
        <Text style={[fs.amount, { color: DARK }]}>{ticketsTotal.toFixed(2)}</Text>
        <Text style={fs.currency}>{currency}</Text>
      </View>
    );
  }
  if (s === 'SUBMITTED' || s === 'PENDING') {
    return (
      <View style={fs.wrap}>
        <Text style={fs.amountLabel}>Solicitado</Text>
        <Text style={[fs.amount, { color: '#d97706' }]}>{requestedAmount.toFixed(2)}</Text>
        <View style={fs.hintRow}>
          <IconClock size={11} color="#d97706" />
          <Text style={[fs.currency, { color: '#d97706' }]}>{currency}</Text>
        </View>
      </View>
    );
  }
  if (s === 'APPROVED' || s === 'PAID') {
    const rejected = Math.max(0, requestedAmount - approvedAmount);
    return (
      <View style={fs.splitWrap}>
        <View style={fs.splitCol}>
          <Text style={fs.amountLabel}>Aprobado</Text>
          <Text style={[fs.amountSplit, { color: '#059669' }]}>{approvedAmount.toFixed(2)}</Text>
          <Text style={[fs.currency, { color: '#059669' }]}>{currency}</Text>
        </View>
        <View style={fs.splitDivider} />
        <View style={fs.splitCol}>
          <Text style={fs.amountLabel}>Rechazado</Text>
          <Text style={[fs.amountSplit, { color: rejected > 0 ? '#dc2626' : `${DARK}40` }]}>
            {rejected.toFixed(2)}
          </Text>
          <Text style={[fs.currency, { color: rejected > 0 ? '#dc2626' : `${DARK}40` }]}>{currency}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={fs.wrap}>
      <Text style={fs.amountLabel}>Declinado</Text>
      <Text style={[fs.amount, { color: '#dc2626' }]}>{requestedAmount.toFixed(2)}</Text>
      <Text style={[fs.currency, { color: '#dc2626' }]}>{currency}</Text>
    </View>
  );
});

const fs = StyleSheet.create({
  wrap: { alignItems: 'flex-end' },
  amountLabel: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 9, color: `${DARK}55`, letterSpacing: 0.2, marginBottom: 2 },
  amount: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 28, letterSpacing: -0.8, lineHeight: 32 },
  amountSplit: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, letterSpacing: -0.5, marginBottom: 2 },
  currency: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 10, color: `${DARK}55`, letterSpacing: 0.2 },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  splitWrap: { flexDirection: 'row', alignItems: 'flex-start' },
  splitCol: { alignItems: 'flex-end', paddingHorizontal: 10 },
  splitDivider: { width: 2, backgroundColor: DARK, alignSelf: 'stretch', opacity: 0.1 },
});

// ── Screen ─────────────────────────────────────────────────────────────────────

export default function ReportDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    report,
    tickets,
    loadingReport,
    loadingTickets,
    isUploading,
    isConfirming,
    isSubmitting,
    isModalOpen,
    extractedTicket,
    selectedTicket,
    setSelectedTicket,
    isDetailOpen,
    setIsDetailOpen,
    dateLocale,
    pickFromCamera,
    pickFromGallery,
    handleConfirm,
    handleDiscard,
    handleSubmit,
    isEditable,
    canSubmit,
    ticketsTotal,
  } = useReportDetailScreen(id ?? '');

  if (loadingReport) {
    return (
      <View style={[s.screen, s.centered]}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={[s.screen, s.centered]}>
        <PixelCard bg="#FEF2F2" shadowOffset={4}>
          <View style={s.errorInner}>
            <IconAlertCircle size={32} color="#dc2626" />
            <Text style={s.errorTitle}>{t('reportDetail.errorLoading')}</Text>
            <Text style={s.errorText}>{t('reportDetail.errorDesc')}</Text>
            <PixelCard bg={colors.brand} shadowOffset={3} onPress={() => router.back()}>
              <View style={s.errorBtnInner}>
                <Text style={s.errorBtnText}>{t('common.cancel')}</Text>
              </View>
            </PixelCard>
          </View>
        </PixelCard>
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={CARD_BG} />
      <View style={{ height: insets.top, backgroundColor: CARD_BG }} />

      {/* ── Header ── */}
      <View style={s.header}>
        <PixelCard bg={CARD_BG} shadowOffset={3} radius={8} onPress={() => router.back()}>
          <View style={s.iconBtnInner}>
            <IconArrowLeft size={18} color={DARK} />
          </View>
        </PixelCard>

        <Image source={reportIcon} style={s.headerIcon} contentFit="contain" />

        <View style={s.headerMid}>
          <Text style={s.headerTitle} numberOfLines={1}>{report.name}</Text>
        </View>

        {canSubmit && (
          <PixelCard
            bg={colors.secondary}
            shadowOffset={3}
            radius={8}
            onPress={isSubmitting ? undefined : handleSubmit}
            style={isSubmitting ? { opacity: 0.65 } : undefined}
          >
            <View style={s.iconBtnInner}>
              {isSubmitting
                ? <ActivityIndicator size="small" color={DARK} />
                : <IconSend size={16} color={DARK} />
              }
            </View>
          </PixelCard>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Info card ── */}
        <PixelCard bg={CARD_BG} shadowOffset={5} style={{ marginBottom: 24 }}>
          <View style={s.infoTop}>
            <View style={{ flex: 1 }}>
              <View style={s.dateRow}>
                <IconCalendar size={12} color={`${DARK}80`} />
                <Text style={s.dateText}>
                  {format(new Date(report.start_date), 'd MMM', { locale: dateLocale })}
                  {'  →  '}
                  {format(new Date(report.end_date), 'd MMM yyyy', { locale: dateLocale })}
                </Text>
              </View>
              <View style={{ marginTop: 10 }}>
                <StatusBadge status={report.status} />
              </View>
            </View>
            <FinancialSummary
              status={report.status}
              currency={report.currency}
              requestedAmount={report.requested_amount ?? 0}
              approvedAmount={report.approved_amount ?? 0}
              ticketsTotal={ticketsTotal}
            />
          </View>

          {isEditable && (
            <>
              <View style={s.infoDivider} />
              <View style={s.uploadRow}>
                <PixelCard
                  bg={colors.brand}
                  shadowOffset={3}
                  style={[s.uploadPrimary, isUploading && { opacity: 0.55 }]}
                  onPress={isUploading ? undefined : pickFromCamera}
                >
                  <View style={s.uploadBtnInner}>
                    {isUploading ? (
                      <>
                        <ActivityIndicator size="small" color="white" />
                        <Text style={s.uploadPrimaryText}>Procesando...</Text>
                      </>
                    ) : (
                      <>
                        <IconCamera size={16} color="white" />
                        <Text style={s.uploadPrimaryText}>{t('reportDetail.scanTicket')}</Text>
                      </>
                    )}
                  </View>
                </PixelCard>
                <PixelCard
                  bg={CARD_BG}
                  shadowOffset={3}
                  style={s.uploadSecondary}
                  onPress={isUploading ? undefined : pickFromGallery}
                >
                  <View style={s.uploadBtnInner}>
                    <IconPhoto size={16} color={DARK} />
                    <Text style={s.uploadSecondaryText}>Galería</Text>
                  </View>
                </PixelCard>
              </View>
            </>
          )}
        </PixelCard>

        {/* ── Tickets ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <IconFileDescription size={11} color={DARK} />
            <Text style={s.sectionTitle}>{t('reportDetail.ticketsTitle')}</Text>
            <View style={s.countPill}>
              <Text style={s.countPillText}>{tickets?.length ?? 0}</Text>
            </View>
          </View>

          {(() => {
            if (loadingTickets) {
              return <ActivityIndicator color={colors.brand} style={{ marginVertical: 24 }} />;
            }
            if (tickets && tickets.length > 0) {
              return tickets.map((ticket, idx) => (
                <PixelCard
                  key={ticket.id ?? `ticket-${idx}`}
                  bg={CARD_BG}
                  shadowOffset={3}
                  style={{ marginBottom: 8 }}
                  onPress={() => { setSelectedTicket(ticket); setIsDetailOpen(true); }}
                >
                  <View style={s.ticketRow}>
                    <Image source={ticketIcon} style={s.ticketIcon} contentFit="contain" />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={s.ticketName} numberOfLines={1}>
                        {ticket.location_name ?? t('reportDetail.noTicketName')}
                      </Text>
                      <View style={s.ticketMeta}>
                        {ticket.date && (
                          <Text style={s.ticketDate}>
                            {format(new Date(ticket.date), 'dd MMM yyyy', { locale: dateLocale })}
                          </Text>
                        )}
                        {ticket.expense_type && (
                          <View style={s.expensePill}>
                            <Text style={s.expenseText}>{ticket.expense_type}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={s.ticketAmount}>
                        {ticket.amount == null ? '—' : ticket.amount.toLocaleString()}
                        <Text style={s.ticketCurrency}> {ticket.currency}</Text>
                      </Text>
                    </View>
                    <IconChevronRight size={16} color={`${DARK}40`} style={{ marginLeft: 4 }} />
                  </View>
                </PixelCard>
              ));
            }
            return (
              <PixelCard
                bg={CARD_BG}
                shadowOffset={4}
                onPress={isEditable ? pickFromCamera : undefined}
              >
                <View style={s.emptyInner}>
                  <Image source={ticketIcon} style={s.emptyIcon} contentFit="contain" />
                  <Text style={s.emptyTitle}>{t('reportDetail.startDigitalizing')}</Text>
                  <Text style={s.emptyText}>{t('reportDetail.digitalizeDesc')}</Text>
                </View>
              </PixelCard>
            );
          })()}
        </View>
      </ScrollView>

      {selectedTicket && (
        <TicketDetailModal
          visible={isDetailOpen}
          onClose={() => { setIsDetailOpen(false); setSelectedTicket(null); }}
          ticket={selectedTicket}
          reportId={report.id}
          reportName={report.name}
          isEditable={!!isEditable}
        />
      )}

      <Modal
        visible={isModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleDiscard}
      >
        <View style={{ flex: 1, backgroundColor: CARD_BG }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={s.modalHandle} />
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{t('upload.confirmTitle')}</Text>
              <PixelCard bg={colors.danger} shadowOffset={3} radius={8} onPress={handleDiscard}>
                <View style={s.iconBtnInner}>
                  <IconX size={15} color="white" />
                </View>
              </PixelCard>
            </View>
            <View style={{ flex: 1, backgroundColor: SCREEN_BG }}>
              {extractedTicket && (
                <TicketConfirmationForm
                  ticket={extractedTicket}
                  onConfirm={handleConfirm}
                  onCancel={handleDiscard}
                  isLoading={isConfirming}
                />
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <ScanningOverlay visible={isUploading} />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SCREEN_BG },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  scroll: { padding: 20, paddingBottom: 52 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: CARD_BG,
    borderBottomWidth: 4,
    borderBottomColor: DARK,
  },
  iconBtnInner: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: { width: 44, height: 44 },
  headerMid: { flex: 1, minWidth: 0 },
  headerTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: DARK },

  // Info card
  infoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, color: DARK },
  infoDivider: {
    height: 4,
    backgroundColor: DARK,
    marginBottom: 14,
    opacity: 0.06,
  },
  uploadRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 16 },
  uploadPrimary: { flex: 2 },
  uploadSecondary: { flex: 1 },
  uploadBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 13,
  },
  uploadPrimaryText: { color: 'white', fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, letterSpacing: 0.2 },
  uploadSecondaryText: { color: DARK, fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, letterSpacing: 0.2 },

  // Section
  section: { marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { flex: 1, fontFamily: 'SpaceGrotesk-Bold', fontSize: 12, color: DARK, letterSpacing: 0.3 },
  countPill: {
    backgroundColor: CARD_BG,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: BORDER_WIDTH,
    borderColor: DARK,
    borderRadius: 6,
  },
  countPillText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 10, color: DARK },

  // Ticket rows
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 10,
  },
  ticketIcon: { width: 44, height: 44 },
  ticketName: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, color: DARK, marginBottom: 3 },
  ticketMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ticketDate: { fontFamily: 'SpaceGrotesk-Medium', fontSize: 9, color: `${DARK}60` },
  expensePill: {
    backgroundColor: `${colors.brand}18`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: colors.brand,
    borderRadius: 4,
  },
  expenseText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 8, color: colors.brand },
  ticketAmount: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: DARK },
  ticketCurrency: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 8, color: `${DARK}55` },

  // Empty state
  emptyInner: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24, gap: 8 },
  emptyIcon: { width: 64, height: 64, marginBottom: 4 },
  emptyTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: DARK, letterSpacing: 0.3 },
  emptyText: { fontFamily: 'SpaceGrotesk-Medium', fontSize: 11, color: `${DARK}60`, textAlign: 'center', lineHeight: 16 },

  // Error state
  errorInner: { alignItems: 'center', padding: 24, gap: 10 },
  errorTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: DARK, textAlign: 'center' },
  errorText: { fontFamily: 'SpaceGrotesk-Medium', fontSize: 11, color: `${DARK}60`, textAlign: 'center' },
  errorBtnInner: { paddingHorizontal: 20, paddingVertical: 10 },
  errorBtnText: { color: 'white', fontFamily: 'SpaceGrotesk-Bold', fontSize: 12, letterSpacing: 0.2 },

  // Modal confirmation
  modalHandle: {
    width: 48,
    height: 6,
    backgroundColor: DARK,
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: CARD_BG,
    borderBottomWidth: 4,
    borderBottomColor: DARK,
  },
  modalTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: DARK, letterSpacing: 0.3 },
});
