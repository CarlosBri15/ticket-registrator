import type { ReactNode } from "react";
import { tokens } from "../../styles/theme";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export const EmptyState = ({ icon, title, description, className }: EmptyStateProps) => (
  <div className={`${tokens.emptyState} ${className ?? ""}`}>
    <div className={tokens.emptyStateIcon}>
      {icon}
    </div>
    <h3 className="text-base font-space-bold text-dark mb-1">{title}</h3>
    <p className={tokens.emptyStateText}>{description}</p>
  </div>
);
