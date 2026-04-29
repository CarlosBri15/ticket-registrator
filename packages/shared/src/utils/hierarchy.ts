/**
 * Converts a numeric hierarchy level into a human-readable role label.
 * Shared between web and mobile.
 */
export const getHierarchyLabel = (h: number): string => {
  if (h >= 100) return "SuperAdmin";
  if (h >= 99) return "Admin";
  if (h >= 50) return "Manager";
  if (h >= 40) return "Controller";
  return "Empleado";
};

/**
 * Returns Tailwind CSS classes for a badge based on the hierarchy level.
 * Web-only (Tailwind), do NOT use in React Native.
 */
export const getHierarchyColor = (h: number): string => {
  if (h >= 100) return "bg-purple-100 text-purple-700";
  if (h >= 99) return "bg-brand/10 text-brand";
  if (h >= 50) return "bg-amber-100 text-amber-700";
  if (h >= 40) return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-600";
};
