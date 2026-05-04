import { Sparkles, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onCollapse: () => void;
  onExpand: () => void;
  onCloseMobile: () => void;
}

export const SidebarHeader = ({
  isCollapsed,
  onCollapse,
  onExpand,
  onCloseMobile,
}: SidebarHeaderProps) => {
  const { t } = useTranslation();

  return (
    <>
      {/* ─── Logo bar ─── */}
      <div
        className={`
          h-[68px] flex items-center border-b border-[var(--color-sidebar-border)] shrink-0 transition-all duration-100
          ${isCollapsed ? "px-3 justify-center" : "px-4"}
        `}
      >
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-brand" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-sans-semibold text-[14px] tracking-tight leading-none whitespace-nowrap text-white">
                {t("layout.appName")}
              </span>
              <span className="text-[10px] text-white/45 font-sans-normal uppercase tracking-widest mt-0.5 whitespace-nowrap">
                {t("layout.appTagline")}
              </span>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            onClick={onCollapse}
            className={`hidden lg:flex items-center justify-center h-7 w-7 rounded-md bg-white/5 text-white/45 hover:bg-white/10 hover:text-white ml-auto btn-press transition-all duration-100 shrink-0`}
            title={t("layout.collapseMenu")}
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={onCloseMobile}
          className={`ml-auto lg:hidden flex items-center justify-center h-7 w-7 rounded-md bg-white/5 text-white/45 hover:bg-white/10 hover:text-white btn-press transition-all duration-100`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ─── Expand button (collapsed desktop) ─── */}
      {isCollapsed && (
        <button
          onClick={onExpand}
          className={`hidden lg:flex items-center justify-center h-8 w-8 rounded-md bg-white/5 text-white/45 hover:bg-white/10 hover:text-white mx-auto mt-3 transition-all duration-100 btn-press`}
          title={t("layout.expandMenu")}
        >
          <PanelLeftOpen className="w-3.5 h-3.5" />
        </button>
      )}
    </>
  );
};
