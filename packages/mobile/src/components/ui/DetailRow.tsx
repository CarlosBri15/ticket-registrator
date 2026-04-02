import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { DARK, BORDER_WIDTH } from './PixelCard';

interface DetailRowProps {
  icon?: any;
  image?: number;
  label: string;
  value?: string | null;
}

/**
 * DetailRow — Standard row for displaying categorized information in modals.
 * Used for Commerce, Address, and Payment Method details.
 */
export const DetailRow = ({ icon: Icon, image, label, value }: DetailRowProps) => {
  let content = null;
  if (image) {
    content = <Image source={image} style={{ width: 38, height: 38 }} resizeMode="contain" />;
  } else if (Icon) {
    content = <Icon size={18} color={`${DARK}60`} />;
  }

  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, image ? { borderWidth: 0, width: 38, height: 38 } : null]}>
        {content}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || '---'}</Text>
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
    paddingVertical: 13,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderWidth: BORDER_WIDTH,
    borderColor: `${DARK}20`,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  label: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    color: `${DARK}55`,
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  value: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 12,
    color: DARK,
  },
});
