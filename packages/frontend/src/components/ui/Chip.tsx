import type { ComponentProps, ReactNode } from "react";

interface ChipProps extends Omit<ComponentProps<"button">, "children"> {
  /** When true, applies the `.active` modifier (filled background). */
  active?: boolean;
  /** Optional icon shown before the label. */
  leftIcon?: ReactNode;
  children: ReactNode;
}

/**
 * Filter pill — wraps the kit `.chip` primitive. Always renders a real
 * `<button>` to keep keyboard accessibility intact (no div-as-button).
 */
export const Chip = ({
  active = false,
  leftIcon,
  children,
  className,
  type,
  ...props
}: ChipProps) => (
  <button
    type={type ?? "button"}
    className={`chip${active ? " active" : ""} ${className ?? ""}`.trim()}
    aria-pressed={active}
    {...props}
  >
    {leftIcon ? <span className="shrink-0 flex items-center">{leftIcon}</span> : null}
    {children}
  </button>
);
