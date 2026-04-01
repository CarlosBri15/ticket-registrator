import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Camera, Send, Trash2,
  FileText, Calendar, ThumbsUp, ThumbsDown, Clock, CheckCircle,
  XCircle, AlertTriangle, ChevronRight,
} from "lucide-react";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { PixelCard } from "../../../components/ui/PixelCard";
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
import { reportIcon, ticketIcon } from "@ticket-registrator/shared/assets";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

// ─── Constants ────────────────────────────────────────────────────────────────

const DARK    = "#1A1A1A";
const SHADOW  = "rgba(26, 26, 26, 0.15)";
const SURFACE = "#F5F5F5";
const BRAND   = "#4D4DFF";

// ─── Financial Summary (port from mobile) ────────────────────────────────────

const FinancialSummary = ({
  status, currency, requestedAmount, approvedAmount, ticketsTotal,
}: {
  status: string; currency: string;
  requestedAmount: number; approvedAmount: number; ticketsTotal: number;
}) => {
  const s = status.toUpperCase();

  if (s === "CREATED" || s === "DRAFT") {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 10, color: `${DARK}50`, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Total</p>
        <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 42, letterSpacing: -1.5, lineHeight: 1, color: DARK }}>{ticketsTotal.toFixed(2)}</p>
        <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 13, color: `${DARK}40`, marginTop: 4 }}>{currency}</p>
      </div>
    );
  }

  if (s === "SUBMITTED" || s === "PENDING") {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 10, color: "#d97706", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Solicitado</p>
        <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 42, letterSpacing: -1.5, lineHeight: 1, color: "#d97706" }}>{requestedAmount.toFixed(2)}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 4 }}>
          <Clock style={{ width: 12, height: 12, color: "#d97706" }} />
          <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 13, color: "#d97706" }}>{currency}</p>
        </div>
      </div>
    );
  }

  if (s === "APPROVED" || s === "PAID") {
    const rejected = Math.max(0, requestedAmount - approvedAmount);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 0, width: "100%" }}>
        <div style={{ flex: 1, textAlign: "center", paddingRight: 12 }}>
          <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 10, color: "#059669", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Aprobado</p>
          <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 30, letterSpacing: -1, color: "#059669" }}>{approvedAmount.toFixed(2)}</p>
          <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 12, color: "#059669", opacity: 0.7, marginTop: 3 }}>{currency}</p>
        </div>
        <div style={{ width: 2, height: 60, backgroundColor: DARK, opacity: 0.1 }} />
        <div style={{ flex: 1, textAlign: "center", paddingLeft: 12 }}>
          <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 10, color: rejected > 0 ? "#dc2626" : `${DARK}40`, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Rechazado</p>
          <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 30, letterSpacing: -1, color: rejected > 0 ? "#dc2626" : `${DARK}30` }}>{rejected.toFixed(2)}</p>
          <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 12, color: rejected > 0 ? "#dc2626" : `${DARK}30`, marginTop: 3 }}>{currency}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 10, color: "#dc2626", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Declinado</p>
      <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 42, letterSpacing: -1.5, lineHeight: 1, color: "#dc2626" }}>{requestedAmount.toFixed(2)}</p>
      <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 13, color: "#dc2626", opacity: 0.6, marginTop: 4 }}>{currency}</p>
    </div>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({ icon, label, count, action }: {
  icon: React.ReactNode; label: string; count?: number; action?: React.ReactNode;
}) => (
  <div className="flex items-center gap-2 mb-3.5">
    <span style={{ color: `${DARK}50` }}>{icon}</span>
    <p className="flex-1 font-space-bold text-dark" style={{ fontSize: 12, letterSpacing: "0.3px" }}>{label}</p>
    {count != null && (
      <span style={{
        backgroundColor: "#fff", border: `2px solid ${SHADOW}`, borderRadius: 10,
        paddingLeft: 10, paddingRight: 10, paddingTop: 3, paddingBottom: 3,
        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 10, color: DARK,
      }}>
        {count}
      </span>
    )}
    {action}
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const TicketSkeleton = () => (
  <div className="bg-white border-2 border-dark/20 rounded-lg p-4 animate-pulse flex items-center gap-3">
    <div className="w-11 h-11 bg-dark/10 rounded-lg shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-1/2 bg-dark/10 rounded" />
      <div className="h-2.5 w-1/3 bg-dark/10 rounded" />
    </div>
    <div className="space-y-1.5 shrink-0">
      <div className="h-4 w-16 bg-dark/10 rounded" />
    </div>
  </div>
);

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

const ConfirmDialog = ({
  icon, title, description, onCancel, onConfirm,
  confirmLabel, cancelLabel, confirmBg, isLoading,
}: {
  icon: React.ReactNode; title: string; description: string;
  onCancel: () => void; onConfirm: () => void;
  confirmLabel: string; cancelLabel: string;
  confirmBg: string; isLoading?: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(26,26,26,0.5)" }}>
    <PixelCard shadowOffset={6} className="w-full max-w-sm">
      <div className="p-6 flex flex-col items-center text-center gap-3">
        <div style={{
          width: 52, height: 52, backgroundColor: "#fff",
          border: `2px solid ${SHADOW}`, borderRadius: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `3px 3px 0px ${SHADOW}`,
        }}>
          {icon}
        </div>
        <p className="font-space-bold text-dark" style={{ fontSize: 16 }}>{title}</p>
        <p className="font-space text-dark/50 max-w-xs leading-relaxed" style={{ fontSize: 12 }}>{description}</p>
        <div className="flex gap-2.5 w-full mt-1">
          <PixelCard shadowOffset={3} onClick={onCancel} className="flex-1">
            <div className="flex items-center justify-center py-3">
              <span className="font-space-bold" style={{ fontSize: 13, color: DARK }}>{cancelLabel}</span>
            </div>
          </PixelCard>
          <PixelCard bg={confirmBg} shadowOffset={3} onClick={isLoading ? undefined : onConfirm} className="flex-1">
            <div className="flex items-center justify-center py-3" style={{ opacity: isLoading ? 0.6 : 1 }}>
              <span className="font-space-bold text-white" style={{ fontSize: 13 }}>{confirmLabel}</span>
            </div>
          </PixelCard>
        </div>
      </div>
    </PixelCard>
  </div>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

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

  const submitMutation     = useSubmitReportMutation({ onSuccess: () => setSubmitConfirm(false) });
  const updateStatusMutation = useUpdateReportStatusMutation({
    onSuccess: () => { setApproveConfirm(false); setDeclineConfirm(false); },
  });
  const deleteTicketMutation = useDeleteTicketMutation();
  const deleteReportMutation = useDeleteReportMutation({ onSuccess: () => navigate("/reports") });

  const dateLocale   = i18n.language.startsWith("es") ? es : enUS;
  const isEditable   = report && ["CREATED", "DRAFT"].includes(report.status.toUpperCase());
  const isSubmitted  = report?.status.toUpperCase() === "SUBMITTED";
  const canApprove   = can("approve_reports") && isSubmitted;
  const ticketsTotal = tickets?.reduce((acc, tk) => acc + (tk.amount ?? 0), 0) ?? 0;

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="-mx-6 -mt-7 md:-mx-10 lg:-mt-9">
        <div className="px-6 md:px-10 py-4" style={{ backgroundColor: SURFACE }}>
          <div className="bg-white border-2 border-dark/20 rounded-lg animate-pulse h-14" />
        </div>
        <div className="px-6 md:px-10 py-7 space-y-4">
          <div className="bg-white border-2 border-dark/20 rounded-lg animate-pulse h-36" />
          <div className="space-y-2.5">
            <TicketSkeleton /><TicketSkeleton /><TicketSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (isError || !report) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <PixelCard bg="#FEF2F2" shadowOffset={4} className="w-full max-w-sm">
          <div className="flex flex-col items-center text-center p-8 gap-3">
            <AlertTriangle className="w-8 h-8 text-danger" />
            <p className="font-space-bold text-dark" style={{ fontSize: 15 }}>{t("reportDetail.errorLoading")}</p>
            <p className="font-space text-dark/50" style={{ fontSize: 12 }}>{t("reportDetail.errorDesc")}</p>
            <PixelCard bg={BRAND} shadowOffset={3} onClick={() => navigate("/reports")}>
              <div className="px-5 py-2.5">
                <span className="font-space-bold text-white" style={{ fontSize: 13 }}>{t("common.cancel")}</span>
              </div>
            </PixelCard>
          </div>
        </PixelCard>
      </div>
    );
  }

  // ── Main ───────────────────────────────────────────────────────────────────

  return (
    <div className="-mx-6 -mt-7 md:-mx-10 lg:-mt-9">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-6 md:px-10 py-3"
        style={{ backgroundColor: "#FFFFFF", borderBottom: `4px solid ${SHADOW}` }}
      >
        {/* Back */}
        <PixelCard shadowOffset={3} radius={8} onClick={() => navigate("/reports")}>
          <div className="flex items-center justify-center" style={{ width: 34, height: 34 }}>
            <ArrowLeft className="w-[18px] h-[18px]" style={{ color: DARK }} />
          </div>
        </PixelCard>

        {/* Report icon */}
        <img src={reportIcon} alt="" className="w-11 h-11 object-contain shrink-0 select-none" />

        {/* Title */}
        <p className="flex-1 min-w-0 font-space-bold text-dark truncate" style={{ fontSize: 18 }}>
          {report.name}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isEditable && (
            <PixelCard bg="#FEF2F2" shadowOffset={3} radius={8} onClick={() => setDeleteConfirm(true)}>
              <div className="flex items-center justify-center" style={{ width: 34, height: 34 }}>
                <Trash2 className="w-4 h-4 text-danger" />
              </div>
            </PixelCard>
          )}
          {canApprove && (
            <>
              <PixelCard bg="#F0FDF4" shadowOffset={3} radius={8} onClick={() => setApproveConfirm(true)}>
                <div className="flex items-center gap-1.5 px-3" style={{ height: 34 }}>
                  <ThumbsUp className="w-3.5 h-3.5 text-success" />
                  <span className="font-space-bold text-success" style={{ fontSize: 11 }}>{t("reportDetail.approveReport")}</span>
                </div>
              </PixelCard>
              <PixelCard bg="#FEF2F2" shadowOffset={3} radius={8} onClick={() => setDeclineConfirm(true)}>
                <div className="flex items-center gap-1.5 px-3" style={{ height: 34 }}>
                  <ThumbsDown className="w-3.5 h-3.5 text-danger" />
                  <span className="font-space-bold text-danger" style={{ fontSize: 11 }}>{t("reportDetail.declineReport")}</span>
                </div>
              </PixelCard>
            </>
          )}
          {isEditable && (
            <PixelCard bg={BRAND} shadowOffset={3} radius={8} onClick={submitMutation.isPending ? undefined : () => setSubmitConfirm(true)}>
              <div className="flex items-center justify-center gap-1.5 px-3" style={{ height: 34, opacity: submitMutation.isPending ? 0.65 : 1 }}>
                <Send className="w-3.5 h-3.5 text-white" />
                <span className="font-space-bold text-white" style={{ fontSize: 11 }}>{t("reportDetail.submitReport")}</span>
              </div>
            </PixelCard>
          )}
        </div>
      </div>

      {/* ── Body — two-column desktop layout ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-0">

        {/* ── Left: report info ─────────────────────────────────────────── */}
        <div
          className="px-6 pt-6 pb-10 space-y-0"
          style={{ borderRight: `2px solid ${SHADOW}` }}
        >
          <PixelCard shadowOffset={5} className="w-full">

            {/* Date block */}
            <div
              className="flex items-center gap-2 px-5 py-4"
              style={{ borderBottom: `2px solid rgba(26,26,26,0.07)` }}
            >
              <Calendar className="w-4 h-4 shrink-0" style={{ color: `${DARK}50` }} />
              <div>
                <p className="font-space-bold text-dark" style={{ fontSize: 13 }}>
                  {format(new Date(report.start_date), "d MMM yyyy", { locale: dateLocale })}
                </p>
                <p className="font-space-medium" style={{ fontSize: 11, color: `${DARK}45` }}>
                  → {format(new Date(report.end_date), "d MMM yyyy", { locale: dateLocale })}
                </p>
              </div>
            </div>

            {/* Status block */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: `2px solid rgba(26,26,26,0.07)` }}
            >
              <p className="font-space-bold uppercase" style={{ fontSize: 10, color: `${DARK}45`, letterSpacing: "0.8px" }}>Estado</p>
              <StatusBadge status={report.status} size="md" />
            </div>

            {/* Amount block */}
            <div className="flex flex-col items-center py-8 px-5">
              <FinancialSummary
                status={report.status}
                currency={report.currency}
                requestedAmount={report.requested_amount ?? 0}
                approvedAmount={report.approved_amount ?? 0}
                ticketsTotal={ticketsTotal}
              />
            </div>

            {/* Status banners */}
            {isSubmitted && !canApprove && (
              <div className="px-5 pb-5">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                  style={{ backgroundColor: "#FFF3CD", border: `2px solid ${SHADOW}`, boxShadow: `2px 2px 0px ${SHADOW}` }}>
                  <Clock className="w-3.5 h-3.5 text-warning shrink-0" />
                  <span className="font-space-bold text-warning" style={{ fontSize: 11 }}>{t("reportDetail.submittedReview")}</span>
                </div>
              </div>
            )}
            {report.status.toUpperCase() === "APPROVED" && (
              <div className="px-5 pb-5">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                  style={{ backgroundColor: "#D1FAE5", border: `2px solid ${SHADOW}`, boxShadow: `2px 2px 0px ${SHADOW}` }}>
                  <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />
                  <span className="font-space-bold text-success" style={{ fontSize: 11 }}>{t("reportDetail.approved")}</span>
                </div>
              </div>
            )}
            {["REJECTED", "DECLINED"].includes(report.status.toUpperCase()) && (
              <div className="px-5 pb-5">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                  style={{ backgroundColor: "#FEE2E2", border: `2px solid ${SHADOW}`, boxShadow: `2px 2px 0px ${SHADOW}` }}>
                  <XCircle className="w-3.5 h-3.5 text-danger shrink-0" />
                  <span className="font-space-bold text-danger" style={{ fontSize: 11 }}>{t("status.DECLINED")}</span>
                </div>
              </div>
            )}
          </PixelCard>
        </div>

        {/* ── Right: tickets list ────────────────────────────────────────── */}
        <div className="px-6 md:px-8 pt-6 pb-10 min-w-0 max-w-2xl">
          <SectionHeader
            icon={<FileText className="w-3 h-3" />}
            label={t("reportDetail.ticketsTitle")}
            count={tickets?.length ?? 0}
            action={isEditable && (tickets?.length ?? 0) > 0 ? (
              <PixelCard bg={BRAND} shadowOffset={2} radius={6} onClick={() => setIsUploadModalOpen(true)}>
                <div className="px-3 py-1.5">
                  <span className="font-space-bold text-white" style={{ fontSize: 10 }}>+ {t("reportDetail.addTicket")}</span>
                </div>
              </PixelCard>
            ) : undefined}
          />

          {isLoadingTickets ? (
            <div className="space-y-2.5">
              <TicketSkeleton /><TicketSkeleton /><TicketSkeleton />
            </div>
          ) : tickets && tickets.length > 0 ? (
            <div className="space-y-2">
              {tickets.map((ticket, idx) => (
                <PixelCard
                  key={ticket.id ?? `ticket-${idx}`}
                  shadowOffset={3}
                  onClick={() => { setSelectedTicket(ticket); setIsDetailModalOpen(true); }}
                  className="w-full"
                >
                  {/* Grid: icon | name+date | amount+badge | actions */}
                  <div
                    className="items-center px-4 py-3.5"
                    style={{ display: "grid", gridTemplateColumns: "44px 1fr 140px auto", gap: "12px" }}
                  >
                    {/* Icon */}
                    <img src={ticketIcon} alt="" className="w-11 h-11 object-contain select-none" />

                    {/* Name + date */}
                    <div className="min-w-0">
                      <p className="font-space-bold text-dark truncate" style={{ fontSize: 14 }}>
                        {ticket.location_name ?? t("reportDetail.noTicketName")}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {ticket.date && (
                          <span className="font-space-medium" style={{ fontSize: 11, color: `${DARK}55` }}>
                            {format(new Date(ticket.date), "dd MMM yyyy", { locale: dateLocale })}
                          </span>
                        )}
                        {ticket.expense_type && (
                          <span style={{
                            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 9,
                            color: BRAND, backgroundColor: `${BRAND}18`,
                            paddingLeft: 6, paddingRight: 6, paddingTop: 2, paddingBottom: 2,
                            borderRadius: 6, border: `1.5px solid ${BRAND}`,
                          }}>
                            {ticket.expense_type}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amount + badge — fixed 140px col, right-aligned */}
                    <div className="text-right">
                      <p className="font-space-bold text-dark tabular-nums" style={{ fontSize: 15 }}>
                        {ticket.amount == null ? "—" : ticket.amount.toLocaleString()}
                        <span style={{ fontSize: 10, color: `${DARK}50` }}> {ticket.currency}</span>
                      </p>
                      <div className="mt-1.5 flex justify-end">
                        <StatusBadge status={ticket.status} size="sm" />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {isEditable && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); if (id) deleteTicketMutation.mutate({ reportId: id, ticketId: ticket.id }); }}
                          style={{
                            width: 30, height: 30, borderRadius: 10,
                            backgroundColor: "#FEF2F2", border: `2px solid ${SHADOW}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: `2px 2px 0px ${SHADOW}`,
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-danger" />
                        </button>
                      )}
                      <ChevronRight className="w-4 h-4" style={{ color: `${DARK}25` }} />
                    </div>
                  </div>
                </PixelCard>
              ))}
            </div>
          ) : (
            <PixelCard shadowOffset={4} className="w-full">
              <div className="flex flex-col items-center text-center py-12 px-6 gap-3">
                <img src={ticketIcon} alt="" className="w-16 h-16 object-contain select-none" style={{ opacity: 0.6 }} />
                <p className="font-space-bold text-dark" style={{ fontSize: 14 }}>{t("reportDetail.startDigitalizing")}</p>
                <p className="font-space text-dark/40 max-w-xs leading-relaxed" style={{ fontSize: 12 }}>
                  {t("reportDetail.digitalizeDesc")}
                </p>
                {isEditable && (
                  <PixelCard bg={BRAND} shadowOffset={3} radius={99} onClick={() => setIsUploadModalOpen(true)}>
                    <div className="flex items-center gap-1.5 px-4 py-2.5">
                      <Camera className="w-3.5 h-3.5 text-white" />
                      <span className="font-space-bold text-white" style={{ fontSize: 12 }}>{t("reportDetail.scanFirstTicket")}</span>
                    </div>
                  </PixelCard>
                )}
              </div>
            </PixelCard>
          )}
        </div>

      </div>

      {/* ── Confirm dialogs ────────────────────────────────────────────────── */}

      {submitConfirm && (
        <ConfirmDialog
          icon={<Send className="w-7 h-7 text-success" />}
          title={t("reportDetail.submitReport")}
          description={t("reportDetail.confirmSubmit")}
          onCancel={() => setSubmitConfirm(false)}
          onConfirm={() => submitMutation.mutate(id!)}
          confirmLabel={t("reportDetail.submitReport")}
          cancelLabel={t("common.cancel")}
          confirmBg="#00C896"
          isLoading={submitMutation.isPending}
        />
      )}
      {approveConfirm && (
        <ConfirmDialog
          icon={<ThumbsUp className="w-7 h-7 text-success" />}
          title={t("reportDetail.approveReport")}
          description={t("reportDetail.confirmApprove")}
          onCancel={() => setApproveConfirm(false)}
          onConfirm={() => updateStatusMutation.mutate({ id: id!, status: ReportStatus.APPROVED })}
          confirmLabel={t("reportDetail.approveReport")}
          cancelLabel={t("common.cancel")}
          confirmBg="#00C896"
          isLoading={updateStatusMutation.isPending}
        />
      )}
      {declineConfirm && (
        <ConfirmDialog
          icon={<ThumbsDown className="w-7 h-7 text-danger" />}
          title={t("reportDetail.declineReport")}
          description={t("reportDetail.confirmDecline")}
          onCancel={() => setDeclineConfirm(false)}
          onConfirm={() => updateStatusMutation.mutate({ id: id!, status: ReportStatus.DECLINED })}
          confirmLabel={t("reportDetail.declineReport")}
          cancelLabel={t("common.cancel")}
          confirmBg="#FF4B4B"
          isLoading={updateStatusMutation.isPending}
        />
      )}
      {deleteConfirm && (
        <ConfirmDialog
          icon={<AlertTriangle className="w-7 h-7 text-danger" />}
          title={t("reportDetail.deleteReport")}
          description={t("reportDetail.confirmDelete")}
          onCancel={() => setDeleteConfirm(false)}
          onConfirm={() => deleteReportMutation.mutate(id!)}
          confirmLabel={t("common.delete")}
          cancelLabel={t("common.cancel")}
          confirmBg="#FF4B4B"
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
        onClose={() => { setIsDetailModalOpen(false); setSelectedTicket(null); }}
        ticket={selectedTicket}
        reportId={id!}
        isEditable={isEditable}
        canApprove={canApprove}
      />
    </div>
  );
};
