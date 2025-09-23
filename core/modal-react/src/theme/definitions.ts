/**
 * Default theme definitions for WalletMesh React
 *
 * Provides carefully crafted light and dark theme palettes optimized for
 * accessibility, readability, and modern UI design patterns.
 *
 * @module theme/definitions
 * @packageDocumentation
 */

import type {
  ThemeAnimation,
  ThemeBorderRadius,
  ThemeColors,
  ThemeConfig,
  ThemeCustomization,
  ThemeShadows,
  ThemeSpacing,
  ThemeTypography,
} from './types.js';

/**
 * Base typography settings shared across themes
 */
const baseTypography: ThemeTypography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace',
  },
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
};

/**
 * Base spacing scale
 */
const baseSpacing: ThemeSpacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
};

/**
 * Base border radius values
 */
const baseBorderRadius: ThemeBorderRadius = {
  none: '0',
  sm: '0.25rem', // 4px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  full: '9999px',
};

/**
 * Base animation settings
 */
const baseAnimation: ThemeAnimation = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

/**
 * Light theme color palette
 */
const lightColors: ThemeColors = {
  // Core colors (required by modal-core)
  primary: '#4f46e5',
  primaryHover: '#4338ca',
  secondary: '#6b7280',
  background: '#ffffff',
  surface: '#f8fafc',
  surfaceHover: '#e5e7eb',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',

  // Extended surface colors
  surfaceElevated: '#ffffff',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Extended content colors
  primaryActive: '#3730a3',
  secondaryHover: '#4b5563',
  accent: '#0ea5e9',
  accentHover: '#0284c7',

  // Extended semantic colors
  successHover: '#059669',
  warningHover: '#d97706',
  errorHover: '#dc2626',
  infoHover: '#2563eb',

  // Extended text colors
  textPrimary: '#1f2937',
  textMuted: '#9ca3af',
  textInverse: '#ffffff',
  textOnPrimary: '#ffffff',
  textOnSecondary: '#ffffff',

  // Extended border colors
  borderHover: '#d1d5db',
  borderFocus: '#4f46e5',
  borderError: '#ef4444',
  borderSuccess: '#10b981',

  // Interactive states
  focusRing: 'rgba(79, 70, 229, 0.2)',
  disabled: '#f3f4f6',
  disabledText: '#9ca3af',
};

/**
 * Light theme shadows
 */
const lightShadows: ThemeShadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  focus: '0 0 0 3px rgba(79, 70, 229, 0.1)',
};

/**
 * Dark theme color palette
 */
const darkColors: ThemeColors = {
  // Core colors (required by modal-core)
  primary: '#6366f1',
  primaryHover: '#7c3aed',
  secondary: '#64748b',
  background: '#0f172a',
  surface: '#1e293b',
  surfaceHover: '#334155',
  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  border: '#334155',
  error: '#f87171',
  success: '#22c55e',
  warning: '#eab308',
  info: '#60a5fa',

  // Extended surface colors
  surfaceElevated: '#334155',
  overlay: 'rgba(0, 0, 0, 0.7)',

  // Extended content colors
  primaryActive: '#8b5cf6',
  secondaryHover: '#475569',
  accent: '#06b6d4',
  accentHover: '#0891b2',

  // Extended semantic colors
  successHover: '#16a34a',
  warningHover: '#ca8a04',
  errorHover: '#ef4444',
  infoHover: '#3b82f6',

  // Extended text colors
  textPrimary: '#f1f5f9',
  textMuted: '#64748b',
  textInverse: '#0f172a',
  textOnPrimary: '#ffffff',
  textOnSecondary: '#ffffff',

  // Extended border colors
  borderHover: '#475569',
  borderFocus: '#6366f1',
  borderError: '#f87171',
  borderSuccess: '#22c55e',

  // Interactive states
  focusRing: 'rgba(99, 102, 241, 0.3)',
  disabled: '#1e293b',
  disabledText: '#64748b',
};

/**
 * Dark theme shadows (more subtle)
 */
const darkShadows: ThemeShadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
  focus: '0 0 0 3px rgba(99, 102, 241, 0.2)',
};

/**
 * Complete light theme configuration
 */
export const lightTheme: ThemeConfig = {
  mode: 'light',
  colors: lightColors,
  shadows: lightShadows,
  animation: baseAnimation,
  typography: baseTypography,
  spacing: baseSpacing,
  borderRadius: baseBorderRadius,
};

/**
 * Complete dark theme configuration
 */
export const darkTheme: ThemeConfig = {
  mode: 'dark',
  colors: darkColors,
  shadows: darkShadows,
  animation: baseAnimation,
  typography: baseTypography,
  spacing: baseSpacing,
  borderRadius: baseBorderRadius,
};

/**
 * Default theme configuration (system preference)
 */
export const defaultTheme: ThemeConfig = {
  mode: 'system',
  colors: lightColors, // Will be dynamically resolved
  shadows: lightShadows, // Will be dynamically resolved
  animation: baseAnimation,
  typography: baseTypography,
  spacing: baseSpacing,
  borderRadius: baseBorderRadius,
};

/**
 * Get theme configuration by mode
 */
export function getThemeByMode(mode: 'light' | 'dark'): ThemeConfig {
  return mode === 'dark' ? darkTheme : lightTheme;
}

/**
 * Merge custom theme with base theme
 */
export function mergeThemeConfig(baseTheme: ThemeConfig, customization: ThemeCustomization): ThemeConfig {
  return {
    mode: customization.mode ?? baseTheme.mode,
    colors: { ...baseTheme.colors, ...customization.colors },
    shadows: { ...baseTheme.shadows, ...customization.shadows },
    animation: {
      duration: { ...baseTheme.animation.duration, ...customization.animation?.duration },
      easing: { ...baseTheme.animation.easing, ...customization.animation?.easing },
    },
    typography: {
      fontFamily: { ...baseTheme.typography.fontFamily, ...customization.typography?.fontFamily },
      fontSize: { ...baseTheme.typography.fontSize, ...customization.typography?.fontSize },
      fontWeight: { ...baseTheme.typography.fontWeight, ...customization.typography?.fontWeight },
      lineHeight: { ...baseTheme.typography.lineHeight, ...customization.typography?.lineHeight },
    },
    spacing: { ...baseTheme.spacing, ...customization.spacing },
    borderRadius: { ...baseTheme.borderRadius, ...customization.borderRadius },
  };
}
