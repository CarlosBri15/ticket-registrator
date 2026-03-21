import type { ReactNode } from 'react';
import { tokens, radius } from '../../styles/design-tokens';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export const PageHeader = ({ title, subtitle, icon, actions }: PageHeaderProps) => {
  return (
    <div className={tokens.pageHeader}>
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className={`w-9 h-9 bg-white/10 ${radius.base} flex items-center justify-center border border-white/10 shrink-0`}>
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h1 className={tokens.pageHeaderTitle}>{title}</h1>
            {subtitle && <p className={tokens.pageHeaderSubtitle}>{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};
