import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Send, Trash2, ThumbsUp, ThumbsDown,
  AlertTriangle, Calendar, ArrowLeft, Plus,
} from "lucide-react";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { TicketUploadModal } from "../../tickets/components/TicketUploadModal";
import { TicketDetailModal } from "../../tickets/components/TicketDetailModal";
import { TicketsTable } from "../../tickets/components/TicketsTable";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";
import {
  useReportQuery, useTicketsQuery, usePermissions, type ITicket,
} from "@ticket-registrator/shared";
import { format, eachDayOfInterval, isSameDay } from "date-fns";
import { useDateLocale } from "../../../hooks/useDateLocale";
import { useReportDetailActions } from "../hooks/useReportDetailActions";
import { useTranslation } from "react-i18next";
import { DonutChart, AreaTrendChart } from "../../../components/ui/Charts";

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

  const r = report;
  const tk = tickets;

  // ── Data Processing for Charts ─────────────────────────────────────────────

  const categoryData = useMemo(() => {
    if (!tk || tk.length === 0) return [];
    const counts: Record<string, number> = {};
    for (const ticket of tk) {
      if (!ticket.items?.length) continue;
      for (const item of ticket.items) {
        const cat = item.categoryName ?? t("trips.typeOther");
        counts[cat] = (counts[cat] ?? 0) + (item.amount ?? 0);
      }
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [tk, t]);

  const trendData = useMemo(() => {
    if (!tk || !r?.start_date || !r.end_date) return [];
    try {
      const days = eachDayOfInterval({
        start: new Date(r.start_date),
        end: new Date(r.end_date)
      });
      return days.map(day => {
        const value = tk
          .filter(t => t.date && isSameDay(new Date(t.date), day))
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        return {
          date: format(day, "dd MMM", { locale: dateLocale }),
          value
        };
      });
    } catch {
      return [];
    }
  }, [tk, r, dateLocale]);

  const isEditable = r && ["CREATED", "DRAFT"].includes(r.status.toUpperCase());
  const isSubmitted = r?.status.toUpperCase() === "SUBMITTED";
  const isApproved = r && ["APPROVED", "PAID"].includes(r.status.toUpperCase());
  const canApprove = can("approve_reports") && isSubmitted;
  const ticketsTotal = tk?.reduce((acc, currentTk) => acc + (currentTk.amount ?? 0), 0) ?? 0;
  const rejected = r ? Math.max(0, (r.requested_amount ?? 0) - (r.approved_amount ?? 0)) : 0;

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="h-4 w-24 bg-dark/5 rounded animate-pulse" />
          <div className="h-10 w-64 bg-dark/5 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-[200px] w-full bg-white border border-[var(--color-border-main)] rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (isError || !r) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3 px-6">
        <div className="w-full max-w-sm rounded-lg border border-[var(--color-border-main)] bg-white shadow-sm overflow-hidden">
          <div className="flex flex-col items-center text-center p-8 gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-danger" />
            </div>
            <p className="font-sans-semibold text-dark text-[15px]">{t("reportDetail.errorLoading")}</p>
            <p className="font-sans-normal text-dark/50 text-[13px]">{t("reportDetail.errorDesc")}</p>
            <Button variant="secondary" onClick={() => navigate("/reports")}>{t("common.cancel")}</Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-10 pb-12">

      {/* ── Page header ── */}
      <div className="flex items-end justify-between pt-1">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => navigate("/reports")}
              className="group flex items-center gap-1 text-dark/40 hover:text-dark transition-colors w-fit"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-[11px] font-sans-semibold text-dark/40">{t("trips.title")}</span>
            </button>

            <div className="flex items-center gap-4">
              <h1 className="text-[36px] font-sans-bold text-dark leading-none tracking-tight">
                {r.name}
              </h1>
              <div className="pt-1">
                <StatusBadge status={r.status} size="sm" />
              </div>
            </div>
          </div>


          <div className="flex items-center gap-8">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-sans-medium text-dark/45 leading-none">{t("reportForm.dateRange")}</span>
              <div className="flex items-center gap-1.5 text-dark/70 pt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[14px] font-sans-semibold tabular-nums leading-none">
                  {format(new Date(r.start_date), "dd MMM", { locale: dateLocale })}
                  {" – "}
                  {format(new Date(r.end_date), "dd MMM yyyy", { locale: dateLocale })}
                </span>
              </div>
            </div>

            {r.type && (
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-sans-medium text-dark/45 leading-none">{t("reportForm.type")}</span>
                <span className="text-[14px] font-sans-semibold text-dark/70 pt-0.5 leading-none">{r.type}</span>
              </div>
            )}

            <span className="w-px h-7 bg-dark/10 self-end mb-0.5" />

            <StatItem
              label={isApproved ? t("reportDetail.approved") : "Total"}
              value={(isApproved ? r.approved_amount : ticketsTotal ?? r.requested_amount ?? 0).toLocaleString()}
              currency={r.currency}
            />
            {isApproved && rejected > 0 && (
              <StatItem
                label={t("reportDetail.rejected") ?? "Rechazado"}
                value={rejected.toLocaleString()}
                currency={r.currency}
                variant="danger"
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditable && (
            <>
              <Button
                variant="secondary"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => actions.setDeleteConfirm(true)}
              >
                {t("common.delete")}
              </Button>
              <Button
                variant="primary"
                leftIcon={<Send className="w-3.5 h-3.5" />}
                onClick={() => actions.setSubmitConfirm(true)}
                isLoading={actions.isSubmitting}
              >
                {t("common.submit")}
              </Button>
            </>
          )}
          {canApprove && (
            <>
              <Button
                variant="danger"
                leftIcon={<ThumbsDown className="w-3.5 h-3.5" />}
                onClick={() => actions.setDeclineConfirm(true)}
                isLoading={actions.isUpdatingStatus}
              >
                {t("common.reject")}
              </Button>
              <Button
                variant="success"
                leftIcon={<ThumbsUp className="w-3.5 h-3.5" />}
                onClick={() => actions.setApproveConfirm(true)}
                isLoading={actions.isUpdatingStatus}
              >
                {t("common.approve")}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col gap-10">

        {isSubmitted && !canApprove && (
          <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-50 border border-amber-100 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <p className="font-sans-medium text-amber-700 text-[13px]">
              {t("reportDetail.submittedReview")} — {t("reportDetail.reviewTimeframe")}
            </p>
          </div>
        )}

        {/* ── Analytics Section ── */}
        {tk && tk.length > 0 && categoryData.length > 0 && (
          <section className="flex flex-col gap-6">
            <p className="text-[11px] font-sans-semibold text-dark/45">
              {t("analytics.title") ?? "Análisis"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Donut */}
              <div className="flex flex-col gap-4 p-5 rounded-lg border border-[var(--color-border-main)] bg-white h-[280px]">
                <p className="text-[12px] font-sans-bold text-dark/70">
                  {t("analytics.expensesByType") ?? "Gasto por categoría"}
                </p>
                <div className="flex-1 flex items-center justify-center">
                  <DonutChart
                    data={categoryData}
                    height={200}
                    centerValue={report?.requested_amount?.toLocaleString() ?? ticketsTotal.toLocaleString()}
                    centerLabel={report?.currency ?? ""}
                  />
                </div>
              </div>

              {/* Trend Chart */}
              <div className="flex flex-col gap-4 p-5 rounded-lg border border-[var(--color-border-main)] bg-white h-[280px]">
                <p className="text-[12px] font-sans-bold text-dark/70">
                  {t("analytics.dailyExpensesTrend") ?? "Evolución diaria"}
                </p>
                <div className="flex-1">
                  <AreaTrendChart
                    data={trendData}
                    height={180}
                    currency={report?.currency ?? ""}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-sans-semibold text-dark/45">
                {t("layout.allTickets")}
              </p>
              {tk && tk.length > 0 && (
                <span className="px-1.2 py-0.2 rounded bg-dark/5 text-dark/40 text-[10px] font-sans-bold tabular-nums">
                  {tk.length}
                </span>
              )}
            </div>

            {isEditable && (tk?.length ?? 0) > 0 && (
              <Button
                variant="primary"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                size="md"
                onClick={() => setIsUploadModalOpen(true)}
              >
                {t("reportDetail.addTicket")}
              </Button>
            )}
          </div>

          <div className="w-full">
            <TicketsTable
              tickets={tk ?? []}
              isLoading={isLoadingTickets}
              onTicketClick={(ticket) => { setSelectedTicket(ticket); setIsDetailModalOpen(true); }}
            />
          </div>
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

// ─── Sub-components ────────────────────────────────────────────────────────────

const StatItem = ({
  label,
  value,
  currency,
  variant = "default",
}: {
  label: string;
  value: string | number;
  currency?: string;
  variant?: "default" | "danger" | "muted";
}) => {
  const valueColor = {
    default: "text-dark",
    danger: "text-danger",
    muted: "text-dark/55",
  }[variant];

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-sans-medium text-dark/45 leading-none">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={`text-[22px] font-sans-bold ${valueColor} leading-none tracking-tight`}>{value}</span>
        {currency && (
          <span className="text-[12px] font-sans-medium text-dark/35">{currency}</span>
        )}
      </div>
    </div>
  );
};
