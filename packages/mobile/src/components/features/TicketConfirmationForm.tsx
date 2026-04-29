import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { 
  IconCpu, 
  IconCircleCheck, 
  IconCheck, 
  IconAlertCircle, 
  IconList,
  IconSmartHome,
  IconMapPin,
  IconCalendar,
  IconCurrencyDollar,
  IconCreditCard
} from '@tabler/icons-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ITicket } from '@ticket-registrator/shared';
import {
  PixelCard,
  DARK,
  CARD_BG,
  BORDER_WIDTH,
  colors,
} from '../ui/PixelCard';
import { PixelField } from '../ui/PixelField';
import { PixelInput } from '../ui/PixelInput';
import { commerceIcon, locationIcon, paymentMethodIcon } from '@ticket-registrator/shared/assets';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TicketConfirmationFormProps {
  ticket: ITicket;
  onConfirm: (updatedTicket: Partial<ITicket>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

type FieldKey =
  | 'location_name'
  | 'location_address'
  | 'date'
  | 'amount'
  | 'currency'
  | 'payment_type';

// ── Helpers ───────────────────────────────────────────────────────────────────

const isExtracted = (value: any): boolean =>
  value !== null && value !== undefined && value !== '';

// ── Component ─────────────────────────────────────────────────────────────────

export const TicketConfirmationForm = ({
  ticket,
  onConfirm,
  onCancel,
  isLoading,
}: TicketConfirmationFormProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<Record<FieldKey, string>>({
    location_name:    ticket.location_name || '',
    location_address: ticket.location_address || '',
    date:             ticket.date ? new Date(ticket.date).toISOString().split('T')[0] : '',
    amount:           ticket.amount == null ? '' : ticket.amount.toString(),
    currency:         ticket.currency || '',
    payment_type:     ticket.payment_type || '',
  });

  const extracted: Record<FieldKey, boolean> = {
    location_name:    isExtracted(ticket.location_name),
    location_address: isExtracted(ticket.location_address),
    date:             isExtracted(ticket.date),
    amount:           ticket.amount != null,
    currency:         isExtracted(ticket.currency),
    payment_type:     isExtracted(ticket.payment_type),
  };

  const extractedCount  = Object.values(extracted).filter(Boolean).length;
  const totalFields     = Object.keys(extracted).length;
  const missingFields   = (Object.keys(extracted) as FieldKey[]).filter(k => !extracted[k]);
  const extractedFields = (Object.keys(extracted) as FieldKey[]).filter(k =>  extracted[k]);

  const fieldMeta: Record<FieldKey, { label: string; placeholder: string; icon: any; image?: any; numeric?: boolean }> = {
    location_name:    { label: t('confirmForm.establishment'), placeholder: t('confirmForm.establishmentPlaceholder'), icon: IconSmartHome,        image: commerceIcon },
    location_address: { label: t('confirmForm.address'),       placeholder: t('confirmForm.addressPlaceholder'),       icon: IconMapPin,     image: locationIcon },
    date:             { label: t('confirmForm.date'),           placeholder: 'YYYY-MM-DD',                              icon: IconCalendar },
    amount:           { label: t('confirmForm.amount'),         placeholder: '0.00',                                    icon: IconCurrencyDollar, numeric: true },
    currency:         { label: t('confirmForm.currency'),       placeholder: 'EUR',                                     icon: IconCreditCard },
    payment_type:     { label: t('confirmForm.paymentMethod'),  placeholder: t('confirmForm.paymentMethodPlaceholder'), icon: IconCreditCard, image: paymentMethodIcon },
  };

  const formatExtractedValue = (key: FieldKey): string => {
    const raw = formData[key];
    if (key === 'date' && raw) {
      try { return new Date(raw).toLocaleDateString(); } catch { return raw; }
    }
    if (key === 'amount') {
      const num = Number.parseFloat(raw);
      return Number.isNaN(num) ? raw : `${num.toFixed(2)} ${formData.currency}`;
    }
    return raw;
  };

  const handleChange = (name: FieldKey, value: string) =>
    setFormData(prev => ({ ...prev, [name]: value }));

  const handleSubmit = () => {
    onConfirm({
      location_name:    formData.location_name    || null,
      location_address: formData.location_address || null,
      date:             formData.date             || null,
      amount:           formData.amount ? Number.parseFloat(formData.amount) : null,
      currency:         formData.currency         || null,
      payment_type:     formData.payment_type     || null,
    });
  };

  const progress = extractedCount / totalFields;
  let bannerColor = colors.danger;
  if (progress === 1) {
    bannerColor = GREEN;
  } else if (progress > 0.5) {
    bannerColor = AMBER;
  }


  return (
    <View style={s.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── AI Banner ── */}
        <PixelCard bg={CARD_BG} shadowOffset={4} style={s.bannerCard}>
          <View style={s.bannerInner}>
            <PixelCard bg={bannerColor} shadowOffset={3} radius={8}>
              <View style={s.bannerIconInner}>
                <IconCpu size={18} color="white" />
              </View>
            </PixelCard>
            <View style={s.bannerMeta}>
              <Text style={s.bannerTitle}>
                <Text style={[s.bannerCount, { color: bannerColor }]}>{extractedCount}/{totalFields}</Text> campos extraídos
              </Text>
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: `${progress * 100}%` as any, backgroundColor: bannerColor }]} />
              </View>
            </View>
          </View>
        </PixelCard>

        {/* ── Extracted fields (read-only) ── */}
        {extractedFields.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <IconCircleCheck size={11} color={GREEN} />
              <Text style={[s.sectionTitle, { color: GREEN }]}>Datos extraídos</Text>
            </View>
            <PixelCard bg={CARD_BG} shadowOffset={4}>
              <View style={s.cardInner}>
                {extractedFields.map((key, idx) => {
                  const Icon = fieldMeta[key].icon;
                  return (
                    <View key={key}>
                      <View style={s.extractedRow}>
                        <View style={s.extractedIconBox}>
                          {fieldMeta[key].image ? (
                            <Image source={fieldMeta[key].image} style={s.fieldImage} contentFit="contain" />
                          ) : (
                            <Icon size={14} color={GREEN} />
                          )}
                        </View>
                        <View style={s.extractedMeta}>
                          <Text style={s.extractedLabel}>{fieldMeta[key].label}</Text>
                          <Text style={s.extractedValue} numberOfLines={1}>
                            {formatExtractedValue(key)}
                          </Text>
                        </View>
                        <IconCheck size={16} color={GREEN} />
                      </View>
                      {idx < extractedFields.length - 1 && <View style={s.divider} />}
                    </View>
                  );
                })}
              </View>
            </PixelCard>
          </View>
        )}

        {/* ── Missing fields (editable) ── */}
        {missingFields.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <IconAlertCircle size={11} color={AMBER} />
              <Text style={[s.sectionTitle, { color: AMBER }]}>Completa estos campos</Text>
            </View>
            <PixelCard bg={CARD_BG} shadowOffset={4}>
              <View style={s.missingFormWrap}>
                {missingFields.map(key => (
                  <PixelField key={key} label={`${fieldMeta[key].label} *`}>
                    <PixelInput
                      value={formData[key]}
                      onChangeText={v => handleChange(key, v)}
                      placeholder={fieldMeta[key].placeholder}
                      keyboardType={fieldMeta[key].numeric ? 'numeric' : 'default'}
                    />
                  </PixelField>
                ))}
              </View>
            </PixelCard>
          </View>
        )}

        {/* ── Items ── */}
        {ticket.items && ticket.items.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <IconList size={11} color={DARK} />
              <Text style={s.sectionTitle}>{t('confirmForm.itemsSummary')}</Text>
              <View style={s.countPill}>
                <Text style={s.countPillText}>{ticket.items.length}</Text>
              </View>
            </View>
            <PixelCard bg={CARD_BG} shadowOffset={4}>
              <View style={s.cardInner}>
                {ticket.items.map((item, idx) => (
                  <View key={item.id}>
                    <View style={s.itemRow}>
                      <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={s.itemAmount}>
                        {item.amount}
                        {item.currency ? <Text style={s.itemCurrency}> {item.currency}</Text> : null}
                      </Text>
                    </View>
                    {idx < ticket.items!.length - 1 && <View style={s.divider} />}
                  </View>
                ))}
              </View>
            </PixelCard>
          </View>
        )}
      </ScrollView>

      {/* ── Actions ── */}
      <View style={[s.actions, { paddingBottom: 16 + insets.bottom }]}>
        <PixelCard
          bg={CARD_BG}
          shadowOffset={3}
          style={s.actionBtn}
          onPress={isLoading ? undefined : onCancel}
        >
          <View style={s.actionBtnInner}>
            <Text style={s.cancelText}>{t('upload.discard')}</Text>
          </View>
        </PixelCard>
        <PixelCard
          bg={colors.brand}
          shadowOffset={4}
          style={[s.actionBtn, s.actionBtnPrimary, isLoading && s.actionDisabled]}
          onPress={isLoading ? undefined : handleSubmit}
        >
          <View style={s.actionBtnInner}>
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <IconCheck size={16} color="white" />
                <Text style={s.confirmText}>{t('confirmForm.confirm')}</Text>
              </>
            )}
          </View>
        </PixelCard>
      </View>
    </View>
  );
};

