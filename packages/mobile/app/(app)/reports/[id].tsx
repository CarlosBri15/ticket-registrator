import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Clock,
  AlertCircle,
  ArrowLeft,
  Send,
  Calendar,
  Camera,
  ImageIcon,
  FileText,
  ChevronRight,
  Trash2,
  X,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { buildCategoryMixFromItems } from '@ticket-registrator/shared';

import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import { Card } from '../../../src/components/ui/Card';
import { CategoryMixBar } from '../../../src/components/ui/CategoryMixBar';
import { TicketConfirmationForm } from '../../../src/components/features/TicketConfirmationForm';
import { TicketDetailModal } from '../../../src/components/features/TicketDetailModal';
import { ScanningOverlay } from '../../../src/components/features/ScanningOverlay';
import { colors } from '../../../src/constants/theme';

import { useReportDetailScreen } from '../../../src/hooks/useReportDetailScreen';

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
  const key = status.toUpperCase();

  if (key === 'CREATED' || key === 'DRAFT') {
    return (
      <View style={fs.wrap}>
        <Text style={fs.amountLabel}>Total</Text>
        <Text style={[fs.amount, { color: colors.dark }]}>{ticketsTotal.toFixed(2)}</Text>
        <Text style={fs.currency}>{currency}</Text>
      </View>
    );
  }
  if (key === 'SUBMITTED' || key === 'PENDING') {
    return (
      <View style={fs.wrap}>
        <Text style={fs.amountLabel}>Solicitado</Text>
        <Text style={[fs.amount, { color: colors.warning }]}>{requestedAmount.toFixed(2)}</Text>
        <View style={fs.hintRow}>
          <Clock size={11} color={colors.warning} strokeWidth={2} />
          <Text style={[fs.currency, { color: colors.warning }]}>{currency}</Text>
        </View>
      </View>
    );
  }
  if (key === 'APPROVED' || key === 'PAID') {
    const rejected = Math.max(0, requestedAmount - approvedAmount);
    return (
      <View style={fs.splitWrap}>
        <View style={fs.splitCol}>
          <Text style={fs.amountLabel}>Aprobado</Text>
          <Text style={[fs.amountSplit, { color: colors.success }]}>{approvedAmount.toFixed(2)}</Text>
          <Text style={[fs.currency, { color: colors.success }]}>{currency}</Text>
        </View>
        <View style={fs.splitDivider} />
        <View style={fs.splitCol}>
          <Text style={fs.amountLabel}>Rechazado</Text>
          <Text style={[fs.amountSplit, { color: rejected > 0 ? colors.danger : colors.fgQuaternary }]}>
            {rejected.toFixed(2)}
          </Text>
          <Text style={[fs.currency, { color: rejected > 0 ? colors.danger : colors.fgQuaternary }]}>{currency}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={fs.wrap}>
      <Text style={fs.amountLabel}>Declinado</Text>
      <Text style={[fs.amount, { color: colors.danger }]}>{requestedAmount.toFixed(2)}</Text>
      <Text style={[fs.currency, { color: colors.danger }]}>{currency}</Text>
    </View>
  );
});
FinancialSummary.displayName = 'FinancialSummary';

