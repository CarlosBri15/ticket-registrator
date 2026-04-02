import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";

type ModalSize = 'md' | 'lg' | 'xl' | '2xl';

const SIZE_CLASSES: Record<ModalSize, string> = {
  md:  'sm:max-w-xl',
  lg:  'sm:max-w-2xl',
  xl:  'sm:max-w-3xl',
  '2xl': 'sm:max-w-4xl',
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  subtitle?: string;
  icon?: ReactNode;
  size?: ModalSize;
}

export const Modal = ({ isOpen, onClose, title, subtitle, icon, children, size = 'md' }: ModalProps) => {
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
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 w-full h-full border-none outline-none"
        onClick={onClose}
        aria-label="Cerrar modal"
      />

      {/* Panel */}
      <div
        className={`relative bg-white w-full rounded-t-2xl sm:rounded-2xl ${SIZE_CLASSES[size]} animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 overflow-hidden flex flex-col`}
        style={{
          border: "1px solid #edf0f5",
          boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 24px 60px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {icon && <div className="shrink-0">{icon}</div>}
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 tracking-tight truncate">{title}</h2>
              {subtitle && (
                <p className="text-sm text-slate-400 font-medium mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors border border-slate-100 shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[calc(100vh-10rem)] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
