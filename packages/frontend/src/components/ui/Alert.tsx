import { XCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const VARIANT_STYLES: Record<AlertVariant, {
  container: string;
  icon: string;
  text: string;
  dismiss: string;
  Icon: React.FC<{ className?: string; 'aria-hidden'?: boolean }>;
}> = {
  error: {
    container: 'bg-accent/5 border-accent/20',
    icon: 'text-accent',
    text: 'text-accent',
    dismiss: 'text-accent/60 hover:text-accent',
    Icon: XCircle,
  },
  success: {
    container: 'bg-green-50 border-green-200',
    icon: 'text-green-600',
    text: 'text-green-700',
    dismiss: 'text-green-400 hover:text-green-600',
    Icon: CheckCircle2,
  },
  warning: {
    container: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-500',
    text: 'text-amber-700',
    dismiss: 'text-amber-400 hover:text-amber-600',
    Icon: AlertTriangle,
  },
  info: {
    container: 'bg-brand/5 border-brand/20',
    icon: 'text-brand',
    text: 'text-brand',
    dismiss: 'text-brand/50 hover:text-brand',
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
      className={`flex items-start gap-3 px-4 py-3 border rounded-xl animate-in slide-in-from-top-2 fade-in duration-200 ${styles.container} ${className}`}
    >
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${styles.icon}`} aria-hidden={true} />
      <p className={`flex-1 text-sm font-semibold ${styles.text}`}>{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar"
          className={`shrink-0 transition-colors ${styles.dismiss}`}
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
