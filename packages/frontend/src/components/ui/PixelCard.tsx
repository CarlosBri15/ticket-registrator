/**
 * PixelCard — Web equivalent of the mobile PixelCard component.
 *
 * Replicates the exact neobrutalista visual:
 *   - 2px solid dark border  (BORDER_WIDTH = 2)
 *   - border-radius: 8px     (RADIUS = 8)
 *   - Hard offset shadow (no blur): 3px default, 6px for hero, 2px for small
 *   - Press animation: shadow collapses + card translates toward shadow
 *
 * The `active` prop keeps the card in the pressed state (for filter pills
 * that should stay "selected" after being clicked).
 */

import { type ReactNode, type CSSProperties } from 'react';

const SHADOW = 'rgba(26, 26, 26, 0.15)';

interface PixelCardProps {
  children: ReactNode;
  /** Card background color. Defaults to white (#FFFFFF). */
  bg?: string;
  /** Hard shadow offset in px. 3=default, 6=hero, 2=badge. */
  shadowOffset?: number;
  /** Border radius in px. Defaults to 8 (RADIUS). */
  radius?: number;
  /** Click handler — renders as <button> when provided. */
  onClick?: () => void;
  /** Keep card in the "pressed" visual state (translated, no shadow). */
  active?: boolean;
  className?: string;
}

export const PixelCard = ({
  children,
  bg = '#FFFFFF',
  shadowOffset = 3,
  radius = 8,
  onClick,
  active = false,
  className = '',
}: PixelCardProps) => {
  const Tag = onClick ? 'button' : 'div';

  const style: CSSProperties = {
    backgroundColor: bg,
    borderRadius: radius,
    border: `2px solid ${SHADOW}`,
    boxShadow: active ? 'none' : `${shadowOffset}px ${shadowOffset}px 0px ${SHADOW}`,
    transform: active ? `translate(${shadowOffset}px, ${shadowOffset}px)` : undefined,
    transition: 'transform 80ms ease, box-shadow 80ms ease',
    // width is NOT forced here — let callers control via className (e.g. "w-full")
    textAlign: 'left',
    cursor: onClick ? 'pointer' : 'default',
    outline: 'none',
  };

  // On :active pseudo (transient press during mouse hold), collapse shadow + translate.
  // This uses a data attribute trick so CSS can target it without overriding inline style.
  const handleMouseDown = onClick
    ? (e: React.MouseEvent) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = 'none';
        el.style.transform = `translate(${shadowOffset}px, ${shadowOffset}px)`;
      }
    : undefined;

  const handleMouseUp = onClick
    ? (e: React.MouseEvent) => {
        const el = e.currentTarget as HTMLElement;
        if (!active) {
          el.style.boxShadow = `${shadowOffset}px ${shadowOffset}px 0px ${SHADOW}`;
          el.style.transform = '';
        }
      }
    : undefined;

  const handleMouseLeave = onClick
    ? (e: React.MouseEvent) => {
        const el = e.currentTarget as HTMLElement;
        if (!active) {
          el.style.boxShadow = `${shadowOffset}px ${shadowOffset}px 0px ${SHADOW}`;
          el.style.transform = '';
        }
      }
    : undefined;

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      style={style}
      onClick={onClick}
      onMouseDown={handleMouseDown as any}
      onMouseUp={handleMouseUp as any}
      onMouseLeave={handleMouseLeave as any}
      className={className}
    >
      {children}
    </Tag>
  );
};
