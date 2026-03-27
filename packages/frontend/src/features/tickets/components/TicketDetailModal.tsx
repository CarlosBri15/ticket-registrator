import { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import {
  useTicketImageQuery,
  useUpdateTicketMutation,
  type ITicket,
  type IItem,
} from "@ticket-registrator/shared";
import { ticketIcon } from "@ticket-registrator/shared/assets";

import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import {
  MapPin, CreditCard, Tag, Calendar,
  ExternalLink, Image as ImageIcon, Loader2,
  Pencil, X, Check, Ban, Save,
} from "lucide-react";


// ─── Types ────────────────────────────────────────────────────────────────────

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: ITicket | null;
  reportId: string;
  isEditable?: boolean;
  canApprove?: boolean;
}

type EditableFields = {
  location_name: string;
  location_address: string;
  date: string;
  amount: string;
  currency: string;
  payment_type: string;
  expense_type: string;
};

// ─── Item status helpers ───────────────────────────────────────────────────────

const ITEM_STATUS_STYLES: Record<string, { row: string; badge: string; label: string }> = {
  Approved: {
    row: "bg-success/8 border-success/20",
    badge: "bg-success/15 text-success border-success/25",
    label: "Aprobado",
  },
  Rejected: {
    row: "bg-danger/8 border-danger/20",
    badge: "bg-danger/15 text-danger border-danger/25",
    label: "Rechazado",
  },
  Pending: {
    row: "bg-warning/8 border-warning/20",
    badge: "bg-warning/15 text-warning border-warning/25",
    label: "Pendiente",
  },
};

const getItemStyle = (status: string) =>
  ITEM_STATUS_STYLES[status] ?? ITEM_STATUS_STYLES.Pending;

// ─── TicketDetailModal ────────────────────────────────────────────────────────

