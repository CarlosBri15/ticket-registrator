import { useTranslation } from "react-i18next";
import {
  Utensils, Plane, Car, Save,
  Computer, Briefcase, Gift, Train, Box,
  MapPin, Landmark, Heart, Fuel, FileText,
  Tag, Receipt,
  type LucideIcon,
} from "lucide-react";
import { StatusBadge } from "../../../components/ui/StatusBadge";
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

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Airfare': Plane,
  'Marketing': Tag,
  'Booking Fees': Receipt,
  'Car Rental': Car,
  'Company Car': Car,
  'Mileage Reimbursement': MapPin,
  'Computer': Computer,
  'Consulting Services': Briefcase,
  'Donations': Heart,
  'Facility': Landmark,
  'Fees': Receipt,
  'Fuel For Mileage': Fuel,
  'Gas': Fuel,
  'Gifts': Gift,
  'Ground Transportation': Car,
  'Legal Services': FileText,
  'Lodging': Landmark,
  'Lodging Tax': Receipt,
  'Meals': Utensils,
  'Food': Utensils,
  'Office Supplies': Briefcase,
  'Train': Train,
  'Miscellaneous': Box,
  'Comida': Utensils,
  'Restaurante': Utensils,
  'Transporte': Car,
  'Viaje': Plane,
  'Otros': Box,
  'Gasto': Receipt
};

const getCategoryIcon = (item: IItem) => {
  const name = item.categoryName || "";
  const cat = Object.keys(CATEGORY_ICONS).find(key => 
    name.toLowerCase().includes(key.toLowerCase())
  );
  const IconComponent = cat ? CATEGORY_ICONS[cat] : Box;
  return <IconComponent className="w-3.5 h-3.5 text-dark/40" />;
};

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

  const gridTemplate = "32px 1fr 100px";

  return (
    <div className="lg:pl-4 flex flex-col gap-1.5">
      {/* Section Title (REPLACED) */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-sans-medium text-dark/45">
            {t("reportDetail.items")}
          </p>
          {(ticket.items?.length ?? 0) > 0 && (
            <span className="px-1.2 py-0.2 rounded bg-dark/5 text-dark/40 text-[10px] font-sans-bold tabular-nums">
              {ticket.items?.length}
            </span>
          )}
        </div>
        {hasChanges && canApprove && (
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-sans-bold text-dark bg-brand hover:bg-brand-hover border border-brand/20 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Save className="w-3 h-3" />
            {t("common.save").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
          </button>
        )}
      </div>

      {/* List implementation WITHOUT TableHeader */}
      <div className="w-full flex flex-col">
        {ticket.items && ticket.items.length > 0 ? (
          <div className="flex flex-col">
            {ticket.items.map((item) => {
              const status = getItemStatus(item);
              const isApproved = status === "Approved";
              const isRejected = status === "Rejected";
              const icon = getCategoryIcon(item);

              return (
                <div 
                  key={item.id} 
                  className="grid items-center gap-4 px-4 py-3.5 group hover:bg-[var(--color-secondary)] border-b border-border-main/60 last:border-b-0 transition-colors duration-100"
                  style={{ gridTemplateColumns: gridTemplate }}
                >
                  {/* Category Icon */}
                  <div className="w-8 h-8 rounded-md bg-[var(--color-secondary)] border border-border-main/60 flex items-center justify-center">
                    {icon}
                  </div>

                  {/* Item Details */}
                  <div className="min-w-0 pr-4">
                    <p className="font-sans-semibold text-dark text-[14px] truncate leading-snug">
                      {item.name || "—"}
                    </p>
                    
                    {canApprove ? (
                      <div className="flex gap-4 mt-0.5">
                        <button
                          type="button"
                          onClick={() => onApprove(item.id)}
                          className={`text-[10px] font-sans-bold transition-colors
                            ${isApproved ? "text-green-600" : "text-dark/20 hover:text-green-600"}`}
                        >
                          {isApproved ? "✓ " : ""}{t("common.approve").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(item.id)}
                          className={`text-[10px] font-sans-bold transition-colors
                            ${isRejected ? "text-red-500" : "text-dark/20 hover:text-red-500"}`}
                        >
                          {isRejected ? "✕ " : ""}{t("common.reject").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1">
                        <StatusBadge status={status} />
                      </div>
                    )}
                  </div>

                  {/* Amount column */}
                  <div className="text-right">
                    <p className="font-sans-bold text-dark tabular-nums text-[14px] leading-none">
                      {item.amount == null ? "—" : item.amount.toLocaleString()}
                      {item.currency && (
                        <span className="font-sans-medium ml-1 text-dark/50 text-[11px]">
                          {item.currency.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
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
    </div>
  );
};
