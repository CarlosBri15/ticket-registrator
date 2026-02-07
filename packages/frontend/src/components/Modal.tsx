import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop con Blur intenso */}
      <div 
        className="absolute inset-0 bg-dark/60 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-xl rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-500 overflow-hidden">
        
        {/* Decoración superior (estilo financiero) */}
        <div className="h-2 w-full bg-brand" />

        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-dark tracking-tight">{title}</h2>
            <p className="text-sm text-gray-400 mt-1 font-medium">Completa la información requerida</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 text-gray-400 hover:text-dark hover:bg-gray-100 rounded-2xl transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 pt-4 max-h-[calc(100vh-14rem)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};