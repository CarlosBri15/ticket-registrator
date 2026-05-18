import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  type TouchableOpacityProps,
} from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { colors } from '../../constants/theme';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
  textClassName?: string;
}

/**
 * Kit-aligned button (`.btn` family from `packages/frontend/src/index.css`):
 * pill geometry (`rounded-full`), no hard shadows, Manrope-medium label.
 *
 * Variants map to the same names used on web:
 *  - primary  → grafito surface, white label (`.btn-primary`)
 *  - secondary → white surface, stone border (`.btn-secondary`)
 *  - outline  → transparent + stone border (`.btn-outline`)
 *  - ghost    → transparent, ghost on press (`.btn-ghost`)
 *  - accent   → sol accent, dark label (`.btn-accent`)
 *  - danger   → red surface, white label (`.btn-danger`)
 */

const VARIANT_BG: Record<Variant, string> = {
  primary:   'bg-brand',
  secondary: 'bg-white border border-stone-300',
  outline:   'bg-transparent border border-stone-300',
  ghost:     'bg-transparent',
  accent:    'bg-accent',
  danger:    'bg-danger',
};

const VARIANT_TEXT: Record<Variant, string> = {
  primary:   'text-white',
  secondary: 'text-dark',
  outline:   'text-dark',
  ghost:     'text-stone-600',
  accent:    'text-dark',
  danger:    'text-white',
};

const SIZE_BOX: Record<Size, string> = {
  sm: 'px-3 py-2',
  md: 'px-4 py-2.5',
  lg: 'px-5 py-3',
};

const SIZE_TEXT: Record<Size, string> = {
  sm: 'text-[11px]',
  md: 'text-[13px]',
  lg: 'text-sm',
};

const SPINNER_LIGHT_VARIANTS = new Set<Variant>(['primary', 'danger']);

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
  const isDisabled = disabled || isLoading;
  const spinnerColor = SPINNER_LIGHT_VARIANTS.has(variant) ? colors.fgOnBrand : colors.brand;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isDisabled}
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-full',
        VARIANT_BG[variant],
        SIZE_BOX[size],
        isDisabled && 'opacity-50',
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View className="flex-row items-center gap-2">
          {typeof children === 'string' ? (
            <Text
              className={cn(
                'font-space-semibold',
                VARIANT_TEXT[variant],
                SIZE_TEXT[size],
                textClassName,
              )}
            >
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
