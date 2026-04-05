import { Sparkles, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { transition } from "../../styles/theme";

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
          h-20 flex items-center border-b-4 border-[var(--color-shadow-main)] bg-[var(--color-sidebar-accent)] shrink-0 ${transition.base}
          ${isCollapsed ? "px-4 justify-center" : "px-5"}
        `}
      >
        <div className="flex items-center gap-3 shrink-0">
          {/* Logo icon — mismo tratamiento que cualquier card azul de la app */}
          <div className="w-10 h-10 bg-brand rounded-[8px] flex items-center justify-center border-2 border-[var(--color-border-main)] shadow-[4px_4px_0px_var(--color-shadow-main)] shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-space-bold text-base tracking-tight leading-none whitespace-nowrap text-white">
                {t("layout.appName")}
              </span>
              <span className="text-[10px] text-white/40 font-space-bold uppercase tracking-widest mt-0.5 whitespace-nowrap">
                {t("layout.appTagline")}
              </span>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            onClick={onCollapse}
            className={`hidden lg:flex items-center justify-center h-8 w-8 rounded-[6px] border-2 border-white/15 bg-white/5 shadow-[2px_2px_0px_rgba(0,0,0,0.3)] hover:bg-white/15 hover:border-white/25 ml-auto neo-press ${transition.base} shrink-0`}
            title={t("layout.collapseMenu")}
          >
            <PanelLeftClose className="w-4 h-4 text-white/50" />
          </button>
        )}

        <button
          onClick={onCloseMobile}
          className={`ml-auto lg:hidden flex items-center justify-center h-9 w-9 rounded-[6px] border-2 border-white/15 bg-white/5 text-white/50 shadow-[2px_2px_0px_rgba(0,0,0,0.3)] hover:bg-white/15 hover:text-white neo-press ${transition.base}`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ─── Expand button (collapsed desktop) ─── */}
      {isCollapsed && (
        <button
          onClick={onExpand}
          className={`hidden lg:flex items-center justify-center h-10 w-10 rounded-[8px] border-2 border-[var(--color-border-main)] shadow-[3px_3px_0px_var(--color-shadow-main)] bg-white/10 hover:bg-white/15 text-white mx-auto mt-4 ${transition.base} neo-press`}
          title={t("layout.expandMenu")}
        >
          <PanelLeftOpen className="w-5 h-5" />
        </button>
      )}
    </>
  );
};
