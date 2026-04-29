import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
  View
} from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
  textClassName?: string;
  onPress?: () => void;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className,
  textClassName,
  disabled,
  ...props
}: ButtonProps) => {
  const variants = {
    primary: 'bg-brand border-brand',
    secondary: 'bg-secondary border-secondary',
    outline: 'bg-transparent border-gray-300',
    ghost: 'bg-transparent border-transparent',
    accent: 'bg-accent border-accent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 rounded-lg',
    md: 'px-4 py-3 rounded-xl',
    lg: 'px-6 py-4 rounded-2xl',
  };

  const textVariants = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-gray-700',
    ghost: 'text-brand',
    accent: 'text-white',
  };

  const textSizes = {
    sm: 'text-xs font-semibold',
    md: 'text-base font-bold',
    lg: 'text-lg font-bold',
  };

  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isDisabled}
      className={cn(
        'flex-row items-center justify-center border',
        variants[variant],
        sizes[size],
        isDisabled && 'opacity-50',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? '#336b87' : '#ffffff'}
        />
      ) : (
        <View className="flex-row items-center">
          {typeof children === 'string' ? (
            <Text className={cn(
              textVariants[variant],
              textSizes[size],
              textClassName
            )}>
              {children}
            </Text>
          ) : (
            children
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};
