import { Suspense, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Send, Trash2, CheckCircle2,
  AlertTriangle, Calendar, ArrowLeft, Plus,
  Tag, Receipt,
} from "lucide-react";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { TicketUploadModal } from "../../tickets/components/TicketUploadModal";
import { TicketDetailModal } from "../../tickets/components/TicketDetailModal";
import { TicketsTable } from "../../tickets/components/TicketsTable";
import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/EmptyState";
import { SectionCard } from "../../../components/ui/SectionCard";
import { MetaItem, MetaDivider } from "../../../components/ui/PageHeader";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { FinancialSummary } from "../components/FinancialSummary";
import { ReportTimeline } from "../components/ReportTimeline";
import {
  useReportQuery, useTicketsQuery, usePermissions, useUserQuery,
  buildCategoryMixFromItems,
} from "@ticket-registrator/shared";
import { format, eachDayOfInterval, isSameDay } from "date-fns";
import { useDateLocale } from "../../../hooks/useDateLocale";
import { useReportDetailActions } from "../hooks/useReportDetailActions";
import { useTranslation } from "react-i18next";
import { DonutChart, AreaTrendChart } from "../../../components/ui/LazyCharts";
import { ChartSkeleton } from "../../../components/ui/ChartSkeleton";

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const ReportDetailScreen = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = usePermissions();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  // Only store the id — derive the ticket from the React Query cache so
  // optimistic updates / refetches flow through to the open modal. Storing the
  // full ticket object froze it as a stale snapshot and made per-item approve/
  // reject "revert" once the optimistic override cleared on settle.
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: report, isLoading, isError } = useReportQuery(id);
  const { data: tickets, isLoading: isLoadingTickets } = useTicketsQuery(id!);
  const { data: currentUser } = useUserQuery();

  const actions = useReportDetailActions(id!);
  const dateLocale = useDateLocale();

  const r = report;
  const tk = tickets;
  const showOwner = !!r && !!currentUser && r.user_id !== currentUser.id;
  const ownerName = [r?.userName, r?.userSurname]
    .filter((p): p is string => Boolean(p && p.trim().length > 0))
    .join(" ");

  // Derive the ticket fed into the detail modal from the live React Query
  // cache so optimistic per-item approve/reject decisions propagate to the
  // open modal without revert flashes.
  const selectedTicket =
    (selectedTicketId && tk?.find((t) => t.id === selectedTicketId)) || null;

  // ── Data Processing for Charts ─────────────────────────────────────────────

  const categoryData = useMemo(() => {
    if (!tk || tk.length === 0) return [];
    const allItems = tk.flatMap((ticket) => ticket.items ?? []);
    const mix = buildCategoryMixFromItems(allItems, t("reports.uncategorized"));
    return mix.map((m) => ({
      name: m.categoryName,
      value: m.amount,
      color: m.categoryColor,
      icon: m.categoryIcon,
    }));
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

  const sideCardClass = "!bg-surface-card-soft";

  const isEditable = r && ["CREATED", "DRAFT"].includes(r.status.toUpperCase());
  const isSubmitted = r?.status.toUpperCase() === "SUBMITTED";
  const isApproved = r && ["APPROVED", "PAID"].includes(r.status.toUpperCase());
  const canApprove = can("approve_reports") && isSubmitted;
  const ticketsTotal = tk?.reduce((acc, currentTk) => acc + (currentTk.amount ?? 0), 0) ?? 0;

  // Live per-ticket totals during SUBMITTED review. `approved_amount` is now
  // persisted on each ticket by the backend (kept in sync with item statuses
  // in the same transaction), so summing it gives the same number the user
  // will see once the review finalises and the report transitions to
  // APPROVED. Rejected has no persisted column, so it's derived from items.
  const allItems = useMemo(
    () => (tk ?? []).flatMap((ticket) => ticket.items ?? []),
    [tk],
  );
  const reviewApprovedTotal = useMemo(
    () => (tk ?? []).reduce((sum, ticket) => sum + (ticket.approved_amount ?? 0), 0),
    [tk],
  );
  const reviewRejectedTotal = useMemo(
    () =>
      allItems.reduce(
        (sum, item) => (item.status === "Rejected" ? sum + (item.amount ?? 0) : sum),
        0,
      ),
    [allItems],
  );

  const headlineAmount = isApproved
    ? r?.approved_amount ?? 0
    : ticketsTotal || r?.requested_amount || 0;
  const rejected = isApproved
    ? Math.max(0, (r?.requested_amount ?? 0) - (r?.approved_amount ?? 0))
    : reviewRejectedTotal;

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
      <EmptyState
        icon={<AlertTriangle className="w-4 h-4 text-danger" aria-hidden={true} />}
        title={t("reportDetail.errorLoading")}
        description={t("reportDetail.errorDesc")}
        action={
          <Button variant="secondary" onClick={() => navigate("/reports")}>
            {t("common.cancel")}
          </Button>
        }
        className="min-h-[60vh] justify-center"
      />
    );
  }

  // ── Main ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-10 pb-12">

      {/* ── Page header ── */}
      <header className="pt-1">
        <button
          onClick={() => navigate("/reports")}
          className="group flex items-center gap-1 text-dark/40 hover:text-dark transition-colors w-fit mb-5"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[11px] font-sans-semibold text-dark/40">{t("trips.title")}</span>
        </button>

        <div className="flex items-start justify-between gap-10 flex-wrap">

          {/* ── Left: title + meta ── */}
          <div className="flex flex-col gap-8 min-w-0 flex-1">

            {/* Big title */}
            <div className="flex flex-col gap-2 min-w-0">
              <h1 className="text-[clamp(40px,5.4vw,68px)] font-sans-bold text-dark leading-[0.92] tracking-[-0.035em] break-words">
                {r.name}
              </h1>

              {showOwner && ownerName && (
                <p className="text-[13px] font-sans-medium text-dark/55 leading-none">
                  {t("reportDetail.by")} <span className="text-dark/80">{ownerName}</span>
                </p>
              )}
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-4 flex-wrap text-dark/75">
              <div className="flex items-center leading-none">
                <StatusBadge status={r.status} />
              </div>
              <MetaDivider />
              <MetaItem
                icon={<Calendar className="w-4 h-4" />}
                label={t("reportForm.dateRange").split(" ")[0]}
                value={`${format(new Date(r.start_date), "dd MMM", { locale: dateLocale })} – ${format(new Date(r.end_date), "dd MMM yyyy", { locale: dateLocale })}`}
              />
              {r.type && (
                <>
                  <MetaDivider />
                  <MetaItem
                    icon={<Tag className="w-4 h-4" />}
                    label={t("reportForm.type")}
                    value={r.type}
                  />
                </>
              )}
              <MetaDivider />
              <MetaItem
                icon={<Receipt className="w-4 h-4" />}
                label={t("layout.allTickets")}
                value={String(tk?.length ?? 0)}
              />
            </div>
          </div>

          {/* ── Right: total + actions ── */}
          <div className="flex flex-col items-end gap-5 shrink-0">

            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[11px] font-sans-medium text-dark/45 leading-none">
                {isApproved
                  ? `${t("reportDetail.approved")} · ${t("reportDetail.totalRequested")}`
                  : t("reportDetail.totalRequested")}
              </span>
              <div className="flex items-baseline gap-2 leading-none">
                <span className="text-[clamp(40px,5.4vw,64px)] font-sans-bold text-dark leading-[0.9] tracking-[-0.035em] tabular-nums">
                  {headlineAmount.toLocaleString()}
                </span>
                <span className="text-[13px] font-sans-medium text-dark/40 leading-none">{r.currency}</span>
              </div>
              {isApproved && rejected > 0 && (
                <span className="text-[11.5px] font-sans-semibold text-danger leading-none tabular-nums pt-0.5">
                  {t("reportDetail.rejected")} · {rejected.toLocaleString()} {r.currency}
                </span>
              )}
            </div>

            {(isEditable || canApprove) && (
              <div className="flex items-center gap-2">
                {isEditable && (
                  <>
                    <Button
                      variant="danger"
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
                  <Button
                    variant="primary"
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    onClick={() => actions.setFinishReviewConfirm(true)}
                    isLoading={actions.isFinishingReview}
                  >
                    {t("reportDetail.finishReview")}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex flex-col gap-6">

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
          <section className="flex flex-col gap-4 min-w-0">
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-2.5">
                <h2 className="text-[20px] font-sans-bold text-dark leading-none tracking-[-0.01em]">
                  {t("layout.allTickets")}
                </h2>
                {tk && tk.length > 0 && (
                  <span className="text-[14px] font-sans-medium text-dark/35 tabular-nums leading-none">
                    {tk.length}
                  </span>
                )}
              </div>

              {isEditable && (
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

            <div className="w-full rounded-[14px] border border-[var(--color-border-main)] bg-surface-card-soft overflow-hidden">
              <TicketsTable
                tickets={tk ?? []}
                isLoading={isLoadingTickets}
                onTicketClick={(ticket) => { setSelectedTicketId(ticket.id); setIsDetailModalOpen(true); }}
                showReviewBreakdown={r.status.toUpperCase() !== "CREATED"}
                emptyAction={
                  isEditable ? (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                      onClick={() => setIsUploadModalOpen(true)}
                    >
                      {t("reportDetail.scanFirstTicket")}
                    </Button>
                  ) : undefined
                }
              />
            </div>
          </section>

          <aside className="flex flex-col gap-4 min-w-0">
            <SectionCard title={t("reportDetail.financialSummary")} className={sideCardClass}>
              <FinancialSummary
                status={r.status}
                currency={r.currency ?? ""}
                requestedAmount={r.requested_amount ?? 0}
                approvedAmount={r.approved_amount ?? 0}
                ticketsTotal={ticketsTotal}
                reviewApprovedAmount={reviewApprovedTotal}
                reviewRejectedAmount={reviewRejectedTotal}
              />
            </SectionCard>

            {tk && tk.length > 0 && categoryData.length > 0 && (
              <>
                <SectionCard title={t("analytics.expensesByType")} className={sideCardClass}>
                  <Suspense fallback={<ChartSkeleton height={220} />}>
                    <DonutChart
                      data={categoryData}
                      height={220}
                      centerValue={ticketsTotal.toLocaleString()}
                      centerLabel={report?.currency ?? ""}
                      showLegend
                    />
                  </Suspense>
                </SectionCard>

                <SectionCard title={t("analytics.dailyExpensesTrend")} className={sideCardClass}>
                  <Suspense fallback={<ChartSkeleton height={180} />}>
                    <AreaTrendChart
                      data={trendData}
                      height={180}
                      currency={report?.currency ?? ""}
                    />
                  </Suspense>
                </SectionCard>
              </>
            )}

            <SectionCard title={t("reportDetail.timeline")} className={sideCardClass}>
              <ReportTimeline />
            </SectionCard>
          </aside>
        </div>
      </div>

      {/* ── Dialogs ── */}
      {actions.submitConfirm && (
        <ConfirmDialog icon={<Send />} title={t("reportDetail.submitReport")}
          description={t("reportDetail.confirmSubmit")}
          onCancel={() => actions.setSubmitConfirm(false)} onConfirm={actions.handleSubmit}
          confirmLabel={t("reportDetail.submitReport")} cancelLabel={t("common.cancel")}
          confirmVariant="primary" isLoading={actions.isSubmitting} />
      )}
      {actions.finishReviewConfirm && (
        <ConfirmDialog icon={<CheckCircle2 />} title={t("reportDetail.finishReview")}
          description={t("reportDetail.confirmFinishReview")}
          onCancel={() => actions.setFinishReviewConfirm(false)} onConfirm={actions.handleFinishReview}
          confirmLabel={t("reportDetail.finishReview")} cancelLabel={t("common.cancel")}
          confirmVariant="primary" isLoading={actions.isFinishingReview} />
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
        // Leave `selectedTicketId` set during close so `selectedTicket` stays
        // populated through the 300ms exit animation in `Drawer`. Clearing
        // both at the same time made the `if (!ticket) return null` in
        // `TicketDetailModal` short-circuit the render and skip the slide-out.
        onClose={() => setIsDetailModalOpen(false)}
        ticket={selectedTicket}
        reportId={id!}
        isEditable={isEditable}
        canApprove={canApprove}
      />
    </div>
  );
};

