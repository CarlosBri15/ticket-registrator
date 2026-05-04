import { useState } from "react";
import { useTicketImageQuery, type ITicket } from "@ticket-registrator/shared";
import { format } from "date-fns";
import { useDateLocale } from "../../../hooks/useDateLocale";
import { Drawer } from "../../../components/ui/Drawer";
import { useItemApproval } from "../hooks/useItemApproval";
import { useTicketForm } from "../hooks/useTicketForm";
import { ImageSidePanel } from "./ImageSidePanel";
import { TicketEditForm } from "./TicketEditForm";
import { TicketCraftedSheet } from "./TicketCraftedSheet";

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: ITicket | null;
  reportId: string;
  isEditable?: boolean;
  canApprove?: boolean;
}

const formatPaymentValue = (ticket: ITicket): string | null => {
  if (!ticket.payment_type) return null;
  const pType = ticket.payment_type
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
  return ticket.last_four_digits
    ? `${pType} •••• ${ticket.last_four_digits}`
    : pType;
};

export const TicketDetailModal = ({
  isOpen,
  onClose,
  ticket,
  reportId,
  isEditable = false,
  canApprove = false,
}: TicketDetailModalProps) => {
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
    ? format(new Date(ticket.date), "PPP", { locale: dateLocale })
    : null;
  const formattedCreatedAt = ticket.createdAt
    ? format(new Date(ticket.createdAt), "d MMM yyyy · HH:mm", { locale: dateLocale })
    : null;
  const paymentValue = formatPaymentValue(ticket);

  const handleClose = () => {
    ticketForm.cancelEdit();
    setImageOpen(false);
    itemApproval.reset();
    onClose();
  };

  const leftSidePanel = imageOpen ? (
    <ImageSidePanel
      imageUrl={imageData?.url}
      isLoading={isLoadingImage}
      onClose={() => setImageOpen(false)}
    />
  ) : undefined;

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} leftSidePanel={leftSidePanel}>
      {ticketForm.isEditing ? (
        <div className="p-6 overflow-y-auto">
          <TicketEditForm
            formData={ticketForm.formData}
            onChange={ticketForm.handleChange}
            onSave={() => ticketForm.save(reportId, ticket.id)}
            onCancel={ticketForm.cancelEdit}
            isSaving={ticketForm.isSaving}
          />
        </div>
      ) : (
        <TicketCraftedSheet
          ticket={ticket}
          formattedDate={formattedDate}
          formattedCreatedAt={formattedCreatedAt}
          paymentValue={paymentValue}
          canApprove={canApprove}
          isImageOpen={imageOpen}
          onToggleImage={() => setImageOpen((v) => !v)}
          onClose={handleClose}
          onEdit={() => ticketForm.startEdit(ticket)}
          isEditable={isEditable}
          getItemStatus={itemApproval.getItemStatus}
          onApprove={itemApproval.approve}
          onReject={itemApproval.reject}
          onSaveItems={() => itemApproval.save(ticket, reportId)}
          hasItemChanges={itemApproval.hasItemChanges}
          isSavingItems={itemApproval.isSaving}
        />
      )}
    </Drawer>
  );
};
