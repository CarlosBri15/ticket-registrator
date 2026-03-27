import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ScanLine,
  FileText,
  Calendar,
  Wallet,
  Banknote,
  Tag,
  Plus,
  Send,
  CheckCircle,
  Trash2,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { TicketUploadModal } from "../../tickets/components/TicketUploadModal";
import { TicketDetailModal } from "../../tickets/components/TicketDetailModal";
import {
  useReportQuery,
  useTicketsQuery,
  useSubmitReportMutation,
  useDeleteTicketMutation,
  useDeleteReportMutation,
  useUpdateReportStatusMutation,
  usePermissions,
  ReportStatus,
  type ITicket,
} from "@ticket-registrator/shared";
import { ticketIcon } from "@ticket-registrator/shared/assets";

import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_STYLE = {
  border: "1px solid #edf0f5",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.05)",
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const TicketSkeleton = () => (
  <div className="bg-white rounded-2xl p-4 animate-pulse flex items-center gap-4" style={CARD_STYLE}>
    <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-slate-100 rounded w-2/3" />
      <div className="h-3 bg-slate-100 rounded w-1/3" />
    </div>
    <div className="text-right space-y-1.5">
      <div className="h-5 bg-slate-100 rounded w-20 ml-auto" />
      <div className="h-4 bg-slate-100 rounded w-14 ml-auto" />
    </div>
  </div>
);

// ─── Confirm Dialog ────────────────────────────────────────────────────────────

