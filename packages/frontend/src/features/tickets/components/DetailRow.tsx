/**
 * DetailRow + RowDivider — Building blocks for the ticket detail view.
 * Each DetailRow shows a single field with an icon (image or Lucide) + label + value.
 */

const DARK = "#1A1A1A";

export const RowDivider = () => (
  <div style={{ height: 2, backgroundColor: `${DARK}0D`, marginLeft: 16, marginRight: 16 }} />
);

interface DetailRowProps {
  image?: string;
  icon?: React.ElementType;
  label: string;
  value?: string | null;
}

export const DetailRow = ({ image, icon: Icon, label, value }: DetailRowProps) => (
  <div className="flex items-center gap-3 px-4 py-3">
    <div className="w-5 h-5 shrink-0 flex items-center justify-center">
      {image
        ? <img src={image} alt="" className="w-5 h-5 object-contain opacity-50" />
        : Icon
          ? <Icon className="w-4 h-4 text-dark/40" />
          : null}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[9px] font-space-bold text-dark/40 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-space-semibold text-dark truncate mt-0.5">{value || "—"}</p>
    </div>
  </div>
);
