import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Camera, Send, Trash2, FileText, ThumbsUp, ThumbsDown, Clock,
  AlertTriangle, ChevronRight, LayoutList, Table2, Calendar, Wallet,
  TrendingUp, CheckCircle2, XCircle,
} from "lucide-react";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { PixelCard } from "../../../components/ui/PixelCard";
import { DateGroupHeader } from "../../../components/ui/DateGroupHeader";
import { TicketUploadModal } from "../../tickets/components/TicketUploadModal";
import { TicketDetailModal } from "../../tickets/components/TicketDetailModal";
import { TicketsTable } from "../../tickets/components/TicketsTable";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";
import {
  useReportQuery, useTicketsQuery, usePermissions, type ITicket,
} from "@ticket-registrator/shared";
import { fonts } from "@ticket-registrator/shared";
import { reportIcon, ticketIcon } from "@ticket-registrator/shared/assets";
import { format } from "date-fns";
import { useDateLocale } from "../../../hooks/useDateLocale";
import { useGroupedByDate } from "../../../hooks/useGroupedByDate";
import { useReportDetailActions } from "../hooks/useReportDetailActions";
import { useTranslation } from "react-i18next";
import { tokens } from "../../../styles/theme";
import { DARK, BRAND } from "../constants";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const TicketSkeleton = () => (
  <div className="bg-white border border-dark/10 rounded-xl p-4 animate-pulse flex items-center gap-3">
    <div className="w-9 h-9 bg-dark/10 rounded-lg shrink-0" />
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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const { data: report, isLoading, isError } = useReportQuery(id);
  const { data: tickets, isLoading: isLoadingTickets } = useTicketsQuery(id!);

  const actions = useReportDetailActions(id!);
  const dateLocale = useDateLocale();
  const groupedTickets = useGroupedByDate(tickets);

  const isEditable = report && ["CREATED", "DRAFT"].includes(report.status.toUpperCase());
  const isSubmitted = report?.status.toUpperCase() === "SUBMITTED";
  const isApproved = report && ["APPROVED", "PAID"].includes(report.status.toUpperCase());
  const canApprove = can("approve_reports") && isSubmitted;
  const ticketsTotal = tickets?.reduce((acc, tk) => acc + (tk.amount ?? 0), 0) ?? 0;
  const rejected = Math.max(0, (report?.requested_amount ?? 0) - (report?.approved_amount ?? 0));

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="-mx-6 -mt-7 md:-mx-10 lg:-mt-9">
        <div className={tokens.headerPage}>
          <div className="bg-surface border border-dark/10 rounded-xl animate-pulse h-8 w-64" />
        </div>
        <div className="w-full max-w-5xl mx-auto px-8 md:px-16 pt-6 pb-12 space-y-4">
          <div className="bg-white border border-dark/10 rounded-xl animate-pulse h-24" />
          <TicketSkeleton /><TicketSkeleton /><TicketSkeleton />
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (isError || !report) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <PixelCard className="w-full max-w-sm">
          <div className="flex flex-col items-center text-center p-8 gap-3">
            <AlertTriangle className="w-8 h-8 text-danger" />
            <p className="font-space-bold text-dark" style={{ fontSize: 15 }}>{t("reportDetail.errorLoading")}</p>
            <p className="font-space text-dark/50" style={{ fontSize: 12 }}>{t("reportDetail.errorDesc")}</p>
            <Button variant="primary" onClick={() => navigate("/reports")}>{t("common.cancel")}</Button>
          </div>
        </PixelCard>
      </div>
    );
  }

  // ── Main ───────────────────────────────────────────────────────────────────

  return (
    <div className="-mx-6 -mt-7 md:-mx-10 lg:-mt-9">

      {/* ── Page header ── */}
      <div className={tokens.headerPage}>
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => navigate("/reports")}
            className="font-space-bold text-dark/30 hover:text-dark transition-colors shrink-0"
            style={{ fontSize: 24 }}
          >
            {t("trips.title")}
          </button>
          <ChevronRight className="w-5 h-5 text-dark/20 shrink-0" />
          <div className="flex items-center gap-2.5 min-w-0">
            <img src={reportIcon} alt="" className="w-8 h-8 object-contain shrink-0 select-none hidden sm:block" />
            <h1 className="font-space-bold text-dark truncate" style={{ fontSize: 24 }}>
              {report.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isEditable && (
            <>
              <Button variant="primary" leftIcon={<Send className="w-4 h-4" />}
                onClick={() => actions.setSubmitConfirm(true)} isLoading={actions.isSubmitting}>
                {t("common.submit")}
              </Button>
              <Button variant="danger" leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => actions.setDeleteConfirm(true)}>
                {t("common.delete")}
              </Button>
            </>
          )}
          {canApprove && (
            <>
              <Button variant="success" leftIcon={<ThumbsUp className="w-4 h-4" />}
                onClick={() => actions.setApproveConfirm(true)} isLoading={actions.isUpdatingStatus}>
                {t("common.approve")}
              </Button>
              <Button variant="danger" leftIcon={<ThumbsDown className="w-4 h-4" />}
                onClick={() => actions.setDeclineConfirm(true)} isLoading={actions.isUpdatingStatus}>
                {t("common.reject")}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="w-full max-w-5xl mx-auto px-8 md:px-16 pt-6 pb-12 space-y-6">

        {/* ── Report info card ── */}
        <PixelCard className="w-full">
          {/* Row principal */}
          <div className="flex items-center gap-4 px-5 py-4">
            <img src={reportIcon} alt="" className="w-10 h-10 object-contain shrink-0 select-none" />

            <div className="flex-[2] min-w-0">
              <p className="font-space-bold text-dark truncate" style={{ fontSize: 15 }}>
                {report.name}
              </p>
              {report.type && (
                <span className="inline-flex items-center font-space-bold mt-1" style={{
                  fontFamily: `'${fonts.family}', sans-serif`, fontWeight: 700, fontSize: 9,
                  color: BRAND, backgroundColor: `${BRAND}12`,
                  paddingLeft: 6, paddingRight: 6, paddingTop: 2, paddingBottom: 2,
                  borderRadius: 5, border: `1.5px solid ${BRAND}25`,
                }}>
                  {report.type}
                </span>
              )}
            </div>

            <div className="shrink-0 w-32 flex justify-center">
              <StatusBadge status={report.status} size="sm" />
            </div>

            <div className="shrink-0 w-44 flex items-center justify-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: `${DARK}40` }} />
              <p className="font-space-semibold whitespace-nowrap tabular-nums" style={{ fontSize: 12, color: `${DARK}70` }}>
                {format(new Date(report.start_date), "dd MMM", { locale: dateLocale })}
                {" – "}
                {format(new Date(report.end_date), "dd MMM yy", { locale: dateLocale })}
              </p>
            </div>

            {/* Financiero */}
            <div className="flex items-center gap-6 ml-auto shrink-0">
              <div className="text-center">
                <p className="font-space text-dark/40 uppercase tracking-widest" style={{ fontSize: 9 }}>
                  <Wallet className="w-3 h-3 inline mr-1" />
                  {isApproved ? t("reportDetail.approved") : "Total"}
                </p>
                <p className="font-space-bold text-dark tabular-nums" style={{ fontSize: 18, letterSpacing: "-0.4px" }}>
                  {(isApproved ? report.approved_amount : ticketsTotal ?? report.requested_amount ?? 0).toLocaleString()}
                  <span className="font-space ml-1" style={{ fontSize: 11, color: `${DARK}45` }}>{report.currency}</span>
                </p>
              </div>

              {isApproved && rejected > 0 && (
                <div className="text-center">
                  <p className="font-space text-danger/50 uppercase tracking-widest" style={{ fontSize: 9 }}>
                    <XCircle className="w-3 h-3 inline mr-1" />
                    Rechazado
                  </p>
                  <p className="font-space-bold text-danger tabular-nums" style={{ fontSize: 15 }}>
                    {rejected.toLocaleString()}
                    <span className="font-space ml-1" style={{ fontSize: 10 }}>{report.currency}</span>
                  </p>
                </div>
              )}

              {!isApproved && (
                <div className="text-center">
                  <p className="font-space text-dark/40 uppercase tracking-widest" style={{ fontSize: 9 }}>
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    Solicitado
                  </p>
                  <p className="font-space-bold text-dark tabular-nums" style={{ fontSize: 15, color: `${DARK}70` }}>
                    {(report.requested_amount ?? 0).toLocaleString()}
                    <span className="font-space ml-1" style={{ fontSize: 10, color: `${DARK}40` }}>{report.currency}</span>
                  </p>
                </div>
              )}

              {isApproved && (
                <div className="text-center">
                  <p className="font-space text-success/70 uppercase tracking-widest" style={{ fontSize: 9 }}>
                    <CheckCircle2 className="w-3 h-3 inline mr-1" />
                    Aprobado
                  </p>
                  <p className="font-space-bold text-success tabular-nums" style={{ fontSize: 15 }}>
                    {(report.approved_amount ?? 0).toLocaleString()}
                    <span className="font-space ml-1" style={{ fontSize: 10 }}>{report.currency}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Banner revisión pendiente */}
          {isSubmitted && !canApprove && (
            <div className="mx-5 mb-4 flex items-center gap-3 px-4 py-2.5 bg-warning/5 border border-warning/20 rounded-xl">
              <Clock className="w-4 h-4 text-warning shrink-0" />
              <p className="font-space-semibold text-warning/80" style={{ fontSize: 12 }}>
                {t("reportDetail.submittedReview")} — {t("reportDetail.reviewTimeframe")}
              </p>
            </div>
          )}
        </PixelCard>

        {/* ── Tickets ── */}
        <section>
          <SectionHeader
            icon={<FileText />}
            title={t("reportDetail.ticketsTitle")}
            count={tickets?.length ?? 0}
            action={
              <div className="flex items-center gap-2">
                {/* Toggle vista */}
                <div className="flex items-center bg-dark/5 rounded-full p-0.5">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={[
                      'flex items-center px-3 py-1.5 rounded-full text-xs font-space-bold transition-all duration-100',
                      viewMode === 'cards' ? 'bg-white text-dark shadow-sm' : 'text-dark/40 hover:text-dark',
                    ].join(' ')}
                  >
                    <LayoutList className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={[
                      'flex items-center px-3 py-1.5 rounded-full text-xs font-space-bold transition-all duration-100',
                      viewMode === 'table' ? 'bg-white text-dark shadow-sm' : 'text-dark/40 hover:text-dark',
                    ].join(' ')}
                  >
                    <Table2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isEditable && (tickets?.length ?? 0) > 0 && (
                  <Button variant="primary" leftIcon={<Camera className="w-4 h-4" />} size="md"
                    onClick={() => setIsUploadModalOpen(true)}>
                    {t("reportDetail.addTicket")}
                  </Button>
                )}
              </div>
            }
          />

          {viewMode === 'table' ? (
            <TicketsTable
              tickets={tickets ?? []}
              isLoading={isLoadingTickets}
              onTicketClick={(ticket) => { setSelectedTicket(ticket); setIsDetailModalOpen(true); }}
            />
          ) : isLoadingTickets ? (
            <div className="space-y-2">
              <TicketSkeleton /><TicketSkeleton /><TicketSkeleton />
            </div>
          ) : groupedTickets.length > 0 ? (
            <div className="space-y-6">
              {groupedTickets.map(({ date, items: groupTickets }) => (
                <div key={date.toISOString()} className="space-y-2">
                  <DateGroupHeader date={date} count={groupTickets.length} dateLocale={dateLocale}
                    today={t("ticketsPage.today")} yesterday={t("ticketsPage.yesterday")} />
                  {groupTickets.map((ticket, idx) => (
                    <PixelCard
                      key={ticket.id ?? `ticket-${idx}`}
                      shadowOffset={3}
                      onClick={() => { setSelectedTicket(ticket); setIsDetailModalOpen(true); }}
                      className="w-full"
                    >
                      <div className="px-4 py-3 flex items-center gap-3">
                        <img src={ticketIcon} alt="" className="w-9 h-9 object-contain select-none shrink-0" />

                        <div className="flex-[2] min-w-0">
                          <p className="font-space-bold text-dark truncate" style={{ fontSize: 13 }}>
                            {ticket.location_name ?? t("reportDetail.noTicketName")}
                          </p>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-space-bold text-dark tabular-nums leading-none" style={{ fontSize: 14 }}>
                            {ticket.amount == null ? "—" : ticket.amount.toLocaleString()}
                            {ticket.currency && (
                              <span className="font-space ml-1" style={{ fontSize: 9, color: `${DARK}45` }}>
                                {ticket.currency}
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="flex-1 min-w-0">
                          {ticket.payment_type ? (
                            <span className="inline-flex items-center font-space-bold" style={{
                              fontFamily: `'${fonts.family}', sans-serif`, fontWeight: 700, fontSize: 9,
                              color: DARK, backgroundColor: `${DARK}0D`,
                              paddingLeft: 7, paddingRight: 7, paddingTop: 3, paddingBottom: 3,
                              borderRadius: 6, border: `1.5px solid ${DARK}20`,
                            }}>
                              {ticket.payment_type}
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: `${DARK}25` }}>—</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-space-semibold tabular-nums" style={{ fontSize: 11, color: `${DARK}70` }}>
                            {ticket.date
                              ? format(new Date(ticket.date), "dd MMM yyyy", { locale: dateLocale })
                              : <span style={{ color: `${DARK}25` }}>—</span>}
                          </p>
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="inline-flex items-center gap-1 font-space-bold" style={{
                            fontFamily: `'${fonts.family}', sans-serif`, fontWeight: 700, fontSize: 9,
                            color: BRAND, backgroundColor: `${BRAND}12`,
                            paddingLeft: 7, paddingRight: 7, paddingTop: 3, paddingBottom: 3,
                            borderRadius: 6, border: `1.5px solid ${BRAND}30`,
                          }}>
                            {ticket.items?.length ?? 0} items
                          </span>
                        </div>

                        <ChevronRight className="w-4 h-4 shrink-0" style={{ color: `${DARK}25` }} />
                      </div>
                    </PixelCard>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <PixelCard className="w-full">
              <div className="flex flex-col items-center text-center py-12 px-6 gap-3">
                <img src={ticketIcon} alt="" className="w-14 h-14 object-contain select-none" style={{ opacity: 0.5 }} />
                <p className="font-space-bold text-dark" style={{ fontSize: 14 }}>{t("reportDetail.startDigitalizing")}</p>
                <p className="font-space text-dark/40 max-w-xs leading-relaxed" style={{ fontSize: 12 }}>
                  {t("reportDetail.digitalizeDesc")}
                </p>
                {isEditable && (
                  <Button variant="primary" leftIcon={<Camera className="w-4 h-4" />}
                    onClick={() => setIsUploadModalOpen(true)}>
                    {t("reportDetail.scanFirstTicket")}
                  </Button>
                )}
              </div>
            </PixelCard>
          )}
        </section>
      </div>

      {/* ── Dialogs ── */}
      {actions.submitConfirm && (
        <ConfirmDialog icon={<Send />} title={t("reportDetail.submitReport")}
          description={t("reportDetail.confirmSubmit")}
          onCancel={() => actions.setSubmitConfirm(false)} onConfirm={actions.handleSubmit}
          confirmLabel={t("reportDetail.submitReport")} cancelLabel={t("common.cancel")}
          confirmVariant="primary" isLoading={actions.isSubmitting} />
      )}
      {actions.approveConfirm && (
        <ConfirmDialog icon={<ThumbsUp />} title={t("reportDetail.approveReport")}
          description={t("reportDetail.confirmApprove")}
          onCancel={() => actions.setApproveConfirm(false)} onConfirm={actions.handleApprove}
          confirmLabel={t("reportDetail.approveReport")} cancelLabel={t("common.cancel")}
          confirmVariant="success" isLoading={actions.isUpdatingStatus} />
      )}
      {actions.declineConfirm && (
        <ConfirmDialog icon={<ThumbsDown />} title={t("reportDetail.declineReport")}
          description={t("reportDetail.confirmDecline")}
          onCancel={() => actions.setDeclineConfirm(false)} onConfirm={actions.handleDecline}
          confirmLabel={t("reportDetail.declineReport")} cancelLabel={t("common.cancel")}
          confirmVariant="danger" isLoading={actions.isUpdatingStatus} />
      )}
      {actions.deleteConfirm && (
        <ConfirmDialog icon={<AlertTriangle />} title={t("reportDetail.deleteReport")}
          description={t("reportDetail.confirmDelete")}
          onCancel={() => actions.setDeleteConfirm(false)} onConfirm={actions.handleDelete}
          confirmLabel={t("common.delete")} cancelLabel={t("common.cancel")}
          confirmVariant="danger" isLoading={actions.isDeleting} />
      )}

      <TicketUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} reportId={id!} />
      <TicketDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedTicket(null); }}
        ticket={selectedTicket} reportId={id!} isEditable={isEditable} canApprove={canApprove}
      />
    </div>
  );
};
