import { createElement } from "react";
import { resolveCategoryIcon } from "./categoryIconRegistry";

interface CategoryIconProps {
  iconName: string | null | undefined;
  className?: string;
  color?: string | null;
  /** When true, no fallback `Tag` icon is rendered if the name is missing. */
  hideWhenMissing?: boolean;
}

/**
 * Renders the lucide icon associated with a category. Use `color` to tint it
 * via inline style (one of the few legitimate `style` uses — dynamic per-row
 * category colour comes from the backend).
 */
export const CategoryIcon = ({
  iconName,
  className = "w-3 h-3",
  color,
  hideWhenMissing = false,
}: CategoryIconProps) => {
  if (hideWhenMissing && !iconName) return null;
  // `createElement` over JSX so the dynamic icon lookup isn't flagged as
  // "creating a component during render" — the components live in a static
  // module-level registry, not constructed here.
  return createElement(resolveCategoryIcon(iconName), {
    className,
    style: color ? { color } : undefined,
    "aria-hidden": "true",
  });
};
