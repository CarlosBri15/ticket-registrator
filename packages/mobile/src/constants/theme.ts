/**
 * Theme Constants — Standardized visual tokens for the Radiant Neobrutalist design system.
 */

export const colors = {
  brand:     '#4D4DFF', // Vibrant Blue
  secondary: '#FFC83D', // Saturated Yellow
  success:   '#16a34a', // Emerald Green
  danger:    '#ef4444', // Red
  surface:   '#F5F5F5', // Neutral gray screen BG — no color temp, lets content lead
  dark:      '#1A1A1A', // Deep Contrast
  shadow:    'rgba(26, 26, 26, 0.15)',
  white:     '#FFFFFF',
  card:      '#FFFFFF',
};

export const UI = {
  BORDER_WIDTH: 2,
  RADIUS: 8,
  SHADOW_OFFSET: 4,
};

export const SHADOW_HARD = {
  shadowColor: colors.shadow,
  shadowOffset: { width: UI.SHADOW_OFFSET, height: UI.SHADOW_OFFSET },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 4,
};
