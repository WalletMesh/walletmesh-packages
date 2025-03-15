/**
 * Theme system exports
 * This module exports all theme-related functionality including utilities, presets, and types
 *
 * @module theme
 */

/**
 * Export all theme utilities and types
 */
export * from './theme-utils.js';

/**
 * Export theme presets and helper functions
 */
export * from './default-theme.js';

/**
 * Export the default light theme as the default theme
 * This is the fallback theme when no specific theme is configured
 */
export { default as defaultTheme } from './default-theme.js';
