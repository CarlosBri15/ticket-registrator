import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  DRAFT:     { bg: 'bg-gray-100',   text: 'text-gray-600' },
  CREATED:   { bg: 'bg-brand/10',   text: 'text-brand' },
  SUBMITTED: { bg: 'bg-purple-100', text: 'text-purple-600' },
  APPROVED:  { bg: 'bg-green-100',  text: 'text-green-600' },
  PAID:      { bg: 'bg-green-100',  text: 'text-green-600' },
  REJECTED:  { bg: 'bg-red-100',    text: 'text-red-600' },
  DECLINED:  { bg: 'bg-red-100',    text: 'text-red-600' },
  PENDING:   { bg: 'bg-amber-100',  text: 'text-amber-600' },
};

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { t } = useTranslation();
  const key = status.toUpperCase();
  const config = STATUS_COLORS[key] ?? STATUS_COLORS.DRAFT;

  return (
    <View className={`${config.bg} px-2 py-0.5 rounded-full`}>
      <Text className={`${config.text} text-[10px] font-bold uppercase`}>
        {t(`status.${key}`, { defaultValue: key }).toUpperCase()}
      </Text>
    </View>
  );
};
