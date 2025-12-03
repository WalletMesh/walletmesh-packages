/**
 * Theme utility functions for system detection and persistence
 *
 * Provides SSR-safe utilities for detecting system theme preferences,
 * persisting user choices, and managing theme state.
 *
 * @module theme/utils
 * @packageDocumentation
 * @since 3.0.0
 */

import { isBrowser } from '../api/utils/environment.js';
import { modalLogger } from '../internal/core/logger/globalLogger.js';
import type { ThemeCSSVariables, ThemeConfig, ThemeDetection, ThemeMode } from './types.js';

/**
 * Default storage key for theme persistence
 */
export const DEFAULT_THEME_STORAGE_KEY = 'walletmesh-theme';

/**
 * CSS custom property prefix
 */
export const DEFAULT_CSS_PREFIX = 'wm';

/**
 * Media query for dark mode detection
 */
const DARK_MODE_MEDIA_QUERY = '(prefers-color-scheme: dark)';

/**
 * Detect system theme preference
 *
 * @returns 'dark' if system prefers dark mode, 'light' otherwise
 *
 * @example
 * ```typescript
 * const systemTheme = getSystemTheme();
 * console.log('System prefers:', systemTheme);
 * ```
 *
 * @category Theme
 * @public
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (!isBrowser()) {
    return 'light'; // Default for SSR
  }

  return window.matchMedia(DARK_MODE_MEDIA_QUERY).matches ? 'dark' : 'light';
}

/**
 * Get stored theme preference from localStorage
 *
 * @param storageKey - Key to use for localStorage (default: 'walletmesh-theme')
 * @returns Stored theme mode or null if not found
 *
 * @example
 * ```typescript
 * const storedTheme = getStoredTheme();
 * if (storedTheme) {
 *   applyTheme(storedTheme);
 * }
 * ```
 *
 * @category Theme
 * @public
 */
export function getStoredTheme(storageKey: string = DEFAULT_THEME_STORAGE_KEY): ThemeMode | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as ThemeMode;
    }
  } catch (error) {
    // Handle localStorage errors gracefully
    modalLogger.warn('Failed to read theme from localStorage', error);
  }

  return null;
}

/**
 * Store theme preference in localStorage
 *
 * @param mode - Theme mode to store
 * @param storageKey - Key to use for localStorage (default: 'walletmesh-theme')
 *
 * @example
 * ```typescript
 * storeTheme('dark');
 * // Theme preference saved to localStorage
 * ```
 *
 * @category Theme
 * @public
 */
export function storeTheme(mode: ThemeMode, storageKey: string = DEFAULT_THEME_STORAGE_KEY): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.setItem(storageKey, mode);
  } catch (error) {
    // Handle localStorage errors gracefully
    modalLogger.warn('Failed to store theme in localStorage', error);
  }
}

/**
 * Remove stored theme preference
 *
 * @param storageKey - Key to use for localStorage (default: 'walletmesh-theme')
 *
 * @example
 * ```typescript
 * removeStoredTheme();
 * // Theme preference cleared from localStorage
 * ```
 *
 * @category Theme
 * @public
 */
export function removeStoredTheme(storageKey: string = DEFAULT_THEME_STORAGE_KEY): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    // Handle localStorage errors gracefully
    modalLogger.warn('Failed to remove theme from localStorage', error);
  }
}

/**
 * Listen for system theme changes
 *
 * @param callback - Function to call when system theme changes
 * @returns Cleanup function to remove the listener
 *
 * @example
 * ```typescript
 * const cleanup = onSystemThemeChange((theme) => {
 *   console.log('System theme changed to:', theme);
 *   applyTheme(theme);
 * });
 *
 * // Later, clean up the listener
 * cleanup();
 * ```
 *
 * @category Theme
 * @public
 */
export function onSystemThemeChange(callback: (theme: 'light' | 'dark') => void): () => void {
  if (!isBrowser()) {
    return () => {}; // No-op for SSR
  }

  const mediaQuery = window.matchMedia(DARK_MODE_MEDIA_QUERY);

  const handleChange = (event: MediaQueryListEvent) => {
    callback(event.matches ? 'dark' : 'light');
  };

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }

  // Legacy browsers with deprecated addListener/removeListener
  // These methods are still needed for older browsers but TypeScript doesn't know about them
  const legacyQuery = mediaQuery as MediaQueryList & {
    addListener?: (listener: (e: MediaQueryListEvent) => void) => void;
    removeListener?: (listener: (e: MediaQueryListEvent) => void) => void;
  };

  if (legacyQuery.addListener) {
    legacyQuery.addListener(handleChange);
    return () => legacyQuery.removeListener?.(handleChange);
  }

  return () => {};
}

