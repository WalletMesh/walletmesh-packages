/**
 * Theme utilities for modal-core
 *
 * Framework-agnostic theming system with system detection, persistence,
 * and CSS variable generation.
 *
 * @module theme
 * @packageDocumentation
 * @since 3.0.0
 */

// Export all theme types
export type {
  ThemeMode,
  ThemeColors,
  ThemeShadows,
  ThemeAnimation,
  ThemeTypography,
  ThemeSpacing,
  ThemeBorderRadius,
  ThemeConfig,
  ThemeCSSVariables,
  ThemeDetection,
} from './types.js';

// Export all theme utilities
export {
  // Constants
  DEFAULT_THEME_STORAGE_KEY,
  DEFAULT_CSS_PREFIX,
  // Detection functions
  getSystemTheme,
  getStoredTheme,
  storeTheme,
  removeStoredTheme,
  onSystemThemeChange,
  // Theme resolution
  resolveTheme,
  // CSS utilities
  themeConfigToCSSVariables,
  applyCSSVariables,
  removeCSSVariables,
  applyThemeClass,
  // Transitions
  disableTransitions,
  // Toggle utilities
  getNextTheme,
  toggleTheme,
  // Validation
  isValidThemeMode,
  // Composite utilities
  themeDetection,
  initializeTheme,
} from './utils.js';
