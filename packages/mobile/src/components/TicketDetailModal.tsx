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
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  useTicketImageQuery,
  useUpdateTicketMutation,
  type ITicket,
} from '@ticket-registrator/shared';
import { colors } from '../styles/theme';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ticketIcon = require('../../../shared/src/assets/ticket.png') as number;

const ITEM_ICONS: { icon: React.ComponentProps<typeof Feather>['name']; bg: string; color: string }[] = [
  { icon: 'coffee',       bg: '#fff7ed', color: '#ea580c' },
  { icon: 'shopping-bag', bg: '#fdf4ff', color: '#9333ea' },
  { icon: 'navigation',   bg: '#eff6ff', color: '#3b82f6' },
  { icon: 'home',         bg: '#f0fdf4', color: '#16a34a' },
  { icon: 'monitor',      bg: '#f8fafc', color: '#475569' },
  { icon: 'music',        bg: '#fff1f2', color: '#e11d48' },
  { icon: 'sun',          bg: '#fefce8', color: '#ca8a04' },
  { icon: 'heart',        bg: '#fdf2f8', color: '#db2777' },
];

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
  const [imageOpen, setImageOpen] = useState(false);
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
    { enabled: imageOpen },
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
    setImageOpen(false);
    onClose();
  };

  if (!ticket) return null;

  const formattedDate = ticket.date
    ? format(new Date(ticket.date), 'd MMM yyyy', { locale: es })
    : '---';

  const paymentValue = ticket.payment_type
    ? ticket.last_four_digits
      ? `${ticket.payment_type} •••• ${ticket.last_four_digits}`
      : ticket.payment_type
    : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.screen}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Image source={ticketIcon} style={styles.headerIcon} resizeMode="contain" />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {ticket.location_name ?? t('reportDetail.noTicketName')}
            </Text>
            <Text style={styles.headerSub}>#{ticket.id?.substring(0, 8)}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setImageOpen(true)} style={styles.imageBtn} activeOpacity={0.75}>
              <Feather name="camera" size={18} color="#64748b" />
            </TouchableOpacity>
            {isEditable && !isEditing && (
              <TouchableOpacity onPress={handleStartEdit} style={styles.editBtn} activeOpacity={0.75}>
                <Feather name="edit-2" size={18} color={colors.brand} />
                <Text style={styles.editBtnText}>{t('common.edit')}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.75}>
              <Feather name="x" size={18} color="#64748b" />
              <Text style={styles.closeBtnText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Date + Amount — same style as report card ── */}
          <View style={styles.amountSection}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.dateRow}>
                <Feather name="calendar" size={18} color="#94a3b8" />
                <Text style={styles.dateText}>{formattedDate}</Text>
              </View>
            </View>
            <View style={styles.amountBlock}>
              <Text style={styles.amount}>
                {ticket.amount == null ? '—' : ticket.amount.toLocaleString()}
              </Text>
              <Text style={styles.currency}>{ticket.currency}</Text>
            </View>
          </View>

          {isEditing ? (
            /* ── Edit form ── */
            <View style={styles.card}>
              <Field label={t('confirmForm.establishment')}>
                <TextInput
                  style={styles.input}
                  value={formData.location_name}
                  onChangeText={v => setFormData(p => ({ ...p, location_name: v }))}
                  placeholder={t('confirmForm.establishmentPlaceholder')}
                  placeholderTextColor="#94a3b8"
                />
              </Field>
              <Field label={t('confirmForm.address')}>
                <TextInput
                  style={styles.input}
                  value={formData.location_address}
                  onChangeText={v => setFormData(p => ({ ...p, location_address: v }))}
                  placeholder={t('confirmForm.addressPlaceholder')}
                  placeholderTextColor="#94a3b8"
                />
              </Field>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Field label={t('confirmForm.amount')}>
                    <TextInput
                      style={styles.input}
                      value={formData.amount}
                      onChangeText={v => setFormData(p => ({ ...p, amount: v }))}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor="#94a3b8"
                    />
                  </Field>
                </View>
                <View style={{ flex: 1 }}>
                  <Field label={t('confirmForm.currency')}>
                    <TextInput
                      style={styles.input}
                      value={formData.currency}
                      onChangeText={v => setFormData(p => ({ ...p, currency: v }))}
                      placeholder="EUR"
                      placeholderTextColor="#94a3b8"
                      autoCapitalize="characters"
                    />
                  </Field>
                </View>
              </View>
              <Field label={t('confirmForm.paymentMethod')}>
                <TextInput
                  style={styles.input}
                  value={formData.payment_type}
                  onChangeText={v => setFormData(p => ({ ...p, payment_type: v }))}
                  placeholder={t('confirmForm.paymentMethodPlaceholder')}
                  placeholderTextColor="#94a3b8"
                />
              </Field>
              <View style={styles.formActions}>
                <TouchableOpacity
                  onPress={() => setIsEditing(false)}
                  disabled={isSaving}
                  style={styles.cancelBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={isSaving}
                  style={[styles.saveBtn, isSaving && { opacity: 0.65 }]}
                  activeOpacity={0.85}
                >
                  {isSaving
                    ? <ActivityIndicator color="white" size="small" />
                    : <Text style={styles.saveBtnText}>{t('common.save')}</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* ── Read-only view ── */
            <>
              {/* Single details card */}
              <View>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{t('reportDetail.details') || 'Detalles'}</Text>
                </View>
                <View style={styles.card}>

                {/* Comercio — full width */}
                <DetailRow icon="briefcase" label="Comercio" value={ticket.location_name} />

                <View style={styles.divider} />

                {/* Dirección — full width */}
                <DetailRow icon="map-pin" label={t('confirmForm.address')} value={ticket.location_address} />

                <View style={styles.divider} />

                {/* Método de pago — full width */}
                <DetailRow icon="credit-card" label={t('reportDetail.paymentMethod')} value={paymentValue} />

                </View>
              </View>


              {/* Items — only when present */}
              {ticket.items && ticket.items.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('reportDetail.items')}</Text>
                    <View style={styles.countPill}>
                      <Text style={styles.countPillText}>{ticket.items.length}</Text>
                    </View>
                  </View>
                  <View style={styles.itemList}>
                    {ticket.items.map((item, idx) => (
                      <View
                        key={item.id}
                        style={[styles.itemRow, idx < ticket.items!.length - 1 && styles.itemRowBorder]}
                      >
                        <View style={[styles.itemIconWrap, { backgroundColor: ITEM_ICONS[idx % ITEM_ICONS.length].bg }]}>
                          <Feather
                            name={ITEM_ICONS[idx % ITEM_ICONS.length].icon}
                            size={24}
                            color={ITEM_ICONS[idx % ITEM_ICONS.length].color}
                          />
                        </View>
                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                        <View style={styles.itemAmountWrap}>
                          <Text style={styles.itemAmount}>{item.amount}</Text>
                          <Text style={styles.itemCurrency}>{item.currency}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Fullscreen image modal */}
        <Modal visible={imageOpen} animationType="fade" onRequestClose={() => setImageOpen(false)}>
          <View style={styles.fullscreenWrap}>
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
            <TouchableOpacity
              style={styles.fullscreenClose}
              onPress={() => setImageOpen(false)}
              activeOpacity={0.8}
            >
              <Feather name="x" size={26} color="#ffffff" />
            </TouchableOpacity>
            {isLoadingImage ? (
              <ActivityIndicator color="#ffffff" size="large" />
            ) : imageData?.url ? (
              <Image
                source={{ uri: imageData.url }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Feather name="image" size={48} color="#475569" />
                <Text style={styles.imagePlaceholderText}>{t('ticketDetail.noImage')}</Text>
              </View>
            )}
          </View>
        </Modal>

      </SafeAreaView>
    </Modal>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function DetailRow({ icon, label, value }: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  value?: string | null;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIconWrap}>
        <Feather name={icon} size={24} color="#94a3b8" />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.metaLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || '---'}</Text>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  headerIcon: {
    width: 28,
    height: 28,
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0f6fd',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand,
  },
  closeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },

  scroll: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },

  // Amount section — date left, amount right (mirrors report infoCardTop)
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.2,
  },
  merchantName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
    marginTop: 5,
  },
  amountBlock: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.8,
  },
  currency: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.4,
    marginTop: 2,
  },

  // Shared card
  card: {
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
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },

  // Location row
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  detailIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 1,
  },

  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },

  imageBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Items section
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
  itemList: {
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
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  itemAmountWrap: {
    alignItems: 'flex-end',
  },
  itemAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  itemCurrency: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },

  // Fullscreen image
  fullscreenWrap: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenClose: {
    position: 'absolute',
    top: 56,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  fullscreenImage: {
    width: '100%',
    height: '85%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },

  // Edit form
  field: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 2,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  saveBtn: {
    flex: 2,
    backgroundColor: colors.brand,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});