const ConfirmDialog = ({
  icon,
  iconBg,
  title,
  description,
  onCancel,
  onConfirm,
  confirmLabel,
  confirmClassName,
  isLoading,
  cancelLabel,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  cancelLabel: string;
  confirmClassName?: string;
  isLoading?: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl p-8 max-w-sm w-full animate-in zoom-in-95 duration-300" style={CARD_STYLE}>
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center mb-5 mx-auto`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 text-center mb-2 tracking-tight">{title}</h3>
      <p className="text-slate-400 text-sm text-center leading-relaxed mb-6">{description}</p>
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onCancel} className="flex-1" disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          isLoading={isLoading}
          className={`flex-1 border-transparent ${confirmClassName}`}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  </div>
);

// ─── ReportDetailScreen ────────────────────────────────────────────────────────

export const ReportDetailScreen = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = usePermissions();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ITicket | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [approveConfirm, setApproveConfirm] = useState(false);
  const [declineConfirm, setDeclineConfirm] = useState(false);

  const { data: report, isLoading, isError } = useReportQuery(id);
  const { data: tickets, isLoading: isLoadingTickets } = useTicketsQuery(id!);

  const submitMutation = useSubmitReportMutation({
    onSuccess: () => setSubmitConfirm(false),
  });
  const updateStatusMutation = useUpdateReportStatusMutation({
    onSuccess: () => {
      setApproveConfirm(false);
      setDeclineConfirm(false);
    },
  });
  const deleteTicketMutation = useDeleteTicketMutation();
  const deleteReportMutation = useDeleteReportMutation({
    onSuccess: () => navigate("/reports"),
  });

  const dateLocale = i18n.language.startsWith("es") ? es : enUS;

  const pendingAmount =
    tickets
      ?.filter((tk) => tk.status.toUpperCase() === "PENDING")
      .reduce((acc, tk) => acc + (tk.amount || 0), 0) ?? 0;

  const isEditable = report && ["CREATED", "DRAFT"].includes(report.status.toUpperCase());
  const isSubmitted = report?.status.toUpperCase() === "SUBMITTED";
  const canApprove = can("approve_reports") && isSubmitted;

  const handleTicketClick = (ticket: ITicket) => {
    setSelectedTicket(ticket);
    setIsDetailModalOpen(true);
  };

  const handleDeleteTicket = (e: React.MouseEvent, ticket: ITicket) => {
    e.stopPropagation();
    if (!id) return;
    deleteTicketMutation.mutate({ reportId: id, ticketId: ticket.id });
  };

  // ── Loading state ──────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-5 pb-20 animate-pulse">
        <div className="h-9 w-32 bg-slate-100 rounded-xl" />
        <div className="bg-white rounded-2xl p-6 space-y-4" style={CARD_STYLE}>
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-slate-100 rounded-full" />
            <div className="h-6 w-16 bg-slate-100 rounded-lg" />
          </div>
          <div className="h-8 w-2/3 bg-slate-100 rounded-xl" />
          <div className="flex gap-4">
            <div className="h-4 w-32 bg-slate-100 rounded" />
            <div className="h-4 w-20 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-3">
            {[1, 2, 3].map((i) => <TicketSkeleton key={i} />)}
          </div>
          <div className="bg-white rounded-2xl h-64" style={CARD_STYLE} />
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────

  if (isError || !report) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-14 h-14 bg-danger/8 rounded-2xl border border-danger/15 flex items-center justify-center mb-4">
          <FileText className="w-7 h-7 text-danger" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">{t("reportDetail.errorLoading")}</h2>
        <p className="text-slate-400 mb-6 text-sm">{t("reportDetail.errorDesc")}</p>
        <Button onClick={() => navigate("/reports")} className="w-auto px-8">{t("common.cancel")}</Button>
      </div>
    );
  }

  // ── Ticket list content ────────────────────────────────────────────────────

  const renderTicketsContent = () => {
    if (isLoadingTickets) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <TicketSkeleton key={i} />)}
        </div>
      );
    }

    if (tickets && tickets.length > 0) {
      return (
        <div className="bg-white rounded-2xl overflow-hidden" style={CARD_STYLE}>
          {tickets.map((ticket, idx) => (
            <button
              key={ticket.id}
              type="button"
              onClick={() => handleTicketClick(ticket)}
              className="w-full text-left flex items-center gap-4 px-5 py-4 hover:bg-slate-50/70 transition-colors group"
              style={{ borderBottom: idx < tickets.length - 1 ? "1px solid #f8fafc" : "none" }}
            >
              {/* Icon */}
              <img src={ticketIcon} alt="" className="w-10 h-10 object-contain shrink-0 select-none" />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-brand transition-colors">
                  {ticket.location_name || t("reportDetail.noTicketName")}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {ticket.date && (
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(ticket.date), "dd MMM yyyy", { locale: dateLocale })}
                    </span>
                  )}
                  {ticket.expense_type && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand/8 text-brand border border-brand/10">
                      {ticket.expense_type}
                    </span>
                  )}
                </div>
              </div>

              {/* Amount + status + actions */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 tabular-nums leading-none">
                    {ticket.amount == null ? "—" : ticket.amount.toLocaleString()}
                    <span className="text-[10px] text-slate-400 font-medium ml-1">{ticket.currency}</span>
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={ticket.status} size="sm" />
                  </div>
                </div>
                {isEditable && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteTicket(e, ticket)}
                    className="w-7 h-7 rounded-lg bg-danger/8 text-danger/40 hover:bg-danger/15 hover:text-danger flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-danger/15"
                    title={t("common.delete")}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          ))}
        </div>
      );
    }

    return (
      <div
        className="bg-white rounded-2xl border border-dashed border-slate-200 px-6 py-16 flex flex-col items-center text-center"
      >
        <div className="relative w-16 h-16 mx-auto mb-5">
          <div className="absolute inset-0 bg-slate-50 rounded-2xl border border-slate-100" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FileText className="w-7 h-7 text-slate-300" />
          </div>
          {isEditable && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-lg shadow-sm flex items-center justify-center border border-slate-100">
              <Plus className="w-3 h-3 text-brand" />
            </div>
          )}
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1.5">{t("reportDetail.startDigitalizing")}</h3>
        <p className="text-sm text-slate-400 mb-6 max-w-xs leading-relaxed">
          {t("reportDetail.digitalizeDesc")}
        </p>
        {isEditable && (
          <Button variant="outline" className="w-auto mx-auto" onClick={() => setIsUploadModalOpen(true)}>
            <ScanLine className="w-4 h-4 mr-2" />
            {t("reportDetail.scanFirstTicket")}
          </Button>
        )}
      </div>
    );
  };

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-20">

      {/* ── Back nav ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/reports")}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-700 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold">{t("reportDetail.backToTrips")}</span>
        </button>
        {isEditable && (
          <button
            type="button"
            onClick={() => setDeleteConfirm(true)}
            className="flex items-center gap-1.5 text-danger/40 hover:text-danger text-sm font-semibold transition-colors group"
          >
            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">{t("common.delete")}</span>
          </button>
        )}
      </div>

      {/* ── Report header card ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5" style={CARD_STYLE}>
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">

          {/* Left: identity */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <StatusBadge status={report.status} size="md" />
              <span className="text-[10px] font-mono text-slate-300 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                #{id?.substring(0, 8)}
              </span>
            </div>

            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight mb-3">
              {report.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(report.start_date), "d MMM", { locale: dateLocale })}
                {" — "}
                {format(new Date(report.end_date), "d MMM yyyy", { locale: dateLocale })}
              </span>
              {report.type && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Tag className="w-3.5 h-3.5" />
                  {report.type}
                </span>
              )}
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex flex-wrap gap-2 shrink-0">
            {isEditable && (
              <Button
                onClick={() => setSubmitConfirm(true)}
                isLoading={submitMutation.isPending}
                className="w-auto text-sm px-4"
              >
                <Send className="w-4 h-4 mr-2" />
                {t("reportDetail.submitReport")}
              </Button>
            )}

            {canApprove && (
              <>
                <button
                  type="button"
                  onClick={() => setApproveConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-success bg-success/8 border border-success/20 hover:bg-success/15 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  {t("reportDetail.approveReport")}
                </button>
                <button
                  type="button"
                  onClick={() => setDeclineConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-danger bg-danger/8 border border-danger/20 hover:bg-danger/15 transition-colors"
                >
                  <ThumbsDown className="w-4 h-4" />
                  {t("reportDetail.declineReport")}
                </button>
              </>
            )}

            {isSubmitted && !canApprove && (
              <div className="flex items-center gap-2 px-3.5 py-2 bg-warning/8 rounded-xl border border-warning/20 text-warning text-sm font-semibold">
                <Clock className="w-4 h-4" />
                {t("reportDetail.submittedReview")}
              </div>
            )}
            {report.status.toUpperCase() === "APPROVED" && (
              <div className="flex items-center gap-2 px-3.5 py-2 bg-success/8 rounded-xl border border-success/20 text-success text-sm font-semibold">
                <CheckCircle className="w-4 h-4" />
                {t("reportDetail.approved")}
              </div>
            )}
            {["REJECTED", "DECLINED"].includes(report.status.toUpperCase()) && (
              <div className="flex items-center gap-2 px-3.5 py-2 bg-danger/8 rounded-xl border border-danger/20 text-danger text-sm font-semibold">
                <XCircle className="w-4 h-4" />
                {t("status.DECLINED")}
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              disabled={!isEditable}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-brand bg-brand/5 border border-brand/15 hover:bg-brand/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ScanLine className="w-4 h-4" />
              {t("reportDetail.scanTicket")}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Ticket list ─────────────────────────────────────────────────── */}
        <section className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium text-slate-500">{t("reportDetail.ticketsTitle")}</h2>
              {(tickets?.length ?? 0) > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  {tickets?.length}
                </span>
              )}
            </div>
            {isEditable && tickets && tickets.length > 0 && (
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-1.5 text-brand text-xs font-semibold hover:text-brand-hover transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {t("reportDetail.addTicket")}
              </button>
            )}
          </div>

          {renderTicketsContent()}
        </section>

        {/* ── Financial sidebar ───────────────────────────────────────────── */}
        <section className="space-y-4">

          {/* Main amount card */}
          <div className="bg-white rounded-2xl p-5" style={CARD_STYLE}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500">{t("reportDetail.financialSummary")}</p>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
              >
                <Wallet className="w-4 h-4 text-brand" />
              </div>
            </div>

            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
                {(report.requested_amount ?? 0).toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-slate-400">{report.currency}</span>
            </div>
            <p className="text-sm text-slate-400">{t("reportDetail.totalRequested")}</p>

            {/* Approved / in review mini-stats */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-50">
              <div className="p-3 rounded-xl bg-success/8 border border-success/20">
                <p className="text-[10px] font-bold text-success uppercase tracking-wider mb-1.5">
                  {t("reportDetail.approved")}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-success tabular-nums">
                    {(report.approved_amount ?? 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-semibold text-success/60">{report.currency}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-warning/8 border border-warning/20">
                <p className="text-[10px] font-bold text-warning uppercase tracking-wider mb-1.5">
                  {t("reportDetail.inReview")}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-warning tabular-nums">
                    {pendingAmount.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-semibold text-warning/60">{report.currency}</span>
                </div>
              </div>
            </div>

            {/* Reimbursement estimate */}
            <div className="flex items-center justify-between pt-4 mt-1 border-t border-slate-50">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5" />
                {t("reportDetail.estimatedReimbursement")}
              </span>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-success" />
                <span className="text-sm font-bold text-slate-900 tabular-nums">
                  {(report.approved_amount ?? 0).toLocaleString()}
                  <span className="text-slate-400 font-medium text-xs ml-1">{report.currency}</span>
                </span>
              </div>
            </div>
          </div>

          {/* AI tip card */}
          <div className="bg-white rounded-2xl p-4" style={CARD_STYLE}>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
              >
                <ScanLine className="w-3.5 h-3.5 text-brand" />
              </div>
              <h4 className="text-xs font-bold text-slate-700">{t("reportDetail.aiTipTitle")}</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t("reportDetail.aiTipDesc")}
            </p>
          </div>
        </section>
      </div>

      {/* ── Confirm dialogs ─────────────────────────────────────────────────── */}

      {submitConfirm && (
        <ConfirmDialog
          icon={<Send className="w-7 h-7 text-success" />}
          iconBg="bg-success/10"
          title={t("reportDetail.submitReport")}
          description={t("reportDetail.confirmSubmit")}
          onCancel={() => setSubmitConfirm(false)}
          onConfirm={() => submitMutation.mutate(id!)}
          confirmLabel={t("reportDetail.submitReport")}
          cancelLabel={t("common.cancel")}
          confirmClassName="bg-success hover:opacity-90"
          isLoading={submitMutation.isPending}
        />
      )}

      {approveConfirm && (
        <ConfirmDialog
          icon={<ThumbsUp className="w-7 h-7 text-success" />}
          iconBg="bg-success/10"
          title={t("reportDetail.approveReport")}
          description={t("reportDetail.confirmApprove")}
          onCancel={() => setApproveConfirm(false)}
          onConfirm={() => updateStatusMutation.mutate({ id: id!, status: ReportStatus.APPROVED })}
          confirmLabel={t("reportDetail.approveReport")}
          cancelLabel={t("common.cancel")}
          confirmClassName="bg-success hover:opacity-90"
          isLoading={updateStatusMutation.isPending}
        />
      )}

      {declineConfirm && (
        <ConfirmDialog
          icon={<ThumbsDown className="w-7 h-7 text-danger" />}
          iconBg="bg-danger/10"
          title={t("reportDetail.declineReport")}
          description={t("reportDetail.confirmDecline")}
          onCancel={() => setDeclineConfirm(false)}
          onConfirm={() => updateStatusMutation.mutate({ id: id!, status: ReportStatus.DECLINED })}
          confirmLabel={t("reportDetail.declineReport")}
          cancelLabel={t("common.cancel")}
          confirmClassName="bg-danger hover:opacity-90"
          isLoading={updateStatusMutation.isPending}
        />
      )}

      {deleteConfirm && (
        <ConfirmDialog
          icon={<AlertTriangle className="w-7 h-7 text-danger" />}
          iconBg="bg-danger/10"
          title={t("reportDetail.deleteReport")}
          description={t("reportDetail.confirmDelete")}
          onCancel={() => setDeleteConfirm(false)}
          onConfirm={() => deleteReportMutation.mutate(id!)}
          confirmLabel={t("common.delete")}
          cancelLabel={t("common.cancel")}
          confirmClassName="bg-danger hover:opacity-90"
          isLoading={deleteReportMutation.isPending}
        />
      )}

      <TicketUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        reportId={id!}
      />

      <TicketDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        ticket={selectedTicket}
        reportId={id!}
        isEditable={isEditable}
        canApprove={canApprove}
      />
    </div>
  );
};
