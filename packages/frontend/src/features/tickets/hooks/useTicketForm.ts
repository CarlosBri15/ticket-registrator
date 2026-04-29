/**
 * useTicketForm — Manages the edit-mode state for ticket fields.
 * Populates the form from the ticket on startEdit() and fires the
 * update mutation on save(), closing edit mode on success.
 */
import { useState } from "react";
import { useUpdateTicketMutation, type ITicket } from "@ticket-registrator/shared";

export interface TicketEditableFields {
  location_name: string;
  location_address: string;
  date: string;
  amount: string;
  currency: string;
  payment_type: string;
}

const EMPTY: TicketEditableFields = {
  location_name: "",
  location_address: "",
  date: "",
  amount: "",
  currency: "",
  payment_type: "",
};

export const useTicketForm = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<TicketEditableFields>(EMPTY);

  const updateMutation = useUpdateTicketMutation({
    onSuccess: () => setIsEditing(false),
  });

  const startEdit = (ticket: ITicket) => {
    setFormData({
      location_name:    ticket.location_name    || "",
      location_address: ticket.location_address || "",
      date: ticket.date ? new Date(ticket.date).toISOString().split("T")[0] : "",
      amount:       ticket.amount == null ? "" : ticket.amount.toString(),
      currency:     ticket.currency     || "",
      payment_type: ticket.payment_type || "",
    });
    setIsEditing(true);
  };

  const cancelEdit = () => setIsEditing(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const save = (reportId: string, ticketId: string) => {
    updateMutation.mutate({
      reportId,
      ticketId,
      data: {
        location_name:    formData.location_name    || null,
        location_address: formData.location_address || null,
        date:     formData.date     || null,
        amount:   formData.amount   ? Number.parseFloat(formData.amount) : null,
        currency: formData.currency || null,
        payment_type: formData.payment_type || null,
      },
    });
  };

  return {
    isEditing,
    formData,
    startEdit,
    cancelEdit,
    handleChange,
    save,
    isSaving: updateMutation.isPending,
  };
};
