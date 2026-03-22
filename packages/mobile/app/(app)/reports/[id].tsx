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

const buildFormData = (uri: string): FormData => {
  const formData = new FormData();
  const filename = uri.split('/').pop() ?? 'ticket.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  formData.append('image', { uri, name: filename, type } as any);
  return formData;
};

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
    onSuccess: (ticket: ITicket) => {
      setExtractedTicket(ticket);
      setIsModalOpen(true);
    },
    onError: (error: any) => {
      Alert.alert(t('common.error'), error?.response?.data?.message ?? t('common.error'));
    },
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
    if (status !== 'granted') {
      Alert.alert(t('common.error'), 'Se necesita permiso de cámara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      uploadTicket({ reportId: id!, formData: buildFormData(result.assets[0].uri) });
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.error'), 'Se necesita permiso de galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      uploadTicket({ reportId: id!, formData: buildFormData(result.assets[0].uri) });
    }
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

  if (loadingReport) {
    return (
      <View className={`${mt.screen} justify-center items-center`}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  if (!report) {
    return (
      <SafeAreaView className={mt.screen}>
        <View className="flex-1 items-center justify-center px-6">
          <View className={`${mt.iconBox} bg-red-50 mb-4`}>
            <Feather name="alert-circle" size={20} color="#dc2626" />
          </View>
          <Text className="text-xl font-bold text-dark mb-2 text-center">{t('reportDetail.errorLoading')}</Text>
          <Text className="text-sm text-gray-400 text-center mb-6">{t('reportDetail.errorDesc')}</Text>
          <TouchableOpacity onPress={() => router.back()} className={`${mt.btnPrimary} px-8`}>
            <Text className={mt.btnTextPrimary}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={mt.screen}>

      {/* ── Page Header ── */}
      <View className={`${mt.pageHeader} flex-row items-center gap-3`}>
        <TouchableOpacity onPress={() => router.back()} className={`${mt.iconBoxSm} bg-gray-50`}>
          <Feather name="arrow-left" size={18} color="#2a3132" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-base font-bold text-dark" numberOfLines={1}>{report.name}</Text>
          <Text className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-0.5">
            {t('reportDetail.backToTrips')}
          </Text>
        </View>
        {canSubmit && (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={`${mt.btnPrimary} px-3.5 py-2`}
          >
            {isSubmitting
              ? <ActivityIndicator size="small" color="white" />
              : (
                <>
                  <Feather name="send" size={14} color="white" />
                  <Text className="text-white font-bold text-xs ml-1.5">{t('reportDetail.submitReport')}</Text>
                </>
              )
            }
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>

        {/* ── Hero Header — brand bg, matches web ── */}
        <View className={`${mt.heroCard} shadow-lg shadow-brand/20 mb-6`}>
          {/* Decorative circle */}
          <View className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full" />

          {/* Status + ID */}
          <View className="flex-row items-center gap-2 mb-4 relative z-10">
            <StatusBadge status={report.status} />
            <View className="bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
              <Text className="text-[10px] font-mono text-white/40">
                #{id?.substring(0, 8)}
              </Text>
            </View>
          </View>

          {/* Name */}
          <Text className="text-2xl font-bold text-white mb-3 leading-tight relative z-10" numberOfLines={2}>
            {report.name}
          </Text>

          {/* Dates */}
          <View className="flex-row items-center gap-1.5 mb-6 relative z-10">
            <Feather name="calendar" size={13} color="rgba(255,255,255,0.6)" />
            <Text className="text-white/60 text-sm font-medium">
              {format(new Date(report.start_date), 'd MMM', { locale: dateLocale })}
              {' — '}
              {format(new Date(report.end_date), 'd MMM yyyy', { locale: dateLocale })}
            </Text>
          </View>

          {/* Upload actions */}
          <View className="flex-row gap-3 relative z-10">
            <TouchableOpacity
              onPress={pickFromCamera}
              disabled={isUploading || !isEditable}
              className={`flex-[2] ${mt.btnPrimary} bg-white/20 border border-white/20 ${(!isEditable) ? 'opacity-40' : ''}`}
            >
              {isUploading ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-bold text-sm ml-2">Procesando...</Text>
                </>
              ) : (
                <>
                  <Feather name="camera" size={16} color="white" />
                  <Text className="text-white font-bold text-sm ml-2">{t('reportDetail.scanTicket')}</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickFromGallery}
              disabled={isUploading || !isEditable}
              className={`flex-1 bg-white/10 rounded-2xl py-3 items-center justify-center border border-white/20 ${!isEditable ? 'opacity-40' : ''}`}
            >
              <Feather name="image" size={16} color="white" />
              <Text className="text-white/80 text-xs font-bold mt-0.5">Galería</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Financial Summary — matches web sidebar ── */}
        <View className={`${mt.listSection} mb-6`}>
          <View className="px-5 py-3.5 border-b border-gray-50 flex-row items-center gap-2 bg-brand/5">
            <Feather name="bar-chart-2" size={14} color={colors.brand} />
            <Text className="text-[10px] font-bold text-brand/70 uppercase tracking-widest">
              {t('reportDetail.financialSummary')}
            </Text>
          </View>

          <View className="p-5 space-y-3">
            {/* Total requested */}
            <View className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <Text className="text-[10px] text-gray-400 uppercase font-bold mb-1">
                {t('reportDetail.totalRequested')}
              </Text>
              <Text className="text-3xl font-bold text-dark">
                {(report.requested_amount ?? 0).toLocaleString()}
                <Text className="text-sm font-semibold text-gray-400"> {report.currency}</Text>
              </Text>
            </View>

            {/* Approved + In review */}
            <View className="flex-row gap-3">
              <View className="flex-1 p-3.5 bg-green-50 rounded-2xl border border-green-100">
                <Text className="text-[10px] font-bold text-green-700/60 uppercase mb-1.5">
                  {t('reportDetail.approved')}
                </Text>
                <Text className="text-lg font-bold text-green-600">
                  {(report.approved_amount ?? 0).toLocaleString()}
                  <Text className="text-[10px] font-semibold text-green-500/50"> {report.currency}</Text>
                </Text>
              </View>
              <View className="flex-1 p-3.5 bg-amber-50 rounded-2xl border border-amber-100">
                <Text className="text-[10px] font-bold text-amber-700/60 uppercase mb-1.5">
                  {t('reportDetail.inReview')}
                </Text>
                <Text className="text-lg font-bold text-amber-600">
                  {pendingAmount.toLocaleString()}
                  <Text className="text-[10px] font-semibold text-amber-500/50"> {report.currency}</Text>
                </Text>
              </View>
            </View>

            {/* Estimated reimbursement */}
            <View className="flex-row items-center justify-between pt-3 border-t border-gray-50">
              <View className="flex-row items-center gap-1.5">
                <Feather name="trending-up" size={13} color="#94a3b8" />
                <Text className="text-xs font-semibold text-gray-400">
                  {t('reportDetail.estimatedReimbursement')}
                </Text>
              </View>
              <Text className="text-sm font-bold text-dark">
                {(report.approved_amount ?? 0).toLocaleString()}
                <Text className="text-xs text-gray-400 font-medium"> {report.currency}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* ── AI Tip ── */}
        <View className="p-4 bg-brand/5 rounded-2xl border border-brand/10 mb-6 flex-row items-start gap-3">
          <Feather name="zap" size={14} color={colors.brand} style={{ marginTop: 1 }} />
          <View className="flex-1">
            <Text className="text-xs font-bold text-brand/80 mb-1">{t('reportDetail.aiTipTitle')}</Text>
            <Text className="text-xs text-brand/60 leading-relaxed">{t('reportDetail.aiTipDesc')}</Text>
          </View>
        </View>

        {/* ── Tickets List — matches web ── */}
        <View>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <Feather name="credit-card" size={15} color="#94a3b8" />
              <Text className={mt.sectionTitle}>{t('reportDetail.ticketsTitle')}</Text>
              <View className="bg-gray-100 px-2 py-0.5 rounded-full">
                <Text className="text-[10px] font-bold text-gray-500">{tickets?.length ?? 0}</Text>
              </View>
            </View>
            {isEditable && (tickets?.length ?? 0) > 0 && (
              <TouchableOpacity
                onPress={pickFromCamera}
                className="flex-row items-center gap-1"
              >
                <Feather name="plus" size={13} color={colors.brand} />
                <Text className="text-xs font-bold text-brand">{t('reportDetail.addTicket')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {loadingTickets ? (
            <ActivityIndicator color={colors.brand} style={{ marginVertical: 20 }} />
          ) : (tickets && tickets.length > 0) ? (
            <View className={mt.listSection}>
              {tickets.map((ticket, idx) => (
                <TouchableOpacity
                  key={ticket.id ?? `ticket-${idx}`}
                  onPress={() => { setSelectedTicket(ticket); setIsDetailOpen(true); }}
                  className={`p-4 flex-row items-center justify-between ${idx < tickets.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <View className="flex-row items-center gap-3 flex-1 min-w-0">
                    <View className={`${mt.iconBox} bg-brand/5 border border-brand/10`}>
                      <Feather name="file-text" size={16} color={colors.brand} />
                    </View>
                    <View className="flex-1 min-w-0">
                      <Text className="font-bold text-dark text-sm" numberOfLines={1}>
                        {ticket.location_name ?? t('reportDetail.noTicketName')}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-0.5">
                        {ticket.date && (
                          <Text className="text-[10px] text-gray-400 font-medium">
                            {format(new Date(ticket.date), 'dd MMM yyyy', { locale: dateLocale })}
                          </Text>
                        )}
                        {ticket.expense_type && (
                          <View className="bg-brand/10 px-2 py-0.5 rounded-full">
                            <Text className="text-[9px] font-bold text-brand">{ticket.expense_type}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <View className="items-end ml-3">
                    <Text className="font-bold text-dark text-sm leading-tight">
                      {ticket.amount == null ? '—' : ticket.amount.toLocaleString()}
                      <Text className="text-[10px] text-gray-400 font-medium"> {ticket.currency}</Text>
                    </Text>
                    <StatusBadge status={ticket.status} />
                  </View>
                  <Feather name="chevron-right" size={14} color="#cbd5e1" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => isEditable && pickFromCamera()}
              disabled={!isEditable}
              className={`${mt.emptyState} py-14`}
            >
              <View className={mt.emptyStateIcon}>
                <Feather name="file-text" size={28} color="#cbd5e1" />
              </View>
              <Text className={mt.emptyStateTitle}>{t('reportDetail.startDigitalizing')}</Text>
              <Text className={mt.emptyStateText}>{t('reportDetail.digitalizeDesc')}</Text>
              {isEditable && (
                <View className={`${mt.btnPrimary} mt-5 px-5`}>
                  <Feather name="camera" size={16} color="white" />
                  <Text className={`${mt.btnTextPrimary} ml-1.5`}>{t('reportDetail.scanFirstTicket')}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* ── Ticket Detail Modal ── */}
      <TicketDetailModal
        visible={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedTicket(null); }}
        ticket={selectedTicket}
        reportId={id!}
        isEditable={!!isEditable}
      />

      {/* ── Upload Confirmation Modal ── */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleDiscard}
      >
        <SafeAreaView className="flex-1 bg-white">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
          >
            <View className={`${mt.pageHeader} flex-row items-center justify-between`}>
              <Text className={mt.pageHeaderTitle}>{t('upload.confirmTitle')}</Text>
              <TouchableOpacity
                onPress={handleDiscard}
                disabled={isConfirming || isDeleting}
                className={`${mt.iconBoxSm} bg-gray-50`}
              >
                <Feather name="x" size={18} color="#94a3b8" />
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
