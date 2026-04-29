import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

export interface PageHeaderStat {
  label: string;
  value: ReactNode;
}

export interface PageHeaderBack {
  label: string;
  onClick: () => void;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: PageHeaderBack;
  stats?: PageHeaderStat[];
  actions?: ReactNode;
}

export const PageHeader = ({ title, subtitle, back, stats, actions }: PageHeaderProps) => {
  const hasMeta = subtitle || (stats && stats.length > 0);

  return (
    <div className="flex items-end justify-between gap-4 pt-1">
      <div className="flex flex-col gap-5 min-w-0">
        <div className="flex flex-col gap-1.5 min-w-0">
          {back && (
            <button
              type="button"
              onClick={back.onClick}
              className="group inline-flex items-center gap-1 text-dark/40 hover:text-dark text-[12px] font-sans-medium w-fit transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden={true} />
              {back.label}
            </button>
          )}

          <h1 className="text-[36px] font-sans-bold text-dark leading-none tracking-tight truncate">
            {title}
          </h1>

          {subtitle && (
            <p className="text-[13px] font-sans-normal text-dark/50">{subtitle}</p>
          )}
        </div>

        {stats && stats.length > 0 && (
          <div className="flex items-center gap-8 flex-wrap">
            {stats.map((s, i) => (
              <div key={`${s.label}-${i}`} className="flex flex-col gap-1">
                <span className="text-[11px] font-sans-medium text-dark/45 leading-none">
                  {s.label}
                </span>
                <span className="text-[22px] font-sans-bold text-dark leading-none">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {!hasMeta && null}
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
};
