import { REPORT_GRID } from "../../../constants/gridLayouts";

/** Animated skeleton placeholder matching the kit `.list-row` shape. */
export const ReportSkeletonCard = () => (
  <div
    className="list-row gap-4 animate-pulse cursor-default pointer-events-none"
    style={{ gridTemplateColumns: REPORT_GRID }}
  >
    <div className="w-8 h-8 rounded-md bg-dark/5 border border-[var(--color-border-main)]" />
    <div className="space-y-2 min-w-0">
      <div className="h-3.5 w-1/2 bg-dark/8 rounded" />
      <div className="h-2.5 w-1/3 bg-dark/5 rounded" />
    </div>
    <div className="h-5 w-20 bg-dark/8 rounded-md justify-self-center" />
    <div className="h-3 w-24 bg-dark/8 rounded justify-self-center" />
    <div className="h-3.5 w-16 bg-dark/8 rounded justify-self-end" />
    <div />
  </div>
);
