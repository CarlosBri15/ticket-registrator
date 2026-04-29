import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  IconCamera, 
  IconEdit, 
  IconX, 
  IconCalendar, 
  IconUpload, 
  IconFolder, 
  IconList,
  IconCoffee,
  IconShoppingBag,
  IconNavigation,
  IconSmartHome,
  IconDeviceDesktop,
  IconMusic,
  IconSun,
  IconHeart,
  IconPhoto
} from '@tabler/icons-react-native';
import { useTranslation } from 'react-i18next';
import {
  useTicketImageQuery,
  useUpdateTicketMutation,
  type ITicket,
} from '@ticket-registrator/shared';
import { colors } from '../../constants/theme';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  PixelCard,
  SCREEN_BG,
  DARK,
  CARD_BG,
  BORDER_WIDTH,
} from '../ui/PixelCard';
import { PixelField } from '../ui/PixelField';
import { PixelInput } from '../ui/PixelInput';
import { DetailRow } from '../ui/DetailRow';

import { ticketIcon, locationIcon, commerceIcon, paymentMethodIcon } from '@ticket-registrator/shared/assets';

const ITEM_ICONS: { icon: any; color: string }[] = [
  { icon: IconCoffee,      color: '#ea580c' },
  { icon: IconShoppingBag,  color: '#9333ea' },
  { icon: IconNavigation,   color: '#3b82f6' },
  { icon: IconSmartHome,    color: '#16a34a' },
  { icon: IconDeviceDesktop, color: '#475569' },
  { icon: IconMusic,       color: '#e11d48' },
  { icon: IconSun,         color: '#ca8a04' },
  { icon: IconHeart,       color: '#db2777' },
];

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

// Helper: Compute formatted date string
const getFormattedDate = (date: string | null | undefined): string => {
  return date ? format(new Date(date), 'd MMM yyyy', { locale: es }) : '---';
};

// Helper: Compute payment display value
const getPaymentValue = (paymentType: string | null | undefined, lastFourDigits: string | null | undefined): string | null => {
  if (!paymentType) return null;
  if (lastFourDigits) return `${paymentType} •••• ${lastFourDigits}`;
  return paymentType;
};

// Helper: Initialize form data from ticket
const initializeFormData = (ticket: ITicket): EditableFields => ({
  location_name: ticket.location_name ?? '',
  location_address: ticket.location_address ?? '',
  date: ticket.date ? new Date(ticket.date).toISOString().split('T')[0] : '',
  amount: ticket.amount == null ? '' : String(ticket.amount),
  currency: ticket.currency ?? '',
  payment_type: ticket.payment_type ?? '',
});

