/**
 * @fileoverview Framework-agnostic fallback utilities for icon sandbox
 */

/**
 * Configuration for creating fallback icon elements
 * @public
 */
export interface FallbackIconConfig {
  /** CSS styles as key-value pairs */
  styles: Record<string, string>;
  /** Text content to display */
  content: string;
  /** HTML attributes to set */
  attributes: Record<string, string>;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Options for creating fallback configurations
 * @public
 */
export interface CreateFallbackOptions {
  /** Size of the fallback icon in pixels */
  size: number;
  /** Alt text or label for the icon */
  alt?: string;
  /** Source string to extract first letter from (fallback) */
  src?: string;
  /** Type of error that triggered the fallback */
  errorType?: 'validation' | 'csp' | 'network' | 'unknown';
  /** Whether the icon should appear disabled */
  disabled?: boolean;
  /** Custom styling overrides */
  styleOverrides?: Record<string, string>;
}

/**
 * Creates a framework-agnostic configuration for fallback icon elements
 *
 * This function generates the necessary configuration to create a circular
 * text-based fallback when the original icon fails to load. The configuration
 * can be used by any framework (React, Vue, vanilla DOM) to create consistent
 * fallback elements.
 *
 * @param options - Configuration options for the fallback
 * @returns Configuration object with styles, content, and attributes
 *
 * @example
 * ```typescript
 * const config = createFallbackConfig({
 *   size: 32,
 *   alt: 'MetaMask',
 *   errorType: 'csp'
 * });
 *
 * // Use in vanilla DOM
 * const div = document.createElement('div');
 * Object.assign(div.style, config.styles);
 * div.textContent = config.content;
 * Object.entries(config.attributes).forEach(([key, value]) => {
 *   div.setAttribute(key, value);
 * });
 *
 * // Use in React
 * <div style={config.styles} {...config.attributes}>
 *   {config.content}
 * </div>
 * ```
 *
 * @public
 */
export function createFallbackConfig(options: CreateFallbackOptions): FallbackIconConfig {
  const { size, alt, src, errorType = 'unknown', disabled = false, styleOverrides = {} } = options;

  // Extract first letter for display
  const firstLetter = alt?.charAt(0) || src?.charAt(0) || '?';
  const content = firstLetter.toUpperCase();

  // Calculate font size (responsive to icon size)
  const fontSize = Math.max(10, size * 0.4);

  // Base styles for circular fallback
  const baseStyles: Record<string, string> = {
    width: `${size}px`,
    height: `${size}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: disabled ? '#f8f8f8' : '#f0f0f0',
    borderRadius: '50%',
    fontWeight: 'bold',
    color: disabled ? '#999' : '#666',
    fontSize: `${fontSize}px`,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    userSelect: 'none',
    flexShrink: '0',
    ...styleOverrides,
  };

  // Create accessibility attributes
  const attributes: Record<string, string> = {};

  if (alt) {
    const reasonMap = {
      csp: 'blocked by security policy',
      validation: 'failed validation',
      network: 'failed to load',
      unknown: 'failed to load',
    };
    const reason = reasonMap[errorType];
    const title = `${alt} (icon ${reason})`;

    attributes['title'] = title;
    attributes['aria-label'] = title;
  }

  if (disabled) {
    attributes['aria-disabled'] = 'true';
  }

  // Add data attributes for testing and debugging
  attributes['data-fallback-type'] = errorType;
  attributes['data-fallback-content'] = content;

  return {
    styles: baseStyles,
    content,
    attributes,
    className: 'icon-fallback',
  };
}

/**
 * Creates multiple fallback configurations efficiently
 *
 * @param options - Array of fallback options
 * @returns Array of fallback configurations
 *
 * @public
 */
export function createFallbackConfigs(options: CreateFallbackOptions[]): FallbackIconConfig[] {
  return options.map((option) => createFallbackConfig(option));
}

/**
 * Utility to apply fallback configuration to a DOM element
 *
 * @param element - DOM element to configure
 * @param config - Fallback configuration to apply
 *
 * @example
 * ```typescript
 * const div = document.createElement('div');
 * const config = createFallbackConfig({ size: 24, alt: 'MetaMask' });
 * applyFallbackToElement(div, config);
 * ```
 *
 * @public
 */
export function applyFallbackToElement(element: HTMLElement, config: FallbackIconConfig): void {
  // Apply styles
  for (const [property, value] of Object.entries(config.styles)) {
    element.style.setProperty(property, value);
  }

  // Set content
  element.textContent = config.content;

  // Set attributes
  for (const [key, value] of Object.entries(config.attributes)) {
    element.setAttribute(key, value);
  }

  // Add CSS class if provided
  if (config.className) {
    element.classList.add(config.className);
  }
}
