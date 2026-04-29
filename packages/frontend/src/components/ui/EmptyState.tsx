import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => (
  <div
    className={`flex flex-col items-center justify-center text-center py-14 px-6 gap-2 ${className ?? ''}`}
  >
    <div className="w-10 h-10 rounded-lg bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-dark/40 mb-1">
      {icon}
    </div>
    <h3 className="text-[14px] font-sans-semibold text-dark">{title}</h3>
    <p className="text-[13px] font-sans-normal text-dark/55 max-w-sm leading-relaxed">
      {description}
    </p>
    {action && <div className="mt-2">{action}</div>}
  </div>
);
