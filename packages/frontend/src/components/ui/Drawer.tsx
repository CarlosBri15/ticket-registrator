import { type ReactNode, useEffect } from "react";

const MAIN_W = 760;
const SIDE_PANEL_W = 420;
const SIDE_GAP = 16;

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Optional companion panel that slides in from the LEFT of the drawer (e.g. receipt image). */
  leftSidePanel?: ReactNode;
}

/**
 * Right-anchored slide-in drawer. Used for the ticket detail sheet.
 * Renders a 760px panel against the right edge plus an optional left
 * companion panel that opens beside it for side-by-side comparison.
 */
export const Drawer = ({ isOpen, onClose, children, leftSidePanel }: DrawerProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    globalThis.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "unset";
      globalThis.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasLeft = Boolean(leftSidePanel);
  const totalW = hasLeft ? MAIN_W + SIDE_GAP + SIDE_PANEL_W : MAIN_W;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute inset-0 bg-dark/40 backdrop-blur-[2px] animate-in fade-in duration-200"
      />

      <div
        className="relative flex items-stretch gap-4 h-full p-6 pl-0"
        style={{
          width: `min(${totalW + 48}px, 100vw)`,
          transition: "width 280ms var(--ease-out, cubic-bezier(.2,.8,.2,1))",
        }}
      >
        {hasLeft && (
          <div
            className="hidden lg:flex flex-col shrink-0 rounded-[2px] border border-[var(--color-border-main)] bg-[var(--color-surface-card-soft)] shadow-[var(--shadow-modal)] overflow-hidden animate-in slide-in-from-left duration-300"
            style={{ width: SIDE_PANEL_W }}
          >
            {leftSidePanel}
          </div>
        )}

        <div
          className="drawer-panel relative flex flex-col shrink-0 animate-in slide-in-from-right duration-300"
          style={{ width: `min(${MAIN_W}px, 100%)` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
