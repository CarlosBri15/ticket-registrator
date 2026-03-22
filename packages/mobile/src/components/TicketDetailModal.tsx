import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  useTicketImageQuery,
  useUpdateTicketMutation,
  type ITicket,
} from '@ticket-registrator/shared';
import { StatusBadge } from './StatusBadge';
import { mt, colors } from '../styles/theme';

interface TicketDetailModalProps {
  visible: boolean;
  onClose: () => void;
  ticket: ITicket | null;
  reportId: string;
  isEditable?: boolean;
}

type EditableFields = {
  location_name: string;
  location_address: string;
  date: string;
  amount: string;
  currency: string;
  payment_type: string;
  expense_type: string;
};

export const TicketDetailModal = ({
  visible,
  onClose,
  ticket,
  reportId,
  isEditable = false,
}: TicketDetailModalProps) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EditableFields>({
    location_name: '',
    location_address: '',
    date: '',
    amount: '',
    currency: '',
    payment_type: '',
    expense_type: '',
  });

  const { data: imageData, isLoading: isLoadingImage } = useTicketImageQuery(
    reportId,
    ticket?.id ?? '',
  );

  const { mutate: updateTicket, isPending: isSaving } = useUpdateTicketMutation({
    onSuccess: () => setIsEditing(false),
  });

  const handleStartEdit = () => {
    if (!ticket) return;
    setFormData({
      location_name: ticket.location_name ?? '',
      location_address: ticket.location_address ?? '',
      date: ticket.date ? new Date(ticket.date).toISOString().split('T')[0] : '',
      amount: ticket.amount == null ? '' : String(ticket.amount),
      currency: ticket.currency ?? '',
      payment_type: ticket.payment_type ?? '',
      expense_type: ticket.expense_type ?? '',
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!ticket) return;
    updateTicket({
      reportId,
      ticketId: ticket.id,
      data: {
        location_name: formData.location_name || null,
        location_address: formData.location_address || null,
        date: formData.date || null,
        amount: formData.amount ? Number.parseFloat(formData.amount) : null,
        currency: formData.currency || null,
        payment_type: formData.payment_type || null,
        expense_type: formData.expense_type || null,
      },
    });
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const renderImage = () => {
    if (isLoadingImage) {
      return (
        <View className="items-center gap-2">
          <ActivityIndicator color={colors.brand} />
          <Text className="text-xs text-gray-400">{t('ticketDetail.loadingImage')}</Text>
        </View>
      );
    }
    if (imageData?.url) {
      return (
        <Image
          source={{ uri: imageData.url }}
          className="w-full h-48"
          resizeMode="contain"
        />
      );
    }
    return (
      <View className="items-center">
        <Feather name="image" size={32} color="#cbd5e1" />
        <Text className="text-xs text-gray-400 mt-2">{t('ticketDetail.noImage')}</Text>
      </View>
    );
  };

  if (!ticket) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-100">
          <View className="flex-1 mr-3">
            <Text className="text-lg font-bold text-dark" numberOfLines={1}>
              {ticket.location_name ?? t('reportDetail.noTicketName')}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            {isEditable && !isEditing && (
              <TouchableOpacity
                onPress={handleStartEdit}
                className={`${mt.iconBoxSm} bg-brand/10`}
              >
                <Feather name="edit-2" size={14} color={colors.brand} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleClose} className="w-8 h-8 items-center justify-center">
              <Feather name="x" size={22} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
          {/* Amount + Status + Date */}
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-2xl font-bold text-dark">
                {ticket.amount}{' '}
                <Text className="text-sm font-semibold text-gray-400">{ticket.currency}</Text>
              </Text>
              <View className="mt-1">
                <StatusBadge status={ticket.status} />
              </View>
            </View>
            <View className="items-end">
              <Text className="text-[10px] font-bold text-gray-400 uppercase">{t('reportDetail.date')}</Text>
              <Text className="text-sm font-semibold text-dark">
                {ticket.date ? new Date(ticket.date).toLocaleDateString() : '---'}
              </Text>
            </View>
          </View>

          {isEditing ? (
            /* Edit form */
            <View className="space-y-4">
              <View>
                <Text className="text-xs font-bold text-gray-400 uppercase mb-1">{t('confirmForm.establishment')}</Text>
                <TextInput
                  className={mt.input}
                  value={formData.location_name}
                  onChangeText={v => setFormData(p => ({ ...p, location_name: v }))}
                  placeholder={t('confirmForm.establishmentPlaceholder')}
                />
              </View>
              <View>
                <Text className="text-xs font-bold text-gray-400 uppercase mb-1">{t('confirmForm.address')}</Text>
                <TextInput
                  className={mt.input}
                  value={formData.location_address}
                  onChangeText={v => setFormData(p => ({ ...p, location_address: v }))}
                  placeholder={t('confirmForm.addressPlaceholder')}
                />
              </View>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-xs font-bold text-gray-400 uppercase mb-1">{t('confirmForm.amount')}</Text>
                  <TextInput
                    className={mt.input}
                    value={formData.amount}
                    onChangeText={v => setFormData(p => ({ ...p, amount: v }))}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-gray-400 uppercase mb-1">{t('confirmForm.currency')}</Text>
                  <TextInput
                    className={mt.input}
                    value={formData.currency}
                    onChangeText={v => setFormData(p => ({ ...p, currency: v }))}
                    placeholder="EUR"
                    autoCapitalize="characters"
                  />
                </View>
              </View>
              <View>
                <Text className="text-xs font-bold text-gray-400 uppercase mb-1">{t('confirmForm.paymentMethod')}</Text>
                <TextInput
                  className={mt.input}
                  value={formData.payment_type}
                  onChangeText={v => setFormData(p => ({ ...p, payment_type: v }))}
                  placeholder={t('confirmForm.paymentMethodPlaceholder')}
                />
              </View>
              <View>
                <Text className="text-xs font-bold text-gray-400 uppercase mb-1">{t('confirmForm.category')}</Text>
                <TextInput
                  className={mt.input}
                  value={formData.expense_type}
                  onChangeText={v => setFormData(p => ({ ...p, expense_type: v }))}
                  placeholder={t('confirmForm.categoryPlaceholder')}
                />
              </View>

              <View className="flex-row gap-3 pt-2">
                <TouchableOpacity
                  onPress={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 items-center"
                >
                  <Text className="text-gray-600 font-bold">{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={isSaving}
                  className="flex-[2] py-3 rounded-2xl bg-brand items-center"
                >
                  {isSaving
                    ? <ActivityIndicator color="white" size="small" />
                    : <Text className="text-white font-bold">{t('common.save')}</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* Read-only view */
            <>
              {/* Info rows */}
              <View className="space-y-4 mb-6">
                <View className="flex-row items-start gap-3">
                  <View className={`${mt.iconBoxSm} bg-gray-50`}>
                    <Feather name="map-pin" size={14} color="#94a3b8" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] font-bold text-gray-400 uppercase">{t('reportDetail.location')}</Text>
                    <Text className="text-sm font-medium text-dark mt-0.5">
                      {ticket.location_address || '---'}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start gap-3">
                  <View className={`${mt.iconBoxSm} bg-gray-50`}>
                    <Feather name="credit-card" size={14} color="#94a3b8" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] font-bold text-gray-400 uppercase">{t('reportDetail.paymentMethod')}</Text>
                    <Text className="text-sm font-medium text-dark mt-0.5">
                      {ticket.payment_type || '---'}
                      {ticket.last_four_digits ? ` (**** ${ticket.last_four_digits})` : ''}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start gap-3">
                  <View className={`${mt.iconBoxSm} bg-gray-50`}>
                    <Feather name="tag" size={14} color="#94a3b8" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] font-bold text-gray-400 uppercase">{t('reportDetail.category')}</Text>
                    <Text className="text-sm font-medium text-dark mt-0.5">
                      {ticket.expense_type || '---'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Image */}
              <View className="bg-gray-50 rounded-2xl overflow-hidden items-center justify-center min-h-[180px] mb-6 border border-gray-100">
                {renderImage()}
              </View>

              {/* Items */}
              <View className="bg-gray-50 p-4 rounded-2xl mb-6">
                <Text className="text-xs font-bold text-gray-400 uppercase mb-3">{t('reportDetail.items')}</Text>
                {ticket.items && ticket.items.length > 0 ? (
                  ticket.items.map((item) => (
                    <View
                      key={item.id}
                      className="flex-row justify-between items-center bg-white p-3 rounded-xl border border-gray-100 mb-2"
                    >
                      <Text className="text-sm font-medium text-dark">{item.name}</Text>
                      <Text className="text-sm font-semibold text-brand">
                        {item.amount} {item.currency}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-sm text-gray-400 text-center py-2">{t('reportDetail.noItems')}</Text>
                )}
              </View>

              <TouchableOpacity
                onPress={handleClose}
                className="py-3 rounded-2xl border border-gray-200 items-center"
              >
                <Text className="text-gray-600 font-bold">{t('common.close')}</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
