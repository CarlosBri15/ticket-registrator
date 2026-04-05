/**
 * FinancialSummary — Displays the monetary summary of a report.
 * Single Card Redesign: High contrast, prominent totals, and icon-led breakdowns.
 */
import { TrendingUp, CheckCircle2, XCircle, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FinancialSummaryProps {
  status: string;
  currency: string;
  requestedAmount: number;
  approvedAmount: number;
  ticketsTotal: number;
}

export const FinancialSummary = ({
  status,
  currency,
  requestedAmount,
  approvedAmount,
  ticketsTotal,
}: FinancialSummaryProps) => {
  const { t } = useTranslation();
  const s = status.toUpperCase();

  const isApproved = s === "APPROVED" || s === "PAID";
  const isDeclined = s === "DECLINED" || s === "REJECTED";
  const rejected = Math.max(0, requestedAmount - approvedAmount);

  return (
    <div className="w-full space-y-6">
      {/* Principal Total Display */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-dark/40 mb-2">
          <Wallet className="w-3.5 h-3.5" />
          <span className="text-[10px] font-space-bold uppercase tracking-widest">
            {isApproved ? t("reportDetail.approved") : t("reportDetail.financialSummary")}
          </span>
        </div>
        <div className="flex justify-center items-baseline gap-2">
          <span className="text-[48px] font-space-bold tracking-tighter leading-none text-dark">
            {(isApproved ? approvedAmount : (isDeclined ? requestedAmount : ticketsTotal)).toFixed(2)}
          </span>
          <span className="text-xl font-space-bold text-dark/30">{currency}</span>
        </div>
      </div>

      {/* Structured Breakdown List */}
      <div className="space-y-3 pt-6 border-t-2 border-slate-100">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2.5 text-dark/40 font-space-bold uppercase text-[11px] tracking-wider">
            <TrendingUp className="w-4 h-4 opacity-50" />
            <span>SOLICITADO</span>
          </div>
          <span className="font-space-bold text-[14px] text-dark">{requestedAmount.toFixed(2)} {currency}</span>
        </div>

        {isApproved && (
          <>
            <div className="flex justify-between items-center px-1 text-success">
              <div className="flex items-center gap-2.5 font-space-bold uppercase text-[11px] tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>APROBADO</span>
              </div>
              <span className="font-space-bold text-[14px]">{approvedAmount.toFixed(2)} {currency}</span>
            </div>
            
            {rejected > 0 && (
              <div className="flex justify-between items-center px-1 text-danger">
                <div className="flex items-center gap-2.5 font-space-bold uppercase text-[11px] tracking-wider">
                  <XCircle className="w-4 h-4" />
                  <span>RECHAZADO</span>
                </div>
                <span className="font-space-bold text-[14px]">{rejected.toFixed(2)} {currency}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
