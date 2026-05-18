import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  useReportQuery,
  useTicketsQuery,
  useUploadTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
  useDeleteReportMutation,
  useSubmitReportMutation,
  type ITicket,
} from '@ticket-registrator/shared';
import * as ImagePicker from 'expo-image-picker';
import { es, enUS } from 'date-fns/locale';

const buildFormData = (uri: string): FormData => {
  const formData = new FormData();
  const filename = uri.split('/').pop() ?? 'ticket.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  formData.append('image', { uri, name: filename, type } as any);
  return formData;
};

export const useReportDetailScreen = (id: string) => {
  const { t, i18n } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [extractedTicket, setExtractedTicket] = useState<ITicket | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<ITicket | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: report, isLoading: loadingReport, refetch: refetchReport } = useReportQuery(id);
  const { data: tickets, isLoading: loadingTickets, refetch: refetchTickets } = useTicketsQuery(id);

  const dateLocale = i18n.language.startsWith('es') ? es : enUS;

  const { mutate: uploadTicket, isPending: isUploading } = useUploadTicketMutation({
    onSuccess: (ticket: ITicket) => {
      setExtractedTicket(ticket);
      setIsModalOpen(true);
    },
    onError: (error: any) =>
      Alert.alert(t('common.error'), error?.response?.data?.message ?? t('common.error')),
  });

  const { mutate: updateTicket, isPending: isConfirming } = useUpdateTicketMutation({
    onSuccess: () => {
      setIsModalOpen(false);
      setExtractedTicket(null);
      refetchTickets();
    },
    onError: () => Alert.alert(t('common.error'), t('common.error')),
  });

  const { mutate: deleteTicket } = useDeleteTicketMutation({
    onSuccess: () => {
      setIsModalOpen(false);
      setExtractedTicket(null);
      refetchTickets();
    },
  });

  const { mutate: submitReport, isPending: isSubmitting } = useSubmitReportMutation({
    onSuccess: () => {
      Alert.alert(t('common.success'), t('reportDetail.reportSubmitted'));
      refetchReport();
    },
    onError: (error: any) =>
      Alert.alert(t('common.error'), error?.response?.data?.message ?? t('common.error')),
  });

  const { mutate: deleteReport, isPending: isDeleting } = useDeleteReportMutation({
    onSuccess: () => {
      // navigation back is handled by the screen via `onAfterDelete` callback.
    },
  });

  const pickFromCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.error'), 'Se necesita permiso de cámara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) {
      uploadTicket({ reportId: id, formData: buildFormData(result.assets[0].uri) });
    }
  }, [id, t, uploadTicket]);

  const pickFromGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.error'), 'Se necesita permiso de galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) {
      uploadTicket({ reportId: id, formData: buildFormData(result.assets[0].uri) });
    }
  }, [id, t, uploadTicket]);

  const handleConfirm = useCallback((updatedData: Partial<ITicket>) => {
    if (!extractedTicket) return;
    updateTicket({ reportId: id, ticketId: extractedTicket.id, data: updatedData });
  }, [id, extractedTicket, updateTicket]);

  const handleDiscard = useCallback(() => {
    if (!extractedTicket) return;
    deleteTicket({ reportId: id, ticketId: extractedTicket.id });
  }, [id, extractedTicket, deleteTicket]);

  const handleSubmit = useCallback(() => {
    Alert.alert(
      t('reportDetail.submitReport'),
      t('reportDetail.confirmSubmit'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.confirm'), onPress: () => submitReport(id) },
      ],
    );
  }, [id, t, submitReport]);

  const handleDeleteReport = useCallback((onAfterDelete?: () => void) => {
    Alert.alert(
      t('common.delete'),
      t('reportDetail.confirmDelete', { defaultValue: '¿Eliminar este reporte?' }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteReport(id, { onSuccess: onAfterDelete }),
        },
      ],
    );
  }, [id, t, deleteReport]);

  const isEditable = useMemo(() =>
    report && ['CREATED', 'DRAFT'].includes(report.status.toUpperCase()),
    [report]);

  const canSubmit = useMemo(() =>
    isEditable && (tickets?.length ?? 0) > 0,
    [isEditable, tickets]);

  const ticketsTotal = useMemo(() =>
    tickets?.reduce((acc, tk) => acc + (tk.amount || 0), 0) ?? 0,
    [tickets]);

  return {
    report,
    tickets,
    loadingReport,
    loadingTickets,
    isUploading,
    isConfirming,
    isSubmitting,
    isDeleting,
    isModalOpen,
    setIsModalOpen,
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
    isEditable,
    canSubmit,
    ticketsTotal,
  };
};
