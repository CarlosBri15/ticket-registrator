import { cloneElement, type ReactElement } from "react";
import { Button } from "../../../components/ui/Button";

interface ConfirmDialogProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  cancelLabel: string;
  confirmVariant?: 'primary' | 'success' | 'danger' | 'secondary';
  isLoading?: boolean;
}

export const ConfirmDialog = ({
  icon,
  title,
  description,
  onCancel,
  onConfirm,
  confirmLabel,
  cancelLabel,
  confirmVariant = 'primary',
  isLoading,
}: ConfirmDialogProps) => {
  // Icon container colour mirrors the confirm button's variant.
  const isDestructive = confirmVariant === 'danger';
  const isPrimary = confirmVariant === 'primary';
  const iconBgClass = isDestructive ? 'bg-danger' : isPrimary ? 'bg-brand' : 'bg-success';

  return (
    <div className="modal-overlay">
      <button
        type="button"
        className="modal-backdrop"
        onClick={onCancel}
        aria-label="Close dialog"
      />

      <div className="relative z-[101] w-full max-w-sm px-4 flex items-center justify-center min-h-screen sm:min-h-0">
        <div className="card !p-0 overflow-hidden shadow-[var(--shadow-modal)] w-full">
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div
              className={`w-16 h-16 ${iconBgClass} rounded-2xl flex items-center justify-center`}
            >
              {icon && cloneElement(icon as ReactElement<{ className?: string; style?: React.CSSProperties }>, {
                className: "w-8 h-8 text-[var(--color-surface-card)]",
                style: { color: 'var(--color-surface-card)' }
              })}
            </div>
            
            <div className="space-y-1">
              <h3 className="font-space-bold text-dark text-xl">{title}</h3>
              <p className="font-space text-dark/50 text-sm leading-relaxed px-2">
                {description}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
              <Button
                variant="secondary"
                onClick={onCancel}
                className="flex-1"
              >
                {cancelLabel}
              </Button>
              <Button
                variant={confirmVariant}
                onClick={onConfirm}
                isLoading={isLoading}
                className="flex-1"
              >
                {confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
