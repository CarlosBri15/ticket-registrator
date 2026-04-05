import { Globe, Building2, X, Layers } from "lucide-react";
import { useTranslation } from "react-i18next";
import { transition } from "../../styles/theme";

interface SidebarModeIndicatorProps {
  isGlobalMode: boolean;
  isCompanyMode: boolean;
  isCollapsed: boolean;
  orgName: string;
  onExitCompanyMode: () => void;
}

export const SidebarModeIndicator = ({
  isGlobalMode,
  isCompanyMode,
  isCollapsed,
  orgName,
  onExitCompanyMode,
}: SidebarModeIndicatorProps) => {
  const { t } = useTranslation();

  if (isGlobalMode && !isCollapsed) {
    return (
      <div className="px-3 pt-4 pb-1">
        {/* Banner global mode — card blanca con borde, igual que las cards del app */}
        <div className="bg-white rounded-[8px] border-2 border-[var(--color-border-main)] shadow-[3px_3px_0px_var(--color-shadow-main)] px-3 py-2.5 flex items-center gap-2.5">
          <div className="w-7 h-7 bg-brand/10 rounded-[4px] border-2 border-[var(--color-border-main)] flex items-center justify-center shrink-0">
            <Globe className="w-3.5 h-3.5 text-brand" />
          </div>
          <p className="text-[9px] font-space-bold text-brand uppercase tracking-widest">
            {t("layout.globalModeIndicator")}
          </p>
        </div>
      </div>
    );
  }

  if (isCompanyMode) {
    return (
      <div className="pt-4">
        {/* Expanded: card blanca con border + shadow hard */}
        {!isCollapsed && (
          <div className="px-3 pb-2" data-testid="sidebar-company-banner">
            <div className="bg-white rounded-[8px] border-2 border-[var(--color-border-main)] shadow-[3px_3px_0px_var(--color-shadow-main)] p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 bg-brand/10 rounded-[8px] border-2 border-[var(--color-border-main)] flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-space-bold text-dark/40 uppercase tracking-widest leading-none mb-0.5">
                  {t("layout.companyModeActive")}
                </p>
                <p className="text-xs font-space-bold text-dark truncate leading-tight">{orgName}</p>
              </div>
              <button
                type="button"
                onClick={onExitCompanyMode}
                title={t("layout.exitCompanyMode")}
                className={`w-6 h-6 flex items-center justify-center rounded-[4px] border-2 border-transparent text-dark/40 hover:bg-dark/5 hover:border-[var(--color-border-main)] hover:text-dark ${transition.base} shrink-0`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Collapsed: botón con borde y sombra hard */}
        {isCollapsed && (
          <button
            type="button"
            onClick={onExitCompanyMode}
            title={t("layout.exitCompanyMode")}
            className={`flex items-center justify-center h-10 w-10 rounded-[8px] border-2 border-[var(--color-border-main)] shadow-[3px_3px_0px_var(--color-shadow-main)] bg-white text-brand mx-auto mb-3 ${transition.base} neo-press`}
          >
            <Layers className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }

  return null;
};
