import { cloneElement, type ReactElement } from "react";
import { Button } from "../../../components/ui/Button";
import { tokens } from "../../../styles/theme";

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
  // Determine icon container color based on confirmVariant
  // 'primary' (blue) or 'success' (green) -> green box
  // 'danger' (red) -> red box
  const isDestructive = confirmVariant === 'danger';
  const isPrimary = confirmVariant === 'primary';
  const iconBgClass = isDestructive ? 'bg-danger' : isPrimary ? 'bg-brand' : 'bg-success';
  const iconBorderColor = isDestructive ? 'border-[#DC2626]' : isPrimary ? 'border-[#2563EB]' : 'border-[#059669]';

  return (
    <div className={tokens.modalOverlay}>
      <div className={tokens.modalBackdrop} onClick={onCancel} />
      
      <div className="relative z-[101] w-full max-w-sm px-4 flex items-center justify-center min-h-screen sm:min-h-0">
        <div className={`${tokens.card} overflow-hidden shadow-hard-lg w-full`}>
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div
              className={`w-16 h-16 ${iconBgClass} border-2 ${iconBorderColor} rounded-2xl flex items-center justify-center shadow-hard-sm`}
            >
              {icon && cloneElement(icon as ReactElement, { 
                className: "w-8 h-8 text-surface-card text-[var(--color-surface-card)]",
                // Using the broken white from cards instead of pure white
                style: { color: 'var(--color-surface-card)' } 
              } as any)}
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