/**
 * Resolve theme mode to actual theme
 *
 * Converts 'system' to the actual system theme preference.
 *
 * @param mode - Theme mode to resolve
 * @param systemTheme - Current system theme (default: auto-detected)
 * @returns Resolved theme ('light' or 'dark')
 *
 * @example
 * ```typescript
 * const actualTheme = resolveTheme('system');
 * // Returns 'dark' if system prefers dark mode, 'light' otherwise
 * ```
 *
 * @category Theme
 * @public
 */
export function resolveTheme(
  mode: ThemeMode,
  systemTheme: 'light' | 'dark' = getSystemTheme(),
): 'light' | 'dark' {
  return mode === 'system' ? systemTheme : mode;
}

/**
 * Convert theme configuration to CSS custom properties
 *
 * Transforms a theme configuration object into CSS custom properties
 * that can be applied to the document.
 *
 * @param config - Theme configuration
 * @param prefix - CSS variable prefix (default: 'wm')
 * @returns Object with CSS custom properties
 *
 * @example
 * ```typescript
 * const cssVars = themeConfigToCSSVariables(lightTheme);
 * // Returns: { '--wm-color-primary': '#000', ... }
 * ```
 *
 * @category Theme
 * @public
 */
export function themeConfigToCSSVariables(
  config: ThemeConfig,
  prefix: string = DEFAULT_CSS_PREFIX,
): ThemeCSSVariables {
  const variables: ThemeCSSVariables = {};

  // Colors
  for (const [key, value] of Object.entries(config.colors)) {
    variables[`--${prefix}-color-${kebabCase(key)}`] = value;
  }

  // Shadows
  for (const [key, value] of Object.entries(config.shadows)) {
    variables[`--${prefix}-shadow-${kebabCase(key)}`] = value;
  }

  // Animation
  for (const [key, value] of Object.entries(config.animation.duration)) {
    variables[`--${prefix}-duration-${kebabCase(key)}`] = value;
  }

  for (const [key, value] of Object.entries(config.animation.easing)) {
    variables[`--${prefix}-easing-${kebabCase(key)}`] = value;
  }

  // Typography
  for (const [key, value] of Object.entries(config.typography.fontFamily)) {
    variables[`--${prefix}-font-${kebabCase(key)}`] = value;
  }

  for (const [key, value] of Object.entries(config.typography.fontSize)) {
    variables[`--${prefix}-text-${kebabCase(key)}`] = value;
  }

  for (const [key, value] of Object.entries(config.typography.fontWeight)) {
    variables[`--${prefix}-weight-${kebabCase(key)}`] = value;
  }

  for (const [key, value] of Object.entries(config.typography.lineHeight)) {
    variables[`--${prefix}-leading-${kebabCase(key)}`] = value;
  }

  // Spacing
  for (const [key, value] of Object.entries(config.spacing)) {
    variables[`--${prefix}-space-${kebabCase(key)}`] = value;
  }

  // Border radius
  for (const [key, value] of Object.entries(config.borderRadius)) {
    variables[`--${prefix}-radius-${kebabCase(key)}`] = value;
  }

  return variables;
}

/**
 * Apply CSS variables to document root
 *
 * @param variables - CSS custom properties to apply
 * @param element - Target element (default: document.documentElement)
 *
 * @example
 * ```typescript
 * const cssVars = themeConfigToCSSVariables(darkTheme);
 * applyCSSVariables(cssVars);
 * // CSS variables applied to document root
 * ```
 *
 * @category Theme
 * @public
 */
export function applyCSSVariables(variables: ThemeCSSVariables, element?: HTMLElement): void {
  if (!isBrowser()) {
    return;
  }

  const target = element || document.documentElement;

  for (const [property, value] of Object.entries(variables)) {
    target.style.setProperty(property, value);
  }
}

/**
 * Remove CSS variables from document root
 *
 * @param variableNames - Names of CSS variables to remove
 * @param element - Target element (default: document.documentElement)
 *
 * @example
 * ```typescript
 * removeCSSVariables(['--wm-color-primary', '--wm-color-secondary']);
 * // CSS variables removed from document root
 * ```
 *
 * @category Theme
 * @public
 */
export function removeCSSVariables(variableNames: string[], element?: HTMLElement): void {
  if (!isBrowser()) {
    return;
  }

  const target = element || document.documentElement;

  for (const property of variableNames) {
    target.style.removeProperty(property);
  }
}

/**
 * Apply theme class to document
 *
 * Adds theme class and data attribute to the target element for CSS styling.
 *
 * @param theme - Theme to apply ('light' or 'dark')
 * @param prefix - Class/attribute prefix (default: 'wm')
 * @param element - Target element (default: document.documentElement)
 *
 * @example
 * ```typescript
 * applyThemeClass('dark');
 * // Adds 'wm-theme-dark' class and data-wm-theme="dark" attribute
 * ```
 *
 * @category Theme
 * @public
 */
