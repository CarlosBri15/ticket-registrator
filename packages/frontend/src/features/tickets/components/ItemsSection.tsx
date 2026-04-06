import { useTranslation } from "react-i18next";
import { List, Check, Ban, Save } from "lucide-react";
import { RowDivider } from "./DetailRow";
import { ITEM_COLORS } from "../constants/ticketColors";
import type { ITicket, IItem } from "@ticket-registrator/shared";
import { tokens } from "../../../styles/theme";

interface ItemsSectionProps {
  ticket: ITicket;
  canApprove: boolean;
  getItemStatus: (item: IItem) => string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSave: () => void;
  hasChanges: boolean;
  isSaving: boolean;
}

export const ItemsSection = ({
  ticket,
  canApprove,
  getItemStatus,
  onApprove,
  onReject,
  onSave,
  hasChanges,
  isSaving,
}: ItemsSectionProps) => {
  const { t } = useTranslation();

  return (
    <div className="lg:pl-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <List className="w-3.5 h-3.5 text-dark/40" />
        <p className="text-[13px] font-sans-semibold text-dark flex-1">Items</p>
        {(ticket.items?.length ?? 0) > 0 && (
          <span className="px-2 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border-main)] text-[11px] font-sans-medium text-dark/50">
            {ticket.items?.length}
          </span>
        )}
        {hasChanges && canApprove && (
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-sans-medium text-dark bg-brand hover:bg-brand-hover border border-brand/20 disabled:opacity-50 transition-colors"
          >
            <Save className="w-3 h-3" />
            {t("common.save")}
          </button>
        )}
      </div>

      {ticket.items && ticket.items.length > 0 ? (
        <div className={tokens.listSection}>
          <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: 440 }}>
            {ticket.items.map((item, idx) => {
              const status = getItemStatus(item);
              const color = ITEM_COLORS[idx % ITEM_COLORS.length];
              const isApproved = status === "Approved";
              const isRejected = status === "Rejected";

              return (
                <div key={item.id}>
                  {idx > 0 && <RowDivider />}
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 border"
                        style={{ backgroundColor: `${color}12`, borderColor: `${color}30` }}
                      >
                        <span className="text-[11px] font-sans-semibold" style={{ color }}>
                          {(item.name || "?").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-sans-semibold text-dark truncate">{item.name || "—"}</p>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-[14px] font-mono font-semibold text-dark tabular-nums">
                            {item.amount == null ? "—" : item.amount.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-sans-normal text-dark/35">{item.currency}</span>
                        </div>
                      </div>
                    </div>

                    {canApprove && (
                      <div className="flex gap-2 mt-2.5">
                        <button
                          type="button"
                          onClick={() => onApprove(item.id)}
                          disabled={isApproved}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md border text-[12px] font-sans-medium transition-colors
                            ${isApproved
                              ? "bg-green-50 text-green-700 border-green-200 cursor-default"
                              : "bg-white text-green-700 border-green-200 hover:bg-green-50"}`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          {t("common.approve")}
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(item.id)}
                          disabled={isRejected}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md border text-[12px] font-sans-medium transition-colors
                            ${isRejected
                              ? "bg-red-50 text-red-700 border-red-200 cursor-default"
                              : "bg-white text-red-700 border-red-200 hover:bg-red-50"}`}
                        >
                          <Ban className="w-3.5 h-3.5" />
                          {t("common.reject")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={tokens.emptyState} style={{ padding: '3rem 1.5rem' }}>
          <div className={tokens.emptyStateIcon}>
            <List className="w-4 h-4 text-dark/30" />
          </div>
          <p className="text-[12px] font-sans-medium text-dark/35 uppercase tracking-widest">
            {t("reportDetail.noItems")}
          </p>
        </div>
      )}
    </div>
  );
};
