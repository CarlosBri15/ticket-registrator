import { memo } from "react";
import { User, ChevronRight } from "lucide-react";
import { type IUser } from "@ticket-registrator/shared";

interface UserRowProps {
  user: IUser;
  roleName?: string;
  onClick: () => void;
  rightAction?: React.ReactNode;
}

export const USER_GRID = "32px 1fr 1.2fr 140px 16px";

export const UserRow = memo(({ user, roleName, onClick, rightAction }: UserRowProps) => (
  <div className="group relative border-b border-[var(--color-border-main)] last:border-b-0 hover:bg-[var(--color-secondary)] transition-colors duration-100">
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left grid items-center gap-4 px-4 py-3.5 cursor-pointer"
      style={{ gridTemplateColumns: USER_GRID }}
    >
      <div className="w-8 h-8 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-dark/40 group-hover:bg-white">
        <User className="w-3.5 h-3.5" aria-hidden={true} />
      </div>

      <div className="min-w-0">
        <p className="font-sans-semibold text-dark text-[14px] truncate leading-snug">
          {user.name} {user.surname}
        </p>
        <p className="font-sans-medium text-dark/50 text-[12px] mt-0.5 truncate leading-none">
          @{user.username}
        </p>
      </div>

      <p className="font-sans-medium text-[12px] text-dark/60 truncate">{user.email}</p>

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
          <ChevronRight className="w-4 h-4 text-dark/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100" />
        )}
      </div>
    </div>
  </div>
));
