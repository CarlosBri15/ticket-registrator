import { Suspense, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Camera, ChevronDown, X } from "lucide-react";
import {
  buildCategoryMixFromItems,
  type ITicket,
  type IItem,
} from "@ticket-registrator/shared";
import { DonutChart } from "../../../components/ui/LazyCharts";
import { ChartSkeleton } from "../../../components/ui/ChartSkeleton";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { ItemsSection } from "./ItemsSection";

interface TicketCraftedSheetProps {
  ticket: ITicket;
  formattedDate: string | null;
  formattedCreatedAt: string | null;
  paymentValue: string | null;
  canApprove: boolean;
  isImageOpen: boolean;
  onToggleImage: () => void;
  onClose: () => void;
  onEdit?: () => void;
  isEditable?: boolean;
  // Item approval wiring
  getItemStatus: (item: IItem) => string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSaveItems: () => void;
  hasItemChanges: boolean;
  isSavingItems: boolean;
}

const formatTitle = (raw: string): string =>
  raw.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export const TicketCraftedSheet = ({
  ticket,
  formattedDate,
  formattedCreatedAt,
  paymentValue,
  canApprove,
  isImageOpen,
  onToggleImage,
  onClose,
  onEdit,
  isEditable,
  getItemStatus,
  onApprove,
  onReject,
  onSaveItems,
  hasItemChanges,
  isSavingItems,
}: TicketCraftedSheetProps) => {
  const { t } = useTranslation();

  const categoryData = useMemo(() => {
    const mix = buildCategoryMixFromItems(
      ticket.items ?? [],
      t("reports.uncategorized"),
    );
    return mix.map((m) => ({
      name: m.categoryName,
      value: m.amount,
      color: m.categoryColor,
    }));
  }, [ticket.items, t]);

  const totalLabel = ticket.amount == null
    ? "—"
    : ticket.amount.toLocaleString();

  const itemsSubtotal = useMemo(
    () => (ticket.items ?? []).reduce((acc, it) => acc + (it.amount ?? 0), 0),
    [ticket.items],
  );

  const ticketIdShort = ticket.id ? `#${ticket.id.substring(0, 8)}` : null;
  const hasChart = categoryData.length > 0;

  return (
    <>
      {/* ── Header (title left, donut right) ──────────────────────────────── */}
      <header className="sheet-header">
        <div className="min-w-0">
          {ticket.expense_type && (
            <span className="sheet-eyebrow">{ticket.expense_type}</span>
          )}
          <h2 className="sheet-title">
            {ticket.location_name || t("reportDetail.noTicketName")}
          </h2>
          {ticket.location_address && (
            <p className="sheet-subtitle">{ticket.location_address}</p>
          )}
          <div className="sheet-meta-line">
            {formattedDate && <span>{formattedDate}</span>}
            {formattedDate && (paymentValue || ticketIdShort) && (
              <span className="sep" aria-hidden={true} />
            )}
            {paymentValue && <span>{paymentValue}</span>}
            {paymentValue && ticketIdShort && (
              <span className="sep" aria-hidden={true} />
            )}
            {ticketIdShort && <span>{ticketIdShort}</span>}
          </div>
        </div>

        <div className="flex items-center justify-end min-h-[140px]">
          {hasChart ? (
            <Suspense fallback={<ChartSkeleton height={150} />}>
              <DonutChart
                data={categoryData}
                height={150}
                centerValue={totalLabel}
                centerLabel={ticket.currency || undefined}
                showLegend
              />
            </Suspense>
          ) : (
            <div className="flex flex-col items-end justify-center gap-1 text-right">
              <span className="text-[11px] font-sans-bold text-dark/35">
                {t("ticketDetail.totalAmount")}
              </span>
              <span className="text-[28px] leading-none font-sans-bold text-dark tracking-tight">
                {totalLabel}
              </span>
              {ticket.currency && (
                <span className="text-[12px] font-sans-medium text-dark/45">
                  {ticket.currency}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="sheet-toolbar">
          {isEditable && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="modal-close"
              aria-label={t("common.edit") ?? "Edit"}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="modal-close"
            aria-label={t("common.close") ?? "Close"}
          >
            <X className="w-4 h-4" aria-hidden={true} />
          </button>
        </div>
      </header>

      {/* ── Body (meta left / items right) ────────────────────────────────── */}
      <div className="sheet-body">
        <div className="sheet-meta">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans-bold text-dark/35">
              {formatTitle(t("ticketDetail.ticketData"))}
            </span>
            <StatusBadge status={ticket.status} />
          </div>

          <div className="flex flex-col gap-2 mt-1">
            <div className="sheet-field">
              <span className="sheet-field-label">{t("common.date")}</span>
              <span className="sheet-field-value">{formattedDate || "—"}</span>
            </div>
            <div className="sheet-field">
              <span className="sheet-field-label">{t("ticketDetail.merchant")}</span>
              <span className="sheet-field-value">{ticket.location_name || "—"}</span>
            </div>
            <div className="sheet-field">
              <span className="sheet-field-label">{t("confirmForm.address")}</span>
              <span className="sheet-field-value sheet-field-value--muted">
                {ticket.location_address || "—"}
              </span>
            </div>
            <div className="sheet-field">
              <span className="sheet-field-label">{t("ticketDetail.payment")}</span>
              <span className="sheet-field-value">{paymentValue || "—"}</span>
            </div>
            {ticket.amount != null && (
              <div className="sheet-field">
                <span className="sheet-field-label">{t("ticketDetail.totalAmount")}</span>
                <span className="sheet-field-value">
                  {totalLabel}
                  {ticket.currency && (
                    <span className="ml-1 text-dark/45 font-sans-medium">
                      {ticket.currency}
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleImage}
            className="sheet-image-toggle"
            data-open={isImageOpen ? "true" : "false"}
            aria-expanded={isImageOpen}
            aria-controls="ticket-image-side-panel"
          >
            <Camera className="w-4 h-4" aria-hidden={true} />
            <span>{t("ticketDetail.imageTitle")}</span>
            <ChevronDown className="w-3.5 h-3.5 arrow" aria-hidden={true} />
          </button>
        </div>

        <div className="sheet-items">
          <ItemsSection
            ticket={ticket}
            canApprove={canApprove}
            getItemStatus={getItemStatus}
            onApprove={onApprove}
            onReject={onReject}
            onSave={onSaveItems}
            hasChanges={hasItemChanges}
            isSaving={isSavingItems}
            variant="ledger"
          />

          {(ticket.items?.length ?? 0) > 0 && itemsSubtotal > 0 && (
            <div className="sheet-total">
              <span>{t("ticketDetail.totalAmount")}</span>
              <span className="sheet-total-amt">
                {itemsSubtotal.toLocaleString()}
                {ticket.currency && (
                  <span className="text-[12px] font-sans-medium text-dark/45 ml-1.5">
                    {ticket.currency}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="sheet-footer">
        <span>{ticketIdShort || ""}</span>
        {formattedCreatedAt && (
          <span>
            {t("ticketDetail.uploadedOn")} {formattedCreatedAt}
          </span>
        )}
      </footer>
    </>
  );
};
