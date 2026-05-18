import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useSubmitReportMutation,
  useDeleteReportMutation,
  useUpdateReportStatusMutation,
  ReportStatus,
} from "@ticket-registrator/shared";

/**
 * Centralises all modal states and mutations for ReportDetailScreen.
 * Keeps the screen component focused on rendering.
 *
 * Supervisor approval is done per-item now (see `useItemApproval` consumed by
 * the ticket detail modal). The report-level "finish review" action transitions
 * the report to APPROVED and lets the backend recompute requested/approved
 * amounts from the persisted item statuses.
 */
export const useReportDetailActions = (reportId: string) => {
  const navigate = useNavigate();

  // ── Modal visibility states ────────────────────────────────────────────────
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [finishReviewConfirm, setFinishReviewConfirm] = useState(false);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const submitMutation = useSubmitReportMutation({
    onSuccess: () => setSubmitConfirm(false),
  });

  const updateStatusMutation = useUpdateReportStatusMutation({
    onSuccess: () => {
      setFinishReviewConfirm(false);
    },
  });

  const deleteReportMutation = useDeleteReportMutation({
    onSuccess: () => navigate("/reports"),
  });

  // ── Action handlers ────────────────────────────────────────────────────────
  const handleSubmit = () => submitMutation.mutate(reportId);
  const handleDelete = () => deleteReportMutation.mutate(reportId);
  /**
   * Finalises supervisor review. Backend transitions SUBMITTED → APPROVED and
   * sets `requested_amount` / `approved_amount` from item statuses persisted
   * during the review. The user sees the resolved report afterwards.
   */
  const handleFinishReview = () =>
    updateStatusMutation.mutate({ id: reportId, status: ReportStatus.APPROVED });

  return {
    // Modal toggles
    submitConfirm, setSubmitConfirm,
    deleteConfirm, setDeleteConfirm,
    finishReviewConfirm, setFinishReviewConfirm,
    // Mutation state
    isSubmitting: submitMutation.isPending,
    isDeleting: deleteReportMutation.isPending,
    isFinishingReview: updateStatusMutation.isPending,
    // Handlers
    handleSubmit,
    handleDelete,
    handleFinishReview,
  };
};
