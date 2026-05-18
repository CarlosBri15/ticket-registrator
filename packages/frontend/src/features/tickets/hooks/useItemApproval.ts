/**
 * useItemApproval — One-click per-item approve/reject for supervisor review.
 *
 * Each click hits the dedicated `PATCH /items/:itemId/status` endpoint, which
 * persists exactly that one item without disturbing siblings. The bulk
 * `approveAll` / `rejectAll` actions hit `PATCH /items/status` so every item
 * flips in a single transaction.
 *
 * An optimistic override mirrors the click in the UI; it is ignored as soon
 * as the refetched ticket prop carries a matching status (`getItemStatus`
 * falls back to the server value when the override agrees), so the button
 * never flashes back to the old state between the mutation settling and the
 * post-invalidation refetch landing — and no extra effect is needed to
 * "clean" the override map.
 */
import { useState } from "react";
import {
  useUpdateItemStatusMutation,
  useUpdateAllItemsStatusMutation,
  type ITicket,
  type IItem,
} from "@ticket-registrator/shared";

export const useItemApproval = (ticket: ITicket | null, reportId: string) => {
  const [pending, setPending] = useState<Record<string, string>>({});
  const updateOneMutation = useUpdateItemStatusMutation();
  const updateAllMutation = useUpdateAllItemsStatusMutation();

  const setStatus = (itemId: string, status: string) => {
    if (!ticket) return;

    setPending((prev) => ({ ...prev, [itemId]: status }));

    updateOneMutation.mutate({
      reportId,
      ticketId: ticket.id,
      itemId,
      status,
    });
  };

  /**
   * Bulk action — flips every item to the same status in a single transaction
   * via the dedicated backend endpoint. Each item gets an optimistic override
   * so the whole list reflects the click immediately.
   */
  const setAll = (status: string) => {
    if (!ticket) return;
    const items = ticket.items ?? [];
    if (items.length === 0) return;

    setPending((prev) => {
      const next = { ...prev };
      for (const item of items) next[item.id] = status;
      return next;
    });

    updateAllMutation.mutate({
      reportId,
      ticketId: ticket.id,
      status,
    });
  };

  const getItemStatus = (item: IItem): string => {
    const override = pending[item.id];
    // Override only "wins" while it disagrees with the server-confirmed
    // value. Once they match (refetch landed), the server value takes over
    // and the stale entry is harmless — no flash, no map cleanup needed.
    if (override && override !== item.status) return override;
    return item.status;
  };

  return {
    getItemStatus,
    approve: (id: string) => setStatus(id, "Approved"),
    reject: (id: string) => setStatus(id, "Rejected"),
    approveAll: () => setAll("Approved"),
    rejectAll: () => setAll("Rejected"),
    isSaving: updateOneMutation.isPending || updateAllMutation.isPending,
  };
};
