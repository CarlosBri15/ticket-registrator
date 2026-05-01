import type { ComponentProps, ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "success"
  | "secondary"
  | "danger"
  | "outline"
  | "ghost"
  | "accent"
  | "ghost-white"
  | "ghost-danger"
  | "ghost-brand";

type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ComponentProps<"button"> {
  isLoading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/**
 * Variant → kit class mapping. The first 7 entries are direct kit primitives
 * (`.btn-primary`, `.btn-secondary`, etc.). The last three (`ghost-white`,
 * `ghost-danger`, `ghost-brand`) are project-specific extensions that the kit
 * does not define; they piggy-back on `.btn` for shape/typography and add
 * their own colour utilities.
 */
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  success: "btn-success",
  secondary: "btn-secondary",
  danger: "btn-danger",
  outline: "btn-outline",
  ghost: "btn-ghost",
  accent: "btn-accent",
  "ghost-white": "bg-white/10 text-white hover:bg-white/20",
  "ghost-danger": "bg-transparent text-danger hover:bg-danger/5",
  "ghost-brand": "bg-transparent text-dark/60 hover:bg-dark/5",
};

/**
 * Size → kit modifier mapping. `md` is the kit default (no modifier needed).
 * `icon` is a project-specific 40×40 round button (kit's `.icon-btn` is 32×32
 * and intended for toolbars, a different use case).
 */
const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
  icon: "w-10 h-10 !p-0",
};

export const Button = ({
  isLoading,
  variant = "primary",
  size = "md",
  children,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  const classes = ["btn", VARIANT_CLASS[variant], SIZE_CLASS[size], "relative", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button disabled={isLoading || disabled} className={classes} {...props}>
      {isLoading ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </span>
      ) : null}

      <span className={`flex items-center justify-center gap-2 ${isLoading ? "invisible" : ""}`}>
        {leftIcon ? <span className="shrink-0 flex items-center justify-center">{leftIcon}</span> : null}
        {children}
        {rightIcon ? <span className="shrink-0 flex items-center justify-center">{rightIcon}</span> : null}
      </span>
    </button>
  );
};
