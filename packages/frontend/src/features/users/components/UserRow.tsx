import { memo } from "react";
import { User, ChevronRight } from "lucide-react";
import { type IUser } from "@ticket-registrator/shared";
import { USER_GRID } from "../../../constants/gridLayouts";

interface UserRowProps {
  user: IUser;
  roleName?: string;
  onClick: () => void;
  rightAction?: React.ReactNode;
}

/**
 * Row for the users list — wraps the kit `.list-row` primitive. Hover-only
 * actions overlay on the right edge to keep the grid layout stable.
 */
export const UserRow = memo(({ user, roleName, onClick, rightAction }: UserRowProps) => (
  <div className="relative">
    <button
      type="button"
      onClick={onClick}
      className="list-row group w-full text-left gap-4"
      style={{ gridTemplateColumns: USER_GRID }}
    >
      <div className="w-8 h-8 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-dark/40 group-hover:bg-white">
        <User className="w-3.5 h-3.5" aria-hidden={true} />
      </div>

      <div className="min-w-0">
        <p className="row-name truncate">
          {user.name} {user.surname}
        </p>
        <p className="row-meta truncate mt-0.5">@{user.username}</p>
      </div>

      <p className="row-meta truncate">{user.email}</p>

      <div className="flex items-center justify-end">
        {roleName ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--color-secondary)] text-dark/70 text-[11px] font-sans-semibold whitespace-nowrap group-hover:bg-white">
            {roleName}
          </span>
        ) : (
          <span className="text-dark/30 text-[11px] font-sans-medium">—</span>
        )}
      </div>

      <div aria-hidden={true} />
    </button>

    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
      <div className="pointer-events-auto">
        {rightAction ?? (
          <ChevronRight
            className="row-chev w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
            aria-hidden={true}
          />
        )}
      </div>
    </div>
  </div>
));