// ── Constants ─────────────────────────────────────────────────────────────────

const GREEN = colors.success;
const AMBER = colors.secondary;

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll:    { padding: 16, paddingBottom: 8 },

  // Banner
  bannerCard: { marginBottom: 16 },
  bannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  bannerIconInner: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  bannerMeta:  { flex: 1 },
  bannerTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: DARK, marginBottom: 8 },
  bannerCount: { color: colors.brand },
  progressTrack: {
    height: 6,
    backgroundColor: `${DARK}10`,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Sections
  section:      { marginBottom: 16 },
  sectionHeader:{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionTitle: { flex: 1, fontFamily: 'SpaceGrotesk-Bold', fontSize: 12, color: DARK, letterSpacing: 0.3 },
  countPill: {
    backgroundColor: CARD_BG,
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderWidth: BORDER_WIDTH,
    borderColor: DARK,
    borderRadius: 6,
  },
  countPillText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 9, color: DARK },

  // Card internals
  cardInner: { paddingVertical: 4 },
  divider:   { height: BORDER_WIDTH, backgroundColor: `${DARK}10`, marginHorizontal: 16 },

  // Extracted rows
  extractedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  extractedIconBox: {
    width: 36,
    height: 36,
    borderWidth: BORDER_WIDTH,
    borderColor: `${DARK}20`,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  fieldImage:     { width: 22, height: 22 },
  extractedMeta:  { flex: 1, minWidth: 0 },
  extractedLabel: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 10, color: `${DARK}55`, letterSpacing: 0.3, marginBottom: 2 },
  extractedValue: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: DARK },

  // Missing fields form
  missingFormWrap: { padding: 16 },

  // Items
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  itemName:     { flex: 1, fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: DARK, marginRight: 8 },
  itemAmount:   { fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: DARK },
  itemCurrency: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 9, color: `${DARK}55` },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 4,
    borderTopColor: DARK,
    backgroundColor: CARD_BG,
  },
  actionBtn:        { flex: 1 },
  actionBtnPrimary: { flex: 2 },
  actionDisabled:   { opacity: 0.6 },
  actionBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  cancelText:  { fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: DARK, letterSpacing: 0.2 },
  confirmText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: 'white', letterSpacing: 0.2 },
});
