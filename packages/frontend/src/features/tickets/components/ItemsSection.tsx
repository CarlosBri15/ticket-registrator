import { useTranslation } from "react-i18next";
import { Box, Check, X } from "lucide-react";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import type { ITicket, IItem } from "@ticket-registrator/shared";

type ItemsSectionVariant = "card" | "ledger";

interface ItemsSectionProps {
  ticket: ITicket;
  canApprove: boolean;
  getItemStatus: (item: IItem) => string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  /** Bulk action — sets every item to `Approved` in a single backend call. */
  onApproveAll?: () => void;
  /** Bulk action — sets every item to `Rejected` in a single backend call. */
  onRejectAll?: () => void;
  /** Reflects the in-flight ticket update; disables the per-item buttons. */
  isSaving: boolean;
  variant?: ItemsSectionVariant;
}

const FALLBACK_DOT_COLOR = "var(--color-stone-400)";

const formatTitle = (raw: string): string =>
  raw.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

const formatCurrency = (currency: string): string => formatTitle(currency);

export const ItemsSection = ({
  ticket,
  canApprove,
  getItemStatus,
  onApprove,
  onReject,
  onApproveAll,
  onRejectAll,
  isSaving,
  variant = "card",
}: ItemsSectionProps) => {
  const { t } = useTranslation();
  const items = ticket.items ?? [];
  const isLedger = variant === "ledger";
  const showBulkActions = canApprove && items.length > 1 && (onApproveAll || onRejectAll);

  return (
    <div className={isLedger ? "flex flex-col" : "lg:pl-4 flex flex-col gap-1.5"}>
      {/* Header */}
      <div className={isLedger ? "sheet-items-head" : "flex items-center justify-between pb-1"}>
        {isLedger ? (
          <>
            <span>{t("reportDetail.items")}</span>
            <span className="right">{t("ticketDetail.totalAmount")}</span>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-sans-medium text-dark/45">
              {t("reportDetail.items")}
            </p>
            {items.length > 0 && (
              <span className="px-1.2 py-0.2 rounded bg-dark/5 text-dark/40 text-[10px] font-sans-bold tabular-nums">
                {items.length}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bulk action row — only shown to supervisors with > 1 items. */}
      {showBulkActions && (
        <div className="flex justify-end gap-3 py-2 border-b border-[var(--color-border-main)]/40">
          {onApproveAll && (
            <button
              type="button"
              onClick={onApproveAll}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-sans-semibold text-success hover:bg-success/10 disabled:opacity-40 transition-colors"
            >
              <Check className="w-3.5 h-3.5" aria-hidden={true} />
              {formatTitle(t("ticketDetail.approveAll", "Aprobar todo"))}
            </button>
          )}
          {onRejectAll && (
            <button
              type="button"
              onClick={onRejectAll}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-sans-semibold text-danger hover:bg-danger/10 disabled:opacity-40 transition-colors"
            >
              <X className="w-3.5 h-3.5" aria-hidden={true} />
              {formatTitle(t("ticketDetail.rejectAll", "Rechazar todo"))}
            </button>
          )}
        </div>
      )}

      {/* List */}
      {items.length > 0 ? (
        <div className="flex flex-col">
          {items.map((item) =>
            isLedger ? (
              <LedgerRow
                key={item.id}
                item={item}
                status={getItemStatus(item)}
                canApprove={canApprove}
                isSaving={isSaving}
                onApprove={onApprove}
                onReject={onReject}
                t={t}
              />
            ) : (
              <CardRow
                key={item.id}
                item={item}
                status={getItemStatus(item)}
                canApprove={canApprove}
                isSaving={isSaving}
                onApprove={onApprove}
                onReject={onReject}
                t={t}
              />
            ),
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center py-12 gap-2 text-center border-b border-border-main/60">
          <Box className="w-4 h-4 text-dark/25 mb-1" />
          <p className="font-sans-medium text-[13px] text-dark/55">
            {t("reportDetail.noItems")}
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Sub-rows ────────────────────────────────────────────────────────────────

interface RowProps {
  item: IItem;
  status: string;
  canApprove: boolean;
  isSaving: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  t: (key: string) => string;
}

const formatAmount = (item: IItem) => {
  if (item.amount == null) return "—";
  return item.amount.toLocaleString();
};

const LedgerRow = ({ item, status, canApprove, isSaving, onApprove, onReject, t }: RowProps) => {
  const isApproved = status === "Approved";
  const isRejected = status === "Rejected";
  const dotColor = item.categoryColor ?? FALLBACK_DOT_COLOR;

  return (
    <div className="sheet-item">
      <div className="sheet-item-name">
        <span
          className="sheet-item-dot"
          style={{ backgroundColor: dotColor }}
          aria-hidden={true}
        />
        <span className="sheet-item-text" title={item.name ?? "—"}>
          {item.name || "—"}
        </span>
        <span className="sheet-item-leader" aria-hidden={true} />
      </div>
      <div className="sheet-item-amount">
        {formatAmount(item)}
        {item.currency && (
          <span className="font-sans-medium ml-1 text-dark/45 text-[11px]">
            {formatCurrency(item.currency)}
          </span>
        )}
      </div>

      {canApprove ? (
        <div className="sheet-item-actions">
          <button
            type="button"
            onClick={() => onApprove(item.id)}
            disabled={isSaving}
            aria-pressed={isApproved}
            className={
              "sheet-item-action " +
              (isApproved ? "sheet-item-action--approved" : "")
            }
          >
            {isApproved ? "✓ " : ""}
            {formatTitle(t("common.approve"))}
          </button>
          <button
            type="button"
            onClick={() => onReject(item.id)}
            disabled={isSaving}
            aria-pressed={isRejected}
            className={
              "sheet-item-action " +
              (isRejected ? "sheet-item-action--rejected" : "")
            }
          >
            {isRejected ? "✕ " : ""}
            {formatTitle(t("common.reject"))}
          </button>
        </div>
      ) : (
        <div className="sheet-item-actions">
          <StatusBadge status={status} />
        </div>
      )}
    </div>
  );
};

const CardRow = ({ item, status, canApprove, isSaving, onApprove, onReject, t }: RowProps) => {
  const isApproved = status === "Approved";
  const isRejected = status === "Rejected";
  const dotColor = item.categoryColor ?? FALLBACK_DOT_COLOR;

  return (
    <div
      className="grid items-center gap-4 px-4 py-3.5 group hover:bg-[var(--color-secondary)] border-b border-border-main/60 last:border-b-0 transition-colors duration-100"
      style={{ gridTemplateColumns: "32px 1fr 100px" }}
    >
      <div className="w-8 h-8 rounded-md bg-[var(--color-secondary)] border border-border-main/60 flex items-center justify-center">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: dotColor }}
          aria-hidden={true}
        />
      </div>

      <div className="min-w-0 pr-4">
        <p className="font-sans-semibold text-dark text-[14px] truncate leading-snug">
          {item.name || "—"}
        </p>

        {canApprove ? (
          <div className="flex gap-4 mt-0.5">
            <button
              type="button"
              onClick={() => onApprove(item.id)}
              disabled={isSaving}
              aria-pressed={isApproved}
              className={`text-[10px] font-sans-bold transition-colors disabled:opacity-50
                ${isApproved ? "text-green-600" : "text-dark/20 hover:text-green-600"}`}
            >
              {isApproved ? "✓ " : ""}{formatTitle(t("common.approve"))}
            </button>
            <button
              type="button"
              onClick={() => onReject(item.id)}
              disabled={isSaving}
              aria-pressed={isRejected}
              className={`text-[10px] font-sans-bold transition-colors disabled:opacity-50
                ${isRejected ? "text-red-500" : "text-dark/20 hover:text-red-500"}`}
            >
              {isRejected ? "✕ " : ""}{formatTitle(t("common.reject"))}
            </button>
          </div>
        ) : (
          <div className="mt-1">
            <StatusBadge status={status} />
          </div>
        )}
      </div>

      <div className="text-right">
        <p className="font-sans-bold text-dark tabular-nums text-[14px] leading-none">
          {formatAmount(item)}
          {item.currency && (
            <span className="font-sans-medium ml-1 text-dark/50 text-[11px]">
              {formatCurrency(item.currency)}
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
