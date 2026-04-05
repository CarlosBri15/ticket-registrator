import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { tokens } from "../../styles/theme";

type ModalSize = 'md' | 'lg' | 'xl' | '2xl' | '3xl';

// Pixel widths matching Tailwind's max-w-* breakpoints
const MAIN_WIDTHS: Record<ModalSize, number> = {
  md:    544,   // max-w-xl
  lg:    640,   // max-w-2xl
  xl:    768,   // max-w-3xl
  '2xl': 896,   // max-w-4xl
  '3xl': 960,   // slightly less than max-w-5xl to leave breathing room
};

const SIDE_PANEL_W = 380;
const SIDE_GAP     = 16;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  subtitle?: string;
  icon?: ReactNode;
  size?: ModalSize;
  /** Buttons rendered in the header, between the title and the close button */
  actions?: ReactNode;
  /** Hide the default X close button (use when passing a custom close via actions) */
  hideDefaultClose?: boolean;
  /**
   * When provided, renders a second panel to the RIGHT of the main modal.
   * Opening it smoothly shifts the main panel left (the container expands via CSS transition).
   */
  sidePanel?: ReactNode;
  /** Background color of the side panel. Defaults to the app surface color. */
  sidePanelBg?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  size = 'md',
  actions,
  hideDefaultClose = false,
  sidePanel,
  sidePanelBg = 'var(--color-surface)',
}: ModalProps) => {
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

  const hasSidePanel = Boolean(sidePanel);
  const mainW        = MAIN_WIDTHS[size];
  const containerW   = hasSidePanel ? mainW + SIDE_GAP + SIDE_PANEL_W : mainW;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-dark/50 backdrop-blur-sm animate-in fade-in duration-200 w-full h-full border-none outline-none"
        onClick={onClose}
        aria-label="Cerrar modal"
      />

      {/*
        Container: width transitions when sidePanel opens/closes.
        Centered via parent flex justify-center → main panel shifts left automatically.
      */}
      <div
        className="relative flex items-stretch gap-4"
        style={{
          width: `min(${containerW}px, calc(100vw - 48px))`,
          transition: 'width 300ms ease-in-out',
        }}
      >
        {/* ── Main panel ──────────────────────────────────────────────── */}
        <div
          className={`${tokens.modalContainer} flex flex-col shrink-0`}
          style={{ width: `min(${mainW}px, 100%)` }}
        >
          {/* Header */}
          <div className={tokens.modalHeader}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {icon && <div className="shrink-0">{icon}</div>}
                <div className="min-w-0">
                  <h2 className={tokens.modalTitle}>{title}</h2>
                  {subtitle && <p className={tokens.modalSubtitle}>{subtitle}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {actions}
                {!hideDefaultClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className={tokens.modalClose}
                    aria-label="Cerrar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className={tokens.modalBody}>{children}</div>
        </div>

        {/* ── Side panel ──────────────────────────────────────────────── */}
        {hasSidePanel && (
          <div
            className="hidden sm:flex flex-col shrink-0 rounded-lg border-2 border-border-main shadow-hard-lg overflow-hidden animate-in slide-in-from-right duration-300"
            style={{
              width: SIDE_PANEL_W,
              backgroundColor: sidePanelBg,
            }}
          >
            {sidePanel}
          </div>
        )}
      </div>
    </div>
  );
};
