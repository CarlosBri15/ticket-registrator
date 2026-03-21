import { Building2, ArrowUpRight, Globe } from "lucide-react";
import { radius } from "../../../styles/design-tokens";

export const CompanyModeBanner = ({
  orgName,
  onExit,
  onDetail,
}: {
  orgName: string;
  onExit: () => void;
  onDetail: () => void;
}) => (
  <div
    className={`bg-brand ${radius.card} p-4 flex items-center justify-between gap-4 shadow-sm`}
    data-testid="company-mode-banner"
  >
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 bg-white/10 ${radius.base} flex items-center justify-center shrink-0`}>
        <Building2 className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-widest text-white/60">Modo empresa</p>
        <p className="font-semibold text-white text-sm">{orgName}</p>
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <button
        type="button"
        onClick={onDetail}
        className={`text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 ${radius.base} transition-all flex items-center gap-1.5`}
      >
        <ArrowUpRight className="w-3.5 h-3.5" />
        Detalle
      </button>
      <button
        type="button"
        onClick={onExit}
        className={`text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 ${radius.base} transition-all flex items-center gap-1.5`}
        data-testid="company-mode-exit"
      >
        <Globe className="w-3.5 h-3.5" />
        Vista global
      </button>
    </div>
  </div>
);