export const TicketDetailModal = ({
  isOpen,
  onClose,
  ticket,
  reportId,
  isEditable = false,
  canApprove = false,
}: TicketDetailModalProps) => {
  const { t, i18n } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [itemStatuses, setItemStatuses] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<EditableFields>({
    location_name: "",
    location_address: "",
    date: "",
    amount: "",
    currency: "",
    payment_type: "",
    expense_type: "",
  });

  const { data: imageData, isLoading: isLoadingImage } = useTicketImageQuery(
    reportId,
    ticket?.id || "",
  );

  const updateMutation = useUpdateTicketMutation({
    onSuccess: () => setIsEditing(false),
  });

  if (!ticket) return null;

  const dateLocale = i18n.language.startsWith("es") ? es : enUS;
  const hasItemChanges = Object.keys(itemStatuses).length > 0;

  const getItemStatus = (item: IItem) => itemStatuses[item.id] ?? item.status;

  const handleApproveItem = (itemId: string) =>
    setItemStatuses((p) => ({ ...p, [itemId]: "Approved" }));

  const handleRejectItem = (itemId: string) =>
    setItemStatuses((p) => ({ ...p, [itemId]: "Rejected" }));

  const handleSaveItemChanges = () => {
    const updatedItems = (ticket.items || []).map((item) => ({
      ...item,
      status: (itemStatuses[item.id] as IItem["status"]) ?? item.status,
    }));
    updateMutation.mutate({
      reportId,
      ticketId: ticket.id,
      data: { items: updatedItems },
    });
    setItemStatuses({});
  };

  const handleStartEdit = () => {
    setFormData({
      location_name: ticket.location_name || "",
      location_address: ticket.location_address || "",
      date: ticket.date ? new Date(ticket.date).toISOString().split("T")[0] : "",
      amount: ticket.amount == null ? "" : ticket.amount.toString(),
      currency: ticket.currency || "",
      payment_type: ticket.payment_type || "",
      expense_type: ticket.expense_type || "",
    });
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveFields = () => {
    updateMutation.mutate({
      reportId,
      ticketId: ticket.id,
      data: {
        location_name: formData.location_name || null,
        location_address: formData.location_address || null,
        date: formData.date || null,
        amount: formData.amount ? Number.parseFloat(formData.amount) : null,
        currency: formData.currency || null,
        payment_type: formData.payment_type || null,
        expense_type: formData.expense_type || null,
      },
    });
  };

  const handleClose = () => {
    setIsEditing(false);
    setItemStatuses({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      title={ticket.location_name || t("reportDetail.noTicketName")}
      icon={<img src={ticketIcon} alt="" className="w-8 h-8 object-contain select-none" />}
    >
      {isEditing ? (

        /* ── Edit form ───────────────────────────────────────────────────── */
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input label={t("confirmForm.establishment")} name="location_name"
                value={formData.location_name} onChange={handleChange}
                placeholder={t("confirmForm.establishmentPlaceholder")} />
            </div>
            <div className="md:col-span-2">
              <Input label={t("confirmForm.address")} name="location_address"
                value={formData.location_address} onChange={handleChange}
                placeholder={t("confirmForm.addressPlaceholder")} />
            </div>
            <Input label={t("confirmForm.date")} name="date" type="date"
              value={formData.date} onChange={handleChange} />
            <Input label={t("confirmForm.amount")} name="amount" type="number"
              step="0.01" value={formData.amount} onChange={handleChange} placeholder="0.00" />
            <Input label={t("confirmForm.currency")} name="currency"
              value={formData.currency} onChange={handleChange} placeholder="EUR" />
            <Input label={t("confirmForm.paymentMethod")} name="payment_type"
              value={formData.payment_type} onChange={handleChange}
              placeholder={t("confirmForm.paymentMethodPlaceholder")} />
            <div className="md:col-span-2">
              <Input label={t("confirmForm.category")} name="expense_type"
                value={formData.expense_type} onChange={handleChange}
                placeholder={t("confirmForm.categoryPlaceholder")} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}
              disabled={updateMutation.isPending} className="flex-1">
              <X className="w-4 h-4 mr-1.5" />{t("common.cancel")}
            </Button>
            <Button type="button" onClick={handleSaveFields}
              isLoading={updateMutation.isPending} className="flex-1">
              {t("common.save")}
            </Button>
          </div>
        </div>

      ) : (

        /* ── Read-only view ──────────────────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* ── Left column: image + amount + meta ─────────────────────── */}
          <div className="lg:col-span-2 space-y-3">

            {/* Image */}
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 flex flex-col items-center justify-center min-h-[180px] gap-3">
              {(() => {
                if (isLoadingImage) {
                  return (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-5 h-5 text-brand animate-spin" />
                      <p className="text-xs text-slate-400">{t("ticketDetail.loadingImage")}</p>
                    </div>
                  );
                }
                if (imageData?.url) {
                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => window.open(imageData.url, "_blank")}
                        className="w-full rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <img
                          src={imageData.url}
                          alt="Ticket"
                          className="w-full max-h-52 object-contain hover:scale-[1.02] transition-transform duration-500"
                        />
                      </button>
                      <a
                        href={imageData.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-hover transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {t("ticketDetail.fullscreen")}
                      </a>
                    </>
                  );
                }
                return (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center mx-auto mb-2">
                      <ImageIcon className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="text-xs text-slate-400">{t("ticketDetail.noImage")}</p>
                  </div>
                );
              })()}
            </div>

            {/* Amount hero */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold text-brand/60 uppercase tracking-wider mb-1">
                    {t("reportDetail.totalRequested")}
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold tracking-tight text-brand tabular-nums">
                      {ticket.amount == null ? "—" : ticket.amount.toLocaleString()}
                    </span>
                    <span className="text-sm font-semibold text-brand/60">{ticket.currency}</span>
                  </div>
                </div>
                <div className="shrink-0 mt-0.5">
                  <StatusBadge status={ticket.status} size="sm" />
                </div>
              </div>
              {ticket.date && (
                <p className="text-xs text-brand/50 font-medium mt-2 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(ticket.date), "PPP", { locale: dateLocale })}
                </p>
              )}
            </div>

            {/* Meta fields */}
            <div className="bg-white rounded-2xl p-4 space-y-3" style={{ border: "1px solid #edf0f5" }}>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "#f8fafc", border: "1px solid #edf0f5" }}>
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {t("reportDetail.location")}
                  </p>
                  <p className="text-sm font-medium text-slate-800 mt-0.5 truncate">
                    {ticket.location_address || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "#f8fafc", border: "1px solid #edf0f5" }}>
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {t("reportDetail.paymentMethod")}
                  </p>
                  <p className="text-sm font-medium text-slate-800 mt-0.5 truncate">
                    {ticket.payment_type || "—"}
                    {ticket.last_four_digits ? ` (**** ${ticket.last_four_digits})` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "#f8fafc", border: "1px solid #edf0f5" }}>
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {t("reportDetail.category")}
                  </p>
                  <p className="text-sm font-medium text-slate-800 mt-0.5 truncate">
                    {ticket.expense_type || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Edit button */}
            {isEditable && (
              <button
                type="button"
                data-testid="edit-ticket-btn"
                onClick={handleStartEdit}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#5b8fcb" }}
              >
                <Pencil className="w-3.5 h-3.5" />
                {t("common.edit")}
              </button>
            )}
          </div>

          {/* ── Right column: items ─────────────────────────────────────── */}
          <div className="lg:col-span-3 relative">
            <div className="lg:absolute lg:inset-0 flex flex-col gap-3">

              {/* Items header */}
              <div className="flex items-center justify-between px-1 shrink-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-700">{t("reportDetail.items")}</p>
                  {(ticket.items?.length ?? 0) > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      {ticket.items?.length}
                    </span>
                  )}
                </div>
                {hasItemChanges && canApprove && (
                  <button
                    type="button"
                    onClick={handleSaveItemChanges}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-brand hover:bg-brand-hover transition-colors disabled:opacity-60"
                  >
                    <Save className="w-3 h-3" />
                    {t("common.save")}
                  </button>
                )}
              </div>

              {/* Items list */}
              {ticket.items && ticket.items.length > 0 ? (
                <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 min-h-0 pr-0.5 pb-1">
                  {ticket.items.map((item) => {
                    const status = getItemStatus(item);
                    const style = getItemStyle(status);
                    const isApproved = status === "Approved";
                    const isRejected = status === "Rejected";

                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl border p-4 transition-colors ${style.row}`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {item.name || "—"}
                            </p>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className="text-xl font-bold tabular-nums text-slate-900">
                                {item.amount == null ? "—" : item.amount.toLocaleString()}
                              </span>
                              <span className="text-xs font-semibold text-slate-400">
                                {item.currency}
                              </span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border shrink-0 uppercase tracking-wide ${style.badge}`}>
                            {style.label}
                          </span>
                        </div>

                        {canApprove && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleApproveItem(item.id)}
                              disabled={isApproved}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all
                              ${isApproved
                                  ? "bg-success text-white border border-success cursor-default"
                                  : "bg-white text-success border border-success/30 hover:bg-success/8 hover:border-success/50"
                                }`}
                            >
                              <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                              {t("reportDetail.approveReport")}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectItem(item.id)}
                              disabled={isRejected}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all
                              ${isRejected
                                  ? "bg-danger text-white border border-danger cursor-default"
                                  : "bg-white text-danger border border-danger/30 hover:bg-danger/8 hover:border-danger/50"
                                }`}
                            >
                              <Ban className="w-3.5 h-3.5" />
                              {t("reportDetail.declineReport")}
                            </button>
                          </div>
                        )}

                        {!canApprove && (isApproved || isRejected) && (
                          <div className={`flex items-center gap-1.5 text-xs font-semibold mt-1 ${isApproved ? "text-success" : "text-danger"}`}>
                            {isApproved
                              ? <><Check className="w-3.5 h-3.5" strokeWidth={2.5} />{t("reportDetail.approved")}</>
                              : <><Ban className="w-3.5 h-3.5" />{t("status.DECLINED")}</>
                            }
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-14 text-center">
                  <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Tag className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-400">{t("reportDetail.noItems")}</p>
                </div>
              )}
            </div>{/* absolute flex col */}
          </div>{/* col-span-3 relative */}
        </div>
      )}

      {/* Footer */}
      {!isEditing && (
        <div className="mt-5 flex justify-end border-t border-slate-50 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            {t("common.close")}
          </button>
        </div>
      )}
    </Modal>
  );
};
