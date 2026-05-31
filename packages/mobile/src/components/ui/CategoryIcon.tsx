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
  type LucideIcon,
} from 'lucide-react-native';
import { FALLBACK_CATEGORY_ICON_NAME } from '@ticket-registrator/shared';
import { colors } from '../../constants/theme';

/**
 * Whitelist map of canonical category icon names (persisted by the backend
 * seed → `ICategory.icon`) to their lucide-react-native components. Kept
 * tree-shake-friendly: only the icons present in the backend's
 * `SYSTEM_CATEGORY_ICONS` are imported.
 *
 * The string whitelist itself (`CATEGORY_ICON_NAMES`) lives in
 * `@ticket-registrator/shared/utils/categoryIconNames` so the same source of
 * truth is reused by the web `CategoryIcon` and by any backend validator that
 * needs it.
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
  [FALLBACK_CATEGORY_ICON_NAME]: Tag,
};

const FALLBACK_ICON: LucideIcon = Tag;

export const resolveCategoryIcon = (
  iconName: string | null | undefined,
): LucideIcon => {
  if (!iconName) return FALLBACK_ICON;
  return CATEGORY_ICON_MAP[iconName] ?? FALLBACK_ICON;
};

interface CategoryIconProps {
  iconName: string | null | undefined;
  /** Hex / rgba colour (typically `ICategory.color`). Falls back to the
   *  semantic `fgSecondary` token from the shared theme. */
  color?: string | null;
  size?: number;
  /** When true and the icon is missing, returns `null` instead of the fallback. */
  hideWhenMissing?: boolean;
}

/**
 * Renders the lucide icon associated with a persisted category. The tint
 * comes from `ICategory.color` (database value) — never hardcode it at the
 * callsite.
 */
export const CategoryIcon = ({
  iconName,
  color,
  size = 12,
  hideWhenMissing = false,
}: CategoryIconProps) => {
  if (hideWhenMissing && !iconName) return null;
  const Icon = resolveCategoryIcon(iconName);
  return <Icon size={size} color={color ?? colors.fgSecondary} strokeWidth={2} />;
};