export function applyThemeClass(
  theme: 'light' | 'dark',
  prefix: string = DEFAULT_CSS_PREFIX,
  element?: HTMLElement,
): void {
  if (!isBrowser()) {
    return;
  }

  const target = element || document.documentElement;
  const lightClass = `${prefix}-theme-light`;
  const darkClass = `${prefix}-theme-dark`;

  target.classList.remove(lightClass, darkClass);
  target.classList.add(theme === 'dark' ? darkClass : lightClass);

  // Also set data attribute for CSS selectors
  target.setAttribute(`data-${prefix}-theme`, theme);
}

/**
 * Disable transitions temporarily to prevent flashing
 *
 * Useful when switching themes to prevent visual glitches.
 *
 * @param duration - Duration to disable transitions (ms, default: 100)
 * @returns Cleanup function to re-enable transitions
 *
 * @example
 * ```typescript
 * const cleanup = disableTransitions();
 * applyTheme('dark');
 * // Transitions re-enabled after 100ms or when cleanup() is called
 * ```
 *
 * @category Theme
 * @public
 */
export function disableTransitions(duration = 100): () => void {
  if (!isBrowser()) {
    return () => {};
  }

  const css = `*, *::before, *::after { 
    transition: none !important; 
    animation-duration: 0.01ms !important; 
    animation-delay: -0.01ms !important; 
  }`;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const cleanup = () => {
    if (document.head.contains(style)) {
      document.head.removeChild(style);
    }
  };

  setTimeout(cleanup, duration);

  return cleanup;
}

/**
 * Get the next theme in rotation (for toggle functionality)
 *
 * Cycles through: light → dark → system → light
 *
 * @param current - Current theme mode
 * @returns Next theme mode in rotation
 *
 * @example
 * ```typescript
 * let theme: ThemeMode = 'light';
 * theme = getNextTheme(theme); // 'dark'
 * theme = getNextTheme(theme); // 'system'
 * theme = getNextTheme(theme); // 'light'
 * ```
 *
 * @category Theme
 * @public
 */
export function getNextTheme(current: ThemeMode): ThemeMode {
  switch (current) {
    case 'light':
      return 'dark';
    case 'dark':
      return 'system';
    case 'system':
      return 'light';
    default:
      return 'light';
  }
}

/**
 * Toggle between light and dark (skip system)
 *
 * Simple toggle that only switches between light and dark modes.
 *
 * @param current - Current theme mode
 * @param systemTheme - Current system theme
 * @returns Toggled theme mode
 *
 * @example
 * ```typescript
 * let theme: ThemeMode = 'light';
 * theme = toggleTheme(theme, 'dark'); // 'dark'
 * theme = toggleTheme(theme, 'dark'); // 'light'
 * ```
 *
 * @category Theme
 * @public
 */
export function toggleTheme(current: ThemeMode, systemTheme: 'light' | 'dark'): ThemeMode {
  const resolved = resolveTheme(current, systemTheme);
  return resolved === 'dark' ? 'light' : 'dark';
}

/**
 * Validate theme mode
 *
 * @param mode - String to validate
 * @returns True if valid theme mode
 *
 * @example
 * ```typescript
 * isValidThemeMode('dark'); // true
 * isValidThemeMode('auto'); // false
 * ```
 *
 * @category Theme
 * @public
 */
export function isValidThemeMode(mode: string): mode is ThemeMode {
  return ['light', 'dark', 'system'].includes(mode);
}

/**
 * Convert camelCase to kebab-case
 * @internal
 */
function kebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Complete theme detection implementation
 *
 * @category Theme
 * @public
 */
export const themeDetection: ThemeDetection = {
  getSystemTheme,
  getStoredTheme,
  storeTheme,
  removeStoredTheme,
  onSystemThemeChange,
};

/**
 * Initialize theme on page load
 *
 * Detects stored preference or system theme and applies it to the document.
 *
 * @param storageKey - localStorage key for theme preference
 * @param cssPrefix - CSS class/variable prefix
 * @param disableTransitionsOnLoad - Whether to disable transitions during initialization
 * @returns The applied theme
 *
 * @example
 * ```typescript
 * // On app initialization
 * const initialTheme = initializeTheme();
 * console.log('Applied theme:', initialTheme);
 * ```
 *
 * @category Theme
 * @public
 */
export function initializeTheme(
  storageKey: string = DEFAULT_THEME_STORAGE_KEY,
  cssPrefix: string = DEFAULT_CSS_PREFIX,
  disableTransitionsOnLoad = true,
): 'light' | 'dark' {
  if (!isBrowser()) {
    return 'light';
  }

  const storedTheme = getStoredTheme(storageKey);
  const systemTheme = getSystemTheme();
  const resolvedTheme = resolveTheme(storedTheme || 'system', systemTheme);

  if (disableTransitionsOnLoad) {
    disableTransitions();
  }

  applyThemeClass(resolvedTheme, cssPrefix);

  return resolvedTheme;
}
