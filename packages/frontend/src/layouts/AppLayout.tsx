import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Plane,
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface MenuItem {
  path: string;
  label: string;
  description: string;
  icon: React.ElementType;
  permission: PermissionType | null;
  /** Hide this item when SuperAdmin is in global mode (no active company). */
  hideWhenGlobal?: boolean;
  /** Hide this item when SuperAdmin is in company mode (active company set). */
  hideWhenCompanyMode?: boolean;
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
        path: "/trips",
        label: "Viajes",
        description: "Gestión de gastos",
        icon: Plane,
        permission: "view_reports",
        hideWhenGlobal: true,   // SuperAdmin global no necesita viajes propios
      },
      {
        path: "/tickets",
        label: "Tickets",
        description: "Histórico completo",
        icon: Receipt,
        permission: "view_tickets",
        hideWhenGlobal: true,   // ídem
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
        hideWhenGlobal: true,   // En global los usuarios se gestionan dentro de cada empresa
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
        hideWhenGlobal: true,   // Los roles son por empresa, no tienen sentido en vista global
      },
      {
        path: "/permissions",
        label: "Permisos",
        description: "Control de acceso",
        icon: Lock,
        permission: "view_permissions",
        hideWhenGlobal: true,   // Ídem
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
    <div className="bg-brand/15 border border-brand/30 rounded-2xl p-3 flex items-center gap-2.5">
      <div className="w-8 h-8 bg-brand/20 rounded-xl flex items-center justify-center shrink-0">
        <Building2 className="w-4 h-4 text-brand-light" />
      </div>
      {!isCollapsed && (
        <>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black text-brand-light/60 uppercase tracking-widest leading-none mb-0.5">
              Empresa activa
            </p>
            <p className="text-xs font-bold text-white truncate leading-tight">{orgName}</p>
          </div>
          <button
            type="button"
            onClick={onExit}
            title="Salir de modo empresa"
            className="w-6 h-6 flex items-center justify-center text-brand-light/60 hover:text-white hover:bg-white/10 rounded-lg transition-all shrink-0"
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

  // Scope info for menu adaptation
  const { isGlobal } = useScope();
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

  // Filter menu items:
  // - by permission
  // - by mode (global/company) for SuperAdmin
  const visibleSections = MENU_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (item.permission && !can(item.permission)) return false;
      if (item.hideWhenGlobal && isGlobalMode) return false;
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
          flex items-center rounded-2xl transition-all duration-200 group relative
          ${isCollapsed ? "justify-center p-3.5 mx-auto w-12" : "px-4 py-3.5 gap-4"}
          ${
            isActive
              ? "bg-brand text-white shadow-xl shadow-brand/20"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          }
        `}
      >
        <Icon
          className={`shrink-0 transition-transform group-hover:scale-110 ${
            isCollapsed ? "w-6 h-6" : "w-5 h-5"
          }`}
        />

        {!isCollapsed && (
          <div className="flex flex-col min-w-0 animate-in fade-in slide-in-from-left-2 overflow-hidden">
            <span className="font-semibold text-sm truncate">{item.label}</span>
            <span className="text-[10px] opacity-50 font-medium truncate">{item.description}</span>
          </div>
        )}

        {!isCollapsed && (
          <ChevronRight className="ml-auto w-4 h-4 transition-transform duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1" />
        )}

        {isCollapsed && (
          <div className="absolute left-full ml-4 px-3 py-2 bg-brand text-white text-[10px] font-bold uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none translate-x-2 group-hover:translate-x-0 transition-all z-[100] shadow-xl whitespace-nowrap">
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
          fixed inset-y-0 left-0 z-50 bg-dark text-white transition-all duration-300 ease-in-out shadow-2xl
          ${isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "lg:w-20" : "lg:w-72"}
        `}
      >
        <div className="flex flex-col h-full w-full relative">

          {/* Logo */}
          <div
            className={`
              h-24 flex items-center border-b border-white/5 shrink-0 transition-all duration-300
              ${isCollapsed ? "px-4 justify-center" : "px-6"}
            `}
          >
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-11 h-11 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20 border border-white/10 shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                  <span className="font-extrabold text-lg tracking-tight leading-none whitespace-nowrap">
                    TicketReg
                  </span>
                  <span className="text-[10px] text-brand-light font-bold uppercase tracking-widest mt-1 whitespace-nowrap">
                    Intelligence
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(true)}
                className="hidden lg:flex items-center justify-center h-8 w-8 bg-white/5 hover:bg-white/10 rounded-lg ml-auto transition-colors shrink-0"
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
              className="hidden lg:flex items-center justify-center h-12 w-12 bg-brand/10 hover:bg-brand/20 text-brand rounded-xl mx-auto mt-4 transition-all shadow-lg border border-brand/20"
              title="Expandir menú"
            >
              <PanelLeftOpen className="w-6 h-6" />
            </button>
          )}

          {/* SuperAdmin global mode indicator */}
          {isGlobalMode && !isCollapsed && (
            <div className="px-3 pt-4 pb-1">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl px-3 py-2 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest">
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
          <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
            {visibleSections.map((section) => (
              <div key={section.title}>
                {!isCollapsed && (
                  <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3 animate-in fade-in duration-300">
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
              className="flex items-center justify-center h-12 w-12 bg-brand/10 hover:bg-brand/20 text-brand rounded-xl mx-auto mb-3 transition-all border border-brand/20"
            >
              <Layers className="w-5 h-5" />
            </button>
          )}

          {/* User footer */}
          <div className="p-4 bg-white/[0.02] border-t border-white/5 shrink-0 overflow-hidden">
            <div
              className={`
                p-2 rounded-2xl transition-all duration-300 mb-4
                ${
                  isCollapsed
                    ? "bg-transparent flex justify-center"
                    : "bg-transparent border border-white/10 flex items-center gap-3 p-3 hover:bg-white/5"
                }
              `}
            >
              <div
                className={`
                  shrink-0 rounded-xl bg-brand text-white font-bold flex items-center justify-center shadow-lg shadow-brand/10 border border-white/10
                  ${isCollapsed ? "w-12 h-12" : "w-10 h-10"}
                `}
              >
                {userInitials}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0 animate-in fade-in slide-in-from-left-2 overflow-hidden">
                  <span className="text-sm font-bold text-gray-100 truncate">
                    {user?.name || "Usuario"}
                  </span>
                  <span className="text-[10px] text-brand-light truncate font-bold uppercase tracking-tighter opacity-70">
                    {user?.roleName || user?.email?.split("@")[0] || ""}
                  </span>
                </div>
              )}
            </div>

            <div className={`grid gap-2 ${isCollapsed ? "grid-cols-1" : "grid-cols-2"}`}>
              <NavLink
                to="/settings"
                title={t("settings.title")}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 text-gray-400 hover:bg-white/5 hover:text-white transition-all group"
              >
                <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                {!isCollapsed && (
                  <span className="text-[9px] font-bold uppercase mt-1">{t("settings.title")}</span>
                )}
              </NavLink>
              <button
                onClick={handleLogout}
                title={t("settings.logout")}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group"
              >
                <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                {!isCollapsed && (
                  <span className="text-[9px] font-bold uppercase mt-1">{t("settings.logout")}</span>
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
        className={`flex-1 flex flex-col relative min-w-0 h-screen overflow-hidden transition-all duration-300 ${
          isCollapsed ? "lg:ml-20" : "lg:ml-72"
        }`}
      >
        <header className="lg:hidden h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="font-extrabold text-dark tracking-tight">TicketReg</span>
          </div>
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2.5 text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="hidden lg:flex absolute top-6 right-10 z-50">
          <LanguageSelector />
        </div>

        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[120px] -z-10 pointer-events-none translate-x-1/2 -translate-y-1/2" />

        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-10 lg:py-12 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
