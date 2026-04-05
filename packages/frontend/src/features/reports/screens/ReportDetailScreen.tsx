import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Camera, Send, Trash2,
  FileText, ThumbsUp, ThumbsDown, Clock,
  AlertTriangle, ChevronRight,
} from "lucide-react";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { PixelCard } from "../../../components/ui/PixelCard";
import { DateGroupHeader } from "../../../components/ui/DateGroupHeader";
import { TicketUploadModal } from "../../tickets/components/TicketUploadModal";
import { TicketDetailModal } from "../../tickets/components/TicketDetailModal";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { Button } from "../../../components/ui/Button";
import { FinancialSummary } from "../components/FinancialSummary";
import { ConfirmDialog } from "../components/ConfirmDialog";
import {
  useReportQuery,
  useTicketsQuery,
  usePermissions,
  type ITicket,
} from "@ticket-registrator/shared";
import { fonts } from "@ticket-registrator/shared";
import { reportIcon, ticketIcon } from "@ticket-registrator/shared/assets";
import { format } from "date-fns";
import { useDateLocale } from "../../../hooks/useDateLocale";
import { useGroupedByDate } from "../../../hooks/useGroupedByDate";
import { useReportDetailActions } from "../hooks/useReportDetailActions";
import { useTranslation } from "react-i18next";
import { tokens } from "../../../styles/theme";
import { DARK, SHADOW, BRAND } from "../constants";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const TicketSkeleton = () => (
  <div className="bg-white border-2 border-dark/20 rounded-lg p-4 animate-pulse flex items-center gap-3">
    <div className="w-11 h-11 bg-dark/10 rounded-lg shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-1/2 bg-dark/10 rounded" />
      <div className="h-2.5 w-1/3 bg-dark/10 rounded" />
    </div>
    <div className="h-4 w-16 bg-dark/10 rounded shrink-0" />
  </div>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const ReportDetailScreen = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = usePermissions();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ITicket | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: report, isLoading, isError } = useReportQuery(id);
  const { data: tickets, isLoading: isLoadingTickets } = useTicketsQuery(id!);

  const actions = useReportDetailActions(id!);
  const dateLocale = useDateLocale();
  const groupedTickets = useGroupedByDate(tickets);

  const isEditable = report && ["CREATED", "DRAFT"].includes(report.status.toUpperCase());
  const isSubmitted = report?.status.toUpperCase() === "SUBMITTED";
  const canApprove = can("approve_reports") && isSubmitted;
  const ticketsTotal = tickets?.reduce((acc, tk) => acc + (tk.amount ?? 0), 0) ?? 0;

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="-mx-6 -mt-7 md:-mx-10 lg:-mt-9">
        <div className={tokens.headerPage}>
          <div className="bg-surface border-2 border-dark/20 rounded-lg animate-pulse h-10 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[340px_auto_1fr]">
          <div className="px-6 pt-7 pb-9 space-y-4">
            <div className="bg-white border-2 border-dark/20 rounded-lg animate-pulse h-56" />
          </div>
          <div className="hidden lg:block self-stretch" style={{ width: 2, backgroundColor: SHADOW }} />
          <div className="px-8 md:px-10 pt-7 pb-9 space-y-2.5">
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
        <PixelCard bg="#FEF2F2" className="w-full max-w-sm">
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

      {/* ── Header ── */}
      <div className={tokens.headerPage}>
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <button
            onClick={() => navigate("/reports")}
            className="font-space-bold text-dark/30 hover:text-dark transition-colors shrink-0"
            style={{ fontSize: 24, letterSpacing: "0.5px" }}
          >
            {t("trips.title")}
          </button>

          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-dark/20 shrink-0" />

          <div className="flex items-center gap-3 min-w-0">
            <img src={reportIcon} alt="" className="w-8 h-8 md:w-10 md:h-10 object-contain shrink-0 select-none hidden sm:block" />
            <h1 className="font-space-bold text-dark truncate" style={{ fontSize: 24, letterSpacing: "0.5px" }}>
              {report.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isEditable && (
            <>
              <Button
                variant="primary"
                className="w-[160px] whitespace-nowrap"
                leftIcon={<Send className="w-4 h-4" />}
                onClick={() => actions.setSubmitConfirm(true)}
                isLoading={actions.isSubmitting}
              >
                {t("common.submit")}
              </Button>
              <Button
                variant="danger"
                className="w-[160px] whitespace-nowrap"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => actions.setDeleteConfirm(true)}
              >
                {t("common.delete")}
              </Button>
            </>
          )}
          {canApprove && (
            <>
              <Button
                variant="success"
                className="w-[160px] whitespace-nowrap"
                leftIcon={<ThumbsUp className="w-4 h-4" />}
                onClick={() => actions.setApproveConfirm(true)}
                isLoading={actions.isUpdatingStatus}
              >
                {t("common.approve")}
              </Button>
              <Button
                variant="danger"
                className="w-[160px] whitespace-nowrap"
                leftIcon={<ThumbsDown className="w-4 h-4" />}
                onClick={() => actions.setDeclineConfirm(true)}
                isLoading={actions.isUpdatingStatus}
              >
                {t("common.reject")}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_auto_1fr]">

        {/* Left: report info */}
        <div className="px-6 pt-7 pb-9">
          <PixelCard className="w-full">
            <div className="px-6 py-6 border-b-2 border-slate-100 flex flex-col gap-5 items-center text-center">
              <StatusBadge status={report.status} size="md" />
              <div className="flex flex-col gap-1 items-center">
                <p className="text-[10px] font-space-bold text-dark/30 uppercase tracking-[0.2em] mb-1">
                  {t("reportDetail.reportPeriod")}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-15 font-space-bold leading-tight">
                    {format(new Date(report.start_date), "d MMM yyyy", { locale: dateLocale })}
                  </span>
                  <div className="w-6 h-0.5 bg-dark/10 rounded-full shrink-0" />
                  <span className="text-15 font-space-bold leading-tight">
                    {format(new Date(report.end_date), "d MMM yyyy", { locale: dateLocale })}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-10">
              <FinancialSummary
                status={report.status}
                currency={report.currency}
                requestedAmount={report.requested_amount ?? 0}
                approvedAmount={report.approved_amount ?? 0}
                ticketsTotal={ticketsTotal}
              />
            </div>

            {isSubmitted && !canApprove && (
              <div className="px-6 pb-6 pt-6 border-t-2 border-dashed border-slate-100">
                <div className="flex items-center gap-3 px-4 py-3 bg-warning/5 border-2 border-warning/10 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-warning" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-space-bold text-warning uppercase tracking-widest leading-none mb-1">
                      {t("reportDetail.submittedReview")}
                    </span>
                    <p className="text-[11px] font-medium text-warning/70">
                      {t("reportDetail.reviewTimeframe")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 flex justify-between items-center opacity-30 text-[9px] font-space-bold tracking-widest uppercase">
              <span>TR_{report.id?.substring(0, 8)}</span>
              <span>REF: {new Date().getFullYear()}</span>
            </div>
          </PixelCard>
        </div>

        {/* Separator */}
        <div className="hidden lg:block self-stretch" style={{ width: 2, backgroundColor: SHADOW }} />

        {/* Right: tickets list */}
        <div className="px-8 md:px-10 pt-7 pb-9 min-w-0">
          <SectionHeader
            icon={<FileText />}
            title={t("reportDetail.ticketsTitle")}
            count={tickets?.length ?? 0}
            action={isEditable && (tickets?.length ?? 0) > 0 ? (
              <Button
                variant="primary"
                leftIcon={<Camera className="w-4 h-4" />}
                size="md"
                onClick={() => setIsUploadModalOpen(true)}
              >
                {t("reportDetail.addTicket")}
              </Button>
            ) : undefined}
          />

          {isLoadingTickets ? (
            <div className="space-y-2.5">
              <TicketSkeleton /><TicketSkeleton /><TicketSkeleton />
            </div>
          ) : groupedTickets.length > 0 ? (
            <div className="space-y-6">
              {groupedTickets.map(({ date, items: groupTickets }) => (
                <div key={date.toISOString()} className="space-y-2">
                  <DateGroupHeader
                    date={date}
                    count={groupTickets.length}
                    dateLocale={dateLocale}
                    today={t("ticketsPage.today")}
                    yesterday={t("ticketsPage.yesterday")}
                  />
                  {groupTickets.map((ticket, idx) => (
                    <PixelCard
                      key={ticket.id ?? `ticket-${idx}`}
                      shadowOffset={3}
                      onClick={() => { setSelectedTicket(ticket); setIsDetailModalOpen(true); }}
                      className="w-full"
                    >
                      <div className="flex items-center px-4 py-3.5 gap-4">
                        <img src={ticketIcon} alt="" className="w-11 h-11 object-contain select-none shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-space-bold text-dark truncate" style={{ fontSize: 14 }}>
                            {ticket.location_name ?? t("reportDetail.noTicketName")}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {ticket.date && (
                              <span className="font-space-medium" style={{ fontSize: 11, color: `${DARK}55` }}>
                                {format(new Date(ticket.date), "dd MMM yyyy", { locale: dateLocale })}
                              </span>
                            )}
                            {ticket.expense_type && (
                              <span style={{
                                fontFamily: `'${fonts.family}', sans-serif`, fontWeight: 700, fontSize: 9,
                                color: BRAND, backgroundColor: `${BRAND}18`,
                                paddingLeft: 6, paddingRight: 6, paddingTop: 2, paddingBottom: 2,
                                borderRadius: 6, border: `1.5px solid ${BRAND}`,
                              }}>
                                {ticket.expense_type}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-space-bold text-dark tabular-nums" style={{ fontSize: 16 }}>
                            {ticket.amount == null ? "—" : ticket.amount.toLocaleString()}
                            <span style={{ fontSize: 10, color: `${DARK}50` }}> {ticket.currency}</span>
                          </p>
                        </div>
                        <div className="shrink-0 flex items-center justify-center pl-2">
                          <ChevronRight className="w-5 h-5" style={{ color: `${DARK}25` }} />
                        </div>
                      </div>
                    </PixelCard>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <PixelCard className="w-full">
              <div className="flex flex-col items-center text-center py-12 px-6 gap-3">
                <img src={ticketIcon} alt="" className="w-16 h-16 object-contain select-none" style={{ opacity: 0.6 }} />
                <p className="font-space-bold text-dark" style={{ fontSize: 14 }}>{t("reportDetail.startDigitalizing")}</p>
                <p className="font-space text-dark/40 max-w-xs leading-relaxed" style={{ fontSize: 12 }}>
                  {t("reportDetail.digitalizeDesc")}
                </p>
                {isEditable && (
                  <Button
                    variant="primary"
                    leftIcon={<Camera className="w-4 h-4" />}
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    {t("reportDetail.scanFirstTicket")}
                  </Button>
                )}
              </div>
            </PixelCard>
          )}
        </div>
      </div>

      {/* ── Confirm dialogs ── */}

      {actions.submitConfirm && (
        <ConfirmDialog
          icon={<Send />}
          title={t("reportDetail.submitReport")}
          description={t("reportDetail.confirmSubmit")}
          onCancel={() => actions.setSubmitConfirm(false)}
          onConfirm={actions.handleSubmit}
          confirmLabel={t("reportDetail.submitReport")}
          cancelLabel={t("common.cancel")}
          confirmVariant="primary"
          isLoading={actions.isSubmitting}
        />
      )}
      {actions.approveConfirm && (
        <ConfirmDialog
          icon={<ThumbsUp />}
          title={t("reportDetail.approveReport")}
          description={t("reportDetail.confirmApprove")}
          onCancel={() => actions.setApproveConfirm(false)}
          onConfirm={actions.handleApprove}
          confirmLabel={t("reportDetail.approveReport")}
          cancelLabel={t("common.cancel")}
          confirmVariant="success"
          isLoading={actions.isUpdatingStatus}
        />
      )}
      {actions.declineConfirm && (
        <ConfirmDialog
          icon={<ThumbsDown />}
          title={t("reportDetail.declineReport")}
          description={t("reportDetail.confirmDecline")}
          onCancel={() => actions.setDeclineConfirm(false)}
          onConfirm={actions.handleDecline}
          confirmLabel={t("reportDetail.declineReport")}
          cancelLabel={t("common.cancel")}
          confirmVariant="danger"
          isLoading={actions.isUpdatingStatus}
        />
      )}
      {actions.deleteConfirm && (
        <ConfirmDialog
          icon={<AlertTriangle />}
          title={t("reportDetail.deleteReport")}
          description={t("reportDetail.confirmDelete")}
          onCancel={() => actions.setDeleteConfirm(false)}
          onConfirm={actions.handleDelete}
          confirmLabel={t("common.delete")}
          cancelLabel={t("common.cancel")}
          confirmVariant="danger"
          isLoading={actions.isDeleting}
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
