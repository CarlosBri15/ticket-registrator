import { Fragment, type ReactNode } from "react";
import { PageHeader, type PageHeaderStat } from "./PageHeader";
import { TableHeader } from "./TableHeader";

interface ColumnDef {
  label: ReactNode;
  align?: "left" | "center" | "right";
}

export interface ResourceListMessages {
  /** Title of the empty state when there are zero items at all. */
  emptyTitle: string;
  /** Description shown below the empty state title. */
  emptyDescription: string;
  /** Title shown when filters return zero matches (different from "no items"). */
  noResults: string;
  /** Label of the "clear filters" button shown alongside no-results. */
  clearFilters: string;
  /** Optional label next to the loading spinner. */
  loading?: string;
}

interface ResourceListScreenProps<T> {
  // ── Header ────────────────────────────────────────────────────────────────
  title: string;
  subtitle?: string;
  stats?: PageHeaderStat[];
  headerActions?: ReactNode;

  // ── Toolbar (search / filter UI rendered above the table) ────────────────
  toolbar?: ReactNode;

  // ── Table structure ──────────────────────────────────────────────────────
  gridTemplate: string;
  columns: ColumnDef[];

  // ── List state ───────────────────────────────────────────────────────────
  /** Items already filtered + paginated by the caller. */
  items: T[];
  /** Total raw items before any filter (used to choose empty vs no-match). */
  total: number;
  /** Total items after filter, before paginate (used to choose no-match). */
  filteredTotal: number;
  isLoading: boolean;

  // ── Renderers ────────────────────────────────────────────────────────────
  renderRow: (item: T) => ReactNode;
  keyOf: (item: T) => string;

  // ── State UI strings + handlers ──────────────────────────────────────────
  messages: ResourceListMessages;
  /** Replaces the default spinner when loading (e.g. skeleton rows). */
  loadingSkeleton?: ReactNode;
  onClearFilters?: () => void;

  // ── Optional footer (pagination, count text, …) ──────────────────────────
  footer?: ReactNode;
}

/**
 * Generic list-screen shell used by Departments / Organizations / Roles /
 * Users (and any future resource that fits the same pattern). Owns:
 *
 *   - PageHeader (title + subtitle + stats + action button)
 *   - Toolbar slot for search / filters
 *   - TableHeader (column labels)
 *   - The four body states: loading / empty / no-results / items
 *   - Footer slot for pagination or count summaries
 *
 * Callers keep their own React-Query hooks, mutations, modal state, row
 * rendering, and filtering logic — this component only renders the layout.
 */
export function ResourceListScreen<T>({
  title,
  subtitle,
  stats,
  headerActions,
  toolbar,
  gridTemplate,
  columns,
  items,
  total,
  filteredTotal,
  isLoading,
  renderRow,
  keyOf,
  messages,
  loadingSkeleton,
  onClearFilters,
  footer,
}: ResourceListScreenProps<T>) {
  const hasAny = total > 0;
  const hasFilteredResults = filteredTotal > 0;

  let body: ReactNode;
  if (isLoading) {
    body = loadingSkeleton ?? (
      <div className="flex flex-col items-center justify-center py-14 gap-2">
        <div className="w-4 h-4 border-2 border-dark/20 border-t-dark/60 rounded-full animate-spin" />
        {messages.loading ? (
          <p className="font-sans-medium text-[13px] text-dark/55">{messages.loading}</p>
        ) : null}
      </div>
    );
  } else if (!hasAny) {
    body = (
      <div className="flex flex-col items-center py-14 gap-2 text-center border-b border-[var(--color-border-main)]">
        <p className="font-sans-medium text-[13px] text-dark/55">{messages.emptyTitle}</p>
        <p className="font-sans-normal text-[12px] text-dark/40 max-w-sm">{messages.emptyDescription}</p>
      </div>
    );
  } else if (!hasFilteredResults) {
    body = (
      <div className="flex flex-col items-center py-14 gap-2 text-center border-b border-[var(--color-border-main)]">
        <p className="font-sans-medium text-[13px] text-dark/55">{messages.noResults}</p>
        {onClearFilters ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="font-sans-medium text-dark/50 text-[12px] underline underline-offset-2 hover:text-dark transition-colors mt-1"
          >
            {messages.clearFilters}
          </button>
        ) : null}
      </div>
    );
  } else {
    body = items.map((item) => (
      <Fragment key={keyOf(item)}>{renderRow(item)}</Fragment>
    ));
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={title} subtitle={subtitle} stats={stats} actions={headerActions} />

      <div className="flex flex-col gap-3">
        {toolbar}

        <div className="w-full">
          <TableHeader gridTemplate={gridTemplate} columns={columns} />
          {body}
        </div>

        {footer}
      </div>
    </div>
  );
}
