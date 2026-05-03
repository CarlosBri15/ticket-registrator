import type { ComponentProps } from "react";

interface InputProps extends ComponentProps<"input"> {
  label: string;
  error?: string;
}

/**
 * Form input — wraps the kit `.field + .field-label + .input` primitives.
 * Renders an error message via `.field-error` when provided.
 */
export const Input = ({ label, error, className, id, ...props }: InputProps) => {
  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div className="field">
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
        </label>
      )}

      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        {...props}
        className={["input", error ? "is-error" : "", className ?? ""].filter(Boolean).join(" ")}
      />

      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
};
