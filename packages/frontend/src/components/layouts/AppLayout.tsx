import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu, Sparkles } from "lucide-react";
import {
  useUserQuery,
  useScope,
  useScopeContext,
  useOrganizationsQuery,
} from "@ticket-registrator/shared";
import { useTranslation } from "react-i18next";
import { tokenProvider } from "../../api/client";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarNav } from "./SidebarNav";
import { SidebarModeIndicator } from "./SidebarModeIndicator";
import { SidebarUserFooter } from "./SidebarUserFooter";

import { useQueryClient } from "@tanstack/react-query";

// ─── AppLayout ────────────────────────────────────────────────────────────────

export const AppLayout = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: user } = useUserQuery();
  const navigate = useNavigate();

  const { isGlobal } = useScope();
  const { activeCompanyId, setActiveCompanyId } = useScopeContext();
  const { data: orgs } = useOrganizationsQuery();

  const isCompanyMode = isGlobal && !!activeCompanyId;
  const isGlobalMode = isGlobal && !activeCompanyId;
  const activeOrgName = orgs?.find((o) => o.id === activeCompanyId)?.name ?? t("layout.defaultOrg");

  const closeMobile = () => setIsMobileOpen(false);

  const handleLogout = () => {
    tokenProvider.removeToken();
    queryClient.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-surface flex overflow-hidden font-sans text-dark">

      {/* ─── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-[var(--color-sidebar)] border-r border-[var(--color-border-main)] text-dark transition-all duration-300 ease-in-out

          ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "lg:w-[68px]" : "lg:w-64"}
        `}
      >
        <div className="flex flex-col h-full w-full relative">
          <SidebarHeader
            isCollapsed={isCollapsed}
            onCollapse={() => setIsCollapsed(true)}
            onExpand={() => setIsCollapsed(false)}
            onCloseMobile={closeMobile}
          />

          <SidebarModeIndicator
            isGlobalMode={isGlobalMode}
            isCompanyMode={isCompanyMode}
            isCollapsed={isCollapsed}
            orgName={activeOrgName}
            onExitCompanyMode={() => setActiveCompanyId(null)}
          />

          <SidebarNav
            isCollapsed={isCollapsed}
            isGlobalMode={isGlobalMode}
            onNavClick={closeMobile}
          />

          {/* Collapsed exit-company button lives inside SidebarModeIndicator */}

          <SidebarUserFooter
            user={user}
            isCollapsed={isCollapsed}
            onLogout={handleLogout}
          />
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label={t("layout.closeMenu")}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden border-none w-full h-full cursor-default"
          onClick={closeMobile}
        />
      )}

      {/* Main content */}
      <main
        className={`flex-1 flex flex-col relative min-w-0 h-screen overflow-hidden transition-all duration-100 ${isCollapsed ? "lg:ml-[68px]" : "lg:ml-64"}`}
      >
        {/* Mobile top bar */}
        <header className="lg:hidden h-16 bg-[var(--color-sidebar)] border-b border-[var(--color-border-main)] flex items-center justify-between px-5 z-40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 bg-brand rounded flex items-center justify-center`}>
              <Sparkles className="text-white w-4 h-4" />
            </div>
            <span className="font-sans-bold text-dark tracking-tight">{t("layout.appName")}</span>
          </div>
          <button
            onClick={() => setIsMobileOpen(true)}
            className={`p-2 text-slate-500 bg-slate-50 rounded hover:bg-slate-100 transition-all duration-100`}
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto bg-surface px-6 py-7 md:px-10 lg:py-9 scroll-smooth">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
