import { memo, useMemo } from "react";
import { format, type Locale } from 'date-fns';
import { CreditCard, Banknote, FileText, ChevronRight } from 'lucide-react';
import { type ITicket } from '@ticket-registrator/shared';
import { useDateLocale } from '../../../hooks/useDateLocale';
import { useTranslation } from "react-i18next";
import { TableHeader } from "../../../components/ui/TableHeader";

// ─── Sub-components ────────────────────────────────────────────────────────────

const TicketRowContent = ({
  ticket,
  dateLocale,
  t,
}: {
  ticket: ITicket;
  dateLocale: Locale;
  t: any;
}) => {
  const isCard = ticket.payment_type?.toLowerCase().includes('card') || ticket.payment_type?.toLowerCase().includes('tarjeta');
  const PaymentIcon = isCard ? CreditCard : Banknote;

  // Grid matching the TableHeader: 32px 1fr 100px 120px 120px 100px 16px
  const gridStyle = { gridTemplateColumns: "32px 1fr 100px 120px 120px 100px 16px" };

  return (
    <div className="w-full grid items-center gap-4 px-4 py-3.5" style={gridStyle}>
      {/* Icono */}
      <div className="w-8 h-8 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center">
        <FileText className="w-3.5 h-3.5 text-dark/40" />
      </div>

      {/* Establecimiento */}
      <div className="min-w-0 text-left">
        <p className="font-sans-semibold text-dark text-[14px] truncate leading-snug">
          {ticket.location_name ?? t("reportDetail.noTicketName")}
        </p>
        <p className="font-sans-medium text-dark/40 text-[11px] mt-0.5 truncate leading-none">
          {ticket.items?.length ?? 0} {t("reportDetail.items")}
        </p>
      </div>

      {/* Pago */}
      <div className="flex items-center justify-center">
        {ticket.payment_type ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--color-secondary)] border border-[var(--color-border-main)] text-dark/50 text-[10px] font-sans-medium whitespace-nowrap">
            <PaymentIcon className="w-3 h-3" />
            <span className="leading-none">{ticket.payment_type}</span>
          </div>
        ) : (
          <span className="text-dark/20 text-[11px]">—</span>
        )}
      </div>

      {/* Fecha Subida */}
      <p className="font-sans-medium text-[12px] text-dark/60 text-center whitespace-nowrap tabular-nums">
        {ticket.createdAt ? format(new Date(ticket.createdAt), "dd MMM yyyy", { locale: dateLocale }) : "—"}
      </p>

      {/* Fecha Ticket */}
      <p className="font-sans-medium text-[12px] text-dark/60 text-center whitespace-nowrap tabular-nums">
        {ticket.date ? format(new Date(ticket.date), "dd MMM yyyy", { locale: dateLocale }) : "—"}
      </p>

      {/* Importe */}
      <p className="font-sans-bold text-dark tabular-nums text-right text-[14px] leading-none">
        {ticket.amount == null ? "—" : ticket.amount.toLocaleString()}
        {ticket.currency && (
          <span className="font-sans-medium ml-1 text-dark/50 text-[11px]">
            {ticket.currency}
          </span>
        )}
      </p>

      {/* Chevron */}
      <ChevronRight className="w-4 h-4 text-dark/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100" />
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface TicketsTableProps {
  tickets: ITicket[];
  isLoading?: boolean;
  onTicketClick?: (ticket: ITicket) => void;
}

export const TicketsTable = memo(({ tickets, isLoading, onTicketClick }: TicketsTableProps) => {
  const dateLocale = useDateLocale();
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
          <div key={i} className="h-[64px] w-full bg-white border-b border-[var(--color-border-main)] animate-pulse" />
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center py-14 gap-2 text-center border-b border-[var(--color-border-main)]">
        <FileText className="w-4 h-4 text-dark/25 mb-1" />
        <p className="font-sans-medium text-[13px] text-dark/55">
          {t("reportDetail.startDigitalizing")}
        </p>
      </div>
    );
  }

  const gridTemplate = "32px 1fr 100px 120px 120px 100px 16px";

  return (
    <div className="w-full flex flex-col">
      <TableHeader 
        gridTemplate={gridTemplate}
        columns={[
          { label: t("reportDetail.location") },
          { label: t("ticketDetail.payment"), align: "center" },
          { label: t("ticketDetail.uploadedOn"), align: "center" },
          { label: t("common.date"), align: "center" },
          { label: t("common.amount"), align: "right" },
        ]}
      />
      <div className="flex flex-col">
        {sortedTickets.map((ticket, idx) => (
          <button
            key={ticket.id ?? `ticket-${idx}`}
            type="button"
            onClick={() => onTicketClick?.(ticket)}
            className="group w-full text-left border-b border-[var(--color-border-main)] last:border-b-0 hover:bg-[var(--color-secondary)] cursor-pointer transition-colors duration-100"
          >
            <TicketRowContent ticket={ticket} dateLocale={dateLocale} t={t} />
          </button>
        ))}
      </div>
    </div>
  );
});
