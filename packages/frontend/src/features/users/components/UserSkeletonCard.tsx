import { memo } from "react";
import { USER_GRID } from "../../../constants/gridLayouts";

/** Animated skeleton placeholder matching the kit `.list-row` shape. */
export const UserSkeletonCard = memo(() => (
  <div
    className="list-row gap-4 animate-pulse cursor-default pointer-events-none"
    style={{ gridTemplateColumns: USER_GRID }}
  >
    <div className="w-8 h-8 rounded-md bg-dark/5 border border-[var(--color-border-main)]" />
    <div className="space-y-2 min-w-0">
      <div className="h-3.5 w-1/2 bg-dark/8 rounded" />
      <div className="h-2.5 w-1/3 bg-dark/5 rounded" />
    </div>
    <div className="h-3 w-2/3 bg-dark/8 rounded" />
    <div className="h-5 w-20 bg-dark/8 rounded-md justify-self-end" />
    <div />
  </div>
));
