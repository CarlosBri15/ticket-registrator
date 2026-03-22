import { XCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { tokens } from '../../styles/theme';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const VARIANT_STYLES: Record<AlertVariant, {
  container: string;
  Icon: React.FC<{ className?: string; 'aria-hidden'?: boolean }>;
}> = {
  error: {
    container: tokens.alertError,
    Icon: XCircle,
  },
  success: {
    container: tokens.alertSuccess,
    Icon: CheckCircle2,
  },
  warning: {
    container: tokens.alertWarning,
    Icon: AlertTriangle,
  },
  info: {
    container: tokens.alertInfo,
    Icon: Info,
  },
};

export const Alert = ({ variant = 'error', message, onDismiss, className = '' }: AlertProps) => {
  const styles = VARIANT_STYLES[variant];
  const { Icon } = styles;

  return (
    <div
      role="alert"
      data-variant={variant}
      className={`${tokens.alert} ${styles.container} ${className}`}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden={true} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar"
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

/** Convenience alias — renders an error Alert. */
export const AlertError = (props: Omit<AlertProps, 'variant'>) => (
  <Alert variant="error" {...props} />
);

/** Extracts a human-readable message from an Axios/API error. */
export const getApiErrorMessage = (error: unknown): string => {
  const data = (error as any)?.response?.data;
  if (!data) return 'Error inesperado. Inténtalo de nuevo.';
  if (typeof data.message === 'string') return data.message;
  if (Array.isArray(data.message)) return data.message.join('. ');
  return 'Error inesperado. Inténtalo de nuevo.';
};