const fs = StyleSheet.create({
  wrap: { alignItems: 'flex-end' },
  amountLabel: { fontFamily: 'Manrope-SemiBold', fontSize: 11, color: colors.fgSecondary, marginBottom: 2 },
  amount: { fontFamily: 'Manrope-Bold', fontSize: 28, letterSpacing: -0.8, lineHeight: 32 },
  amountSplit: { fontFamily: 'Manrope-Bold', fontSize: 20, letterSpacing: -0.5, marginBottom: 2 },
  currency: { fontFamily: 'Manrope-SemiBold', fontSize: 12, color: colors.fgSecondary },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  splitWrap: { flexDirection: 'row', alignItems: 'flex-start' },
  splitCol: { alignItems: 'flex-end', paddingHorizontal: 10 },
  splitDivider: { width: 1, backgroundColor: colors.border, alignSelf: 'stretch' },
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
    handleDeleteReport,
    isDeleting,
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
        <Card bg={colors.dangerBg} borderColor={colors.dangerBorder}>
          <View style={s.errorInner}>
            <AlertCircle size={28} color={colors.danger} strokeWidth={2} />
            <Text style={s.errorTitle}>{t('reportDetail.errorLoading')}</Text>
            <Text style={s.errorText}>{t('reportDetail.errorDesc')}</Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => router.back()}
              activeOpacity={0.85}
              style={s.errorBtn}
            >
              <Text style={s.errorBtnText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surfaceCard} />
      <View style={{ height: insets.top, backgroundColor: colors.surfaceCard }} />

      {/* ── Page header — single row: back · title · delete · submit ── */}
      <View style={s.pageHead}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="back"
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={s.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={18} color={colors.dark} strokeWidth={2} />
        </TouchableOpacity>

        <Text style={s.pageTitle} numberOfLines={1}>{report.name}</Text>

        {isEditable ? (
          <View style={s.actionsRow}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('common.delete')}
              onPress={isDeleting ? undefined : () => handleDeleteReport(() => router.back())}
              disabled={isDeleting}
              activeOpacity={0.85}
              style={[s.btnDangerIcon, isDeleting && s.btnDisabled]}
            >
              {isDeleting
                ? <ActivityIndicator size="small" color={colors.fgOnBrand} />
                : <Trash2 size={16} color={colors.fgOnBrand} strokeWidth={2} />}
            </TouchableOpacity>

            {canSubmit ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t('common.submit', { defaultValue: 'Enviar' })}
                onPress={isSubmitting ? undefined : handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
                style={[s.btnPrimary, isSubmitting && s.btnDisabled]}
              >
                {isSubmitting
                  ? <ActivityIndicator size="small" color={colors.fgOnBrand} />
                  : <Send size={14} color={colors.fgOnBrand} strokeWidth={2} />}
                <Text style={s.btnPrimaryText}>{t('common.submit', { defaultValue: 'Enviar' })}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Card style={{ marginBottom: 24 }}>
          <View style={s.infoTop}>
            <View style={{ flex: 1 }}>
              <View style={s.dateRow}>
                <Calendar size={12} color={colors.fgSecondary} strokeWidth={2} />
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

          {isEditable ? (
            <>
              <View style={s.infoDivider} />
              <View style={s.uploadRow}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={t('reportDetail.scanTicket')}
                  onPress={isUploading ? undefined : pickFromCamera}
                  disabled={isUploading}
                  activeOpacity={0.85}
                  style={[s.uploadPrimary, isUploading && { opacity: 0.55 }]}
                >
                  {isUploading ? (
                    <>
                      <ActivityIndicator size="small" color={colors.fgOnBrand} />
                      <Text style={s.uploadPrimaryText}>Procesando...</Text>
                    </>
                  ) : (
                    <>
                      <Camera size={16} color={colors.fgOnBrand} strokeWidth={2} />
                      <Text style={s.uploadPrimaryText}>{t('reportDetail.scanTicket')}</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="open gallery"
                  onPress={isUploading ? undefined : pickFromGallery}
                  activeOpacity={0.85}
                  style={s.uploadSecondary}
                >
                  <ImageIcon size={16} color={colors.dark} strokeWidth={2} />
                  <Text style={s.uploadSecondaryText}>Galería</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}
        </Card>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <FileText size={12} color={colors.fgSecondary} strokeWidth={2} />
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
              return tickets.map((ticket, idx) => {
                const mix = buildCategoryMixFromItems(
                  ticket.items,
                  t('reports.uncategorized', { defaultValue: 'Sin categoría' }),
                );
                const itemsLabel = `${ticket.items?.length ?? 0} ${t('reportDetail.items', { defaultValue: 'items' })}`;
                return (
                  <Card
                    key={ticket.id ?? `ticket-${idx}`}
                    style={s.ticketCardWrap}
                    onPress={() => { setSelectedTicket(ticket); setIsDetailOpen(true); }}
                    accessibilityLabel={ticket.location_name ?? t('reportDetail.noTicketName')}
                  >
                    <View style={s.ticketRow}>
                      <View style={s.ticketIconBox}>
                        <FileText size={18} color={colors.dark} strokeWidth={2} />
                      </View>
                      <View style={s.ticketBody}>
                        <Text style={s.ticketName} numberOfLines={1}>
                          {ticket.location_name ?? t('reportDetail.noTicketName')}
                        </Text>
                        <Text style={s.ticketMeta} numberOfLines={1}>
                          {itemsLabel}
                          {ticket.date ? (
                            <Text>
                              <Text style={s.ticketMetaSep}> · </Text>
                              {format(new Date(ticket.date), 'dd MMM yyyy', { locale: dateLocale })}
                            </Text>
                          ) : null}
                        </Text>
                        {mix.length > 0 ? (
                          <View style={s.ticketMix}>
                            <CategoryMixBar segments={mix} maxLegendItems={3} />
                          </View>
                        ) : null}
                      </View>
                      <View style={s.ticketRight}>
                        <Text style={s.ticketAmount}>
                          {ticket.amount == null ? '—' : ticket.amount.toLocaleString()}
                          <Text style={s.ticketCurrency}> {ticket.currency}</Text>
                        </Text>
                        <ChevronRight size={16} color={colors.fgQuaternary} strokeWidth={2} />
                      </View>
                    </View>
                  </Card>
                );
              });
            }
            return (
              <Card onPress={isEditable ? pickFromCamera : undefined}>
                <View style={s.emptyInner}>
                  <View style={s.emptyIconBox}>
                    <FileText size={20} color={colors.fgTertiary} strokeWidth={2} />
                  </View>
                  <Text style={s.emptyTitle}>{t('reportDetail.startDigitalizing')}</Text>
                  <Text style={s.emptyText}>{t('reportDetail.digitalizeDesc')}</Text>
                </View>
              </Card>
            );
          })()}
        </View>
      </ScrollView>

      {selectedTicket ? (
        <TicketDetailModal
          visible={isDetailOpen}
          onClose={() => { setIsDetailOpen(false); setSelectedTicket(null); }}
          ticket={selectedTicket}
          reportId={report.id}
          reportName={report.name}
          isEditable={!!isEditable}
        />
      ) : null}

      <Modal
        visible={isModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleDiscard}
      >
        <View style={{ flex: 1, backgroundColor: colors.surfaceCard }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={s.modalHandle} />
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{t('upload.confirmTitle')}</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="close"
                onPress={handleDiscard}
                style={s.modalCloseBtn}
                activeOpacity={0.7}
              >
                <X size={16} color={colors.fgSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.surface }}>
              {extractedTicket ? (
                <TicketConfirmationForm
                  ticket={extractedTicket}
                  onConfirm={handleConfirm}
                  onCancel={handleDiscard}
                  isLoading={isConfirming}
                />
              ) : null}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <ScanningOverlay visible={isUploading} />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  scroll: { padding: 20, paddingBottom: 52 },

  // Page header (single horizontal row: back · title · actions)
  pageHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: colors.surface,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pageTitle: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Manrope-Bold',
    fontSize: 22,
    color: colors.dark,
    letterSpacing: -0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  btnDangerIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    borderRadius: 9999,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: colors.brand,
    borderRadius: 9999,
  },
  btnPrimaryText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
    color: colors.fgOnBrand,
  },
  btnDisabled: {
    opacity: 0.65,
  },

  // Info card
  infoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontFamily: 'Manrope-Medium', fontSize: 12, color: colors.dark },
  infoDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 14,
  },
  uploadRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 16 },
  uploadPrimary: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: colors.brand,
    borderRadius: 9999,
  },
  uploadSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9999,
  },
  uploadPrimaryText: { color: colors.fgOnBrand, fontFamily: 'Manrope-SemiBold', fontSize: 12 },
  uploadSecondaryText: { color: colors.dark, fontFamily: 'Manrope-SemiBold', fontSize: 12 },

  // Section
  section: { marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { flex: 1, fontFamily: 'Manrope-SemiBold', fontSize: 13, color: colors.dark, letterSpacing: -0.1 },
  countPill: {
    backgroundColor: colors.surfaceSunken,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  countPillText: { fontFamily: 'Manrope-SemiBold', fontSize: 11, color: colors.dark },

  // Ticket rows (stacked cards)
  ticketCardWrap: { marginBottom: 8 },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  ticketIconBox: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ticketBody: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  ticketName: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 14,
    color: colors.dark,
  },
  ticketMeta: {
    fontFamily: 'Manrope-Medium',
    fontSize: 11,
    color: colors.fgSecondary,
  },
  ticketMetaSep: { color: colors.fgQuaternary },
  ticketMix: { marginTop: 2 },
  ticketRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
    gap: 4,
    flexDirection: 'row',
  },
  ticketAmount: {
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
    color: colors.dark,
    letterSpacing: -0.2,
  },
  ticketCurrency: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
    color: colors.fgSecondary,
  },

  // Empty state
  emptyInner: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24, gap: 8 },
  emptyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontFamily: 'Manrope-SemiBold', fontSize: 14, color: colors.dark },
  emptyText: { fontFamily: 'Manrope-Medium', fontSize: 12, color: colors.fgSecondary, textAlign: 'center', lineHeight: 18 },

  // Error state
  errorInner: { alignItems: 'center', padding: 24, gap: 10 },
  errorTitle: { fontFamily: 'Manrope-SemiBold', fontSize: 14, color: colors.dark, textAlign: 'center' },
  errorText: { fontFamily: 'Manrope-Medium', fontSize: 12, color: colors.fgSecondary, textAlign: 'center' },
  errorBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.brand,
    borderRadius: 9999,
  },
  errorBtnText: { color: colors.fgOnBrand, fontFamily: 'Manrope-SemiBold', fontSize: 13 },

  // Modal confirmation
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.overlayMedium,
    alignSelf: 'center',
    marginTop: 10,
    borderRadius: 9999,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: colors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { fontFamily: 'Manrope-Bold', fontSize: 18, color: colors.dark, letterSpacing: -0.2 },
  modalCloseBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
});
