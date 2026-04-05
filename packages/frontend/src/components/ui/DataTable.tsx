/**
 * DataTable — Generic reusable table component.
 *
 * Follows the neobrutalista design system:
 *   - 2px solid border, rounded-xl container
 *   - Hard offset shadow (3px)
 *   - Header with surface-header bg and bold uppercase labels
 *   - Rows separated by 2px borders
 *   - Hover state with subtle bg shift
 */

import { type ReactNode } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  key: string;
  header: string;
  /** Optional custom renderer. Receives the full row object. */
  render?: (row: T, index: number) => ReactNode;
  /** Tailwind classes applied to every td in this column */
  cellClassName?: string;
  /** Tailwind classes applied to the th */
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  /** Key extractor for React list rendering */
  rowKey: (row: T, index: number) => string | number;
  isLoading?: boolean;
  /** Optional empty state message */
  emptyMessage?: string;
  /** Optional empty state node (overrides emptyMessage) */
  emptyState?: ReactNode;
  /** Click handler per row */
  onRowClick?: (row: T) => void;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  emptyMessage = 'No hay datos para mostrar.',
  emptyState,
  onRowClick,
  className = '',
}: DataTableProps<T>) {
  return (
    <div
      className={`bg-[var(--color-surface-card)] border-2 border-border-main rounded-xl overflow-hidden shadow-hard ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">

          {/* ── Header ── */}
          <thead>
            <tr className="bg-[var(--color-surface-header)] border-b-2 border-border-main">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-[10px] font-space-bold text-dark/50 uppercase tracking-widest whitespace-nowrap ${col.headerClassName ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <div className="flex justify-center">
                    <LoadingSpinner />
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  {emptyState ?? (
                    <p className="text-sm font-space text-dark/40">{emptyMessage}</p>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={rowKey(row, index)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={[
                    'border-b border-border-main last:border-b-0',
                    'transition-colors duration-100',
                    onRowClick
                      ? 'cursor-pointer hover:bg-[var(--color-surface)] active:bg-brand/5'
                      : '',
                  ].join(' ')}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-sm font-space text-dark align-middle ${col.cellClassName ?? ''}`}
                    >
                      {col.render
                        ? col.render(row, index)
                        : (row as Record<string, unknown>)[col.key] as ReactNode ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
