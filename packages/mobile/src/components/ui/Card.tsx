import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors } from '../../constants/theme';

export interface CardProps {
  children: React.ReactNode;
  /** Visual variant. `default` = white card; `brand` = grafito surface; `accent` = sol accent. */
  variant?: 'default' | 'brand' | 'accent' | 'sunken';
  /** Override background colour explicitly (skips the variant background). */
  bg?: string;
  /** Override border colour explicitly. */
  borderColor?: string;
  /** Card corner radius. Defaults to 14 (kit `.card`). */
  radius?: number;
  /** Internal padding. Set to `false` to disable. */
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
}

const VARIANT_STYLES: Record<NonNullable<CardProps['variant']>, ViewStyle> = {
  default: { backgroundColor: colors.surfaceCard, borderColor: colors.border },
  brand:   { backgroundColor: colors.brand,        borderColor: colors.brand },
  accent:  { backgroundColor: colors.accent,       borderColor: colors.accent },
  sunken:  { backgroundColor: colors.surfaceSunken, borderColor: 'transparent' },
};

/**
 * Card — Kit-aligned surface primitive. White rounded rectangle (radius 14),
 * subtle stone-300 border, no hard shadow.
 *
 * The `brand` and `accent` variants mirror the saturated KPI tones used in
 * the web kit (`.stat--tone-brand`, `.stat--tone-accent`).
 */
export const Card = ({
  children,
  variant = 'default',
  bg,
  borderColor,
  radius = 14,
  padded = false,
  style,
  onPress,
  accessibilityLabel,
  testID,
}: CardProps) => {
  const variantStyle = VARIANT_STYLES[variant];
  const cardStyle: ViewStyle = {
    ...variantStyle,
    ...(bg ? { backgroundColor: bg } : null),
    ...(borderColor ? { borderColor } : null),
    borderRadius: radius,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        style={({ pressed }) => [
          styles.base,
          cardStyle,
          padded && styles.padded,
          pressed && styles.pressed,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      testID={testID}
      style={[styles.base, cardStyle, padded && styles.padded, style]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  padded: {
    padding: 16,
  },
  pressed: {
    opacity: 0.92,
  },
});
