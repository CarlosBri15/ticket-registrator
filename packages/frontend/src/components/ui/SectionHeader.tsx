import { isValidElement, cloneElement } from "react";
import type { ReactNode, ReactElement } from "react";

interface SectionHeaderProps {
  title: string;
  count?: number;
  icon: ReactNode;
  iconBg?: string;
  className?: string;
  action?: ReactNode;
}

export const SectionHeader = ({
  title,
  count,
  icon,
  className = "",
  action,
}: SectionHeaderProps) => (
  <div className={`flex items-center gap-2 mb-4 ${className}`}>

    {/* Icon — inline, no box */}
    <span className="shrink-0 text-dark/30">
      {isValidElement(icon)
        ? cloneElement(icon as ReactElement, { size: 13, strokeWidth: 2.2 } as any)
        : icon}
    </span>

    {/* Title */}
    <h2 className="font-space-bold text-dark/50 shrink-0" style={{ fontSize: 11 }}>
      {title}
    </h2>

    {/* Count */}
    {count !== undefined && (
      <span
        className="font-space-bold text-dark/40 shrink-0"
        style={{ fontSize: 10 }}
      >
        {count}
      </span>
    )}

    {/* Separator */}
    <div className="flex-1 h-px bg-dark/8 rounded-full" />

    {/* Action */}
    {action && <div className="shrink-0">{action}</div>}

  </div>
);
