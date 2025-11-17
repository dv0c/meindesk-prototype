// types/theme.ts

/**
 * Defines the structure for the color variables, which are CSS color strings (e.g., 'oklch(1 0 0)').
 */
export type ColorVariables = {
  // Base Colors
  background: string;
  foreground: string;
  card: string;
  card_foreground: string;
  popover: string;
  popover_foreground: string;
  primary: string;
  primary_foreground: string;
  secondary: string;
  secondary_foreground: string;
  muted: string;
  muted_foreground: string;
  accent: string;
  accent_foreground: string;
  destructive: string;
  destructive_foreground: string;
  border: string;
  input: string;
  ring: string;

  // Chart Colors (Assuming up to 5)
  chart_1: string;
  chart_2: string;
  chart_3: string;
  chart_4: string;
  chart_5: string;

  // Sidebar Colors
  sidebar: string;
  sidebar_foreground: string;
  sidebar_primary: string;
  sidebar_primary_foreground: string;
  sidebar_accent: string;
  sidebar_accent_foreground: string;
  sidebar_border: string;
  sidebar_ring: string;
};

/**
 * Defines the structure for non-color variables (font stacks, radii, shadows).
 * These are generally CSS unit strings, variable references, or numeric values.
 */
export type UtilityVariables = {
  // Fonts
  font_sans: string;
  font_serif: string;
  font_mono: string;

  // Radius (Unit string, e.g., '0rem')
  radius: string;

  // Shadow Components (Numeric or string for X/Y/Blur/Spread/Opacity)
  shadow_x: string;
  shadow_y: string;
  shadow_blur: string;
  shadow_spread: string;
  shadow_opacity: string;
  shadow_color: string;

  // Shadow Presets (CSS shadow strings)
  shadow_2xs: string;
  shadow_xs: string;
  shadow_sm: string;
  shadow: string;
  shadow_md: string;
  shadow_lg: string;
  shadow_xl: string;
  shadow_2xl: string;

  // Tracking/Spacing
  tracking_normal: string;
  spacing: string;
};

/**
 * The full Theme object structure, containing the default (light) theme
 * and the overrides for the dark theme.
 */
export type Theme = {
  // The variables that apply to the default (light) theme.
  // This includes all ColorVariables and UtilityVariables.
  light: ColorVariables & UtilityVariables;

  // The subset of variables that are overridden in the dark mode.
  // This will primarily be colors.
  dark: Partial<ColorVariables & UtilityVariables>;
};

// --- Default Theme Utility Type ---

/**
 * Utility type for defining the theme options available to a tenant.
 */
export type DefaultTheme = "light" | "dark" | "system" | "custom";
