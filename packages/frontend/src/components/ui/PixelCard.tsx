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
import { nbTokens } from '../../styles/theme';

// Border — uses global CSS variable for consistency.
const BORDER = 'var(--color-border-main)';
// Shadow — use global CSS variable so it's not hardcoded
const SHADOW = 'var(--color-shadow-main, #D4D4D8)';

interface PixelCardProps {
  children: ReactNode;
  /** Card background color. Defaults to white (#FFFFFF). */
  bg?: string;
  /** Hard shadow offset in px. 3=default, 6=hero, 2=badge. */
  shadowOffset?: number;
  /** Border radius in px. */
  radius?: number;
  /** Click handler — renders as <button> when provided. */
  onClick?: () => void;
  /** Keep card in the "pressed" visual state (translated, no shadow). */
  active?: boolean;
  className?: string;
  borderColor?: string;
  shadowColor?: string;
}

export const PixelCard = ({
  children,
  bg = 'var(--color-surface-card, #FAFAF9)',
  shadowOffset = nbTokens.shadowCard,
  radius = nbTokens.radiusCard,
  onClick,
  active = false,
  className = '',
  borderColor,
  shadowColor,
}: PixelCardProps) => {
  const Tag = onClick ? 'button' : 'div';

  const style: CSSProperties = {
    backgroundColor: bg,
    borderRadius: radius ?? 'var(--radius-xl, 14px)',
    border: `2px solid ${borderColor || BORDER}`,
    boxShadow: active ? 'none' : `${shadowOffset}px ${shadowOffset}px 0px ${shadowColor || SHADOW}`,
    transform: active ? `translate(${shadowOffset}px, ${shadowOffset}px)` : undefined,
    transition: 'transform 80ms ease, box-shadow 80ms ease',
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
          el.style.boxShadow = `${shadowOffset}px ${shadowOffset}px 0px ${shadowColor || SHADOW}`;
          el.style.transform = '';
        }
      }
    : undefined;

  const handleMouseLeave = onClick
    ? (e: React.MouseEvent) => {
        const el = e.currentTarget as HTMLElement;
        if (!active) {
          el.style.border = `2px solid ${borderColor || BORDER}`;
          el.style.boxShadow = `${shadowOffset}px ${shadowOffset}px 0px ${shadowColor || SHADOW}`;
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
