import type { ComponentProps } from 'react';

interface InputProps extends ComponentProps<'input'> {
  label: string;
  error?: string;
}

export const Input = ({ label, error, className, ...props }: InputProps) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-dark mb-1.5 ml-1">
        {label}
      </label>
      
      <input
        {...props}
        className={`
          w-full px-4 py-3 rounded-xl border bg-white text-dark transition-all duration-200
          placeholder:text-gray-400
          /* Aquí la magia: Borde brand suave y anillo brand muy transparente */
          focus:bg-white focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10
          ${error 
            ? 'border-accent text-accent focus:border-accent focus:ring-accent/10' 
            : 'border-gray-200 hover:border-secondary'
          }
          ${className} 
        `}
      />
      
      {error && (
        <p className="mt-1.5 ml-1 text-sm text-accent font-medium animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
};