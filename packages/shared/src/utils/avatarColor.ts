/**
 * getAvatarColor — deterministic background color for name-based avatars.
 *
 * Returns a hex color from a curated palette based on the input string.
 * Same name always produces the same color on both web and mobile.
 *
 * Usage:
 *   const bg = getAvatarColor(report.name);  // '#5B8DEF'
 *   const initial = report.name[0].toUpperCase();
 */

const AVATAR_PALETTE = [
  '#5B8DEF', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#6366F1', // indigo
] as const;

export const getAvatarColor = (name: string): string => {
  if (!name) return AVATAR_PALETTE[0];
  const code = name
    .split('')
    .reduce((acc, char) => acc + (char.codePointAt(0) ?? 0), 0);
  return AVATAR_PALETTE[code % AVATAR_PALETTE.length];
};

/**
 * getInitials — extracts up to `maxLength` initials from a name string.
 * Platform-agnostic: works on web and React Native.
 *
 * getInitials("Comida viernes noche") → "CN"
 * getInitials("ReporteSiete")        → "R"
 */
export const getInitials = (name: string, maxLength = 2): string => {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, maxLength);
};
