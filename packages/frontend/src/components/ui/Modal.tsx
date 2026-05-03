import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";

type ModalSize = "md" | "lg" | "xl" | "2xl" | "3xl";

// Pixel widths matching Tailwind's max-w-* breakpoints
const MAIN_WIDTHS: Record<ModalSize, number> = {
  md: 544,
  lg: 640,
  xl: 768,
  "2xl": 896,
  "3xl": 960,
};

const SIDE_PANEL_W = 380;
const SIDE_GAP = 16;

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

/**
 * Modal shell — wraps the kit `.modal-overlay/.modal-backdrop/.modal-container/
 * .modal-header/.modal-title/.modal-subtitle/.modal-body/.modal-close`
 * primitives. Optional side panel slides in beside the main panel.
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  size = "md",
  actions,
  hideDefaultClose = false,
  sidePanel,
  sidePanelBg = "var(--color-surface)",
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
  const mainW = MAIN_WIDTHS[size];
  const containerW = hasSidePanel ? mainW + SIDE_GAP + SIDE_PANEL_W : mainW;

  return (
    <div className="modal-overlay">
      <button
        type="button"
        className="modal-backdrop animate-in fade-in duration-200"
        onClick={onClose}
        aria-label="Cerrar modal"
      />

      <div
        className="relative flex items-stretch gap-4"
        style={{
          width: `min(${containerW}px, calc(100vw - 48px))`,
          transition: "width 300ms ease-in-out",
        }}
      >
        {/* ── Main panel ──────────────────────────────────────────────── */}
        <div
          className="modal-container flex flex-col shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-200"
          style={{ width: `min(${mainW}px, 100%)` }}
        >
          <div className="modal-header">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {icon && <div className="shrink-0">{icon}</div>}
                <div className="min-w-0">
                  <h2 className="modal-title">{title}</h2>
                  {subtitle && <p className="modal-subtitle">{subtitle}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {actions}
                {!hideDefaultClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="modal-close"
                    aria-label="Cerrar"
                  >
                    <X className="w-4 h-4" aria-hidden={true} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="modal-body">{children}</div>
        </div>

        {/* ── Side panel ──────────────────────────────────────────────── */}
        {hasSidePanel && (
          <div
            className="hidden sm:flex flex-col shrink-0 rounded-lg border border-[var(--color-border-main)] shadow-[var(--shadow-modal)] overflow-hidden animate-in slide-in-from-right duration-300"
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
