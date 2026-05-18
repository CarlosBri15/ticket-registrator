import { useTranslation } from "react-i18next";

interface FinancialSummaryProps {
  status: string;
  currency: string;
  requestedAmount: number;
  approvedAmount: number;
  ticketsTotal: number;
  /**
   * Per-item approval breakdown computed live during supervisor review. When
   * the report is still SUBMITTED these drive the `Aprobado` / `Rechazado`
   * rows; once the report is APPROVED the persisted `approvedAmount` becomes
   * the source of truth instead.
   */
  reviewApprovedAmount?: number;
  reviewRejectedAmount?: number;
}

interface RowProps {
  label: string;
  value: string;
  valueClassName?: string;
  withDivider?: boolean;
}

const SummaryRow = ({ label, value, valueClassName = "text-dark", withDivider = false }: RowProps) => (
  <div
    className={`flex items-center justify-between py-1.5 ${withDivider ? "border-t border-[var(--color-border-main)] mt-1 pt-3" : ""}`}
  >
    <dt className="text-[13px] font-sans-medium text-dark/55">{label}</dt>
    <dd className={`text-[14px] font-sans-semibold tabular-nums ${valueClassName}`}>{value}</dd>
  </div>
);

const formatAmount = (n: number, currency: string, locale: string) =>
  `${n.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;

export const FinancialSummary = ({
  status,
  currency,
  requestedAmount,
  approvedAmount,
  ticketsTotal,
  reviewApprovedAmount = 0,
  reviewRejectedAmount = 0,
}: FinancialSummaryProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const s = status.toUpperCase();
  const isApproved = s === "APPROVED" || s === "PAID";
  const isSubmitted = s === "SUBMITTED";
  const finalRejected = Math.max(0, requestedAmount - approvedAmount);
  const headline = ticketsTotal || requestedAmount;

  return (
    <dl className="flex flex-col">
      <SummaryRow
        label={t("reportDetail.requested")}
        value={formatAmount(headline, currency, locale)}
      />

      {/* Supervisor review breakdown — visible while SUBMITTED so the reviewer
          can see the impact of their per-item decisions before finalising. */}
      {isSubmitted && (reviewApprovedAmount > 0 || reviewRejectedAmount > 0) && (
        <>
          {reviewApprovedAmount > 0 && (
            <SummaryRow
              label={t("reportDetail.approved")}
              value={formatAmount(reviewApprovedAmount, currency, locale)}
              valueClassName="text-success"
            />
          )}
          {reviewRejectedAmount > 0 && (
            <SummaryRow
              label={t("reportDetail.rejected")}
              value={formatAmount(reviewRejectedAmount, currency, locale)}
              valueClassName="text-danger"
            />
          )}
        </>
      )}

      {isApproved && (
        <SummaryRow
          label={t("reportDetail.approved")}
          value={formatAmount(approvedAmount, currency, locale)}
          valueClassName="text-success"
        />
      )}
      {isApproved && finalRejected > 0 && (
        <SummaryRow
          label={t("reportDetail.rejected")}
          value={formatAmount(finalRejected, currency, locale)}
          valueClassName="text-danger"
        />
      )}
    </dl>
  );
};
