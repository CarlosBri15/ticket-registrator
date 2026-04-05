import type { ComponentProps, ReactNode } from 'react';
import { tokens } from '../../styles/theme';

interface ButtonProps extends ComponentProps<'button'> {
  isLoading?: boolean;
  variant?: 'primary' | 'success' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'ghost-white' | 'ghost-danger' | 'ghost-brand';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = ({
  isLoading,
  variant = 'primary',
  size = 'md',
  children,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}: ButtonProps) => {

  const variants: Record<string, string> = {
    primary: tokens.buttonPrimary,
    success: tokens.buttonSuccess,
    secondary: tokens.buttonSecondary,
    danger: tokens.buttonDanger,
    outline: tokens.buttonOutline,
    ghost: tokens.buttonGhost,
    "ghost-white": tokens.buttonGhostWhite,
    "ghost-danger": tokens.buttonGhostDanger,
    "ghost-brand": tokens.buttonGhostBrand,
  };

  // Color-matched shadows for Neobrutalista look
  const shadowColors: Record<string, string> = {
    primary: '#1E40AF',      // Darker blue
    success: '#059669',      // Darker green
    secondary: '#A1A1AA',    // Zinc-400
    danger: '#991B1B',       // Darker red
    outline: '#3B82F6',      // Brand
    ghost: 'transparent',
    'ghost-white': 'transparent',
    'ghost-danger': 'transparent',
    'ghost-brand': 'transparent',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-[11px] gap-2 rounded-lg',
    md: 'px-5 py-2.5 text-sm gap-3 rounded-xl',
    lg: 'px-8 py-4 text-base gap-4 rounded-2xl',
    icon: 'w-12 h-12 flex items-center justify-center rounded-xl p-0', 
  };

  const shadowColor = shadowColors[variant] || 'var(--color-shadow-main)';
  const hasShadow = !variant.startsWith('ghost');
  const gapClass = sizes[size].split(' ').find(c => c.startsWith('gap-')) || 'gap-2';

  return (
    <button
      disabled={isLoading || disabled}
      className={`${tokens.buttonBase} ${variants[variant]} ${sizes[size]} ${className ?? ''}`}
      style={{
        boxShadow: hasShadow ? `3px 3px 0px ${shadowColor}` : 'none',
        ...props.style,
      }}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <span className={`flex items-center justify-center ${gapClass} ${isLoading ? 'invisible' : ''}`}>
        {leftIcon && <span className="shrink-0 flex items-center justify-center">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="shrink-0 flex items-center justify-center">{rightIcon}</span>}
      </span>
    </button>
  );
};
