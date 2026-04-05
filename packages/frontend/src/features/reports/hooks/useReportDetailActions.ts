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
 */
export const useReportDetailActions = (reportId: string) => {
  const navigate = useNavigate();

  // ── Modal visibility states ────────────────────────────────────────────────
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [approveConfirm, setApproveConfirm] = useState(false);
  const [declineConfirm, setDeclineConfirm] = useState(false);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const submitMutation = useSubmitReportMutation({
    onSuccess: () => setSubmitConfirm(false),
  });

  const updateStatusMutation = useUpdateReportStatusMutation({
    onSuccess: () => {
      setApproveConfirm(false);
      setDeclineConfirm(false);
    },
  });

  const deleteReportMutation = useDeleteReportMutation({
    onSuccess: () => navigate("/reports"),
  });

  // ── Action handlers ────────────────────────────────────────────────────────
  const handleSubmit = () => submitMutation.mutate(reportId);
  const handleDelete = () => deleteReportMutation.mutate(reportId);
  const handleApprove = () =>
    updateStatusMutation.mutate({ id: reportId, status: ReportStatus.APPROVED });
  const handleDecline = () =>
    updateStatusMutation.mutate({ id: reportId, status: ReportStatus.DECLINED });

  return {
    // Modal toggles
    submitConfirm, setSubmitConfirm,
    deleteConfirm, setDeleteConfirm,
    approveConfirm, setApproveConfirm,
    declineConfirm, setDeclineConfirm,
    // Mutation state
    isSubmitting: submitMutation.isPending,
    isDeleting: deleteReportMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    // Handlers
    handleSubmit,
    handleDelete,
    handleApprove,
    handleDecline,
  };
};
