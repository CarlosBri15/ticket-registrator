import type { ComponentProps, ReactNode } from 'react';

interface ButtonProps extends ComponentProps<'button'> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'fintech' | 'white' | 'ghost-white';
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
    primary: "bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/20 border border-transparent",
    secondary: "bg-white text-dark hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md",
    accent: "bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20 border border-transparent",
    outline: "bg-transparent border-2 border-brand text-brand hover:bg-brand/5",
    ghost: "bg-transparent text-gray-500 hover:text-brand hover:bg-brand/5 border border-transparent shadow-none",
    fintech: "bg-gradient-to-r from-brand to-brand-hover hover:from-brand-hover hover:to-brand text-white shadow-xl shadow-brand/30 ring-1 ring-white/20 hover:scale-[1.02] transform transition-transform",
    white: "bg-white text-brand hover:bg-white/90 border border-white/20 shadow-lg",
    "ghost-white": "bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-none backdrop-blur-sm"
  };

  return (
    <button
      disabled={isLoading || disabled}
      className={`
          relative flex justify-center items-center px-6 py-3.5 rounded-xl
          font-bold text-sm tracking-wide transition-all duration-300
          active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none
          ${variants[variant]}
          ${className}
        `}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-[2.5px] border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <span className={`flex items-center justify-center gap-2 ${isLoading ? 'invisible' : ''}`}>
        {children}
      </span>
    </button>
  );
};
