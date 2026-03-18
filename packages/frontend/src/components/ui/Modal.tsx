import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";

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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-dark/50 backdrop-blur-md animate-in fade-in duration-300 w-full h-full border-none outline-none"
        onClick={onClose}
        aria-label="Cerrar modal"
      />

      {/* Modal */}
      <div className={`relative bg-white w-full ${SIZE_CLASSES[size]} rounded-t-[2rem] sm:rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(42,49,50,0.35)] animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-400 overflow-hidden`}>

        {/* Gradient header */}
        <div className="relative bg-brand px-8 pt-8 pb-6 overflow-hidden">
          {/* Background blobs */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight leading-tight">{title}</h2>
              {subtitle && (
                <p className="text-sm text-white/60 font-medium mt-1">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 shrink-0"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 max-h-[calc(100vh-10rem)] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
