/**
 * ListCard — Generic grouped list container.
 *
 * Renders N children inside a single card with divide-y separators.
 * Use instead of N individual PixelCards when the items belong to the same
 * logical list (reports, tickets, users, departments…).
 *
 * Usage:
 *   <ListCard>
 *     {items.map(item => <MyRowItem key={item.id} {...item} />)}
 *   </ListCard>
 */

import type { ReactNode } from 'react';

interface ListCardProps {
  children: ReactNode;
  className?: string;
}

export const ListCard = ({ children, className = '' }: ListCardProps) => (
  <div
    className={`
      bg-[var(--color-surface-card)]
      rounded-2xl
      border border-[var(--color-border-main)]
      shadow-[var(--shadow-hard)]
      divide-y divide-[var(--color-border-main)]
      overflow-hidden
      ${className}
    `}
  >
    {children}
  </div>
);
