/**
 * @fileoverview Framework-agnostic icon container utilities
 */

import type { CreateSandboxedIconOptions } from './iconSandbox.js';

/**
 * Loading state configuration
 * @public
 */
export interface LoadingStateConfig {
  /** CSS styles for loading overlay */
  styles: Record<string, string>;
  /** Loading content (text or emoji) */
  content: string;
  /** Loading attributes */
  attributes: Record<string, string>;
}

/**
 * Container configuration for icon display
 * @public
 */
export interface IconContainerConfig {
  /** Base container styles */
  containerStyles: Record<string, string>;
  /** Loading state configuration */
  loading: LoadingStateConfig;
  /** Container attributes */
  attributes: Record<string, string>;
  /** CSS classes to apply */
  className?: string;
}

/**
 * Options for creating icon container configuration
 * @public
 */
export interface CreateIconContainerOptions {
  /** Icon size in pixels */
  size: number;
  /** Whether the icon is disabled */
  disabled?: boolean;
  /** Whether the icon is clickable */
  clickable?: boolean;
  /** Whether the icon is currently loading */
  loading?: boolean;
  /** CSS class name */
  className?: string;
  /** Style overrides */
  styleOverrides?: Record<string, string>;
  /** Custom loading content */
  loadingContent?: string;
}

/**
 * Normalized options for icon creation
 * @public
 */
export interface NormalizedIconOptions extends CreateSandboxedIconOptions {
  /** Resolved size */
  size: number;
  /** Resolved timeout */
  timeout: number;
}

/**
 * Creates framework-agnostic container configuration for icon display
 *
 * This utility generates the necessary styling and attributes for creating
 * consistent icon containers across different UI frameworks.
 *
 * @param options - Container configuration options
 * @returns Configuration object for container setup
 *
 * @example
 * ```typescript
 * const config = createIconContainerConfig({
 *   size: 32,
 *   disabled: false,
 *   clickable: true,
 *   loading: true
 * });
 *
 * // Use in vanilla DOM
 * const container = document.createElement('div');
 * Object.assign(container.style, config.containerStyles);
 * Object.entries(config.attributes).forEach(([key, value]) => {
 *   container.setAttribute(key, value);
 * });
 *
 * // Use in React
 * <div
 *   style={config.containerStyles}
 *   {...config.attributes}
 *   className={config.className}
 * >
 *   {loading && <div style={config.loading.styles}>{config.loading.content}</div>}
 * </div>
 * ```
 *
 * @public
 */
export function createIconContainerConfig(options: CreateIconContainerOptions): IconContainerConfig {
  const {
    size,
    disabled = false,
    clickable = false,
    loading = false,
    className,
    styleOverrides = {},
    loadingContent = '⟳',
  } = options;

  // Determine cursor style
  let cursor = 'default';
  if (disabled) {
    cursor = 'not-allowed';
  } else if (clickable) {
    cursor = 'pointer';
  }

  // Base container styles
  const containerStyles: Record<string, string> = {
    width: `${size}px`,
    height: `${size}px`,
    display: 'inline-block',
    position: 'relative',
    cursor,
    flexShrink: '0',
    ...styleOverrides,
  };

  // Loading overlay styles
  const loadingStyles: Record<string, string> = {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240, 240, 240, 0.8)',
    borderRadius: '50%',
    fontSize: `${Math.max(8, size * 0.3)}px`,
    color: '#666',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    userSelect: 'none',
    pointerEvents: 'none',
  };

  // Container attributes
  const attributes: Record<string, string> = {
    'data-testid': 'sandboxed-icon-container',
    'data-size': size.toString(),
    'data-disabled': disabled.toString(),
    'data-loading': loading.toString(),
  };

  if (disabled) {
    attributes['aria-disabled'] = 'true';
  }

  // Loading state configuration
  const loadingConfig: LoadingStateConfig = {
    styles: loadingStyles,
    content: loadingContent,
    attributes: {
      'data-testid': 'icon-loading',
      'aria-hidden': 'true',
    },
  };

  return {
    containerStyles,
    loading: loadingConfig,
    attributes,
    ...(className !== undefined && { className }),
  };
}

/**
 * Normalizes icon options with default values
 *
 * @param options - Raw icon options from framework components
 * @returns Normalized options with all defaults applied
 *
 * @example
 * ```typescript
 * const normalized = normalizeIconOptions({
 *   iconDataUri: 'data:image/svg+xml,...',
 *   // size will default to 24
 *   // timeout will default to 3000
 * });
 * ```
 *
 * @public
 */
export function normalizeIconOptions(options: CreateSandboxedIconOptions): NormalizedIconOptions {
  const {
    iconDataUri,
    size = 24,
    timeout = 3000,
    fallbackIcon,
    onCspError,
    disabled,
    disabledStyle,
  } = options;

  return {
    iconDataUri,
    size,
    timeout,
    ...(fallbackIcon && { fallbackIcon }),
    ...(onCspError && { onCspError }),
    ...(disabled !== undefined && { disabled }),
    ...(disabledStyle && { disabledStyle }),
  };
}

/**
 * Creates accessibility attributes for icon containers
 *
 * @param options - Accessibility configuration options
 * @returns Object with ARIA and other accessibility attributes
 *
 * @public
 */
export function createIconAccessibilityAttributes(options: {
  alt?: string;
  disabled?: boolean;
  clickable?: boolean;
  loading?: boolean;
}): Record<string, string> {
  const { alt, disabled, clickable, loading } = options;
  const attributes: Record<string, string> = {};

  if (alt) {
    let label = alt;
    if (disabled) {
      label += ' (disabled)';
    } else if (loading) {
      label += ' (loading)';
    }
    attributes['aria-label'] = label;
  }

  if (disabled) {
    attributes['aria-disabled'] = 'true';
  }

  if (clickable && !disabled) {
    attributes['role'] = 'button';
    attributes['tabIndex'] = '0';
  }

  return attributes;
}

/**
 * Utility to get container styles for different states
 *
 * @param options - Style configuration options
 * @returns CSS properties object
 *
 * @public
 */
export function getIconContainerStyles(options: {
  size: number;
  disabled?: boolean;
  clickable?: boolean;
  hover?: boolean;
  styleOverrides?: Record<string, string>;
}): Record<string, string> {
  const { size, disabled, clickable, hover, styleOverrides = {} } = options;

  const baseStyles = createIconContainerConfig({
    size,
    ...(disabled !== undefined && { disabled }),
    ...(clickable !== undefined && { clickable }),
  }).containerStyles;

  // Add hover state if applicable
  if (hover && clickable && !disabled) {
    baseStyles['opacity'] = '0.8';
    baseStyles['transform'] = 'scale(1.05)';
    baseStyles['transition'] = 'opacity 0.2s ease, transform 0.2s ease';
  }

  return {
    ...baseStyles,
    ...styleOverrides,
  };
}
