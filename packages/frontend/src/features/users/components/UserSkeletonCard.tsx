import { memo } from "react";
import { PixelCard } from "../../../components/ui/PixelCard";
import { DARK } from "../constants";

export const UserSkeletonCard = memo(() => (
  <PixelCard className="w-full">
    <div className="flex items-center gap-4 px-4 py-3.5 animate-pulse">
      {/* Avatar Skeleton */}
      <div 
        className="w-12 h-12 rounded-xl border-2 shrink-0"
        style={{ 
          backgroundColor: `${DARK}05`, 
          borderColor: `${DARK}10`,
        }}
      />

      {/* Info Skeleton */}
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 bg-dark/10 rounded" />
        <div className="flex gap-2">
          <div className="h-3 w-1/4 bg-dark/5 rounded" />
          <div className="h-3 w-1/4 bg-dark/5 rounded" />
        </div>
      </div>

      {/* Right side Skeleton */}
      <div className="h-6 w-16 bg-dark/10 rounded-full" />
    </div>
  </PixelCard>
));
