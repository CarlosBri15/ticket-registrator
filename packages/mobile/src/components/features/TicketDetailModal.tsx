import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  Pencil,
  X,
  Calendar,
  Upload,
  Folder,
  List,
  Image as ImageIcon,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import {
  useTicketImageQuery,
  useUpdateTicketMutation,
  type ITicket,
} from '@ticket-registrator/shared';
import { colors } from '../../constants/theme';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { DetailRow } from '../ui/DetailRow';
import { CategoryIcon } from '../ui/CategoryIcon';

import { ticketIcon, locationIcon, commerceIcon, paymentMethodIcon } from '@ticket-registrator/shared/assets';

interface TicketDetailModalProps {
  visible: boolean;
  onClose: () => void;
  ticket: ITicket | null;
  reportId: string;
  reportName?: string;
  isEditable?: boolean;
}

type EditableFields = {
  location_name: string;
  location_address: string;
  date: string;
  amount: string;
  currency: string;
  payment_type: string;
};

const getFormattedDate = (date: string | null | undefined): string => {
  return date ? format(new Date(date), 'd MMM yyyy', { locale: es }) : '—';
};

const getPaymentValue = (
  paymentType: string | null | undefined,
  lastFourDigits: string | null | undefined,
): string | null => {
  if (!paymentType) return null;
  if (lastFourDigits) return `${paymentType} •••• ${lastFourDigits}`;
  return paymentType;
};

const initializeFormData = (ticket: ITicket): EditableFields => ({
  location_name:    ticket.location_name ?? '',
  location_address: ticket.location_address ?? '',
  date:             ticket.date ? new Date(ticket.date).toISOString().split('T')[0] : '',
  amount:           ticket.amount == null ? '' : String(ticket.amount),
  currency:         ticket.currency ?? '',
  payment_type:     ticket.payment_type ?? '',
});

const buildUpdatePayload = (formData: EditableFields) => ({
  location_name:    formData.location_name    || null,
  location_address: formData.location_address || null,
  date:             formData.date             || null,
  amount:           formData.amount ? Number.parseFloat(formData.amount) : null,
  currency:         formData.currency         || null,
  payment_type:     formData.payment_type     || null,
});

interface IconBtnProps {
  onPress: () => void;
  variant?: 'default' | 'brand' | 'danger';
  children: React.ReactNode;
  accessibilityLabel?: string;
}

const IconBtn = ({ onPress, variant = 'default', children, accessibilityLabel }: IconBtnProps) => (
  <TouchableOpacity
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    onPress={onPress}
    activeOpacity={0.85}
    style={[
      s.iconBtn,
      variant === 'brand'  && s.iconBtnBrand,
      variant === 'danger' && s.iconBtnDanger,
    ]}
  >
    {children}
  </TouchableOpacity>
);

