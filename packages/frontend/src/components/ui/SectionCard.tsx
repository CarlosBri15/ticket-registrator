import type { ReactNode, ComponentProps } from "react";

interface SectionCardProps extends Omit<ComponentProps<"section">, "title"> {
  title?: ReactNode;
  action?: ReactNode;
  /** When false, drops the kit `.card` 24px padding (e.g. for full-bleed lists). */
  padded?: boolean;
  children: ReactNode;
}

/**
 * Card wrapper used as section-level container across the app. Wraps the kit
 * `.card` primitive (white surface, 1px border, 8px radius, 24px padding) and
 * adds an optional title + action header row.
 */
export const SectionCard = ({
  title,
  action,
  padded = true,
  children,
  className,
  ...props
}: SectionCardProps) => {
  const padClass = padded ? "" : "!p-0";
  const classes = ["card", padClass, "flex", "flex-col", "gap-4", className]
    .filter(Boolean)
    .join(" ");

  return (
    <section {...props} className={classes}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3">
          {title && (
            <p className="text-[14px] font-sans-bold text-dark tracking-tight">
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
