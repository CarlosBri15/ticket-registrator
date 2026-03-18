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
  Receipt,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  XCircle,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TicketUploadModal } from "../tickets/components/TicketUploadModal";
import { TicketDetailModal } from "../tickets/components/TicketDetailModal";
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
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

const TicketSkeleton = () => (
  <div className="bg-white rounded-[2rem] border border-gray-100 p-5 animate-pulse flex items-center gap-4">
    <div className="w-12 h-12 bg-gray-100 rounded-2xl shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-100 rounded w-2/3" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
    </div>
    <div className="text-right space-y-1.5">
      <div className="h-5 bg-gray-100 rounded w-20 ml-auto" />
      <div className="h-4 bg-gray-100 rounded w-14 ml-auto" />
    </div>
  </div>
);

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
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/50 backdrop-blur-sm">
    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
      <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
        {icon}
      </div>
      <h3 className="text-xl font-black text-dark text-center mb-2 tracking-tight">{title}</h3>
      <p className="text-gray-500 text-sm text-center leading-relaxed mb-8">{description}</p>
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
    onSuccess: () => navigate("/trips"),
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

  if (isLoading) {
    return (
      <div className="space-y-8 pb-20 animate-pulse">
        <div className="h-10 w-32 bg-gray-100 rounded-xl" />
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 space-y-5">
          <div className="flex gap-3">
            <div className="h-7 w-24 bg-gray-100 rounded-full" />
            <div className="h-7 w-16 bg-gray-100 rounded-xl" />
          </div>
          <div className="h-9 w-2/3 bg-gray-100 rounded-xl" />
          <div className="flex gap-4">
            <div className="h-5 w-32 bg-gray-100 rounded" />
            <div className="h-5 w-20 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => <TicketSkeleton key={i} />)}
          </div>
          <div className="bg-white rounded-[2.5rem] border border-gray-100 h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-dark mb-2">{t("reportDetail.errorLoading")}</h2>
        <p className="text-gray-500 mb-6 text-sm">{t("reportDetail.errorDesc")}</p>
        <Button onClick={() => navigate("/trips")} className="w-auto px-8">{t("common.cancel")}</Button>
      </div>
    );
  }

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
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              onClick={() => handleTicketClick(ticket)}
              className="w-full text-left group bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-brand/8 hover:border-brand/15 transition-all duration-300 cursor-pointer p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 bg-brand/5 rounded-2xl flex items-center justify-center group-hover:bg-brand/10 transition-colors shrink-0 border border-brand/10">
                  <FileText className="w-5 h-5 text-brand/40 group-hover:text-brand/60 transition-colors" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-dark group-hover:text-brand transition-colors truncate text-sm">
                    {ticket.location_name || t("reportDetail.noTicketName")}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {ticket.date && (
                      <span className="text-[10px] text-gray-400 font-medium">
                        {format(new Date(ticket.date), "dd MMM yyyy", { locale: dateLocale })}
                      </span>
                    )}
                    {ticket.expense_type && (
                      <span className="text-[10px] bg-brand/5 text-brand/70 px-2 py-0.5 rounded-full font-black uppercase tracking-wider border border-brand/10">
                        {ticket.expense_type}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-3">
                <div className="text-right">
                  <p className="font-black text-dark text-base leading-tight">
                    {ticket.amount == null ? "—" : ticket.amount.toLocaleString()}
                    <span className="text-[10px] text-gray-400 font-medium ml-1">{ticket.currency}</span>
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={ticket.status} size="sm" />
                  </div>
                </div>
                {isEditable && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteTicket(e, ticket)}
                    className="w-8 h-8 rounded-xl bg-red-50 text-red-300 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-red-100"
                    title={t("common.delete")}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <ArrowRight className="w-4 h-4 text-gray-200 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          ))}
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => isEditable && setIsUploadModalOpen(true)}
        disabled={!isEditable}
        className={`w-full bg-white/60 backdrop-blur-sm rounded-[2.5rem] border-2 border-dashed border-gray-200 p-16 text-center transition-all duration-500 ${isEditable ? "hover:bg-white hover:border-brand/30 cursor-pointer group" : "cursor-default"}`}
      >
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 bg-brand/5 rounded-2xl group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FileText className="w-9 h-9 text-gray-300 group-hover:text-brand/40 transition-colors" />
          </div>
          {isEditable && (
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-xl shadow-md flex items-center justify-center border border-gray-100 group-hover:rotate-12 transition-transform">
              <Plus className="w-3.5 h-3.5 text-brand" />
            </div>
          )}
        </div>
        <h3 className="text-xl font-black text-dark mb-2 tracking-tight">{t("reportDetail.startDigitalizing")}</h3>
        <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
          {t("reportDetail.digitalizeDesc")}
        </p>
        {isEditable && (
          <Button variant="outline" className="w-auto mx-auto border-gray-200 hover:border-brand/30 font-bold">
            <ScanLine className="w-4 h-4 mr-2" />
            {t("reportDetail.scanFirstTicket")}
          </Button>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">

      {/* Back nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/trips")}
          className="flex items-center gap-2 text-gray-400 hover:text-dark transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold">{t("reportDetail.backToTrips")}</span>
        </button>
        {isEditable && (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="flex items-center gap-1.5 text-red-400 hover:text-red-600 text-sm font-bold transition-colors group"
          >
            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">{t("common.delete")}</span>
          </button>
        )}
      </div>

      {/* Hero header */}
      <div className="relative bg-brand rounded-[2rem] p-8 overflow-hidden shadow-xl shadow-brand/20">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusBadge status={report.status} size="md" />
              <span className="text-[10px] font-mono text-white/40 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                #{id?.substring(0, 8)}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              {report.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(report.start_date), "d MMM", { locale: dateLocale })} —{" "}
                {format(new Date(report.end_date), "d MMM yyyy", { locale: dateLocale })}
              </span>
              {report.type && (
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  {report.type}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {/* Employee: submit */}
            {isEditable && (
              <Button
                onClick={() => setSubmitConfirm(true)}
                isLoading={submitMutation.isPending}
                variant="white"
                className="w-auto font-black text-sm px-4 py-2.5"
              >
                <Send className="w-4 h-4 mr-2" />
                {t("reportDetail.submitReport")}
              </Button>
            )}

            {/* Manager: approve / decline */}
            {canApprove && (
              <>
                <Button
                  onClick={() => setApproveConfirm(true)}
                  variant="white"
                  className="w-auto font-black text-sm px-4 py-2.5 !bg-green-500 !text-white hover:!bg-green-600 !border-green-400"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  {t("reportDetail.approveReport")}
                </Button>
                <Button
                  onClick={() => setDeclineConfirm(true)}
                  variant="ghost-white"
                  className="w-auto font-black text-sm px-4 py-2.5 !border-red-300/50 hover:!bg-red-500/20"
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  {t("reportDetail.declineReport")}
                </Button>
              </>
            )}

            {/* Status-only badges */}
            {isSubmitted && !canApprove && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50/20 rounded-2xl border border-amber-200/30 text-amber-200 text-sm font-bold">
                <CheckCircle className="w-4 h-4" />
                {t("reportDetail.submittedReview")}
              </div>
            )}
            {report.status.toUpperCase() === "APPROVED" && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50/20 rounded-2xl border border-green-200/30 text-green-300 text-sm font-bold">
                <CheckCircle className="w-4 h-4" />
                {t("reportDetail.approved")}
              </div>
            )}
            {["REJECTED", "DECLINED"].includes(report.status.toUpperCase()) && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50/20 rounded-2xl border border-red-200/30 text-red-300 text-sm font-bold">
                <XCircle className="w-4 h-4" />
                {t("status.DECLINED")}
              </div>
            )}

            <Button
              onClick={() => setIsUploadModalOpen(true)}
              disabled={!isEditable}
              variant="ghost-white"
              className="w-auto font-bold text-sm px-4 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ScanLine className="w-4 h-4 mr-2" />
              {t("reportDetail.scanTicket")}
            </Button>
          </div>
        </div>
      </div>

      {/* Submit confirm */}
      {submitConfirm && (
        <ConfirmDialog
          icon={<Send className="w-7 h-7 text-green-600" />}
          iconBg="bg-green-100"
          title={t("reportDetail.submitReport")}
          description={t("reportDetail.confirmSubmit")}
          onCancel={() => setSubmitConfirm(false)}
          onConfirm={() => submitMutation.mutate(id!)}
          confirmLabel={t("reportDetail.submitReport")}
          cancelLabel={t("common.cancel")}
          confirmClassName="bg-green-600 hover:bg-green-700 shadow-xl shadow-green-600/20"
          isLoading={submitMutation.isPending}
        />
      )}

      {/* Approve confirm */}
      {approveConfirm && (
        <ConfirmDialog
          icon={<ThumbsUp className="w-7 h-7 text-green-600" />}
          iconBg="bg-green-100"
          title={t("reportDetail.approveReport")}
          description={t("reportDetail.confirmApprove")}
          onCancel={() => setApproveConfirm(false)}
          onConfirm={() => updateStatusMutation.mutate({ id: id!, status: ReportStatus.APPROVED })}
          confirmLabel={t("reportDetail.approveReport")}
          cancelLabel={t("common.cancel")}
          confirmClassName="bg-green-600 hover:bg-green-700 shadow-xl shadow-green-600/20"
          isLoading={updateStatusMutation.isPending}
        />
      )}

      {/* Decline confirm */}
      {declineConfirm && (
        <ConfirmDialog
          icon={<ThumbsDown className="w-7 h-7 text-red-600" />}
          iconBg="bg-red-100"
          title={t("reportDetail.declineReport")}
          description={t("reportDetail.confirmDecline")}
          onCancel={() => setDeclineConfirm(false)}
          onConfirm={() => updateStatusMutation.mutate({ id: id!, status: ReportStatus.DECLINED })}
          confirmLabel={t("reportDetail.declineReport")}
          cancelLabel={t("common.cancel")}
          confirmClassName="bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20"
          isLoading={updateStatusMutation.isPending}
        />
      )}

      {/* Delete report confirm */}
      {deleteConfirm && (
        <ConfirmDialog
          icon={<AlertTriangle className="w-7 h-7 text-red-600" />}
          iconBg="bg-red-100"
          title={t("reportDetail.deleteReport")}
          description={t("reportDetail.confirmDelete")}
          onCancel={() => setDeleteConfirm(false)}
          onConfirm={() => deleteReportMutation.mutate(id!)}
          confirmLabel={t("common.delete")}
          cancelLabel={t("common.cancel")}
          confirmClassName="bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20"
          isLoading={deleteReportMutation.isPending}
        />
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Ticket list */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Receipt className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-black text-dark uppercase tracking-widest">
                {t("reportDetail.ticketsTitle")}
              </h2>
              <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                {tickets?.length || 0}
              </span>
            </div>
            {isEditable && tickets && tickets.length > 0 && (
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-1.5 text-brand text-xs font-black hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                {t("reportDetail.addTicket")}
              </button>
            )}
          </div>

          {renderTicketsContent()}
        </div>

        {/* Financial sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-brand/5 px-6 py-4 border-b border-brand/10 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-brand" />
              <h3 className="text-[10px] font-black text-brand/70 uppercase tracking-widest">
                {t("reportDetail.financialSummary")}
              </h3>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  {t("reportDetail.totalRequested")}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-dark tracking-tighter">
                    {(report.requested_amount ?? 0).toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-gray-400">{report.currency}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-green-50/60 border border-green-100">
                  <p className="text-[10px] font-black text-green-700/60 uppercase tracking-widest mb-1.5">
                    {t("reportDetail.approved")}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-green-700">
                      {(report.approved_amount ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-green-600/50">{report.currency}</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <p className="text-[10px] font-black text-amber-700/60 uppercase tracking-widest mb-1.5">
                    {t("reportDetail.inReview")}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-amber-700">{pendingAmount.toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-amber-600/50">{report.currency}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5" />
                  {t("reportDetail.estimatedReimbursement")}
                </span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-sm font-black text-dark">
                    {(report.approved_amount ?? 0).toLocaleString()}{" "}
                    <span className="text-gray-400 font-bold text-xs">{report.currency}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand/5 p-5 rounded-[2rem] border border-brand/10">
            <div className="flex items-center gap-2 mb-2">
              <ScanLine className="w-4 h-4 text-brand" />
              <h4 className="text-xs font-black text-brand/80">{t("reportDetail.aiTipTitle")}</h4>
            </div>
            <p className="text-xs text-brand/60 leading-relaxed font-medium">
              {t("reportDetail.aiTipDesc")}
            </p>
          </div>
        </div>
      </div>

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
      />
    </div>
  );
};