export const TicketDetailModal = ({
  visible,
  onClose,
  ticket,
  reportId,
  reportName,
  isEditable = false,
}: TicketDetailModalProps) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [formData, setFormData] = useState<EditableFields>({
    location_name: '', location_address: '', date: '',
    amount: '', currency: '', payment_type: '',
  });

  const { data: imageData, isLoading: isLoadingImage } = useTicketImageQuery(
    reportId,
    ticket?.id ?? '',
    { enabled: imageOpen },
  );

  const { mutate: updateTicket, isPending: isSaving } = useUpdateTicketMutation({
    onSuccess: () => setIsEditing(false),
  });

  const handleStartEdit = () => {
    if (!ticket) return;
    setFormData(initializeFormData(ticket));
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!ticket) return;
    updateTicket({
      reportId,
      ticketId: ticket.id,
      data: buildUpdatePayload(formData),
    });
  };

  const handleClose = () => {
    setIsEditing(false);
    setImageOpen(false);
    onClose();
  };

  if (!ticket) return null;

  const formattedDate = getFormattedDate(ticket.date);
  const paymentValue = getPaymentValue(ticket.payment_type, ticket.last_four_digits);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={s.screen}>
        <View style={s.handle} />

        <View style={s.header}>
          <Image source={ticketIcon} style={s.headerIcon} contentFit="contain" />
          <Text style={s.headerTitle} numberOfLines={1}>
            {ticket.location_name ?? t('reportDetail.noTicketName')}
          </Text>
          <View style={s.headerActions}>
            <IconBtn onPress={() => setImageOpen(true)} accessibilityLabel="open image">
              <Camera size={16} color={colors.dark} strokeWidth={2} />
            </IconBtn>
            {isEditable && !isEditing ? (
              <IconBtn onPress={handleStartEdit} variant="brand" accessibilityLabel="edit ticket">
                <Pencil size={16} color={colors.fgOnBrand} strokeWidth={2} />
              </IconBtn>
            ) : null}
            <IconBtn onPress={handleClose} accessibilityLabel="close">
              <X size={16} color={colors.fgSecondary} strokeWidth={2} />
            </IconBtn>
          </View>
        </View>

        <ScrollView
          style={s.scrollWrap}
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          {isEditing ? (
            <Card>
              <View style={s.formWrap}>
                <Input
                  label={t('confirmForm.establishment')}
                  value={formData.location_name}
                  onChangeText={(v) => setFormData((p) => ({ ...p, location_name: v }))}
                  placeholder={t('confirmForm.establishmentPlaceholder')}
                />
                <Input
                  label={t('confirmForm.address')}
                  value={formData.location_address}
                  onChangeText={(v) => setFormData((p) => ({ ...p, location_address: v }))}
                  placeholder={t('confirmForm.addressPlaceholder')}
                />
                <View style={s.formRow}>
                  <View style={{ flex: 1 }}>
                    <Input
                      label={t('confirmForm.amount')}
                      value={formData.amount}
                      onChangeText={(v) => setFormData((p) => ({ ...p, amount: v }))}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input
                      label={t('confirmForm.currency')}
                      value={formData.currency}
                      onChangeText={(v) => setFormData((p) => ({ ...p, currency: v }))}
                      placeholder="EUR"
                      autoCapitalize="characters"
                    />
                  </View>
                </View>
                <Input
                  label={t('confirmForm.paymentMethod')}
                  value={formData.payment_type}
                  onChangeText={(v) => setFormData((p) => ({ ...p, payment_type: v }))}
                  placeholder={t('confirmForm.paymentMethodPlaceholder')}
                />
                <View style={s.formActions}>
                  <TouchableOpacity
                    style={[s.formBtn, s.formBtnSecondary, isSaving && s.btnDisabled]}
                    onPress={isSaving ? undefined : () => setIsEditing(false)}
                    disabled={isSaving}
                    activeOpacity={0.85}
                  >
                    <Text style={s.cancelBtnText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.formBtn, s.formBtnPrimary, isSaving && s.btnDisabled]}
                    onPress={isSaving ? undefined : handleSave}
                    disabled={isSaving}
                    activeOpacity={0.85}
                  >
                    {isSaving
                      ? <ActivityIndicator color={colors.fgOnBrand} size="small" />
                      : <Text style={s.saveBtnText}>{t('common.save')}</Text>
                    }
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ) : (
            <>
              <Card style={s.detailCard}>
                <View style={s.heroAmountBlock}>
                  <Text style={s.amount}>
                    {ticket.amount == null ? '—' : ticket.amount.toLocaleString()}
                    {ticket.currency ? <Text style={s.currency}> {ticket.currency}</Text> : null}
                  </Text>
                  {ticket.expense_type ? (
                    <View style={s.expensePill}>
                      <Text style={s.expenseText}>{ticket.expense_type}</Text>
                    </View>
                  ) : null}
                </View>
                <View style={s.heroDivider} />
                <View style={s.detailList}>
                  <DetailRow icon={Calendar} label={t('confirmForm.date')} value={formattedDate} />
                  <View style={s.rowDivider} />
                  <DetailRow icon={Upload}   label="Fecha de subida" value={format(new Date(ticket.createdAt), 'd MMM yyyy · HH:mm', { locale: es })} />
                  {reportName ? (
                    <>
                      <View style={s.rowDivider} />
                      <DetailRow icon={Folder} label="Reporte" value={reportName} />
                    </>
                  ) : null}
                  <View style={s.rowDivider} />
                  <DetailRow image={commerceIcon as number}      label="Comercio"                       value={ticket.location_name} />
                  <View style={s.rowDivider} />
                  <DetailRow image={locationIcon as number}      label={t('confirmForm.address')}       value={ticket.location_address} />
                  <View style={s.rowDivider} />
                  <DetailRow image={paymentMethodIcon as number} label={t('reportDetail.paymentMethod')} value={paymentValue} />
                </View>
              </Card>

              {ticket.items && ticket.items.length > 0 ? (
                <View style={s.section}>
                  <View style={s.sectionHeader}>
                    <List size={12} color={colors.dark} strokeWidth={2} />
                    <Text style={s.sectionTitle}>{t('reportDetail.items')}</Text>
                    <View style={s.countPill}>
                      <Text style={s.countPillText}>{ticket.items.length}</Text>
                    </View>
                  </View>
                  <Card>
                    <View style={s.detailList}>
                      {ticket.items.map((item, idx) => {
                        const tint = item.categoryColor ?? colors.fgSecondary;
                        return (
                          <View key={item.id}>
                            <View style={s.itemRow}>
                              <View style={s.itemIconBox}>
                                <CategoryIcon
                                  iconName={item.categoryIcon}
                                  color={tint}
                                  size={16}
                                />
                              </View>
                              <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
                              <View style={s.itemAmountWrap}>
                                <Text style={s.itemAmount}>{item.amount}</Text>
                                <Text style={s.itemCurrency}>{item.currency}</Text>
                              </View>
                            </View>
                            {idx < ticket.items!.length - 1 ? <View style={s.rowDivider} /> : null}
                          </View>
                        );
                      })}
                    </View>
                  </Card>
                </View>
              ) : null}
            </>
          )}
        </ScrollView>

        <Modal visible={imageOpen} animationType="fade" onRequestClose={() => setImageOpen(false)}>
          <View style={s.fullscreenWrap}>
            <StatusBar barStyle="light-content" backgroundColor={colors.brand} />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="close image"
              style={s.fullscreenClose}
              onPress={() => setImageOpen(false)}
              activeOpacity={0.85}
            >
              <X size={20} color={colors.fgOnBrand} strokeWidth={2} />
            </TouchableOpacity>
            {(() => {
              if (isLoadingImage) return <ActivityIndicator color={colors.fgOnBrand} size="large" />;
              if (imageData?.url) return <Image source={{ uri: imageData.url }} style={s.fullscreenImage} contentFit="contain" />;
              return (
                <View style={s.imagePlaceholder}>
                  <ImageIcon size={40} color={colors.fgOnSidebarTertiary} strokeWidth={2} />
                  <Text style={s.imagePlaceholderText}>{t('ticketDetail.noImage')}</Text>
                </View>
              );
            })()}
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

