/**
 * Default theme implementation for the modal
 * Provides predefined light and dark themes with consistent styling
 */

import type { Theme } from './theme-utils.js';

/**
 * Default color palette
 * Defines the light theme colors using a standard blue/green accent scheme
 * @const colors
 */
const colors = {
  primary: '#3B82F6', // Blue
  secondary: '#10B981', // Green
  background: {
    primary: '#FFFFFF',
    secondary: '#F3F4F6',
  },
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    accent: '#3B82F6',
  },
  border: '#E5E7EB',
  state: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
};

/**
 * Default dark mode color palette
 * Defines the dark theme colors with appropriate contrast ratios
 * @const darkColors
 */
const darkColors = {
  primary: '#60A5FA',
  secondary: '#34D399',
  background: {
    primary: '#111827',
    secondary: '#1F2937',
  },
  text: {
    primary: '#F9FAFB',
    secondary: '#9CA3AF',
    accent: '#60A5FA',
  },
  border: '#374151',
  state: {
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',
  },
};

/**
 * Default typography configuration
 * Uses system fonts with fallbacks and standard font sizes
 * @const typography
 */
const typography = {
  fonts: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    secondary: 'inherit',
  },
  weights: {
    regular: 400,
    medium: 500,
    bold: 700,
  },
  sizes: {
    small: '0.875rem',
    medium: '1rem',
    large: '1.125rem',
    xlarge: '1.25rem',
  },
};

/**
 * Default spacing configuration
 * Uses a 4px base unit for consistent spacing
 * @const spacing
 */
const spacing = {
  unit: 4,
  sizes: {
    xxsmall: 1, // 4px
    xsmall: 2, // 8px
    small: 3, // 12px
    medium: 4, // 16px
    large: 6, // 24px
    xlarge: 8, // 32px
    xxlarge: 12, // 48px
  },
};

/**
 * Default border radius configuration
 * Provides consistent corner rounding across the UI
 * @const borderRadius
 */
const borderRadius = {
  small: '4px',
  medium: '6px',
  large: '8px',
  round: '9999px',
};

/**
 * Default animation configuration
 * Defines standard durations and easing functions
 * @const animation
 */
const animation = {
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
};

/**
 * Complete light theme
 * Standard theme for light mode interfaces
 * @const lightTheme
 */
export const lightTheme: Theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  animation,
};

/**
 * Complete dark theme
 * Dark mode variant with adjusted colors
 * @const darkTheme
 */
export const darkTheme: Theme = {
  ...lightTheme,
  colors: darkColors,
};

/**
 * Helper to get theme based on preference
 * Determines which theme to use based on user preference or system settings
 * @param preference - The desired theme preference
 * @returns The appropriate theme configuration
 */
export const getTheme = (preference: 'light' | 'dark' | 'system'): Theme => {
  if (preference === 'system') {
    const prefersDark =
      typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? darkTheme : lightTheme;
  }
  return preference === 'dark' ? darkTheme : lightTheme;
};

/**
 * Default export is light theme
 * Used as the default theme when no preference is specified
 */
export default lightTheme;
