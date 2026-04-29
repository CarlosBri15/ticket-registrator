import { NavLink } from "react-router-dom";
import { Settings, LogOut, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ICurrentUser } from "@ticket-registrator/shared";

interface SidebarUserFooterProps {
  user: ICurrentUser | undefined;
  isCollapsed: boolean;
  onLogout: () => void;
}

export const SidebarUserFooter = ({ user, isCollapsed, onLogout }: SidebarUserFooterProps) => {
  const { t } = useTranslation();

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : <User className="w-5 h-5" />;

  return (
    <div className="p-3 border-t border-[var(--color-border-main)] shrink-0 overflow-hidden">
      {/* User card */}
      <div
        className={`
          rounded-md mb-2
          ${isCollapsed
            ? "flex justify-center py-1"
            : "bg-[var(--color-surface)] border border-[var(--color-border-main)] flex items-center gap-2.5 p-2.5"
          }
        `}
      >
        <div
          className={`
            shrink-0 rounded-md bg-brand text-white font-sans-semibold flex items-center justify-center text-[12px]
            ${isCollapsed ? "w-9 h-9" : "w-8 h-8"}
          `}
        >
          {userInitials}
        </div>
        {!isCollapsed && (
          <div className="flex flex-col min-w-0 gap-1">
            <span className="text-[13px] font-sans-semibold text-dark truncate leading-none">
              {user?.name || t("layout.defaultUser")}
            </span>
            {user?.roleName && (
              <span className="inline-flex w-fit items-center px-1.5 py-0.5 rounded bg-[var(--color-secondary)] text-dark/60 text-[10px] font-sans-semibold">
                {user.roleName}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className={`grid gap-1.5 ${isCollapsed ? "grid-cols-1" : "grid-cols-2"}`}>
        <NavLink
          to="/settings"
          title={t("settings.title")}
          className="flex items-center justify-center gap-1.5 p-2 rounded-md text-dark/40 hover:text-dark hover:bg-[var(--color-surface)] transition-colors group"
        >
          <Settings className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-200 shrink-0" />
          {!isCollapsed && (
            <span className="text-[11px] font-sans-medium">{t("settings.title")}</span>
          )}
        </NavLink>
        <button
          onClick={onLogout}
          title={t("settings.logout")}
          className="flex items-center justify-center gap-1.5 p-2 rounded-md text-danger/50 hover:text-danger hover:bg-red-50 transition-colors group"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          {!isCollapsed && (
            <span className="text-[11px] font-sans-medium">{t("settings.logout")}</span>
          )}
        </button>
      </div>
    </div>
  );
};
