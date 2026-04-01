import React from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ label, error, containerClassName, labelClassName, inputClassName, errorClassName, ...props }, ref) => {
    return (
      <View className={cn('w-full mb-4', containerClassName)}>
        {label && (
          <Text className={cn('text-sm font-semibold text-dark mb-1.5 ml-1', labelClassName)}>
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          className={cn(
            'w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-dark text-base',
            error && 'border-red-500 bg-red-50',
            inputClassName
          )}
          placeholderTextColor="#94a3b8"
          {...props}
        />
        {error && (
          <Text className={cn('text-xs font-medium text-red-500 mt-1 ml-1', errorClassName)}>
            {error}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
