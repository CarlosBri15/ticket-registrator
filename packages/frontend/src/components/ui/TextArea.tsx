import { useId, type ComponentProps } from "react";

interface TextAreaProps extends ComponentProps<"textarea"> {
  label: string;
  error?: string;
}

/**
 * Form textarea — wraps the kit `.field + .field-label + .input` primitives
 * (the `.input` class accepts both `<input>` and `<textarea>`).
 *
 * Same id auto-generation contract as `Input` so the `<label htmlFor>`
 * association is always programmatically real (WCAG 1.3.1 / 4.1.2).
 */
export const TextArea = ({ label, error, className, id, ...props }: TextAreaProps) => {
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

      <textarea
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        {...props}
        className={["input resize-none", error ? "is-error" : "", className ?? ""].filter(Boolean).join(" ")}
      />

      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
};
