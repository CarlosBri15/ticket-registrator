export const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 pb-10">
      <div className="h-28 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white rounded-[2rem] border border-gray-100 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-10">
        <div className="col-span-2 h-72 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
        <div className="h-72 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
      </div>
    </div>
  );
};
