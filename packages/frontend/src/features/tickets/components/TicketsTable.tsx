import { memo, useMemo, type ReactNode } from "react";
import { format, type Locale } from 'date-fns';
import { FileText, ChevronRight } from 'lucide-react';
import { type ITicket, buildCategoryMixFromItems } from '@ticket-registrator/shared';
import { useDateLocale } from '../../../hooks/useDateLocale';
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { TableHeader } from "../../../components/ui/TableHeader";
import { CategoryMixBar } from "../../../components/ui/CategoryMixBar";
import {
  TICKETS_TABLE_GRID,
  TICKETS_TABLE_GRID_REVIEW,
} from "../../../constants/gridLayouts";

// ─── Sub-components ────────────────────────────────────────────────────────────

/**
 * Row shape accepted by `TicketsTable`. Extends `ITicket` with an optional
 * `reportName` that lights up the second meta line (used by the all-tickets
 * screen, where each row needs to disambiguate which report it belongs to).
 */
export type TicketsTableRow = ITicket & { reportName?: string | null };

interface TicketRowContentProps {
  ticket: TicketsTableRow;
  dateLocale: Locale;
  t: TFunction;
  showReviewBreakdown: boolean;
}

const TicketRowContent = ({
  ticket,
  dateLocale,
  t,
  showReviewBreakdown,
}: TicketRowContentProps) => {
  const gridStyle = {
    gridTemplateColumns: showReviewBreakdown
      ? TICKETS_TABLE_GRID_REVIEW
      : TICKETS_TABLE_GRID,
  };

  const mix = buildCategoryMixFromItems(ticket.items, t("reports.uncategorized"));
  const itemsLabel = `${ticket.items?.length ?? 0} ${t("reportDetail.items")}`;

  // Rejected amount is derived per-ticket from items with `Rejected` status —
  // there's no persisted column for it (only `approved_amount`). Pending
  // items are excluded from both buckets.
  const rejectedAmount = (ticket.items ?? []).reduce(
    (sum, item) => (item.status === "Rejected" ? sum + (item.amount ?? 0) : sum),
    0,
  );

  return (
    <div className="w-full grid items-center gap-4 px-4 py-3.5" style={gridStyle}>
      {/* Establecimiento */}
      <div className="min-w-0 text-left flex flex-col gap-1.5">
        <div>
          <p className="font-sans-semibold text-dark text-[14px] truncate leading-snug">
            {ticket.location_name ?? t("reportDetail.noTicketName")}
          </p>
          <p className="font-sans-medium text-dark/40 text-[11px] mt-0.5 truncate leading-none">
            {itemsLabel}
            {ticket.reportName && (
              <>
                <span aria-hidden="true" className="text-dark/25"> · </span>
                <span className="text-dark/55">{ticket.reportName}</span>
              </>
            )}
          </p>
        </div>
        <CategoryMixBar segments={mix} />
      </div>

      {/* Fecha Subida */}
      <p className="font-sans-medium text-[13.5px] text-dark/65 text-center whitespace-nowrap tabular-nums">
        {ticket.createdAt ? format(new Date(ticket.createdAt), "dd MMM yyyy", { locale: dateLocale }) : "—"}
      </p>

      {/* Fecha Ticket */}
      <p className="font-sans-medium text-[13.5px] text-dark/65 text-center whitespace-nowrap tabular-nums">
        {ticket.date ? format(new Date(ticket.date), "dd MMM yyyy", { locale: dateLocale }) : "—"}
      </p>

      {/* Importe */}
      <p className="font-sans-bold text-dark tabular-nums text-right text-[16px] leading-none">
        {ticket.amount == null ? "—" : ticket.amount.toLocaleString()}
        {ticket.currency && (
          <span className="font-sans-medium ml-1 text-dark/50 text-[12px]">
            {ticket.currency}
          </span>
        )}
      </p>

      {showReviewBreakdown && (
        <>
          {/* Aprobado — same font scale as the Importe column to keep numeric
              columns visually equivalent. `text-success` resolves to the
              `--color-success` kit token (#16A34A). */}
          <p className="font-sans-bold text-success tabular-nums text-right text-[16px] leading-none">
            {ticket.approved_amount > 0 ? ticket.approved_amount.toLocaleString() : (
              <span className="text-dark/25 font-sans-medium">—</span>
            )}
            {ticket.approved_amount > 0 && ticket.currency && (
              <span className="font-sans-medium ml-1 text-dark/50 text-[12px]">
                {ticket.currency}
              </span>
            )}
          </p>
          {/* Rechazado — same font scale; `text-danger` → `--color-danger`
              (#DC2626) from the kit. */}
          <p className="font-sans-bold text-danger tabular-nums text-right text-[16px] leading-none">
            {rejectedAmount > 0 ? rejectedAmount.toLocaleString() : (
              <span className="text-dark/25 font-sans-medium">—</span>
            )}
            {rejectedAmount > 0 && ticket.currency && (
              <span className="font-sans-medium ml-1 text-dark/50 text-[12px]">
                {ticket.currency}
              </span>
            )}
          </p>
        </>
      )}

      {/* Chevron */}
      <ChevronRight className="w-4 h-4 text-dark/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100" />
    </div>
  );
};

