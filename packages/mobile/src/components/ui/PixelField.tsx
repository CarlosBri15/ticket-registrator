import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DARK } from './PixelCard';

interface PixelFieldProps {
  label: string;
  children: React.ReactNode;
  style?: any;
}

/**
 * PixelField — Standard Neobrutalist form field with Label + Content.
 * Used in modals and creation screens for visual consistency.
 */
export const PixelField = ({ label, children, style }: PixelFieldProps) => {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  field: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    color: `${DARK}55`,
    letterSpacing: 0.2,
    marginBottom: 8,
    marginLeft: 2,
  },
});
