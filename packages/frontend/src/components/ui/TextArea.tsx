import type { ComponentProps } from "react";
import { tokens } from "../../styles/theme";

interface TextAreaProps extends ComponentProps<"textarea"> {
  label: string;
  error?: string;
}

export const TextArea = ({ label, error, className, ...props }: TextAreaProps) => (
  <div className="w-full">
    <label className={tokens.inputLabel}>{label}</label>
    <textarea
      {...props}
      className={`${tokens.input} resize-none ${error ? tokens.inputError : ""} ${className ?? ""}`}
    />
    {error && <p className={tokens.inputErrorMsg}>{error}</p>}
  </div>
);
