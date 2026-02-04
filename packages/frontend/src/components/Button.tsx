import type { ComponentProps, ReactNode } from 'react';

interface ButtonProps extends ComponentProps<'button'> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
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
  
    const variants = {
      primary: "bg-brand hover:bg-brand-hover text-white shadow-brand/30",
      secondary: "bg-secondary/20 hover:bg-secondary/30 text-brand font-bold",
      accent: "bg-accent hover:bg-accent-hover text-white shadow-accent/30",
      outline: "border-2 border-brand text-brand hover:bg-brand/5 bg-transparent shadow-none"
    };

    return (
      <button
        disabled={isLoading || disabled}
        className={`
          relative w-full flex justify-center items-center px-4 py-3 rounded-xl
          font-semibold text-sm tracking-wide shadow-lg transition-all duration-200
          active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none
          ${variants[variant]} 
          ${className}
        `}
        {...props}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        <span className={isLoading ? 'invisible' : ''}>
          {children}
        </span>
      </button>
    );
};