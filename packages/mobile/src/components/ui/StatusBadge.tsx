import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Pencil,
  FilePlus,
  Clock,
  Send,
  Check,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { statusInlineColors } from '@ticket-registrator/shared';

/**
 * status enum → lucide icon glyph. The text/dot colour comes from the shared
 * `statusColors` map (single source of truth for `.st-*` palette across web
 * and mobile) — never hardcoded here.
 */
const STATUS_ICON: Record<string, LucideIcon> = {
  DRAFT:     Pencil,
  CREATED:   FilePlus,
  PENDING:   Clock,
  SUBMITTED: Send,
  APPROVED:  Check,
  PAID:      Wallet,
  REJECTED:  X,
  DECLINED:  X,
};

const FALLBACK_ICON: LucideIcon = Pencil;
type StatusKey = keyof typeof statusInlineColors;
const DEFAULT_KEY: StatusKey = 'DRAFT';

interface StatusBadgeProps {
  status: string;
}

/**
 * Mirrors the web kit `.status` primitive (`packages/frontend/src/index.css`):
 * lucide glyph + coloured label, no pill, no background.
 */
export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { t } = useTranslation();
  const key = status.toUpperCase() as StatusKey;
  const tint = statusInlineColors[key] ?? statusInlineColors[DEFAULT_KEY];
  const Icon = STATUS_ICON[key] ?? FALLBACK_ICON;

  return (
    <View style={styles.status}>
      <Icon size={14} color={tint} strokeWidth={2} />
      <Text style={[styles.label, { color: tint }]}>
        {t(`status.${key}`, { defaultValue: key })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontFamily: 'Manrope-Medium',
    fontSize: 13,
    lineHeight: 14,
  },
});
