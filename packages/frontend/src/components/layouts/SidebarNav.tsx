import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, FileText, Receipt,
  Users, Building2, Globe, Shield, Lock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { usePermissions, useScope } from "@ticket-registrator/shared";
import type { PermissionType } from "@ticket-registrator/shared";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MenuItem {
  path: string;
  label: string;
  icon: React.ElementType;
  permission: PermissionType | null;
  hideWhenGlobal?: boolean;
  hideWhenSelf?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

// ─── Menu definition ──────────────────────────────────────────────────────────

const getMenuSections = (t: TFunction): MenuSection[] => [
  {
    title: t("layout.sectionPrincipal"),
    items: [
      { path: "/home",    label: t("layout.dashboard"),   icon: LayoutDashboard, permission: null },
      { path: "/reports", label: t("layout.reports"),     icon: FileText,        permission: "view_reports", hideWhenGlobal: true },
      { path: "/tickets", label: t("layout.allTickets"),  icon: Receipt,         permission: "view_tickets", hideWhenGlobal: true },
    ],
  },
  {
    title: t("layout.management"),
    items: [
      { path: "/users",         label: t("layout.users"),         icon: Users,     permission: "view_users",       hideWhenGlobal: true, hideWhenSelf: true },
      { path: "/departments",   label: t("layout.departments"),   icon: Building2, permission: "view_departments", hideWhenGlobal: true },
      { path: "/organizations", label: t("layout.organizations"), icon: Globe,     permission: "view_company" },
    ],
  },
  {
    title: t("layout.sectionAdmin"),
    items: [
      { path: "/roles",       label: t("layout.roles"),       icon: Shield, permission: "view_roles",       hideWhenGlobal: true },
      { path: "/permissions", label: t("layout.permissions"), icon: Lock,   permission: "view_permissions", hideWhenGlobal: true },
    ],
  },
];

// ─── NavItem ──────────────────────────────────────────────────────────────────

interface NavItemProps {
  item: MenuItem;
  isCollapsed: boolean;
  onClick: () => void;
}

const NavItem = ({ item, isCollapsed, onClick }: NavItemProps) => {
  const Icon = item.icon;

  // Tooltip is only useful when the label is hidden (collapsed sidebar).
  const showTooltip = isCollapsed;

  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      title={showTooltip ? item.label : ""}
      className="block group relative"
    >
      {({ isActive }) => (
        <div
          className={[
            "sb-item",
            isActive ? "active" : "",
            isCollapsed ? "justify-center !px-2" : "",
          ].filter(Boolean).join(" ")}
        >
          <Icon className="sb-icon" />

          {!isCollapsed && (
            <span className="truncate min-w-0">{item.label}</span>
          )}

          {showTooltip && (
            <div className="absolute left-full ml-2.5 px-2.5 py-1.5 rounded-md bg-dark text-white text-[11px] font-sans-medium shadow-[0px_4px_14px_rgba(0,0,0,0.18)] opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0 transition-all duration-100 z-[100] whitespace-nowrap">
              {item.label}
            </div>
          )}
        </div>
      )}
    </NavLink>
  );
};

// ─── SidebarNav ───────────────────────────────────────────────────────────────

interface SidebarNavProps {
  isCollapsed: boolean;
  isGlobalMode: boolean;
  onNavClick: () => void;
}

export const SidebarNav = ({ isCollapsed, isGlobalMode, onNavClick }: SidebarNavProps) => {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const { isSelf } = useScope();

  const visibleSections = getMenuSections(t)
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.permission && !can(item.permission)) return false;
        if (item.hideWhenGlobal && isGlobalMode) return false;
        if (item.hideWhenSelf && isSelf) return false;
        return true;
      }),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <nav className="sb-nav flex-1 px-2.5 py-3 overflow-y-auto overflow-x-hidden custom-scrollbar">
      {visibleSections.map((section) => (
        <div key={section.title} className="flex flex-col gap-0.5">
          {!isCollapsed && (
            <div className="sb-section">{section.title}</div>
          )}
          {section.items.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isCollapsed={isCollapsed}
              onClick={onNavClick}
            />
          ))}
        </div>
      ))}
    </nav>
  );
};
