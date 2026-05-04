import { Globe, Building2, X, Layers } from "lucide-react";
import { useTranslation } from "react-i18next";

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
      <div className="px-3 pt-3 pb-1">
        <div className="bg-white/5 rounded-md px-3 py-2 flex items-center gap-2">
          <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center shrink-0">
            <Globe className="w-3 h-3 text-white/55" />
          </div>
          <p className="text-[10px] font-sans-semibold text-white/55 uppercase tracking-widest">
            {t("layout.globalModeIndicator")}
          </p>
        </div>
      </div>
    );
  }

  if (isCompanyMode) {
    return (
      <div className="pt-3">
        {!isCollapsed && (
          <div className="px-3 pb-1" data-testid="sidebar-company-banner">
            <div className="bg-white/5 border border-white/10 rounded-md p-2.5 flex items-center gap-2">
              <div className="w-7 h-7 bg-white/10 rounded flex items-center justify-center shrink-0">
                <Building2 className="w-3.5 h-3.5 text-white/65" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-sans-semibold text-white/55 uppercase tracking-widest leading-none mb-0.5">
                  {t("layout.companyModeActive")}
                </p>
                <p className="text-[12px] font-sans-semibold text-white truncate leading-tight">{orgName}</p>
              </div>
              <button
                type="button"
                onClick={onExitCompanyMode}
                title={t("layout.exitCompanyMode")}
                className={`w-5 h-5 flex items-center justify-center rounded text-white/40 hover:bg-white/10 hover:text-white transition-all duration-100 shrink-0`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {isCollapsed && (
          <button
            type="button"
            onClick={onExitCompanyMode}
            title={t("layout.exitCompanyMode")}
            className={`flex items-center justify-center h-8 w-8 rounded-md bg-white/10 text-white/60 hover:bg-white/20 hover:text-white mx-auto mb-2 transition-all duration-100 btn-press`}
          >
            <Layers className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return null;
};
