import { useTranslation } from "react-i18next";

interface FinancialSummaryProps {
  status: string;
  currency: string;
  requestedAmount: number;
  approvedAmount: number;
  ticketsTotal: number;
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

const formatAmount = (n: number, currency: string) => `${n.toFixed(2)} ${currency}`;

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
  const rejected = Math.max(0, requestedAmount - approvedAmount);
  const headline = ticketsTotal || requestedAmount;

  return (
    <dl className="flex flex-col">
      <SummaryRow
        label={t("reportDetail.requested")}
        value={formatAmount(headline, currency)}
      />
      {isApproved && (
        <SummaryRow
          label={t("reportDetail.approved")}
          value={formatAmount(approvedAmount, currency)}
          valueClassName="text-success"
        />
      )}
      {isApproved && rejected > 0 && (
        <SummaryRow
          label={t("reportDetail.rejected")}
          value={`−${formatAmount(rejected, currency)}`}
          valueClassName="text-danger"
          withDivider
        />
      )}
    </dl>
  );
};
