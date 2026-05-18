import type { ComponentType, SVGProps } from "react";
import {
  Plane,
  Receipt,
  ReceiptText,
  Car,
  CarFront,
  Laptop,
  Briefcase,
  Heart,
  Building2,
  CreditCard,
  Fuel,
  Gift,
  Bus,
  Scale,
  Hotel,
  Megaphone,
  Utensils,
  Route,
  Package,
  Paperclip,
  TrainFront,
  Tag,
} from "lucide-react";

export type LucideIcon = ComponentType<
  SVGProps<SVGSVGElement> & { className?: string }
>;

/**
 * Whitelist map of category icon names → lucide-react components. Keeps the
 * bundle tree-shakable (only the icons referenced by `SYSTEM_CATEGORY_ICONS`
 * in the backend seed are imported). Falls back to `Tag` when the name is
 * missing or unknown.
 */
const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Plane,
  Receipt,
  ReceiptText,
  Car,
  CarFront,
  Laptop,
  Briefcase,
  Heart,
  Building2,
  CreditCard,
  Fuel,
  Gift,
  Bus,
  Scale,
  Hotel,
  Megaphone,
  Utensils,
  Route,
  Package,
  Paperclip,
  TrainFront,
};

export const FALLBACK_CATEGORY_ICON: LucideIcon = Tag;

export const resolveCategoryIcon = (
  iconName: string | null | undefined,
): LucideIcon => {
  if (!iconName) return FALLBACK_CATEGORY_ICON;
  return CATEGORY_ICON_MAP[iconName] ?? FALLBACK_CATEGORY_ICON;
};
