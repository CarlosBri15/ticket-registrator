import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useReportQuery,
  useTicketsQuery,
  useUploadTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
  useSubmitReportMutation,
  ReportStatus,
} from '@ticket-registrator/shared';
import type { ITicket } from '@ticket-registrator/shared';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { TicketConfirmationForm } from '../../../src/components/TicketConfirmationForm';
import { TicketDetailModal } from '../../../src/components/TicketDetailModal';
import { mt, colors } from '../../../src/styles/theme';

const reportIcon = require('../../../../shared/src/assets/report.png') as number;
const ticketIcon = require('../../../../shared/src/assets/ticket.png') as number;

// ── Color tokens (match frontend theme) ──────────────────────────────────────
const C = {
  success:       '#059669',
  successBg:     'rgba(5,150,105,0.08)',
  successBorder: 'rgba(5,150,105,0.2)',
  warning:       '#d97706',
  warningBg:     'rgba(217,119,6,0.08)',
  warningBorder: 'rgba(217,119,6,0.2)',
  danger:        '#dc2626',
  dangerBg:      'rgba(220,38,38,0.08)',
  dangerBorder:  'rgba(220,38,38,0.2)',
  brandBg:       'rgba(91,143,203,0.08)',
  brandBorder:   'rgba(91,143,203,0.2)',
};

// ── FinancialSummary — adapts to report status ────────────────────────────────

type FinancialSummaryProps = {
  status: string;
  currency: string;
  requestedAmount: number;
  approvedAmount: number;
  ticketsTotal: number;
  ticketCount: number;
  t: (k: string) => string;
};

function FinancialSummary({
  status, currency, requestedAmount, approvedAmount,
  ticketsTotal, ticketCount, t,
}: FinancialSummaryProps) {
  const s = status.toUpperCase();

  // ── CREATED / DRAFT ──
  if (s === 'CREATED' || s === 'DRAFT') {
    return (
      <View style={fStyles.wrap}>
        <Text style={[fStyles.amount, { color: '#1e293b' }]}>
          {ticketsTotal.toFixed(2)}
        </Text>
        <Text style={fStyles.currencyLabel}>{currency}</Text>
      </View>
    );
  }

  // ── SUBMITTED / PENDING ──
  if (s === 'SUBMITTED' || s === 'PENDING') {
    return (
      <View style={fStyles.wrap}>
        <Text style={[fStyles.amount, { color: C.warning }]}>
          {requestedAmount.toFixed(2)}
        </Text>
        <View style={fStyles.hintRow}>
          <Feather name="clock" size={14} color={C.warning} />
          <Text style={[fStyles.currencyLabel, { color: C.warning }]}>{currency}</Text>
        </View>
      </View>
    );
  }

  // ── APPROVED / PAID ──
  if (s === 'APPROVED' || s === 'PAID') {
    const rejectedAmount = Math.max(0, requestedAmount - approvedAmount);
    return (
      <View style={fStyles.splitWrap}>
        <View style={fStyles.splitCol}>
          <Text style={[fStyles.amountSplit, { color: C.success }]}>
            {approvedAmount.toFixed(2)}
          </Text>
          <View style={fStyles.hintRow}>
            <Feather name="check" size={14} color={C.success} />
            <Text style={[fStyles.currencyLabel, { color: C.success }]}>{currency}</Text>
          </View>
        </View>
        <View style={fStyles.splitDivider} />
        <View style={fStyles.splitCol}>
          <Text style={[fStyles.amountSplit, { color: rejectedAmount > 0 ? C.danger : '#94a3b8' }]}>
            {rejectedAmount.toFixed(2)}
          </Text>
          <View style={fStyles.hintRow}>
            <Feather name="x" size={14} color={rejectedAmount > 0 ? C.danger : '#cbd5e1'} />
            <Text style={[fStyles.currencyLabel, { color: rejectedAmount > 0 ? C.danger : '#94a3b8' }]}>{currency}</Text>
          </View>
        </View>
      </View>
    );
  }

  // ── DECLINED ──
  return (
    <View style={fStyles.wrap}>
      <Text style={[fStyles.amount, { color: C.danger }]}>
        {requestedAmount.toFixed(2)}
      </Text>
      <View style={fStyles.hintRow}>
        <Feather name="x-circle" size={14} color={C.danger} />
        <Text style={[fStyles.currencyLabel, { color: C.danger }]}>{currency}</Text>
      </View>
    </View>
  );
}

