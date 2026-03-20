import { Building2, ArrowUpRight, Globe } from "lucide-react";

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
    className="bg-brand rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xl shadow-brand/20"
    data-testid="company-mode-banner"
  >
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
        <Building2 className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-white/60">Modo empresa</p>
        <p className="font-black text-white">{orgName}</p>
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <button
        type="button"
        onClick={onDetail}
        className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
      >
        <ArrowUpRight className="w-3.5 h-3.5" />
        Detalle
      </button>
      <button
        type="button"
        onClick={onExit}
        className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
        data-testid="company-mode-exit"
      >
        <Globe className="w-3.5 h-3.5" />
        Vista global
      </button>
    </div>
  </div>
);
