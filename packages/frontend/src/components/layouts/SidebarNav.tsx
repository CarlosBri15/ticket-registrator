import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, FileText, Receipt,
  Users, Building2, Globe, Shield, Lock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { usePermissions, useScope } from "@ticket-registrator/shared";
import type { PermissionType } from "@ticket-registrator/shared";
import { transition, tokens } from "../../styles/theme";

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
      {
        path: "/home",
        label: t("layout.dashboard"),
        icon: LayoutDashboard,
        permission: null,
      },
      {
        path: "/reports",
        label: t("layout.reports"),
        icon: FileText,
        permission: "view_reports",
        hideWhenGlobal: true,
      },
      {
        path: "/tickets",
        label: t("layout.allTickets"),
        icon: Receipt,
        permission: "view_tickets",
        hideWhenGlobal: true,
      },
    ],
  },
  {
    title: t("layout.management"),
    items: [
      {
        path: "/users",
        label: t("layout.users"),
        icon: Users,
        permission: "view_users",
        hideWhenGlobal: true,
        hideWhenSelf: true,
      },
      {
        path: "/departments",
        label: t("layout.departments"),
        icon: Building2,
        permission: "view_departments",
        hideWhenGlobal: true,
      },
      {
        path: "/organizations",
        label: t("layout.organizations"),
        icon: Globe,
        permission: "view_company",
      },
    ],
  },
  {
    title: t("layout.sectionAdmin"),
    items: [
      {
        path: "/roles",
        label: t("layout.roles"),
        icon: Shield,
        permission: "view_roles",
        hideWhenGlobal: true,
      },
      {
        path: "/permissions",
        label: t("layout.permissions"),
        icon: Lock,
        permission: "view_permissions",
        hideWhenGlobal: true,
      },
    ],
  },
];

// ─── NavItem ──────────────────────────────────────────────────────────────────

const NavItem = ({
  item,
  isCollapsed,
  onClick,
}: {
  item: MenuItem;
  isCollapsed: boolean;
  onClick: () => void;
}) => {
  const Icon = item.icon;
  return (
    <NavLink
      key={item.path}
      to={item.path}
      onClick={onClick}
      title={isCollapsed ? item.label : ""}
      className="block"
    >
      {({ isActive }) => (
        <div
          className={`
            ${tokens.sidebarNavItem}
            ${isCollapsed ? "justify-center p-2 mx-auto w-10" : "px-3 py-2 gap-3"}
            ${isActive ? tokens.sidebarNavActive : tokens.sidebarNavIdle}
          `}
        >
          <Icon
            className={`shrink-0 ${isCollapsed ? "w-[18px] h-[18px]" : "w-[16px] h-[16px]"} ${isActive ? "text-dark" : "text-dark/40"}`}
          />

          {!isCollapsed && (
            <span className="truncate min-w-0 text-[13px]">
              {item.label}
            </span>
          )}

          {/* Tooltip collapsed */}
          {isCollapsed && (
            <div className={`absolute left-full ml-2.5 px-2.5 py-1.5 rounded-md bg-dark text-white text-[11px] font-sans-medium shadow-[0px_4px_14px_rgba(0,0,0,0.18)] opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0 ${transition.base} z-[100] whitespace-nowrap`}>
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
    <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
      {visibleSections.map((section) => (
        <div key={section.title} className="space-y-0.5">
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
