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

  return (
    <div className="relative w-full">
      <div className="w-full bg-white border-x border-t border-border-main rounded-t-xl overflow-hidden shadow-sm">
      {/* Amount Section */}
      <div className="p-8 text-center bg-[#FAFAF8]/50 border-b border-border-main">
        <p className="text-[11px] font-sans-bold text-dark/30 mb-2">
          {t("ticketDetail.totalAmount")}
        </p>
        <div className="flex justify-center items-baseline gap-2">
          <span className="text-[48px] leading-none font-sans-bold text-dark tracking-tighter">
            {ticket.amount == null ? "—" : ticket.amount.toLocaleString()}
          </span>
          <span className="text-xl font-sans-bold text-dark/40">{ticket.currency || ""}</span>
        </div>
      </div>

      {/* Details List */}
      <div className="p-6 space-y-5">
        <div className="flex justify-between items-baseline py-1 border-b border-border-main/40 last:border-0">
          <span className="text-[11px] font-sans-bold text-dark/30 shrink-0">
            {t("common.date")}
          </span>
          <span className="text-[13px] font-sans-bold text-dark">{formattedDate || "—"}</span>
        </div>
        <div className="flex justify-between items-start py-1 border-b border-border-main/40 last:border-0">
          <span className="text-[11px] font-sans-bold text-dark/30 shrink-0 mt-0.5">
            {t("ticketDetail.merchant")}
          </span>
          <span className="text-[13px] font-sans-bold text-dark text-right max-w-[200px] leading-snug">
            {ticket.location_name || "—"}
          </span>
        </div>
        <div className="flex justify-between items-start py-1 border-b border-border-main/40 last:border-0">
          <span className="text-[11px] font-sans-bold text-dark/30 shrink-0 mt-0.5">
            {t("confirmForm.address")}
          </span>
          <span className="text-[12px] font-sans-semibold text-dark/60 text-right max-w-[220px] leading-relaxed">
            {ticket.location_address || "—"}
          </span>
        </div>
        <div className="flex justify-between items-baseline py-1 border-b border-border-main/40 last:border-0">
          <span className="text-[11px] font-sans-bold text-dark/30 shrink-0">
            {t("ticketDetail.payment")}
          </span>
          <span className="text-[13px] font-sans-bold text-dark">{paymentValue || "—"}</span>
        </div>

        <div className="pt-4 flex justify-between items-center">
          <StatusBadge status={ticket.status} />
          {ticket.expense_type && (
            <span className="text-[10px] font-sans-bold text-dark/40 bg-dark/5 px-2 py-1 rounded-md">
              {ticket.expense_type}
            </span>
          )}
        </div>
      </div>

      <div className="bg-[#FAFAF8] px-6 py-3 border-t border-border-main flex justify-between items-center text-[10px] font-sans-bold text-dark/30">
        <span>Id: {ticket.id?.substring(0, 8) || "—"}</span>
        <span>
          {t("ticketDetail.uploadedOn").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())} {formattedCreatedAt || "—"}
        </span>
      </div>
      </div>
      
      {/* ── Zigzag Bottom ────────────────────────────────────────────────── */}
      <div 
        className="h-2 w-full bg-white border-x border-b border-border-main"
        style={{
          maskImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'8\' viewBox=\'0 0 20 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0.5L5 5.5L10 0.5L15 5.5L20 0.5V8H0V0.5Z\' fill=\'black\'/%3E%3C/svg%3E")',
          maskRepeat: 'repeat-x',
          maskSize: '20px 8px',
          WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'8\' viewBox=\'0 0 20 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0.5L5 5.5L10 0.5L15 5.5L20 0.5V8H0V0.5Z\' fill=\'black\'/%3E%3C/svg%3E")',
          WebkitMaskRepeat: 'repeat-x',
          WebkitMaskSize: '20px 8px',
          marginTop: '-1px'
        }}
      />
    </div>
  );
};
