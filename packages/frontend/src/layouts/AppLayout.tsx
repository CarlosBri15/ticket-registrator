import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  LogOut,
  Menu,
  X,
  Settings,
  Sparkles,
  ChevronRight,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  Building2,
  Shield,
  Globe,
  Lock,
  Layers,
} from "lucide-react";
import {
  useUserQuery,
  usePermissions,
  useScope,
  useScopeContext,
  useOrganizationsQuery,
} from "@ticket-registrator/shared";
import type { PermissionType } from "@ticket-registrator/shared";
import { tokenProvider } from "../api/client";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "../components/ui/LanguageSelector";
import { radius, transition } from "../styles/design-tokens";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MenuItem {
  path: string;
  label: string;
  description: string;
  icon: React.ElementType;
  permission: PermissionType | null;
  hideWhenGlobal?: boolean;
  hideWhenCompanyMode?: boolean;
  hideWhenSelf?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

// ─── Menu definition ──────────────────────────────────────────────────────────

const MENU_SECTIONS: MenuSection[] = [
  {
    title: "Principal",
    items: [
      {
        path: "/home",
        label: "Dashboard",
        description: "Resumen general",
        icon: LayoutDashboard,
        permission: null,
      },
      {
        path: "/reports",
        label: "Reportes",
        description: "Gestión de gastos",
        icon: FileText,
        permission: "view_reports",
        hideWhenGlobal: true,
      },
      {
        path: "/tickets",
        label: "Tickets",
        description: "Histórico completo",
        icon: Receipt,
        permission: "view_tickets",
        hideWhenGlobal: true,
      },
    ],
  },
  {
    title: "Gestión",
    items: [
      {
        path: "/users",
        label: "Usuarios",
        description: "Gestión de equipo",
        icon: Users,
        permission: "view_users",
        hideWhenGlobal: true,
        hideWhenSelf: true,
      },
      {
        path: "/departments",
        label: "Departamentos",
        description: "Áreas de la empresa",
        icon: Building2,
        permission: "view_departments",
        hideWhenGlobal: true,
      },
      {
        path: "/organizations",
        label: "Organizaciones",
        description: "Gestión global",
        icon: Globe,
        permission: "view_company",
      },
    ],
  },
  {
    title: "Administración",
    items: [
      {
        path: "/roles",
        label: "Roles",
        description: "Gestión de roles",
        icon: Shield,
        permission: "view_roles",
        hideWhenGlobal: true,
      },
      {
        path: "/permissions",
        label: "Permisos",
        description: "Control de acceso",
        icon: Lock,
        permission: "view_permissions",
        hideWhenGlobal: true,
      },
    ],
  },
];

// ─── Company Mode Banner (sidebar) ────────────────────────────────────────────

const SidebarCompanyBanner = ({
  orgName,
  isCollapsed,
  onExit,
}: {
  orgName: string;
  isCollapsed: boolean;
  onExit: () => void;
}) => (
  <div className="px-3 pb-2" data-testid="sidebar-company-banner">
    <div className={`bg-brand/15 border border-brand/30 ${radius.card} p-3 flex items-center gap-2.5`}>
      <div className={`w-8 h-8 bg-brand/20 ${radius.base} flex items-center justify-center shrink-0`}>
        <Building2 className="w-4 h-4 text-brand-light" />
      </div>
      {!isCollapsed && (
        <>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-semibold text-brand-light/60 uppercase tracking-widest leading-none mb-0.5">
              Empresa activa
            </p>
            <p className="text-xs font-semibold text-white truncate leading-tight">{orgName}</p>
          </div>
          <button
            type="button"
            onClick={onExit}
            title="Salir de modo empresa"
            className={`w-6 h-6 flex items-center justify-center text-brand-light/60 hover:text-white hover:bg-white/10 ${radius.base} ${transition.base} shrink-0`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  </div>
);

// ─── AppLayout ────────────────────────────────────────────────────────────────

export const AppLayout = () => {
  const { t } = useTranslation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: user } = useUserQuery();
  const { can } = usePermissions();
  const navigate = useNavigate();

  const { isGlobal, isSelf } = useScope();
  const { activeCompanyId, setActiveCompanyId } = useScopeContext();
  const { data: orgs } = useOrganizationsQuery();

  const isCompanyMode = isGlobal && !!activeCompanyId;
  const isGlobalMode = isGlobal && !activeCompanyId;
  const activeOrgName = orgs?.find((o) => o.id === activeCompanyId)?.name ?? "Empresa";

  const closeMobile = () => setIsMobileOpen(false);

  const handleLogout = () => {
    tokenProvider.removeToken();
    navigate("/login");
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : <User className="w-5 h-5" />;

  const visibleSections = MENU_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (item.permission && !can(item.permission)) return false;
      if (item.hideWhenGlobal && isGlobalMode) return false;
      if (item.hideWhenSelf && isSelf) return false;
      return true;
    }),
  })).filter((section) => section.items.length > 0);

  const renderNavItem = (item: MenuItem) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={closeMobile}
        title={isCollapsed ? item.label : ""}
        className={({ isActive }) => `
          flex items-center ${radius.base} ${transition.base} group relative
          ${isCollapsed ? "justify-center p-3 mx-auto w-11" : "px-3.5 py-3 gap-3.5"}
          ${
            isActive
              ? "bg-brand text-white shadow-md"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          }
        `}
      >
        <Icon
          className={`shrink-0 transition-transform group-hover:scale-110 ${
            isCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]"
          }`}
        />

        {!isCollapsed && (
          <div className="flex flex-col min-w-0 overflow-hidden">
            <span className="font-semibold text-sm truncate">{item.label}</span>
            <span className="text-[10px] opacity-50 font-medium truncate">{item.description}</span>
          </div>
        )}

        {!isCollapsed && (
          <ChevronRight className="ml-auto w-4 h-4 transition-transform duration-200 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5" />
        )}

        {isCollapsed && (
          <div className={`absolute left-full ml-3 px-2.5 py-1.5 bg-brand text-white text-[10px] font-semibold uppercase tracking-wider ${radius.base} opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0 ${transition.base} z-[100] shadow-lg whitespace-nowrap`}>
            {item.label}
          </div>
        )}
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen bg-surface flex overflow-hidden font-sans text-dark">

      {/* ─── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-dark text-white transition-all duration-300 ease-in-out shadow-xl
          ${isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "lg:w-20" : "lg:w-72"}
        `}
      >
        <div className="flex flex-col h-full w-full relative">

          {/* Logo */}
          <div
            className={`
              h-20 flex items-center border-b border-white/5 shrink-0 ${transition.base}
              ${isCollapsed ? "px-4 justify-center" : "px-5"}
            `}
          >
            <div className="flex items-center gap-3 shrink-0">
              <div className={`w-10 h-10 bg-brand ${radius.base} flex items-center justify-center shadow-md border border-white/10 shrink-0`}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-bold text-base tracking-tight leading-none whitespace-nowrap">
                    TicketReg
                  </span>
                  <span className="text-[10px] text-brand-light font-semibold uppercase tracking-widest mt-0.5 whitespace-nowrap">
                    Intelligence
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(true)}
                className={`hidden lg:flex items-center justify-center h-8 w-8 bg-white/5 hover:bg-white/10 ${radius.base} ml-auto ${transition.base} shrink-0`}
                title="Colapsar menú"
              >
                <PanelLeftClose className="w-4 h-4 text-gray-400" />
              </button>
            )}

            <button onClick={closeMobile} className="ml-auto lg:hidden p-2 text-gray-400">
              <X className="w-6 h-6" />
            </button>
          </div>

          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className={`hidden lg:flex items-center justify-center h-10 w-10 bg-brand/10 hover:bg-brand/20 text-brand ${radius.base} mx-auto mt-4 ${transition.base} border border-brand/20`}
              title="Expandir menú"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>
          )}

          {/* SuperAdmin global mode indicator */}
          {isGlobalMode && !isCollapsed && (
            <div className="px-3 pt-4 pb-1">
              <div className={`bg-purple-500/10 border border-purple-500/20 ${radius.card} px-3 py-2 flex items-center gap-2`}>
                <Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <p className="text-[9px] font-semibold text-purple-400 uppercase tracking-widest">
                  Vista Global · SuperAdmin
                </p>
              </div>
            </div>
          )}

          {/* Company mode banner */}
          {isCompanyMode && (
            <div className="pt-4">
              <SidebarCompanyBanner
                orgName={activeOrgName}
                isCollapsed={isCollapsed}
                onExit={() => setActiveCompanyId(null)}
              />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5 space-y-5 overflow-y-auto overflow-x-hidden custom-scrollbar">
            {visibleSections.map((section) => (
              <div key={section.title}>
                {!isCollapsed && (
                  <p className="px-3.5 text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2.5">
                    {section.title}
                  </p>
                )}
                <div className="space-y-1">{section.items.map(renderNavItem)}</div>
              </div>
            ))}
          </nav>

          {/* SuperAdmin: quick "Salir del modo empresa" link when collapsed */}
          {isCompanyMode && isCollapsed && (
            <button
              type="button"
              onClick={() => setActiveCompanyId(null)}
              title="Salir del modo empresa"
              className={`flex items-center justify-center h-10 w-10 bg-brand/10 hover:bg-brand/20 text-brand ${radius.base} mx-auto mb-3 ${transition.base} border border-brand/20`}
            >
              <Layers className="w-5 h-5" />
            </button>
          )}

          {/* User footer */}
          <div className="p-4 bg-white/[0.02] border-t border-white/5 shrink-0 overflow-hidden">
            <div
              className={`
                p-2 ${radius.base} ${transition.base} mb-3
                ${
                  isCollapsed
                    ? "bg-transparent flex justify-center"
                    : "bg-transparent border border-white/10 flex items-center gap-3 p-3 hover:bg-white/5"
                }
              `}
            >
              <div
                className={`
                  shrink-0 ${radius.base} bg-brand text-white font-semibold flex items-center justify-center shadow-md border border-white/10
                  ${isCollapsed ? "w-10 h-10" : "w-9 h-9 text-sm"}
                `}
              >
                {userInitials}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0 overflow-hidden">
                  <span className="text-sm font-semibold text-gray-100 truncate">
                    {user?.name || "Usuario"}
                  </span>
                  <span className="text-[10px] text-brand-light truncate font-medium uppercase tracking-wider opacity-70">
                    {user?.roleName || user?.email?.split("@")[0] || ""}
                  </span>
                </div>
              )}
            </div>

            <div className={`grid gap-2 ${isCollapsed ? "grid-cols-1" : "grid-cols-2"}`}>
              <NavLink
                to="/settings"
                title={t("settings.title")}
                className={`flex flex-col items-center justify-center p-2.5 ${radius.base} border border-white/5 text-gray-400 hover:bg-white/5 hover:text-white ${transition.base} group`}
              >
                <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                {!isCollapsed && (
                  <span className="text-[9px] font-semibold uppercase mt-1">{t("settings.title")}</span>
                )}
              </NavLink>
              <button
                onClick={handleLogout}
                title={t("settings.logout")}
                className={`flex flex-col items-center justify-center p-2.5 ${radius.base} border border-white/5 text-red-400 hover:bg-red-500/10 hover:text-red-300 ${transition.base} group`}
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                {!isCollapsed && (
                  <span className="text-[9px] font-semibold uppercase mt-1">{t("settings.logout")}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 bg-black/50 z-40 lg:hidden border-none w-full h-full cursor-default"
          onClick={closeMobile}
        />
      )}

      {/* Main content */}
      <main
        className={`flex-1 flex flex-col relative min-w-0 h-screen overflow-hidden ${transition.base} ${
          isCollapsed ? "lg:ml-20" : "lg:ml-72"
        }`}
      >
        <header className={`lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-5 z-40 shrink-0`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 bg-brand ${radius.base} flex items-center justify-center shadow-sm`}>
              <Sparkles className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-dark tracking-tight">TicketReg</span>
          </div>
          <button
            onClick={() => setIsMobileOpen(true)}
            className={`p-2 text-slate-500 bg-slate-50 ${radius.base} hover:bg-slate-100 ${transition.base}`}
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <div className="hidden lg:flex absolute top-6 right-10 z-50">
          <LanguageSelector />
        </div>

        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/3 rounded-full blur-[120px] -z-10 pointer-events-none translate-x-1/2 -translate-y-1/2" />

        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:py-10 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
