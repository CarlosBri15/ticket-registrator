import { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { useTicketImageQuery, type ITicket } from "@ticket-registrator/shared";
import { format } from "date-fns";
import { useDateLocale } from "../../../hooks/useDateLocale";
import { useTranslation } from "react-i18next";
import { Camera, X } from "lucide-react";
import { useItemApproval } from "../hooks/useItemApproval";
import { useTicketForm } from "../hooks/useTicketForm";
import { ImageSidePanel } from "./ImageSidePanel";
import { TicketEditForm } from "./TicketEditForm";
import { ItemsSection } from "./ItemsSection";
import { PhysicalReceiptCard } from "./PhysicalReceiptCard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: ITicket | null;
  reportId: string;
  isEditable?: boolean;
  canApprove?: boolean;
}

// ─── Main component ───────────────────────────────────────────────────────────

export const TicketDetailModal = ({
  isOpen,
  onClose,
  ticket,
  reportId,
  isEditable = false,
  canApprove = false,
}: TicketDetailModalProps) => {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const [imageOpen, setImageOpen] = useState(false);

  const itemApproval = useItemApproval();
  const ticketForm = useTicketForm();

  const { data: imageData, isLoading: isLoadingImage } = useTicketImageQuery(
    reportId,
    ticket?.id || "",
    { enabled: imageOpen },
  );

  if (!ticket) return null;

  const formattedDate = ticket.date
    ? format(new Date(ticket.date), "PPP", { locale: dateLocale }) : null;

  const formattedCreatedAt = ticket.createdAt
    ? format(new Date(ticket.createdAt), "d MMM yyyy · HH:mm", { locale: dateLocale }) : null;

  let paymentValue = null;
  if (ticket.payment_type) {
    const pType = ticket.payment_type.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
    paymentValue = ticket.last_four_digits
      ? `${pType} •••• ${ticket.last_four_digits}`
      : pType;
  }


  const handleClose = () => {
    ticketForm.cancelEdit();
    setImageOpen(false);
    itemApproval.reset();
    onClose();
  };

  const renderCloseBtn = () => (
    <button type="button" onClick={handleClose} className="modal-close" aria-label="Cerrar">
      <X className="w-4 h-4" aria-hidden={true} />
    </button>
  );

  const headerActions = ticketForm.isEditing ? renderCloseBtn() : (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setImageOpen((v) => !v)}
        className="w-10 h-10 flex items-center justify-center text-dark/30 hover:text-dark hover:bg-dark/5 rounded-full transition-colors duration-200"
      >
        <Camera className="w-[18px] h-[18px]" />
      </button>
      {isEditable && (
        <button
          type="button"
          onClick={() => ticketForm.startEdit(ticket)}
          className="w-10 h-10 flex items-center justify-center text-dark/30 hover:text-dark hover:bg-dark/5 rounded-full transition-colors duration-200"
        >
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      )}
      {renderCloseBtn()}
    </div>
  );


  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="3xl"
      title={ticket.location_name || t("reportDetail.noTicketName")}
      subtitle={formattedDate || undefined}
      actions={headerActions}
      hideDefaultClose
      sidePanel={imageOpen ? (
        <ImageSidePanel
          imageUrl={imageData?.url}
          isLoading={isLoadingImage}
          onClose={() => setImageOpen(false)}
        />
      ) : undefined}
      sidePanelBg="var(--color-surface)"
    >
      {ticketForm.isEditing ? (
        <TicketEditForm
          formData={ticketForm.formData}
          onChange={ticketForm.handleChange}
          onSave={() => ticketForm.save(reportId, ticket.id)}
          onCancel={ticketForm.cancelEdit}
          isSaving={ticketForm.isSaving}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_2px_minmax(0,3fr)] gap-8">

          {/* Left: ticket data */}
          <div className="flex flex-col gap-4 pl-4 pb-4">
            <PhysicalReceiptCard
              ticket={ticket}
              formattedDate={formattedDate}
              formattedCreatedAt={formattedCreatedAt}
              paymentValue={paymentValue}
            />
          </div>

          {/* Vertical separator */}
          <div className="hidden lg:block bg-border-main/10 rounded-sm" />

          {/* Right: items */}
          <ItemsSection
            ticket={ticket}
            canApprove={canApprove}
            getItemStatus={itemApproval.getItemStatus}
            onApprove={itemApproval.approve}
            onReject={itemApproval.reject}
            onSave={() => itemApproval.save(ticket, reportId)}
            hasChanges={itemApproval.hasItemChanges}
            isSaving={itemApproval.isSaving}
          />
        </div>
      )}
    </Modal>
  );
};
