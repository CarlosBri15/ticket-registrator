/**
 * useItemApproval — Manages per-item approve/reject state and saves changes
 * via a single ticket update mutation.
 */
import { useState } from "react";
import { useUpdateTicketMutation, type ITicket, type IItem } from "@ticket-registrator/shared";

export const useItemApproval = () => {
  const [itemStatuses, setItemStatuses] = useState<Record<string, string>>({});
  const updateMutation = useUpdateTicketMutation();

  const hasItemChanges = Object.keys(itemStatuses).length > 0;

  const getItemStatus = (item: IItem): string =>
    itemStatuses[item.id] ?? item.status;

  const approve = (id: string) =>
    setItemStatuses((prev) => ({ ...prev, [id]: "Approved" }));

  const reject = (id: string) =>
    setItemStatuses((prev) => ({ ...prev, [id]: "Rejected" }));

  const save = (ticket: ITicket, reportId: string) => {
    const updatedItems = (ticket.items || []).map((item) => ({
      ...item,
      status: (itemStatuses[item.id] as IItem["status"]) ?? item.status,
    }));
    updateMutation.mutate({ reportId, ticketId: ticket.id, data: { items: updatedItems } });
    setItemStatuses({});
  };

  const reset = () => setItemStatuses({});

  return {
    hasItemChanges,
    getItemStatus,
    approve,
    reject,
    save,
    reset,
    isSaving: updateMutation.isPending,
  };
};
