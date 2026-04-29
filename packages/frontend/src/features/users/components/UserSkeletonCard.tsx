import { memo } from "react";
import { USER_GRID } from "./UserRow";

export const UserSkeletonCard = memo(() => (
  <div className="border-b border-[var(--color-border-main)] last:border-b-0">
    <div
      className="w-full grid items-center gap-4 px-4 py-3.5 animate-pulse"
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
  </div>
));
