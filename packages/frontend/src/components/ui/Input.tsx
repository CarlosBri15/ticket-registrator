import { useId, type ComponentProps } from "react";

interface InputProps extends ComponentProps<"input"> {
  label: string;
  error?: string;
}

/**
 * Form input — wraps the kit `.field + .field-label + .input` primitives.
 * Renders an error message via `.field-error` when provided.
 *
 * Always emits a stable `id` so the `<label htmlFor>` association is real (axe
 * flags labels with empty `htmlFor` as a violation). Callers can still pass
 * their own `id` to integrate with external form libraries.
 */
export const Input = ({ label, error, className, id, ...props }: InputProps) => {
  const reactId = useId();
  const inputId = id ?? reactId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="field">
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label}
        </label>
      )}

      <input
        id={inputId}
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
