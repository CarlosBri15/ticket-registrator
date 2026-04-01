import { View, Text, StyleSheet } from 'react-native';
import { 
  IconEdit, 
  IconFileText, 
  IconClock, 
  IconSend, 
  IconCircleCheck, 
  IconCurrencyDollar, 
  IconCircleX, 
  IconBan 
} from '@tabler/icons-react-native';
import { useTranslation } from 'react-i18next';
import { BORDER_WIDTH } from './PixelCard';

const STATUS_MAP: Record<string, { bg: string; text: string; icon: any }> = {
  DRAFT:     { bg: 'rgba(26, 26, 26, 0.15)', text: '#FFFFFF', icon: IconEdit },
  CREATED:   { bg: '#FF7F50', text: '#FFFFFF', icon: IconFileText },
  PENDING:   { bg: '#E6B800', text: '#FFFFFF', icon: IconClock },
  SUBMITTED: { bg: '#E6B800', text: '#FFFFFF', icon: IconSend },
  APPROVED:  { bg: '#00C896', text: '#FFFFFF', icon: IconCircleCheck },
  PAID:      { bg: '#00C896', text: '#FFFFFF', icon: IconCurrencyDollar },
  REJECTED:  { bg: '#FF4B4B', text: '#FFFFFF', icon: IconCircleX },
  DECLINED:  { bg: '#FF4B4B', text: '#FFFFFF', icon: IconBan },
};

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { t } = useTranslation();
  const key = status.toUpperCase();
  const cfg = STATUS_MAP[key] ?? STATUS_MAP.DRAFT;
  const Icon = cfg.icon;

  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: 'rgba(26, 26, 26, 0.15)' }]}>
      <Icon size={11} color={cfg.text} />
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: BORDER_WIDTH,
    shadowColor: 'rgba(26, 26, 26, 0.15)',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  label: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 9,
    letterSpacing: 0.2,
  },
});
