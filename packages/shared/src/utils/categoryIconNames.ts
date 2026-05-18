/**
 * Canonical category-icon name whitelist.
 *
 * The backend seed (`SYSTEM_CATEGORY_ICONS`) writes one of these strings to
 * `ICategory.icon`. Web (`CategoryIcon` → `lucide-react`) and mobile
 * (`CategoryIcon` → `lucide-react-native`) each translate these strings into
 * their platform's lucide component.
 *
 * Adding a new icon means: 1) append it here, 2) seed it in the backend,
 * 3) wire it in both platform resolvers. Removing one is a backwards-
 * incompatible change.
 */
export const CATEGORY_ICON_NAMES = [
    'Plane',
    'Receipt',
    'ReceiptText',
    'Car',
    'CarFront',
    'Laptop',
    'Briefcase',
    'Heart',
    'Building2',
    'CreditCard',
    'Fuel',
    'Gift',
    'Bus',
    'Scale',
    'Hotel',
    'Megaphone',
    'Utensils',
    'Route',
    'Package',
    'Paperclip',
    'TrainFront',
] as const;

export type CategoryIconName = (typeof CATEGORY_ICON_NAMES)[number];

/** Returned when a category has no icon set, or sets an unknown name. */
export const FALLBACK_CATEGORY_ICON_NAME = 'Tag' as const;

export const isKnownCategoryIcon = (
    value: string | null | undefined,
): value is CategoryIconName =>
    !!value && (CATEGORY_ICON_NAMES as readonly string[]).includes(value);
