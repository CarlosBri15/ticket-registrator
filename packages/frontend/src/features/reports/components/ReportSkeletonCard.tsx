/** Animated skeleton placeholder for report list items. */
export const ReportSkeletonCard = () => (
  <div className="bg-white border-2 border-border-main/20 rounded-lg p-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 bg-dark/10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 bg-dark/10 rounded" />
        <div className="h-3 w-1/2 bg-dark/10 rounded" />
      </div>
      <div className="space-y-1.5 shrink-0">
        <div className="h-5 w-16 bg-dark/10 rounded" />
        <div className="h-4 w-14 bg-dark/10 rounded ml-auto" />
      </div>
    </div>
  </div>
);
