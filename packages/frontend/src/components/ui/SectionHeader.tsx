import { isValidElement, cloneElement } from "react";
import type { ReactNode, ReactElement } from "react";
import { nbTokens } from "../../styles/theme";

interface SectionHeaderProps {
  title: string;
  count?: number;
  icon: ReactNode;
  /** Custom background for the icon box */
  iconBg?: string;
  className?: string;
  action?: ReactNode;
}

/**
 * Premium "Soft Neobrutalist" Section Header (Shared).
 * This component is the source of truth for all dashboard and screen section titles.
 */
export const SectionHeader = ({
  title,
  count,
  icon,
  iconBg = "bg-white",
  className = "",
  action,
}: SectionHeaderProps) => {
  const DARK = "#1A1A1A";
  const SHADOW = "var(--color-shadow-main, #D4D4D8)";
  const BORDER = "var(--color-border-main, #E4E4E7)";

  return (
    <div className={`flex items-center gap-2.5 mb-5 px-0.5 group ${className}`}>
      {/* Icon Box */}
      <div
        className={`flex items-center justify-center ${iconBg} border-2 border-border-main shrink-0`}
        style={{
          width: 32,
          height: 32,
          borderRadius: nbTokens.radiusBadge,
          boxShadow: `${nbTokens.shadowBadge}px ${nbTokens.shadowBadge}px 0px ${SHADOW}`,
          borderColor: BORDER,
          color: DARK,
        }}
      >
        <span style={{ color: `${DARK}90` }}>
          {isValidElement(icon)
            ? cloneElement(icon as ReactElement, { size: 14, strokeWidth: 2.2 } as any)
            : icon}
        </span>
      </div>

      {/* Label and Grounding Line */}
      <div className="flex-1 flex items-center gap-2.5">
        <h2
          className="font-space-bold text-dark shrink-0"
          style={{ fontSize: 14, letterSpacing: "-0.3px", lineHeight: 1.2 }}
        >
          {title}
        </h2>

        {/* Optional Count Badge */}
        {count !== undefined && (
          <span
            className="font-space-bold animate-in zoom-in duration-300"
            style={{
              backgroundColor: "var(--color-surface-card)",
              border: `2px solid ${BORDER}`,
              borderRadius: nbTokens.radiusBadge,
              padding: "2px 8px",
              fontSize: 10,
              color: DARK,
              boxShadow: `${nbTokens.shadowMicro}px ${nbTokens.shadowMicro}px 0px ${SHADOW}`,
              marginLeft: -4,
            }}
          >
            {count}
          </span>
        )}

        {/* Separator Grounding Line */}
        <div
          className="h-[1.5px] bg-dark/10 flex-1 ml-0.5 rounded-full transition-all duration-300 group-hover:bg-dark/20"
        />

        {/* Optional Action Button */}
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
};
