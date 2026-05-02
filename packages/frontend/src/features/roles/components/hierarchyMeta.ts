/**
 * Hierarchy → label/colour metadata used by the roles UI.
 *
 * Lives in its own module (rather than alongside `CreateRoleModal`) so the
 * component file only exports React components — required for
 * `react-refresh/only-export-components` and a cleaner separation of concerns.
 */

// System role names are universal; only "Empleado" uses a translation key.
const HIERARCHY_LEVELS = [
  { min: 100, labelKey: "SuperAdmin",          color: "bg-purple-50 text-purple-700" },
  { min: 99,  labelKey: "Admin",               color: "bg-blue-50 text-blue-700" },
  { min: 50,  labelKey: "Manager",             color: "bg-amber-50 text-amber-700" },
  { min: 40,  labelKey: "Controller",          color: "bg-emerald-50 text-emerald-700" },
  { min: 1,   labelKey: "roles.levelEmployee", color: "bg-[var(--color-secondary)] text-dark/70" },
] as const;

export type HierarchyMeta = (typeof HIERARCHY_LEVELS)[number];

export const getHierarchyMeta = (h: number): HierarchyMeta =>
  HIERARCHY_LEVELS.find((l) => h >= l.min) ?? HIERARCHY_LEVELS[4];
