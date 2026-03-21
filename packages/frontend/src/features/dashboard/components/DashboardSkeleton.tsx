import { radius } from "../../../styles/design-tokens";

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-7 pb-10 animate-pulse">
      <div className={`h-24 bg-white ${radius.card} border border-slate-200`} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-28 bg-white ${radius.card} border border-slate-200`} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-8">
        <div className={`col-span-2 h-64 bg-white ${radius.card} border border-slate-200`} />
        <div className={`h-64 bg-white ${radius.card} border border-slate-200`} />
      </div>
    </div>
  );
};
