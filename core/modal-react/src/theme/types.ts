/**
 * Theme system type definitions for WalletMesh React
 *
 * Provides a comprehensive typing system for dark/light mode support with
 * full customization capabilities and SSR safety.
 *
 * @module theme/types
 * @packageDocumentation
 */

// Import base theme mode from modal-core
import type { ThemeMode as CoreThemeMode } from '@walletmesh/modal-core';

// Re-export as alias to maintain backward compatibility
export type ThemeMode = CoreThemeMode;

/**
 * Color palette for a theme
 */
export interface ThemeColors {
  // Core colors (required by modal-core)
  primary: string;
  primaryHover: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceHover: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;

  // Extended surface colors
  surfaceElevated: string;
  overlay: string;

  // Extended content colors
  primaryActive: string;
  secondaryHover: string;
  accent: string;
  accentHover: string;

  // Extended semantic colors
  successHover: string;
  warningHover: string;
  errorHover: string;
  infoHover: string;

  // Extended text colors
  textPrimary: string;
  textMuted: string;
  textInverse: string;
  textOnPrimary: string;
  textOnSecondary: string;

  // Extended border colors
  borderHover: string;
  borderFocus: string;
  borderError: string;
  borderSuccess: string;

  // Interactive states
  focusRing: string;
  disabled: string;
  disabledText: string;
}

/**
 * Shadow definitions for depth and elevation
 */
export interface ThemeShadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  inner: string;
  focus: string;
}

/**
 * Animation and transition settings
 */
export interface ThemeAnimation {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    default: string;
    in: string;
    out: string;
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

/**
 * Typography scale and settings
 */
export interface ThemeTypography {
  fontFamily: {
    sans: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  fontWeight: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

/**
 * Spacing scale for layout consistency
 */
export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

/**
 * Border radius values
 */
export interface ThemeBorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

/**
 * Complete theme configuration
 */
export interface ThemeConfig {
  mode: ThemeMode;
  colors: ThemeColors;
  shadows: ThemeShadows;
  animation: ThemeAnimation;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
}

/**
 * Partial theme configuration for customization
 */
export interface ThemeCustomization {
  mode?: ThemeMode;
  colors?: Partial<ThemeColors>;
  shadows?: Partial<ThemeShadows>;
  animation?: Partial<ThemeAnimation>;
  typography?: Partial<ThemeTypography>;
  spacing?: Partial<ThemeSpacing>;
  borderRadius?: Partial<ThemeBorderRadius>;
}

/**
 * Theme provider configuration options
 */
export interface ThemeProviderConfig {
  /**
   * Initial theme mode
   * @default 'system'
   */
  mode?: ThemeMode;

  /**
   * Whether to persist theme choice in localStorage
   * @default true
   */
  persist?: boolean;

  /**
   * Custom theme overrides
   */
  customization?: ThemeCustomization;

  /**
   * Storage key for persisting theme
   * @default 'walletmesh-theme'
   */
  storageKey?: string;

  /**
   * CSS class prefix for theme variables
   * @default 'wm'
   */
  cssPrefix?: string;

  /**
   * Disable theme transitions during initial load
   * @default true
   */
  disableTransitionsOnChange?: boolean;
}

/**
 * Theme context value provided to components
 */
export interface ThemeContextValue {
  /**
   * Current active theme mode
   */
  theme: ThemeMode;

  /**
   * Current resolved theme (never 'system')
   */
  resolvedTheme: 'light' | 'dark';

  /**
   * System's preferred theme
   */
  systemTheme: 'light' | 'dark';

  /**
   * Complete theme configuration
   */
  themeConfig: ThemeConfig;

  /**
   * Set the theme mode
   */
  setTheme: (mode: ThemeMode) => void;

  /**
   * Toggle between light and dark themes
   */
  toggleTheme: () => void;

  /**
   * Whether the theme system is mounted and ready
   */
  isMounted: boolean;

  /**
   * Force re-evaluation of system theme
   */
  refreshSystemTheme: () => void;
}

/**
 * CSS variable mapping for theme values
 */
export interface ThemeCSSVariables {
  [key: string]: string;
}

/**
 * Theme detection utilities
 */
export interface ThemeDetection {
  /**
   * Detect system theme preference
   */
  getSystemTheme(): 'light' | 'dark';

  /**
   * Get stored theme preference
   */
  getStoredTheme(storageKey: string): ThemeMode | null;

  /**
   * Store theme preference
   */
  storeTheme(mode: ThemeMode, storageKey: string): void;

  /**
   * Remove stored theme preference
   */
  removeStoredTheme(storageKey: string): void;

  /**
   * Listen for system theme changes
   */
  onSystemThemeChange(callback: (theme: 'light' | 'dark') => void): () => void;
}

/**
 * Hook return type for useTheme
 */
export interface UseThemeReturn extends ThemeContextValue {}

/**
 * Props for theme-aware components
 */
export interface ThemeAwareProps {
  /**
   * Override the current theme for this component
   */
  theme?: 'light' | 'dark';

  /**
   * Custom CSS class for theme overrides
   */
  themeClassName?: string;
}
