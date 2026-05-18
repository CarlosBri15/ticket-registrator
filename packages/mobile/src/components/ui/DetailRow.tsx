import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors } from '../../constants/theme';

interface DetailRowProps {
  icon?: LucideIcon;
  image?: number;
  label: string;
  value?: string | null;
}

/**
 * DetailRow — Standard row for categorised information in detail sheets.
 * Kit-aligned (sentence case label, body value), no hard borders.
 */
export const DetailRow = ({ icon: Icon, image, label, value }: DetailRowProps) => {
  let content: React.ReactNode = null;
  if (image) {
    content = <Image source={image} style={styles.imageContent} resizeMode="contain" />;
  } else if (Icon) {
    content = <Icon size={18} color={colors.fgSecondary} strokeWidth={2} />;
  }

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.iconBox,
          image ? styles.iconBoxImage : null,
        ]}
      >
        {content}
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || '—'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconBoxImage: {
    backgroundColor: 'transparent',
    width: 38,
    height: 38,
  },
  imageContent: {
    width: 38,
    height: 38,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
    color: colors.fgSecondary,
    marginBottom: 3,
  },
  value: {
    fontFamily: 'Manrope-Medium',
    fontSize: 13,
    color: colors.dark,
  },
});
