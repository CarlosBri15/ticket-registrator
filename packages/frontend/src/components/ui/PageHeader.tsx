import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

export interface PageHeaderStat {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}

export interface PageHeaderBack {
  label: string;
  onClick: () => void;
}

interface PageHeaderProps {
  title: string;
  back?: PageHeaderBack;
  stats?: PageHeaderStat[];
  actions?: ReactNode;
}

export const PageHeader = ({ title, back, stats, actions }: PageHeaderProps) => {
  const hasStats = !!stats && stats.length > 0;

  return (
    <header className="pt-1">
      {back && (
        <button
          type="button"
          onClick={back.onClick}
          className="group flex items-center gap-1 text-dark/40 hover:text-dark transition-colors w-fit mb-5"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" aria-hidden={true} />
          <span className="text-[11px] font-sans-semibold text-dark/40">{back.label}</span>
        </button>
      )}

      <div className="flex items-start justify-between gap-10 flex-wrap">
        <div className="flex flex-col gap-7 min-w-0 flex-1">
          <h1 className="text-[clamp(34px,4.2vw,56px)] font-sans-bold text-dark leading-[0.95] tracking-[-0.03em] break-words">
            {title}
          </h1>

          {hasStats && (
            <div className="flex items-center gap-4 flex-wrap text-dark/75">
              {stats!.map((s, i) => (
                <MetaItem
                  key={`${s.label}-${i}`}
                  icon={s.icon}
                  label={s.label}
                  value={s.value}
                  withDivider={i > 0}
                />
              ))}
            </div>
          )}
        </div>

        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
};

interface MetaItemProps {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  /** When true, prepends a vertical divider so the item separates cleanly from the previous one. */
  withDivider?: boolean;
}

/**
 * Reusable inline meta row entry: optional icon + small label + bold value.
 * Pairs with `<MetaDivider />` to build hairline-separated meta rows like the
 * one in `PageHeader` and `ReportDetailScreen`.
 */
export const MetaItem = ({ icon, label, value, withDivider = false }: MetaItemProps) => (
  <>
    {withDivider && <MetaDivider />}
    <div className="flex items-center gap-2 leading-none">
      {icon && (
        <span className="text-dark/45" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="text-[12px] font-sans-medium text-dark/45">{label}</span>
      <span className="text-[15px] font-sans-semibold text-dark/85 tabular-nums">{value}</span>
    </div>
  </>
);

export const MetaDivider = () => (
  <span aria-hidden="true" className="w-px h-4 bg-dark/12" />
);
