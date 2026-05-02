import { XCircle, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useTranslation } from "react-i18next";

// Note: `getApiErrorMessage` lives in `@ticket-registrator/shared` and must be
// imported from there directly. The legacy re-export from this file was
// removed in Frente 5.4 to satisfy `react-refresh/only-export-components`.

export type AlertVariant = "error" | "success" | "warning" | "info";

export interface AlertProps {
  variant?: AlertVariant;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const VARIANT_CLASS: Record<AlertVariant, string> = {
  error: "alert-error",
  success: "alert-success",
  warning: "alert-warning",
  info: "alert-info",
};

const VARIANT_ICON: Record<
  AlertVariant,
  React.FC<{ className?: string; "aria-hidden"?: boolean }>
> = {
  error: XCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
};

/**
 * Alert — wraps the kit `.alert + .alert-{variant}` primitives. Variant
 * defaults to `error`; pass `onDismiss` to render a close button.
 */
export const Alert = ({ variant = "error", message, onDismiss, className = "" }: AlertProps) => {
  const { t } = useTranslation();
  const Icon = VARIANT_ICON[variant];

  return (
    <div role="alert" data-variant={variant} className={`alert ${VARIANT_CLASS[variant]} ${className}`.trim()}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden={true} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t("common.close")}
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" aria-hidden={true} />
        </button>
      )}
    </div>
  );
};

/** Convenience alias — renders an error Alert. */
export const AlertError = (props: Omit<AlertProps, "variant">) => (
  <Alert variant="error" {...props} />
);
