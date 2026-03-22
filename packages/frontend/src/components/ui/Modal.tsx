import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { tokens } from '../../styles/theme';

type ModalSize = 'md' | 'lg' | 'xl';

const SIZE_CLASSES: Record<ModalSize, string> = {
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-3xl',
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  subtitle?: string;
  size?: ModalSize;
}

export const Modal = ({ isOpen, onClose, title, subtitle, children, size = 'md' }: ModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      globalThis.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      globalThis.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={tokens.modalOverlay}>
      {/* Backdrop */}
      <button
        type="button"
        className={tokens.modalBackdrop}
        onClick={onClose}
        aria-label="Cerrar modal"
      />

      {/* Modal */}
      <div className={`${tokens.modalContainer} ${SIZE_CLASSES[size]}`}>

        {/* Header */}
        <div className={tokens.modalHeader}>
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <h2 className={tokens.modalTitle}>{title}</h2>
              {subtitle && (
                <p className={tokens.modalSubtitle}>{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className={tokens.modalClose}
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={tokens.modalBody}>
          {children}
        </div>
      </div>
    </div>
  );
};
