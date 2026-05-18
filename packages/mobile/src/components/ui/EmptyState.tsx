import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Plus } from 'lucide-react-native';
import { colors } from '../../constants/theme';

interface EmptyStateProps {
  icon?: unknown;
  title: string;
  description: string;
  buttonLabel?: string;
  onButtonPress?: () => void;
}

/**
 * Kit-aligned empty state — circular stone icon container, sentence-case
 * title, muted description, optional pill CTA. Aligns with the web kit's
 * `<EmptyState>` primitive at `packages/frontend/src/components/ui/EmptyState.tsx`.
 */
export const EmptyState = ({
  icon,
  title,
  description,
  buttonLabel,
  onButtonPress,
}: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      {icon ? (
        <View style={styles.iconWrap}>
          <Image
            source={icon as never}
            style={styles.icon}
            contentFit="contain"
            transition={200}
          />
        </View>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {buttonLabel && onButtonPress ? (
        <TouchableOpacity
          style={styles.button}
          onPress={onButtonPress}
          activeOpacity={0.85}
        >
          <Plus size={14} color={colors.fgOnBrand} strokeWidth={2} />
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 6,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 36,
    height: 36,
    opacity: 0.85,
  },
  title: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 16,
    color: colors.dark,
    letterSpacing: -0.2,
  },
  description: {
    fontFamily: 'Manrope-Medium',
    fontSize: 13,
    color: colors.fgSecondary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 18,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 9999,
  },
  buttonText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
    color: colors.fgOnBrand,
  },
});
