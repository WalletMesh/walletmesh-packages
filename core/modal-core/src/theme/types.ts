/**
 * Theme type definitions for modal-core
 *
 * Framework-agnostic theme types that can be used by any UI framework.
 *
 * @module theme/types
 * @packageDocumentation
 * @since 3.0.0
 */

/**
 * Theme mode options
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Theme color definitions
 */
export interface ThemeColors {
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
}

/**
 * Theme shadow definitions
 */
export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/**
 * Theme animation definitions
 */
export interface ThemeAnimation {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

/**
 * Theme typography definitions
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
 * Theme spacing definitions
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
 * Theme border radius definitions
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
  colors: ThemeColors;
  shadows: ThemeShadows;
  animation: ThemeAnimation;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
}

/**
 * CSS custom properties generated from theme
 */
export type ThemeCSSVariables = Record<string, string>;

/**
 * Theme detection utilities interface
 */
export interface ThemeDetection {
  getSystemTheme(): 'light' | 'dark';
  getStoredTheme(storageKey?: string): ThemeMode | null;
  storeTheme(mode: ThemeMode, storageKey?: string): void;
  removeStoredTheme(storageKey?: string): void;
  onSystemThemeChange(callback: (theme: 'light' | 'dark') => void): () => void;
}