// ─── Exported pieces ──────────────────────────────────────────────────────────

interface TicketsTableHeaderProps {
  /** Adds Approved + Rejected columns to the right of the requested amount. */
  showReviewBreakdown?: boolean;
}

/**
 * Column header for the tickets table. Reused by the all-tickets screen,
 * which composes the table manually (grouping by date) instead of relying on
 * the main `<TicketsTable />`.
 */
export const TicketsTableHeader = ({
  showReviewBreakdown = false,
}: TicketsTableHeaderProps = {}) => {
  const { t } = useTranslation();
  const baseColumns = [
    { label: t("reportDetail.location") },
    { label: t("ticketDetail.uploadedOn"), align: "center" as const },
    { label: t("common.date"), align: "center" as const },
    { label: t("common.amount"), align: "right" as const },
  ];
  const reviewColumns = showReviewBreakdown
    ? [
        { label: t("reportDetail.approved"), align: "right" as const },
        { label: t("reportDetail.rejected"), align: "right" as const },
      ]
    : [];
  return (
    <TableHeader
      gridTemplate={
        showReviewBreakdown ? TICKETS_TABLE_GRID_REVIEW : TICKETS_TABLE_GRID
      }
      withLeadingSlot={false}
      columns={[...baseColumns, ...reviewColumns]}
    />
  );
};

interface TicketRowProps {
  ticket: TicketsTableRow;
  onClick?: (ticket: TicketsTableRow) => void;
  showReviewBreakdown?: boolean;
}

/**
 * Single clickable row matching the canonical tickets table layout. Same
 * styling as the rows inside `<TicketsTable />`.
 */
export const TicketRow = ({
  ticket,
  onClick,
  showReviewBreakdown = false,
}: TicketRowProps) => {
  const dateLocale = useDateLocale();
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => onClick?.(ticket)}
      className="group w-full text-left border-b border-[var(--color-border-main)] last:border-b-0 hover:bg-[var(--color-secondary)] cursor-pointer transition-colors duration-100"
    >
      <TicketRowContent
        ticket={ticket}
        dateLocale={dateLocale}
        t={t}
        showReviewBreakdown={showReviewBreakdown}
      />
    </button>
  );
};

/**
 * Skeleton row matching the rest of the row layout — used while data is in
 * flight in any view that consumes the canonical ticket row.
 */
export const TicketRowSkeleton = () => (
  <div className="h-[64px] w-full bg-white border-b border-[var(--color-border-main)] animate-pulse" />
);

// ─── Main Component ───────────────────────────────────────────────────────────

interface TicketsTableProps {
  tickets: TicketsTableRow[];
  isLoading?: boolean;
  onTicketClick?: (ticket: TicketsTableRow) => void;
  /** Optional CTA shown inside the empty state (e.g. "Scan first ticket"). */
  emptyAction?: ReactNode;
  /** Renders Approved / Rejected columns alongside the requested amount. */
  showReviewBreakdown?: boolean;
}

export const TicketsTable = memo(({
  tickets,
  isLoading,
  onTicketClick,
  emptyAction,
  showReviewBreakdown = false,
}: TicketsTableProps) => {
  const { t } = useTranslation();

  const sortedTickets = useMemo(() => {
    return [...tickets].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [tickets]);

  if (isLoading) {
    return (
      <div className="flex flex-col">
        {[1, 2, 3].map((i) => (
          <TicketRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center py-14 gap-3 text-center border-b border-[var(--color-border-main)]">
        <FileText className="w-4 h-4 text-dark/25" aria-hidden={true} />
        <p className="font-sans-medium text-[13px] text-dark/55">
          {t("reportDetail.startDigitalizing")}
        </p>
        {emptyAction && <div className="mt-1">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <TicketsTableHeader showReviewBreakdown={showReviewBreakdown} />
      <div className="flex flex-col">
        {sortedTickets.map((ticket, idx) => (
          <TicketRow
            key={ticket.id ?? `ticket-${idx}`}
            ticket={ticket}
            onClick={onTicketClick}
            showReviewBreakdown={showReviewBreakdown}
          />
        ))}
      </div>
    </div>
  );
});
