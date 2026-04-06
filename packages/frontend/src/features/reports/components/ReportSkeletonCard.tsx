/** Animated skeleton placeholder matching a table row. */
export const ReportSkeletonCard = () => (
  <div className="flex items-center gap-4 px-4 py-3.5 border-b border-[var(--color-border-main)] last:border-0 animate-pulse">
    <div className="flex-[2] h-3 bg-dark/6 rounded" />
    <div className="w-20 h-3 bg-dark/6 rounded" />
    <div className="w-32 h-3 bg-dark/6 rounded" />
    <div className="w-14 h-3 bg-dark/6 rounded" />
    <div className="w-24 h-3 bg-dark/6 rounded" />
    <div className="w-3.5 h-3 bg-dark/6 rounded ml-auto" />
  </div>
);