const s = StyleSheet.create({
  screen:     { flex: 1, backgroundColor: colors.surfaceCard },
  scrollWrap: { flex: 1, backgroundColor: colors.surface },

  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.overlayMedium,
    alignSelf: 'center',
    marginTop: 10,
    borderRadius: 9999,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: colors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  headerIcon:    { width: 40, height: 40, flexShrink: 0 },
  headerTitle:   { flex: 1, fontFamily: 'Manrope-Bold', fontSize: 18, color: colors.dark, letterSpacing: -0.2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },

  iconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: colors.surfaceSunken,
  },
  iconBtnBrand:  { backgroundColor: colors.brand },
  iconBtnDanger: { backgroundColor: colors.surfaceSunken },

  scroll: { padding: 16, paddingBottom: 40 },

  detailCard:    { marginBottom: 16 },
  heroDivider:   { height: 1, backgroundColor: colors.border },
  heroAmountBlock: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
    gap: 8,
  },
  amount:   { fontFamily: 'Manrope-Bold', fontSize: 38, color: colors.dark, letterSpacing: -1 },
  currency: { fontFamily: 'Manrope-SemiBold', fontSize: 18, color: colors.fgSecondary },
  expensePill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.overlayLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  expenseText: { fontFamily: 'Manrope-SemiBold', fontSize: 11, color: colors.dark },

  section:       { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionTitle:  { flex: 1, fontFamily: 'Manrope-SemiBold', fontSize: 13, color: colors.dark, letterSpacing: -0.1 },
  countPill: {
    backgroundColor: colors.surfaceSunken,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  countPillText: { fontFamily: 'Manrope-SemiBold', fontSize: 11, color: colors.dark },
  rowDivider:    { height: 1, backgroundColor: colors.border, marginHorizontal: 14 },
  detailList:    { paddingVertical: 4 },

  formWrap:    { padding: 16 },
  formRow:     { flexDirection: 'row', gap: 12 },
  formActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  formBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  formBtnSecondary: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formBtnPrimary: { flex: 2, backgroundColor: colors.brand },
  btnDisabled:    { opacity: 0.6 },
  cancelBtnText:  { fontFamily: 'Manrope-SemiBold', fontSize: 13, color: colors.dark },
  saveBtnText:    { fontFamily: 'Manrope-SemiBold', fontSize: 13, color: colors.fgOnBrand },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSunken,
  },
  itemName:       { flex: 1, fontFamily: 'Manrope-Medium', fontSize: 13, color: colors.dark },
  itemAmountWrap: { alignItems: 'flex-end' },
  itemAmount:     { fontFamily: 'Manrope-Bold', fontSize: 14, color: colors.dark },
  itemCurrency:   { fontFamily: 'Manrope-SemiBold', fontSize: 11, color: colors.fgSecondary },

  fullscreenWrap:  { flex: 1, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  fullscreenClose: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: colors.fgOnSidebarFaint,
  },
  fullscreenImage: { width: '100%', height: '85%' },
  imagePlaceholder:    { alignItems: 'center', gap: 8 },
  imagePlaceholderText:{ fontSize: 12, fontFamily: 'Manrope-Medium', color: colors.fgOnSidebarSecondary },
});
