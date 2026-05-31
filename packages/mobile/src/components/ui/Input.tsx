import React from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { colors } from '../../constants/theme';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
}

/**
 * Kit-aligned text input (`.field` + `.input` from the web kit). 6 px radius,
 * subtle stone-300 border, Manrope-medium content, danger border when in
 * error state.
 */
export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      containerClassName,
      labelClassName,
      inputClassName,
      errorClassName,
      ...props
    },
    ref,
  ) => {
    return (
      <View className={cn('w-full mb-4 gap-1.5', containerClassName)}>
        {label && (
          <Text
            className={cn(
              'text-[11px] font-space-semibold text-stone-600',
              labelClassName,
            )}
          >
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          className={cn(
            'w-full bg-white border border-stone-300 rounded-kit px-3 py-2.5 text-dark text-sm font-space-medium',
            error && 'border-danger',
            inputClassName,
          )}
          placeholderTextColor={colors.fgQuaternary}
          {...props}
        />
        {error && (
          <Text
            className={cn(
              'text-[11px] font-space-medium text-danger',
              errorClassName,
            )}
          >
            {error}
          </Text>
        )}
      </View>
    );
  },
);

Input.displayName = 'Input';
