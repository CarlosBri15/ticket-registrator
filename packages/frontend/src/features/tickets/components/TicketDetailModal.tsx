import { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { PixelCard } from "../../../components/ui/PixelCard";
import { useTicketImageQuery, type ITicket } from "@ticket-registrator/shared";
import { ticketIcon } from "@ticket-registrator/shared/assets";
import { format } from "date-fns";
import { useDateLocale } from "../../../hooks/useDateLocale";
import { useTranslation } from "react-i18next";
import { Camera, X } from "lucide-react";
import { useItemApproval } from "../hooks/useItemApproval";
import { useTicketForm } from "../hooks/useTicketForm";
import { tokens } from "../../../styles/theme";
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
  const ticketForm   = useTicketForm();

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

  const paymentValue = ticket.payment_type
    ? ticket.last_four_digits
      ? `${ticket.payment_type} •••• ${ticket.last_four_digits}`
      : ticket.payment_type
    : null;

  const handleClose = () => {
    ticketForm.cancelEdit();
    setImageOpen(false);
    itemApproval.reset();
    onClose();
  };

  const CloseBtn = () => (
    <button type="button" onClick={handleClose} className={tokens.modalClose}>
      <X className="w-4 h-4" />
    </button>
  );

  const headerActions = !ticketForm.isEditing ? (
    <>
      <PixelCard bg="var(--color-surface-card)" shadowOffset={3} radius={8} onClick={() => setImageOpen((v) => !v)}>
        <div className="w-9 h-9 flex items-center justify-center">
          <Camera className="w-4 h-4 text-dark" />
        </div>
      </PixelCard>
      {isEditable && (
        <PixelCard
          bg="#3B82F6"
          borderColor="#2563EB"
          shadowColor="#1E40AF"
          shadowOffset={3}
          radius={8}
          onClick={() => ticketForm.startEdit(ticket)}
        >
          <div data-testid="edit-ticket-btn" className="w-9 h-9 flex items-center justify-center">
            <svg className="w-4 h-4 text-surface-card" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        </PixelCard>
      )}
      <CloseBtn />
    </>
  ) : <CloseBtn />;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="3xl"
      title={ticket.location_name || t("reportDetail.noTicketName")}
      icon={<img src={ticketIcon} alt="" className="w-9 h-9 object-contain select-none" />}
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
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_2px_minmax(0,3fr)] gap-4 lg:gap-0">

          {/* Left: ticket data */}
          <div className="lg:pr-4">
            <p className="text-sm font-space-bold text-dark mb-2 px-1">
              {t("ticketDetail.ticketData")}
            </p>
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