// Helper: Build update payload
const buildUpdatePayload = (formData: EditableFields) => ({
  location_name: formData.location_name || null,
  location_address: formData.location_address || null,
  date: formData.date || null,
  amount: formData.amount ? Number.parseFloat(formData.amount) : null,
  currency: formData.currency || null,
  payment_type: formData.payment_type || null,
});

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

        {/* ── Handle ── */}
        <View style={s.handle} />

        {/* ── Header ── */}
        <View style={s.header}>
          <Image source={ticketIcon} style={s.headerIcon} contentFit="contain" />
          <Text style={s.headerTitle} numberOfLines={1}>
            {ticket.location_name ?? t('reportDetail.noTicketName')}
          </Text>
          <View style={s.headerActions}>
            <PixelCard bg={CARD_BG} shadowOffset={3} radius={8} onPress={() => setImageOpen(true)}>
              <View style={s.iconBtnInner}>
                <IconCamera size={15} color={DARK} />
              </View>
            </PixelCard>
            {isEditable && !isEditing && (
              <PixelCard bg={colors.brand} shadowOffset={3} radius={8} onPress={handleStartEdit}>
                <View style={s.iconBtnInner}>
                  <IconEdit size={15} color="white" />
                </View>
              </PixelCard>
            )}
            <PixelCard bg={colors.danger} shadowOffset={3} radius={8} onPress={handleClose}>
              <View style={s.iconBtnInner}>
                <IconX size={15} color="white" />
              </View>
            </PixelCard>
          </View>
        </View>

        <ScrollView
          style={s.scrollWrap}
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          {isEditing ? (
            /* ── Edit form ── */
            <PixelCard bg={CARD_BG} shadowOffset={4}>
              <View style={s.formWrap}>
                <PixelField label={t('confirmForm.establishment')}>
                  <PixelInput
                    value={formData.location_name}
                    onChangeText={v => setFormData(p => ({ ...p, location_name: v }))}
                    placeholder={t('confirmForm.establishmentPlaceholder')}
                  />
                </PixelField>
                <PixelField label={t('confirmForm.address')}>
                  <PixelInput
                    value={formData.location_address}
                    onChangeText={v => setFormData(p => ({ ...p, location_address: v }))}
                    placeholder={t('confirmForm.addressPlaceholder')}
                  />
                </PixelField>
                <View style={s.formRow}>
                  <View style={{ flex: 1 }}>
                    <PixelField label={t('confirmForm.amount')}>
                      <PixelInput
                        value={formData.amount}
                        onChangeText={v => setFormData(p => ({ ...p, amount: v }))}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                      />
                    </PixelField>
                  </View>
                  <View style={{ flex: 1 }}>
                    <PixelField label={t('confirmForm.currency')}>
                      <PixelInput
                        value={formData.currency}
                        onChangeText={v => setFormData(p => ({ ...p, currency: v }))}
                        placeholder="EUR"
                        autoCapitalize="characters"
                      />
                    </PixelField>
                  </View>
                </View>
                <PixelField label={t('confirmForm.paymentMethod')}>
                  <PixelInput
                    value={formData.payment_type}
                    onChangeText={v => setFormData(p => ({ ...p, payment_type: v }))}
                    placeholder={t('confirmForm.paymentMethodPlaceholder')}
                  />
                </PixelField>
                <View style={s.formActions}>
                  <PixelCard
                    bg={CARD_BG}
                    shadowOffset={3}
                    style={[s.formBtn, isSaving && { opacity: 0.6 }]}
                    onPress={isSaving ? undefined : () => setIsEditing(false)}
                  >
                    <View style={s.formBtnInner}>
                      <Text style={s.cancelBtnText}>{t('common.cancel')}</Text>
                    </View>
                  </PixelCard>
                  <PixelCard
                    bg={colors.brand}
                    shadowOffset={3}
                    style={[s.formBtn, s.formBtnPrimary, isSaving && { opacity: 0.6 }]}
                    onPress={isSaving ? undefined : handleSave}
                  >
                    <View style={s.formBtnInner}>
                      {isSaving
                        ? <ActivityIndicator color="white" size="small" />
                        : <Text style={s.saveBtnText}>{t('common.save')}</Text>
                      }
                    </View>
                  </PixelCard>
                </View>
              </View>
            </PixelCard>
          ) : (
            <>
              {/* ── Info + Amount grouped ── */}
              <PixelCard bg={CARD_BG} shadowOffset={4} style={{ marginBottom: 16 }}>
                {/* Amount */}
                <View style={s.heroAmountBlock}>
                  <Text style={s.amount}>
                    {ticket.amount == null ? '—' : ticket.amount.toLocaleString()}
                    {ticket.currency ? <Text style={s.currency}> {ticket.currency}</Text> : null}
                  </Text>
                  {ticket.expense_type && (
                    <View style={s.expensePill}>
                      <Text style={s.expenseText}>{ticket.expense_type}</Text>
                    </View>
                  )}
                </View>
                <View style={s.heroDivider} />
                {/* All detail rows */}
                <View style={{ paddingVertical: 4 }}>
                  <DetailRow icon={IconCalendar}   label={t('confirmForm.date')}              value={formattedDate} />
                  <View style={s.rowDivider} />
                  <DetailRow icon={IconUpload}     label="Fecha de subida"                    value={format(new Date(ticket.createdAt), 'd MMM yyyy · HH:mm', { locale: es })} />
                  {reportName ? (
                    <>
                      <View style={s.rowDivider} />
                      <DetailRow icon={IconFolder} label="Reporte"                            value={reportName} />
                    </>
                  ) : null}
                  <View style={s.rowDivider} />
                  <DetailRow image={commerceIcon}      label="Comercio"                   value={ticket.location_name} />
                  <View style={s.rowDivider} />
                  <DetailRow image={locationIcon}      label={t('confirmForm.address')}   value={ticket.location_address} />
                  <View style={s.rowDivider} />
                  <DetailRow image={paymentMethodIcon} label={t('reportDetail.paymentMethod')} value={paymentValue} />
                </View>
              </PixelCard>

              {/* ── Items ── */}
              {ticket.items && ticket.items.length > 0 && (
                <View style={s.section}>
                  <View style={s.sectionHeader}>
                    <IconList size={11} color={DARK} />
                    <Text style={s.sectionTitle}>{t('reportDetail.items')}</Text>
                    <View style={s.countPill}>
                      <Text style={s.countPillText}>{ticket.items.length}</Text>
                    </View>
                  </View>
                  <PixelCard bg={CARD_BG} shadowOffset={4}>
                    <View style={{ paddingVertical: 4 }}>
                      {ticket.items.map((item, idx) => (
                        <View key={item.id}>
                          <View style={s.itemRow}>
                            <View style={[s.itemIconBox, {
                              borderColor: ITEM_ICONS[idx % ITEM_ICONS.length].color,
                              backgroundColor: `${ITEM_ICONS[idx % ITEM_ICONS.length].color}15`,
                            }]}>
                              {(() => {
                                const ItemIcon = ITEM_ICONS[idx % ITEM_ICONS.length].icon;
                                return <ItemIcon size={16} color={ITEM_ICONS[idx % ITEM_ICONS.length].color} />;
                              })()}
                            </View>
                            <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
                            <View style={s.itemAmountWrap}>
                              <Text style={s.itemAmount}>{item.amount}</Text>
                              <Text style={s.itemCurrency}>{item.currency}</Text>
                            </View>
                          </View>
                          {idx < ticket.items!.length - 1 && <View style={s.rowDivider} />}
                        </View>
                      ))}
                    </View>
                  </PixelCard>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* ── Fullscreen image ── */}
        <Modal visible={imageOpen} animationType="fade" onRequestClose={() => setImageOpen(false)}>
          <View style={s.fullscreenWrap}>
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
            <PixelCard
              bg="rgba(255,255,255,0.15)"
              shadowOffset={3}
              radius={8}
              style={s.fullscreenClose}
              onPress={() => setImageOpen(false)}
            >
              <View style={s.iconBtnInner}>
                <IconX size={20} color="white" />
              </View>
            </PixelCard>
            {(() => {
              if (isLoadingImage) return <ActivityIndicator color="#ffffff" size="large" />;
              if (imageData?.url) return <Image source={{ uri: imageData.url }} style={s.fullscreenImage} contentFit="contain" />;
              return (
                <View style={s.imagePlaceholder}>
                  <IconPhoto size={40} color="#475569" />
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

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen:     { flex: 1, backgroundColor: CARD_BG },
  scrollWrap: { flex: 1, backgroundColor: SCREEN_BG },

  handle: {
    width: 48,
    height: 6,
    backgroundColor: DARK,
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 0,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: CARD_BG,
    borderBottomWidth: 4,
    borderBottomColor: DARK,
    gap: 10,
  },
  headerIcon:    { width: 44, height: 44, flexShrink: 0 },
  headerTitle:   { flex: 1, fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: DARK },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },
  iconBtnInner:  { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },

  scroll: { padding: 16, paddingBottom: 40 },

  // Amount hero
  heroDivider: { height: BORDER_WIDTH, backgroundColor: `${DARK}10` },
  heroAmountBlock: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
    gap: 8,
  },
  amount:   { fontFamily: 'SpaceGrotesk-Bold', fontSize: 40, color: DARK, letterSpacing: -1 },
  currency: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: `${DARK}55` },
  expensePill: {
    alignSelf: 'flex-start',
    backgroundColor: `${colors.brand}18`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: BORDER_WIDTH,
    borderColor: colors.brand,
    borderRadius: 6,
  },
  expenseText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 8, color: colors.brand },

  // Sections
  section:       { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionTitle:  { flex: 1, fontFamily: 'SpaceGrotesk-Bold', fontSize: 12, color: DARK, letterSpacing: 0.3 },
  countPill: {
    backgroundColor: CARD_BG,
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderWidth: BORDER_WIDTH,
    borderColor: DARK,
    borderRadius: 6,
  },
  countPillText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 9, color: DARK },
  rowDivider:    { height: BORDER_WIDTH, backgroundColor: `${DARK}10`, marginHorizontal: 16 },

  // Edit form
  formWrap:    { padding: 16 },
  formRow:     { flexDirection: 'row', gap: 12 },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  formBtn:     { flex: 1 },
  formBtnPrimary: { flex: 2 },
  formBtnInner:{ paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 12, color: DARK, letterSpacing: 0.2 },
  saveBtnText:   { fontFamily: 'SpaceGrotesk-Bold', fontSize: 12, color: 'white', letterSpacing: 0.2 },

  // Items
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
    borderWidth: BORDER_WIDTH,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName:       { flex: 1, fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 12, color: DARK },
  itemAmountWrap: { alignItems: 'flex-end' },
  itemAmount:     { fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: DARK },
  itemCurrency:   { fontFamily: 'SpaceGrotesk-Bold', fontSize: 8, color: `${DARK}50` },

  // Fullscreen image
  fullscreenWrap:  { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
  fullscreenClose: { position: 'absolute', top: 56, right: 20, zIndex: 10 } as any,
  fullscreenImage: { width: '100%', height: '85%' },
  imagePlaceholder:    { alignItems: 'center', gap: 8 },
  imagePlaceholderText:{ fontSize: 11, fontFamily: 'SpaceGrotesk-SemiBold', color: '#94a3b8' },
});
