import type { ReactNode, ComponentProps } from 'react';

interface SectionCardProps extends Omit<ComponentProps<'section'>, 'title'> {
  title?: ReactNode;
  action?: ReactNode;
  padded?: boolean;
  children: ReactNode;
}

export const SectionCard = ({
  title,
  action,
  padded = true,
  children,
  className,
  ...props
}: SectionCardProps) => {
  return (
    <section
      {...props}
      className={`flex flex-col gap-4 ${padded ? 'p-5' : ''} rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)] ${className ?? ''}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3">
          {title && (
            <p className="text-[12px] font-sans-bold text-dark/70 uppercase tracking-wide">
              {title}
            </p>
          )}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
};
