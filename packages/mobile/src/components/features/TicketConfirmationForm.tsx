import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import {
  Cpu,
  CircleCheck,
  Check,
  AlertCircle,
  List,
  Home,
  MapPin,
  Calendar,
  DollarSign,
  CreditCard,
  type LucideIcon,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ITicket } from '@ticket-registrator/shared';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { colors } from '../../constants/theme';
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

interface FieldMeta {
  label: string;
  placeholder: string;
  icon: LucideIcon;
  image?: number;
  numeric?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const isExtracted = (value: unknown): boolean =>
  value !== null && value !== undefined && value !== '';

const GREEN = colors.success;
const AMBER = colors.warning;

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
  const missingFields   = (Object.keys(extracted) as FieldKey[]).filter((k) => !extracted[k]);
  const extractedFields = (Object.keys(extracted) as FieldKey[]).filter((k) => extracted[k]);

  const fieldMeta: Record<FieldKey, FieldMeta> = {
    location_name:    { label: t('confirmForm.establishment'), placeholder: t('confirmForm.establishmentPlaceholder'), icon: Home,        image: commerceIcon as number },
    location_address: { label: t('confirmForm.address'),       placeholder: t('confirmForm.addressPlaceholder'),       icon: MapPin,      image: locationIcon as number },
    date:             { label: t('confirmForm.date'),          placeholder: 'YYYY-MM-DD',                              icon: Calendar },
    amount:           { label: t('confirmForm.amount'),        placeholder: '0.00',                                    icon: DollarSign, numeric: true },
    currency:         { label: t('confirmForm.currency'),      placeholder: 'EUR',                                     icon: CreditCard },
    payment_type:     { label: t('confirmForm.paymentMethod'), placeholder: t('confirmForm.paymentMethodPlaceholder'), icon: CreditCard, image: paymentMethodIcon as number },
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
    setFormData((prev) => ({ ...prev, [name]: value }));

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
        <Card style={s.bannerCard}>
          <View style={s.bannerInner}>
            <View style={[s.bannerIconBox, { backgroundColor: bannerColor }]}>
              <Cpu size={16} color={colors.fgOnBrand} strokeWidth={2} />
            </View>
            <View style={s.bannerMeta}>
              <Text style={s.bannerTitle}>
                <Text style={[s.bannerCount, { color: bannerColor }]}>{extractedCount}/{totalFields}</Text> campos extraídos
              </Text>
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: `${progress * 100}%` as never, backgroundColor: bannerColor }]} />
              </View>
            </View>
          </View>
        </Card>

        {/* ── Extracted fields (read-only) ── */}
        {extractedFields.length > 0 ? (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <CircleCheck size={12} color={GREEN} strokeWidth={2} />
              <Text style={[s.sectionTitle, { color: GREEN }]}>Datos extraídos</Text>
            </View>
            <Card>
              <View style={s.cardInner}>
                {extractedFields.map((key, idx) => {
                  const Icon = fieldMeta[key].icon;
                  return (
                    <View key={key}>
                      <View style={s.extractedRow}>
                        <View style={s.extractedIconBox}>
                          {fieldMeta[key].image ? (
                            <Image source={fieldMeta[key].image as number} style={s.fieldImage} contentFit="contain" />
                          ) : (
                            <Icon size={16} color={GREEN} strokeWidth={2} />
                          )}
                        </View>
                        <View style={s.extractedMeta}>
                          <Text style={s.extractedLabel}>{fieldMeta[key].label}</Text>
                          <Text style={s.extractedValue} numberOfLines={1}>
                            {formatExtractedValue(key)}
                          </Text>
                        </View>
                        <Check size={16} color={GREEN} strokeWidth={2} />
                      </View>
                      {idx < extractedFields.length - 1 ? <View style={s.divider} /> : null}
                    </View>
                  );
                })}
              </View>
            </Card>
          </View>
        ) : null}

        {/* ── Missing fields (editable) ── */}
        {missingFields.length > 0 ? (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <AlertCircle size={12} color={AMBER} strokeWidth={2} />
              <Text style={[s.sectionTitle, { color: AMBER }]}>Completa estos campos</Text>
            </View>
            <Card>
              <View style={s.missingFormWrap}>
                {missingFields.map((key) => (
                  <Input
                    key={key}
                    label={`${fieldMeta[key].label} *`}
                    value={formData[key]}
                    onChangeText={(v) => handleChange(key, v)}
                    placeholder={fieldMeta[key].placeholder}
                    keyboardType={fieldMeta[key].numeric ? 'numeric' : 'default'}
                  />
                ))}
              </View>
            </Card>
          </View>
        ) : null}

        {/* ── Items ── */}
        {ticket.items && ticket.items.length > 0 ? (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <List size={12} color={colors.dark} strokeWidth={2} />
              <Text style={s.sectionTitle}>{t('confirmForm.itemsSummary')}</Text>
              <View style={s.countPill}>
                <Text style={s.countPillText}>{ticket.items.length}</Text>
              </View>
            </View>
            <Card>
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
                    {idx < ticket.items!.length - 1 ? <View style={s.divider} /> : null}
                  </View>
                ))}
              </View>
            </Card>
          </View>
        ) : null}
      </ScrollView>

      {/* ── Actions ── */}
      <View style={[s.actions, { paddingBottom: 16 + insets.bottom }]}>
        <TouchableOpacity
          style={[s.actionBtn, s.actionBtnSecondary]}
          onPress={isLoading ? undefined : onCancel}
          activeOpacity={0.85}
          disabled={isLoading}
        >
          <Text style={s.cancelText}>{t('upload.discard')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.actionBtn, s.actionBtnPrimary, isLoading && s.actionDisabled]}
          onPress={isLoading ? undefined : handleSubmit}
          activeOpacity={0.85}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.fgOnBrand} size="small" />
          ) : (
            <>
              <Check size={16} color={colors.fgOnBrand} strokeWidth={2} />
              <Text style={s.confirmText}>{t('confirmForm.confirm')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
  bannerIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerMeta:  { flex: 1 },
  bannerTitle: { fontFamily: 'Manrope-SemiBold', fontSize: 13, color: colors.dark, marginBottom: 8 },
  bannerCount: { fontFamily: 'Manrope-Bold' },
  progressTrack: {
    height: 6,
    backgroundColor: colors.overlayLight,
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
  sectionTitle: { flex: 1, fontFamily: 'Manrope-SemiBold', fontSize: 13, color: colors.dark, letterSpacing: -0.1 },
  countPill: {
    backgroundColor: colors.surfaceSunken,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  countPillText: { fontFamily: 'Manrope-SemiBold', fontSize: 10, color: colors.dark },

  // Card internals
  cardInner: { paddingVertical: 4 },
  divider:   { height: 1, backgroundColor: colors.border, marginHorizontal: 14 },

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
    borderRadius: 8,
    backgroundColor: 'rgba(22,163,74,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  fieldImage:     { width: 20, height: 20 },
  extractedMeta:  { flex: 1, minWidth: 0 },
  extractedLabel: { fontFamily: 'Manrope-SemiBold', fontSize: 11, color: colors.fgSecondary, marginBottom: 2 },
  extractedValue: { fontFamily: 'Manrope-SemiBold', fontSize: 13, color: colors.dark },

  // Missing fields form
  missingFormWrap: { padding: 16 },

  // Items
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  itemName:     { flex: 1, fontFamily: 'Manrope-Medium', fontSize: 13, color: colors.dark, marginRight: 8 },
  itemAmount:   { fontFamily: 'Manrope-Bold', fontSize: 13, color: colors.dark },
  itemCurrency: { fontFamily: 'Manrope-SemiBold', fontSize: 11, color: colors.fgSecondary },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceCard,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  actionBtnSecondary: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnPrimary:   { flex: 2, backgroundColor: colors.brand },
  actionDisabled:     { opacity: 0.6 },
  cancelText:  { fontFamily: 'Manrope-SemiBold', fontSize: 13, color: colors.dark },
  confirmText: { fontFamily: 'Manrope-SemiBold', fontSize: 13, color: colors.fgOnBrand },
});