const fStyles = StyleSheet.create({
  wrap: {
    paddingTop: 4,
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  amount: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  amountSplit: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  currency: {
    fontSize: 14,
    fontWeight: '500',
  },
  currencyLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.4,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  hint: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  splitWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 4,
    justifyContent: 'flex-end',
  },
  splitCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  splitDivider: {
    width: 1,
    backgroundColor: '#f1f5f9',
    alignSelf: 'stretch',
    marginHorizontal: 16,
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const buildFormData = (uri: string): FormData => {
  const formData = new FormData();
  const filename = uri.split('/').pop() ?? 'ticket.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  formData.append('image', { uri, name: filename, type } as any);
  return formData;
};

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ReportDetailScreen() {
  const { t, i18n } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [extractedTicket, setExtractedTicket] = useState<ITicket | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<ITicket | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: report, isLoading: loadingReport } = useReportQuery(id);
  const { data: tickets, isLoading: loadingTickets } = useTicketsQuery(id!);

  const dateLocale = i18n.language.startsWith('es') ? es : enUS;

  const { mutate: uploadTicket, isPending: isUploading } = useUploadTicketMutation({
    onSuccess: (ticket: ITicket) => { setExtractedTicket(ticket); setIsModalOpen(true); },
    onError: (error: any) => Alert.alert(t('common.error'), error?.response?.data?.message ?? t('common.error')),
  });

  const { mutate: updateTicket, isPending: isConfirming } = useUpdateTicketMutation({
    onSuccess: () => { setIsModalOpen(false); setExtractedTicket(null); },
    onError: () => Alert.alert(t('common.error'), t('common.error')),
  });

  const { mutate: deleteTicket, isPending: isDeleting } = useDeleteTicketMutation({
    onSuccess: () => { setIsModalOpen(false); setExtractedTicket(null); },
  });

  const { mutate: submitReport, isPending: isSubmitting } = useSubmitReportMutation({
    onSuccess: () => Alert.alert(t('common.success'), t('reportDetail.reportSubmitted')),
    onError: (error: any) =>
      Alert.alert(t('common.error'), error?.response?.data?.message ?? t('common.error')),
  });

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert(t('common.error'), 'Se necesita permiso de cámara.'); return; }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) uploadTicket({ reportId: id!, formData: buildFormData(result.assets[0].uri) });
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert(t('common.error'), 'Se necesita permiso de galería.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) uploadTicket({ reportId: id!, formData: buildFormData(result.assets[0].uri) });
  };

  const handleConfirm = (updatedData: Partial<ITicket>) => {
    if (!extractedTicket) return;
    updateTicket({ reportId: id!, ticketId: extractedTicket.id, data: updatedData });
  };

  const handleDiscard = () => {
    if (!extractedTicket) return;
    deleteTicket({ reportId: id!, ticketId: extractedTicket.id });
  };

  const handleSubmit = () => {
    Alert.alert(
      t('reportDetail.submitReport'),
      t('reportDetail.confirmSubmit'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.confirm'), onPress: () => submitReport(id!) },
      ],
    );
  };

  const pendingAmount = tickets
    ?.filter(tk => tk.status.toUpperCase() === 'PENDING')
    .reduce((acc, tk) => acc + (tk.amount || 0), 0) ?? 0;

  const isEditable = report && ['CREATED', 'DRAFT'].includes(report.status.toUpperCase());
  const canSubmit = isEditable && (tickets?.length ?? 0) > 0;

  // ── Loading ──
  if (loadingReport) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  // ── Not found ──
  if (!report) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centered}>
          <View style={styles.errorIcon}>
            <Feather name="alert-circle" size={28} color="#dc2626" />
          </View>
          <Text style={styles.errorTitle}>{t('reportDetail.errorLoading')}</Text>
          <Text style={styles.errorText}>{t('reportDetail.errorDesc')}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.errorBtn}>
            <Text style={styles.errorBtnText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.75}>
          <Feather name="arrow-left" size={22} color="#1e293b" />
        </TouchableOpacity>
        <Image source={reportIcon} style={styles.headerIcon} resizeMode="contain" />
        <View style={styles.headerMid}>
          <Text style={styles.headerTitle} numberOfLines={1}>{report.name}</Text>
          <Text style={styles.headerSubId}>#{id?.substring(0, 8)}</Text>
        </View>
        {canSubmit && (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={styles.submitBtn}
            activeOpacity={0.82}
          >
            {isSubmitting
              ? <ActivityIndicator size="small" color="white" />
              : (
                <>
                  <Feather name="send" size={18} color="white" />
                  <Text style={styles.submitBtnText}>{t('reportDetail.submitReport')}</Text>
                </>
              )}
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Report info card ── */}
        <View style={styles.infoCard}>
          {/* Dates + amount on same row, badge below */}
          <View style={styles.infoCardTop}>
            <View style={{ flex: 1 }}>
              <View style={styles.dateRow}>
                <Feather name="calendar" size={18} color="#94a3b8" />
                <Text style={styles.dateText}>
                  {format(new Date(report.start_date), 'd MMM', { locale: dateLocale })}
                  {' — '}
                  {format(new Date(report.end_date), 'd MMM yyyy', { locale: dateLocale })}
                </Text>
              </View>
              <View style={{ marginTop: 8 }}>
                <StatusBadge status={report.status} />
              </View>
            </View>
            <FinancialSummary
              status={report.status}
              currency={report.currency}
              requestedAmount={report.requested_amount ?? 0}
              approvedAmount={report.approved_amount ?? 0}
              ticketsTotal={tickets?.reduce((acc, tk) => acc + (tk.amount || 0), 0) ?? 0}
              ticketCount={tickets?.length ?? 0}
              t={t}
            />
          </View>

          {/* Upload actions — solo si el reporte es editable */}
          {isEditable && (
            <>
              <View style={styles.divider} />
              <View style={styles.uploadRow}>
            <TouchableOpacity
              onPress={pickFromCamera}
              disabled={isUploading || !isEditable}
              style={[styles.uploadBtnPrimary, (!isEditable || isUploading) && styles.disabled]}
              activeOpacity={0.82}
            >
              {isUploading ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.uploadBtnPrimaryText}>Procesando...</Text>
                </>
              ) : (
                <>
                  <Feather name="camera" size={20} color="white" />
                  <Text style={styles.uploadBtnPrimaryText}>{t('reportDetail.scanTicket')}</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickFromGallery}
              disabled={isUploading || !isEditable}
              style={[styles.uploadBtnSecondary, (!isEditable || isUploading) && styles.disabled]}
              activeOpacity={0.82}
            >
              <Feather name="image" size={20} color={colors.brand} />
              <Text style={styles.uploadBtnSecondaryText}>Galería</Text>
            </TouchableOpacity>
          </View>
            </>
          )}
        </View>

        {/* ── Tickets ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('reportDetail.ticketsTitle')}</Text>
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{tickets?.length ?? 0}</Text>
            </View>
          </View>

          {loadingTickets ? (
            <ActivityIndicator color={colors.brand} style={{ marginVertical: 24 }} />
          ) : (tickets && tickets.length > 0) ? (
            <View style={styles.ticketList}>
              {tickets.map((ticket, idx) => (
                <TouchableOpacity
                  key={ticket.id ?? `ticket-${idx}`}
                  onPress={() => { setSelectedTicket(ticket); setIsDetailOpen(true); }}
                  activeOpacity={0.78}
                  style={[
                    styles.ticketRow,
                    idx < tickets.length - 1 && styles.ticketRowBorder,
                  ]}
                >
                  <View style={styles.ticketIconWrap}>
                    <Image source={ticketIcon} style={styles.ticketIconImg} resizeMode="contain" />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.ticketName} numberOfLines={1}>
                      {ticket.location_name ?? t('reportDetail.noTicketName')}
                    </Text>
                    <View style={styles.ticketMeta}>
                      {ticket.date && (
                        <Text style={styles.ticketDate}>
                          {format(new Date(ticket.date), 'dd MMM yyyy', { locale: dateLocale })}
                        </Text>
                      )}
                      {ticket.expense_type && (
                        <View style={styles.expenseTypePill}>
                          <Text style={styles.expenseTypeText}>{ticket.expense_type}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.ticketAmount}>
                      {ticket.amount == null ? '—' : ticket.amount.toLocaleString()}
                      <Text style={styles.ticketCurrency}> {ticket.currency}</Text>
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color="#e2e8f0" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => isEditable && pickFromCamera()}
              disabled={!isEditable}
              style={styles.emptyState}
              activeOpacity={isEditable ? 0.78 : 1}
            >
              <Image source={ticketIcon} style={styles.emptyIcon} resizeMode="contain" />
              <Text style={styles.emptyTitle}>{t('reportDetail.startDigitalizing')}</Text>
              <Text style={styles.emptyText}>{t('reportDetail.digitalizeDesc')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* ── Ticket detail modal ── */}
      <TicketDetailModal
        visible={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedTicket(null); }}
        ticket={selectedTicket}
        reportId={id!}
        isEditable={!!isEditable}
      />

      {/* ── Upload confirmation modal ── */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleDiscard}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('upload.confirmTitle')}</Text>
              <TouchableOpacity
                onPress={handleDiscard}
                disabled={isConfirming || isDeleting}
                style={styles.modalCloseBtn}
              >
                <Feather name="x" size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            {extractedTicket && (
              <TicketConfirmationForm
                ticket={extractedTicket}
                onConfirm={handleConfirm}
                onCancel={handleDiscard}
                isLoading={isConfirming || isDeleting}
              />
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#f8fafc',
  },
  scroll: {
    padding: 20,
    paddingBottom: 48,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerIcon: {
    width: 36,
    height: 36,
    flexShrink: 0,
  },
  headerMid: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.4,
  },
  headerSubId: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexShrink: 0,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  submitBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },

  // Report info card
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e8f0fa',
    padding: 18,
    marginBottom: 14,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  infoCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginTop: 16,
    marginBottom: 14,
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadBtnPrimary: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.brand,
    borderRadius: 12,
    paddingVertical: 12,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  uploadBtnPrimaryText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  uploadBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f0f6fd',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  uploadBtnSecondaryText: {
    color: colors.brand,
    fontWeight: '700',
    fontSize: 14,
  },
  disabled: {
    opacity: 0.45,
  },


  // AI tip
  aiTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#f0f6fd',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbeafe',
    padding: 14,
    marginBottom: 24,
  },
  aiTipIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  aiTipTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand,
    marginBottom: 2,
  },
  aiTipText: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16,
    fontWeight: '500',
  },

  // Tickets section
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.2,
  },
  countPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
  },
  countPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  addTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  addTicketText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand,
  },
  ticketList: {
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
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  ticketRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  ticketIconWrap: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ticketIconImg: {
    width: 52,
    height: 52,
  },
  ticketName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 3,
  },
  ticketMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketDate: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },
  expenseTypePill: {
    backgroundColor: '#f0f6fd',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  expenseTypeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.brand,
  },
  ticketAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  ticketCurrency: {
    fontSize: 10,
    color: '#94a3b8',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0',
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    marginBottom: 10,
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
    marginBottom: 0,
    fontWeight: '500',
    lineHeight: 18,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.brand,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  emptyBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },

  // Error state
  errorIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 6,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  errorBtn: {
    backgroundColor: colors.brand,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 11,
  },
  errorBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },

  // Upload modal
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.3,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
