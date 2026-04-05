import { useTranslation } from "react-i18next";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import type { ITicket } from "@ticket-registrator/shared";

interface PhysicalReceiptCardProps {
  ticket: ITicket;
  formattedDate: string | null;
  formattedCreatedAt: string | null;
  paymentValue: string | null;
}

export const PhysicalReceiptCard = ({
  ticket,
  formattedDate,
  formattedCreatedAt,
  paymentValue,
}: PhysicalReceiptCardProps) => {
  const { t } = useTranslation();

  // Deterministic fake barcode based on ticket ID
  const seed = ticket.id
    ? ticket.id.charCodeAt(ticket.id.length - 1) + ticket.id.charCodeAt(0)
    : 42;

  return (
    <div className="relative w-full bg-[var(--color-surface-card)] border-2 border-border-main p-6 shadow-hard-lg font-mono text-dark">
      {/* Header */}
      <div className="text-center pb-5 border-b-2 border-dashed border-border-main">
        <h3 className="text-xl font-bold tracking-[0.2em] uppercase mb-1">
          {t("ticketDetail.receipt").toUpperCase()}
        </h3>
        <p className="text-[10px] text-dark/40 uppercase font-bold tracking-[0.3em]">
          NO.{ticket.id?.substring(0, 8) || "00000000"}
        </p>
      </div>

      {/* Amount Box */}
      <div className="py-7 text-center border-b-2 border-dashed border-border-main">
        <p className="text-[10px] font-bold text-dark/40 mb-1 tracking-[0.1em] uppercase">
          {t("ticketDetail.totalAmount")}
        </p>
        <div className="flex justify-center items-baseline gap-1.5">
          <span className="text-[42px] leading-none font-bold tracking-tighter">
            {ticket.amount == null ? "—" : ticket.amount.toLocaleString()}
          </span>
          <span className="text-lg font-bold text-dark/60">{ticket.currency || ""}</span>
        </div>
      </div>

      {/* Key Details */}
      <div className="py-6 space-y-3.5 text-[13px] border-b-2 border-dashed border-border-main">
        <div className="flex justify-between items-start gap-4">
          <span className="text-dark/40 font-bold uppercase tracking-wider shrink-0">
            {t("common.date")}
          </span>
          <span className="font-bold text-right">{formattedDate || "—"}</span>
        </div>
        <div className="flex justify-between items-start gap-4">
          <span className="text-dark/40 font-bold uppercase tracking-wider shrink-0">
            {t("ticketDetail.merchant")}
          </span>
          <span className="font-bold text-right line-clamp-2 leading-snug break-words">
            {ticket.location_name || "—"}
          </span>
        </div>
        <div className="flex justify-between items-start gap-4">
          <span className="text-dark/40 font-bold uppercase tracking-wider shrink-0">
            {t("confirmForm.address")}
          </span>
          <span className="font-bold text-right line-clamp-2 leading-snug text-xs mt-0.5 break-words">
            {ticket.location_address || "—"}
          </span>
        </div>
        <div className="flex justify-between items-start gap-4">
          <span className="text-dark/40 font-bold uppercase tracking-wider shrink-0">
            {t("ticketDetail.payment")}
          </span>
          <span className="font-bold text-right uppercase">{paymentValue || "—"}</span>
        </div>
      </div>

      <div className="pt-6 pb-2">
        <div className="flex justify-between items-center mb-6">
          <StatusBadge status={ticket.status} size="sm" />
          {ticket.expense_type && (
            <span className="text-[10px] font-bold text-brand uppercase tracking-wider px-2 py-1 border-2 border-brand/40 bg-brand/5">
              {ticket.expense_type}
            </span>
          )}
        </div>

        {/* Barcode visual */}
        <div className="w-full h-12 opacity-30 flex justify-between items-end px-2 mix-blend-multiply mb-3">
          {[...Array(30)].map((_, i) => {
            const isThick = (seed * i * 3) % 7 === 0;
            const isMid = (seed * i * 7) % 5 === 0;
            const isTall = (seed * i * 11) % 3 === 0;
            return (
              <div
                key={i}
                className="bg-dark"
                style={{
                  width: isThick ? "4px" : isMid ? "2.5px" : "1px",
                  height: isTall ? "100%" : "80%",
                }}
              />
            );
          })}
        </div>
        <p className="text-center text-[9px] text-dark/30 tracking-[0.2em] font-bold uppercase">
          {t("ticketDetail.uploadedOn").toUpperCase()} {formattedCreatedAt || "—"}
        </p>
      </div>
    </div>
  );
};
