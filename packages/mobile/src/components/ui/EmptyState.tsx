import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { IconPlus } from '@tabler/icons-react-native';
import { DARK } from './PixelCard';

interface EmptyStateProps {
  icon?: any;
  title: string;
  description: string;
  buttonLabel?: string;
  onButtonPress?: () => void;
}

/**
 * EmptyState — A standard reusable view for empty lists or results.
 */
export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  buttonLabel, 
  onButtonPress 
}: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      {icon && (
        <Image 
          source={icon} 
          style={styles.icon} 
          contentFit="contain"
          transition={200}
        />
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      {!!buttonLabel && !!onButtonPress && (
        <TouchableOpacity 
          style={styles.button} 
          onPress={onButtonPress}
          activeOpacity={0.8}
        >
          <IconPlus size={16} color="white" />
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center', 
    paddingVertical: 60, 
    paddingHorizontal: 24, 
    gap: 8,
  },
  icon: { 
    width: 72, 
    height: 72, 
    marginBottom: 6,
    opacity: 0.9,
  },
  title: { 
    fontFamily: 'SpaceGrotesk-Bold', 
    fontSize: 16, 
    color: DARK, 
    letterSpacing: 0.5,
  },
  description: { 
    fontFamily: 'SpaceGrotesk-Medium', 
    fontSize: 11, 
    color: `${DARK}70`, 
    textAlign: 'center', 
    textTransform: 'uppercase', 
    marginBottom: 8,
    lineHeight: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: DARK,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  buttonText: { 
    fontFamily: 'SpaceGrotesk-Bold', 
    fontSize: 11, 
    color: 'white', 
    textTransform: 'uppercase',
  },
});
