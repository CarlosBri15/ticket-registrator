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

  const softShadows: Record<string, string> = {
    primary:       '0 1px 4px rgba(0,0,0,0.15)',
    success:       '0 1px 4px rgba(0,0,0,0.15)',
    secondary:     '0 1px 3px rgba(0,0,0,0.08)',
    danger:        '0 1px 4px rgba(0,0,0,0.15)',
    outline:       'none',
    ghost:         'none',
    'ghost-white': 'none',
    'ghost-danger':'none',
    'ghost-brand': 'none',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3.5 py-1.5 text-[11px] gap-1.5 rounded-full',
    md: 'px-5 py-2.5 text-sm gap-2 rounded-full',
    lg: 'px-8 py-3.5 text-base gap-3 rounded-full',
    icon: 'w-10 h-10 flex items-center justify-center rounded-full p-0',
  };

  const gapClass = sizes[size].split(' ').find(c => c.startsWith('gap-')) || 'gap-2';

  return (
    <button
      disabled={isLoading || disabled}
      className={`${tokens.buttonBase} ${variants[variant]} ${sizes[size]} ${className ?? ''}`}
      style={{
        boxShadow: softShadows[variant] ?? 'none',
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
