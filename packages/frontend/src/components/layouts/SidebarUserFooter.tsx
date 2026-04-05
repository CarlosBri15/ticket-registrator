import { NavLink } from "react-router-dom";
import { Settings, LogOut, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ICurrentUser } from "@ticket-registrator/shared";
import { transition } from "../../styles/theme";
import { RoleBadge } from "../ui/RoleBadge";

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
    <div className="p-4 bg-[var(--color-sidebar-accent)] border-t-4 border-[var(--color-shadow-main)] shrink-0 overflow-hidden">
      {/* User card — misma estética que las cards del app: card blanca con borde y sombra hard */}
      <div
        className={`
          rounded-[8px] mb-3
          ${isCollapsed
            ? "flex justify-center"
            : "bg-white border-2 border-[var(--color-border-main)] shadow-[3px_3px_0px_var(--color-shadow-main)] flex items-center gap-3 p-3"
          }
        `}
      >
        {/* Avatar — mismo estilo que el logo: brand + border + shadow */}
        <div
          className={`
            shrink-0 rounded-[8px] bg-brand text-white font-space-bold flex items-center justify-center
            border-2 border-[var(--color-border-main)] shadow-[3px_3px_0px_var(--color-shadow-main)]
            ${isCollapsed ? "w-10 h-10" : "w-9 h-9 text-sm"}
          `}
        >
          {userInitials}
        </div>
        {!isCollapsed && (
          <div className="flex flex-col min-w-0 gap-1.5">
            <span className="text-sm font-space-bold text-dark truncate">
              {user?.name || t("layout.defaultUser")}
            </span>
            <RoleBadge roleName={user?.roleName} size="sm" />
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className={`grid gap-2 ${isCollapsed ? "grid-cols-1" : "grid-cols-2"}`}>
        <NavLink
          to="/settings"
          title={t("settings.title")}
          className={`flex flex-col items-center justify-center p-2.5 rounded-[8px] border-2 border-white/10 bg-white/5 text-white/50 shadow-[2px_2px_0px_rgba(0,0,0,0.3)] hover:bg-white/15 hover:border-white/25 hover:text-white neo-press ${transition.base} group`}
        >
          <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-200" />
          {!isCollapsed && (
            <span className="text-[9px] font-space-bold text-inherit uppercase mt-1.5">{t("settings.title")}</span>
          )}
        </NavLink>
        <button
          onClick={onLogout}
          title={t("settings.logout")}
          className={`flex flex-col items-center justify-center p-2.5 rounded-[8px] border-2 border-red-400/20 bg-red-500/5 text-red-300/60 shadow-[2px_2px_0px_rgba(0,0,0,0.3)] hover:bg-red-500/15 hover:border-red-400/40 hover:text-red-200 neo-press ${transition.base} group`}
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-100" />
          {!isCollapsed && (
            <span className="text-[9px] font-space-bold uppercase mt-1.5">{t("settings.logout")}</span>
          )}
        </button>
      </div>
    </div>
  );
};
