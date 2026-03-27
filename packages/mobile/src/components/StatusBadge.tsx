import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

type StatusConfig = {
  bg: string;
  text: string;
  border: string;
  icon: React.ComponentProps<typeof Feather>['name'];
};

const STATUS_MAP: Record<string, StatusConfig> = {
  DRAFT:     { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0', icon: 'edit-2' },
  CREATED:   { bg: '#faf5ff', text: '#6d28d9', border: '#ddd6fe', icon: 'file-text' },
  PENDING:   { bg: '#fffbeb', text: '#b45309', border: '#fde68a', icon: 'clock' },
  SUBMITTED: { bg: '#fffbeb', text: '#b45309', border: '#fde68a', icon: 'send' },
  APPROVED:  { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', icon: 'check-circle' },
  PAID:      { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0', icon: 'dollar-sign' },
  REJECTED:  { bg: '#fff1f2', text: '#be123c', border: '#fecdd3', icon: 'x-circle' },
  DECLINED:  { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', icon: 'slash' },
};

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { t } = useTranslation();
  const key = status.toUpperCase();
  const cfg = STATUS_MAP[key] ?? STATUS_MAP.DRAFT;

  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Feather name={cfg.icon} size={10} color={cfg.text} />
      <Text style={[styles.label, { color: cfg.text }]}>
        {t(`status.${key}`, { defaultValue: key })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
