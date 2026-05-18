import { useEffect, useState, type ReactNode } from "react";

const MAIN_W = 920;
const SIDE_PANEL_W = 420;
const SIDE_GAP = 16;
const OUTER_PADDING = 24;
/** Must match the Tailwind `duration-300` used on the animation classes. */
const ANIMATION_MS = 300;

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Optional companion panel that slides in beside the main drawer panel (e.g. receipt image). */
  leftSidePanel?: ReactNode;
}

/**
 * Right-anchored slide-in drawer. The main panel sits at a fixed position
 * (right: 24px, width: 920px) so toggling the side panel never shifts it.
 * The side panel is positioned absolutely to the left of the main panel and
 * slides in/out independently from its right edge — visually "unfolding"
 * from behind the main panel.
 *
 * Exit animations: when `isOpen` flips to false (or `leftSidePanel` drops),
 * the affected panel applies `animate-out slide-out-to-right` and only
 * unmounts after the animation completes, so neither closing feels abrupt.
 */
export const Drawer = ({
  isOpen,
  onClose,
  children,
  leftSidePanel,
}: DrawerProps) => {
  // ── Main panel mount tracking ─────────────────────────────────────────────
  const [mounted, setMounted] = useState(isOpen);
  const closingMain = mounted && !isOpen;

  // Mount synchronously when `isOpen` flips true. Adjusting state during
  // render (the official React pattern) instead of inside an effect avoids
  // the cascading-render warning for "setState in effect".
  if (isOpen && !mounted) {
    setMounted(true);
  }

  // ── Image panel mount tracking — keep last content during exit so the
  //    sliding-out element still renders after the parent set it to null.
  const wantsImage = Boolean(leftSidePanel) && isOpen;
  const [imageMounted, setImageMounted] = useState<boolean>(wantsImage);
  const [cachedImageContent, setCachedImageContent] = useState<ReactNode>(
    leftSidePanel ?? null,
  );
  const closingImage = imageMounted && !wantsImage;

  if (wantsImage && !imageMounted) {
    setImageMounted(true);
    setCachedImageContent(leftSidePanel);
  } else if (wantsImage && cachedImageContent !== leftSidePanel) {
    // Content swapped while panel stays open — refresh cached node so the
    // visible side panel reflects the latest prop.
    setCachedImageContent(leftSidePanel);
  }

  // Body scroll lock + Escape close while the drawer is mounted.
  useEffect(() => {
    if (!mounted) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    globalThis.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "unset";
      globalThis.removeEventListener("keydown", handleEscape);
    };
  }, [mounted, onClose]);

  // Delayed unmount of the main panel — only setState happens inside the
  // timeout callback (not synchronously in the effect body), so the
  // react-hooks/set-state-in-effect rule stays clean.
  useEffect(() => {
    if (isOpen || !mounted) return;
    const timeout = setTimeout(() => setMounted(false), ANIMATION_MS);
    return () => clearTimeout(timeout);
  }, [isOpen, mounted]);

  // Delayed unmount of the image side panel.
  useEffect(() => {
    if (wantsImage || !imageMounted) return;
    const timeout = setTimeout(() => {
      setImageMounted(false);
      setCachedImageContent(null);
    }, ANIMATION_MS);
    return () => clearTimeout(timeout);
  }, [wantsImage, imageMounted]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className={`absolute inset-0 bg-dark/40 backdrop-blur-[2px] ${
          closingMain ? "drawer-fade-out" : "drawer-fade-in"
        }`}
      />

      {/* Image side panel — sits to the LEFT of the main panel and slides in/
          out from its right edge. The lower z-index lets the main panel
          obscure the early frames of the animation so the image visually
          "unfolds" from behind it. */}
      {imageMounted && (
        <div
          className="hidden lg:block absolute z-[1]"
          style={{
            top: OUTER_PADDING,
            bottom: OUTER_PADDING,
            right: OUTER_PADDING + MAIN_W + SIDE_GAP,
            width: SIDE_PANEL_W,
          }}
        >
          <div
            className={`h-full rounded-[2px] border border-[var(--color-border-main)] bg-[var(--color-surface-card-soft)] shadow-[var(--shadow-modal)] overflow-hidden ${
              closingImage ? "drawer-slide-out-right" : "drawer-slide-in-right"
            }`}
          >
            {cachedImageContent}
          </div>
        </div>
      )}

      {/* Main drawer panel — fixed position, never moves on side-panel toggle. */}
      <div
        className="absolute z-[2]"
        style={{
          top: OUTER_PADDING,
          bottom: OUTER_PADDING,
          right: OUTER_PADDING,
          width: `min(${MAIN_W}px, calc(100vw - ${OUTER_PADDING * 2}px))`,
        }}
      >
        <div
          className={`drawer-panel h-full flex flex-col ${
            closingMain ? "drawer-slide-out-right" : "drawer-slide-in-right"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
