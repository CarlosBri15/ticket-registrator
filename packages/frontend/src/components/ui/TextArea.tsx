import type { ComponentProps } from "react";

interface TextAreaProps extends ComponentProps<"textarea"> {
  label: string;
  error?: string;
}

/**
 * Form textarea — wraps the kit `.field + .field-label + .input` primitives
 * (the `.input` class accepts both `<input>` and `<textarea>`).
 */
export const TextArea = ({ label, error, className, id, ...props }: TextAreaProps) => {
  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div className="field">
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
        </label>
      )}

      <textarea
        id={id}
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
