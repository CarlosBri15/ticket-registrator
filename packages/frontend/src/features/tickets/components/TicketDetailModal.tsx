import { useState } from "react";
import {
  useTicketImageQuery,
  useUserQuery,
  AUTHORITY_LEVELS,
  type ITicket,
} from "@ticket-registrator/shared";
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
  const { data: currentUser } = useUserQuery();
  // Employees (the report owners) get the image panel collapsed by default —
  // they took the photo, no need to surface it on every ticket open. Anyone
  // above DEPARTMENT (Controller / Manager / Admin / SuperAdmin) is reviewing
  // someone else's expense and benefits from seeing the receipt straight away.
  const defaultImageOpen =
    !!currentUser && currentUser.hierarchy >= AUTHORITY_LEVELS.DEPARTMENT;
  const [imageOpen, setImageOpen] = useState<boolean>(defaultImageOpen);

  // Reset image visibility every time the modal opens or the user navigates
  // to a different ticket — done via the "adjust state during render"
  // pattern (track the previous session key) so we don't trip
  // react-hooks/set-state-in-effect. Mid-session manual toggles are
  // preserved because we only reset when the session key changes.
  const sessionKey = isOpen ? (ticket?.id ?? null) : null;
  const [trackedSession, setTrackedSession] = useState<string | null>(null);
  if (sessionKey !== trackedSession) {
    setTrackedSession(sessionKey);
    if (sessionKey) setImageOpen(defaultImageOpen);
  }

  const itemApproval = useItemApproval(ticket, reportId);
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
          onApproveAll={itemApproval.approveAll}
          onRejectAll={itemApproval.rejectAll}
          isSavingItems={itemApproval.isSaving}
        />
      )}
    </Drawer>
  );
};
