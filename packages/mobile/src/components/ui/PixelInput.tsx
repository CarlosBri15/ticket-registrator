import { useState } from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { PixelCard, DARK, CARD_BG } from './PixelCard';

interface PixelInputProps extends TextInputProps {
  error?: boolean;
  shadowOffset?: number;
}

/**
 * PixelInput — TextInput wrapped in a PixelCard.
 * Animates to "pressed" state while focused.
 */
export const PixelInput = ({
  error,
  shadowOffset = 3,
  style,
  onFocus,
  onBlur,
  ...props
}: Readonly<PixelInputProps>) => {
  const [focused, setFocused] = useState(false);

  return (
    <PixelCard
      bg={error ? '#fff8f8' : CARD_BG}
      shadowOffset={shadowOffset}
      active={focused}
    >
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={`${DARK}30`}
        onFocus={e => { setFocused(true); onFocus?.(e); }}
        onBlur={e => { setFocused(false); onBlur?.(e); }}
        {...props}
      />
    </PixelCard>
  );
};

const styles = StyleSheet.create({
  input: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 14,
    color: DARK,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});
