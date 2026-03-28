import { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useTicketImageQuery, useUpdateTicketMutation, useCategoriesQuery, type ITicket } from "@ticket-registrator/shared";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { MapPin, CreditCard, Tag, ExternalLink, Image as ImageIcon, Loader2, Pencil, X, ChevronDown } from "lucide-react";
import { tokens, radius } from "../../../styles/theme";

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: ITicket | null;
  reportId: string;
  isEditable?: boolean;
}

type EditableFields = {
  location_name: string;
  location_address: string;
  date: string;
  amount: string;
  currency: string;
  payment_type: string;
};

export const TicketDetailModal = ({
  isOpen,
  onClose,
  ticket,
  reportId,
  isEditable = false,
}: TicketDetailModalProps) => {
  const { t, i18n } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EditableFields>({
    location_name: "",
    location_address: "",
    date: "",
    amount: "",
    currency: "",
    payment_type: "",
  });

  const { data: imageData, isLoading: isLoadingImage } = useTicketImageQuery(
    reportId,
    ticket?.id || "",
  );

  const { data: categories } = useCategoriesQuery();

  const updateMutation = useUpdateTicketMutation({
    onSuccess: () => setIsEditing(false),
  });

  if (!ticket) return null;

  const dateLocale = i18n.language.startsWith("es") ? es : enUS;

  const handleStartEdit = () => {
    setFormData({
      location_name: ticket.location_name || "",
      location_address: ticket.location_address || "",
      date: ticket.date ? new Date(ticket.date).toISOString().split("T")[0] : "",
      amount: ticket.amount == null ? "" : ticket.amount.toString(),
      currency: ticket.currency || "",
      payment_type: ticket.payment_type || "",
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => setIsEditing(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
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
        items: ticket.items || [],
      },
    });
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={ticket.location_name || t("reportDetail.noTicketName")}>
      <div className="space-y-6">

        {/* Header row: amount + status + edit button */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-2xl font-bold text-dark">
              {ticket.amount}{" "}
              <span className="text-sm font-semibold text-slate-400">{ticket.currency}</span>
            </p>
            <StatusBadge status={ticket.status} />
          </div>
          <div className="flex items-start gap-2">
            <div className="text-right">
              <p className={tokens.statCardLabel}>
                {t("reportDetail.date")}
              </p>
              <p className="text-sm font-semibold text-dark">
                {ticket.date ? format(new Date(ticket.date), "PPP", { locale: dateLocale }) : "---"}
              </p>
            </div>
            {isEditable && !isEditing && (
              <button
                type="button"
                data-testid="edit-ticket-btn"
                onClick={handleStartEdit}
                className={`w-8 h-8 ${radius.base} bg-brand/10 text-brand hover:bg-brand/20 flex items-center justify-center transition-all border border-brand/20 ml-2`}
                title={t("common.edit")}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Edit form */}
        {isEditing ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label={t("confirmForm.establishment")}
                  name="location_name"
                  value={formData.location_name}
                  onChange={handleChange}
                  placeholder={t("confirmForm.establishmentPlaceholder")}
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  label={t("confirmForm.address")}
                  name="location_address"
                  value={formData.location_address}
                  onChange={handleChange}
                  placeholder={t("confirmForm.addressPlaceholder")}
                />
              </div>
              <Input
                label={t("confirmForm.date")}
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
              />
              <Input
                label={t("confirmForm.amount")}
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Input
                label={t("confirmForm.currency")}
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                placeholder="EUR"
              />
              <Input
                label={t("confirmForm.paymentMethod")}
                name="payment_type"
                value={formData.payment_type}
                onChange={handleChange}
                placeholder={t("confirmForm.paymentMethodPlaceholder")}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancelEdit}
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-1.5" />
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                isLoading={updateMutation.isPending}
                className="flex-1"
              >
                {t("common.save")}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Read-only view */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 bg-slate-50 ${radius.base} flex items-center justify-center shrink-0`}>
                    <MapPin className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className={tokens.statCardLabel}>{t("reportDetail.location")}</p>
                    <p className="text-sm font-medium text-dark mt-0.5">
                      {ticket.location_address || "---"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 bg-slate-50 ${radius.base} flex items-center justify-center shrink-0`}>
                    <CreditCard className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className={tokens.statCardLabel}>{t("reportDetail.paymentMethod")}</p>
                    <p className="text-sm font-medium text-dark mt-0.5">
                      {ticket.payment_type || "---"}{" "}
                      {ticket.last_four_digits ? `(**** ${ticket.last_four_digits})` : ""}
                    </p>
                  </div>
                </div>

              </div>

              <div className={`bg-slate-50 ${radius.card} p-4 overflow-hidden flex flex-col items-center justify-center min-h-[200px] border border-slate-100 group relative`}>
                {(() => {
                  if (isLoadingImage) {
                    return (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 text-brand animate-spin" />
                        <p className="text-xs text-gray-400 font-medium">
                          {t("ticketDetail.loadingImage")}
                        </p>
                      </div>
                    );
                  }
                  if (imageData?.url) {
                    return (
                      <>
                        <button
                          type="button"
                          onClick={() => window.open(imageData.url, "_blank")}
                          className="max-h-60 rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-500 cursor-pointer overflow-hidden"
                        >
                          <img
                            src={imageData.url}
                            alt="Ticket"
                            className="w-full h-full object-cover"
                          />
                        </button>
                        <div className="absolute inset-0 bg-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <a
                            href={imageData.url}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-white text-dark px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            {t("ticketDetail.fullscreen")}
                          </a>
                        </div>
                      </>
                    );
                  }
                  return (
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-400 font-medium">{t("ticketDetail.noImage")}</p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Items list */}
            <div className={`bg-slate-50 p-4 ${radius.card} space-y-3`}>
              <h4 className={tokens.listSectionTitle}>{t("reportDetail.items")}</h4>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {ticket.items && ticket.items.length > 0 ? (
                  ticket.items.map((item, index) => (
                    <div
                      key={`item-${item.name}-${index}`}
                      className={`flex justify-between items-center bg-white p-3 ${radius.base} border border-slate-100 shadow-sm`}
                    >
                      <span className="text-sm font-medium text-dark">{item.name}</span>
                      <span className="text-sm font-semibold text-brand">
                        {item.amount} {item.currency}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic text-center py-2">
                    {t("reportDetail.noItems")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={handleClose} className="flex-1">
                {t("common.close")}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
