import type { ComponentProps } from 'react';
import { tokens } from '../../styles/theme';

interface InputProps extends ComponentProps<'input'> {
  label: string;
  error?: string;
}

export const Input = ({ label, error, className, ...props }: InputProps) => {
  return (
    <div className="w-full">
      <label className={tokens.inputLabel}>
        {label}
      </label>

      <input
        {...props}
        className={`
          ${tokens.input}
          ${error ? tokens.inputError : ''}
          ${className ?? ''}
        `}
      />

      {error && (
        <p className={tokens.inputErrorMsg}>
          {error}
        </p>
      )}
    </div>
  );
};
