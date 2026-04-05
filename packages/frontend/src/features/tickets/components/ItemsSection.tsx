import { useTranslation } from "react-i18next";
import { List, Check, Ban, Save } from "lucide-react";
import { PixelCard } from "../../../components/ui/PixelCard";
import { RowDivider } from "./DetailRow";
import { ITEM_COLORS } from "../constants/ticketColors";
import { colors } from "@ticket-registrator/shared";
import type { ITicket, IItem } from "@ticket-registrator/shared";

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
        <List className="w-3.5 h-3.5 text-dark" strokeWidth={2.5} />
        <p className="text-sm font-space-bold text-dark flex-1 normal-case">Items</p>
        {(ticket.items?.length ?? 0) > 0 && (
          <PixelCard shadowOffset={3} className="inline-block">
            <span className="px-2.5 py-1 text-[9px] font-space-bold text-dark block">
              {ticket.items?.length}
            </span>
          </PixelCard>
        )}
        {hasChanges && canApprove && (
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-space-bold text-white bg-brand border-2 border-dark shadow-hard-sm disabled:opacity-60 neo-press-sm"
          >
            <Save className="w-3 h-3" />
            {t("common.save")}
          </button>
        )}
      </div>

      {ticket.items && ticket.items.length > 0 ? (
        <PixelCard className="w-full">
          <div className="overflow-y-auto custom-scrollbar" style={{ paddingTop: 4, paddingBottom: 4, maxHeight: 440 }}>
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
                        className="w-9 h-9 rounded-lg border-2 flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${color}15`, borderColor: color }}
                      >
                        <span className="text-[10px] font-space-bold" style={{ color }}>
                          {(item.name || "?").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-space-semibold text-dark truncate">{item.name || "—"}</p>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-base font-space-bold text-dark tabular-nums">
                            {item.amount == null ? "—" : item.amount.toLocaleString()}
                          </span>
                          <span className="text-[9px] font-space-bold text-dark/40">{item.currency}</span>
                        </div>
                      </div>
                    </div>

                    {canApprove && (
                      <div className="flex gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => onApprove(item.id)}
                          disabled={isApproved}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 text-xs font-space-bold transition-all
                            ${isApproved
                              ? "bg-success text-white border-dark shadow-none cursor-default"
                              : "bg-white text-success border-dark shadow-hard-sm neo-press-sm"}`}
                        >
                          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                          {t("common.approve")}
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(item.id)}
                          disabled={isRejected}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 text-xs font-space-bold transition-all
                            ${isRejected
                              ? "bg-danger text-white border-dark shadow-none cursor-default"
                              : "bg-white text-danger border-dark shadow-hard-sm neo-press-sm"}`}
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
        </PixelCard>
      ) : (
        <PixelCard className="w-full">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-12 h-12 rounded-lg border-2 flex items-center justify-center mx-auto mb-3"
              style={{ borderColor: `${colors.dark}20` }}
            >
              <List className="w-5 h-5 text-dark/20" />
            </div>
            <p className="text-xs font-space-bold text-dark/30 uppercase tracking-widest">
              {t("reportDetail.noItems")}
            </p>
          </div>
        </PixelCard>
      )}
    </div>
  );
};
