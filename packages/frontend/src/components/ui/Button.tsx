import type { ComponentProps, ReactNode } from 'react';
import { tokens } from '../../styles/theme';

interface ButtonProps extends ComponentProps<'button'> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'ghost-white';
  children: ReactNode;
}

export const Button = ({
  isLoading,
  variant = 'primary',
  children,
  className,
  disabled,
  ...props
}: ButtonProps) => {

  const variants: Record<string, string> = {
    primary: tokens.buttonPrimary,
    secondary: tokens.buttonSecondary,
    danger: tokens.buttonDanger,
    outline: tokens.buttonOutline,
    ghost: tokens.buttonGhost,
    "ghost-white": tokens.buttonGhostWhite,
  };

  return (
    <button
      disabled={isLoading || disabled}
      className={`${tokens.buttonBase} ${variants[variant]} ${className ?? ''}`}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <span className={`flex items-center justify-center gap-2 ${isLoading ? 'invisible' : ''}`}>
        {children}
      </span>
    </button>
  );
};
