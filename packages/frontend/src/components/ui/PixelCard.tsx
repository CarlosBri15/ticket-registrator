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

/** Maps the legacy shadowOffset levels to modern soft shadows. */
const softShadow = (offset: number): string => {
  if (offset <= 2) return '0px 1px 5px rgba(0,0,0,0.07), 0px 1px 2px rgba(0,0,0,0.04)';
  if (offset <= 4) return '0px 2px 12px rgba(0,0,0,0.09), 0px 1px 3px rgba(0,0,0,0.05)';
  return '0px 6px 28px rgba(0,0,0,0.13), 0px 2px 6px rgba(0,0,0,0.06)';
};

const PRESSED_SHADOW = '0px 1px 3px rgba(0,0,0,0.04)';

interface PixelCardProps {
  children: ReactNode;
  /** Card background color. Defaults to surface-card. */
  bg?: string;
  /** Shadow level: 2=sm, 3-4=default, 6=hero. */
  shadowOffset?: number;
  /** Border radius in px. */
  radius?: number;
  /** Click handler — renders as <button> when provided. */
  onClick?: () => void;
  /** Keep card in the "active/selected" visual state. */
  active?: boolean;
  className?: string;
  borderColor?: string;
  shadowColor?: string;
}

export const PixelCard = ({
  children,
  bg = 'var(--color-surface-card, #FAFAF9)',
  shadowOffset = nbTokens.shadowCard,
  radius = 14,
  onClick,
  active = false,
  className = '',
  borderColor,
}: PixelCardProps) => {
  const Tag = onClick ? 'button' : 'div';

  const shadow = softShadow(shadowOffset);

  const style: CSSProperties = {
    backgroundColor: bg,
    borderRadius: radius,
    border: `1.5px solid ${borderColor || BORDER}`,
    boxShadow: active ? PRESSED_SHADOW : shadow,
    transition: 'transform 100ms ease, box-shadow 100ms ease',
    textAlign: 'left',
    cursor: onClick ? 'pointer' : 'default',
    outline: 'none',
  };

  const handleMouseDown = onClick
    ? (e: React.MouseEvent) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = PRESSED_SHADOW;
        el.style.transform = 'translateY(1px) scale(0.99)';
      }
    : undefined;

  const handleMouseUp = onClick
    ? (e: React.MouseEvent) => {
        const el = e.currentTarget as HTMLElement;
        if (!active) {
          el.style.boxShadow = shadow;
          el.style.transform = '';
        }
      }
    : undefined;

  const handleMouseLeave = onClick
    ? (e: React.MouseEvent) => {
        const el = e.currentTarget as HTMLElement;
        if (!active) {
          el.style.boxShadow = shadow;
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
