import { useMemo, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import {
  useUserQuery,
  useReportsQuery,
  useUploadTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
  ReportStatus,
  type ITicket,
} from '@ticket-registrator/shared';
import { getDateLocale } from '../utils/date';

const buildFormData = (uri: string): FormData => {
  const formData = new FormData();
  const filename = uri.split('/').pop() ?? 'ticket.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  formData.append('image', { uri, name: filename, type } as any);
  return formData;
};

export const useHomeScreen = () => {
  const { t, i18n } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [scanSheetOpen, setScanSheetOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [extractedTicket, setExtractedTicket] = useState<ITicket | null>(null);

  const { data: user } = useUserQuery();
  const { data: reports, isLoading, refetch } = useReportsQuery();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // ── Active report (CREATED status) ──────────────────────────────────────────

  const activeReport = useMemo(
    () => reports?.find(r => r.status === ReportStatus.CREATED) ?? null,
    [reports],
  );

  // ── Upload mutation ──────────────────────────────────────────────────────────

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
      refetch();
    },
    onError: () => Alert.alert(t('common.error'), t('common.error')),
  });

  const { mutate: deleteTicket } = useDeleteTicketMutation({
    onSuccess: () => {
      setIsModalOpen(false);
      setExtractedTicket(null);
    },
  });

  // ── Image pickers ────────────────────────────────────────────────────────────

  const pickFromCamera = useCallback(async () => {
    setScanSheetOpen(false);
    if (!activeReport) return;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.error'), 'Se necesita permiso de cámara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) {
      uploadTicket({ reportId: activeReport.id, formData: buildFormData(result.assets[0].uri) });
    }
  }, [activeReport, t, uploadTicket]);

  const pickFromGallery = useCallback(async () => {
    setScanSheetOpen(false);
    if (!activeReport) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.error'), 'Se necesita permiso de galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) {
      uploadTicket({ reportId: activeReport.id, formData: buildFormData(result.assets[0].uri) });
    }
  }, [activeReport, t, uploadTicket]);

  const handleConfirm = useCallback((updatedData: Partial<ITicket>) => {
    if (!extractedTicket || !activeReport) return;
    updateTicket({ reportId: activeReport.id, ticketId: extractedTicket.id, data: updatedData });
  }, [extractedTicket, activeReport, updateTicket]);

  const handleDiscard = useCallback(() => {
    if (!extractedTicket || !activeReport) return;
    deleteTicket({ reportId: activeReport.id, ticketId: extractedTicket.id });
  }, [extractedTicket, activeReport, deleteTicket]);

  // ── Stats ────────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const inReviewReports = reports?.filter(r =>
      ['SUBMITTED', 'PENDING'].includes(r.status.toUpperCase())
    ) ?? [];
    return {
      inReviewCount: inReviewReports.length,
      inReview: inReviewReports.reduce((acc, r) => acc + (r.requested_amount ?? 0), 0),
    };
  }, [reports]);

  const recentCompleted = useMemo(
    () =>
      reports
        ?.filter(r => ['APPROVED', 'PAID', 'DECLINED', 'REJECTED'].includes(r.status.toUpperCase()))
        .slice(0, 5) ?? [],
    [reports],
  );

  // ── User ─────────────────────────────────────────────────────────────────────

  const userInitials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
    : '??';

  const firstName = user?.name?.split(' ')[0] ?? '';

  const hour = new Date().getHours();
  const greetingKey = (() => {
    if (hour >= 5 && hour < 12) return 'home.greetingMorning';
    if (hour >= 12 && hour < 20) return 'home.greetingAfternoon';
    return 'home.greetingEvening';
  })();

  const formattedDate = new Date().toLocaleDateString(i18n.language, {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return {
    user,
    reports,
    isLoading,
    refreshing,
    onRefresh,
    stats,
    activeReport,
    recentCompleted,
    userInitials,
    firstName,
    greetingKey,
    formattedDate,
    language: i18n.language,
    dateLocale: getDateLocale(i18n.language),
    // Scan flow
    scanSheetOpen,
    setScanSheetOpen,
    isModalOpen,
    extractedTicket,
    isUploading,
    isConfirming,
    pickFromCamera,
    pickFromGallery,
    handleConfirm,
    handleDiscard,
  };
};
