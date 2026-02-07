import type { ComponentProps } from 'react';

interface InputProps extends ComponentProps<'input'> {
  label: string;
  error?: string;
}

export const Input = ({ label, error, className, ...props }: InputProps) => {
  return (
    <div className="w-full group">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-brand transition-colors">
        {label}
      </label>
      
      <div className="relative">
        <input
          {...props}
          className={`
            w-full px-4 py-3.5 rounded-xl border bg-white text-dark transition-all duration-300 font-medium
            placeholder:text-gray-400 placeholder:font-normal
            shadow-sm
            hover:border-secondary hover:shadow-md
            focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 focus:shadow-xl focus:shadow-brand/5
            disabled:opacity-60 disabled:bg-gray-50 disabled:cursor-not-allowed
            ${error 
              ? 'border-accent/50 text-accent focus:border-accent focus:ring-accent/5 bg-accent/[0.02]' 
              : 'border-gray-200'
            }
            ${className} 
          `}
        />
      </div>
      
      {error && (
        <div className="flex items-center gap-1.5 mt-2 ml-1 animate-in slide-in-from-top-1 fade-in duration-200">
          <div className="w-1 h-1 rounded-full bg-accent" />
          <p className="text-xs text-accent font-semibold">
            {error}
          </p>
        </div>
      )}
    </div>
  );
};